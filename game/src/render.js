// render.js — everything the eye sees: sky, sun, ridges, sea and ground,
// islands and the volcano, the city at night, clouds, birds, boats, rain,
// ash and fireworks, the storm cells, the thermal rings, the runway, and
// the Senja-7 herself, drawn from behind with her prop spinning. No emoji,
// no flat rectangles as characters: every shape is drawn for what it is.
import { W, H, HORIZON_Y, PALETTES } from './config.js';
import { noise1 } from './random.js';

function skyGradient(ctx, pal, t) {
  const g = ctx.createLinearGradient(0, 0, 0, HORIZON_Y + 120);
  g.addColorStop(0, pal.skyTop);
  g.addColorStop(0.55, pal.skyMid);
  g.addColorStop(1, pal.skyLow);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, HORIZON_Y + 120);
}

function drawSun(ctx, pal, x, y, r, glare) {
  const g = ctx.createRadialGradient(x, y, 4, x, y, r * 3.2);
  g.addColorStop(0, 'rgba(255,230,160,0.95)');
  g.addColorStop(0.35, 'rgba(255,200,110,0.55)');
  g.addColorStop(1, 'rgba(255,200,110,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r * 3.2, 0, 7); ctx.fill();
  ctx.fillStyle = pal.sun;
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  if (glare) { // low-sun glare streaks across the windscreen
    ctx.fillStyle = 'rgba(255,220,150,0.10)';
    ctx.fillRect(0, y - 8, W, 60);
  }
}

function drawRidge(ctx, pal, seed, yBase, amp, color, parallax) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, HORIZON_Y + 4);
  for (let x = 0; x <= W; x += 16) {
    const n = noise1(seed, x / 260 + parallax);
    ctx.lineTo(x, yBase - n * amp);
  }
  ctx.lineTo(W, HORIZON_Y + 4);
  ctx.closePath(); ctx.fill();
}

function drawSea(ctx, pal, t, s) {
  const g = ctx.createLinearGradient(0, HORIZON_Y, 0, H);
  g.addColorStop(0, pal.sea);
  g.addColorStop(1, pal.seaDeep);
  ctx.fillStyle = g;
  ctx.fillRect(0, HORIZON_Y, W, H - HORIZON_Y);
  // Moving wave lines: the sea slides past as the route advances.
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 9; i++) {
    const y = HORIZON_Y + 26 + i * 44 + ((s * 30 + i * 13) % 44);
    ctx.beginPath();
    for (let x = 0; x <= W; x += 40) {
      const wob = Math.sin(x / 90 + i * 2 + t * 0.7) * 5;
      if (x === 0) ctx.moveTo(x, y + wob); else ctx.lineTo(x, y + wob);
    }
    ctx.stroke();
  }
}

