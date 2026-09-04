import { describe, it, expect } from 'vitest';
import { GameEngine } from '@/core/engine';
import { TOWER_DEFINITIONS, TOWER_DOCK_ORDER, getBranch } from '@/data/towers';
import { ENEMY_DEFINITIONS } from '@/data/enemies';
import { GAME_WAVES } from '@/data/waves';
import type { DomainEvent, TowerTypeId, UpgradeBranchId } from '@/core/types';

function startGame(seed = 7): GameEngine {
  const engine = new GameEngine();
  engine.dispatch({ type: 'START_GAME', mapId: 'VASCULAR_RUN', difficultyId: 'ACUTE', seed });
  engine.atp = 10000;
  return engine;
}

/** Pins an enemy in place with a huge HP pool so it survives sustained fire. */
function anchor(engine: GameEngine, typeId: Parameters<GameEngine['spawnEnemy']>[0], distance: number) {
  const enemy = engine.spawnEnemy(typeId, distance);
  enemy.baseSpeed = 0;
  enemy.effectiveSpeed = 0;
  enemy.hp = 1_000_000;
  enemy.maxHp = 1_000_000;
  return enemy;
}

describe('Five-branch specialization tree', () => {
  it('every tower defines exactly five branches with ids A..E and apex tiers', () => {
    for (const def of Object.values(TOWER_DEFINITIONS)) {
      expect(def.branches.map((b) => b.id)).toEqual(['A', 'B', 'C', 'D', 'E']);
      for (const branch of def.branches) {
        expect(branch.cost).toBeGreaterThan(0);
        expect(branch.apex.cost).toBeGreaterThan(0);
        expect(branch.apex.damageMultiplier).toBeGreaterThan(1);
      }
    }
  });

  it.each(['A', 'B', 'C', 'D', 'E'] as UpgradeBranchId[])(
    'branch %s can be selected at tier 3 and its own apex applies at tier 4',
    (branchId) => {
      const engine = startGame();
      expect(engine.dispatch({ type: 'PLACE_TOWER', towerTypeId: 'IGG', col: 0, row: 5 }).ok).toBe(true);
      const tower = [...engine.towers.values()][0]!;
      const def = TOWER_DEFINITIONS.IGG;
      const branch = getBranch(def, branchId)!;

      expect(engine.dispatch({ type: 'UPGRADE_TOWER', towerId: tower.id }).ok).toBe(true);
      expect(engine.dispatch({ type: 'UPGRADE_TOWER', towerId: tower.id, branch: branchId }).ok).toBe(true);
      expect(tower.level).toBe(3);
      expect(tower.selectedBranch).toBe(branchId);
      expect(tower.special).toBe(branch.special);

      const atpBefore = engine.atp;
      const dmgBefore = tower.damage;
      expect(engine.dispatch({ type: 'UPGRADE_TOWER', towerId: tower.id }).ok).toBe(true);
      expect(tower.level).toBe(4);
      expect(atpBefore - engine.atp).toBe(engine.getUpgradeCost(branch.apex.cost));
      expect(tower.damage).toBeGreaterThan(dmgBefore);

      expect(engine.dispatch({ type: 'UPGRADE_TOWER', towerId: tower.id }).ok).toBe(false);
    }
  );

  it('rejects an unknown branch id', () => {
    const engine = startGame();
    engine.dispatch({ type: 'PLACE_TOWER', towerTypeId: 'IGA', col: 0, row: 5 });
    const tower = [...engine.towers.values()][0]!;
    engine.dispatch({ type: 'UPGRADE_TOWER', towerId: tower.id });
    const res = engine.dispatch({ type: 'UPGRADE_TOWER', towerId: tower.id, branch: 'Z' as UpgradeBranchId });
    expect(res.ok).toBe(false);
    expect(tower.level).toBe(2);
  });

  it('CRYO_CONTROL on a projectile tower slows victims on impact', () => {
    const engine = startGame();
    engine.dispatch({ type: 'PLACE_TOWER', towerTypeId: 'IGM', col: 0, row: 5 });
    const tower = [...engine.towers.values()][0]!;
    engine.dispatch({ type: 'UPGRADE_TOWER', towerId: tower.id });
    engine.dispatch({ type: 'UPGRADE_TOWER', towerId: tower.id, branch: 'C' });
    expect(tower.special).toBe('CRYO_CONTROL');

    const enemy = anchor(engine, 'INFLUENZA', 0);
    for (let i = 0; i < 150 && !enemy.statusEffects.some((e) => e.type === 'SLOW'); i++) {
      engine.tick(16.666);
    }
    const slow = enemy.statusEffects.find((e) => e.type === 'SLOW');
    expect(slow).toBeDefined();
    expect(slow!.magnitude).toBe(0.3);
  });

  it('CORROSIVE_ACID on the Killer-T beam leaves a lingering DOT', () => {
    const engine = startGame();
    engine.dispatch({ type: 'PLACE_TOWER', towerTypeId: 'KILLER_T', col: 0, row: 5 });
    const tower = [...engine.towers.values()][0]!;
    engine.dispatch({ type: 'UPGRADE_TOWER', towerId: tower.id });
    engine.dispatch({ type: 'UPGRADE_TOWER', towerId: tower.id, branch: 'D' });
    expect(tower.special).toBe('CORROSIVE_ACID');

    const enemy = anchor(engine, 'INFLUENZA', 0);
    for (let i = 0; i < 30; i++) engine.tick(16.666);
    const dot = enemy.statusEffects.find((e) => e.type === 'DOT');
    expect(dot).toBeDefined();
    expect(dot!.sourceTowerId).toBe(tower.id);
  });
});

