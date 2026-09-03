import { describe, it, expect, beforeEach } from 'vitest';
import { HighScoreManager, HighScoreRecord } from '@/persistence/highScores';

const STORAGE_KEY = 'cyber_immunology_high_scores_v1';

// Minimal localStorage mock for the node test environment
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

function makeRecord(overrides: Partial<HighScoreRecord> = {}): HighScoreRecord {
  return {
    id: `score_${Math.random().toString(36).substring(2, 9)}`,
    mapId: 'map_a',
    difficultyId: 'normal',
    score: 100,
    wavesCompleted: 5,
    totalWaves: 10,
    outcome: 'VICTORY',
    date: 'Jan 1, 12:00 PM',
    ...overrides,
  };
}

beforeEach(() => {
  (globalThis as { localStorage?: unknown }).localStorage = new LocalStorageMock();
});

describe('HighScoreManager', () => {
  describe('per-bucket trimming', () => {
    it('trims to top 20 within a single (mapId, difficultyId) bucket', () => {
      const records: HighScoreRecord[] = [];
      for (let i = 0; i < 25; i++) {
        records.push(makeRecord({ score: i }));
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));

      HighScoreManager.saveScore({
        mapId: 'map_a',
        difficultyId: 'normal',
        score: 999,
        wavesCompleted: 10,
        totalWaves: 10,
        outcome: 'VICTORY',
      });

      const scores = HighScoreManager.getScores('map_a', 'normal');
      expect(scores.length).toBe(20);
      expect(scores[0]!.score).toBe(999);
    });

    it('does not evict records from other buckets when one bucket is full', () => {
      const records: HighScoreRecord[] = [];
      // 20 high scores in map_a/normal
      for (let i = 0; i < 20; i++) {
        records.push(makeRecord({ score: 10000 + i }));
      }
      // Low scores in other buckets
      records.push(makeRecord({ mapId: 'map_b', difficultyId: 'normal', score: 1 }));
      records.push(makeRecord({ mapId: 'map_a', difficultyId: 'hard', score: 2 }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));

      HighScoreManager.saveScore({
        mapId: 'map_a',
        difficultyId: 'normal',
        score: 99999,
        wavesCompleted: 10,
        totalWaves: 10,
        outcome: 'VICTORY',
      });

      expect(HighScoreManager.getScores('map_a', 'normal').length).toBe(20);
      expect(HighScoreManager.getScores('map_b', 'normal').length).toBe(1);
      expect(HighScoreManager.getScores('map_a', 'hard').length).toBe(1);
      expect(HighScoreManager.getBestScore('map_b', 'normal')).toBe(1);
      expect(HighScoreManager.getBestScore('map_a', 'hard')).toBe(2);
    });

    it('trims each bucket independently', () => {
      const records: HighScoreRecord[] = [];
      for (let i = 0; i < 22; i++) {
        records.push(makeRecord({ mapId: 'map_b', difficultyId: 'hard', score: i }));
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));

      HighScoreManager.saveScore({
        mapId: 'map_a',
        difficultyId: 'normal',
        score: 50,
        wavesCompleted: 3,
        totalWaves: 10,
        outcome: 'DEFEAT',
      });

      expect(HighScoreManager.getScores('map_b', 'hard').length).toBe(20);
      expect(HighScoreManager.getScores('map_a', 'normal').length).toBe(1);
    });
  });

  describe('validation of stored records', () => {
    it('drops invalid entries without crashing', () => {
      const valid = makeRecord({ score: 42 });
      const corrupted = [
        valid,
        null,
        'not an object',
        123,
        {},
        { ...makeRecord(), score: 'high' }, // non-numeric score
        { ...makeRecord(), score: NaN }, // non-finite score
        { ...makeRecord(), mapId: 7 }, // non-string mapId
        { ...makeRecord(), difficultyId: undefined }, // missing difficultyId
        { ...makeRecord(), outcome: 'DRAW' }, // invalid outcome
        { mapid: 'map_a', dificultyId: 'normal', score: 5 }, // typo'd fields
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(corrupted));

      const scores = HighScoreManager.getScores();
      expect(scores.length).toBe(1);
      expect(scores[0]!.score).toBe(42);
      // UI-style access does not crash
      expect(() => scores[0]!.score.toLocaleString()).not.toThrow();
    });

    it('returns empty array for malformed JSON', () => {
      localStorage.setItem(STORAGE_KEY, '{not json');
      expect(HighScoreManager.getScores()).toEqual([]);
    });

    it('returns empty array for non-array JSON', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ foo: 'bar' }));
      expect(HighScoreManager.getScores()).toEqual([]);
    });

    it('accepts existing valid records (backward compatible)', () => {
      const records = [makeRecord({ score: 10 }), makeRecord({ score: 20, outcome: 'DEFEAT' })];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));

      const scores = HighScoreManager.getScores('map_a', 'normal');
      expect(scores.length).toBe(2);
      expect(scores[0]!.score).toBe(20);
    });
  });

  describe('saveScore', () => {
    it('persists a new record with id and date', () => {
      const rec = HighScoreManager.saveScore({
        mapId: 'map_a',
        difficultyId: 'normal',
        score: 500,
        wavesCompleted: 8,
        totalWaves: 10,
        outcome: 'DEFEAT',
      });

      expect(rec.id).toMatch(/^score_/);
      expect(typeof rec.date).toBe('string');
      expect(HighScoreManager.getBestScore('map_a', 'normal')).toBe(500);
    });
  });
});
