import { describe, it, expect } from 'vitest';
import { GameEngine } from '@/core/engine';
import { TOWER_DEFINITIONS } from '@/data/towers';

describe('Performance-Based Tower Upgrades', () => {
  it('calculates performance discount based on organ integrity and veteran wave status', () => {
    const engine = new GameEngine('VASCULAR_RUN', 'ACUTE');
    engine.dispatch({ type: 'START_GAME', mapId: 'VASCULAR_RUN', difficultyId: 'ACUTE' });

    // Initial 100% integrity gives 15% discount
    const initialPerf = engine.getPerformanceDiscount();
    expect(initialPerf.discountPct).toBe(0.15);
    expect(initialPerf.efficiencyBonus).toBe(1.1);

    const baseCost = TOWER_DEFINITIONS.IGG.tier1Upgrade.cost; // 75
    const discCost = engine.getUpgradeCost(baseCost);
    expect(discCost).toBe(Math.round(75 * 0.85)); // 64
  });

  it('applies performance discount and efficiency boost during tower upgrades', () => {
    const engine = new GameEngine('VASCULAR_RUN', 'ACUTE');
    engine.dispatch({ type: 'START_GAME', mapId: 'VASCULAR_RUN', difficultyId: 'ACUTE' });

    // Place an IgG tower
    engine.dispatch({ type: 'PLACE_TOWER', towerTypeId: 'IGG', col: 0, row: 0 });
    const tower = Array.from(engine.towers.values())[0]!;

    const atpBefore = engine.atp;
    const baseCost = TOWER_DEFINITIONS.IGG.tier1Upgrade.cost; // 75
    const actualCost = engine.getUpgradeCost(baseCost); // 64

    // Upgrade to Tier 1
    const res = engine.dispatch({ type: 'UPGRADE_TOWER', towerId: tower.id });
    expect(res.ok).toBe(true);
    expect(engine.atp).toBe(atpBefore - actualCost);
    expect(tower.level).toBe(2);

    // Verify efficiency boost is factored in
    expect(tower.damage).toBe(Math.round(15 * 1.4 * 1.1));
  });

  it('scales discount dynamically if cellular integrity drops', () => {
    const engine = new GameEngine('VASCULAR_RUN', 'ACUTE');
    engine.dispatch({ type: 'START_GAME', mapId: 'VASCULAR_RUN', difficultyId: 'ACUTE' });

    // Damage integrity to 50%
    engine.integrity = 50;
    const perf = engine.getPerformanceDiscount();
    expect(perf.discountPct).toBe(0);
    expect(perf.efficiencyBonus).toBe(1.0);

    const baseCost = TOWER_DEFINITIONS.IGG.tier1Upgrade.cost;
    expect(engine.getUpgradeCost(baseCost)).toBe(baseCost);
  });
});
