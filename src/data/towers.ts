import { TowerDefinition, TowerTypeId } from '@/core/types';

export const TOWER_DEFINITIONS: Record<TowerTypeId, TowerDefinition> = {
  IGG: {
    id: 'IGG',
    name: 'IgG Pulse Sentinel',
    role: 'Rapid Kinetic',
    description: 'Synthesizes high-frequency bio-photon pulses to neutralize rapid single pathogens.',
    cost: 100,
    range: 120,
    damage: 15,
    fireIntervalMs: 350, // 0.35s per shot (~43 DPS)
    color: '#00f5ff',
    targetMode: 'FIRST',
    tier1Upgrade: {
      cost: 75,
      damageMultiplier: 1.4, // 21 dmg
      rangeMultiplier: 1.15, // 138 range
      fireRateMultiplier: 1.25, // 280ms
    },
    branchA: {
      name: 'Hyperpulse Barrage',
      description: 'Triple Y-arm salvo with hyperactive speed trails for +60% fire rate and 25% critical strikes.',
      cost: 150,
      damageMultiplier: 1.3,
      fireRateMultiplier: 1.6,
      rangeMultiplier: 1.1,
      special: 'CRIT_CHANCE_25',
    },
    branchB: {
      name: 'Antibody Storm',
      description: 'Six orbiting antibody fragments form an ionization vortex that arcs across up to 3 adjacent viral pathogens.',
      cost: 160,
      damageMultiplier: 1.1,
      fireRateMultiplier: 1.0,
      rangeMultiplier: 1.2,
      special: 'CHAIN_LIGHTNING_3',
    },
    tier3UpgradeA: {
      cost: 220,
      damageMultiplier: 1.6,
    },
    tier3UpgradeB: {
      cost: 240,
      damageMultiplier: 1.5,
    },
  },

  IGM: {
    id: 'IGM',
    name: 'IgM Cluster Cannon',
    role: 'Area Burst',
    description: 'Launches unstable bio-plasma clusters that detonate on impact, neutralizing grouped swarms.',
    cost: 150,
    range: 140,
    damage: 45,
    fireIntervalMs: 1200, // 1.2s per shot (AoE burst)
    color: '#d946ef',
    targetMode: 'FIRST',
    tier1Upgrade: {
      cost: 110,
      damageMultiplier: 1.35, // 60 dmg
      rangeMultiplier: 1.15,
      fireRateMultiplier: 1.15,
    },
    branchA: {
      name: 'Toxin Nebula',
      description: 'Wraps the pentamer in a corrosive toxic cloud that leaves a lingering acidic bio-field.',
      cost: 200,
      damageMultiplier: 1.4,
      rangeMultiplier: 1.2,
      fireRateMultiplier: 1.0,
      special: 'ACID_POOL_DOT',
    },
    branchB: {
      name: 'Chain Reaction',
      description: 'Arc-lightning links between units detonate secondary explosive cluster fragments.',
      cost: 220,
      damageMultiplier: 1.25,
      rangeMultiplier: 1.0,
      fireRateMultiplier: 1.2,
      special: 'CLUSTER_FRAGMENTS_4',
    },
    tier3UpgradeA: {
      cost: 280,
      damageMultiplier: 1.7,
    },
    tier3UpgradeB: {
      cost: 300,
      damageMultiplier: 1.6,
    },
  },

  IGA: {
    id: 'IGA',
    name: 'IgA Cryo-Tether',
    role: 'Cryo / Control',
    description: 'Projects a sub-zero cryogenic tether, slowing pathogens by 40% while inflicting steady cellular breakdown.',
    cost: 125,
    range: 110,
    damage: 8,
    fireIntervalMs: 250, // Continuous tether pulse (32 DPS + 40% slow)
    color: '#10b981',
    targetMode: 'FIRST',
    tier1Upgrade: {
      cost: 90,
      damageMultiplier: 1.3,
      rangeMultiplier: 1.2,
      fireRateMultiplier: 1.1,
    },
    branchA: {
      name: 'Deep Freeze',
      description: 'Increases slow up to 70% and causes affected targets to receive 25% amplified damage from all sources.',
      cost: 175,
      damageMultiplier: 1.2,
      rangeMultiplier: 1.15,
      fireRateMultiplier: 1.0,
      special: 'SLOW_70_BRITTLE_25',
    },
    branchB: {
      name: 'Glacial Aura',
      description: 'Emits a 360-degree constant slowing field that chills all pathogens in range.',
      cost: 190,
      damageMultiplier: 1.1,
      rangeMultiplier: 1.3,
      fireRateMultiplier: 1.2,
      special: 'OMNI_AURA_SLOW',
    },
    tier3UpgradeA: {
      cost: 250,
      damageMultiplier: 1.5,
    },
    tier3UpgradeB: {
      cost: 260,
      damageMultiplier: 1.4,
    },
  },

  KILLER_T: {
    id: 'KILLER_T',
    name: 'Killer T-Cell Prism',
    role: 'Precision Thermal',
    description: 'Channelized heavy laser prism. Continuously ramps thermal damage against locked high-threat targets.',
    cost: 225,
    range: 180,
    damage: 20, // Ramps up to 5x (100 dmg/sec) over 3 seconds locked
    fireIntervalMs: 200, // Continuous laser ticks
    color: '#fbbf24',
    targetMode: 'STRONGEST',
    tier1Upgrade: {
      cost: 160,
      damageMultiplier: 1.35,
      rangeMultiplier: 1.15,
      fireRateMultiplier: 1.0,
    },
    branchA: {
      name: 'Perforin Lance',
      description: 'Crystalline protein lance extends for high-intensity focused thermal damage ramp (up to 8x).',
      cost: 260,
      damageMultiplier: 1.5,
      rangeMultiplier: 1.2,
      fireRateMultiplier: 1.0,
      special: 'RAMP_8X_FAST',
    },
    branchB: {
      name: 'Cytotoxic Nova',
      description: 'Multi-vector burst ring splits into 3 concurrent target locks, melting multiple heavy targets simultaneously.',
      cost: 280,
      damageMultiplier: 1.2,
      rangeMultiplier: 1.1,
      fireRateMultiplier: 1.0,
      special: 'MULTI_BEAM_3',
    },
    tier3UpgradeA: {
      cost: 350,
      damageMultiplier: 1.8,
    },
    tier3UpgradeB: {
      cost: 360,
      damageMultiplier: 1.6,
    },
  },
};
