import {
  GamePhase,
  DifficultyId,
  MapId,
  EnemyTypeId,
  TowerTypeId,
  DamageType,
  BuildabilityCheckResult,
  EnemyInstance,
  TowerInstance,
  ProjectileInstance,
  SpawnQueueItem,
  GameCommand,
  CommandResult,
  SessionStats,
  DifficultyModifiers,
} from './types';
import { SimulationClock, FIXED_TIMESTEP_MS } from './clock';
import { Mulberry32PRNG, RandomSource } from './random';
import { EventBus } from './events';
import { MapGrid } from './map';
import { ALL_MAPS, VASCULAR_RUN_MAP } from '@/data/maps';
import { DIFFICULTY_MODIFIERS } from '@/data/difficulties';
import { TOWER_DEFINITIONS, getBranch } from '@/data/towers';
import { ENEMY_DEFINITIONS } from '@/data/enemies';
import { GAME_WAVES } from '@/data/waves';
import { SoundSynth } from '@/audio/synth';

export class GameEngine {
  public phase: GamePhase = 'MAIN_MENU';
  public mapGrid: MapGrid;
  public difficulty: DifficultyModifiers;
  public clock: SimulationClock;
  public rng: RandomSource;
  public events: EventBus;

  public atp = 350;
  public integrity = 100;
  public score = 0;

  public waveIndex = 0; // 0-indexed into GAME_WAVES
  public totalWaves = GAME_WAVES.length;
  public waveState: 'PREPARING' | 'SPAWNING' | 'ACTIVE' | 'CLEARED' = 'PREPARING';
  public waveCountdownMs = 12000;
  public waveElapsedMs = 0;

  public towers: Map<string, TowerInstance> = new Map();
  public enemies: Map<string, EnemyInstance> = new Map();
  public projectiles: ProjectileInstance[] = [];
  public spawnQueue: SpawnQueueItem[] = [];

  public selectedTowerId: string | null = null;
  public stats: SessionStats;
  /** Towers currently purchasable; wave-gated towers join this set as the game progresses. */
  public unlockedTowers: Set<TowerTypeId> = new Set();

  private nextEntityId = 1;
  private currentMapId: MapId = 'VASCULAR_RUN';
  private currentDifficultyId: DifficultyId = 'ACUTE';
  private currentSeed = 1337;
  private soundSynth?: SoundSynth;

  constructor(
    mapId: MapId = 'VASCULAR_RUN',
    difficultyId: DifficultyId = 'ACUTE',
    seed: number = 1337,
    eventBus?: EventBus,
    soundSynth?: SoundSynth
  ) {
    this.events = eventBus || new EventBus();
    this.soundSynth = soundSynth;
    this.currentMapId = mapId;
    this.currentDifficultyId = difficultyId;
    this.currentSeed = seed;

    const mapData = ALL_MAPS[mapId] || VASCULAR_RUN_MAP;
    this.mapGrid = new MapGrid(mapData);
    this.difficulty = DIFFICULTY_MODIFIERS[difficultyId] || DIFFICULTY_MODIFIERS.ACUTE;
    this.clock = new SimulationClock(1);
    this.rng = new Mulberry32PRNG(seed);

    this.atp = this.difficulty.startingAtp;
    this.integrity = this.difficulty.startingIntegrity;
    this.totalWaves = GAME_WAVES.length;
    this.resetUnlocks();

    this.stats = {
      wavesCompleted: 0,
      totalWaves: this.totalWaves,
      enemiesDefeated: 0,
      totalAtpEarned: this.atp,
      totalAtpSpent: 0,
      coreDamageTaken: 0,
      remainingIntegrity: this.integrity,
      playTimeMs: 0,
      score: 0,
    };
  }

  public getOccupiedCells(): Set<string> {
    const set = new Set<string>();
    for (const tower of this.towers.values()) {
      set.add(`${tower.col},${tower.row}`);
    }
    return set;
  }

  public isTowerUnlocked(towerTypeId: TowerTypeId): boolean {
    return this.unlockedTowers.has(towerTypeId);
  }

  private resetUnlocks(): void {
    this.unlockedTowers = new Set(
      (Object.keys(TOWER_DEFINITIONS) as TowerTypeId[]).filter((id) => {
        const unlockWave = TOWER_DEFINITIONS[id].unlockWave;
        return unlockWave === undefined || unlockWave <= 1;
      })
    );
  }

  /** Unlocks any wave-gated towers whose unlock wave has been reached (1-based). */
  private processUnlocks(waveNumber: number): void {
    for (const id of Object.keys(TOWER_DEFINITIONS) as TowerTypeId[]) {
      const def = TOWER_DEFINITIONS[id];
      if (def.unlockWave !== undefined && def.unlockWave <= waveNumber && !this.unlockedTowers.has(id)) {
        this.unlockedTowers.add(id);
        this.events.emit({ type: 'TOWER_UNLOCKED', towerTypeId: id, waveIndex: waveNumber });
      }
    }
  }

  /**
   * Calculates performance-based discount percentage based on how well the player is doing.
   * - Flawless 100% integrity gives +15% discount
   * - High wave streak / waves completed gives up to +15% discount
   * - Consecutive no-leak waves give up to 30% max dynamic discount!
   */
  public getPerformanceDiscount(): { discountPct: number; reason: string; efficiencyBonus: number } {
    let discountPct = 0;
    let reason = 'Normal Efficiency';
    let efficiencyBonus = 1.0;

    if (this.integrity >= 100) {
      discountPct += 0.15;
      reason = 'Flawless Immune Defense (+15% discount, +10% power)';
      efficiencyBonus = 1.1;
    } else if (this.integrity >= 80) {
      discountPct += 0.08;
      reason = 'High Cellular Resilience (+8% discount)';
      efficiencyBonus = 1.05;
    }

    if (this.waveIndex >= 3) {
      const waveBonus = Math.min(0.15, Math.floor(this.waveIndex / 2) * 0.05);
      discountPct += waveBonus;
      if (waveBonus > 0) {
        reason += ` + Wave Veteran (${Math.round(waveBonus * 100)}%)`;
      }
    }

    discountPct = Math.min(0.35, discountPct);
    return { discountPct, reason, efficiencyBonus };
  }

  public getUpgradeCost(baseCost: number): number {
    const { discountPct } = this.getPerformanceDiscount();
    return Math.max(10, Math.round(baseCost * (1 - discountPct)));
  }

