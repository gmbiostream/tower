import { EnemyDefinition, EnemyTypeId } from '@/core/types';

export const ENEMY_DEFINITIONS: Record<EnemyTypeId, EnemyDefinition> = {
  RHINOVIRUS: {
    id: 'RHINOVIRUS',
    name: 'Rhinovirus',
    description: 'Ultra-fast kinetic runner with low structural membrane integrity.',
    baseHp: 45,
    baseSpeed: 130, // 130 px/sec
    armor: 0,
    atpReward: 12,
    scoreReward: 50,
    coreDamage: 4,
    color: '#ff3366',
    size: 14,
  },

  INFLUENZA: {
    id: 'INFLUENZA',
    name: 'Influenza',
    description: 'Standard aggressive viral pathogen with balanced speed and membrane resistance.',
    baseHp: 110,
    baseSpeed: 80, // 80 px/sec
    armor: 0,
    atpReward: 20,
    scoreReward: 100,
    coreDamage: 8,
    color: '#ff0055',
    size: 18,
  },

  CORONA_TITAN: {
    id: 'CORONA_TITAN',
    name: 'Corona Titan',
    description: 'Heavily armored crystalline envelope providing flat reduction against all kinetic strikes.',
    baseHp: 380,
    baseSpeed: 45, // 45 px/sec
    armor: 6, // Flat 6 damage reduction per hit (min 1 dmg)
    atpReward: 55,
    scoreReward: 250,
    coreDamage: 26,
    color: '#990033',
    size: 26,
  },

  RETRO_MUTANT: {
    id: 'RETRO_MUTANT',
    name: 'Retro-Mutant Boss',
    description: 'High-order mutating super-pathogen. On membrane collapse, ruptures into 4 swift Rhinovirus fragments.',
    baseHp: 1400,
    baseSpeed: 38, // 38 px/sec
    armor: 8,
    atpReward: 200,
    scoreReward: 1000,
    coreDamage: 50,
    color: '#cc0066',
    size: 34,
    splitsOnDeath: {
      childTypeId: 'RHINOVIRUS',
      count: 4,
    },
  },
};
