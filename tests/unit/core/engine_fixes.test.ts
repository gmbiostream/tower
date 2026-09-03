import { describe, it, expect } from 'vitest';
import { GameEngine } from '@/core/engine';
import type { DomainEvent } from '@/core/types';

describe('GameEngine Core Bug Fixes', () => {
  it('OPEN_LEVEL_SELECT should emit PHASE_CHANGED with the previous phase as `from`', () => {
    const engine = new GameEngine();
    const events: DomainEvent[] = [];
    engine.events.subscribe((e) => events.push(e));

    engine.dispatch({ type: 'OPEN_LEVEL_SELECT' });

    const phaseEvent = events.find((e) => e.type === 'PHASE_CHANGED');
    expect(phaseEvent).toBeDefined();
    expect(phaseEvent).toMatchObject({ from: 'MAIN_MENU', to: 'LEVEL_SELECT' });
  });

  it('splash damage should not hit split children spawned by the same hit', () => {
    const engine = new GameEngine();
    engine.dispatch({ type: 'START_GAME', mapId: 'VASCULAR_RUN', difficultyId: 'ACUTE' });

    engine.dispatch({ type: 'PLACE_TOWER', towerTypeId: 'IGM', col: 0, row: 5 });

    const boss = engine.spawnEnemy('RETRO_MUTANT', 0);
    boss.hp = 1;
    boss.baseSpeed = 0;

    // Tick until the splash projectile kills the boss
    for (let i = 0; i < 120 && !boss.isDead; i++) {
      engine.tick(16.666);
    }
    expect(boss.isDead).toBe(true);

    // 4 Rhinovirus children spawn inside the splash radius; they must be unhurt
    const children = [...engine.enemies.values()].filter((e) => e.typeId === 'RHINOVIRUS');
    expect(children.length).toBe(4);
    for (const child of children) {
      expect(child.isDead).toBe(false);
      expect(child.hp).toBe(child.maxHp);
    }
  });

  it('simulation should stop mutating state within the tick that triggers DEFEAT', () => {
    const engine = new GameEngine();
    engine.dispatch({ type: 'START_GAME', mapId: 'VASCULAR_RUN', difficultyId: 'ACUTE' });

    // Beam tower with a near-dead enemy in range: pre-fix it would score a
    // kill in the same tick after GAME_DEFEAT was already emitted
    engine.dispatch({ type: 'PLACE_TOWER', towerTypeId: 'KILLER_T', col: 0, row: 5 });
    const victim = engine.spawnEnemy('INFLUENZA', 0);
    victim.hp = 1;
    victim.baseSpeed = 0;

    // Leaker that reduces integrity to 0 on this tick (80 px/s => ~1.3 px/tick)
    const pathLen = engine.mapGrid.totalPathLength;
    engine.spawnEnemy('INFLUENZA', pathLen - 1);
    engine.integrity = 5;

    const events: DomainEvent[] = [];
    engine.events.subscribe((e) => events.push(e));

    engine.tick(16.666);

    expect(engine.phase).toBe('DEFEAT');
    const defeatIndex = events.findIndex((e) => e.type === 'GAME_DEFEAT');
    expect(defeatIndex).toBeGreaterThanOrEqual(0);
    const finalScore = (events[defeatIndex] as { finalScore: number }).finalScore;

    // No score/ATP/kill events after defeat, in this tick or later ones
    for (let i = 0; i < 10; i++) {
      engine.tick(16.666);
    }
    const after = events.slice(defeatIndex + 1);
    expect(
      after.filter((e) =>
        e.type === 'ATP_CHANGED' || e.type === 'SCORE_CHANGED' || e.type === 'ENEMY_DEFEATED'
      )
    ).toEqual([]);
    expect(victim.isDead).toBe(false);
    expect(engine.score).toBe(finalScore);
  });

  it('Killer-T should keep its beam lock while the target is alive and in range', () => {
    const engine = new GameEngine();
    engine.dispatch({ type: 'START_GAME', mapId: 'VASCULAR_RUN', difficultyId: 'ACUTE' });

    engine.dispatch({ type: 'PLACE_TOWER', towerTypeId: 'KILLER_T', col: 0, row: 2 });
    const tower = [...engine.towers.values()][0]!;

    // Two stationary in-range targets; A is barely the strongest
    const enemyA = engine.spawnEnemy('INFLUENZA', 0);
    enemyA.hp = 1510;
    enemyA.maxHp = 1510;
    enemyA.baseSpeed = 0;
    const enemyB = engine.spawnEnemy('INFLUENZA', 40);
    enemyB.hp = 1500;
    enemyB.maxHp = 1500;
    enemyB.baseSpeed = 0;

    // Run 2 seconds: A drops below B's HP quickly, but the lock must hold
    for (let i = 0; i < 120; i++) {
      engine.tick(16.666);
    }

    expect(enemyA.hp).toBeLessThan(enemyB.hp);
    expect(tower.targetId).toBe(enemyA.id);
    expect(tower.beamLockDurationMs).toBeGreaterThan(1500);
    expect(enemyB.hp).toBe(1500);
  });

  it('DoT-killed enemies should die before moving or leaking in the same tick', () => {
    const engine = new GameEngine();
    engine.dispatch({ type: 'START_GAME', mapId: 'VASCULAR_RUN', difficultyId: 'ACUTE' });
    const startIntegrity = engine.integrity;

    const pathLen = engine.mapGrid.totalPathLength;
    const enemy = engine.spawnEnemy('INFLUENZA', pathLen - 0.5);
    enemy.hp = 1;
    enemy.statusEffects.push({
      id: 'test_dot',
      type: 'DOT',
      magnitude: 100000,
      durationMs: 1000,
      remainingMs: 1000,
    });

    engine.tick(16.666);

    expect(enemy.isDead).toBe(true);
    expect(enemy.isLeaked).toBe(false);
    expect(engine.integrity).toBe(startIntegrity);
  });

  it('IgA should refresh its slow effect instead of stacking duplicates', () => {
    const engine = new GameEngine();
    engine.dispatch({ type: 'START_GAME', mapId: 'VASCULAR_RUN', difficultyId: 'ACUTE' });

    engine.dispatch({ type: 'PLACE_TOWER', towerTypeId: 'IGA', col: 0, row: 5 });

    const enemy = engine.spawnEnemy('CORONA_TITAN', 0);
    enemy.baseSpeed = 0;
    enemy.hp = 100000;
    enemy.maxHp = 100000;

    // Run 1.5s so the tower fires several times
    for (let i = 0; i < 90; i++) {
      engine.tick(16.666);
    }

    const slows = enemy.statusEffects.filter((e) => e.type === 'SLOW');
    expect(slows.length).toBe(1);
    expect(slows[0]!.remainingMs).toBeGreaterThan(0);
  });
});
