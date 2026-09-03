import { describe, it, expect } from 'vitest';
import { GameEngine } from '@/core/engine';

describe('GameEngine Economy & Upgrades', () => {
  it('should deduct ATP on tower placement and reject when insufficient ATP', () => {
    const engine = new GameEngine();
    engine.dispatch({ type: 'START_GAME', mapId: 'VASCULAR_RUN', difficultyId: 'ACUTE' });
    // Acute starts with 350 ATP

    const res1 = engine.dispatch({ type: 'PLACE_TOWER', towerTypeId: 'IGG', col: 0, row: 0 }); // 100 ATP
    expect(res1.ok).toBe(true);
    expect(engine.atp).toBe(250);

    const res2 = engine.dispatch({ type: 'PLACE_TOWER', towerTypeId: 'KILLER_T', col: 1, row: 0 }); // 225 ATP
    expect(res2.ok).toBe(true);
    expect(engine.atp).toBe(25);

    // Try placing another 100 ATP tower with only 25 ATP
    const res3 = engine.dispatch({ type: 'PLACE_TOWER', towerTypeId: 'IGG', col: 2, row: 0 });
    expect(res3.ok).toBe(false);
    expect(res3.ok ? '' : res3.reason).toBe('INSUFFICIENT_ATP');
  });

  it('should support Tier 1 and Branch A/B upgrades', () => {
    const engine = new GameEngine();
    engine.dispatch({ type: 'START_GAME', mapId: 'VASCULAR_RUN', difficultyId: 'ACUTE' });
    engine.atp = 1000;

    engine.dispatch({ type: 'PLACE_TOWER', towerTypeId: 'IGG', col: 0, row: 0 });
    const tower = Array.from(engine.towers.values())[0]!;
    expect(tower.level).toBe(1);
    const initialDamage = tower.damage;

    // Tier 1 upgrade (cost 75)
    const upRes1 = engine.dispatch({ type: 'UPGRADE_TOWER', towerId: tower.id });
    expect(upRes1.ok).toBe(true);
    expect(tower.level).toBe(2);
    expect(tower.damage).toBeGreaterThan(initialDamage);

    // Branch A upgrade (cost 150)
    const branchRes = engine.dispatch({ type: 'UPGRADE_TOWER', towerId: tower.id, branch: 'A' });
    expect(branchRes.ok).toBe(true);
    expect(tower.level).toBe(3);
    expect(tower.selectedBranch).toBe('A');
  });

  it('should refund 70% of total invested ATP on tower sale', () => {
    const engine = new GameEngine();
    engine.dispatch({ type: 'START_GAME', mapId: 'VASCULAR_RUN', difficultyId: 'ACUTE' });
    engine.atp = 500;

    // Place IgG (100 ATP)
    engine.dispatch({ type: 'PLACE_TOWER', towerTypeId: 'IGG', col: 0, row: 0 });
    const tower = Array.from(engine.towers.values())[0]!;

    // Upgrade Tier 1 (75 ATP) -> Total invested = 175 ATP
    engine.dispatch({ type: 'UPGRADE_TOWER', towerId: tower.id });
    expect(tower.totalInvestedAtp).toBe(175);

    const atpBeforeSell = engine.atp;
    const expectedRefund = Math.floor(175 * 0.7); // 122 ATP

    const sellRes = engine.dispatch({ type: 'SELL_TOWER', towerId: tower.id });
    expect(sellRes.ok).toBe(true);
    expect(engine.towers.size).toBe(0);
    expect(engine.atp).toBe(atpBeforeSell + expectedRefund);
  });
});