  public checkPlacement(col: number, row: number, towerCost = 0): BuildabilityCheckResult {
    const result = this.mapGrid.checkBuildability(col, row, this.getOccupiedCells());
    if (!result.valid) {
      return result;
    }
    if (this.atp < towerCost) {
      return { valid: false, reason: 'INSUFFICIENT_ATP', coord: { col, row } };
    }
    return result;
  }

  public dispatch(command: GameCommand): CommandResult {
    switch (command.type) {
      case 'OPEN_LEVEL_SELECT': {
        const old = this.phase;
        this.phase = 'LEVEL_SELECT';
        this.events.emit({ type: 'PHASE_CHANGED', from: old, to: 'LEVEL_SELECT' });
        return { ok: true };
      }

      case 'RECYCLE_TOWER': {
        // Recycling is an explicit tactical sell action; it is intentionally
        // separate from SELL_TOWER so clients can expose a reclaim affordance.
        return this.dispatch({ type: 'SELL_TOWER', towerId: command.towerId });
      }

      case 'START_GAME': {
        this.currentMapId = command.mapId;
        this.currentDifficultyId = command.difficultyId;
        this.currentSeed = command.seed ?? Date.now();

        const mapData = ALL_MAPS[command.mapId] || VASCULAR_RUN_MAP;
        this.mapGrid = new MapGrid(mapData);
        this.difficulty = DIFFICULTY_MODIFIERS[command.difficultyId] || DIFFICULTY_MODIFIERS.ACUTE;
        this.rng = new Mulberry32PRNG(this.currentSeed);
        this.clock.reset();

        this.atp = this.difficulty.startingAtp;
        this.integrity = this.difficulty.startingIntegrity;
        this.score = 0;
        this.waveIndex = 0;
        this.waveState = 'PREPARING';
        this.towers.clear();
        this.enemies.clear();
        this.projectiles = [];
        this.spawnQueue = [];
        this.selectedTowerId = null;
        this.resetUnlocks();

        const currentWave = GAME_WAVES[0];
        this.waveCountdownMs = currentWave ? currentWave.countdownDurationMs : 10000;
        this.waveElapsedMs = 0;

        this.stats = {
          wavesCompleted: 0,
          totalWaves: this.totalWaves,
          enemiesDefeated: 0,
          totalAtpEarned: this.atp,
          totalAtpSpent: 0,
          coreDamageTaken: 0,
          remainingIntegrity: this.integrity,
          playTimeMs: 0,
          score: 0,
        };

        const oldPhase = this.phase;
        this.phase = 'PLAYING';
        this.events.emit({ type: 'PHASE_CHANGED', from: oldPhase, to: 'PLAYING' });
        this.events.emit({
          type: 'WAVE_PREPARED',
          waveIndex: 1,
          totalWaves: this.totalWaves,
          countdownMs: this.waveCountdownMs,
        });

        return { ok: true };
      }

      case 'PAUSE_GAME': {
        if (this.phase === 'PLAYING') {
          this.phase = 'PAUSED';
          this.clock.setPaused(true);
          this.events.emit({ type: 'PHASE_CHANGED', from: 'PLAYING', to: 'PAUSED' });
          return { ok: true };
        }
        return { ok: false, reason: 'Game is not playing' };
      }

      case 'RESUME_GAME': {
        if (this.phase === 'PAUSED') {
          this.phase = 'PLAYING';
          this.clock.setPaused(false);
          this.events.emit({ type: 'PHASE_CHANGED', from: 'PAUSED', to: 'PLAYING' });
          return { ok: true };
        }
        return { ok: false, reason: 'Game is not paused' };
      }

      case 'TOGGLE_PAUSE': {
        if (this.phase === 'PLAYING') {
          return this.dispatch({ type: 'PAUSE_GAME' });
        }
        if (this.phase === 'PAUSED') {
          return this.dispatch({ type: 'RESUME_GAME' });
        }
        return { ok: false, reason: 'Cannot toggle pause in current phase' };
      }

      case 'SET_SPEED': {
        this.clock.setSpeed(command.multiplier);
        return { ok: true };
      }

      case 'START_WAVE_EARLY': {
        if (this.phase !== 'PLAYING' && this.phase !== 'PAUSED') {
          return { ok: false, reason: 'Game not active' };
        }
        if (this.waveState !== 'PREPARING') {
          return { ok: false, reason: 'Wave is already active' };
        }

        // Calculate early bonus: 1 ATP & 10 score per remaining second
        const remainingSeconds = Math.max(0, Math.floor(this.waveCountdownMs / 1000));
        const earlyAtpBonus = Math.floor(remainingSeconds * 3 * this.difficulty.atpIncomeMultiplier);
        const earlyScoreBonus = remainingSeconds * 25;

        if (earlyAtpBonus > 0) {
          this.atp += earlyAtpBonus;
          this.stats.totalAtpEarned += earlyAtpBonus;
          this.soundSynth?.playAtpGain();
          this.events.emit({
            type: 'ATP_CHANGED',
            currentAtp: this.atp,
            delta: earlyAtpBonus,
            reason: 'EARLY_WAVE_BONUS',
          });
        }

        if (earlyScoreBonus > 0) {
          this.score += earlyScoreBonus;
          this.stats.score = this.score;
          this.events.emit({
            type: 'SCORE_CHANGED',
            currentScore: this.score,
            delta: earlyScoreBonus,
            reason: 'EARLY_WAVE_BONUS',
          });
        }

        this.startWave(earlyAtpBonus);
        return { ok: true };
      }

      case 'PLACE_TOWER': {
        if (this.phase !== 'PLAYING' && this.phase !== 'PAUSED') {
          return { ok: false, reason: 'Cannot place tower outside active game' };
        }

        const def = TOWER_DEFINITIONS[command.towerTypeId];
        if (!def) {
          return { ok: false, reason: 'Unknown tower type' };
        }
        if (!this.unlockedTowers.has(command.towerTypeId)) {
          return { ok: false, reason: 'TOWER_LOCKED' };
        }

        const check = this.checkPlacement(command.col, command.row, def.cost);
        if (!check.valid) {
          return { ok: false, reason: check.reason };
        }

        // Deduct ATP
        this.atp -= def.cost;
        this.stats.totalAtpSpent += def.cost;
        this.soundSynth?.playAtpSpend();
        this.events.emit({
          type: 'ATP_CHANGED',
          currentAtp: this.atp,
          delta: -def.cost,
          reason: 'BUY_TOWER',
        });

        const worldPos = this.mapGrid.cellToWorld(command.col, command.row);
        const towerId = `tower_${this.nextEntityId++}`;

        const tower: TowerInstance = {
          id: towerId,
          typeId: command.towerTypeId,
          name: def.name,
          col: command.col,
          row: command.row,
          position: worldPos,
          range: def.range,
          damage: def.damage,
          fireIntervalMs: def.fireIntervalMs,
          cooldownMs: 0,
          targetMode: def.targetMode,
          damageType: def.damageType,
          level: 1,
          totalInvestedAtp: def.cost,
          color: def.color,
          targetId: null,
          beamLockDurationMs: 0,
          ageMs: 0,
          // Tactical cells can be recycled before senescence. The longer-lived
          // heavy cells cost more but remain on the membrane longer.
          lifespanMs:
            command.towerTypeId === 'KILLER_T' || command.towerTypeId === 'MACROPHAGE'
              ? 240000
              : command.towerTypeId === 'IGM'
                ? 210000
                : 180000,
          recycleValue: Math.floor(def.cost * 0.7),
        };

        this.towers.set(towerId, tower);
        this.selectedTowerId = towerId;

        this.events.emit({
          type: 'TOWER_PLACED',
          towerId,
          towerTypeId: command.towerTypeId,
          col: command.col,
          row: command.row,
          cost: def.cost,
        });

        return { ok: true };
      }

      case 'UPGRADE_TOWER': {
        const tower = this.towers.get(command.towerId);
        if (!tower) {
          return { ok: false, reason: 'Tower not found' };
        }
        const def = TOWER_DEFINITIONS[tower.typeId];
        const perf = this.getPerformanceDiscount();

        // Level 1 -> 2 (Tier 1 upgrade)
        if (tower.level === 1) {
          const baseCost = def.tier1Upgrade.cost;
          const cost = this.getUpgradeCost(baseCost);
          if (this.atp < cost) {
            return { ok: false, reason: 'INSUFFICIENT_ATP' };
          }

          this.atp -= cost;
          this.stats.totalAtpSpent += cost;
          this.soundSynth?.playAtpSpend();
          tower.totalInvestedAtp += cost;
          tower.level = 2;
          tower.damage = Math.round(tower.damage * def.tier1Upgrade.damageMultiplier * perf.efficiencyBonus);
          tower.range = Math.round(tower.range * def.tier1Upgrade.rangeMultiplier);
          tower.fireIntervalMs = Math.round(
            tower.fireIntervalMs / def.tier1Upgrade.fireRateMultiplier
          );

          this.events.emit({
            type: 'ATP_CHANGED',
            currentAtp: this.atp,
            delta: -cost,
            reason: 'UPGRADE_TOWER',
          });
          this.events.emit({
            type: 'TOWER_UPGRADED',
            towerId: tower.id,
            newLevel: tower.level,
            cost,
          });

          return { ok: true };
        }

        // Level 2 -> 3 (Choose one of five specialization branches)
        if (tower.level === 2) {
          if (!command.branch) {
            return { ok: false, reason: 'Must specify a specialization branch (A-E)' };
          }
          const branchDef = getBranch(def, command.branch);
          if (!branchDef) return { ok: false, reason: 'Unknown upgrade branch' };
          const baseCost = branchDef.cost;
          const cost = this.getUpgradeCost(baseCost);
          if (this.atp < cost) {
            return { ok: false, reason: 'INSUFFICIENT_ATP' };
          }

          this.atp -= cost;
          this.stats.totalAtpSpent += cost;
          this.soundSynth?.playAtpSpend();
          tower.totalInvestedAtp += cost;
          tower.level = 3;
          tower.selectedBranch = branchDef.id;
          tower.special = branchDef.special;

          if (branchDef.damageMultiplier) {
            tower.damage = Math.round(tower.damage * branchDef.damageMultiplier * perf.efficiencyBonus);
          }
          if (branchDef.rangeMultiplier) {
            tower.range = Math.round(tower.range * branchDef.rangeMultiplier);
          }
          if (branchDef.fireRateMultiplier) {
            tower.fireIntervalMs = Math.round(tower.fireIntervalMs / branchDef.fireRateMultiplier);
          }

          this.events.emit({
            type: 'ATP_CHANGED',
            currentAtp: this.atp,
            delta: -cost,
            reason: 'BRANCH_UPGRADE',
          });
          this.events.emit({
            type: 'TOWER_UPGRADED',
            towerId: tower.id,
            newLevel: tower.level,
            branch: branchDef.id,
            cost,
          });

          return { ok: true };
        }

        // Level 3 -> 4 (Apex mastery of the chosen branch)
        if (tower.level === 3) {
          const branchDef = tower.selectedBranch ? getBranch(def, tower.selectedBranch) : undefined;
          const apex = branchDef?.apex ?? def.branches[0]!.apex;
          const baseCost = apex.cost;
          const cost = this.getUpgradeCost(baseCost);
          if (this.atp < cost) {
            return { ok: false, reason: 'INSUFFICIENT_ATP' };
          }

          this.atp -= cost;
          this.stats.totalAtpSpent += cost;
          this.soundSynth?.playAtpSpend();
          tower.totalInvestedAtp += cost;
          tower.level = 4;
          tower.damage = Math.round(tower.damage * apex.damageMultiplier * perf.efficiencyBonus);

          this.events.emit({
            type: 'ATP_CHANGED',
            currentAtp: this.atp,
            delta: -cost,
            reason: 'TIER3_UPGRADE',
          });
          this.events.emit({
            type: 'TOWER_UPGRADED',
            towerId: tower.id,
            newLevel: tower.level,
            branch: tower.selectedBranch,
            cost,
          });

          return { ok: true };
        }

        return { ok: false, reason: 'Tower is at maximum upgrade level' };
      }

      case 'SELL_TOWER': {
        const tower = this.towers.get(command.towerId);
        if (!tower) {
          return { ok: false, reason: 'Tower not found' };
        }

        const refund = Math.floor(tower.totalInvestedAtp * 0.7);
        this.towers.delete(command.towerId);
        if (this.selectedTowerId === command.towerId) {
          this.selectedTowerId = null;
        }

        this.atp += refund;
        this.soundSynth?.playAtpGain();
        this.events.emit({
          type: 'ATP_CHANGED',
          currentAtp: this.atp,
          delta: refund,
          reason: 'SELL_TOWER',
        });
        this.events.emit({
          type: 'TOWER_SOLD',
          towerId: command.towerId,
          refund,
        });

        return { ok: true };
      }

      case 'SELECT_TOWER': {
        this.selectedTowerId = command.towerId;
        return { ok: true };
      }

      case 'SET_TARGET_MODE': {
        const tower = this.towers.get(command.towerId);
        if (!tower) {
          return { ok: false, reason: 'Tower not found' };
        }
        tower.targetMode = command.mode;
        return { ok: true };
      }

      case 'RESTART_GAME': {
        return this.dispatch({
          type: 'START_GAME',
          mapId: this.currentMapId,
          difficultyId: this.currentDifficultyId,
          seed: this.currentSeed,
        });
      }

      case 'QUIT_TO_MENU': {
        const old = this.phase;
        this.phase = 'MAIN_MENU';
        this.clock.setPaused(true);
        this.events.emit({ type: 'PHASE_CHANGED', from: old, to: 'MAIN_MENU' });
        return { ok: true };
      }
    }
  }

