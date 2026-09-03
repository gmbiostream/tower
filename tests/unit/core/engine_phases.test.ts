import { describe, it, expect } from 'vitest';
import { GameEngine } from '@/core/engine';

describe('GameEngine Phases & Commands', () => {
  it('should start in MAIN_MENU and transition to PLAYING on START_GAME', () => {
    const engine = new GameEngine();
    expect(engine.phase).toBe('MAIN_MENU');

    const result = engine.dispatch({
      type: 'START_GAME',
      mapId: 'VASCULAR_RUN',
      difficultyId: 'ACUTE',
      seed: 42,
    });

    expect(result.ok).toBe(true);
    expect(engine.phase).toBe('PLAYING');
    expect(engine.atp).toBe(350);
    expect(engine.integrity).toBe(100);
    expect(engine.waveIndex).toBe(0);
  });

  it('should support pause and resume transitions', () => {
    const engine = new GameEngine();
    engine.dispatch({ type: 'START_GAME', mapId: 'VASCULAR_RUN', difficultyId: 'ACUTE' });

    engine.dispatch({ type: 'PAUSE_GAME' });
    expect(engine.phase).toBe('PAUSED');
    expect(engine.clock.getState().isPaused).toBe(true);

    engine.dispatch({ type: 'RESUME_GAME' });
    expect(engine.phase).toBe('PLAYING');
    expect(engine.clock.getState().isPaused).toBe(false);

    engine.dispatch({ type: 'TOGGLE_PAUSE' });
    expect(engine.phase).toBe('PAUSED');
  });

  it('should award early ATP and score bonuses when sending wave early', () => {
    const engine = new GameEngine();
    engine.dispatch({ type: 'START_GAME', mapId: 'VASCULAR_RUN', difficultyId: 'ACUTE' });

    const initialAtp = engine.atp;
    const initialScore = engine.score;

    expect(engine.waveState).toBe('PREPARING');
    const result = engine.dispatch({ type: 'START_WAVE_EARLY' });

    expect(result.ok).toBe(true);
    expect(engine.waveState).toBe('SPAWNING');
    expect(engine.atp).toBeGreaterThan(initialAtp);
    expect(engine.score).toBeGreaterThan(initialScore);
  });
});
