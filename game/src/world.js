// world.js — builds one leg of the journey from its config and a seed:
// the thermal ring line, the storm cells, the cargo drop zones, the
// runway, and the scenery (clouds, birds, boats, islands). Everything the
// pilot flies through is placed here, deterministically.
import { LEGS, JOBS } from './config.js';
import { mulberry32, scatter } from './random.js';

// One leg, fully placed. s is distance along the route in nautical miles.
export function buildLeg(legIndex, seed) {
  const leg = LEGS[legIndex];
  const rnd = mulberry32(seed + legIndex * 1013);
  const rings = [];
  const spacing = leg.lengthNm / (leg.ringCount + 1);
  let lat = 0, alt = 2200;
  for (let i = 0; i < leg.ringCount; i++) {
    lat = Math.max(-1.6, Math.min(1.6, lat + (rnd() - 0.5) * 1.7));
    alt = Math.max(900, Math.min(4800, alt + (rnd() - 0.5) * 2200));
    rings.push({
      s: spacing * (i + 1), lat, altFt: alt,
      radius: 340 + rnd() * 120, taken: false, index: i + 1,
    });
  }
  // Cargo drops: jobs of this leg, spaced along the route.
  const jobs = JOBS.filter((j) => j.leg === leg.id);
  const drops = jobs.slice(0, leg.dropCount).map((job, i) => ({
    job, s: leg.lengthNm * (0.35 + 0.45 * (i + 1) / (leg.dropCount + 1)),
    lat: (rnd() - 0.5) * 1.2, done: false, index: i + 1,
  }));
  // Storm cells: drift across the route. Leg 6 gets three, leg 3 gets the
  // ash plume (one wide slow cell), others get one small cell at most.
  const storms = [];
  const stormCount = leg.event === 'squall' ? 3 : leg.event === 'ash' ? 1 : (leg.id >= 4 ? 1 : 0);
  for (let i = 0; i < stormCount; i++) {
    storms.push({
      s: leg.lengthNm * (0.3 + 0.55 * rnd()),
      lat: (rnd() - 0.5) * 2.2,
      radius: leg.event === 'ash' ? 3.4 : 1.6 + rnd() * 1.2,
      kind: leg.event === 'ash' ? 'ash' : 'storm',
      drift: (rnd() - 0.5) * 0.25,
    });
  }
  // The runway waits at the end of every leg (landing matters on leg 6,
  // and every leg ends with a touchdown strip for the results screen).
  const runway = { s: leg.lengthNm, lat: 0, heading: 90 };
  // Scenery scatter: clouds, birds, boats, islands.
  const clouds = scatter(seed + 77, 26, 0.09).map((p) => ({
    x: p.x, y: 0.04 + p.y * 0.30, scale: 0.6 + p.r * 1.1, speed: 0.004 + p.r * 0.008,
  }));
  const birds = scatter(seed + 131, 9, 0.12).map((p) => ({
    x: p.x, y: 0.35 + p.y * 0.3, flap: p.r * 6.28, speed: 0.01 + p.r * 0.02,
  }));
  const boats = scatter(seed + 199, leg.terrain === 'sea' || leg.terrain === 'islands' ? 7 : 2, 0.15)
    .map((p) => ({ x: p.x, y: 0.72 + p.y * 0.22, wake: p.r }));
  const islands = scatter(seed + 271, leg.terrain === 'volcano' ? 3 : 5, 0.2)
    .map((p, i) => ({
      x: p.x, y: 0.62 + p.y * 0.2, w: 90 + p.r * 170,
      volcano: leg.terrain === 'volcano' && i === 0,
    }));
  return { leg, legIndex, seed, rings, drops, storms, runway, clouds, birds, boats, islands };
}

// Storm cells drift slowly across the route while the leg runs.
export function updateWorld(world, dt) {
  for (const st of world.storms) {
    st.lat += st.drift * dt;
    if (st.lat > 2.4) st.lat = 2.4;
    if (st.lat < -2.4) st.lat = -2.4;
  }
}

// Where is the next thing the pilot must fly through?
export function nextRing(world, s) {
  return world.rings.find((r) => !r.taken && r.s >= s - 0.2) || null;
}
export function nextDrop(world, s) {
  return world.drops.find((d) => !d.done && d.s >= s - 0.2) || null;
}
export function nextStorm(world, s) {
  return world.storms.find((st) => st.s >= s - 0.5) || null;
}

// Distance from the plane to a ring, in the ring's own units.
export function ringGap(plane, ring) {
  return { ds: ring.s - plane.s, dLat: ring.lat - plane.lat, dAlt: ring.altFt - plane.altFt };
}

// A storm cell's grip on the plane: 0 = clear air, 1 = dead centre.
export function stormGrip(plane, storm) {
  const ds = (storm.s - plane.s) / storm.radius;
  const dLat = (storm.lat - plane.lat) / (storm.radius * 0.7);
  const d = Math.hypot(ds, dLat);
  if (d > 1.6) return 0;
  if (d <= 1.0) return 1; // core
  return 0.5; // edge: fast air, no damage
}