  public startWave(earlyBonusAtp = 0): void {
    const waveDef = GAME_WAVES[this.waveIndex];
    if (!waveDef) return;

    this.waveState = 'SPAWNING';
    this.waveElapsedMs = 0;
    this.spawnQueue = [];

    // Build spawn queue
    for (const group of waveDef.groups) {
      for (let i = 0; i < group.count; i++) {
        this.spawnQueue.push({
          enemyTypeId: group.enemyTypeId,
          spawnTimeMs: group.initialDelayMs + i * group.intervalMs,
        });
      }
    }

    // Sort queue by spawn time
    this.spawnQueue.sort((a, b) => a.spawnTimeMs - b.spawnTimeMs);

    this.events.emit({
      type: 'WAVE_STARTED',
      waveIndex: this.waveIndex + 1,
      earlyBonusAtp,
    });
  }

  /**
   * Ticks simulation forward by deltaMs (called in fixed steps or via clock.advance).
   */
  public tick(dtMs: number = FIXED_TIMESTEP_MS): void {
    if (this.phase !== 'PLAYING') {
      return;
    }

    const dtSeconds = dtMs / 1000;
    this.stats.playTimeMs += dtMs;

    // 1. Wave Progression & Spawning
    this.updateWaveSpawning(dtMs);

    // 2. Enemy Movement & Status Effects
    this.updateEnemies(dtMs, dtSeconds);
    if (this.phase !== 'PLAYING') return; // e.g. defeat triggered by a leak

    // 3. Tower Targeting & Firing
    this.updateTowers(dtMs);
    if (this.phase !== 'PLAYING') return;

    // 4. Projectile Movement & Collision
    this.updateProjectiles(dtMs, dtSeconds);
    if (this.phase !== 'PLAYING') return;

    // 5. Cleanup Dead Entities
    this.cleanupEntities();

    // 6. Check Win/Lose Conditions
    this.checkTerminalConditions();
  }

