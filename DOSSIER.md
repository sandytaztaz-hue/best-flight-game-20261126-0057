# SENJA SKY COURIER — Dossier

An original flight game built for make.fun's **"Make the best flight game"**
bounty. Vanilla JavaScript, one HTML page, one canvas — no libraries, no
network, no build step. Open `game/index.html` from any static server in
desktop Chrome and it plays.

## The game

You are **Capt. Ratna "Rara" Wijaya**, pilot of the twin-prop courier plane
**Senja-7 (PK-SNJ)**. Across six dusk legs of the fictional **Kepulauan Senja**
archipelago you deliver cargo to island communities, chain monsoon thermals,
dodge storm cells, and land on island runways — while a quiet passenger in a
grey suit watches every landing.

## Signature mechanic — Monsoon Thermal Chaining

Golden thermal rings hang over the route. Fly through one and three things
happen at once: your fuel tank refills (+5, +8 with the Thermal Scoop
upgrade), your score multiplies (combo x2 … x5 for rings chained within 12
seconds), and the chain stays lit. **Monsoon storm cells** drift across the
route: riding a cell's **edge** is fast air (+35 kt), but its **core** tears
hull at 9 points a second. Flying is a constant decision: chase the next
ring, or skirt the weather.

## The journey — 6 legs

1. **Pulau Awal — Dawn Rings.** Tutorial: 6 rings, medical crates to the clinic.
2. **Teluk Biru — Bay Delivery.** 8 rings, iced fish + airmail, rival fly-by.
3. **Lembah Merapi — Volcano Valley.** Volcanic ash plume event, sensor drop.
4. **Sawah Hijau — Rice Terraces at Dusk.** Low-sun glare, 10 rings, books + coffee.
5. **Kota Senja — Night City Festival.** Night leg, fireworks fly-past, lanterns + flowers.
6. **Pulau Landas — Monsoon Storm Landing.** Squall cells, then a real landing on runway 09 in the rain — low, slow, centred, gear down.

Each leg ends on a runway strip; the final leg is a judged landing (smooth
landings pay a bonus). Results show a grade (S/A/B/C), a per-leg breakdown,
and a campaign score-by-leg graph.

## The people

- **Capt. Ratna "Rara" Wijaya** — you. Ex-air-force, calm under weather.
- **Sari** — dispatcher on the radio; briefs every leg, tracks the logbook.
- **Pak Darto** — hangar chief and mechanic; runs the upgrade shop, gruff + warm.
- **Budi "Si Elang"** — rival courier pilot; trash-talks on the radio, flies past in legs 2 and 5.
- **Ibu Lestari** — island elder and client for the medical-crate job.
- **The Inspector** — the hidden VIP. A quiet passenger in a grey suit who
  rates your smoothness, fuel discipline and deliveries; his secret bonus
  (up to +1,500 pts) lands at the campaign end. Revealed on leg 5.

Radio dialog runs through every leg; the logbook records each leg's story.

## Cargo — 12 jobs

Medical crates, iced fish, airmail sacks, volcano sensors, school books,
coffee beans, festival lanterns, wedding flowers, spice crates, rescue radio,
batik rolls, turbine part. Each has a named client and a marked drop zone —
press SPACE over the amber diamond to deliver.

## Upgrades — 8, bought in the hangar between legs

High-Lift Wing, Long-Range Tank, Storm Shield, Thermal Scoop, Turbo Prop,
Reinforced Hull, Nav Light Array, Radio Booster. Earnings come from leg
scores (10 pts = 1 coin).

## Events — 4, visible in frame

Monsoon squall (leg 6), volcanic ash plume (leg 3), festival fireworks
fly-past (leg 5), rival fly-by (legs 2, 5) — plus the night leg itself.
Rain, ash and fireworks are drawn live; storms drift across the route.

## Controls

Arrows / WASD pitch + bank · W/S or Shift/Ctrl throttle · SPACE drop cargo ·
G landing gear · P pause · M sound · mouse steers (hold and drag toward the
cursor) · click buttons on title, hangar and results screens.

## Screens

Title + 3 save slots · hangar/shop between legs · leg briefing · flight with
full HUD (ALT/SPD/HDG digital + compass strip, throttle/fuel/hull bars,
attitude ball, dials, route minimap, cargo manifest, radio dialog, event
banner) · results with grade + per-leg score graph · pause · crash/retry ·
campaign complete with the Inspector's reveal.

## Sound

All music and SFX are synthesized live with WebAudio — a slow A-minor
pentatonic dusk melody, an engine hum that follows the throttle, ring
chimes that rise with the combo, drop thuds, storm rumble and a landing
fanfare. No audio files.

## Source layout (game/src)

| File | Job |
|---|---|
| `config.js` | All data: palettes, legs, jobs, upgrades, characters, scoring |
| `random.js` | Seeded RNG + value noise (deterministic legs and shots) |
| `input.js` | Keyboard + mouse, edge detection, clickable buttons |
| `audio.js` | WebAudio music + SFX, synthesized, no files |
| `world.js` | Builds a leg: rings, storms, drops, runway, scenery |
| `flight.js` | Flight model + thermal chaining + storm/fuel/hull rules |
| `characters.js` | Radio dialog, reactions, logbook, the hidden Inspector |
| `render.js` | Sky, terrain, islands, volcano, city, plane, rings, storms |
| `hud.js` | Instruments: dials, compass, bars, minimap, dialog, banners |
| `screens.js` | Title, hangar, briefing, results, pause, crash, campaign |
| `shots.js` | Deterministic staged scenes for the screenshots |
| `main.js` | Boot, state machine, campaign, saves, render loop |

`main.ts` (repo root) hands the game in: it copies `game/` and
`screenshots/` to `/output` and writes `/output/dossier.json` with
`buildDossier` from `vendor/makefun-game.ts` (the kit's copy, unchanged).

## Screenshots

Four real renders of the game's own code, taken in headless Chrome:

1. `1-cover.jpg` — leg 3, volcano valley mid-flight: ash plume, thermal rings, full HUD.
2. `2-hangar.jpg` — the hangar shop between legs, 8 upgrades.
3. `3-night.jpg` — leg 5, night city festival with fireworks.
4. `4-results.jpg` — results sheet, grade S, per-leg score graph.

## How it was tested

Playtested end to end in headless Chrome: title → save slot → hangar →
briefing → flight (rings chain, fuel refills, combo climbs, storm edge
boosts speed, storm core drains hull) → cargo drops → runway → results →
next leg. All four screenshots are real renders of this code, staged with
`?shot=cover|hangar|night|results` (see `game/src/shots.js`) and shot at
1280×720. No screenshot was edited or composited.
