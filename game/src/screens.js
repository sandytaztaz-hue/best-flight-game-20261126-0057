// screens.js — every screen that is not the sky: the title with its three
// save slots, the hangar shop between legs, the leg briefing, the results
// sheet with its grade and per-leg score graph, pause, crash and campaign
// complete. Drawn art throughout; buttons are real, clickable rectangles.
import { W, H, LEGS, UPGRADES, CHARACTERS } from './config.js';
import { button } from './input.js';

function dim(ctx, alpha) {
  ctx.fillStyle = `rgba(8,10,24,${alpha})`;
  ctx.fillRect(0, 0, W, H);
}

function bigTitle(ctx, text, y, size, color) {
  ctx.fillStyle = color;
  ctx.font = `bold ${size}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(text, W / 2, y);
}

function menuButton(ctx, input, x, y, w, h, label, sub, active) {
  const hover = input.mouse.x >= x && input.mouse.x <= x + w && input.mouse.y >= y && input.mouse.y <= y + h;
  ctx.fillStyle = hover || active ? '#ffd166' : 'rgba(255,255,255,0.12)';
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 10); ctx.fill();
  ctx.strokeStyle = hover || active ? '#ffd166' : 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = hover || active ? '#1a1206' : '#fff';
  ctx.font = 'bold 17px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(label, x + w / 2, y + (sub ? 26 : 33));
  if (sub) {
    ctx.fillStyle = hover || active ? '#5a4310' : '#b9c4d6';
    ctx.font = '12px sans-serif';
    ctx.fillText(sub, x + w / 2, y + 44);
  }
  return button(input, x, y, w, h);
}

// A painted dusk skyline behind the menus, so no menu is ever a bare panel.
export function drawMenuBackdrop(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#1c2450');
  g.addColorStop(0.55, '#c65a3a');
  g.addColorStop(1, '#f09a52');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // Sun low over the sea.
  const sg = ctx.createRadialGradient(640, 430, 10, 640, 430, 260);
  sg.addColorStop(0, 'rgba(255,220,150,0.9)');
  sg.addColorStop(1, 'rgba(255,200,110,0)');
  ctx.fillStyle = sg;
  ctx.fillRect(380, 170, 520, 520);
  ctx.fillStyle = '#ffe1a0';
  ctx.beginPath(); ctx.arc(640, 430, 46, 0, 7); ctx.fill();
  // Sea with a glitter path — short dashes, never a ruled grid.
  ctx.fillStyle = '#1d4b5e';
  ctx.fillRect(0, 470, W, 250);
  ctx.fillStyle = 'rgba(255,210,130,0.28)';
  for (let i = 0; i < 8; i++) {
    const y = 484 + i * 26;
    ctx.fillRect(640 - 34 - i * 6, y, 68 + i * 12, 3);
  }
  // Islands left and right, volcano smoking on the right.
  ctx.fillStyle = '#2e4a3a';
  ctx.beginPath(); ctx.ellipse(180, 500, 200, 46, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(1100, 510, 230, 52, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#4a3a30';
  ctx.beginPath();
  ctx.moveTo(980, 510); ctx.lineTo(1100, 380); ctx.lineTo(1220, 510);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(140,130,120,0.6)';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.arc(1100 + Math.sin(t + i) * 8 + i * 5, 360 - i * 20, 12 + i * 4, 0, 7); ctx.fill();
  }
  // Clouds drifting.
  ctx.fillStyle = 'rgba(255,240,220,0.8)';
  for (let i = 0; i < 6; i++) {
    const x = ((i * 260 + t * 12) % (W + 200)) - 100;
    ctx.beginPath(); ctx.ellipse(x, 90 + (i % 3) * 55, 70, 16, 0, 0, 7); ctx.fill();
  }
}

// --- Title + save slots ---------------------------------------------------
export function drawTitle(ctx, input, saves, t) {
  drawMenuBackdrop(ctx, t);
  dim(ctx, 0.18);
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('AN ORIGINAL FLIGHT GAME · THE KEPUALAUAN SENJA ARCHIPELAGO', W / 2, 108);
  bigTitle(ctx, 'SENJA', 190, 96, '#fff');
  bigTitle(ctx, 'SKY COURIER', 248, 44, '#ffd166');
  ctx.fillStyle = '#ffe9c4'; ctx.font = '17px sans-serif';
  ctx.fillText('Six legs. Twelve deliveries. One monsoon. Chain the thermals,', W / 2, 286);
  ctx.fillText('dodge the storm cells, and land her like you mean it.', W / 2, 310);
  // The crew, named, on the title — this is a game about people.
  const crew = ['RARA', 'SARI', 'DARTO', 'BUDI', 'LESTARI'];
  crew.forEach((who, i) => {
    const x = W / 2 - 260 + i * 130;
    const c = CHARACTERS[who];
    ctx.fillStyle = c.color;
    ctx.beginPath(); ctx.arc(x, 352, 22, 0, 7); ctx.fill();
    ctx.fillStyle = '#0a1020';
    ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(who[0], x, 357);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif';
    ctx.fillText(c.name.split('—')[0].trim().split(' ').slice(-1)[0], x, 388);
    ctx.fillStyle = '#b9c4d6'; ctx.font = '10px sans-serif';
    ctx.fillText(c.role.split('—')[0].trim(), x, 402);
  });
  ctx.fillStyle = '#ffd166'; ctx.font = 'bold 12px sans-serif';
  ctx.fillText('+ one quiet passenger in a grey suit. He is watching your landings.', W / 2, 428);
  // Save slots.
  ctx.fillStyle = '#fff'; ctx.font = 'bold 14px sans-serif';
  ctx.fillText('CHOOSE A SAVE SLOT', W / 2, 462);
  const actions = [];
  for (let i = 0; i < 3; i++) {
    const x = W / 2 - 330 + i * 230;
    const s = saves[i];
    const label = s ? `SLOT ${i + 1} — LEG ${s.leg + 1}/6` : `SLOT ${i + 1} — NEW FLIGHT`;
    const sub = s ? `${s.totalScore.toLocaleString()} pts · ${s.coins} coins` : 'Fresh campaign, dawn departure';
    if (menuButton(ctx, input, x, 478, 210, 58, label, sub, false)) actions.push({ type: 'slot', slot: i });
  }
  ctx.fillStyle = '#b9c4d6'; ctx.font = '13px sans-serif';
  ctx.fillText('Arrows / WASD fly · W/S throttle · SPACE drop cargo · G gear · P pause · M sound · Mouse steers', W / 2, 570);
  ctx.fillText('Chain golden thermal rings to refuel — storm edges are fast, storm cores eat hull.', W / 2, 592);
  ctx.fillStyle = '#8fa0b8'; ctx.font = '11px sans-serif';
  ctx.fillText('Senja-7 · PK-SNJ · an original game — no commercial names, art or music', W / 2, 640);
  return actions;
}

// --- Hangar / shop between legs -------------------------------------------
export function drawHangar(ctx, input, campaign, t) {
  drawMenuBackdrop(ctx, t);
  dim(ctx, 0.45);
  bigTitle(ctx, 'HANGAR — PAK DARTO’S WORKSHOP', 92, 34, '#fff');
  ctx.fillStyle = '#ffd166'; ctx.font = '16px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(`Leg ${campaign.leg + 1} of 6 next: ${LEGS[campaign.leg].name} — ${LEGS[campaign.leg].title}  ·  You hold ${campaign.coins} coins`, W / 2, 124);
  ctx.fillStyle = '#ffe9c4'; ctx.font = '14px sans-serif';
  ctx.fillText('“Spend it, Rara. A cheap plane is an expensive funeral.” — Pak Darto, hangar chief', W / 2, 150);
  const actions = [];
  UPGRADES.forEach((u, i) => {
    const col = i % 4, row = Math.floor(i / 4);
    const x = 90 + col * 285, y = 180 + row * 150;
    const owned = campaign.upgrades.has(u.id);
    const afford = campaign.coins >= u.cost;
    ctx.fillStyle = owned ? 'rgba(53,212,97,0.25)' : 'rgba(10,16,32,0.75)';
    ctx.beginPath(); ctx.roundRect(x, y, 265, 130, 10); ctx.fill();
    ctx.strokeStyle = owned ? '#35d461' : afford ? '#ffd166' : 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(u.name, x + 14, y + 28);
    ctx.fillStyle = '#cdd6e4'; ctx.font = '12px sans-serif';
    const words = u.desc.match(/.{1,38}(\s|$)/g) || [u.desc];
    words.forEach((w, wi) => ctx.fillText(w.trim(), x + 14, y + 50 + wi * 16));
    ctx.fillStyle = owned ? '#35d461' : afford ? '#ffd166' : '#8fa0b8';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(owned ? 'INSTALLED ✓' : `${u.cost} coins — click to buy`, x + 14, y + 112);
    if (!owned && afford && button(input, x, y, 265, 130)) actions.push({ type: 'buy', id: u.id });
  });
  // Crew strip: who is in the hangar with you.
  ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('IN THE HANGAR TONIGHT:', 90, 500);
  const crew = [
    ['DARTO', '“The prop is true. The tanks are full. Go.”'],
    ['SARI', '“Next leg brief is on your kneeboard. Read it.”'],
    ['RARA', '“One more leg. Then the monsoon. Then home.”'],
  ];
  crew.forEach(([who, line], i) => {
    const c = CHARACTERS[who];
    ctx.fillStyle = c.color;
    ctx.beginPath(); ctx.arc(104, 528 + i * 30, 11, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '13px sans-serif';
    ctx.fillText(`${c.name}: ${line}`, 122, 532 + i * 30);
  });
  if (menuButton(ctx, input, W / 2 - 160, 620, 320, 54, 'FLY LEG ' + (campaign.leg + 1) + '  ▶', LEGS[campaign.leg].brief.slice(0, 44) + '…', true)) {
    actions.push({ type: 'fly' });
  }
  return actions;
}

// --- Briefing, results, pause, crash, campaign ---------------------------

export function drawBriefing(ctx, input, leg, campaign) {
  dim(ctx, 0.55);
  const x = 240, y = 130, w = 800, h = 420;
  ctx.fillStyle = 'rgba(10,16,32,0.88)';
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 14); ctx.fill();
  ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#ffd166'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('SARI — SENJA TOWER · LEG BRIEFING', x + 28, y + 36);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 30px sans-serif';
  ctx.fillText(`LEG ${leg.id}/6 — ${leg.name.toUpperCase()}`, x + 28, y + 76);
  ctx.fillStyle = '#ffd166'; ctx.font = 'bold 17px sans-serif';
  ctx.fillText(leg.title, x + 28, y + 102);
  ctx.fillStyle = '#dfe6f2'; ctx.font = '15px sans-serif';
  const words = leg.brief.match(/.{1,72}(\s|$)/g) || [leg.brief];
  words.forEach((wd, i) => ctx.fillText(wd.trim(), x + 28, y + 134 + i * 22));
  const by = y + 134 + words.length * 22 + 14;
  ctx.fillStyle = '#7fd4ff'; ctx.font = 'bold 14px sans-serif';
  ctx.fillText(`Rings to chain: ${leg.ringCount}   ·   Cargo drops: ${leg.dropCount}   ·   Route: ${leg.lengthNm} nm`, x + 28, by);
  if (leg.eventText) {
    ctx.fillStyle = '#ff9d6b'; ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`WEATHER: ${leg.eventText}`, x + 28, by + 26);
  }
  ctx.fillStyle = '#9fb0c8'; ctx.font = '13px sans-serif';
  ctx.fillText(`Campaign so far: ${campaign.totalScore.toLocaleString()} pts · ${campaign.coins} coins · ${campaign.upgrades.size} upgrades installed`, x + 28, by + 56);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('Press SPACE or click TAKE OFF', W / 2, y + h - 78);
  return input.hit('Space', 'Enter')
    || menuButton(ctx, input, x + w / 2 - 130, y + h - 66, 260, 44, 'TAKE OFF  ▶', '', true);
}

export function drawResults(ctx, input, flight, world, campaign, legScores) {
  dim(ctx, 0.55);
  const x = 190, y = 84, w = 900, h = 560;
  ctx.fillStyle = 'rgba(10,16,32,0.92)';
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 14); ctx.fill();
  ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 2; ctx.stroke();
  const leg = world.leg;
  const grade = flight.grade();
  const earned = flight.earnings();
  ctx.fillStyle = '#ffd166'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'left';
  ctx.fillText(`LEG ${leg.id}/6 COMPLETE — ${leg.name.toUpperCase()}`, x + 28, y + 40);
  ctx.fillStyle = grade === 'S' ? '#ffd166' : grade === 'A' ? '#7dff9b' : '#fff';
  ctx.font = 'bold 84px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(grade, x + 130, y + 140);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif';
  ctx.fillText(grade === 'S' ? 'FLAWLESS — the Inspector nods.' : grade === 'A' ? 'FINE FLYING, CAPTAIN.' : grade === 'B' ? 'SOLID LEG. ROOM TO SHINE.' : 'LANDED. THE HANGAR WILL TALK.', x + 130, y + 168);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#dfe6f2'; ctx.font = '15px sans-serif';
  const rows = [
    ['Leg score', flight.score.toLocaleString()],
    ['Thermal rings', `${flight.ringsTaken}/${world.rings.length}`],
    ['Cargo delivered', `${flight.dropsDone}/${world.drops.length}`],
    ['Best combo', `x${Math.max(1, flight.maxCombo || 1)}`],
    ['Time', `${Math.floor(flight.timeSec)}s`],
    ['Fuel left', `${Math.round(flight.fuel)}%`],
    ['Hull left', `${Math.round(flight.hull)}%`],
    ['Earnings', `+${earned} coins`],
  ];
  rows.forEach(([k, v], i) => {
    const ry = y + 210 + i * 24;
    ctx.fillStyle = '#9fb0c8'; ctx.fillText(k, x + 280, ry);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(v, x + 560, ry);
    ctx.textAlign = 'left'; ctx.font = '15px sans-serif';
  });
  // Per-leg score graph: every leg so far as a bar.
  ctx.fillStyle = '#fff'; ctx.font = 'bold 14px sans-serif';
  ctx.fillText('CAMPAIGN SCORE BY LEG', x + 620, y + 210);
  const maxS = Math.max(1000, ...legScores);
  legScores.forEach((s, i) => {
    const bx = x + 620, by = y + 228 + i * 34;
    ctx.fillStyle = i === legScores.length - 1 ? '#ffd166' : '#7fd4ff';
    ctx.fillRect(bx, by, Math.max(6, (s / maxS) * 220), 18);
    ctx.fillStyle = '#dfe6f2'; ctx.font = '12px sans-serif';
    ctx.fillText(`L${i + 1}  ${s.toLocaleString()}`, bx + 230, by + 14);
  });
  ctx.fillStyle = '#9fb0c8'; ctx.font = '13px sans-serif';
  ctx.fillText(`Campaign total: ${campaign.totalScore.toLocaleString()} pts`, x + 620, y + 228 + legScores.length * 34 + 8);
  // Logbook line.
  const last = flight.events[flight.events.length - 1];
  if (last) {
    ctx.fillStyle = '#c9f29b'; ctx.font = 'italic 13px sans-serif';
    ctx.fillText(`Logbook: “${last.text}”`, x + 28, y + 210 + rows.length * 24 + 30);
  }
  const isLast = leg.id === 6;
  const label = isLast ? 'FINISH CAMPAIGN  ▶' : 'CONTINUE TO HANGAR  ▶';
  if (menuButton(ctx, input, x + w / 2 - 170, y + h - 66, 340, 50, label, '', true)) return 'continue';
  return null;
}

export function drawPaused(ctx, input) {
  dim(ctx, 0.6);
  bigTitle(ctx, 'PAUSED', 300, 54, '#fff');
  ctx.fillStyle = '#dfe6f2'; ctx.font = '16px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('The Senja-7 holds her course while you breathe.', W / 2, 340);
  ctx.fillText('P resume · R restart leg · M sound · Q quit to title', W / 2, 368);
  return null;
}

export function drawCrash(ctx, input, flight) {
  dim(ctx, 0.6);
  bigTitle(ctx, 'DOWN IN THE ARCHIPELAGO', 260, 40, '#ff6b6b');
  ctx.fillStyle = '#ffe9c4'; ctx.font = '17px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(flight.crashReason, W / 2, 310);
  ctx.fillStyle = '#dfe6f2'; ctx.font = '15px sans-serif';
  ctx.fillText('Pak Darto fishes the plane out, patches her up, and pretends not to lecture you.', W / 2, 344);
  ctx.fillText(`Score kept: ${flight.score.toLocaleString()} pts · the leg can be reflown.`, W / 2, 368);
  if (menuButton(ctx, input, W / 2 - 170, 420, 340, 54, 'REFLY THE LEG  ▶', '', true)) return 'retry';
  if (menuButton(ctx, input, W / 2 - 170, 490, 340, 54, 'BACK TO TITLE', '', false)) return 'title';
  return null;
}

export function drawCampaign(ctx, input, campaign, inspectorText) {
  dim(ctx, 0.55);
  const x = 190, y = 90, w = 900, h = 540;
  ctx.fillStyle = 'rgba(10,16,32,0.92)';
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 14); ctx.fill();
  ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#ffd166'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('CAMPAIGN COMPLETE — ALL SIX LEGS FLOWN', W / 2, y + 40);
  bigTitle(ctx, 'THE DUSK COURIER', y + 92, 40, '#fff');
  ctx.fillStyle = '#fff'; ctx.font = 'bold 20px sans-serif';
  ctx.fillText(`Final score: ${campaign.totalScore.toLocaleString()} pts   ·   ${campaign.totalDrops} deliveries   ·   ${campaign.coins} coins`, W / 2, y + 132);
  ctx.fillStyle = '#d8d8e8'; ctx.font = 'italic 15px sans-serif';
  const words = inspectorText.match(/.{1,86}(\s|$)/g) || [inspectorText];
  words.forEach((wd, i) => ctx.fillText(wd.trim(), W / 2, y + 172 + i * 22));
  ctx.fillStyle = '#ffd166'; ctx.font = 'bold 16px sans-serif';
  ctx.fillText(`Inspector's bonus: +${campaign.inspectorBonus} pts`, W / 2, y + 172 + words.length * 22 + 14);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 18px sans-serif';
  ctx.fillText(`GRAND TOTAL: ${(campaign.totalScore + campaign.inspectorBonus).toLocaleString()} pts`, W / 2, y + 172 + words.length * 22 + 44);
  ctx.fillStyle = '#dfe6f2'; ctx.font = '15px sans-serif';
  ctx.fillText('The archipelago is fed, the mail is delivered, and the Senja-7 is home.', W / 2, y + 172 + words.length * 22 + 76);
  ctx.fillText('Thank you for flying Senja Sky Courier.', W / 2, y + 172 + words.length * 22 + 100);
  if (menuButton(ctx, input, W / 2 - 170, y + h - 66, 340, 50, 'FLY AGAIN  ▶', '', true)) return 'again';
  return null;
}