  private updateWaveSpawning(dtMs: number): void {
    if (this.waveState === 'PREPARING') {
      this.waveCountdownMs -= dtMs;
      if (this.waveCountdownMs <= 0) {
        this.startWave(0);
      }
      return;
    }

    if (this.waveState === 'SPAWNING') {
      this.waveElapsedMs += dtMs;

      // Spawn due enemies
      while (this.spawnQueue.length > 0 && this.spawnQueue[0]!.spawnTimeMs <= this.waveElapsedMs) {
        const item = this.spawnQueue.shift()!;
        this.spawnEnemy(item.enemyTypeId);
      }

      if (this.spawnQueue.length === 0) {
        this.waveState = 'ACTIVE';
      }
      return;
    }

    if (this.waveState === 'ACTIVE') {
      if (this.enemies.size === 0) {
        // Wave cleared!
        const waveDef = GAME_WAVES[this.waveIndex];
        const bonus = Math.round((waveDef?.completionBonusAtp ?? 50) * this.difficulty.atpIncomeMultiplier);
        this.atp += bonus;
        this.stats.totalAtpEarned += bonus;
        this.stats.wavesCompleted++;
        this.soundSynth?.playAtpGain();

        const waveScoreBonus = (this.waveIndex + 1) * 200;
        this.score += waveScoreBonus;
        this.stats.score = this.score;

        this.events.emit({
          type: 'ATP_CHANGED',
          currentAtp: this.atp,
          delta: bonus,
          reason: 'WAVE_CLEAR_BONUS',
        });
        this.events.emit({
          type: 'SCORE_CHANGED',
          currentScore: this.score,
          delta: waveScoreBonus,
          reason: 'WAVE_CLEAR_BONUS',
        });
        this.events.emit({
          type: 'WAVE_CLEARED',
          waveIndex: this.waveIndex + 1,
          bonusAtp: bonus,
        });

        this.waveIndex++;
        if (this.waveIndex >= this.totalWaves) {
          this.waveState = 'CLEARED';
          this.triggerVictory();
        } else {
          this.waveState = 'PREPARING';
          const nextWave = GAME_WAVES[this.waveIndex]!;
          this.waveCountdownMs = nextWave.countdownDurationMs;
          this.processUnlocks(this.waveIndex + 1);
          this.events.emit({
            type: 'WAVE_PREPARED',
            waveIndex: this.waveIndex + 1,
            totalWaves: this.totalWaves,
            countdownMs: this.waveCountdownMs,
          });
        }
      }
    }
  }

