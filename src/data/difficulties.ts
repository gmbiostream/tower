import { DifficultyModifiers, DifficultyId } from '@/core/types';

export const DIFFICULTY_MODIFIERS: Record<DifficultyId, DifficultyModifiers> = {
  RESIDENT: {
    id: 'RESIDENT',
    name: 'Resident',
    description: 'Immune system in peak equilibrium. Higher initial ATP, moderate viral strength.',
    enemyHealthMultiplier: 0.85,
    enemySpeedMultiplier: 0.95,
    atpIncomeMultiplier: 1.15,
    startingAtp: 450,
    startingIntegrity: 100,
  },
  ACUTE: {
    id: 'ACUTE',
    name: 'Acute',
    description: 'Standard active viral infection. Balanced pathogen health and resource flow.',
    enemyHealthMultiplier: 1.0,
    enemySpeedMultiplier: 1.0,
    atpIncomeMultiplier: 0.95,
    startingAtp: 350,
    startingIntegrity: 100,
  },
  CRITICAL: {
    id: 'CRITICAL',
    name: 'Critical',
    description: 'Severe multi-vector infection. Aggressive pathogens and scarce cellular resources.',
    enemyHealthMultiplier: 1.35,
    enemySpeedMultiplier: 1.15,
    atpIncomeMultiplier: 0.8,
    startingAtp: 280,
    startingIntegrity: 100,
  },
};
