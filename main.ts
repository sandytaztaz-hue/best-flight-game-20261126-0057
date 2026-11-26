// main.ts — SENJA SKY COURIER hand-in (Node 22, standard library only).
//
// The game lives in this directory's game/ folder: plain static files a
// desktop browser loads offline (game/index.html and its ES modules, no
// library, no network request). This program hands it in: it copies game/
// and screenshots/ from beside this file to /output and writes
// /output/dossier.json — the summary the judge reads — with the vendored
// make.fun library (vendor/makefun-game.ts, the kit's copy, unchanged).
//
// Play it locally first: serve game/ with any static server, for example
//   python3 -m http.server 8080 --directory game
// then open http://localhost:8080 in desktop Chrome.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Fail loudly and early if the game is not where this program expects it:
// a silent empty hand-in is worse than a loud one.
if (!existsSync(join(here, 'game', 'index.html'))) {
  throw new Error('game/index.html is missing — nothing to hand in.');
}

// The scorer's own caps (from the competition rules): the whole of /output
// holds at most 1,000 entries and 64 MiB, shared by game/ (at most 993
// files and 48 MiB), screenshots/ (at most 4 files, each at most 256 KiB)
// and dossier.json. Our game is eleven small modules plus one page, and
// four screenshots — far inside every cap, with room to spare.
mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
