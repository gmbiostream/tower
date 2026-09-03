export const FIXED_TIMESTEP_MS = 1000 / 60; // ~16.666667ms per tick
export const MAX_ACCUMULATOR_MS = 250; // Cap to prevent spiral of death
const EPSILON = 0.001;

export interface ClockState {
  accumulatorMs: number;
  speedMultiplier: number;
  isPaused: boolean;
  totalTicks: number;
  totalSimulationTimeMs: number;
}

export class SimulationClock {
  private accumulatorMs = 0;
  private speedMultiplier = 1;
  private isPaused = false;
  private totalTicks = 0;
  private totalSimulationTimeMs = 0;

  constructor(initialSpeed = 1) {
    this.speedMultiplier = initialSpeed;
  }

  public getState(): ClockState {
    return {
      accumulatorMs: this.accumulatorMs,
      speedMultiplier: this.speedMultiplier,
      isPaused: this.isPaused,
      totalTicks: this.totalTicks,
      totalSimulationTimeMs: this.totalSimulationTimeMs,
    };
  }

  public setPaused(paused: boolean): void {
    this.isPaused = paused;
  }

  public togglePaused(): boolean {
    this.isPaused = !this.isPaused;
    return this.isPaused;
  }

  public setSpeed(multiplier: number): void {
    if (multiplier <= 0) return;
    this.speedMultiplier = multiplier;
  }

  public getSpeed(): number {
    return this.speedMultiplier;
  }

  public reset(): void {
    this.accumulatorMs = 0;
    this.totalTicks = 0;
    this.totalSimulationTimeMs = 0;
    this.isPaused = false;
  }

  /**
   * Advances clock by deltaMs and returns how many fixed simulation ticks should run.
   */
  public advance(deltaMs: number, tickCallback?: (tickIndex: number) => void): number {
    if (this.isPaused || deltaMs <= 0) {
      return 0;
    }

    const effectiveDelta = Math.min(deltaMs * this.speedMultiplier, MAX_ACCUMULATOR_MS);
    this.accumulatorMs += effectiveDelta;

    let ticksExecuted = 0;
    while (this.accumulatorMs >= FIXED_TIMESTEP_MS - EPSILON) {
      this.accumulatorMs = Math.max(0, this.accumulatorMs - FIXED_TIMESTEP_MS);
      this.totalTicks++;
      this.totalSimulationTimeMs += FIXED_TIMESTEP_MS;
      ticksExecuted++;

      if (tickCallback) {
        tickCallback(this.totalTicks);
      }
    }

    return ticksExecuted;
  }
}
