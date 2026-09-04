import { describe, it, expect } from 'vitest';
import { GameEngine } from '@/core/engine';

describe('GameEngine Combat Mechanics', () => {
  it('IgG should fire rapid single-target pulses at in-range enemies', () => {
    const engine = new GameEngine();
    engine.dispatch({ type: 'START_GAME', mapId: 'VASCULAR_RUN', difficultyId: 'ACUTE' });

    // Place IgG at (0, 5), directly adjacent to path entry (distance ~53px, within 120px range)
    const placeRes = engine.dispatch({
      type: 'PLACE_TOWER',
      towerTypeId: 'IGG',
      col: 0,
      row: 5,
    });
    expect(placeRes.ok).toBe(true);

    // Spawn enemy at entry (col 1, row 6)
    const enemy = engine.spawnEnemy('INFLUENZA', 0);
    const initialHp = enemy.hp;

    // Tick simulation for 600ms
    for (let i = 0; i < 40; i++) {
      engine.tick(16.666);
    }

    // Projectile should have fired and hit enemy, reducing HP
    expect(enemy.hp).toBeLessThan(initialHp);
  });

  it('IgM should deal area of effect splash damage to multiple grouped enemies', () => {
    const engine = new GameEngine();
    engine.dispatch({ type: 'START_GAME', mapId: 'VASCULAR_RUN', difficultyId: 'ACUTE' });

    // Place IgM at (0, 5)
    engine.dispatch({ type: 'PLACE_TOWER', towerTypeId: 'IGM', col: 0, row: 5 });

    // Spawn 2 enemies close together
    const enemy1 = engine.spawnEnemy('RHINOVIRUS', 0);
    const enemy2 = engine.spawnEnemy('RHINOVIRUS', 10);
    const initialHp1 = enemy1.hp;
    const initialHp2 = enemy2.hp;

    // Run ticks until projectile hits
    for (let i = 0; i < 80; i++) {
      engine.tick(16.666);
    }

    expect(enemy1.hp).toBeLessThan(initialHp1);
    expect(enemy2.hp).toBeLessThan(initialHp2);
  });

  it('IgA should apply cryogenic slow status effect to targets', () => {
    const engine = new GameEngine();
    engine.dispatch({ type: 'START_GAME', mapId: 'VASCULAR_RUN', difficultyId: 'ACUTE' });

    engine.dispatch({ type: 'PLACE_TOWER', towerTypeId: 'IGA', col: 0, row: 5 });
    const enemy = engine.spawnEnemy('INFLUENZA', 0);

    // Tick simulation
    for (let i = 0; i < 20; i++) {
      engine.tick(16.666);
    }

    expect(enemy.statusEffects.some((e) => e.type === 'SLOW')).toBe(true);
    expect(enemy.effectiveSpeed).toBeLessThan(enemy.baseSpeed);
  });

  it('Armored Virus armor should flat-reduce damage (with min 1)', () => {
    const engine = new GameEngine();
    engine.dispatch({ type: 'START_GAME', mapId: 'VASCULAR_RUN', difficultyId: 'ACUTE' });

    const titan = engine.spawnEnemy('CORONA_TITAN', 0);
    const initialHp = titan.hp;
    const armor = titan.armor;
    expect(armor).toBeGreaterThan(0);

    // Raw damage above the armor value is reduced by exactly the armor
    engine.applyDamageToEnemy(titan, armor + 4);
    expect(titan.hp).toBe(initialHp - 4);

    // Raw damage below the armor value still deals the 1 damage floor
    const curHp = titan.hp;
    engine.applyDamageToEnemy(titan, 3);
    expect(titan.hp).toBe(curHp - 1);
  });

  it('Cytokine Storm boss should split into 4 Acute Pathogens upon defeat', () => {
    const engine = new GameEngine();
    engine.dispatch({ type: 'START_GAME', mapId: 'VASCULAR_RUN', difficultyId: 'ACUTE' });

    const boss = engine.spawnEnemy('RETRO_MUTANT', 50);
    expect(engine.enemies.size).toBe(1);

    // Kill boss
    engine.applyDamageToEnemy(boss, 5000);
    engine.tick(16.666); // cleanup step runs

    // Parent removed, 4 child Rhinoviruses spawned
    expect(engine.enemies.size).toBe(4);
    for (const child of engine.enemies.values()) {
      expect(child.typeId).toBe('RHINOVIRUS');
    }
  });
});
