import { describe, it, expect } from 'vitest';
import { Mulberry32PRNG } from '@/core/random';

describe('Mulberry32PRNG', () => {
  it('should generate identical sequence for identical seeds', () => {
    const rng1 = new Mulberry32PRNG(42);
    const rng2 = new Mulberry32PRNG(42);

    const seq1 = Array.from({ length: 10 }, () => rng1.next());
    const seq2 = Array.from({ length: 10 }, () => rng2.next());

    expect(seq1).toEqual(seq2);
  });

  it('should generate different sequences for different seeds', () => {
    const rng1 = new Mulberry32PRNG(42);
    const rng2 = new Mulberry32PRNG(999);

    const seq1 = Array.from({ length: 10 }, () => rng1.next());
    const seq2 = Array.from({ length: 10 }, () => rng2.next());

    expect(seq1).not.toEqual(seq2);
  });

  it('should generate integers within specified range inclusive', () => {
    const rng = new Mulberry32PRNG(12345);
    for (let i = 0; i < 100; i++) {
      const val = rng.nextInt(5, 10);
      expect(val).toBeGreaterThanOrEqual(5);
      expect(val).toBeLessThanOrEqual(10);
      expect(Number.isInteger(val)).toBe(true);
    }
  });
});
