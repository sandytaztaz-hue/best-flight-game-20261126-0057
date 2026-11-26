// main.js — SENJA SKY COURIER boot and loop: the state machine (title,
// hangar, briefing, fly, results, paused, crash, campaign), the campaign
// (coins, upgrades, leg scores, saves), the particle effects, and the
// render loop. Open game/index.html in a desktop browser and it plays.
import { W, H, LEGS, UPGRADES } from './config.js';
import { Input } from './input.js';
import { AudioEngine } from './audio.js';
import { buildLeg, updateWorld } from './world.js';
import { Flight } from './flight.js';
import { Radio, REACTIONS, Logbook, Inspector } from './characters.js';
import { drawScene } from './render.js';
import { drawTopHud, drawSideHud, drawBottomHud, drawDialog, drawEventBanner, drawLogFeed } from './hud.js';
import { drawTitle, drawHangar, drawBriefing, drawResults, drawPaused, drawCrash, drawCampaign } from './screens.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = new Input(canvas);
const audio = new AudioEngine();
const params = new URLSearchParams(location.search);
const SHOT = params.get('shot');
const SEED = Number(params.get('seed') || 41);

// The campaign: everything that survives between legs.
const campaign = {
  leg: 0, coins: 0, totalScore: 0, upgrades: new Set(),
  legScores: [], totalDrops: 0, perfectLegs: 0, crashes: 0,
  inspectorBonus: 0,
};

const game = {
  state: 'title', world: null, flight: null, campaign,
  radio: new Radio(), logbook: new Logbook(), inspector: new Inspector(),
  saves: loadSaves(), t: 0, shotMode: null,
  eventBanner: '', eventBannerT: 0,
  fx: { rain: [], ash: [], fireworks: [] },
  muted: false, lowFuelWarned: false, stormWarned: false,
};

function loadSaves() {
  const saves = [null, null, null];
  try {
    for (let i = 0; i < 3; i++) {
      const raw = localStorage.getItem(`senja-save-${i}`);
      if (raw) saves[i] = JSON.parse(raw);
    }
  } catch (e) { /* private mode: slots live in memory only */ }
  return saves;
}

function saveSlot(i) {
  const data = {
    leg: campaign.leg, coins: campaign.coins, totalScore: campaign.totalScore,
    upgrades: [...campaign.upgrades], legScores: campaign.legScores,
    totalDrops: campaign.totalDrops, perfectLegs: campaign.perfectLegs,
  };
  game.saves[i] = data;
  try { localStorage.setItem(`senja-save-${i}`, JSON.stringify(data)); } catch (e) { /* ignore */ }
}

function loadSlot(i) {
  const s = game.saves[i];
  if (!s) return;
  campaign.leg = s.leg; campaign.coins = s.coins; campaign.totalScore = s.totalScore;
  campaign.upgrades = new Set(s.upgrades); campaign.legScores = s.legScores || [];
  campaign.totalDrops = s.totalDrops || 0; campaign.perfectLegs = s.perfectLegs || 0;
}

function startLeg(legIndex) {
  game.world = buildLeg(legIndex, SEED);
  game.flight = new Flight(game.world, campaign.upgrades);
  game.radio = new Radio();
  game.radio.sayLeg(game.world.leg);
  game.eventBanner = game.world.leg.eventText || '';
  game.eventBannerT = game.world.leg.event ? 6 : 0;
  game.lowFuelWarned = false;
  game.stormWarned = false;
  game.state = 'briefing';
  // Particles for this leg's weather.
  game.fx.rain = Array.from({ length: 90 }, () => ({ x: Math.random() * W, y: Math.random() * H, v: 9 + Math.random() * 6 }));
  game.fx.ash = Array.from({ length: 70 }, () => ({ x: Math.random() * W, y: Math.random() * H, v: 0.4 + Math.random() * 0.8 }));
}

