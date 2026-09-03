import { describe, it, expect } from 'vitest';
import { GameEngine } from '@/core/engine';

describe('GameEngine Outcomes & Integrity', () => {
  it('leaked enemies should damage cellular integrity and trigger defeat at 0', () => {
    const engine = new GameEngine();
    engine.dispatch({ type: 'START_GAME', mapId: 'VASCULAR_RUN', difficultyId: 'ACUTE' });
    expect(engine.integrity).toBe(100);

    // Spawn an enemy directly at the end of the path
    const pathLen = engine.mapGrid.totalPathLength;
    engine.spawnEnemy('CORONA_TITAN', pathLen - 10);

    // Run ticks to let enemy cross the finish line
    for (let i = 0; i < 30; i++) {
      engine.tick(16.666);
    }

    expect(engine.integrity).toBe(74); // 100 - 26 = 74
    expect(engine.stats.coreDamageTaken).toBe(26);

    // Leak enough damage to reduce integrity to 0
    engine.integrity = 5;
    engine.spawnEnemy('INFLUENZA', pathLen - 5);
    for (let i = 0; i < 30; i++) {
      engine.tick(16.666);
    }

    expect(engine.integrity).toBe(0);
    expect(engine.phase).toBe('DEFEAT');
  });

  it('should achieve VICTORY when all waves are cleared', () => {
    const engine = new GameEngine();
    engine.dispatch({ type: 'START_GAME', mapId: 'VASCULAR_RUN', difficultyId: 'RESIDENT' });

    // Set to final wave
    engine.waveIndex = engine.totalWaves - 1;
    engine.startWave(0);

    // Clear spawn queue
    engine.spawnQueue = [];
    engine.waveState = 'ACTIVE';
    engine.enemies.clear();

    // Tick to trigger wave clear and victory
    engine.tick(16.666);

    expect(engine.phase).toBe('VICTORY');
    expect(engine.score).toBeGreaterThan(0);
  });
});