  public spawnEnemy(typeId: EnemyTypeId, initialDistance = 0, routeIndex?: number): EnemyInstance {
    const def = ENEMY_DEFINITIONS[typeId];
    const enemyId = `enemy_${this.nextEntityId++}`;
    // Progressive per-wave scaling: enemies get tougher and faster as waves advance.
    // waveIndex is 0 for wave 1, so both factors are exactly 1.0 there (no change to wave 1 behavior).
    const waveScaleHp = 1 + this.waveIndex * 0.08; // +8% HP per wave beyond the first
    const waveScaleSpeed = 1 + this.waveIndex * 0.015; // +1.5% speed per wave beyond the first
    const hp = Math.round(def.baseHp * this.difficulty.enemyHealthMultiplier * waveScaleHp);
    const speed = def.baseSpeed * this.difficulty.enemySpeedMultiplier * waveScaleSpeed;
    const routeCount = this.mapGrid.getRouteCount();
    const assignedRoute = routeIndex !== undefined ? routeIndex : (this.enemies.size % routeCount);
    const pathInfo = this.mapGrid.getPositionAlongPath(initialDistance, assignedRoute);

    const enemy: EnemyInstance = {
      id: enemyId,
      typeId,
      name: def.name,
      hp,
      maxHp: hp,
      baseSpeed: speed,
      effectiveSpeed: speed,
      armor: def.armor,
      // Bounties rise with membrane density and wave pressure, keeping later
      // waves economically viable without making early farming dominant.
      atpReward: Math.max(
        1,
        Math.round(def.atpReward * this.difficulty.atpIncomeMultiplier * (1 + this.waveIndex * 0.035))
      ),
      scoreReward: def.scoreReward,
      coreDamage: def.coreDamage,
      color: def.color,
      size: def.size,
      distanceTravelled: initialDistance,
      position: pathInfo.position,
      progress: pathInfo.progress,
      tangentAngle: pathInfo.tangentAngle,
      routeIndex: assignedRoute,
      isDead: false,
      isLeaked: false,
      statusEffects: [],
      immunities: def.immunities ? [...def.immunities] : [],
      splitsOnDeath: def.splitsOnDeath,
    };

    this.enemies.set(enemyId, enemy);
    this.events.emit({
      type: 'ENEMY_SPAWNED',
      enemyId,
      enemyTypeId: typeId,
      position: enemy.position,
    });

    return enemy;
  }

  private updateEnemies(dtMs: number, dtSeconds: number): void {
    for (const enemy of this.enemies.values()) {
      if (enemy.isDead || enemy.isLeaked) continue;

      // Update status effects (slow, DoT)
      let maxSlow = 0;
      const activeEffects = [];

      for (const effect of enemy.statusEffects) {
        effect.remainingMs -= dtMs;
        if (effect.type === 'SLOW') {
          maxSlow = Math.max(maxSlow, effect.magnitude);
        } else if (effect.type === 'DOT') {
          const dotDmg = effect.magnitude * dtSeconds;
          enemy.hp -= dotDmg;
        }

        if (effect.remainingMs > 0) {
          activeEffects.push(effect);
        }
      }
      enemy.statusEffects = activeEffects;

      // Check if died from DoT before moving (so a DoT-killed enemy
      // cannot move, leak, or deal core damage in the same tick)
      if (enemy.hp <= 0) {
        this.handleEnemyDeath(enemy);
        continue;
      }

      // Clamp slow to 80% maximum
      const effectiveSlow = Math.min(0.8, maxSlow);
      enemy.effectiveSpeed = enemy.baseSpeed * (1 - effectiveSlow);

      // Move along path
      enemy.distanceTravelled += enemy.effectiveSpeed * dtSeconds;
      const pathInfo = this.mapGrid.getPositionAlongPath(enemy.distanceTravelled, enemy.routeIndex || 0);
      enemy.position = pathInfo.position;
      enemy.progress = pathInfo.progress;
      enemy.tangentAngle = pathInfo.tangentAngle;

      // Check if reached core
      if (pathInfo.completed) {
        enemy.isLeaked = true;
        this.integrity = Math.max(0, this.integrity - enemy.coreDamage);
        this.stats.coreDamageTaken += enemy.coreDamage;
        this.stats.remainingIntegrity = this.integrity;

        this.events.emit({
          type: 'ENEMY_LEAKED',
          enemyId: enemy.id,
          enemyTypeId: enemy.typeId,
          damageToCore: enemy.coreDamage,
        });
        this.events.emit({
          type: 'CORE_DAMAGED',
          damage: enemy.coreDamage,
          currentIntegrity: this.integrity,
        });

        if (this.integrity <= 0) {
          this.triggerDefeat();
          return;
        }
      }
    }
  }