// --- effects ---------------------------------------------------------------
function updateFx(dt) {
  const leg = game.world ? game.world.leg : null;
  if (leg && (leg.event === 'squall' || (game.flight && game.flight.inStorm === 1))) {
    for (const r of game.fx.rain) {
      r.y += r.v * 60 * dt; r.x -= r.v * 8 * dt;
      if (r.y > H) { r.y = -20; r.x = Math.random() * (W + 100); }
    }
  }
  if (leg && leg.event === 'ash') {
    for (const a of game.fx.ash) {
      a.y += a.v * 30 * dt; a.x += Math.sin(game.t + a.y * 0.02) * 0.4;
      if (a.y > H) { a.y = -4; a.x = Math.random() * W; }
    }
  }
  if (leg && leg.event === 'fireworks') {
    // In the night screenshot the sky must be bursting at capture time.
    const rate = game.shotMode === 'night' ? 1.6 : 0.5;
    if (Math.random() < dt * rate) {
      const fx = 200 + Math.random() * 880, fy = 80 + Math.random() * 130;
      game.fx.fireworks.push({
        x: fx, y: fy,
        parts: Array.from({ length: 24 }, (_, i) => ({
          x: fx, y: fy, vx: Math.cos(i * 0.26) * (1.5 + Math.random() * 2.5),
          vy: Math.sin(i * 0.26) * (1.5 + Math.random() * 2.5),
          color: ['#ffd166', '#ff5a5a', '#7fd4ff', '#c9f29b'][i % 4],
          age: 0, life: 1.1 + Math.random() * 0.5,
        })),
      });
    }
  }
  for (const f of game.fx.fireworks) {
    for (const p of f.parts) {
      p.age += dt; p.x += p.vx * 60 * dt; p.y += p.vy * 60 * dt; p.vy += 1.2 * dt;
    }
  }
  game.fx.fireworks = game.fx.fireworks.filter((f) => f.parts.some((p) => p.age < p.life));
}

// --- reactions: the radio answers what happens in the air ------------------
function watchFlight(dt) {
  const f = game.flight;
  if (!f) return;
  if (f.combo >= 3 && f.comboTimer > 0 && !watchFlight._streak) {
    watchFlight._streak = true;
    const [who, text] = REACTIONS.ringStreak[Math.floor(Math.random() * REACTIONS.ringStreak.length)];
    game.radio.say(who, text);
  }
  if (f.combo === 0) watchFlight._streak = false;
  if (f.inStorm === 0.5 && !game.stormWarned) {
    game.stormWarned = true;
    const [who, text] = REACTIONS.stormEdge[0];
    game.radio.say(who, text);
  }
  if (f.inStorm === 1 && !watchFlight._core) {
    watchFlight._core = true;
    const [who, text] = REACTIONS.stormCore[0];
    game.radio.say(who, text);
  }
  if (f.inStorm === 0) { watchFlight._core = false; game.stormWarned = false; }
  if (f.fuel < 20 && !game.lowFuelWarned) {
    game.lowFuelWarned = true;
    const [who, text] = REACTIONS.lowFuel[0];
    game.radio.say(who, text);
  }
  if (f.fuel > 25) game.lowFuelWarned = false;
}

