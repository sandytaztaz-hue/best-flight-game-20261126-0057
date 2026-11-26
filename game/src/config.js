// config.js — SENJA SKY COURIER: every number, leg, job, character and
// upgrade the game runs on. One file, one job: data only, no drawing, no
// physics. Change a value here and the whole game follows it.
export const W = 1280;
export const H = 720;
export const HORIZON_Y = 296;
export const TOTAL_LEGS = 6;

export const PALETTES = {
  dawn: {
    skyTop: '#2b3a6e', skyMid: '#e8824a', skyLow: '#f7c873',
    sun: '#ffd98a', groundFar: '#5d7a5a', groundNear: '#3e6b4f',
    sea: '#2f6f7e', seaDeep: '#1d4b5e', ridge: '#4a5a7d', ridgeFar: '#6b7ba0',
  },
  bay: {
    skyTop: '#274b7a', skyMid: '#e88a4f', skyLow: '#f9cf7d',
    sun: '#ffe1a0', groundFar: '#5d8a6a', groundNear: '#3f7a58',
    sea: '#2a7d8f', seaDeep: '#175263', ridge: '#3f5a86', ridgeFar: '#5f7396',
  },
  volcano: {
    skyTop: '#33284f', skyMid: '#c65a3a', skyLow: '#f09a52',
    sun: '#ffb37a', groundFar: '#6b5a4a', groundNear: '#4a4038',
    sea: '#33505e', seaDeep: '#223a46', ridge: '#4a3a52', ridgeFar: '#6b5266',
  },
  terraces: {
    skyTop: '#2c3f6e', skyMid: '#d96f45', skyLow: '#f7b96a',
    sun: '#ffcf8a', groundFar: '#6f8a4a', groundNear: '#4a7a3e',
    sea: '#2f6f7e', seaDeep: '#1d4b5e', ridge: '#54486e', ridgeFar: '#756a8e',
  },
  night: {
    skyTop: '#0d1230', skyMid: '#2a2350', skyLow: '#7a4a6e',
    sun: '#ffe9b0', groundFar: '#2a2f4a', groundNear: '#1d2438',
    sea: '#14283e', seaDeep: '#0d1a2c', ridge: '#1c2140', ridgeFar: '#2c3158',
  },
  storm: {
    skyTop: '#232c3e', skyMid: '#5a5a66', skyLow: '#8a7a5a',
    sun: '#d8c49a', groundFar: '#4a5a52', groundNear: '#36443e',
    sea: '#22404e', seaDeep: '#152c38', ridge: '#33384a', ridgeFar: '#4a5066',
  },
};