describe('Thermal immunity & the Macrophage counter', () => {
  it('heat-shielded pathogens are defined as THERMAL-immune and scheduled in late waves', () => {
    expect(ENEMY_DEFINITIONS.HEATSHOCK_CARRIER.immunities).toContain('THERMAL');
    expect(ENEMY_DEFINITIONS.RETRO_MUTANT.immunities).toContain('THERMAL');
    const firstCarrierWave = GAME_WAVES.find((w) => w.groups.some((g) => g.enemyTypeId === 'HEATSHOCK_CARRIER'))!;
    expect(firstCarrierWave.waveNumber).toBeGreaterThan(TOWER_DEFINITIONS.MACROPHAGE.unlockWave!);
  });

  it('thermal damage is fully deflected by an immune pathogen and reported as immune', () => {
    const engine = startGame();
    const carrier = engine.spawnEnemy('HEATSHOCK_CARRIER', 0);
    const hp = carrier.hp;
    const events: DomainEvent[] = [];
    engine.events.subscribe((e) => events.push(e));

    engine.applyDamageToEnemy(carrier, 500, undefined, false, 'THERMAL');
    expect(carrier.hp).toBe(hp);
    const dmg = events.find((e) => e.type === 'ENEMY_DAMAGED') as { amount: number; immune?: boolean };
    expect(dmg.amount).toBe(0);
    expect(dmg.immune).toBe(true);

    // Non-thermal channels still land
    engine.applyDamageToEnemy(carrier, 500, undefined, false, 'KINETIC');
    expect(carrier.hp).toBeLessThan(hp);
  });

  it('Killer-T never locks onto a heat-shielded target while a valid target exists, and never damages one', () => {
    const engine = startGame();
    engine.dispatch({ type: 'PLACE_TOWER', towerTypeId: 'KILLER_T', col: 0, row: 5 });
    const tower = [...engine.towers.values()][0]!;

    // Carrier is further along the path AND stronger, so it would win both targeting modes if eligible
    const carrier = anchor(engine, 'HEATSHOCK_CARRIER', 40);
    const agent = anchor(engine, 'INFLUENZA', 0);
    agent.hp = 500_000;
    agent.maxHp = 500_000;

    for (let i = 0; i < 60; i++) engine.tick(16.666);

    expect(tower.targetId).toBe(agent.id);
    expect(carrier.hp).toBe(carrier.maxHp);
    expect(agent.hp).toBeLessThan(agent.maxHp);
  });

  it('Killer-T idles rather than firing when only immune pathogens are in range', () => {
    const engine = startGame();
    engine.dispatch({ type: 'PLACE_TOWER', towerTypeId: 'KILLER_T', col: 0, row: 5 });
    const tower = [...engine.towers.values()][0]!;
    const carrier = anchor(engine, 'HEATSHOCK_CARRIER', 0);

    for (let i = 0; i < 60; i++) engine.tick(16.666);

    expect(tower.targetId).toBeNull();
    expect(carrier.hp).toBe(carrier.maxHp);
  });

  it('Macrophage is locked until its unlock wave, then unlocks with an event', () => {
    const engine = startGame();
    expect(engine.isTowerUnlocked('MACROPHAGE')).toBe(false);
    const locked = engine.dispatch({ type: 'PLACE_TOWER', towerTypeId: 'MACROPHAGE', col: 0, row: 5 });
    expect(locked.ok).toBe(false);
    expect(locked).toMatchObject({ reason: 'TOWER_LOCKED' });

    const unlocks: TowerTypeId[] = [];
    engine.events.subscribe((e) => {
      if (e.type === 'TOWER_UNLOCKED') unlocks.push(e.towerTypeId);
    });

    // Clear waves by force until the unlock wave is prepared
    const unlockWave = TOWER_DEFINITIONS.MACROPHAGE.unlockWave!;
    while (engine.waveIndex + 1 < unlockWave) {
      engine.dispatch({ type: 'START_WAVE_EARLY' });
      // Drain the spawn queue then wipe the field so the wave clears
      while (engine.waveState === 'SPAWNING') engine.tick(16.666);
      for (const enemy of engine.enemies.values()) {
        enemy.isDead = true;
      }
      engine.tick(16.666);
    }

    expect(unlocks).toEqual(['MACROPHAGE']);
    expect(engine.isTowerUnlocked('MACROPHAGE')).toBe(true);
    expect(engine.dispatch({ type: 'PLACE_TOWER', towerTypeId: 'MACROPHAGE', col: 0, row: 5 }).ok).toBe(true);
  });

  it('restarting a game re-locks wave-gated towers', () => {
    const engine = startGame();
    engine.unlockedTowers.add('MACROPHAGE');
    engine.dispatch({ type: 'RESTART_GAME' });
    expect(engine.isTowerUnlocked('MACROPHAGE')).toBe(false);
    expect(engine.isTowerUnlocked('IGG')).toBe(true);
  });

  it('Macrophage globs ignore armor and damage heat-shielded pathogens', () => {
    const engine = startGame();
    engine.unlockedTowers.add('MACROPHAGE');
    expect(engine.dispatch({ type: 'PLACE_TOWER', towerTypeId: 'MACROPHAGE', col: 0, row: 5 }).ok).toBe(true);
    const tower = [...engine.towers.values()][0]!;

    const carrier = anchor(engine, 'HEATSHOCK_CARRIER', 0);
    carrier.armor = 50;

    const hits: number[] = [];
    engine.events.subscribe((e) => {
      if (e.type === 'ENEMY_DAMAGED' && e.enemyId === carrier.id) hits.push(e.amount);
    });

    for (let i = 0; i < 180 && hits.length === 0; i++) engine.tick(16.666);

    expect(hits.length).toBeGreaterThan(0);
    // Armor (50) would otherwise cut a 70-damage glob to 20; phagocytic damage bypasses it entirely
    expect(hits[0]).toBe(tower.damage);
  });

  it('Opsonin Tag branch makes engulfed targets brittle', () => {
    const engine = startGame();
    engine.unlockedTowers.add('MACROPHAGE');
    engine.dispatch({ type: 'PLACE_TOWER', towerTypeId: 'MACROPHAGE', col: 0, row: 5 });
    const tower = [...engine.towers.values()][0]!;
    engine.dispatch({ type: 'UPGRADE_TOWER', towerId: tower.id });
    engine.dispatch({ type: 'UPGRADE_TOWER', towerId: tower.id, branch: 'A' });
    expect(tower.special).toBe('OPSONIZE_BRITTLE_30');

    const enemy = anchor(engine, 'CORONA_TITAN', 0);
    for (let i = 0; i < 180 && !enemy.statusEffects.some((e) => e.type === 'BRITTLE'); i++) {
      engine.tick(16.666);
    }
    const brittle = enemy.statusEffects.find((e) => e.type === 'BRITTLE');
    expect(brittle).toBeDefined();
    expect(brittle!.magnitude).toBe(0.3);
  });
});

describe('Tower dock ordering', () => {
  it('places the Cryo-Tether before the Cluster Cannon and lists all five towers', () => {
    expect(TOWER_DOCK_ORDER.indexOf('IGA')).toBeLessThan(TOWER_DOCK_ORDER.indexOf('IGM'));
    expect([...TOWER_DOCK_ORDER].sort()).toEqual((Object.keys(TOWER_DEFINITIONS) as TowerTypeId[]).sort());
  });
});