// --- the loop ----------------------------------------------------------------
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  game.t += dt;
  window.__senjaState = game.state;
  const f = game.flight;

  if (input.hit('KeyM')) { game.muted = !game.muted; audio.setMuted(game.muted); }

  if (game.state === 'title') {
    const actions = drawTitle(ctx, input, game.saves, game.t);
    for (const a of actions) {
      audio.ensure(); audio.click();
      if (a.type === 'slot') {
        if (game.saves[a.slot]) loadSlot(a.slot); else { campaign.leg = 0; campaign.coins = 0; campaign.totalScore = 0; campaign.upgrades = new Set(); campaign.legScores = []; campaign.totalDrops = 0; campaign.perfectLegs = 0; campaign.crashes = 0; }
        game.state = 'hangar';
      }
    }
  } else if (game.state === 'hangar') {
    const actions = drawHangar(ctx, input, campaign, game.t);
    for (const a of actions) {
      audio.ensure(); audio.click();
      if (a.type === 'buy') {
        const u = UPGRADES.find((x) => x.id === a.id);
        if (u && campaign.coins >= u.cost) {
          campaign.coins -= u.cost;
          campaign.upgrades.add(u.id);
          saveSlot(0);
        }
      } else if (a.type === 'fly') {
        startLeg(campaign.leg);
      }
    }
  } else if (game.state === 'briefing') {
    if (game.world) drawScene(ctx, game.world, game.flight, game.t, dt, game.fx);
    if (drawBriefing(ctx, input, game.world.leg, campaign)) {
      audio.ensure();
      game.state = 'fly';
    }
  } else if (game.state === 'fly') {
    audio.ensure();
    audio.setThrottle(f.throttle);
    // In screenshot mode the staged moment holds still: the scene stays
    // alive (clouds, particles, radio) but the flight state does not drift.
    if (!game.shotMode) {
      f.update(dt, input, audio);
      updateWorld(game.world, dt);
      watchFlight(dt);
    }
    // The radio line holds still in screenshot mode so the staged dialog
    // is the one the screenshot catches.
    if (!game.shotMode) game.radio.update(dt);
    updateFx(dt);
    if (game.eventBannerT > 0) game.eventBannerT -= dt;
    if (game.eventBannerT > 0) game.eventBannerT -= dt;
    drawScene(ctx, game.world, f, game.t, dt, game.fx);
    drawTopHud(ctx, f, game.world, campaign);
    drawSideHud(ctx, f, game.world);
    drawBottomHud(ctx, f, game.world);
    drawLogFeed(ctx, f);
    drawDialog(ctx, game.radio);
    if (game.eventBannerT > 0) drawEventBanner(ctx, game.eventBanner, game.t);
    if (input.hit('KeyP')) game.state = 'paused';
    if (f.landed) {
      campaign.totalScore += f.score;
      campaign.coins += f.earnings();
      campaign.totalDrops += f.dropsDone;
      campaign.legScores.push(f.score);
      if (f.grade() === 'S') campaign.perfectLegs++;
      game.logbook.add(game.world.leg.name, `Leg ${game.world.leg.id} flown: ${f.score} pts, grade ${f.grade()}.`);
      saveSlot(0);
      game.state = 'results';
    } else if (f.crashed) {
      campaign.crashes++;
      game.state = 'crash';
    }
  } else if (game.state === 'results') {
    if (game.world && f) drawScene(ctx, game.world, f, game.t, dt, game.fx);
    const next = drawResults(ctx, input, f, game.world, campaign, campaign.legScores);
    if (next === 'continue') {
      audio.click();
      if (game.world.leg.id === 6) {
        campaign.inspectorBonus = game.inspector.bonus(campaign);
        game.inspectorText = game.inspector.reveal();
        game.state = 'campaign';
      } else {
        campaign.leg = Math.min(5, campaign.leg + 1);
        game.state = 'hangar';
      }
    }
  } else if (game.state === 'paused') {
    if (game.world && f) drawScene(ctx, game.world, f, game.t, dt, game.fx);
    drawPaused(ctx, input);
    if (input.hit('KeyP')) game.state = 'fly';
    if (input.hit('KeyR')) startLeg(campaign.leg);
    if (input.hit('KeyQ')) game.state = 'title';
  } else if (game.state === 'crash') {
    if (game.world && f) drawScene(ctx, game.world, f, game.t, dt, game.fx);
    const act = drawCrash(ctx, input, f);
    if (act === 'retry') startLeg(campaign.leg);
    if (act === 'title') game.state = 'title';
  } else if (game.state === 'campaign') {
    const act = drawCampaign(ctx, input, campaign, game.inspectorText || '');
    if (act === 'again') {
      campaign.leg = 0; campaign.coins = 0; campaign.totalScore = 0;
      campaign.upgrades = new Set(); campaign.legScores = [];
      campaign.totalDrops = 0; campaign.perfectLegs = 0; campaign.crashes = 0;
      game.state = 'title';
    }
  }

  input.endFrame();
  requestAnimationFrame(frame);
}

// Shot mode: stage a dense scene and hold it still for the screenshot.
// In shot mode the game does not advance on its own (no autoplay drift).
if (SHOT) {
  applyShot(game, SHOT);
  if (SHOT === 'cover' || SHOT === 'night') {
    // Let the radio line show and the scene settle, then freeze motion.
    game.radio.update(0.1);
  }
}

requestAnimationFrame(frame);