// The journey: six legs across the Kepulauan Senja archipelago. Each leg
// names its sky, its terrain, its rings, its cargo drops and its weather.
export const LEGS = [
  {
    id: 1, name: 'Pulau Awal', title: 'Dawn Rings', palette: 'dawn',
    terrain: 'islands', lengthNm: 22, ringCount: 6, dropCount: 1,
    brief: 'First light over Pulau Awal. Thread six dawn thermals, drop the medical crates on the clinic strip, and mind the fuel needle.',
    event: null, eventText: '',
    radio: [
      ['SARI', 'Senja-7, good morning. Six dawn thermals are lit over the bay. Ride them — they feed your tanks.'],
      ['RARA', 'Copy, Sari. Thermals lit, tanks thirsty. Rolling now.'],
      ['DARTO', 'Rara, that prop was rebuilt twice. Treat her gentle and she will treat you gentle.'],
    ],
  },
  {
    id: 2, name: 'Teluk Biru', title: 'Bay Delivery', palette: 'bay',
    terrain: 'sea', lengthNm: 26, ringCount: 8, dropCount: 2,
    brief: 'The fishing fleet is waiting on iced fish and airmail. Eight rings over the bay, two drops, and Budi is already bragging on the radio.',
    event: 'rival', eventText: 'RIVAL FLY-BY — Budi "Si Elang" overtakes you on the downwind leg!',
    radio: [
      ['BUDI', 'Morning, Rara! The Elang is already over the bay. Try to keep up, slowpoke.'],
      ['SARI', 'Ignore him, Senja-7. Two drops: iced fish to the fleet, airmail to the jetty.'],
      ['RARA', 'Fish and mail. Copy. Budi, save the bragging for the hangar.'],
    ],
  },
  {
    id: 3, name: 'Lembah Merapi', title: 'Volcano Valley', palette: 'volcano',
    terrain: 'volcano', lengthNm: 28, ringCount: 8, dropCount: 1,
    brief: 'Merapi is grumbling. Ash plume across the valley — ride the thermals above it, drop the volcano sensors on the ridge, do not fly through the ash.',
    event: 'ash', eventText: 'VOLCANIC ASH PLUME — the grey column eats hull. Climb above it or skirt it!',
    radio: [
      ['SARI', 'Senja-7, ash plume reported over the valley, tops at four thousand. Stay above or go around.'],
      ['LESTARI', 'Child, the sensors you carry watch the mountain for us. Fly safe, fly steady.'],
      ['RARA', 'Sensors aboard, ash in sight. I will thread the clean air, Ibu.'],
    ],
  },
  {
    id: 4, name: 'Sawah Hijau', title: 'Rice Terraces at Dusk', palette: 'terraces',
    terrain: 'terraces', lengthNm: 30, ringCount: 10, dropCount: 2,
    brief: 'Low sun over the terraces — glare on the windscreen, ten thermals to chain. School books for the hill village, coffee beans for the mill.',
    event: 'glare', eventText: 'LOW SUN GLARE — the setting sun blinds the windscreen. Trust the instruments!',
    radio: [
      ['DARTO', 'Sun is right in your eyes this leg, Rara. Instruments, not eyeballs.'],
      ['SARI', 'Ten rings, two drops. The hill village school is waiting on those books.'],
      ['RARA', 'Books and beans. Glare or not, the chain stays lit.'],
    ],
  },
  {
    id: 5, name: 'Kota Senja', title: 'Night City Festival', palette: 'night',
    terrain: 'city', lengthNm: 30, ringCount: 10, dropCount: 2,
    brief: 'Festival night over Kota Senja. Lanterns for the parade, wedding flowers for the hall — and fireworks over the river while you fly the lit course.',
    event: 'fireworks', eventText: 'FESTIVAL FIREWORKS — bursts over the river light your course. The Inspector is watching.',
    radio: [
      ['SARI', 'Senja-7, the festival is live. Fireworks over the river, lanterns aboard. Make it pretty.'],
      ['BUDI', 'Night flying, Rara? The Elang owns the night. Watch and learn.'],
      ['RARA', 'Lanterns lit, flowers fresh. Kota Senja, here comes the dusk courier.'],
    ],
  },
  {
    id: 6, name: 'Pulau Landas', title: 'Monsoon Storm Landing', palette: 'storm',
    terrain: 'islands', lengthNm: 24, ringCount: 6, dropCount: 1,
    brief: 'The monsoon is here. Squall cells march across the final leg — ride their edges for speed, never their cores. Then land on runway 09 in the rain.',
    event: 'squall', eventText: 'MONSOON SQUALL — storm cells ahead! Edge-ride them for speed, cores eat hull!',
    radio: [
      ['SARI', 'Final leg, Senja-7. Squall cells on the route. Edge them, never enter them. Runway 09 is lit.'],
      ['DARTO', 'Gear down early, speed under one-twenty, and kiss that runway like you mean it.'],
      ['RARA', 'Six rings, one drop, one wet runway. Bringing her home.'],
    ],
  },
];

