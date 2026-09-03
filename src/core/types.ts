export type GamePhase =
  | 'BOOT'
  | 'MAIN_MENU'
  | 'LEVEL_SELECT'
  | 'PREPARATION'
  | 'PLAYING'
  | 'PAUSED'
  | 'VICTORY'
  | 'DEFEAT';

export type DifficultyId = 'RESIDENT' | 'ACUTE' | 'CRITICAL' | 'EXTREME' | 'EASY' | 'MEDIUM' | 'HARD';
export type MapId = 'VASCULAR_RUN' | 'LYMPH_SPIRAL' | 'NEURAL_FORK' | 'PULMONARY_CONVERGENCE' | string;
export type TargetMode = 'FIRST' | 'STRONGEST';

export type TowerTypeId = 'IGG' | 'IGM' | 'IGA' | 'KILLER_T';
export type EnemyTypeId = 'RHINOVIRUS' | 'INFLUENZA' | 'CORONA_TITAN' | 'RETRO_MUTANT';

export interface GridCoord {
  col: number;
  row: number;
}

export interface WorldCoord {
  x: number;
  y: number;
}

export type BuildabilityReason =
  | 'VALID'
  | 'PATH'
  | 'BLOCKED'
  | 'OCCUPIED'
  | 'OUT_OF_BOUNDS'
  | 'INSUFFICIENT_ATP';

export interface BuildabilityCheckResult {
  valid: boolean;
  reason: BuildabilityReason;
  coord: GridCoord;
}

export interface MapData {
  id: MapId;
  name: string;
  description: string;
  cols: number;
  rows: number;
  cellSize: number;
  waypoints: WorldCoord[];
  routes?: WorldCoord[][];
  theme?: 'VASCULAR' | 'LYMPHATIC' | 'NEURAL' | 'PULMONARY';
  pathGridCells: GridCoord[];
  blockedGridCells: GridCoord[];
  corePosition: WorldCoord;
  entryPosition: WorldCoord;
}

export interface DifficultyModifiers {
  id: DifficultyId;
  name: string;
  description: string;
  enemyHealthMultiplier: number;
  enemySpeedMultiplier: number;
  atpIncomeMultiplier: number;
  startingAtp: number;
  startingIntegrity: number;
}

export interface StatusEffect {
  id: string;
  type: 'SLOW' | 'DOT' | 'BRITTLE';
  magnitude: number;
  durationMs: number;
  remainingMs: number;
  sourceTowerId?: string;
}

export interface EnemyDefinition {
  id: EnemyTypeId;
  name: string;
  description: string;
  baseHp: number;
  baseSpeed: number;
  armor: number;
  atpReward: number;
  scoreReward: number;
  coreDamage: number;
  color: string;
  size: number;
  splitsOnDeath?: {
    childTypeId: EnemyTypeId;
    count: number;
  };
}

export interface EnemyInstance {
  id: string;
  typeId: EnemyTypeId;
  name: string;
  hp: number;
  maxHp: number;
  baseSpeed: number;
  effectiveSpeed: number;
  armor: number;
  atpReward: number;
  scoreReward: number;
  coreDamage: number;
  color: string;
  size: number;
  distanceTravelled: number;
  position: WorldCoord;
  progress: number;
  tangentAngle: number;
  routeIndex?: number;
  isDead: boolean;
  isLeaked: boolean;
  statusEffects: StatusEffect[];
  splitsOnDeath?: {
    childTypeId: EnemyTypeId;
    count: number;
  };
}

export interface UpgradeBranchDefinition {
  name: string;
  description: string;
  cost: number;
  damageMultiplier?: number;
  fireRateMultiplier?: number;
  rangeMultiplier?: number;
  special?: string;
}

export interface TowerDefinition {
  id: TowerTypeId;
  name: string;
  role: string;
  description: string;
  cost: number;
  range: number;
  damage: number;
  fireIntervalMs: number;
  color: string;
  targetMode: TargetMode;
  tier1Upgrade: {
    cost: number;
    damageMultiplier: number;
    rangeMultiplier: number;
    fireRateMultiplier: number;
  };
  branchA: UpgradeBranchDefinition;
  branchB: UpgradeBranchDefinition;
  tier3UpgradeA: {
    cost: number;
    damageMultiplier: number;
  };
  tier3UpgradeB: {
    cost: number;
    damageMultiplier: number;
  };
}

