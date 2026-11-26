// characters.js — the people of the archipelago: radio dialog per leg,
// reactions to what happens in the air, the pilot's logbook, and the hidden
// VIP. The Inspector rides along in silence and rates every landing; his
// verdict is the campaign's secret bonus.
import { CHARACTERS } from './config.js';

// One radio line: who speaks, what they say, and how long it stays up.
export class Radio {
  constructor() {
    this.queue = [];
    this.current = null;
    this.timer = 0;
  }

  say(who, text, dur) {
    this.queue.push({ who, text, dur: dur || 4.5 });
  }

  sayLeg(leg) {
    this.queue = [];
    leg.radio.forEach(([who, text]) => {
      this.queue.push({ who, text, dur: 4.5 });
    });
  }

  update(dt) {
    if (this.current) {
      this.timer -= dt;
      if (this.timer <= 0) this.current = null;
    }
    if (!this.current && this.queue.length) {
      this.current = this.queue.shift();
      this.timer = this.current.dur;
    }
  }

  line() { return this.current; }
}

// Reaction lines when things happen in the air.
export const REACTIONS = {
  ringStreak: [
    ['SARI', 'Three in a row — the chain is lit! Keep it burning, Senja-7.'],
    ['DARTO', 'That is how you fly a thermal line. Beautiful.'],
    ['RARA', 'Chain holding. Fuel needle is happy again.'],
  ],
  stormEdge: [
    ['RARA', 'Riding the rim — fast air out here. Hold on.'],
    ['SARI', 'Careful on that edge, Senja-7. Fast, but it bites.'],
  ],
  stormCore: [
    ['SARI', 'You are IN the cell! Get out, get out — climb or turn!'],
    ['DARTO', 'Hull is taking it, Rara. Out of there, now!'],
  ],
  dropDone: [
    ['SARI', 'Delivery confirmed. The village says thank you, Senja-7.'],
    ['LESTARI', 'It arrived safe. You fly like the old mail pilots, child.'],
  ],
  rival: [
    ['BUDI', 'Did you see that pass? That is how the Elang flies!'],
    ['RARA', 'Show-off. Save it for the hangar, Budi.'],
  ],
  lowFuel: [
    ['SARI', 'Fuel under twenty, Senja-7. Next thermal ring feeds the tanks.'],
    ['DARTO', 'Do not make me come and fetch you, Rara.'],
  ],
};

// The pilot's logbook: every leg's entry, kept across the campaign.
export class Logbook {
  constructor() { this.entries = []; }
  add(legName, text) {
    this.entries.push({ leg: legName, text, at: new Date().toLocaleTimeString() });
  }
  last(n) { return this.entries.slice(-(n || 5)); }
}

// The hidden VIP: Inspector, grey suit, window seat, notebook. He rates
// smoothness (low bank on landing), fuel discipline and deliveries.
// Revealed on leg 5; his bonus lands at the campaign end.
export class Inspector {
  constructor() { this.notes = []; this.revealed = false; }
  note(text) { this.notes.push(text); }
  reveal() {
    this.revealed = true;
    return 'The quiet man in the grey suit stands, folds his notebook, and smiles for the first time all week: "Inspector General of Island Aviation. Your landings, Captain — exemplary."';
  }
  // Bonus from 0..1500 by campaign quality.
  bonus(campaign) {
    let b = 0;
    const legs = campaign.legScores.length;
    if (legs === 0) return 0;
    const avg = campaign.legScores.reduce((a, s) => a + s, 0) / legs;
    b += Math.min(600, Math.round(avg / 10));
    b += campaign.totalDrops * 40;
    b += campaign.perfectLegs * 150;
    if (campaign.crashes === 0) b += 300;
    return Math.min(1500, b);
  }
}

export function speakerColor(who) {
  const c = CHARACTERS[who];
  return c ? c.color : '#ffffff';
}
export function speakerName(who) {
  const c = CHARACTERS[who];
  return c ? c.name : who;
}
