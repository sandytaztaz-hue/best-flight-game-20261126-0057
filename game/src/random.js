// random.js — a tiny seeded random generator so every leg, ring line and
// screenshot scene is reproducible from one seed number. The same seed
// always builds the same sky, which is what makes the staged screenshots
// honest renders instead of lucky frames.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Build a deterministic scatter of points in [0,1] x [0,1] from a seed.
export function scatter(seed, count, minGap) {
  const rnd = mulberry32(seed);
  const pts = [];
  let guard = 0;
  while (pts.length < count && guard++ < count * 40) {
    const x = rnd(), y = rnd();
    if (pts.every((p) => Math.hypot(p.x - x, p.y - y) > minGap)) pts.push({ x, y, r: rnd() });
  }
  return pts;
}

// Pick one item from a list with a seeded roll.
export function pickSeeded(seed, list) {
  return list[Math.floor(mulberry32(seed)() * list.length) % list.length];
}

// Smooth noise in one dimension: value noise with cosine interpolation.
export function noise1(seed, x) {
  const xi = Math.floor(x), xf = x - xi;
  const a = mulberry32(seed + xi * 7919)();
  const b = mulberry32(seed + (xi + 1) * 7919)();
  const u = (1 - Math.cos(xf * Math.PI)) / 2;
  return a + (b - a) * u;
}
