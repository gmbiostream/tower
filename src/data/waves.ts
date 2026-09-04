import { WaveDefinition } from '@/core/types';

export const GAME_WAVES: WaveDefinition[] = [
  {
    waveNumber: 1,
    name: 'Initial Infiltration',
    description: 'Scattered Acute Pathogen scouts detecting immune presence.',
    groups: [
      { enemyTypeId: 'RHINOVIRUS', count: 8, intervalMs: 900, initialDelayMs: 0 },
    ],
    completionBonusAtp: 60,
    countdownDurationMs: 12000,
  },
  {
    waveNumber: 2,
    name: 'Viral Agent Colony',
    description: 'First wave of Viral Agents entering the bloodstream.',
    groups: [
      { enemyTypeId: 'INFLUENZA', count: 10, intervalMs: 1000, initialDelayMs: 0 },
    ],
    completionBonusAtp: 75,
    countdownDurationMs: 10000,
  },
  {
    waveNumber: 3,
    name: 'Mixed Vectors',
    description: 'Alternating runners and standard pathogens.',
    groups: [
      { enemyTypeId: 'INFLUENZA', count: 8, intervalMs: 1100, initialDelayMs: 0 },
      { enemyTypeId: 'RHINOVIRUS', count: 10, intervalMs: 600, initialDelayMs: 5000 },
    ],
    completionBonusAtp: 90,
    countdownDurationMs: 10000,
  },
  {
    waveNumber: 4,
    name: 'Armored Vanguard',
    description: 'First sighting of Armored Viruses with heavy structural capsids.',
    groups: [
      { enemyTypeId: 'CORONA_TITAN', count: 4, intervalMs: 2200, initialDelayMs: 0 },
      { enemyTypeId: 'INFLUENZA', count: 14, intervalMs: 700, initialDelayMs: 4000 },
    ],
    completionBonusAtp: 125,
    countdownDurationMs: 12000,
  },
  {
    waveNumber: 5,
    name: 'Viral Swarm Escalation',
    description: 'Dense cluster of fast and standard pathogens. Macrophage synthesis unlocks — heat-shielded threats approach.',
    groups: [
      { enemyTypeId: 'RHINOVIRUS', count: 24, intervalMs: 400, initialDelayMs: 0 },
      { enemyTypeId: 'INFLUENZA', count: 14, intervalMs: 700, initialDelayMs: 4000 },
    ],
    completionBonusAtp: 145,
    countdownDurationMs: 12000,
  },
  {
    waveNumber: 6,
    name: 'Heat-Shock Vanguard',
    description: 'First heat-shielded carriers. Thermal beams will not touch them — deploy Macrophages.',
    groups: [
      { enemyTypeId: 'HEATSHOCK_CARRIER', count: 3, intervalMs: 2600, initialDelayMs: 0 },
      { enemyTypeId: 'CORONA_TITAN', count: 5, intervalMs: 1750, initialDelayMs: 3000 },
      { enemyTypeId: 'RHINOVIRUS', count: 17, intervalMs: 450, initialDelayMs: 7000 },
    ],
    completionBonusAtp: 185,
    countdownDurationMs: 12000,
  },
  {
    waveNumber: 7,
    name: 'Acute Cytokine Surge',
    description: 'Continuous multi-vector pathogen flood with shielded escorts.',
    groups: [
      { enemyTypeId: 'INFLUENZA', count: 24, intervalMs: 525, initialDelayMs: 0 },
      { enemyTypeId: 'HEATSHOCK_CARRIER', count: 4, intervalMs: 2200, initialDelayMs: 2500 },
      { enemyTypeId: 'CORONA_TITAN', count: 5, intervalMs: 1600, initialDelayMs: 4000 },
      { enemyTypeId: 'RHINOVIRUS', count: 19, intervalMs: 350, initialDelayMs: 8000 },
    ],
    completionBonusAtp: 210,
    countdownDurationMs: 10500,
  },
  {
    waveNumber: 8,
    name: 'The Colossus Wave',
    description: 'Massive convoy of armored capsids flanked by heat-shielded carriers.',
    groups: [
      { enemyTypeId: 'CORONA_TITAN', count: 12, intervalMs: 1300, initialDelayMs: 0 },
      { enemyTypeId: 'HEATSHOCK_CARRIER', count: 5, intervalMs: 2000, initialDelayMs: 2000 },
      { enemyTypeId: 'INFLUENZA', count: 18, intervalMs: 600, initialDelayMs: 5000 },
    ],
    completionBonusAtp: 245,
    countdownDurationMs: 10500,
  },
  {
    waveNumber: 9,
    name: 'Pre-Storm Surge',
    description: 'Maximum density pathogen swarm preceding the Cytokine Storm.',
    groups: [
      { enemyTypeId: 'RHINOVIRUS', count: 34, intervalMs: 300, initialDelayMs: 0 },
      { enemyTypeId: 'CORONA_TITAN', count: 10, intervalMs: 1400, initialDelayMs: 2000 },
      { enemyTypeId: 'HEATSHOCK_CARRIER', count: 6, intervalMs: 1800, initialDelayMs: 3500 },
      { enemyTypeId: 'INFLUENZA', count: 22, intervalMs: 525, initialDelayMs: 6000 },
    ],
    completionBonusAtp: 300,
    countdownDurationMs: 12500,
  },
  {
    waveNumber: 10,
    name: 'Cytokine Storm Apex Threat',
    description: 'Heat-immune apex fire-cell with a shielded escort. Neutralize it before the host is compromised.',
    groups: [
      { enemyTypeId: 'CORONA_TITAN', count: 5, intervalMs: 1750, initialDelayMs: 0 },
      { enemyTypeId: 'HEATSHOCK_CARRIER', count: 4, intervalMs: 2000, initialDelayMs: 3000 },
      { enemyTypeId: 'RETRO_MUTANT', count: 1, intervalMs: 0, initialDelayMs: 7000 },
      { enemyTypeId: 'INFLUENZA', count: 17, intervalMs: 600, initialDelayMs: 11000 },
    ],
    completionBonusAtp: 600,
    countdownDurationMs: 13500,
  },
];