  private updateTowers(dtMs: number): void {
    for (const tower of this.towers.values()) {
      tower.ageMs += dtMs;
      if (tower.ageMs >= tower.lifespanMs) {
        this.dispatch({ type: 'RECYCLE_TOWER', towerId: tower.id });
        continue;
      }
      tower.cooldownMs = Math.max(0, tower.cooldownMs - dtMs);

      if (tower.typeId === 'KILLER_T') {
        // RAMP_8X_FAST: up to 8x over 2000ms; base: up to 5x over 3000ms
        const maxRampSeconds = tower.special === 'RAMP_8X_FAST' ? 2 : 3;
        const rampPerSecond = tower.special === 'RAMP_8X_FAST' ? 3.5 : 1.33;

        if (tower.special === 'MULTI_BEAM_3') {
          // Lock up to 3 concurrent targets, each with its own ramp
          const locks = (tower.beamLocks ??= []);
          for (let i = locks.length - 1; i >= 0; i--) {
            const locked = this.enemies.get(locks[i]!.targetId);
            if (!locked || locked.isDead || locked.isLeaked || !this.isEnemyInRange(tower, locked)) {
              locks.splice(i, 1);
            }
          }
          while (locks.length < 3) {
            const exclude = new Set(locks.map((l) => l.targetId));
            const extra = this.findTowerTarget(tower, exclude);
            if (!extra) break;
            locks.push({ targetId: extra.id, lockDurationMs: 0 });
          }
          for (const lock of locks) {
            lock.lockDurationMs += dtMs;
          }
          tower.targetId = locks[0]?.targetId ?? null;
          tower.beamLockDurationMs = locks[0]?.lockDurationMs ?? 0;

          if (locks.length > 0 && tower.cooldownMs <= 0) {
            tower.cooldownMs = tower.fireIntervalMs;
            for (const lock of [...locks]) {
              const target = this.enemies.get(lock.targetId);
              if (!target || target.isDead || target.isLeaked) continue;
              const lockSeconds = Math.min(maxRampSeconds, lock.lockDurationMs / 1000);
              const rampMult = 1 + lockSeconds * rampPerSecond;
              this.applyDamageToEnemy(target, Math.round(tower.damage * rampMult), tower.id, false, 'THERMAL');
              this.applyBeamSideEffects(tower, target);
              this.events.emit({
                type: 'TOWER_FIRED',
                towerId: tower.id,
                targetId: lock.targetId,
                projectileType: 'BEAM',
              });
            }
          }
          continue;
        }

        // Keep the locked target while it is alive and in range so the
        // beam ramp is not reset by re-ranking (e.g. STRONGEST mode).
        let target: EnemyInstance | null = null;
        if (tower.targetId) {
          const locked = this.enemies.get(tower.targetId);
          if (
            locked &&
            !locked.isDead &&
            !locked.isLeaked &&
            this.isEnemyInRange(tower, locked) &&
            !locked.immunities.includes('THERMAL')
          ) {
            target = locked;
          }
        }
        if (!target) {
          target = this.findTowerTarget(tower);
        }

        // Continuous beam ramping
        if (target) {
          if (tower.targetId === target.id) {
            tower.beamLockDurationMs = (tower.beamLockDurationMs || 0) + dtMs;
          } else {
            tower.targetId = target.id;
            tower.beamLockDurationMs = 0;
          }

          if (tower.cooldownMs <= 0) {
            tower.cooldownMs = tower.fireIntervalMs;
            const lockSeconds = Math.min(maxRampSeconds, (tower.beamLockDurationMs || 0) / 1000);
            const rampMult = 1 + lockSeconds * rampPerSecond;
            const totalDamage = Math.round(tower.damage * rampMult);

            this.applyDamageToEnemy(target, totalDamage, tower.id, false, 'THERMAL');
            this.applyBeamSideEffects(tower, target);
            this.events.emit({
              type: 'TOWER_FIRED',
              towerId: tower.id,
              targetId: target.id,
              projectileType: 'BEAM',
            });
          }
        } else {
          tower.targetId = null;
          tower.beamLockDurationMs = 0;
        }
      } else if (tower.typeId === 'IGA') {
        // IgA Cryo-Tether
        const slowMagnitude =
          tower.special === 'SLOW_70_BRITTLE_25' ? 0.7 : tower.special === 'CRYO_CONTROL' ? 0.55 : 0.4;

        if (tower.special === 'OMNI_AURA_SLOW') {
          // Glacial Aura: pulse damages and slows ALL enemies in range
          const nearest = this.findTowerTarget(tower);
          tower.targetId = nearest ? nearest.id : null;
          if (nearest && tower.cooldownMs <= 0) {
            tower.cooldownMs = tower.fireIntervalMs;
            const victims: EnemyInstance[] = [];
            for (const enemy of this.enemies.values()) {
              if (enemy.isDead || enemy.isLeaked) continue;
              if (this.isEnemyInRange(tower, enemy)) victims.push(enemy);
            }
            for (const enemy of victims) {
              this.applyDamageToEnemy(enemy, tower.damage, tower.id, false, 'CRYO');
              if (!enemy.isDead) {
                this.refreshStatusEffect(enemy, `slow_${tower.id}`, 'SLOW', slowMagnitude, 800, tower.id);
                this.applyBeamSideEffects(tower, enemy);
              }
            }
            this.events.emit({
              type: 'TOWER_FIRED',
              towerId: tower.id,
              targetId: nearest.id,
              projectileType: 'CRYO_TETHER',
            });
          }
          continue;
        }

        const target = this.findTowerTarget(tower);
        if (target) {
          tower.targetId = target.id;
          if (tower.cooldownMs <= 0) {
            tower.cooldownMs = tower.fireIntervalMs;
            this.applyDamageToEnemy(target, tower.damage, tower.id, false, 'CRYO');

            if (!target.isDead) {
              // Apply slow (refresh existing effect from this tower)
              this.refreshStatusEffect(target, `slow_${tower.id}`, 'SLOW', slowMagnitude, 800, tower.id);

              if (tower.special === 'SLOW_70_BRITTLE_25') {
                // Deep Freeze: brittle targets take +25% damage from all sources
                this.refreshStatusEffect(target, `brittle_${tower.id}`, 'BRITTLE', 0.25, 800, tower.id);
              }
              this.applyBeamSideEffects(tower, target);
            }

            this.events.emit({
              type: 'TOWER_FIRED',
              towerId: tower.id,
              targetId: target.id,
              projectileType: 'CRYO_TETHER',
            });
          }
        } else {
          tower.targetId = null;
        }
      } else {
        // Projectile Towers (IgG, IgM, Macrophage)
        const target = this.findTowerTarget(tower);
        if (target && tower.cooldownMs <= 0) {
          tower.cooldownMs = tower.fireIntervalMs;
          tower.targetId = target.id;

          const projId = `proj_${this.nextEntityId++}`;
          const isIgM = tower.typeId === 'IGM';
          const isMacrophage = tower.typeId === 'MACROPHAGE';

          // CRIT_CHANCE_25: 25% chance to deal double damage (seeded rng)
          let damage = tower.damage;
          let isCrit = false;
          if (tower.special === 'CRIT_CHANCE_25' && this.rng.next() < 0.25) {
            isCrit = true;
            damage *= 2;
          }

          let splashRadius = isIgM
            ? 65
            : tower.special === 'LYSOSOME_SPLASH'
              ? 55
              : tower.special === 'KINETIC_SWARM'
                ? 28
                : tower.special === 'CORROSIVE_ACID'
                  ? 42
                  : 0;
          // Acid paths widen the blast by 50%
          if (tower.special === 'ACID_POOL_DOT' || tower.special === 'CORROSIVE_ACID') {
            splashRadius = Math.round(splashRadius * 1.5);
          }

          const specialType = isIgM ? 'CLUSTER' : isMacrophage ? 'ENGULF' : 'PULSE';
          this.projectiles.push({
            id: projId,
            sourceTowerId: tower.id,
            targetId: target.id,
            targetPosition: { ...target.position },
            currentPosition: { ...tower.position },
            speed: isIgM ? 280 : isMacrophage ? 210 : 550,
            damage,
            splashRadius,
            color: tower.color,
            isDead: false,
            specialType,
            special: tower.special,
            damageType: tower.damageType,
            isCrit,
          });

          this.events.emit({
            type: 'TOWER_FIRED',
            towerId: tower.id,
            targetId: target.id,
            projectileType: specialType,
          });
        } else if (!target) {
          tower.targetId = null;
        }
      }
    }
  }

