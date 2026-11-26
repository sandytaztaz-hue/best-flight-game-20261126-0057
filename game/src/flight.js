// flight.js — the flight model: throttle, pitch, bank, fuel, hull, and the
// signature mechanic — MONSOON THERMAL CHAINING. Rings recharge fuel and
// build a combo; storm edges give speed, storm cores eat hull; cargo drops
// and runway landings close each leg. One file, one job: how the plane
// moves and what the air does to it.
import { SCORE } from './config.js';
import { ringGap, stormGrip } from './world.js';

export class Flight {
  constructor(world, upgrades) {
    this.world = world;
    this.up = new Set(upgrades || []);
    this.reset();
  }

  reset() {
    this.s = 0;                 // nautical miles along the route
    this.lat = 0;               // lateral offset, nm (-2..2)
    this.altFt = 1200;          // feet
    this.heading = 90;          // degrees, 90 = along the route
    this.bank = 0;              // degrees of bank, -45..45
    this.pitch = 0;             // vertical speed, fpm
    this.throttle = 0.55;       // 0..1
    this.speedKt = 110;
    this.fuel = 100;
    this.maxFuel = this.up.has('tank') ? 125 : 100;
    this.maxHull = this.up.has('hull') ? 130 : 100;
    this.hull = this.maxHull;
    this.gearDown = false;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.comboTimer = 0;
    this.ringsTaken = 0;
    this.dropsDone = 0;
    this.timeSec = 0;
    this.landed = false;
    this.crashed = false;
    this.crashReason = '';
    this.shake = 0;
    this.inStorm = 0;           // 0 clear, 0.5 edge, 1 core
    this.events = [];           // {text, t} feed for the logbook
    this.lastRingAt = -99;
  }

  topSpeed() { return 195 + (this.up.has('turbo') ? 25 : 0); }
  climbRate() { return this.up.has('wing') ? 1.18 : 1.0; }

  log(text) { this.events.push({ text, t: this.timeSec }); }

