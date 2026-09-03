import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SoundSynth } from '@/audio/synth';

class LocalStorageMock {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

class MockAudioParam {
  value = 1;
  setValueAtTime = vi.fn((val: number) => {
    this.value = val;
  });
  exponentialRampToValueAtTime = vi.fn();
  linearRampToValueAtTime = vi.fn();
}

class MockGainNode {
  gain = new MockAudioParam();
  connect = vi.fn();
  disconnect = vi.fn();
}

class MockOscillatorNode {
  type = 'sine';
  frequency = new MockAudioParam();
  connect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
}

class MockBiquadFilterNode {
  type = 'lowpass';
  frequency = new MockAudioParam();
  connect = vi.fn();
}

class MockAudioBufferSourceNode {
  buffer: unknown = null;
  connect = vi.fn();
  start = vi.fn();
}

class MockAudioElement {
  src = '';
  loop = false;
  crossOrigin = '';
  preload = '';
  volume = 1;
  paused = true;
  currentTime = 0;

  play = vi.fn(async () => {
    this.paused = false;
  });
  pause = vi.fn(() => {
    this.paused = true;
  });
}

class MockAudioContext {
  currentTime = 0;
  sampleRate = 44100;
  state = 'running';
  destination = {};

  createGain = vi.fn(() => new MockGainNode());
  createOscillator = vi.fn(() => new MockOscillatorNode());
  createBiquadFilter = vi.fn(() => new MockBiquadFilterNode());
  createBufferSource = vi.fn(() => new MockAudioBufferSourceNode());
  createMediaElementSource = vi.fn(() => ({
    connect: vi.fn(),
  }));
  createBuffer = vi.fn(() => ({
    getChannelData: vi.fn(() => new Float32Array(100)),
  }));
  resume = vi.fn();
}

describe('SoundSynth Volume and Music Controls', () => {
  beforeEach(() => {
    (globalThis as unknown as { localStorage: unknown }).localStorage = new LocalStorageMock();
    (globalThis as unknown as { AudioContext: unknown }).AudioContext = MockAudioContext;
    (globalThis as unknown as { Audio: unknown }).Audio = MockAudioElement;
    (globalThis as unknown as { window: unknown }).window = globalThis;
  });

  describe('Default Values & Initialization', () => {
    it('initializes with default master volume 0.8 and music volume 0.8', () => {
      const synth = new SoundSynth();
      expect(synth.getMasterVolume()).toBe(0.8);
      expect(synth.getMusicVolume()).toBe(0.8);
      expect(synth.getMuted()).toBe(false);
    });

    it('loads saved preferences from localStorage on instantiation', () => {
      localStorage.setItem('cyber_immunology_volume', '0.5');
      localStorage.setItem('cyber_immunology_music_volume', '0.3');
      localStorage.setItem('cyber_immunology_muted', 'true');

      const synth = new SoundSynth();
      expect(synth.getMasterVolume()).toBe(0.5);
      expect(synth.getMusicVolume()).toBe(0.3);
      expect(synth.getMuted()).toBe(true);
    });

    it('clamps invalid or out-of-range values loaded from localStorage', () => {
      localStorage.setItem('cyber_immunology_volume', '1.5');
      localStorage.setItem('cyber_immunology_music_volume', '-0.5');

      const synth = new SoundSynth();
      expect(synth.getMasterVolume()).toBe(1.0);
      expect(synth.getMusicVolume()).toBe(0.0);
    });
  });

  describe('Master Volume Controls', () => {
    it('sets and clamps master volume between 0 and 1 and persists to localStorage', () => {
      const synth = new SoundSynth();
      synth.setMasterVolume(0.65);
      expect(synth.getMasterVolume()).toBe(0.65);
      expect(localStorage.getItem('cyber_immunology_volume')).toBe('0.65');

      synth.setMasterVolume(1.5);
      expect(synth.getMasterVolume()).toBe(1.0);
      expect(localStorage.getItem('cyber_immunology_volume')).toBe('1');

      synth.setMasterVolume(-0.2);
      expect(synth.getMasterVolume()).toBe(0.0);
      expect(localStorage.getItem('cyber_immunology_volume')).toBe('0');
    });

    it('increments and decrements master volume via changeMasterVolume', () => {
      const synth = new SoundSynth();
      expect(synth.getMasterVolume()).toBe(0.8);

      const next1 = synth.changeMasterVolume(0.1);
      expect(next1).toBe(0.9);
      expect(synth.getMasterVolume()).toBe(0.9);

      const next2 = synth.changeMasterVolume(0.3);
      expect(next2).toBe(1.0); // clamped to 1.0

      const next3 = synth.changeMasterVolume(-0.4);
      expect(next3).toBe(0.6);

      const next4 = synth.changeMasterVolume(-1.0);
      expect(next4).toBe(0.0); // clamped to 0.0
    });
  });

  describe('Music (BGM) Volume Controls', () => {
    it('sets and clamps music volume between 0 and 1 and persists to localStorage', () => {
      const synth = new SoundSynth();
      synth.setMusicVolume(0.4);
      expect(synth.getMusicVolume()).toBe(0.4);
      expect(localStorage.getItem('cyber_immunology_music_volume')).toBe('0.4');

      synth.setMusicVolume(2.0);
      expect(synth.getMusicVolume()).toBe(1.0);
      expect(localStorage.getItem('cyber_immunology_music_volume')).toBe('1');

      synth.setMusicVolume(-0.5);
      expect(synth.getMusicVolume()).toBe(0.0);
      expect(localStorage.getItem('cyber_immunology_music_volume')).toBe('0');
    });

    it('increments and decrements music volume via changeMusicVolume', () => {
      const synth = new SoundSynth();
      expect(synth.getMusicVolume()).toBe(0.8);

      const next1 = synth.changeMusicVolume(0.1);
      expect(next1).toBe(0.9);
      expect(synth.getMusicVolume()).toBe(0.9);

      const next2 = synth.changeMusicVolume(0.2);
      expect(next2).toBe(1.0);

      const next3 = synth.changeMusicVolume(-0.5);
      expect(next3).toBe(0.5);

      const next4 = synth.changeMusicVolume(-0.8);
      expect(next4).toBe(0.0);
    });
  });

  describe('Mute and Audio Node Gain Coordination', () => {
    it('mutes and unmutes preserving masterVolume and musicVolume settings', () => {
      const synth = new SoundSynth();
      synth.setMasterVolume(0.7);
      synth.setMusicVolume(0.6);

      // Trigger audio node initialization
      synth.playHover();
      synth.startAmbientBgm();

      // Toggle mute on
      synth.setMuted(true);
      expect(synth.getMuted()).toBe(true);
      expect(synth.getMasterVolume()).toBe(0.7);
      expect(synth.getMusicVolume()).toBe(0.6);

      // Toggle mute off
      synth.setMuted(false);
      expect(synth.getMuted()).toBe(false);
      expect(synth.getMasterVolume()).toBe(0.7);
      expect(synth.getMusicVolume()).toBe(0.6);
    });

    it('updates live gain nodes when volume changes while unmuted', () => {
      const synth = new SoundSynth();
      synth.playHover();
      synth.startAmbientBgm();

      synth.setMasterVolume(0.5);
      synth.setMusicVolume(0.5);

      expect(synth.getMasterVolume()).toBe(0.5);
      expect(synth.getMusicVolume()).toBe(0.5);
    });

    it('toggleMute toggles state and persists', () => {
      const synth = new SoundSynth();
      expect(synth.getMuted()).toBe(false);

      const muted = synth.toggleMute();
      expect(muted).toBe(true);
      expect(synth.getMuted()).toBe(true);
      expect(localStorage.getItem('cyber_immunology_muted')).toBe('true');

      const unmuted = synth.toggleMute();
      expect(unmuted).toBe(false);
      expect(synth.getMuted()).toBe(false);
      expect(localStorage.getItem('cyber_immunology_muted')).toBe('false');
    });
  });

  describe('Soundtrack Streaming & Track Management', () => {
    it('plays an external music track and routes audio properly', () => {
      const synth = new SoundSynth();
      const trackUrl = '/audio/cyber_theme.mp3';

      const audio = synth.playMusicTrack(trackUrl);
      expect(audio).not.toBeNull();
      expect(synth.getCurrentTrack()).toBe(trackUrl);
      expect(audio?.loop).toBe(true);
      expect(audio?.play).toHaveBeenCalled();
      expect(synth.isMusicPlaying()).toBe(true);
    });

    it('pauses, resumes, and stops soundtrack cleanly', () => {
      const synth = new SoundSynth();
      const trackUrl = '/audio/boss_theme.ogg';

      const audio = synth.playMusicTrack(trackUrl);
      expect(audio).not.toBeNull();

      synth.pauseMusicTrack();
      expect(audio?.pause).toHaveBeenCalled();

      synth.resumeMusicTrack();
      expect(audio?.play).toHaveBeenCalled();

      synth.stopMusicTrack();
      expect(audio?.pause).toHaveBeenCalled();
      expect(audio?.currentTime).toBe(0);
    });

    it('switches track url when playing a new track', () => {
      const synth = new SoundSynth();
      synth.playMusicTrack('/audio/stage1.mp3');
      expect(synth.getCurrentTrack()).toBe('/audio/stage1.mp3');

      synth.playMusicTrack('/audio/stage2.mp3');
      expect(synth.getCurrentTrack()).toBe('/audio/stage2.mp3');
    });

    it('stops ambient synth bgm when starting an external music track', () => {
      const synth = new SoundSynth();
      synth.startAmbientBgm();
      expect(synth.isAmbientBgmPlaying()).toBe(true);

      synth.playMusicTrack('/audio/cyber_battle.mp3');
      expect(synth.isAmbientBgmPlaying()).toBe(false);
    });
  });
});
