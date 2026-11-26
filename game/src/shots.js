// shots.js — deterministic staged scenes for the screenshots. The game is
// a live simulation, so a screenshot needs a moment that is already dense:
// a leg in progress, rings ahead, a storm on the route, the radio talking.
// Each shot sets the whole state (leg, position, HUD values, dialog) and
// the render loop does the rest — these are real renders of the game's own
// code, never composited images.
import { buildLeg } from './world.js';
import { Flight } from './flight.js';

// Put the plane mid-route with the next ring close and a storm in view.
function stageFlight(world, s, opts) {
  const flight = new Flight(world, opts.upgrades || []);
  flight.s = s;
  flight.lat = opts.lat ?? 0.2;
  flight.altFt = opts.alt ?? 2600;
  flight.throttle = opts.throttle ?? 0.72;
  flight.speedKt = opts.speed ?? 168;
  flight.fuel = opts.fuel ?? 78;
  flight.hull = opts.hull ?? 92;
  flight.score = opts.score ?? 3250;
  flight.combo = opts.combo ?? 3;
  flight.comboTimer = 9;
  flight.ringsTaken = opts.ringsTaken ?? 3;
  flight.dropsDone = opts.dropsDone ?? 1;
  flight.timeSec = opts.time ?? 74;
  flight.heading = 92;
  flight.bank = opts.bank ?? -8;
  // Mark the earlier rings taken so the next ring reads as the live target.
  world.rings.forEach((r, i) => { if (i < flight.ringsTaken) r.taken = true; });
  if (opts.dropsDone) world.drops.forEach((d, i) => { if (i < opts.dropsDone) d.done = true; });
  return flight;
}

export function applyShot(game, shot) {
  const up = new Set(['wing', 'scoop', 'lights']);
  if (shot === 'cover') {
    // Leg 3, volcano valley: ash plume + rings + full HUD + radio line.
    const world = buildLeg(2, 41);
    const flight = stageFlight(world, 13.5, {
      upgrades: up, lat: -0.3, alt: 3100, score: 4850, combo: 4,
      ringsTaken: 4, dropsDone: 0, time: 96, bank: -12, fuel: 71, hull: 88,
    });
    game.world = world; game.flight = flight;
    game.state = 'fly';
    game.radio.say('SARI', 'Ash plume ahead, Senja-7 — thread the clean air above it!');
    game.radio.say('RARA', 'Thermals lit, ash in sight. Chain holding at four.');
    game.campaign.leg = 2;
    game.campaign.coins = 1240;
    game.campaign.totalScore = 11800;
    game.eventBanner = 'VOLCANIC ASH PLUME — the grey column eats hull. Climb above it or skirt it!';
    game.eventBannerT = 99;
  } else if (shot === 'hangar') {
    game.state = 'hangar';
    game.campaign.leg = 3;
    game.campaign.coins = 1860;
    game.campaign.totalScore = 21450;
    game.campaign.upgrades = new Set(['wing', 'scoop']);
    game.campaign.legScores = [3250, 4100, 4850];
  } else if (shot === 'night') {
    // Leg 5, night city festival: fireworks, lanterns, lit course.
    const world = buildLeg(4, 41);
    const flight = stageFlight(world, 16.2, {
      upgrades: up, lat: 0.4, alt: 1900, score: 6120, combo: 5,
      ringsTaken: 6, dropsDone: 1, time: 121, bank: 10, fuel: 64, hull: 95,
    });
    game.world = world; game.flight = flight;
    game.state = 'fly';
    game.radio.say('SARI', 'Fireworks over the river, Senja-7 — make it pretty, the festival is watching!');
    game.campaign.leg = 4;
    game.campaign.coins = 2100;
    game.campaign.totalScore = 28700;
    game.eventBanner = 'FESTIVAL FIREWORKS — bursts over the river light your course. The Inspector is watching.';
    game.eventBannerT = 99;
    game.fx.fireworks.push({
      x: 900, y: 200, parts: Array.from({ length: 26 }, (_, i) => ({
        x: 900, y: 200, vx: Math.cos(i * 0.24) * 3, vy: Math.sin(i * 0.24) * 3,
        color: ['#ffd166', '#ff5a5a', '#7fd4ff'][i % 3], age: 0, life: 1.4,
      })),
    });
  } else if (shot === 'results') {
    // Finished leg 3, grade A, full results sheet with the score graph.
    const world = buildLeg(2, 41);
    const flight = stageFlight(world, world.leg.lengthNm, {
      upgrades: up, score: 7420, combo: 4, ringsTaken: 7, dropsDone: 1,
      time: 168, fuel: 41, hull: 88,
    });
    world.rings.forEach((r) => { r.taken = true; });
    world.drops.forEach((d) => { d.done = true; });
    flight.landed = true;
    flight.maxCombo = 4;
    flight.log('Leg complete — wheels kissed the strip, +400 pts.');
    flight.log('Thermal ring 8 chained — +1000 pts, combo x4, +8 fuel.');
    game.world = world; game.flight = flight;
    game.state = 'results';
    game.campaign.leg = 2;
    game.campaign.coins = 1860;
    game.campaign.totalScore = 21450;
    game.campaign.legScores = [3250, 4100, 7420];
  }
  game.shotMode = shot;
}
