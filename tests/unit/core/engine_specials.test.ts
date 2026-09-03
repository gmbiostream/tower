import { describe, it, expect } from 'vitest';
import { GameEngine } from '@/core/engine';
import { TowerTypeId, DomainEvent, EnemyInstance } from '@/core/types';

/**
 * Sets up a game with a fully branch-upgraded tower at (0, 2),
 * adjacent to the path entry cell (0, 3) on VASCULAR_RUN.
 */
function setupBranchTower(towerTypeId: TowerTypeId, branch: 'A' | 'B', seed = 42) {
  const engine = new GameEngine();
  engine.dispatch({ type: 'START_GAME', mapId: 'VASCULAR_RUN', difficultyId: 'ACUTE', seed });
  engine.atp = 5000;

  const placeRes = engine.dispatch({ type: 'PLACE_TOWER', towerTypeId, col: 0, row: 2 });
  expect(placeRes.ok).toBe(true);
  const tower = Array.from(engine.towers.values())[0]!;

  expect(engine.dispatch({ type: 'UPGRADE_TOWER', towerId: tower.id }).ok).toBe(true);
  expect(engine.dispatch({ type: 'UPGRADE_TOWER', towerId: tower.id, branch }).ok).toBe(true);
  expect(tower.level).toBe(3);
  expect(tower.selectedBranch).toBe(branch);

  return { engine, tower };
}

/** Spawns an enemy pinned in place (baseSpeed 0) with huge HP so it survives ramping. */
function spawnAnchoredEnemy(engine: GameEngine, distance: number, hp = 1_000_000): EnemyInstance {
  const enemy = engine.spawnEnemy('INFLUENZA', distance);
  enemy.baseSpeed = 0;
  enemy.effectiveSpeed = 0;
  enemy.hp = hp;
  enemy.maxHp = hp;
  return enemy;
}