function drawGround(ctx, pal, t, s, terrain) {
  if (terrain === 'sea' || terrain === 'islands') { drawSea(ctx, pal, t, s); return; }
  const g = ctx.createLinearGradient(0, HORIZON_Y, 0, H);
  g.addColorStop(0, pal.groundFar);
  g.addColorStop(1, pal.groundNear);
  ctx.fillStyle = g;
  ctx.fillRect(0, HORIZON_Y, W, H - HORIZON_Y);
  if (terrain === 'terraces') {
    // Curved rice-terrace bands, catching the dusk light.
    for (let i = 0; i < 8; i++) {
      const y = HORIZON_Y + 18 + i * 48 + ((s * 22 + i * 17) % 48);
      ctx.fillStyle = i % 2 ? 'rgba(255,214,130,0.20)' : 'rgba(20,60,30,0.25)';
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= W; x += 32) ctx.lineTo(x, y + Math.sin(x / 180 + i) * 10);
      ctx.lineTo(W, y + 26); ctx.lineTo(0, y + 26);
      ctx.closePath(); ctx.fill();
    }
  } else if (terrain === 'city') {
    // River of light down the middle, lit windows along it.
    ctx.fillStyle = 'rgba(255,190,90,0.10)';
    ctx.fillRect(W * 0.42, HORIZON_Y, W * 0.16, H - HORIZON_Y);
    ctx.fillStyle = 'rgba(255,220,140,0.5)';
    for (let i = 0; i < 26; i++) {
      const x = W * 0.44 + ((i * 53 + Math.floor(s * 8)) % 180);
      const y = HORIZON_Y + 20 + ((i * 97) % 380);
      ctx.fillRect(x, y, 3, 3);
    }
  } else {
    // Volcano valley floor: dark scrub, scattered rocks and glowing lava
    // cracks so the mid-ground never reads as empty mud.
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    for (let i = 0; i < 10; i++) {
      const x = (i * 173 + s * 40) % W;
      const y = HORIZON_Y + 30 + ((i * 61) % 360);
      ctx.beginPath(); ctx.ellipse(x, y, 60 + (i % 3) * 30, 12, 0, 0, 7); ctx.fill();
    }
    for (let i = 0; i < 14; i++) {
      const x = (i * 211 + s * 55) % W;
      const y = HORIZON_Y + 60 + ((i * 83) % 320);
      ctx.fillStyle = i % 3 === 0 ? 'rgba(255,122,60,0.55)' : 'rgba(20,16,12,0.5)';
      ctx.beginPath();
      ctx.moveTo(x, y); ctx.lineTo(x + 14 + (i % 4) * 6, y + 4); ctx.lineTo(x + 4, y + 10);
      ctx.closePath(); ctx.fill();
    }
  }
  // Perspective speed lines rushing toward the plane.
  ctx.strokeStyle = 'rgba(255,255,255,0.10)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 7; i++) {
    const off = ((s * 90 + i * 190) % (W + 380)) - 190;
    ctx.beginPath();
    ctx.moveTo(off, H);
    ctx.lineTo(off * 0.7 + 190, HORIZON_Y + 6);
    ctx.stroke();
  }
}

function drawIslands(ctx, world, t, s) {
  const pal = PALETTES[world.leg.palette];
  for (const isl of world.islands) {
    const x = ((isl.x * W + s * 14) % (W + 320)) - 160;
    const y = HORIZON_Y + 8 + isl.y * 60;
    const w = isl.w;
    // Sand rim, green crown, and the volcano cone where it belongs.
    ctx.fillStyle = '#e8d29a';
    ctx.beginPath(); ctx.ellipse(x, y, w, w * 0.16, 0, 0, 7); ctx.fill();
    ctx.fillStyle = pal.groundNear;
    ctx.beginPath(); ctx.ellipse(x, y - 6, w * 0.86, w * 0.13, 0, 0, 7); ctx.fill();
    if (isl.volcano) {
      ctx.fillStyle = '#5a4638';
      ctx.beginPath();
      ctx.moveTo(x - w * 0.5, y - 4);
      ctx.lineTo(x, y - w * 0.62);
      ctx.lineTo(x + w * 0.5, y - 4);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ff7a3c';
      ctx.beginPath(); ctx.ellipse(x, y - w * 0.60, w * 0.07, w * 0.03, 0, 0, 7); ctx.fill();
      // Smoke column curling off the crater.
      ctx.fillStyle = 'rgba(120,110,105,0.55)';
      for (let i = 0; i < 4; i++) {
        const sy = y - w * 0.62 - i * 22 - ((t * 12 + i * 9) % 22);
        ctx.beginPath(); ctx.arc(x + Math.sin(t + i) * 8 + i * 6, sy, 12 + i * 5, 0, 7); ctx.fill();
      }
    } else {
      // Palm silhouettes on the green crown.
      ctx.strokeStyle = '#1e4d2e'; ctx.lineWidth = 3;
      for (let k = 0; k < 3; k++) {
        const px = x - w * 0.4 + k * w * 0.4;
        ctx.beginPath(); ctx.moveTo(px, y - 8); ctx.lineTo(px, y - 26); ctx.stroke();
        ctx.beginPath(); ctx.arc(px, y - 28, 9, Math.PI, 0); ctx.stroke();
      }
    }
  }
}

