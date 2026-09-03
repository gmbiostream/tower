# Changelog

All notable changes to **Cyber-Immunology: Neon Microcosm** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.2.0] — 2026-09-03 — second_implementation

Major visual, audio, upgrade system, and content expansion release.

### Added
- **Dynamic Performance-Based Upgrade System**:
  - Implemented dynamic ATP discounts and efficiency multipliers in `GameEngine` based on player performance:
    - Flawless Organ Integrity ($\ge 100\%$): grants $+15\%$ upgrade discount and $+10\%$ efficiency/damage bonus.
    - High Resilience ($\ge 80\%$): grants $+8\%$ discount and $+5\%$ efficiency bonus.
    - Wave Veteran Streak: adds $+5\%$ to $+15\%$ cumulative discount as waves are successfully defended without major damage.
  - Active tower inspector displays real-time performance discount badge, discounted ATP costs, and original price strikethrough.
- **Microscopy-Inspired Vector Bio-Sprites**:
  - Added vector SVG sprites module (`src/ui/towerSprites.ts`) for all 4 antibody tower types, 8 upgrade specializations, and UI currency icons (ATP).
  - Updated in-game canvas renderer (`GameRenderer`) with realistic electron-microscopy geometry:
    - IgG Pulse Sentinel: tangled fibril network with central Y-antibody photon emitter.
    - IgM Cluster Cannon: pentameric 5-lobed macromolecule with satellite plasma nodes and J-chain.
    - IgA Cryo-Tether: dense fibrous cell body with crystalline ice spikes and secretory linkages.
    - Killer T-Cell: gold cylindrical microvilli crown, cytotoxic thermal core, and blue interior cytoplasm.
    - Realistic enemy morphologies for Rhinovirus (fibril vertices), Influenza (bulbous glycoprotein spike crown), Corona Titan (armored carapace plates), and Cytokine Storm boss.
- **Sector Vector SVG Map Previews & Pulmonary Junction Map**:
  - Added dedicated high-fidelity SVG map preview illustrations for all sectors: Vascular Run, Lymph Spiral, Neural Fork, and Pulmonary Junction (`src/ui/mapPreviews.ts`).
  - Added **Pulmonary Junction** 4th sector map featuring dual-bronchial corridors and respiratory core convergence.
- **Zero-Overhead Soundtrack Streaming & Web Audio Synthesis**:
  - Added non-blocking soundtrack streaming (`playMusicTrack`, `pauseMusicTrack`, `stopMusicTrack`) routed through Web Audio GainNodes with fallback.
  - Rebalanced ambient Celtic/Dorian procedural soundtrack gain and implemented instant gesture-based audio unlock across all menu buttons.
  - Added sound volume and mute controls in pause menu modal.
- **Comprehensive Unit & E2E Test Suite**:
  - Added 30+ new unit tests covering audio synthesis, performance upgrade scaling, pause modal, multi-route maps, and Playwright E2E tests for sector selection and full gameplay loops (80 unit tests total).

### Changed
- Replaced terminology from "Specialization Branches" to **"In-Game Tower Upgrades"** across all modals, tower inspector, and help guide.
- Updated upgrade branch names and descriptions to match bio-inspired themes:
  - IgG: **Hyperpulse Barrage** (Branch A) & **Antibody Storm** (Branch B).
  - IgM: **Toxin Nebula** (Branch A) & **Chain Reaction** (Branch B).
  - IgA: **Deep Freeze** (Branch A) & **Glacial Aura** (Branch B).
  - Killer T: **Perforin Lance** (Branch A) & **Cytotoxic Nova** (Branch B).
- Upgraded tower selection dock, tower preview modal, and level select cards with vector SVG art.

### Fixed
- Fixed audio autoplay restrictions by unlocking `AudioContext` on initial user interactions.
- Fixed volume attenuation that previously made ambient synthesizer tracks inaudible.
- Fixed diagonal path rasterization and buildability bounding checks.

## [0.1.0] — 2026-09-03 — first_implementation

Initial playable release of the WebGL tower defence prototype.

### Added
- Core game: deterministic headless engine (60Hz fixed timestep, seeded Mulberry32 PRNG), PixiJS WebGL renderer, HTML/Tailwind HUD overlay, Web Audio procedural SFX/BGM, localStorage high scores.
- 4 antibody towers (IgG Pulse Sentinel, IgM Cluster Cannon, IgA Cryo-Tether, Killer T-Cell Prism) with tier-1 upgrades, branching tier-2 specializations, and tier-3 apex upgrades.
- All 8 tower branch specials implemented in the engine:
  - IgG-A **Hyper-Gatling**: 25% critical strikes (2x damage, seeded RNG).
  - IgG-B **Chain Pulse**: hits arc to up to 3 nearby enemies (70% falloff per jump).
  - IgM-A **Plasma Rupture**: +50% blast radius plus lingering acid DoT.
  - IgM-B **Cluster Shells**: impact spawns 4 secondary sub-explosions.
  - IgA-A **Deep Freeze**: 70% slow plus 25% brittle damage amplification.
  - IgA-B **Glacial Aura**: constant 360° slow on all enemies in range.
  - Killer T-A **Focused Ion Lance**: beam ramps to 8x with faster spool.
  - Killer T-B **Multi-Prism Beam**: 3 concurrent beam locks with independent ramps.
- 4 enemy types (Rhinovirus, Influenza, Corona Titan, Retro-Mutant boss with on-death split), 3 maps (Vascular Run, Lymph Spiral, Neural Fork), 3 difficulties (Resident, Acute, Critical), 10 waves.
- Test suite: 50 unit tests (engine combat/economy/phases/outcomes/fixes/specials, clock, map, PRNG, high scores) plus Playwright e2e scaffolding.

### Changed (difficulty rebalance)
- Progressive per-wave enemy scaling: +6% HP and +1.5% speed per wave beyond wave 1.
- Waves 4–10: 15–25% more enemies and 10–15% faster spawn intervals; waves 7–10 have shorter prep countdowns; slightly higher completion ATP bonuses.
- Critical difficulty: enemy HP ×1.35 (was 1.25), speed ×1.15 (was 1.1), ATP income ×0.8 (was 0.85). Acute: ATP income ×0.95 (was 1.0).
- Corona Titan: armor 5 → 6, core damage 20 → 26. Retro-Mutant: core damage 40 → 50.

### Fixed
- Splash damage no longer hits boss-split children spawned by the same explosion (Map mutation during iteration).
- Simulation halts immediately on defeat; score/ATP/kill events no longer fire after `GAME_DEFEAT`, keeping the final score consistent.
- Killer T beam keeps its lock while the target is alive and in range, allowing the damage ramp to actually engage (previously ping-ponged in STRONGEST mode).
- DoT-killed enemies die before moving/leaking, so they can no longer deal core damage or forfeit kill rewards in the same tick.
- Static background (grid + blocked cells) redraws on game start, fixing stale terrain from the previous map on Lymph Spiral / Neural Fork.
- Canvas click/hover coordinates account for `object-fit: contain` letterboxing, fixing offset tower placement at some window sizes.
- Tower inspector upgrade text shows each tower's real multipliers instead of hardcoded IgG values.
- High-score trimming is per map+difficulty bucket (was global top-20 evicting other combos); corrupted stored records are validated and dropped safely.
- Neural Fork diagonal path is rasterized along the actual line instead of a bounding rectangle, restoring 12 wrongly-blocked buildable cells.
- IgA slow effects refresh instead of stacking duplicate entries; `OPEN_LEVEL_SELECT` emits the correct `from` phase; mute icon reflects persisted state on load; wave counter no longer shows "11 / 10".
