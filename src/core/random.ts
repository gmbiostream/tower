export interface RandomSource {
  next(): number; // [0, 1)
  nextInt(minInclusive: number, maxInclusive: number): number;
  nextFloat(min: number, max: number): number;
  getSeed(): number;
}

/**
 * Deterministic 32-bit Mulberry32 PRNG.
 */
export class Mulberry32PRNG implements RandomSource {
  private seed: number;
  private state: number;

  constructor(seed: number = 1337) {
    this.seed = seed;
    this.state = seed >>> 0;
  }

  public getSeed(): number {
    return this.seed;
  }

  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  public nextInt(minInclusive: number, maxInclusive: number): number {
    const min = Math.ceil(minInclusive);
    const max = Math.floor(maxInclusive);
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  public nextFloat(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}