  /** Branch side-effects shared by beam/tether towers (Killer T, IgA). */
  private applyBeamSideEffects(tower: TowerInstance, target: EnemyInstance): void {
    if (target.isDead || target.isLeaked) return;
    if (tower.special === 'CORROSIVE_ACID') {
      this.refreshStatusEffect(target, `dot_${tower.id}`, 'DOT', tower.damage * 0.3, 2500, tower.id);
    }
  }

  private isEnemyInRange(tower: TowerInstance, enemy: EnemyInstance): boolean {
    const dx = enemy.position.x - tower.position.x;
    const dy = enemy.position.y - tower.position.y;
    return Math.hypot(dx, dy) <= tower.range;
  }

  private findTowerTarget(tower: TowerInstance, excludeIds?: Set<string>): EnemyInstance | null {
    let bestTarget: EnemyInstance | null = null;
    let bestMetric = -Infinity;

    for (const enemy of this.enemies.values()) {
      if (enemy.isDead || enemy.isLeaked) continue;
      if (excludeIds && excludeIds.has(enemy.id)) continue;
      // Never waste ammunition on a pathogen immune to this tower's damage channel.
      if (enemy.immunities.includes(tower.damageType)) continue;

      const dx = enemy.position.x - tower.position.x;
      const dy = enemy.position.y - tower.position.y;
      const dist = Math.hypot(dx, dy);

      if (dist <= tower.range) {
        const metric = tower.targetMode === 'STRONGEST' ? enemy.hp : enemy.distanceTravelled;
        if (metric > bestMetric) {
          bestMetric = metric;
          bestTarget = enemy;
        }
      }
    }

    return bestTarget;
  }

  private updateProjectiles(_dtMs: number, dtSeconds: number): void {
    for (const proj of this.projectiles) {
      if (proj.isDead) continue;

      // Update target position if enemy is still alive
      if (proj.targetId) {
        const target = this.enemies.get(proj.targetId);
        if (target && !target.isDead && !target.isLeaked) {
          proj.targetPosition = { ...target.position };
        }
      }

      const dx = proj.targetPosition.x - proj.currentPosition.x;
      const dy = proj.targetPosition.y - proj.currentPosition.y;
      const dist = Math.hypot(dx, dy);
      const step = proj.speed * dtSeconds;

      if (dist <= step || dist < 12) {
        // Hit!
        proj.isDead = true;

        if (proj.splashRadius > 0) {
          // Splash AoE damage: snapshot victims first so enemies spawned
          // during damage handling (e.g. death splits) are not hit
          const victims = this.enemiesWithinRadius(proj.targetPosition, proj.splashRadius);
          for (const enemy of victims) {
            this.applyDamageToEnemy(enemy, proj.damage, proj.sourceTowerId, false, proj.damageType);
            this.applyImpactEffects(proj, enemy);
          }

          // CLUSTER_FRAGMENTS_4: 4 sub-explosions around the impact point
          if (proj.special === 'CLUSTER_FRAGMENTS_4') {
            const fragDamage = Math.max(1, Math.round(proj.damage * 0.4));
            const fragRadius = Math.round(proj.splashRadius * 0.7);
            const offsetDist = proj.splashRadius * 0.5;
            for (let i = 0; i < 4; i++) {
              const angle = (Math.PI / 4) + (i * Math.PI) / 2; // 45°, 135°, 225°, 315°
              const fragCenter = {
                x: proj.targetPosition.x + Math.cos(angle) * offsetDist,
                y: proj.targetPosition.y + Math.sin(angle) * offsetDist,
              };
              const fragVictims = this.enemiesWithinRadius(fragCenter, fragRadius);
              for (const enemy of fragVictims) {
                this.applyDamageToEnemy(enemy, fragDamage, proj.sourceTowerId, false, proj.damageType);
              }
            }
          }
        } else if (proj.targetId) {
          const target = this.enemies.get(proj.targetId);
          if (target && !target.isDead && !target.isLeaked) {
            this.applyDamageToEnemy(target, proj.damage, proj.sourceTowerId, proj.isCrit, proj.damageType);
            this.applyImpactEffects(proj, target);

            // CHAIN_LIGHTNING_3: arc to up to 3 nearby enemies with 70% falloff per jump
            if (proj.special === 'CHAIN_LIGHTNING_3') {
              const chainRadius = 80;
              const candidates = this.enemiesWithinRadius(target.position, chainRadius)
                .filter((e) => e.id !== target.id)
                .sort(
                  (a, b) =>
                    Math.hypot(a.position.x - target.position.x, a.position.y - target.position.y) -
                    Math.hypot(b.position.x - target.position.x, b.position.y - target.position.y)
                )
                .slice(0, 3);
              let chainDamage = proj.damage;
              for (const enemy of candidates) {
                chainDamage *= 0.7;
                this.applyDamageToEnemy(
                  enemy,
                  Math.max(1, Math.round(chainDamage)),
                  proj.sourceTowerId,
                  false,
                  proj.damageType
                );
              }
            }
          }
        }
      } else {
        // Move towards target
        proj.currentPosition.x += (dx / dist) * step;
        proj.currentPosition.y += (dy / dist) * step;
      }
    }
  }

  /** Status effects a projectile leaves on a surviving victim, driven by the source tower's branch. */
  private applyImpactEffects(proj: ProjectileInstance, enemy: EnemyInstance): void {
    if (enemy.isDead || enemy.isLeaked) return;
    const src = proj.sourceTowerId;
    // Acid paths leave a lingering membrane-corroding field.
    if (proj.special === 'ACID_POOL_DOT' || proj.special === 'CORROSIVE_ACID') {
      this.refreshStatusEffect(enemy, `dot_${src}`, 'DOT', proj.damage * 0.2, 3000, src);
    }
    // Cryo-plasma / cryo-control on projectile towers chills the victim.
    if (proj.special === 'CRYO_CONTROL') {
      this.refreshStatusEffect(enemy, `slow_${src}`, 'SLOW', 0.3, 1000, src);
    }
    // Macrophage opsonization marks the target for amplified damage.
    if (proj.special === 'OPSONIZE_BRITTLE_30') {
      this.refreshStatusEffect(enemy, `brittle_${src}`, 'BRITTLE', 0.3, 1200, src);
    }
  }