  update(dt, input, audio) {
    if (this.landed || this.crashed) return;
    this.timeSec += dt;
    // --- throttle -------------------------------------------------------
    if (input.down('KeyW', 'ShiftLeft', 'ShiftRight')) this.throttle = Math.min(1, this.throttle + dt * 0.5);
    if (input.down('KeyS', 'ControlLeft', 'ControlRight')) this.throttle = Math.max(0, this.throttle - dt * 0.5);
    // --- bank + heading -------------------------------------------------
    let steer = 0;
    if (input.down('ArrowLeft', 'KeyA')) steer -= 1;
    if (input.down('ArrowRight', 'KeyD')) steer += 1;
    steer += input.steerAxis();
    steer = Math.max(-1, Math.min(1, steer));
    const targetBank = steer * 42;
    this.bank += (targetBank - this.bank) * Math.min(1, dt * 4);
    this.heading += this.bank * 0.28 * dt;
    if (this.heading < 0) this.heading += 360;
    if (this.heading > 360) this.heading -= 360;
    // --- pitch + altitude ----------------------------------------------
    let pitchIn = 0;
    if (input.down('ArrowUp')) pitchIn += 1;
    if (input.down('ArrowDown')) pitchIn -= 1;
    const targetVs = pitchIn * 1400 * this.climbRate();
    this.pitch += (targetVs - this.pitch) * Math.min(1, dt * 3);
    this.altFt += this.pitch * dt / 60;
    if (this.altFt < 150) { this.altFt = 150; this.pitch = Math.max(0, this.pitch); }
    if (this.altFt > 6500) { this.altFt = 6500; this.pitch = Math.min(0, this.pitch); }
    // --- speed, position ------------------------------------------------
    const targetSpeed = 55 + this.throttle * (this.topSpeed() - 55);
    this.speedKt += (targetSpeed - this.speedKt) * Math.min(1, dt * 0.8);
    const headRad = (this.heading - 90) * Math.PI / 180;
    this.lat += Math.sin(headRad) * (this.speedKt / 3600) * dt * 3.2;
    this.lat = Math.max(-2.4, Math.min(2.4, this.lat));
    // Storm edge boost: riding the rim of a cell is fast air.
    let edgeBoost = 0;
    this.inStorm = 0;
    for (const st of this.world.storms) {
      const grip = stormGrip(this, st);
      if (grip === 0.5) { edgeBoost = SCORE.stormEdgeBoostKt; this.inStorm = 0.5; }
      else if (grip === 1) { this.inStorm = 1; }
    }
    this.s += ((this.speedKt + edgeBoost) / 3600) * dt;
    // --- fuel -----------------------------------------------------------
    const burn = (SCORE.fuelBurnPerSec + this.throttle * SCORE.fuelBurnThrottle) * dt;
    this.fuel = Math.max(0, this.fuel - burn);
    if (this.fuel <= 0) {
      this.speedKt = Math.max(55, this.speedKt - 40 * dt);
      if (this.altFt <= 160) this.crash('Out of fuel — Senja-7 glided into the sea.');
    }
    // --- storm core / ash damage ----------------------------------------
    if (this.inStorm === 1) {
      const shield = this.up.has('shield') ? 0.5 : 1;
      const rate = this.world.leg.event === 'ash' ? SCORE.ashHullPerSec : SCORE.stormCoreHullPerSec;
      this.hull -= rate * shield * dt;
      this.shake = Math.min(1, this.shake + dt * 2);
      if (Math.random() < dt * 0.5 && audio) audio.stormRumble();
      if (this.hull <= 0) this.crash('Hull torn apart inside the storm core.');
    } else {
      this.shake = Math.max(0, this.shake - dt * 1.5);
    }
    // --- thermal rings: the signature mechanic --------------------------
    for (const ring of this.world.rings) {
      if (ring.taken) continue;
      const g = ringGap(this, ring);
      if (Math.abs(g.ds) < 0.18 && Math.abs(g.dLat) < 0.38 && Math.abs(g.dAlt) < 480) {
        ring.taken = true;
        this.ringsTaken++;
        const sinceLast = this.timeSec - this.lastRingAt;
        this.combo = (sinceLast <= SCORE.comboWindowSec + (this.up.has('radio') ? 4 : 0))
          ? Math.min(SCORE.comboMax, this.combo + 1) : 1;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        this.comboTimer = SCORE.comboWindowSec;
        this.lastRingAt = this.timeSec;
        const pts = SCORE.ringBase * this.combo;
        this.score += pts;
        const fuelBack = this.up.has('scoop') ? SCORE.ringFuelScoop : SCORE.ringFuel;
        this.fuel = Math.min(this.maxFuel, this.fuel + fuelBack);
        this.log(`Thermal ring ${ring.index} chained — +${pts} pts, combo x${this.combo}, +${fuelBack} fuel.`);
        if (audio) audio.ring(this.combo);
      }
    }
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 0;
    }
    // --- cargo drops ------------------------------------------------------
    if (input.hit('Space')) {
      const drop = this.world.drops.find((d) => !d.done && Math.abs(d.s - this.s) < 0.35 && Math.abs(d.lat - this.lat) < 0.7);
      if (drop) {
        drop.done = true;
        this.dropsDone++;
        this.score += SCORE.dropBase;
        this.log(`Cargo delivered: ${drop.job.name} to ${drop.job.client} — +${SCORE.dropBase} pts.`);
        if (audio) audio.drop();
      } else {
        this.log('Drop pressed — no drop zone below. Watch for the amber marker.');
      }
    }
    // --- gear -------------------------------------------------------------
    if (input.hit('KeyG')) {
      this.gearDown = !this.gearDown;
      this.log(this.gearDown ? 'Landing gear DOWN.' : 'Landing gear UP.');
    }
    // --- runway / leg end --------------------------------------------------
    if (this.s >= this.world.runway.s) this.finishLeg(audio);
  }

  finishLeg(audio) {
    const rw = this.world.runway;
    const lowAndSlow = this.altFt <= SCORE.maxLandAltFt && this.speedKt <= SCORE.minLandSpeedKt;
    const centred = Math.abs(this.lat - rw.lat) < 0.5;
    if (this.world.leg.id === 6) {
      // The final leg is a real landing: low, slow, centred, gear down.
      if (lowAndSlow && centred && this.gearDown) {
        this.landed = true;
        const smooth = this.speedKt < 100 && Math.abs(this.bank) < 10;
        const bonus = SCORE.landingBase + (smooth ? SCORE.smoothLandingBonus : 0);
        this.score += bonus;
        this.log(`TOUCHDOWN on runway 09 — +${bonus} pts${smooth ? ' (silk-smooth!)' : ''}.`);
        if (audio) audio.fanfare();
      } else if (this.altFt > SCORE.maxLandAltFt || this.speedKt > SCORE.minLandSpeedKt) {
        this.crash('Overshot runway 09 — too high or too fast in the rain.');
      } else if (!this.gearDown) {
        this.crash('Belly landing on runway 09 — gear was up.');
      } else {
        this.crash('Ran off the side of runway 09 in the storm.');
      }
    } else {
      // Earlier legs end with a fly-past touchdown strip.
      this.landed = true;
      const bonus = 300 + this.dropsDone * 100;
      this.score += bonus;
      this.log(`Leg complete — wheels kissed the strip, +${bonus} pts.`);
      if (audio) audio.fanfare();
    }
  }

  crash(reason) {
    this.crashed = true;
    this.crashReason = reason;
    this.log(reason);
  }

  // Grade for the results screen: share of the leg's possible score.
  grade() {
    const max = this.world.rings.length * SCORE.ringBase * 3
      + this.world.drops.length * SCORE.dropBase + SCORE.landingBase + 500;
    const share = this.score / Math.max(1, max);
    if (share >= 0.85) return 'S';
    if (share >= 0.65) return 'A';
    if (share >= 0.45) return 'B';
    return 'C';
  }

  // Earnings paid into the hangar after the leg.
  earnings() { return Math.round(this.score / 10); }
}
