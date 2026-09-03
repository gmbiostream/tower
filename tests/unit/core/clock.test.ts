import { describe, it, expect } from 'vitest';
import { SimulationClock, FIXED_TIMESTEP_MS } from '@/core/clock';

describe('SimulationClock', () => {
  it('should run exact number of ticks for exact intervals', () => {
    const clock = new SimulationClock(1);
    let ticks = 0;
    
    // Exactly 3 timesteps
    const runCount = clock.advance(FIXED_TIMESTEP_MS * 3, () => {
      ticks++;
    });

    expect(runCount).toBe(3);
    expect(ticks).toBe(3);
    expect(clock.getState().totalTicks).toBe(3);
  });

  it('should not tick when paused', () => {
    const clock = new SimulationClock(1);
    clock.setPaused(true);
    let ticks = 0;

    const count = clock.advance(100, () => {
      ticks++;
    });

    expect(count).toBe(0);
    expect(ticks).toBe(0);
    expect(clock.getState().totalTicks).toBe(0);
  });

  it('should scale ticks with speed multiplier', () => {
    const clock1 = new SimulationClock(1);
    const clock2 = new SimulationClock(2);

    const ticks1 = clock1.advance(100);
    const ticks2 = clock2.advance(100);

    expect(ticks2).toBeGreaterThanOrEqual(ticks1 * 2 - 1);
  });

  it('should clamp accumulator to prevent death spiral after long lag', () => {
    const clock = new SimulationClock(1);
    // Simulate 5000ms freeze
    const ticks = clock.advance(5000);
    // With 250ms max accumulator, max ticks is 250 / 16.666 = 15
    expect(ticks).toBeLessThanOrEqual(16);
  });
});
