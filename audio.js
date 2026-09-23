/**
 * Logic Hunt - Web Audio Synthesizer Engine
 * High-definition procedural sound effects with zero external MP3 dependencies.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.initialized = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.initialized = true;
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.init();
    this.muted = !this.muted;
    return this.muted;
  }

  setMute(mute) {
    this.init();
    this.muted = mute;
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  // Shared helper: speak a word using Web Speech API
  speak(word, rate = 0.88, pitch = 1.1) {
    if (this.muted || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate   = rate;
    utterance.pitch  = pitch;
    utterance.volume = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const engVoice = voices.find(v => v.lang.startsWith('en-') && v.name.toLowerCase().includes('google'))
                  || voices.find(v => v.lang.startsWith('en'))
                  || null;
    if (engVoice) utterance.voice = engVoice;
    window.speechSynthesis.speak(utterance);
  }

  // 'READY?' — human voice
  playReadySound() {
    this.speak('Ready', 0.78, 1.05);
  }

  // Human voice countdown: speaks "THREE", "TWO", "ONE" using Web Speech API
  playCountdownBeep(stepNumber = 3) {
    if (this.muted) return;

    const words = { 3: 'THREE', 2: 'TWO', 1: 'ONE' };
    const word = words[stepNumber];
    if (!word || !window.speechSynthesis) return;

    // Cancel any ongoing speech first
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate   = 0.85;   // slightly slow = punchy & clear
    utterance.pitch  = 1.1;    // slight lift for energy
    utterance.volume = 1.0;

    // Try to pick an English voice if available
    const voices = window.speechSynthesis.getVoices();
    const engVoice = voices.find(v => v.lang.startsWith('en') && !v.localService === false)
                  || voices.find(v => v.lang.startsWith('en'))
                  || null;
    if (engVoice) utterance.voice = engVoice;

    window.speechSynthesis.speak(utterance);
  }

  // 'START!' — human voice + explosion synth
  playStartExplosion() {
    // Speak "Start" first, then fire explosion sound after brief delay
    this.speak('Start', 0.9, 1.15);
    if (this.muted) return;
    setTimeout(() => this._playExplosionSynth(), 280);
  }

  _playExplosionSynth() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;

    // 1. Sub Bass Riser & Impact
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(80, now);
    subOsc.frequency.exponentialRampToValueAtTime(40, now + 0.8);
    subGain.gain.setValueAtTime(0.7, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 1.2);

    // 2. Chords (A Major chord fanfare: A4, C#5, E5, A5)
    const chordNotes = [440, 554.37, 659.25, 880, 1108.73];
    chordNotes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3000, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + 1.5);

      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(0.25 / chordNotes.length, now + 0.04);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.8);
    });

    // 3. Cyber noise burst
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.1));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(2500, now);
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(now);
  }

  // Subtle warning tick / chime
  playWarningPulse() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(740, now);
    osc.frequency.exponentialRampToValueAtTime(493.88, now + 0.15);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Dramatic, grand TIME'S UP stage finish fanfare
  playTimesUpFanfare() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;

    const sequence = [
      { time: 0.0, freq: 880, dur: 0.2 },
      { time: 0.25, freq: 698.46, dur: 0.2 },
      { time: 0.5, freq: 880, dur: 0.2 },
      { time: 0.75, freq: 698.46, dur: 0.25 },
      { time: 1.05, freq: 523.25, dur: 1.8 }
    ];

    sequence.forEach(({ time, freq, dur }) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + time);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, now + time);

      gain.gain.setValueAtTime(0.001, now + time);
      gain.gain.linearRampToValueAtTime(0.35, now + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur + 0.05);
    });
  }

  playClick() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }
}

window.soundEngine = new SoundEngine();
