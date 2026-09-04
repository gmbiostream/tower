import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '@/core/engine';
import { GameRenderer } from '@/render/gameRenderer';
import { TOWER_DEFINITIONS } from '@/data/towers';
import { TowerTypeId, UpgradeBranchId } from '@/core/types';

describe('Tower Branch Upgrade Sprite Transitions', () => {
  let engine: GameEngine;
  let renderer: GameRenderer;

  beforeEach(() => {
    engine = new GameEngine('VASCULAR_RUN', 'ACUTE', 1234);
    renderer = new GameRenderer(engine);
  });

  it('returns base tower texture key at Level 1 and Level 2 for all towers', () => {
    const towerTypes = Object.keys(TOWER_DEFINITIONS) as TowerTypeId[];
    for (const typeId of towerTypes) {
      const mockTowerL1 = {
        id: `mock_${typeId}_1`,
        typeId,
        level: 1,
        selectedBranch: null,
      } as any;
      expect(renderer.getTowerTextureKey(mockTowerL1)).toBe(`tower_${typeId}`);

      const mockTowerL2 = {
        id: `mock_${typeId}_2`,
        typeId,
        level: 2,
        selectedBranch: null,
      } as any;
      expect(renderer.getTowerTextureKey(mockTowerL2)).toBe(`tower_${typeId}`);
    }
  });

  it('switches to a distinct branch texture key for all 25 upgrade branches at Level 3', () => {
    const towerTypes = Object.keys(TOWER_DEFINITIONS) as TowerTypeId[];
    const branches: UpgradeBranchId[] = ['A', 'B', 'C', 'D', 'E'];

    for (const typeId of towerTypes) {
      for (const branch of branches) {
        const mockTowerL3 = {
          id: `mock_${typeId}_${branch}`,
          typeId,
          level: 3,
          selectedBranch: branch,
        } as any;

        const textureKey = renderer.getTowerTextureKey(mockTowerL3);
        const baseKey = `tower_${typeId}`;

        // Texture key MUST switch away from base tower key
        expect(textureKey).not.toBe(baseKey);
        expect(textureKey.startsWith('upgrade_')).toBe(true);
      }
    }
  });

  it('retains the branch upgrade texture key at Tier 4 Apex level', () => {
    const mockApex = {
      id: 'mock_apex',
      typeId: 'IGG' as TowerTypeId,
      level: 4,
      selectedBranch: 'A' as UpgradeBranchId,
    } as any;

    expect(renderer.getTowerTextureKey(mockApex)).toBe('upgrade_HYPERPULSE_BARRAGE');
  });

  it('updates tower texture key when upgrading a placed tower through the engine', () => {
    engine.dispatch({
      type: 'START_GAME',
      mapId: 'VASCULAR_RUN',
      difficultyId: 'ACUTE',
    });
    engine.atp = 1000; // ensure sufficient funds
    const placeRes = engine.dispatch({
      type: 'PLACE_TOWER',
      towerTypeId: 'IGG',
      col: 0,
      row: 0,
    });
    expect(placeRes.ok).toBe(true);

    const tower = Array.from(engine.towers.values())[0]!;
    expect(tower.level).toBe(1);
    expect(renderer.getTowerTextureKey(tower)).toBe('tower_IGG');

    // Upgrade to Tier 2 (Reinforce)
    const u1 = engine.dispatch({ type: 'UPGRADE_TOWER', towerId: tower.id });
    expect(u1.ok).toBe(true);
    expect(tower.level).toBe(2);
    expect(renderer.getTowerTextureKey(tower)).toBe('tower_IGG');

    // Upgrade to Tier 3 (Branch A: Hyperpulse Barrage)
    const u2 = engine.dispatch({ type: 'UPGRADE_TOWER', towerId: tower.id, branch: 'A' });
    expect(u2.ok).toBe(true);
    expect(tower.level).toBe(3);
    expect(tower.selectedBranch).toBe('A');
    expect(renderer.getTowerTextureKey(tower)).toBe('upgrade_HYPERPULSE_BARRAGE');
  });

  it('updates Killer T-Cell Branch A to a distinct upgrade texture key instead of base sprite', () => {
    const mockKillerA = {
      id: 'mock_kt_a',
      typeId: 'KILLER_T' as TowerTypeId,
      level: 3,
      selectedBranch: 'A' as UpgradeBranchId,
    } as any;

    const key = renderer.getTowerTextureKey(mockKillerA);
    expect(key).toBe('upgrade_KILLER_T_A');
    expect(key).not.toBe('tower_KILLER_T');
  });
});