// Twelve cargo jobs, one per drop slot across the campaign.
export const JOBS = [
  { id: 'med', name: 'Medical crates', client: 'Ibu Lestari', weight: '420 kg', leg: 1 },
  { id: 'fish', name: 'Iced fish', client: 'Teluk Biru fleet', weight: '610 kg', leg: 2 },
  { id: 'mail', name: 'Airmail sacks', client: 'Jetty post office', weight: '180 kg', leg: 2 },
  { id: 'sensor', name: 'Volcano sensors', client: 'Merapi observatory', weight: '240 kg', leg: 3 },
  { id: 'books', name: 'School books', client: 'Hill village school', weight: '300 kg', leg: 4 },
  { id: 'coffee', name: 'Coffee beans', client: 'Sawah mill', weight: '520 kg', leg: 4 },
  { id: 'lantern', name: 'Festival lanterns', client: 'Kota Senja parade', weight: '150 kg', leg: 5 },
  { id: 'flowers', name: 'Wedding flowers', client: 'Senja wedding hall', weight: '90 kg', leg: 5 },
  { id: 'spice', name: 'Spice crates', client: 'Old market traders', weight: '470 kg', leg: 6 },
  { id: 'radio', name: 'Rescue radio', client: 'Pulau Landas clinic', weight: '60 kg', leg: 6 },
  { id: 'batik', name: 'Batik rolls', client: 'Batik cooperative', weight: '210 kg', leg: 1 },
  { id: 'turbine', name: 'Turbine part', client: 'Island power house', weight: '380 kg', leg: 3 },
];

// Eight hangar upgrades, bought with campaign earnings between legs.
export const UPGRADES = [
  { id: 'wing', name: 'High-Lift Wing', cost: 400, desc: '+18% lift: climb faster, hold altitude on less throttle.', owned: false },
  { id: 'tank', name: 'Long-Range Tank', cost: 500, desc: '+25 max fuel: longer legs, fewer worries.', owned: false },
  { id: 'shield', name: 'Storm Shield', cost: 650, desc: 'Storm cores drain 50% less hull. Ash barely scratches.', owned: false },
  { id: 'scoop', name: 'Thermal Scoop', cost: 550, desc: 'Each thermal ring returns +8 fuel instead of +5.', owned: false },
  { id: 'turbo', name: 'Turbo Prop', cost: 800, desc: '+25 kt top speed. The Elang will eat your dust.', owned: false },
  { id: 'hull', name: 'Reinforced Hull', cost: 600, desc: '+30 max hull. Bumps, ash and bad landings forgive more.', owned: false },
  { id: 'lights', name: 'Nav Light Array', cost: 300, desc: 'Night legs glow: rings and runway read twice as far.', owned: false },
  { id: 'radio', name: 'Radio Booster', cost: 350, desc: 'Sari calls the next ring early. Combo window +4 seconds.', owned: false },
];

// The people of the archipelago. Mood and colour drive the dialog banner.
export const CHARACTERS = {
  RARA: { name: 'Capt. Ratna "Rara" Wijaya', role: 'Pilot — you', color: '#ffd166', mood: 'steady' },
  SARI: { name: 'Sari — Dispatcher', role: 'Radio, Senja Tower', color: '#7fd4ff', mood: 'warm' },
  DARTO: { name: 'Pak Darto — Hangar Chief', role: 'Mechanic & shopkeeper', color: '#ff9d6b', mood: 'gruff' },
  BUDI: { name: 'Budi "Si Elang"', role: 'Rival courier pilot', color: '#ff6b6b', mood: 'cocky' },
  LESTARI: { name: 'Ibu Lestari — Island Elder', role: 'Client, Pulau Awal', color: '#c9f29b', mood: 'kind' },
  INSPECTOR: { name: 'The Inspector', role: 'Quiet passenger, grey suit', color: '#d8d8e8', mood: 'watching' },
};

// Scoring and feel constants.
export const SCORE = {
  ringBase: 250, dropBase: 400, landingBase: 1000,
  comboWindowSec: 12, comboMax: 5, ringFuel: 5, ringFuelScoop: 8,
  smoothLandingBonus: 500, stormEdgeBoostKt: 35, stormCoreHullPerSec: 9,
  ashHullPerSec: 6, fuelBurnPerSec: 1.6, fuelBurnThrottle: 1.4,
  crashHull: 100, minLandSpeedKt: 120, maxLandAltFt: 300,
};