export interface TowerInstance {
  id: string;
  typeId: TowerTypeId;
  name: string;
  col: number;
  row: number;
  position: WorldCoord;
  range: number;
  damage: number;
  fireIntervalMs: number;
  cooldownMs: number;
  targetMode: TargetMode;
  level: number;
  selectedBranch?: 'A' | 'B';
  totalInvestedAtp: number;
  color: string;
  targetId: string | null;
  beamLockDurationMs?: number;
  special?: string;
  beamLocks?: { targetId: string; lockDurationMs: number }[];
}

export interface ProjectileInstance {
  id: string;
  sourceTowerId: string;
  targetId: string | null;
  targetPosition: WorldCoord;
  currentPosition: WorldCoord;
  speed: number;
  damage: number;
  splashRadius: number;
  color: string;
  isDead: boolean;
  specialType?: 'PULSE' | 'CLUSTER' | 'CHAIN' | 'PLASMA';
  special?: string;
  isCrit?: boolean;
}

export interface WaveGroup {
  enemyTypeId: EnemyTypeId;
  count: number;
  intervalMs: number;
  initialDelayMs: number;
}

export interface WaveDefinition {
  waveNumber: number;
  name: string;
  description: string;
  groups: WaveGroup[];
  completionBonusAtp: number;
  countdownDurationMs: number;
}

export interface SpawnQueueItem {
  enemyTypeId: EnemyTypeId;
  spawnTimeMs: number;
}

export type GameCommand =
  | { type: 'START_GAME'; mapId: MapId; difficultyId: DifficultyId; seed?: number }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'SET_SPEED'; multiplier: number }
  | { type: 'START_WAVE_EARLY' }
  | { type: 'PLACE_TOWER'; towerTypeId: TowerTypeId; col: number; row: number }
  | { type: 'UPGRADE_TOWER'; towerId: string; branch?: 'A' | 'B' }
  | { type: 'SELL_TOWER'; towerId: string }
  | { type: 'SELECT_TOWER'; towerId: string | null }
  | { type: 'SET_TARGET_MODE'; towerId: string; mode: TargetMode }
  | { type: 'RESTART_GAME' }
  | { type: 'QUIT_TO_MENU' }
  | { type: 'OPEN_LEVEL_SELECT' };

export type CommandResult =
  | { ok: true; message?: string }
  | { ok: false; reason: string };

export type DomainEvent =
  | { type: 'PHASE_CHANGED'; from: GamePhase; to: GamePhase }
  | { type: 'WAVE_PREPARED'; waveIndex: number; totalWaves: number; countdownMs: number }
  | { type: 'WAVE_STARTED'; waveIndex: number; earlyBonusAtp: number }
  | { type: 'WAVE_CLEARED'; waveIndex: number; bonusAtp: number }
  | { type: 'ENEMY_SPAWNED'; enemyId: string; enemyTypeId: EnemyTypeId; position: WorldCoord }
  | { type: 'ENEMY_DAMAGED'; enemyId: string; amount: number; currentHp: number; maxHp: number; isCrit?: boolean }
  | { type: 'ENEMY_DEFEATED'; enemyId: string; enemyTypeId: EnemyTypeId; position: WorldCoord; atpReward: number; scoreReward: number }
  | { type: 'ENEMY_LEAKED'; enemyId: string; enemyTypeId: EnemyTypeId; damageToCore: number }
  | { type: 'CORE_DAMAGED'; damage: number; currentIntegrity: number }
  | { type: 'TOWER_PLACED'; towerId: string; towerTypeId: TowerTypeId; col: number; row: number; cost: number }
  | { type: 'TOWER_UPGRADED'; towerId: string; newLevel: number; branch?: 'A' | 'B'; cost: number }
  | { type: 'TOWER_SOLD'; towerId: string; refund: number }
  | { type: 'TOWER_FIRED'; towerId: string; targetId: string; projectileType: string }
  | { type: 'ATP_CHANGED'; currentAtp: number; delta: number; reason: string }
  | { type: 'SCORE_CHANGED'; currentScore: number; delta: number; reason: string }
  | { type: 'GAME_VICTORY'; finalScore: number; stats: SessionStats }
  | { type: 'GAME_DEFEAT'; finalScore: number; stats: SessionStats };

export interface SessionStats {
  wavesCompleted: number;
  totalWaves: number;
  enemiesDefeated: number;
  totalAtpEarned: number;
  totalAtpSpent: number;
  coreDamageTaken: number;
  remainingIntegrity: number;
  playTimeMs: number;
  score: number;
}