function drawCitySkyline(ctx, world, t, s) {
  const pal = PALETTES[world.leg.palette];
  const base = HORIZON_Y + 2;
  // Two rows of towers: near row dark, far row lit.
  for (let row = 0; row < 2; row++) {
    const rh = row === 0 ? 120 : 80;
    ctx.fillStyle = row === 0 ? '#141a30' : '#232a4a';
    let x = -((s * 26 + row * 90) % 130);
    while (x < W + 130) {
      const bw = 46 + ((x * 7 + row * 31) % 40);
      const bh = rh * (0.5 + (((x * 13 + row * 17) % 100) / 100) * 0.8);
      ctx.fillRect(x, base - bh, bw, bh);
      // Lit windows.
      ctx.fillStyle = 'rgba(255,205,110,0.85)';
      for (let wy = base - bh + 8; wy < base - 8; wy += 16) {
        for (let wx = x + 6; wx < x + bw - 6; wx += 14) {
          if (((wx * 3 + wy * 7) % 5) < 2) ctx.fillRect(wx, wy, 5, 7);
        }
      }
      ctx.fillStyle = row === 0 ? '#141a30' : '#232a4a';
      x += bw + 18;
    }
  }
  // Festival lanterns strung between the towers.
  ctx.strokeStyle = 'rgba(255,180,90,0.7)'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, base - 90 + Math.sin(t) * 4);
  ctx.quadraticCurveTo(W / 2, base - 60 + Math.sin(t + 1) * 4, W, base - 90 + Math.sin(t + 2) * 4);
  ctx.stroke();
  for (let i = 0; i < 12; i++) {
    const lx = (i / 11) * W;
    const ly = base - 84 + Math.sin(lx / 200) * 14;
    ctx.fillStyle = i % 2 ? '#ff5a5a' : '#ffd166';
    ctx.beginPath(); ctx.arc(lx, ly, 6, 0, 7); ctx.fill();
  }
}

// --- clouds, birds, boats, rings, storms, runway, plane, particles ------

function drawClouds(ctx, world, t) {
  for (const c of world.clouds) {
    const x = ((c.x * W + t * c.speed * 60) % (W + 260)) - 130;
    const y = c.y * H;
    const s = c.scale;
    ctx.fillStyle = 'rgba(255,244,225,0.85)';
    ctx.beginPath();
    ctx.ellipse(x, y, 52 * s, 16 * s, 0, 0, 7);
    ctx.ellipse(x - 30 * s, y + 5 * s, 30 * s, 12 * s, 0, 0, 7);
    ctx.ellipse(x + 32 * s, y + 4 * s, 34 * s, 13 * s, 0, 0, 7);
    ctx.fill();
  }
}

function drawBirds(ctx, world, t) {
  ctx.strokeStyle = 'rgba(40,30,40,0.8)';
  ctx.lineWidth = 2;
  for (const b of world.birds) {
    const x = ((b.x * W + t * b.speed * 120) % (W + 80)) - 40;
    const y = b.y * H + Math.sin(t * 2 + b.flap) * 8;
    const f = Math.sin(t * 9 + b.flap) * 6;
    ctx.beginPath();
    ctx.moveTo(x - 9, y - f); ctx.lineTo(x, y); ctx.lineTo(x + 9, y - f);
    ctx.stroke();
  }
}

function drawBoats(ctx, world, t, s) {
  for (const b of world.boats) {
    const x = ((b.x * W + s * 10) % (W + 120)) - 60;
    const y = HORIZON_Y + 40 + b.y * 300;
    ctx.fillStyle = '#f2ead8';
    ctx.beginPath(); ctx.moveTo(x - 26, y); ctx.lineTo(x + 26, y); ctx.lineTo(x + 18, y + 10); ctx.lineTo(x - 18, y + 10); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c65a3a';
    ctx.fillRect(x - 2, y - 26, 4, 26);
    ctx.beginPath(); ctx.moveTo(x + 2, y - 26); ctx.lineTo(x + 20, y - 8); ctx.lineTo(x + 2, y - 8); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x - 34, y + 12); ctx.lineTo(x + 34, y + 12); ctx.stroke();
  }
}

// Project a ring ahead of the plane onto the screen. Rings far away are
// small and high; the next ring is big, golden and impossible to miss.
function ringScreen(plane, ring) {
  const d = ring.s - plane.s; // nm ahead
  if (d < -0.3 || d > 9) return null;
  const depth = Math.max(0.12, d / 9);
  const scale = 1 / (0.25 + depth * 1.4);
  const x = W / 2 + (ring.lat - plane.lat) * 260 * scale;
  const y = Math.max(56, Math.min(600,
    HORIZON_Y - 40 - (ring.altFt - plane.altFt) * 0.055 * scale - (1 - depth) * 60));
  return { x, y, r: Math.max(10, ring.radius * 0.16 * scale), depth, d };
}

