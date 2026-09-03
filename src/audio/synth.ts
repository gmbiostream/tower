export class SoundSynth {
  private ctx: AudioContext | null = null;
  private isMuted = false;
  private masterVolume = 0.8;
  private musicVolume = 0.8;
  private bgmGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isBgmPlaying = false;
  private bgmTimer: number | null = null;
  private bgmStep = 0;
  private bgmAudio: HTMLAudioElement | null = null;
  private bgmAudioTrack: string | null = null;
  private bgmSourceNode: MediaElementAudioSourceNode | null = null;

  constructor() {
    // Load mute preference from localStorage
    try {
      const savedMute = localStorage.getItem('cyber_immunology_muted');
      if (savedMute !== null) {
        this.isMuted = JSON.parse(savedMute);
      }
    } catch {
      // fallback
    }

    // Load master volume preference from localStorage
    try {
      const savedVol = localStorage.getItem('cyber_immunology_volume');
      if (savedVol !== null) {
        const parsed = parseFloat(savedVol);
        if (!isNaN(parsed)) {
          this.masterVolume = Math.max(0, Math.min(1, parsed));
        }
      }
    } catch {
      // fallback
    }

    // Load music volume preference from localStorage
    try {
      const savedMusicVol = localStorage.getItem('cyber_immunology_music_volume');
      if (savedMusicVol !== null) {
        const parsed = parseFloat(savedMusicVol);
        if (!isNaN(parsed)) {
          this.musicVolume = Math.max(0, Math.min(1, parsed));
        }
      }
    } catch {
      // fallback
    }
  }

  public initContext(): void {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    try {
      localStorage.setItem('cyber_immunology_muted', JSON.stringify(muted));
    } catch {
      // ignore
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.masterVolume, this.ctx.currentTime);
    }
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(muted ? 0 : this.musicVolume * 0.4, this.ctx.currentTime);
    }
    if (this.bgmAudio && !this.bgmSourceNode) {
      this.bgmAudio.volume = muted ? 0 : this.masterVolume * this.musicVolume;
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }

  public setMasterVolume(vol: number): void {
    const clamped = Math.max(0, Math.min(1, isNaN(vol) ? 0.8 : vol));
    this.masterVolume = clamped;
    try {
      localStorage.setItem('cyber_immunology_volume', JSON.stringify(clamped));
    } catch {
      // ignore
    }
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(clamped, this.ctx.currentTime);
    }
    if (this.bgmAudio && !this.bgmSourceNode && !this.isMuted) {
      this.bgmAudio.volume = clamped * this.musicVolume;
    }
  }

  public changeMasterVolume(delta: number): number {
    this.setMasterVolume(Math.round((this.masterVolume + delta) * 10000) / 10000);
    return this.masterVolume;
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  public setMusicVolume(vol: number): void {
    const clamped = Math.max(0, Math.min(1, isNaN(vol) ? 0.8 : vol));
    this.musicVolume = clamped;
    try {
      localStorage.setItem('cyber_immunology_music_volume', JSON.stringify(clamped));
    } catch {
      // ignore
    }
    if (this.bgmGain && this.ctx && !this.isMuted) {
      this.bgmGain.gain.setValueAtTime(clamped * 0.4, this.ctx.currentTime);
    }
    if (this.bgmAudio && !this.bgmSourceNode && !this.isMuted) {
      this.bgmAudio.volume = this.masterVolume * clamped;
    }
  }

  public changeMusicVolume(delta: number): number {
    this.setMusicVolume(Math.round((this.musicVolume + delta) * 10000) / 10000);
    return this.musicVolume;
  }

  public playHover(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.04);

    gain.gain.setValueAtTime(0.02, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  public playLaser(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playExplosion(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(80, now + 0.25);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
  }

  public playFreeze(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.18);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playKill(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(640, now + 0.08);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playLeak(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(50, now + 0.35);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playPlace(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playUpgrade(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = now + i * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.08, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.1);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.1);
    });
  }

  public playWaveStart(isFirst: boolean, isFinal: boolean): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    if (isFinal) {
      // Dramatic ominous brass stinger for Final Wave
      [110, 164.81, 220, 277.18].forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + idx * 0.08 + 0.4);

        gain.gain.setValueAtTime(0.14, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.5);
      });
    } else if (isFirst) {
      // PvZ-style bright alert stinger
      [261.63, 329.63, 392.0, 523.25].forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.12, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.35);
      });
    } else {
      // Standard wave progression chime
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.2);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.25);
    }
  }

  public playVictory(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const chords = [
      [261.63, 329.63, 392.0, 523.25], // C maj
      [293.66, 369.99, 440.0, 587.33], // D maj
      [329.63, 392.0, 493.88, 659.25], // E min
      [523.25, 659.25, 783.99, 1046.5], // C High Maj
    ];

    chords.forEach((chord, cIdx) => {
      const cTime = now + cIdx * 0.28;
      chord.forEach((freq) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, cTime);

        gain.gain.setValueAtTime(0.06, cTime);
        gain.gain.exponentialRampToValueAtTime(0.001, cTime + 0.4);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(cTime);
        osc.stop(cTime + 0.4);
      });
    });
  }

  public playDefeat(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    [329.63, 311.13, 293.66, 261.63, 220].forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = now + idx * 0.2;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.1, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.35);
    });
  }

  /**
   * Starts the looping soundtrack. Defaults to the game soundtrack MP3 (/audio/soundtrack.mp3),
   * with seamless fallback to procedural orchestral synthesis if audio files are unavailable.
   */
  public startAmbientBgm(trackSrc: string = '/audio/soundtrack.mp3'): void {
    if (this.isBgmPlaying) return;
    this.initContext();

    if (typeof Audio !== 'undefined') {
      try {
        const audio = this.playMusicTrack(trackSrc, true);
        if (audio) {
          this.isBgmPlaying = true;
          return;
        }
      } catch {
        // Fallback to procedural synth below
      }
    }

    this.startProceduralBgm();
  }

  public startProceduralBgm(): void {
    if (!this.ctx || !this.masterGain) return;
    this.isBgmPlaying = true;

    if (!this.bgmGain) {
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.connect(this.masterGain);
    }
    this.bgmGain.gain.setValueAtTime(this.isMuted ? 0 : this.musicVolume * 0.4, this.ctx.currentTime);

    // Sequence of Divinity-style modal melodies in D Dorian / A Minor
    // Notes: [D3, F3, A3, C4, D4, E4, F4, G4, A4]
    const melodyNotes = [
      220.0, 261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 523.25, 587.33, 659.25,
    ];
    const bassChords = [
      [146.83, 220.0, 293.66], // D min
      [130.81, 196.0, 261.63], // C maj
      [110.0, 164.81, 220.0],  // A min
      [174.61, 220.0, 261.63], // F maj
      [164.81, 220.0, 246.94], // E min
      [146.83, 220.0, 293.66], // D min
      [123.47, 185.0, 246.94], // B dim
      [110.0, 164.81, 220.0],  // A min
    ];

    const harpArpeggios = [
      [293.66, 349.23, 440.0, 587.33],
      [261.63, 329.63, 392.0, 523.25],
      [220.0, 261.63, 329.63, 440.0],
      [349.23, 440.0, 523.25, 698.46],
    ];

    const playStep = () => {
      if (!this.isBgmPlaying || !this.ctx || !this.bgmGain) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      const now = this.ctx.currentTime;
      const chordIdx = Math.floor(this.bgmStep / 4) % bassChords.length;
      const chord = bassChords[chordIdx]!;

      // 1. Warm cello/string sustained drone on each chord boundary
      if (this.bgmStep % 4 === 0) {
        chord.forEach((freq, fIdx) => {
          if (!this.ctx || !this.bgmGain) return;
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = fIdx === 0 ? 'sawtooth' : 'sine';
          osc.frequency.setValueAtTime(freq / 2, now);

          // Gentle string attack & slow release
          g.gain.setValueAtTime(0.001, now);
          g.gain.linearRampToValueAtTime(0.09, now + 0.3);
          g.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

          osc.connect(g);
          g.connect(this.bgmGain);
          osc.start(now);
          osc.stop(now + 1.9);
        });
      }

      // 2. Plucked lute/harp arpeggios
      const arp = harpArpeggios[this.bgmStep % harpArpeggios.length]!;
      const noteFreq = arp[this.bgmStep % arp.length]!;
      const harpOsc = this.ctx.createOscillator();
      const harpGain = this.ctx.createGain();
      harpOsc.type = 'triangle';
      harpOsc.frequency.setValueAtTime(noteFreq, now);

      harpGain.gain.setValueAtTime(0.12, now);
      harpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      harpOsc.connect(harpGain);
      harpGain.connect(this.bgmGain);
      harpOsc.start(now);
      harpOsc.stop(now + 0.45);

      // 3. Mystical woodwind / flute lead motif every alternate beat
      if (this.bgmStep % 2 === 0) {
        const leadIdx = (this.bgmStep * 3 + chordIdx) % melodyNotes.length;
        const leadFreq = melodyNotes[leadIdx]!;
        const fluteOsc = this.ctx.createOscillator();
        const fluteGain = this.ctx.createGain();
        fluteOsc.type = 'sine';
        fluteOsc.frequency.setValueAtTime(leadFreq, now + 0.08);

        fluteGain.gain.setValueAtTime(0.001, now + 0.08);
        fluteGain.gain.linearRampToValueAtTime(0.08, now + 0.18);
        fluteGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);

        fluteOsc.connect(fluteGain);
        fluteGain.connect(this.bgmGain);
        fluteOsc.start(now + 0.08);
        fluteOsc.stop(now + 0.8);
      }

      this.bgmStep++;
      this.bgmTimer = window.setTimeout(playStep, 450);
    };

    playStep();
  }

  public stopAmbientBgm(): void {
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
    this.isBgmPlaying = false;
  }

  public isAmbientBgmPlaying(): boolean {
    return this.isBgmPlaying;
  }

  /**
   * Streams an external soundtrack without loading the entire PCM buffer into memory.
   * Connects to Web Audio graph if available, with smooth fallback to HTML5 Audio element.
   */
  public playMusicTrack(src: string, loop = true): HTMLAudioElement | null {
    if (typeof Audio === 'undefined') return null;

    this.stopAmbientBgm();
    this.initContext();

    if (!this.bgmAudio) {
      this.bgmAudio = new Audio();
      this.bgmAudio.crossOrigin = 'anonymous';
      this.bgmAudio.preload = 'auto';

      if (this.ctx && this.masterGain) {
        if (!this.bgmGain) {
          this.bgmGain = this.ctx.createGain();
          this.bgmGain.connect(this.masterGain);
        }
        try {
          this.bgmSourceNode = this.ctx.createMediaElementSource(this.bgmAudio);
          this.bgmSourceNode.connect(this.bgmGain);
        } catch {
          // Fallback if media element source is restricted or unavailable
        }
      }
    }

    this.bgmAudio.loop = loop;
    if (this.bgmAudioTrack !== src) {
      this.bgmAudioTrack = src;
      this.bgmAudio.src = src;
    }

    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(this.isMuted ? 0 : this.musicVolume * 0.5, this.ctx.currentTime);
    }
    if (!this.bgmSourceNode) {
      this.bgmAudio.volume = this.isMuted ? 0 : this.masterVolume * this.musicVolume;
    }

    this.bgmAudio.play().catch(() => {
      // Handled gracefully if browser blocks unprompted autoplay
    });

    return this.bgmAudio;
  }

  public pauseMusicTrack(): void {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
  }

  public resumeMusicTrack(): void {
    if (this.bgmAudio) {
      this.bgmAudio.play().catch(() => {});
    }
  }

  public stopMusicTrack(): void {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
    }
  }

  public getCurrentTrack(): string | null {
    return this.bgmAudioTrack;
  }

  public isMusicPlaying(): boolean {
    return Boolean(this.isBgmPlaying || (this.bgmAudio && !this.bgmAudio.paused));
  }
}