  public applyDamageToEnemy(
    enemy: EnemyInstance,
    rawDamage: number,
    _sourceTowerId?: string,
    isCrit = false,
    damageType?: DamageType
  ): void {
    if (enemy.isDead || enemy.isLeaked) return;

    // Immune pathogens deflect the entire hit.
    if (damageType && enemy.immunities.includes(damageType)) {
      this.events.emit({
        type: 'ENEMY_DAMAGED',
        enemyId: enemy.id,
        amount: 0,
        currentHp: enemy.hp,
        maxHp: enemy.maxHp,
        immune: true,
      });
      return;
    }

    // BRITTLE (Deep Freeze / Opsonin): amplified damage from all sources
    let amp = 0;
    for (const effect of enemy.statusEffects) {
      if (effect.type === 'BRITTLE') {
        amp = Math.max(amp, effect.magnitude);
      }
    }

    const source = _sourceTowerId ? this.towers.get(_sourceTowerId) : undefined;
    // Phagocytic engulfment digests armor entirely; thermal piercing bypasses most of it.
    const armor =
      damageType === 'PHAGOCYTIC'
        ? 0
        : source?.special === 'THERMAL_PIERCING'
          ? Math.floor(enemy.armor * 0.35)
          : enemy.armor;
    const effectiveDamage = Math.max(1, rawDamage * (1 + amp) - armor);
    enemy.hp = Math.max(0, enemy.hp - effectiveDamage);

    this.events.emit({
      type: 'ENEMY_DAMAGED',
      enemyId: enemy.id,
      amount: effectiveDamage,
      currentHp: enemy.hp,
      maxHp: enemy.maxHp,
      ...(isCrit ? { isCrit: true } : {}),
    });

    if (enemy.hp <= 0) {
      this.handleEnemyDeath(enemy);
      if (source?.special === 'PHAGOCYTIC_ENGULFMENT') {
        const bonus = Math.max(1, Math.round(enemy.atpReward * 0.25));
        this.atp += bonus;
        this.stats.totalAtpEarned += bonus;
        this.events.emit({
          type: 'ATP_CHANGED',
          currentAtp: this.atp,
          delta: bonus,
          reason: 'PHAGOCYTIC_BOUNTY',
        });
      }
    }
  }

  /** Snapshot of alive, non-leaked enemies within radius of a point. */
  private enemiesWithinRadius(center: { x: number; y: number }, radius: number): EnemyInstance[] {
    const result: EnemyInstance[] = [];
    for (const enemy of this.enemies.values()) {
      if (enemy.isDead || enemy.isLeaked) continue;
      if (Math.hypot(enemy.position.x - center.x, enemy.position.y - center.y) <= radius) {
        result.push(enemy);
      }
    }
    return result;
  }

  /** Refresh an existing status effect by id or push a new one (no duplicate stacking). */
  private refreshStatusEffect(
    enemy: EnemyInstance,
    id: string,
    type: 'SLOW' | 'DOT' | 'BRITTLE',
    magnitude: number,
    durationMs: number,
    sourceTowerId?: string
  ): void {
    const existing = enemy.statusEffects.find((e) => e.id === id);
    if (existing) {
      existing.magnitude = magnitude;
      existing.durationMs = durationMs;
      existing.remainingMs = durationMs;
    } else {
      enemy.statusEffects.push({
        id,
        type,
        magnitude,
        durationMs,
        remainingMs: durationMs,
        sourceTowerId,
      });
    }
  }

  private handleEnemyDeath(enemy: EnemyInstance): void {
    enemy.isDead = true;
    this.atp += enemy.atpReward;
    this.score += enemy.scoreReward;
    this.stats.enemiesDefeated++;
    this.stats.totalAtpEarned += enemy.atpReward;
    this.stats.score = this.score;
    this.soundSynth?.playAtpGain();

    this.events.emit({
      type: 'ATP_CHANGED',
      currentAtp: this.atp,
      delta: enemy.atpReward,
      reason: 'ENEMY_KILL',
    });
    this.events.emit({
      type: 'SCORE_CHANGED',
      currentScore: this.score,
      delta: enemy.scoreReward,
      reason: 'ENEMY_KILL',
    });
    this.events.emit({
      type: 'ENEMY_DEFEATED',
      enemyId: enemy.id,
      enemyTypeId: enemy.typeId,
      position: enemy.position,
      atpReward: enemy.atpReward,
      scoreReward: enemy.scoreReward,
    });

    // Check boss split ability
    if (enemy.splitsOnDeath) {
      for (let i = 0; i < enemy.splitsOnDeath.count; i++) {
        // Stagger split children slightly behind parent progress
        const spawnDist = Math.max(0, enemy.distanceTravelled - i * 14);
        this.spawnEnemy(enemy.splitsOnDeath.childTypeId, spawnDist, enemy.routeIndex);
      }
    }
  }

  private cleanupEntities(): void {
    // Clean dead / leaked enemies
    for (const [id, enemy] of this.enemies.entries()) {
      if (enemy.isDead || enemy.isLeaked) {
        this.enemies.delete(id);
      }
    }

    // Clean dead projectiles
    this.projectiles = this.projectiles.filter((p) => !p.isDead);
  }

  private checkTerminalConditions(): void {
    if (this.integrity <= 0 && this.phase === 'PLAYING') {
      this.triggerDefeat();
    }
  }

  private triggerVictory(): void {
    const old = this.phase;
    this.phase = 'VICTORY';
    this.clock.setPaused(true);

    // Final integrity bonus for score
    const integrityScoreBonus = this.integrity * 50;
    this.score += integrityScoreBonus;
    this.stats.score = this.score;
    this.stats.remainingIntegrity = this.integrity;

    this.events.emit({
      type: 'PHASE_CHANGED',
      from: old,
      to: 'VICTORY',
    });
    this.events.emit({
      type: 'GAME_VICTORY',
      finalScore: this.score,
      stats: this.stats,
    });
  }

  private triggerDefeat(): void {
    const old = this.phase;
    this.phase = 'DEFEAT';
    this.clock.setPaused(true);

    this.events.emit({
      type: 'PHASE_CHANGED',
      from: old,
      to: 'DEFEAT',
    });
    this.events.emit({
      type: 'GAME_DEFEAT',
      finalScore: this.score,
      stats: this.stats,
    });
  }
}