function drawRings(ctx, plane, world) {
  const rings = world.rings.filter((r) => !r.taken)
    .map((r) => ({ r, p: ringScreen(plane, r) }))
    .filter((o) => o.p)
    .sort((a, b) => b.p.depth - a.p.depth); // far first, near last
  for (const { r, p } of rings) {
    const isNext = world.rings.find((x) => !x.taken) === r;
    const glow = isNext ? 0.95 : 0.55;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.strokeStyle = `rgba(255,209,102,${glow})`;
    ctx.lineWidth = isNext ? 7 : 4;
    ctx.shadowColor = '#ffd166'; ctx.shadowBlur = isNext ? 22 : 8;
    ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * 0.92, 0, 0, 7); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = `rgba(255,255,255,${glow * 0.7})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, 0, p.r * 0.82, p.r * 0.74, 0, 0, 7); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = isNext ? '#ffd166' : 'rgba(255,255,255,0.85)';
    ctx.font = `bold ${isNext ? 17 : 13}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`RING ${r.index}`, p.x, p.y - p.r - 10);
    if (isNext) {
      ctx.font = '13px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillText(`${p.d.toFixed(1)} nm`, p.x, p.y + p.r + 18);
    }
  }
  // Drop zones: amber diamonds with a parachute crate.
  for (const d of world.drops) {
    if (d.done) continue;
    const ds = d.s - plane.s;
    if (ds < -0.3 || ds > 9) continue;
    const depth = Math.max(0.12, ds / 9);
    const scale = 1 / (0.25 + depth * 1.4);
    const x = W / 2 + (d.lat - plane.lat) * 260 * scale;
    // Keep the marker and its label clear of the bottom instrument strip.
    const y = Math.min(540, HORIZON_Y + 120 * scale + (1 - depth) * 160);
    const lx = Math.max(150, Math.min(W - 150, x));
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = 'rgba(255,157,107,0.95)';
    ctx.shadowColor = '#ff9d6b'; ctx.shadowBlur = 14;
    ctx.fillRect(-14, -14, 28, 28);
    ctx.restore();
    // Low markers get their label above the diamond, clear of the dialog
    // banner and the bottom instrument strip. A dark pill keeps the text
    // readable even when the plane flies across it.
    const above = y > 460;
    const ly = above ? y - 40 : y + 34;
    const ly2 = above ? y - 24 : y + 50;
    const label = `DROP ${d.index} — ${d.job.name.toUpperCase()}`;
    ctx.font = 'bold 13px sans-serif';
    const tw = ctx.measureText(label).width;
    ctx.fillStyle = 'rgba(10,16,32,0.72)';
    ctx.beginPath(); ctx.roundRect(lx - tw / 2 - 8, ly - 15, tw + 16, 36, 6); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(label, lx, ly);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '12px sans-serif';
    ctx.fillText(`${ds.toFixed(1)} nm`, lx, ly2);
  }
}

function drawStorms(ctx, plane, world, t) {
  for (const st of world.storms) {
    const d = st.s - plane.s;
    if (d < -1 || d > 10) continue;
    const depth = Math.max(0.15, d / 10);
    const scale = 1 / (0.25 + depth * 1.5);
    const x = W / 2 + (st.lat - plane.lat) * 260 * scale;
    const y = HORIZON_Y - 150 * scale;
    const r = st.radius * 90 * scale;
    const dark = st.kind === 'ash' ? '90,85,80' : '52,58,78';
    ctx.save();
    ctx.translate(x, y);
    for (let i = 0; i < 6; i++) {
      const ox = Math.sin(i * 2.4 + t * 0.4) * r * 0.5;
      const oy = Math.cos(i * 1.7 + t * 0.3) * r * 0.25;
      ctx.fillStyle = `rgba(${dark},${0.5 - i * 0.04})`;
      ctx.beginPath(); ctx.ellipse(ox, oy, r * (0.7 - i * 0.06), r * 0.42, 0, 0, 7); ctx.fill();
    }
    ctx.strokeStyle = st.kind === 'ash' ? 'rgba(255,150,90,0.9)' : 'rgba(255,220,120,0.9)';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);
    ctx.beginPath(); ctx.ellipse(0, 0, r * 1.05, r * 0.55, 0, 0, 7); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
    const labelY = Math.max(130, y - r * 0.55 - 12);
    ctx.fillText(st.kind === 'ash' ? 'ASH PLUME — CLIMB OR SKIRT' : 'STORM CELL — EDGE = SPEED, CORE = DAMAGE', x, labelY);
    if (Math.random() < 0.06 && st.kind === 'storm') { // lightning flicker
      ctx.strokeStyle = 'rgba(255,255,200,0.9)'; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - 10, y - 10); ctx.lineTo(x + 4, y + 18); ctx.lineTo(x - 4, y + 18); ctx.lineTo(x + 10, y + 44);
      ctx.stroke();
    }
  }
}

