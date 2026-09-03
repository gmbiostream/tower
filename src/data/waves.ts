import { WaveDefinition } from '@/core/types';

export const GAME_WAVES: WaveDefinition[] = [
  {
    waveNumber: 1,
    name: 'Initial Infiltration',
    description: 'Scattered Rhinovirus scouts detecting immune presence.',
    groups: [
      { enemyTypeId: 'RHINOVIRUS', count: 8, intervalMs: 900, initialDelayMs: 0 },
    ],
    completionBonusAtp: 60,
    countdownDurationMs: 12000,
  },
  {
    waveNumber: 2,
    name: 'Influenza Colony',
    description: 'First wave of standard Influenza cells entering the bloodstream.',
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
    description: 'First sighting of armored Corona Titans with heavy structural envelopes.',
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
    description: 'Dense cluster of fast and standard pathogens testing area defenses.',
    groups: [
      { enemyTypeId: 'RHINOVIRUS', count: 24, intervalMs: 400, initialDelayMs: 0 },
      { enemyTypeId: 'INFLUENZA', count: 14, intervalMs: 700, initialDelayMs: 4000 },
    ],
    completionBonusAtp: 145,
    countdownDurationMs: 12000,
  },
  {
    waveNumber: 6,
    name: 'Heavy Phalanx',
    description: 'Armored Titans supported by flanking runners.',
    groups: [
      { enemyTypeId: 'CORONA_TITAN', count: 7, intervalMs: 1750, initialDelayMs: 0 },
      { enemyTypeId: 'RHINOVIRUS', count: 17, intervalMs: 450, initialDelayMs: 6000 },
    ],
    completionBonusAtp: 170,
    countdownDurationMs: 12000,
  },
  {
    waveNumber: 7,
    name: 'Acute Cytokine Storm',
    description: 'Continuous multi-vector pathogen flood.',
    groups: [
      { enemyTypeId: 'INFLUENZA', count: 24, intervalMs: 525, initialDelayMs: 0 },
      { enemyTypeId: 'CORONA_TITAN', count: 6, intervalMs: 1600, initialDelayMs: 3000 },
      { enemyTypeId: 'RHINOVIRUS', count: 19, intervalMs: 350, initialDelayMs: 8000 },
    ],
    completionBonusAtp: 195,
    countdownDurationMs: 10500,
  },
  {
    waveNumber: 8,
    name: 'The Colossus Wave',
    description: 'Massive convoy of armored Corona Titans.',
    groups: [
      { enemyTypeId: 'CORONA_TITAN', count: 12, intervalMs: 1300, initialDelayMs: 0 },
      { enemyTypeId: 'INFLUENZA', count: 18, intervalMs: 600, initialDelayMs: 5000 },
    ],
    completionBonusAtp: 225,
    countdownDurationMs: 10500,
  },
  {
    waveNumber: 9,
    name: 'Pre-Mutant Surge',
    description: 'Maximum density pathogen swarm preceding the core mutation.',
    groups: [
      { enemyTypeId: 'RHINOVIRUS', count: 34, intervalMs: 300, initialDelayMs: 0 },
      { enemyTypeId: 'CORONA_TITAN', count: 10, intervalMs: 1400, initialDelayMs: 2000 },
      { enemyTypeId: 'INFLUENZA', count: 22, intervalMs: 525, initialDelayMs: 6000 },
    ],
    completionBonusAtp: 280,
    countdownDurationMs: 12500,
  },
  {
    waveNumber: 10,
    name: 'Retro-Mutant Apex Threat',
    description: 'Mutating super-pathogen. Neutralize the apex before the host is compromised.',
    groups: [
      { enemyTypeId: 'CORONA_TITAN', count: 5, intervalMs: 1750, initialDelayMs: 0 },
      { enemyTypeId: 'RETRO_MUTANT', count: 1, intervalMs: 0, initialDelayMs: 6000 },
      { enemyTypeId: 'INFLUENZA', count: 17, intervalMs: 600, initialDelayMs: 10000 },
    ],
    completionBonusAtp: 560,
    countdownDurationMs: 13500,
  },
];
