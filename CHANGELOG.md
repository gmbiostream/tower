# Changelog

All notable changes to **Microcosm** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.4.0] — 2026-09-04 — fifth_implementation

Enhancements to biological tower sprite transitions, audio synthesis unlock coordination, and test suites.

### Added
- **Tower Upgrade Branch Sprite Transitions**:
  - Implemented dynamic texture key resolution (`getTowerTextureKey`) ensuring every tower smoothly transitions from base bio-sprites to unique specialization branch sprites upon Tier 3 and Tier 4 evolution.
  - Added vector SVG texture generation (`loadSvgTexture`) supporting all 25 specialization branches across kinetic, cryo, acid, thermal, and phagocytic trees.
  - Added colored bio-membrane socket glow rings around towers reflecting chosen specialization branch hues.
  - Updated Tower Inspector header to display active branch icons and specialization names upon selection.
- **Audio Autoplay & Unlock Coordination**:
  - Added `unlockAudio()` in `SoundSynth` to resume suspended Web Audio contexts and retry BGM playback on initial user gestures.
  - Wired audio unlocking into start, preview, and deploy buttons.
- **Automated Tests**:
  - Added unit test suite `tests/unit/render/tower_branch_sprites.test.ts` verifying texture transitions across all tower types and 25 specialization branches. Total unit test suite expanded to 103 tests.

### Known Limitations
- **In 5th implementation**: A feature where you could play as the enemy is currently not implemented; gameplay is dedicated to cellular antibody tower defense.

## [0.3.0] — 2026-09-04 — third_implementation

Major Microcosm overhaul introducing biological SVG sprites, 5-branch upgrade matrix, specialized tower combat ammunition, synthesized ATP audio feedback, rebalanced difficulty/enemies, and tactical recycling mechanics.

### Added
- **Microcosm Branding & Polished Landing View**:
  - Rebranded the game to **Microcosm** across `index.html`, `src/main.ts`, `src/ui/hud.ts`, docs, and test suites.
  - Landing screen styled with glowing neon cyan title (`text-[#00f5ff] neon-glow-cyan font-title font-extrabold text-5xl tracking-widest`) and subtitle `"a tower defense game."` (`font-body text-sm text-cyan-300 tracking-wider`).
  - Removed outdated version tags, "Cellular Defense Simulator", and technical footer details from the drop-in view.
- **Biological SVG Sprites & Fiber Algorithms**:
  - Ported procedural cell math (`makeFibers`, `smoothBlob`, `pseudopod`, cytoplasmic granule generation) into `src/ui/towerSprites.ts` and `src/render/gameRenderer.ts`.
  - Added high-detail biological SVG sprites for all enemies (`AcutePathogen`, `ArmoredVirus`, `CytokineStorm`, `ViralAgent`, etc.), towers (`IgGPulse`, `IgMCluster`, `IgACryoTether`, `KillerTCell`), and upgrade branches.
  - Created bespoke HUD SVG icons: `ATPIcon` (adenine ring + triphosphate chain), `HealthBar` (organic vessel outline with heartbeat/EKG rhythm), and `ScoreIcon`.
  - Integrated biological enemy silhouettes and stats into the Field Manual / Enemy Intel Legend and Tower Info Preview Chart.
- **Tower Ammunition & 5-Branch Upgrade Matrix**:
  - Implemented 5 strategic branching paths per tower:
    - Branch A: **Kinetic Swarm** (rapid kinetic acceleration, critical chance, hyper-frequency)
    - Branch B: **Cryo-Control** (deep freeze, brittle status amplification, glacial aura)
    - Branch C: **Corrosive Acid** (toxic bio-plasma, armor stripping, damage-over-time)
    - Branch D: **Thermal Piercing** (focused perforin thermal lance, armor melt, beam ramp)
    - Branch E: **Phagocytic Engulfment** (cellular digestion, ATP extraction bonuses, tethering)
  - Added Apex Tier 4 upgrades with unique damage multipliers and combat specializations.
  - Implemented distinct ammunition and projectile behaviors:
    - IgG Pulse: high-velocity bio-photon spikes with ionization trails.
    - IgA Cryo-Tether: sub-zero freezing goo globs, crystalline ice spikes, rooting/slow effects, and icy ground hazards.
    - IgM Cluster: toxic bio-plasma clouds and secondary corrosive fragments.
    - Killer T-Cell: continuous high-energy perforin thermal lance.
- **Synthesized Web Audio ATP Feedback**:
  - Added `playAtpGain()` (melodic dual-oscillator chime) and `playAtpSpend()` (resonant filtered low-pass synth thud) in `src/audio/synth.ts`.
  - Wired sound synthesis into all engine ATP transactions (tower purchase, upgrades, kills, wave rewards, and recycling).
- **Extreme Mode & Tactical Tower Recycling**:
  - Overhauled Extreme mode to prevent instant resource starvation: starting 220 ATP, 0.65x ATP rewards, 1.75x enemy HP, 1.3x speed.
  - Replaced rigid grid squares with organic circular bio-membrane placement rings and animated glow auras.
  - Added tactical tower recycling and lifespan mechanics (`RECYCLE_TOWER` command) with dynamic depreciation and UI telemetry.
- **Automated Test Coverage**:
  - Added `tests/unit/core/engine_branches_immunity.test.ts` covering 5-branch upgrade trees, apex tiers, and branch mechanics. Total unit test suite expanded to 98 passing tests.

### Changed
- Rebalanced enemy durability and membrane HP (+30% to +50% on Easy and Medium maps) to require coordinated defensive choke points.
- Tuned dynamic ATP bounties across wave progression and difficulty curves.
- Cleaned up difficulty definitions to strictly use canonical identifiers (`RESIDENT`, `ACUTE`, `CRITICAL`, `EXTREME`).

### Fixed
- Fixed unprompted audio autoplay restrictions by initiating playback on boot with fallback event listeners on first user gesture.
- Removed legacy duplicate difficulty constants from types and data schemas.

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