function drawRunway(ctx, plane, world) {
  const rw = world.runway;
  const d = rw.s - plane.s;
  if (d < -0.5 || d > 8) return;
  const depth = Math.max(0.12, d / 8);
  const scale = 1 / (0.25 + depth * 1.4);
  const x = W / 2 + (rw.lat - plane.lat) * 260 * scale;
  const yTop = HORIZON_Y + 30 * scale;
  const yBot = HORIZON_Y + 330 * scale;
  const wTop = 26 * scale, wBot = 210 * scale;
  ctx.fillStyle = '#2a2f3a';
  ctx.beginPath();
  ctx.moveTo(x - wTop, yTop); ctx.lineTo(x + wTop, yTop);
  ctx.lineTo(x + wBot, yBot); ctx.lineTo(x - wBot, yBot);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x - wTop, yTop); ctx.lineTo(x - wBot, yBot); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + wTop, yTop); ctx.lineTo(x + wBot, yBot); ctx.stroke();
  ctx.fillStyle = '#fff';
  for (let i = 0; i < 5; i++) {
    const yy = yTop + (yBot - yTop) * (i + 0.5) / 5;
    const ww = 8 * scale + (i * 6);
    ctx.fillRect(x - ww / 2, yy, ww, 4);
  }
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(`RUNWAY 09 — ${d.toFixed(1)} nm`, x, yTop - 12);
}