describe('Tower branch specials', () => {
  it('stores the special identifier on the tower after branch upgrade', () => {
    const { tower } = setupBranchTower('IGG', 'A');
    expect(tower.special).toBe('CRIT_CHANCE_25');
  });

  it('CRIT_CHANCE_25: IgG branch A deterministically deals occasional double-damage crits', () => {
    const { engine, tower } = setupBranchTower('IGG', 'A', 1234);
    spawnAnchoredEnemy(engine, 0);

    const damageEvents: { amount: number; isCrit?: boolean }[] = [];
    engine.events.subscribe((e: DomainEvent) => {
      if (e.type === 'ENEMY_DAMAGED') {
        damageEvents.push({ amount: e.amount, isCrit: e.isCrit });
      }
    });

    // Run 4 seconds: with ~140ms fire interval that's plenty of shots
    for (let i = 0; i < 240; i++) {
      engine.tick(16.666);
    }

    const crits = damageEvents.filter((e) => e.isCrit);
    const normals = damageEvents.filter((e) => !e.isCrit);
    expect(crits.length).toBeGreaterThan(0);
    expect(normals.length).toBeGreaterThan(0);
    // Crit deals exactly double raw damage (armor 0 on INFLUENZA)
    expect(crits[0]!.amount).toBe(tower.damage * 2);
    expect(normals[0]!.amount).toBe(tower.damage);

    // Deterministic per seed: same seed reproduces exact crit count
    const rerun = setupBranchTower('IGG', 'A', 1234);
    spawnAnchoredEnemy(rerun.engine, 0);
    const rerunCrits: number[] = [];
    rerun.engine.events.subscribe((e: DomainEvent) => {
      if (e.type === 'ENEMY_DAMAGED' && e.isCrit) rerunCrits.push(e.amount);
    });
    for (let i = 0; i < 240; i++) {
      rerun.engine.tick(16.666);
    }
    expect(rerunCrits.length).toBe(crits.length);
  });

  it('CHAIN_LIGHTNING_3: IgG branch B arcs damage to nearby secondary enemies', () => {
    const { engine } = setupBranchTower('IGG', 'B');
    // Primary (furthest along = targeted in FIRST mode) plus two chained victims within 80px
    const secondary1 = spawnAnchoredEnemy(engine, 0);
    const secondary2 = spawnAnchoredEnemy(engine, 30);
    const primary = spawnAnchoredEnemy(engine, 60);

    for (let i = 0; i < 60; i++) {
      engine.tick(16.666);
    }

    expect(primary.hp).toBeLessThan(primary.maxHp);
    // Chain victims damaged despite zero splash radius on the pulse
    expect(secondary1.hp).toBeLessThan(secondary1.maxHp);
    expect(secondary2.hp).toBeLessThan(secondary2.maxHp);
    // Falloff: nearer chain victim takes more total damage than the farther one
    expect(secondary2.maxHp - secondary2.hp).toBeGreaterThan(secondary1.maxHp - secondary1.hp);
  });

  it('ACID_POOL_DOT: IgM branch A applies a lingering DOT on splash victims', () => {
    const { engine, tower } = setupBranchTower('IGM', 'A');
    const enemy = spawnAnchoredEnemy(engine, 0);

    // Tick until the first cluster shot lands
    for (let i = 0; i < 120 && !enemy.statusEffects.some((e) => e.type === 'DOT'); i++) {
      engine.tick(16.666);
    }

    const dot = enemy.statusEffects.find((e) => e.type === 'DOT');
    expect(dot).toBeDefined();
    expect(dot!.magnitude).toBeCloseTo(tower.damage * 0.2, 5);
    expect(dot!.sourceTowerId).toBe(tower.id);

    // DOT ticks down HP over time
    const hpAfterImpact = enemy.hp;
    engine.tick(16.666);
    expect(enemy.hp).toBeLessThan(hpAfterImpact);
  });

  it('CLUSTER_FRAGMENTS_4: IgM branch B sub-explosions add extra hits around the impact', () => {
    const { engine } = setupBranchTower('IGM', 'B');
    // Two anchored enemies: impact lands on the leader; the trailer sits
    // inside both the main splash and the offset fragment blasts.
    spawnAnchoredEnemy(engine, 0);
    spawnAnchoredEnemy(engine, 37);

    const damageEvents: string[] = [];
    engine.events.subscribe((e: DomainEvent) => {
      if (e.type === 'ENEMY_DAMAGED') damageEvents.push(e.enemyId);
    });

    // Tick until the first impact resolves
    for (let i = 0; i < 120 && damageEvents.length === 0; i++) {
      engine.tick(16.666);
    }

    // Plain splash would produce exactly 2 hits (one per enemy);
    // fragments must add extra hits in the same impact tick.
    expect(damageEvents.length).toBeGreaterThanOrEqual(4);
  });

  it('SLOW_70_BRITTLE_25: IgA branch A slows by 70% and amplifies all damage by 25%', () => {
    const { engine } = setupBranchTower('IGA', 'A');
    const enemy = engine.spawnEnemy('INFLUENZA', 0);
    enemy.hp = 1_000_000;
    enemy.maxHp = 1_000_000;

    for (let i = 0; i < 20; i++) {
      engine.tick(16.666);
    }

    const slow = enemy.statusEffects.find((e) => e.type === 'SLOW');
    expect(slow).toBeDefined();
    expect(slow!.magnitude).toBe(0.7);
    expect(enemy.effectiveSpeed).toBeCloseTo(enemy.baseSpeed * 0.3, 5);

    const brittle = enemy.statusEffects.find((e) => e.type === 'BRITTLE');
    expect(brittle).toBeDefined();
    expect(brittle!.magnitude).toBe(0.25);

    // Brittle amplifies damage from ANY source by 25% (armor 0 on INFLUENZA)
    const hpBefore = enemy.hp;
    engine.applyDamageToEnemy(enemy, 100);
    expect(hpBefore - enemy.hp).toBeCloseTo(125, 5);
  });

  it('OMNI_AURA_SLOW: IgA branch B slows all enemies in range each pulse', () => {
    const { engine } = setupBranchTower('IGA', 'B');
    const enemies = [
      spawnAnchoredEnemy(engine, 0),
      spawnAnchoredEnemy(engine, 30),
      spawnAnchoredEnemy(engine, 60),
    ];

    for (let i = 0; i < 20; i++) {
      engine.tick(16.666);
    }

    for (const enemy of enemies) {
      expect(enemy.statusEffects.some((e) => e.type === 'SLOW')).toBe(true);
      expect(enemy.hp).toBeLessThan(enemy.maxHp);
    }
  });

  it('RAMP_8X_FAST: Killer-T branch A ramps past the 5x baseline cap within 2 seconds', () => {
    const { engine, tower } = setupBranchTower('KILLER_T', 'A');
    spawnAnchoredEnemy(engine, 0);

    let maxHit = 0;
    engine.events.subscribe((e: DomainEvent) => {
      if (e.type === 'ENEMY_DAMAGED') maxHit = Math.max(maxHit, e.amount);
    });

    // 2.5 seconds of lock: enough to reach the new 8x cap (spool time 2s)
    for (let i = 0; i < 150; i++) {
      engine.tick(16.666);
    }

    expect(maxHit).toBeGreaterThan(tower.damage * 5); // exceeds old 5x cap
    expect(maxHit).toBeGreaterThanOrEqual(Math.round(tower.damage * 8) * 0.98);
    expect(maxHit).toBeLessThanOrEqual(Math.round(tower.damage * 8));
  });

  it('MULTI_BEAM_3: Killer-T branch B locks and damages up to 3 targets concurrently', () => {
    const { engine, tower } = setupBranchTower('KILLER_T', 'B');
    const enemies = [
      spawnAnchoredEnemy(engine, 0),
      spawnAnchoredEnemy(engine, 30),
      spawnAnchoredEnemy(engine, 60),
      spawnAnchoredEnemy(engine, 90),
    ];

    for (let i = 0; i < 60; i++) {
      engine.tick(16.666);
    }

    expect(tower.beamLocks).toBeDefined();
    expect(tower.beamLocks!.length).toBe(3);
    const damagedCount = enemies.filter((e) => e.hp < e.maxHp).length;
    expect(damagedCount).toBe(3);
  });
});
