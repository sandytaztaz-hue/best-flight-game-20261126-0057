// audio.js — all music and sound, synthesized live with WebAudio. No audio
// files, no network: every note is an oscillator, every rumble is filtered
// noise. The engine hum follows the throttle; the dusk melody loops under
// everything; ring chimes, drop thuds and storm rumbles are one-shot SFX.
export class AudioEngine {
  constructor() {
    this.ctx = null; this.master = null; this.musicGain = null;
    this.engineOsc = null; this.engineGain = null;
    this.muted = false; this.musicTimer = null; this.step = 0;
    this.started = false;
  }

  // Call from the first user gesture (or never in screenshot mode).
  ensure() {
    if (this.started) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.16;
      this.musicGain.connect(this.master);
      // Engine hum: two detuned saws through a lowpass, gain = throttle.
      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.value = 55;
      const engineOsc2 = this.ctx.createOscillator();
      engineOsc2.type = 'sawtooth';
      engineOsc2.frequency.value = 55.7;
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 320;
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.value = 0.0;
      this.engineOsc.connect(lp); engineOsc2.connect(lp);
      lp.connect(this.engineGain); this.engineGain.connect(this.master);
      this.engineOsc.start(); engineOsc2.start();
      this.engineOsc2 = engineOsc2;
      this.started = true;
      this.startMusic();
    } catch (e) { this.started = false; }
  }

  setMuted(m) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : 0.5;
  }

  setThrottle(t) {
    if (!this.ctx || !this.engineGain) return;
    const g = 0.02 + t * 0.05;
    this.engineGain.gain.setTargetAtTime(this.muted ? 0 : g, this.ctx.currentTime, 0.1);
    this.engineOsc.frequency.setTargetAtTime(48 + t * 55, this.ctx.currentTime, 0.1);
    this.engineOsc2.frequency.setTargetAtTime(48.7 + t * 55, this.ctx.currentTime, 0.1);
  }

  // A slow dusk melody in A minor pentatonic, with a soft bass drone.
  // Sixteen steps a bar, one bar every ~2.5 seconds at 96 bpm.
  startMusic() {
    if (!this.ctx || this.musicTimer) return;
    const melody = [0, -1, 2, -1, 4, 2, 0, -1, 7, 4, 2, 0, -1, -1, 2, 4];
    const scale = [220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33];
    const bass = [110, 110, 87.31, 98];
    this.musicTimer = setInterval(() => {
      if (this.muted || !this.ctx) return;
      const bar = Math.floor(this.step / 16) % 4;
      const s = this.step % 16;
      const note = melody[s];
      if (note >= 0) this.tone(scale[note], 0.32, 'sine', 0.10, 0);
      if (s === 0) this.tone(bass[bar], 2.2, 'triangle', 0.07, 0);
      if (s === 8) this.tone(bass[bar] * 1.5, 1.1, 'triangle', 0.05, 0);
      this.step++;
    }, 156);
  }

  tone(freq, dur, type, vol, when) {
    if (!this.ctx || !this.master) return;
    const t0 = this.ctx.currentTime + (when || 0);
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(this.musicGain || this.master);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }

  // --- one-shot sound effects -------------------------------------------
  ring(combo) {
    if (!this.ctx || this.muted) return;
    const base = 660 * Math.pow(1.059, Math.min(combo, 8));
    this.tone(base, 0.5, 'sine', 0.16, 0);
    this.tone(base * 1.5, 0.6, 'sine', 0.12, 0.07);
  }
  drop() {
    if (!this.ctx || this.muted) return;
    this.tone(140, 0.25, 'sine', 0.2, 0);
    this.tone(70, 0.4, 'triangle', 0.16, 0.05);
  }
  thud() {
    if (!this.ctx || this.muted) return;
    this.tone(55, 0.5, 'sine', 0.25, 0);
  }
  click() { if (this.ctx && !this.muted) this.tone(880, 0.08, 'square', 0.05, 0); }
  fanfare() {
    if (!this.ctx || this.muted) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone(f, 0.5, 'triangle', 0.12, i * 0.11));
  }
  stormRumble() {
    if (!this.ctx || this.muted) return;
    try {
      const dur = 0.9;
      const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 220;
      const g = this.ctx.createGain();
      g.gain.value = 0.22;
      src.connect(lp); lp.connect(g); g.connect(this.master);
      src.start();
    } catch (e) { /* noise is garnish, never fatal */ }
  }
}