// The Senja-7 herself: twin-prop courier, drawn from behind, banking with
// the turn, prop a blur, nav lights blinking, gear down when asked.
function drawPlane(ctx, plane, t) {
  const cx = W / 2, cy = H - 168;
  const shakeX = plane.shake ? (Math.random() - 0.5) * plane.shake * 10 : 0;
  const shakeY = plane.shake ? (Math.random() - 0.5) * plane.shake * 8 : 0;
  ctx.save();
  ctx.translate(cx + shakeX, cy + shakeY);
  ctx.rotate((plane.bank * Math.PI / 180) * 0.35);
  const bob = Math.sin(t * 1.4) * 2;
  ctx.translate(0, bob);
  // Shadow on the ground far below.
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.ellipse(0, 150, 70, 12, 0, 0, 7); ctx.fill();
  // Tailplane.
  ctx.fillStyle = '#e85d3c';
  ctx.beginPath();
  ctx.moveTo(-58, 26); ctx.lineTo(58, 26); ctx.lineTo(44, 44); ctx.lineTo(-44, 44);
  ctx.closePath(); ctx.fill();
  // Main wings with sunlit tops.
  ctx.fillStyle = '#f4f1e8';
  ctx.beginPath();
  ctx.moveTo(-168, 6); ctx.lineTo(-26, -6); ctx.lineTo(-26, 22); ctx.lineTo(-168, 30);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(168, 6); ctx.lineTo(26, -6); ctx.lineTo(26, 22); ctx.lineTo(168, 30);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#e85d3c';
  ctx.fillRect(-168, 12, 26, 10);
  ctx.fillRect(142, 12, 26, 10);
  // Fuselage: cream body, teal cheatline, cockpit glass.
  ctx.fillStyle = '#f4f1e8';
  ctx.beginPath(); ctx.ellipse(0, 0, 34, 78, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#2f7d8f';
  ctx.fillRect(-34, -8, 68, 10);
  ctx.fillStyle = '#1d3a5e';
  ctx.beginPath(); ctx.ellipse(0, -52, 20, 26, 0, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(180,220,255,0.7)';
  ctx.beginPath(); ctx.ellipse(-4, -56, 10, 16, 0, 0, 7); ctx.fill();
  // Registration + name on the fuselage.
  ctx.fillStyle = '#1d3a5e';
  ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('PK-SNJ', 0, 8);
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('SENJA-7', 0, 26);
  // Spinning props: blurred discs on both wings.
  for (const px of [-96, 96]) {
    ctx.fillStyle = 'rgba(60,60,70,0.35)';
    ctx.beginPath(); ctx.ellipse(px, 6, 10, 34, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#3a3a44';
    ctx.beginPath(); ctx.arc(px, 6, 6, 0, 7); ctx.fill();
  }
  // Nav lights: red left, green right, white tail — blinking.
  const blink = Math.sin(t * 6) > 0;
  if (blink) {
    ctx.fillStyle = '#ff3b30'; ctx.beginPath(); ctx.arc(-168, 18, 5, 0, 7); ctx.fill();
    ctx.fillStyle = '#35d461'; ctx.beginPath(); ctx.arc(168, 18, 5, 0, 7); ctx.fill();
  }
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 44, 3, 0, 7); ctx.fill();
  // Landing gear when down.
  if (plane.gearDown) {
    ctx.strokeStyle = '#3a3a44'; ctx.lineWidth = 4;
    for (const gx of [-20, 20]) {
      ctx.beginPath(); ctx.moveTo(gx, 52); ctx.lineTo(gx, 74); ctx.stroke();
      ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(gx, 78, 8, 0, 7); ctx.fill();
    }
  }
  ctx.restore();
}

// Weather particles: rain in the squall, ash over the volcano, fireworks
// over the festival river.
function drawParticles(ctx, world, plane, t, dt, fx) {
  const leg = world.leg;
  if (leg.event === 'squall' || plane.inStorm === 1) {
    ctx.strokeStyle = 'rgba(200,215,255,0.5)'; ctx.lineWidth = 1.5;
    for (const r of fx.rain) {
      ctx.beginPath(); ctx.moveTo(r.x, r.y); ctx.lineTo(r.x - 6, r.y + 22); ctx.stroke();
    }
  }
  if (leg.event === 'ash') {
    ctx.fillStyle = 'rgba(90,80,75,0.7)';
    for (const a of fx.ash) { ctx.fillRect(a.x, a.y, 3, 3); }
  }
  if (leg.event === 'fireworks') {
    for (const f of fx.fireworks) {
      for (const p of f.parts) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - p.age / p.life);
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }
}

// Full flight scene: sky, terrain, scenery, rings, storms, runway, plane.
export function drawScene(ctx, world, plane, t, dt, fx) {
  const pal = PALETTES[world.leg.palette];
  const pitchShift = (plane.pitch / 1400) * 40;
  ctx.save();
  ctx.translate(0, pitchShift);
  skyGradient(ctx, pal, t);
  const sunX = world.leg.palette === 'night' ? 1050 : 980;
  const sunY = world.leg.palette === 'night' ? 90 : 110;
  drawSun(ctx, pal, sunX, sunY, world.leg.palette === 'night' ? 26 : 44, world.leg.event === 'glare');
  drawRidge(ctx, pal, 11, HORIZON_Y - 6, 60, pal.ridgeFar, plane.s * 0.01);
  drawRidge(ctx, pal, 23, HORIZON_Y - 2, 44, pal.ridge, plane.s * 0.02);
  drawGround(ctx, pal, t, plane.s, world.leg.terrain);
  if (world.leg.terrain === 'islands' || world.leg.terrain === 'volcano') drawIslands(ctx, world, t, plane.s);
  if (world.leg.terrain === 'city') drawCitySkyline(ctx, world, t, plane.s);
  drawClouds(ctx, world, t);
  drawBirds(ctx, world, t);
  drawBoats(ctx, world, t, plane.s);
  drawStorms(ctx, plane, world, t);
  drawRunway(ctx, plane, world);
  drawRings(ctx, plane, world);
  ctx.restore();
  drawParticles(ctx, world, plane, t, dt, fx);
  drawPlane(ctx, plane, t);
}
