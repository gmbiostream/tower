# Incremental Task Backlog

Status: Ready for implementation  
Source: [User Stories](USER_STORIES.md)  
Feature backlog: [Feature Decomposition](FEATURES.md)  
Product baseline: [Product Plan](PRODUCT_PLAN.md)

## 1. Working Agreement

This backlog decomposes every approved user story into small, reviewable changes. Task IDs follow `T-{story ID}-{letter}`. Tasks are completed in the order listed unless a dependency forces a local adjustment.

For every task:

1. Move only that task to In Progress.
2. Make the smallest implementation and test change that satisfies its outcome.
3. Run the task's focused validation before making another production change.
4. Present the changed files, behavior, validation result, and known limitations for review.
5. Mark the task Done only after the change passes validation.
6. Stop at each Review Gate for user review before beginning the next slice.

Status legend: `[ ]` Not started, `[-]` In progress, `[x]` Done, `[!]` Blocked.

## 2. Project and Quality Foundation

These tasks support all stories and must land before gameplay work.

- [x] **T-SETUP-A: Scaffold the browser project**
  - Change: Create Vite strict TypeScript application with PixiJS, Vitest, and Playwright dependencies.
  - Review: Package scripts and minimal folder boundaries: `core`, `data`, `render`, `ui`, `audio`, and `persistence`.
  - Validate: Clean install, typecheck, unit-test placeholder, and production build pass.
- [x] **T-SETUP-B: Add static quality configuration**
  - Change: Enable strict TypeScript including unchecked indexed access; add formatting and lint scripts only if lightweight.
  - Review: Compiler settings catch invalid state access without slowing hackathon iteration.
  - Validate: Deliberate local type probe fails, then remove it and confirm typecheck passes.
- [x] **T-SETUP-C: Add browser test harness**
  - Change: Configure Playwright to start the Vite preview and run one boot smoke test.
  - Review: Browser automation works without arbitrary sleeps.
  - Validate: Smoke test passes locally against a production-equivalent build.

### Review Gate 0: Runnable Skeleton (Passed)

Review a blank but correctly structured browser app, scripts, dependency weight, and test harness before game logic begins.

## 3. Runtime and Map

### US-F01-01: Deterministic Game Session

- [x] **T-F01-01-A: Define simulation clock**
  - Change: Add fixed-step constants, accumulator, catch-up cap, and a pure tick scheduler.
  - Review: Rendering time is separate from simulation time.
  - Validate: Unit tests compare tick counts across varied frame intervals.
- [x] **T-F01-01-B: Define deterministic random source**
  - Change: Add a seedable random interface and implementation.
  - Review: No game system calls `Math.random` directly.
  - Validate: Same seeds produce equal sequences; different seeds diverge.
- [x] **T-F01-01-C: Integrate the browser loop**
  - Change: Connect `requestAnimationFrame` to fixed simulation ticks and presentation updates.
  - Review: Catch-up behavior is bounded after a delayed frame.
  - Validate: Unit scheduler tests and browser smoke test pass.

### US-F01-02: Safe Session Phases

- [x] **T-F01-02-A: Model phases and state**
  - Change: Define discriminated session phases and minimal state factory.
  - Review: Invalid phase-specific data cannot be represented easily.
  - Validate: Typecheck and state-factory unit tests pass.
- [x] **T-F01-02-B: Add typed commands and transitions**
  - Change: Add command dispatcher with explicit success and failure results.
  - Review: Menu and terminal states reject combat commands.
  - Validate: Transition table and rejected-command tests pass.
- [x] **T-F01-02-C: Publish domain events**
  - Change: Return domain events from accepted ticks and commands.
  - Review: Events contain presentation facts without owning rendering behavior.
  - Validate: Event order and no-event-on-rejection tests pass.

### US-F02-01: Understand the Enemy Route

- [x] **T-F02-01-A: Define and validate map data**
  - Change: Add grid dimensions, world coordinates, entry, core, and waypoint schema.
  - Review: Invalid or disconnected routes fail before a session starts.
  - Validate: Valid, out-of-bounds, duplicate, and disconnected fixture tests pass.
- [x] **T-F02-01-B: Implement distance-based traversal**
  - Change: Convert path segments into cumulative distance and resolve positions from progress.
  - Review: Segment boundaries and route completion are continuous.
  - Validate: Start, boundary, midpoint, end, and overshoot tests pass.
- [x] **T-F02-01-C: Render the first route**
  - Change: Draw Vascular Run, directional flow, entry, and cellular core in PixiJS.
  - Review: Route remains visible at supported viewport sizes.
  - Validate: Playwright screenshot assertion and manual desktop/laptop check pass.

### US-F02-02: Understand Buildable Space

- [x] **T-F02-02-A: Resolve pointer and grid cells**
  - Change: Add shared grid-to-world and world-to-grid conversion.
  - Review: Simulation and PixiJS use the same coordinate rules.
  - Validate: Round-trip, edge, and out-of-bounds tests pass.
- [x] **T-F02-02-B: Model buildability reasons**
  - Change: Return typed results for valid, path, blocked, occupied, and out-of-bounds cells.
  - Review: One validator owns placement truth.
  - Validate: Matrix tests cover every result.
- [x] **T-F02-02-C: Render buildability feedback**
  - Change: Display cell hover and semantic valid or invalid overlays.
  - Review: Feedback matches validator output and remains aligned after resizing.
  - Validate: Playwright moves to known cells and checks exposed placement state.

### Review Gate 1: Deterministic Map (Passed)

Review the visible Vascular Run map, route motion, resize behavior, phase model, and deterministic test evidence. No enemies or towers are required yet.

## 4. Waves, Enemies, Integrity, and Outcomes

### US-F03-01: Prepare for a Wave

- [x] **T-F03-01-A: Model wave definitions and countdown**
  - Change: Add validated wave group data and pending-wave timer state.
  - Review: Countdown derives from simulation time only.
  - Validate: Invalid data and countdown boundary tests pass.
- [x] **T-F03-01-B: Emit wave-start state and event**
  - Change: Transition one pending wave to spawning when countdown reaches zero.
  - Review: Duplicate starts are impossible.
  - Validate: Exact-zero, overshoot, pause, and duplicate-tick tests pass.
- [x] **T-F03-01-C: Show preparation telemetry**
  - Change: Display current or upcoming wave and countdown in the HUD shell.
  - Review: Timer remains stable in layout as digit count changes.
  - Validate: Playwright verifies countdown decreases and pauses.

### US-F03-02: Progress Through Waves

- [x] **T-F03-02-A: Build spawn queue**
  - Change: Expand wave groups into deterministic timed spawn entries.
  - Review: Counts, order, delays, and entry IDs match data.
  - Validate: Mixed-group spawn schedule tests pass.
- [x] **T-F03-02-B: Spawn and track enemies**
  - Change: Create enemies at due times with stable IDs and route progress zero.
  - Review: Each queue entry creates one enemy.
  - Validate: Count, timing, identity, and no-duplicate tests pass.
- [x] **T-F03-02-C: Complete and advance waves**
  - Change: Clear only when spawn queue and living enemies are empty, then prepare the next wave.
  - Review: Active stragglers block progression.
  - Validate: Queue-empty, enemy-active, clear, and final-wave tests pass.

### US-F04-01: Recognize Different Threats

- [x] **T-F04-01-A: Add base enemy lifecycle**
  - Change: Implement movement, health, damage receipt, defeat marking, and end-of-tick cleanup.
  - Review: Removal never occurs while combat systems iterate.
  - Validate: Movement, damage, defeat-once, and cleanup tests pass.
- [x] **T-F04-01-B: Add Influenza baseline**
  - Change: Define and render the balanced enemy using an initial lightweight cellular placeholder.
  - Review: Data and renderer mapping are separate.
  - Validate: Spawn-to-core browser smoke test passes.
- [x] **T-F04-01-C: Add Rhinovirus and Corona Titan**
  - Change: Add fast/frail and slow/armored definitions with distinct silhouettes.
  - Review: Differences are mechanically meaningful and visually readable.
  - Validate: Stat, speed, armor minimum-damage, and mixed-wave tests pass.

### US-F04-02: Respond to a Splitting Boss

- [x] **T-F04-02-A: Add Retro-Mutant data and boss state**
  - Change: Define boss stats, visual scale, reward, and split payload.
  - Review: Split behavior is data-triggered but resolved by an enemy system.
  - Validate: Definition validation and boss spawn tests pass.
- [x] **T-F04-02-B: Implement deterministic split**
  - Change: Spawn four child Rhinoviruses at defeat progress during cleanup.
  - Review: Defeat splits once; leaks never split.
  - Validate: Child count, progress, route, reward, and no-split-on-leak tests pass.
- [x] **T-F04-02-C: Add boss feedback**
  - Change: Render internal cores, boss health treatment, and split burst.
  - Review: Boss remains readable without obscuring nearby enemies.
  - Validate: Browser fixture and screenshot check pass.

### US-F08-01: Protect Organ Integrity

- [x] **T-F08-01-A: Add Organ Integrity state**
  - Change: Initialize and clamp integrity with a typed damage operation.
  - Review: Health mutation has one ownership point.
  - Validate: Normal, zero, overkill, and repeated-damage tests pass.
- [x] **T-F08-01-B: Resolve enemy leaks**
  - Change: Mark route-complete enemies leaked, apply core damage once, and suppress kill rewards.
  - Review: Leak and defeat are mutually exclusive outcomes.
  - Validate: Single leak, simultaneous leaks, no reward, and no-repeat tests pass.
- [x] **T-F08-01-C: Render core damage feedback**
  - Change: Update core pulse/intensity and add restrained leak flash.
  - Review: Visual state derives from integrity and does not move the pointer coordinate system.
  - Validate: Browser test forces a leak and verifies integrity and core state.

### US-F08-02: Win the Defence

- [x] **T-F08-02-A: Implement victory predicate**
  - Change: Enter victory only after final queue, living enemies, and pending split children are empty.
  - Review: Terminal transition occurs once.
  - Validate: Every near-win edge case and true victory test passes.
- [x] **T-F08-02-B: Add victory overlay shell**
  - Change: Show Host Stabilized and Retry, New Map, and Menu commands.
  - Review: Combat input is blocked beneath the overlay.
  - Validate: Playwright deterministic fixture reaches victory and checks controls.

### US-F08-03: Lose the Defence

- [x] **T-F08-03-A: Implement defeat transition**
  - Change: Enter defeat immediately when integrity reaches zero and stop later gameplay mutation.
  - Review: Defeat wins any same-tick race with rewards or progression.
  - Validate: Exact-zero, overkill, simultaneous event, and terminal-state tests pass.
- [x] **T-F08-03-B: Add defeat overlay and retry reset**
  - Change: Show Host Compromised and create a clean retry session.
  - Review: No old IDs, queues, clocks, or effects survive retry.
  - Validate: Playwright reaches defeat, retries, and checks initial state.

### Review Gate 2: Complete Enemy Loop (Passed)

Review enemies spawning, following the path, damaging the core, progressing waves, and reaching both outcomes. This slice is playable without towers and has deterministic victory/defeat fixtures.

## 5. Economy, Towers, and Placement

### US-F07-01: Earn and Spend ATP

- [x] **T-F07-01-A: Add ATP ledger**
  - Change: Add starting balance, typed credits/debits, and transaction records.
  - Review: ATP cannot become negative and failed debits are atomic.
  - Validate: Credit, exact spend, insufficient spend, and boundary tests pass.
- [x] **T-F07-01-B: Award enemy and wave ATP**
  - Change: Connect defeat and wave-clear events to configured rewards.
  - Review: Leaks and duplicate cleanup grant nothing.
  - Validate: Kill, leak, wave, and duplicate-event tests pass.
- [x] **T-F07-01-C: Display ATP changes**
  - Change: Bind HUD balance and concise gain/cost feedback to ledger events.
  - Review: Animation cannot become the displayed source of truth.
  - Validate: Playwright forces reward/spend and verifies exact HUD values.

### US-F05-01: Use Rapid Single-Target Damage

- [x] **T-F05-01-A: Add tower definitions and targeting**
  - Change: Define common tower state and deterministic First target selection.
  - Review: Range and target eligibility use stable entity IDs.
  - Validate: In-range, out-of-range, tie, dead-target, and no-target tests pass.
- [x] **T-F05-01-B: Implement IgG cadence and projectile**
  - Change: Fire one cyan pulse after each completed interval and resolve one-target damage.
  - Review: Missing targets fizzle safely.
  - Validate: Cadence, single-target, target-disappears, and damage tests pass.
- [x] **T-F05-01-C: Render IgG combat**
  - Change: Add temporary IgG cell art, recoil, pulse trail, and hit flash.
  - Review: Visual projectile tracks simulation identity without owning damage.
  - Validate: Browser combat fixture and focused screenshot pass.

### US-F05-02: Use Area Damage

- [x] **T-F05-02-A: Implement impact-position projectiles**
  - Change: Support projectiles resolving at a target or retained impact position.
  - Review: Target removal has one explicit behavior.
  - Validate: Moving, removed, and completed-target cases pass.
- [x] **T-F05-02-B: Implement IgM splash**
  - Change: Apply configured damage to living enemies within inclusive impact radius.
  - Review: Boundary distance calculation is shared and deterministic.
  - Validate: Inside, edge, outside, dead, and multi-target tests pass.
- [x] **T-F05-02-C: Render IgM combat**
  - Change: Add temporary IgM cell art, arcing cluster shot, and magenta impact ring.
  - Review: Splash radius is readable without implying a different gameplay radius.
  - Validate: Browser grouped-enemy fixture and screenshot pass.

### US-F05-03: Slow Dangerous Enemies

- [x] **T-F05-03-A: Add timed status effects**
  - Change: Model source, magnitude, duration, refresh/stack rule, and expiry.
  - Review: Effective speed is derived and bounded.
  - Validate: Apply, refresh, stack policy, expiry, and minimum-speed tests pass.
- [x] **T-F05-03-B: Implement IgA tether**
  - Change: Apply periodic damage and slow while an eligible target remains locked.
  - Review: Target loss ends the tether cleanly.
  - Validate: Damage cadence, slow, range exit, target death, and reacquisition tests pass.
- [x] **T-F05-03-C: Render IgA combat**
  - Change: Add temporary IgA cell art, emerald tether, and slowed-enemy membrane effect.
  - Review: Tether endpoint and status remain aligned at all speeds.
  - Validate: Browser fixture verifies visible tether and reduced progress rate.

### US-F06-01: Purchase and Place a Tower

- [x] **T-F06-01-A: Add tower purchase command**
  - Change: Atomically validate cell and ATP, create tower, and debit cost.
  - Review: Command returns typed placement failures.
  - Validate: Success, insufficient ATP, occupied, path, blocked, and stale-state tests pass.
- [x] **T-F06-01-B: Build tower dock**
  - Change: Add IgG, IgM, and IgA controls with costs, roles, selection, and hotkeys.
  - Review: Stable dimensions prevent affordability changes from shifting layout.
  - Validate: Playwright selects each tower by pointer and keyboard.
- [x] **T-F06-01-C: Build placement interaction**
  - Change: Add ghost, range ring, confirm, Escape/right-click cancellation, and synthesis feedback.
  - Review: Preview and command use the same resolved cell and validator.
  - Validate: Playwright places one tower and cancels another.

### US-F06-02: Understand a Rejected Purchase

- [x] **T-F06-02-A: Present validation reasons**
  - Change: Map typed placement failures to concise visual feedback.
  - Review: No generic error hides a correctable cause.
  - Validate: Browser fixtures verify each failure message/state.
- [x] **T-F06-02-B: Preserve placement after rejection**
  - Change: Keep or cancel placement mode according to documented interaction rules without stale previews.
  - Review: Rejected transactions never mutate ATP or occupancy.
  - Validate: Playwright rejects then completes a valid placement.

### US-F14-01: Track Live Score

- [x] **T-F14-01-A: Define score ledger**
  - Change: Add documented kill, wave, early-start, and integrity score events.
  - Review: Live score is an integer sum of immutable event values.
  - Validate: Component, duplicate, and sum tests pass.
- [x] **T-F14-01-B: Connect score events**
  - Change: Award events from enemy defeat and wave completion, with no points for leaks.
  - Review: Score ownership is separate from ATP ownership.
  - Validate: Scripted event sequence produces exact expected score.
- [x] **T-F14-01-C: Show required live score**
  - Change: Bind score to permanent HUD telemetry.
  - Review: Score is present from the first playable build.
  - Validate: Playwright verifies score changes after a kill.

### US-F09-01: Monitor Required Game State

- [x] **T-F09-01-A: Complete required HUD**
  - Change: Present wave, ATP, score, and Organ Integrity in one stable telemetry band.
  - Review: Share Tech Mono is used for values and labels remain unambiguous.
  - Validate: Playwright asserts all four values and exact state synchronization.
- [x] **T-F09-01-B: Make gameplay layout responsive**
  - Change: Constrain HUD, board, tower dock, and overlays for target desktop and laptop sizes.
  - Review: Text, canvas, and controls do not overlap or shift during value changes.
  - Validate: Screenshot checks at agreed wide and laptop viewports pass.

### Review Gate 3: Required Playable Game (Passed)

Review all eight required features together. Place IgG, IgM, and IgA; earn and spend ATP; monitor all HUD values; play waves; and reach a win or loss. This is the protected Day 1 checkpoint.

## 6. Upgrades and Fourth Tower

### US-F10-01: Inspect a Tower

- [x] **T-F10-01-A: Add tower selection state**
  - Change: Select one placed tower by stable ID and clear selection when it disappears.
  - Review: Selection is presentation state with validated entity lookup.
  - Validate: Select, switch, deselect, and removed-tower tests pass.
- [x] **T-F10-01-B: Build inspection panel**
  - Change: Show current stats, target mode, investment, next upgrade, and sell value.
  - Review: Values derive from effective simulation stats.
  - Validate: Playwright checks panel values for all required towers.
- [x] **T-F10-01-C: Add target preference**
  - Change: Support First and Strongest where allowed.
  - Review: Target changes are explicit commands.
  - Validate: Selection unit tests and browser control test pass.

### US-F10-02: Choose an Upgrade Branch

- [x] **T-F10-02-A: Define upgrade data and prerequisites**
  - Change: Add base, branch, and final upgrade definitions with costs and effects.
  - Review: Invalid branch graphs fail validation.
  - Validate: Data-schema and prerequisite tests pass.
- [x] **T-F10-02-B: Add atomic upgrade command**
  - Change: Validate tower, prerequisite, branch lock, and ATP before applying an upgrade.
  - Review: Failure leaves tower and ledger unchanged.
  - Validate: Success, affordability, duplicate, missing-prerequisite, and branch-lock tests pass.
- [x] **T-F10-02-C: Build upgrade choices**
  - Change: Show before/after values and two branch controls with permanent lock feedback.
  - Review: Player understands the irreversible choice before purchase.
  - Validate: Playwright buys one branch and verifies the other is disabled.
- [x] **T-F10-02-D: Implement branch combat effects**
  - Change: Add branch A/B behavior for IgG, IgM, and IgA; final-tier effects may remain P2.
  - Review: Each effect has a focused behavior test and distinct feedback.
  - Validate: Per-branch unit fixtures pass.

### US-F05-04: Focus a Priority Target

- [x] **T-F05-04-A: Implement beam lock and ramp**
  - Change: Track locked target and bounded ramp duration for Killer T-Cell.
  - Review: Reset conditions are exhaustive.
  - Validate: Lock, ramp, cap, death, range-exit, and target-change tests pass.
- [x] **T-F05-04-B: Add Killer T-Cell purchase data**
  - Change: Add cost, stats, targeting modes, upgrades, and dock entry.
  - Review: Role and price differentiate it from IgG.
  - Validate: Data and purchase tests pass.
- [x] **T-F05-04-C: Render Killer T-Cell combat**
  - Change: Add amber cell sprite, long beam, and visual ramp intensity.
  - Review: Beam intensity communicates ramp without obscuring targets.
  - Validate: Browser boss fixture and screenshot pass.

### US-F07-02: Sell a Tower

- [x] **T-F07-02-A: Calculate refund**
  - Change: Define one rounding rule for 70% of base plus upgrade investment.
  - Review: UI and command share the same calculation.
  - Validate: Base, upgraded, fractional, and maximum-investment tests pass.
- [x] **T-F07-02-B: Add sell command and control**
  - Change: Remove the selected tower, credit once, clear selection, and show refund.
  - Review: Stale IDs fail atomically.
  - Validate: Unit transaction tests and Playwright sell flow pass.

### Review Gate 4: Strategic Progression (Passed)

Review tower inspection, targeting choices, selling, one full branch for each required tower, and Killer T-Cell boss combat.

## 7. Controls, Variety, and Replay Configuration

### US-F11-01: Pause and Resume

- [x] **T-F11-01-A: Add pause commands**
  - Change: Pause/resume from Playing with button and Space handling.
  - Review: Focused form controls do not trigger accidental pause shortcuts.
  - Validate: Phase and keyboard tests pass.
- [x] **T-F11-01-B: Freeze all simulation clocks**
  - Change: Ensure movement, cooldowns, projectiles, statuses, spawning, and countdown stop.
  - Review: Resume has no accumulated time jump.
  - Validate: Snapshot-before/after pause simulation test passes.
- [x] **T-F11-01-C: Build pause overlay**
  - Change: Add Resume, Restart, Mute, and Menu commands over a readable frozen board.
  - Review: Overlay is not nested in another card and blocks board input.
  - Validate: Playwright pause/resume flow passes.

### US-F11-02: Change Simulation Speed

- [x] **T-F11-02-A: Model speed multiplier**
  - Change: Add 1x/2x/3x command and fixed-tick throughput handling.
  - Review: Tick size remains fixed.
  - Validate: Identical command scripts at each speed end in equal state.
- [x] **T-F11-02-B: Build segmented speed control**
  - Change: Add stable 1x/2x/3x control and active state.
  - Review: Changing speed while paused does not resume the game.
  - Validate: Playwright verifies selection, faster timer progression, and paused behavior.

### US-F11-03: Restart or Leave a Session

- [x] **T-F11-03-A: Recreate a clean session**
  - Change: Restart with selected configuration and known seed while replacing transient state.
  - Review: No old entity IDs, queues, events, or effects survive.
  - Validate: Deep initial-state equivalence test passes.
- [x] **T-F11-03-B: Add confirmation and menu exit**
  - Change: Confirm destructive navigation and dispose game/audio presentation resources on exit.
  - Review: Cancel returns to the exact paused state.
  - Validate: Playwright covers cancel, restart, and quit.

### US-F12-01: Choose a Map

- [x] **T-F12-01-A: Add map registry**
  - Change: Register map metadata, preview path, gameplay path, and entry list.
  - Review: Selection refers to IDs, not duplicated route data.
  - Validate: Registry uniqueness and route validation tests pass.
- [x] **T-F12-01-B: Add Vascular Run and Lymph Spiral**
  - Change: Define and render two complete maps with distinct coverage patterns.
  - Review: Both provide legal placements and finishable paths.
  - Validate: Path, spawn-to-core, and scripted-strategy tests pass per map.
- [x] **T-F12-01-C: Build map selection UI**
  - Change: Show map names, route previews, descriptions, and best-score slots.
  - Review: Brand/map is a first-viewport signal and cards remain compact.
  - Validate: Playwright selects each map and verifies loaded map ID.
- [x] **T-F12-01-D: Add Neural Fork**
  - Change: Define two entry routes converging near one core.
  - Review: P2 task can be deferred without affecting two-map selection.
  - Validate: Both queues, traversal, wave completion, and strategy simulation tests pass.

### US-F12-02: Choose a Difficulty

- [x] **T-F12-02-A: Define difficulty modifiers**
  - Change: Add Resident, Acute, and Critical health, speed, starting ATP, and reward multipliers.
  - Review: Modifiers apply once during state creation.
  - Validate: Exact derived-stat tests pass for each difficulty.
- [x] **T-F12-02-B: Build difficulty control**
  - Change: Add a segmented selector with concise modifier summaries.
  - Review: Selected difficulty remains visible through session launch.
  - Validate: Playwright launches each option and verifies configuration.

### US-F03-03: Send a Wave Early

- [x] **T-F03-03-A: Implement early-start transaction**
  - Change: Convert remaining countdown into one ATP and score bonus, then start the wave.
  - Review: Bonus formula is documented and deterministic.
  - Validate: Full-time, partial-time, zero-time, paused, and duplicate tests pass.
- [x] **T-F03-03-B: Add Send Early control**
  - Change: Show remaining bonus and disable outside pending state.
  - Review: Control gives immediate reward and wave feedback.
  - Validate: Playwright starts early and verifies wave, ATP, and score deltas.

### Review Gate 5: Bonus Gameplay Breadth (Passed)

Review pause, speed, restart, two or three maps, three difficulties, four enemy types, and Send Early. Confirm each feature is independently demonstrable.

## 8. Cellular Art, Audio, and Polish

### US-F15-03: Load Detailed Cellular Sprites Efficiently

- [x] **T-F15-03-A: Establish asset provenance manifest**
  - Change: Record source, authoring method, license, dimensions, and compression for each shipped sprite.
  - Review: Reference images are not copied into the build without redistribution rights.
  - Validate: Every atlas source entry has a permitted provenance value.
- [x] **T-F15-03-B: Create first original sprite atlas**
  - Change: Add transparent WebP frames for one tower and one enemy at gameplay scale.
  - Review: Soft membranes, internal structures, and microscopy inspiration read without gore.
  - Validate: Atlas size budget, transparency, load, and visual check pass.
- [x] **T-F15-03-C: Add atlas loader and fallback**
  - Change: Preload shared textures before play and show a lightweight fallback if loading fails.
  - Review: Failure cannot trap the app on boot.
  - Validate: Playwright covers successful and intercepted-failure loads.
- [x] **T-F15-03-D: Complete and optimize sprite atlas**
  - Change: Replace temporary unit art, reuse textures, and limit frame sequences.
  - Review: Detail remains clear at actual rendered size rather than only when enlarged.
  - Validate: Asset budget report and many-sprite performance fixture pass.

### US-F15-01: Experience a Cohesive Neon Body

- [x] **T-F15-01-A: Add visual tokens and fonts**
  - Change: Define semantic colors, spacing, dimensions, motion, glow, and the three approved font roles.
  - Review: UI and renderer consume the same semantic palette.
  - Validate: Font preload/fallback and layout screenshot checks pass.
- [x] **T-F15-01-B: Style menus and HUD**
  - Change: Apply laboratory telemetry and restrained neon treatment without decorative card nesting.
  - Review: Syne Mono, Share Tech Mono, and Rajdhani roles are consistent.
  - Validate: Main menu, level select, gameplay, pause, and result screenshots pass.
- [x] **T-F15-01-C: Style board and units**
  - Change: Add translucent cellular environment, path flow, membranes, and ally/enemy visual language.
  - Review: Theme is microscopy-inspired, aesthetically pleasing, and non-gross.
  - Validate: Full-game manual art-direction review passes.

### US-F13-01: Receive Responsive Combat Feedback

- [x] **T-F13-01-A: Add presentation event router**
  - Change: Map domain events to disposable visual and audio cues.
  - Review: Presentation failures cannot alter simulation state.
  - Validate: Router unit tests cover each event and cap behavior.
- [x] **T-F13-01-B: Add combat effects**
  - Change: Add recoil, trails, impacts, shatter particles, and capped damage numbers.
  - Review: Effects communicate tower behavior and damage location.
  - Validate: Focused browser fixtures and effect-cleanup counters pass.
- [x] **T-F13-01-C: Add core and wave effects**
  - Change: Add wave announcement, integrity pulse states, leak flash, and brief camera shake.
  - Review: Camera transform does not affect pointer hit testing.
  - Validate: Browser leak/wave fixtures and pointer alignment test pass.
- [x] **T-F13-01-D: Add procedural sound effects**
  - Change: Synthesize distinct cues for placement, attacks, impact, kill, upgrade, wave, leak, and results.
  - Review: Sound frequencies and levels remain comfortable during dense combat.
  - Validate: Audio routing tests and manual listening check pass.

### US-F13-02: Control Audio

- [x] **T-F13-02-A: Respect browser audio lifecycle**
  - Change: Create/resume audio context only after user interaction and dispose it cleanly.
  - Review: Boot produces no autoplay warning.
  - Validate: Playwright checks pre-interaction and post-interaction audio state.
- [x] **T-F13-02-B: Add persistent mute**
  - Change: Provide mute in menus and gameplay with validated local persistence.
  - Review: Visual mute state remains synchronized across screens.
  - Validate: Browser toggle/reload test passes.
- [x] **T-F13-02-C: Add ambient track**
  - Change: Add low-intensity procedural ambience below effect levels.
  - Review: P2 task can be cut while preserving sound effects.
  - Validate: Loop, mute, disposal, and manual mix checks pass.

### US-F15-02: Read the Game During Heavy Combat

- [x] **T-F15-02-A: Add non-color visual cues**
  - Change: Differentiate units and statuses through silhouette, membrane motion, rings, and icons.
  - Review: Color is never the only critical cue.
  - Validate: Desaturated screenshot review and status fixture pass.
- [x] **T-F15-02-B: Enforce effect and object budgets**
  - Change: Cap particles, damage text, simultaneous sounds, and reusable transient objects.
  - Review: Caps degrade polish gracefully, not gameplay information.
  - Validate: Stress counters stay within configured limits.
- [x] **T-F15-02-C: Profile and tune stress wave**
  - Change: Measure a defined high-enemy/high-tower scenario and optimize measured bottlenecks only.
  - Review: Record device, viewport, counts, and observed frame rate.
  - Validate: Target laptop meets approved responsiveness threshold without state errors.

### Review Gate 6: Final Art and Feel (Passed)

Review the original microscopy-inspired sprite atlas, font roles, complete visual language, audio controls, combat feedback, and measured stress behavior.

## 9. Results and Persistence

### US-F14-02: Understand the Result

- [x] **T-F14-02-A: Record session statistics**
  - Change: Track waves, kills by type, ATP earned/spent, leaks, and score components.
  - Review: Statistics derive from domain transactions and events.
  - Validate: Scripted session totals reconcile exactly.
- [x] **T-F14-02-B: Build results view**
  - Change: Present outcome, summary statistics, score breakdown, and navigation.
  - Review: Result is scan-friendly within the demo and not a card inside a card.
  - Validate: Playwright checks victory and defeat result fixtures.

### US-F14-03: Compete Against Local High Scores

- [x] **T-F14-03-A: Define versioned score storage**
  - Change: Parse, validate, migrate or discard, sort, and trim entries by map/difficulty.
  - Review: Corrupt storage cannot prevent boot.
  - Validate: Empty, valid, tied, over-ten, old-version, and corrupt tests pass.
- [x] **T-F14-03-B: Save qualifying results**
  - Change: Insert completed score once and report its rank.
  - Review: Retry/navigation cannot duplicate a result.
  - Validate: Qualification, duplicate, and separate-table tests pass.
- [x] **T-F14-03-C: Build high-score screen**
  - Change: Add map/difficulty filters and ranked entries from the main menu.
  - Review: Empty state and long values remain polished.
  - Validate: Playwright completes a run, reloads, filters, and finds the score.

### Review Gate 7: Complete Product Journey (Passed)

Review main menu through results and persistent high scores, including both victory and defeat routes. At this point all planned player-facing features are complete.

## 10. Delivery and Verification

### US-F16-02: Verify Game Rules Automatically

- [x] **T-F16-02-A: Audit critical unit coverage**
  - Change: Map every P0 rule and rejection path to a focused Vitest test.
  - Review: Remove redundant tests and fill uncovered risk boundaries.
  - Validate: Full unit suite passes repeatedly.
- [x] **T-F16-02-B: Add scripted victory and defeat simulations**
  - Change: Run a known strategy to victory and a no-tower game to defeat headlessly.
  - Review: Fixtures use public commands rather than mutating internals.
  - Validate: Both scenarios pass with fixed seeds.
- [x] **T-F16-02-C: Add speed-equivalence and stress simulations**
  - Change: Verify speed-independent outcome and absence of stuck/invalid entities under load.
  - Review: Failures report seed and compact state summary.
  - Validate: Simulation suite passes repeatedly.

### US-F16-03: Verify the User Journey Automatically

- [x] **T-F16-03-A: Cover required browser journey**
  - Change: Test menu, level select, HUD, valid/invalid placement, ATP, waves, pause, and result.
  - Review: Use semantic DOM hooks and computed canvas coordinates, not brittle pixel guesses.
  - Validate: Test passes against production preview three consecutive times.
- [x] **T-F16-03-B: Cover bonus browser journey**
  - Change: Test upgrade branch, sell, speed, Send Early, map/difficulty, mute, results, and persistence.
  - Review: Deterministic shortcuts are enabled only in explicit test mode.
  - Validate: Bonus suite passes three consecutive times.
- [x] **T-F16-03-C: Add viewport visual checks**
  - Change: Capture stable menu, gameplay, pause, and result states at target viewports.
  - Review: Mask nondeterministic effects or seed them rather than widening thresholds.
  - Validate: Baseline comparisons pass.

### US-F16-01: Run and Review the Project

- [x] **T-F16-01-A: Document setup and controls**
  - Change: Add clean-install, development, test, build, preview, deployment, input, and browser requirements.
  - Review: Commands are copied from passing local validation.
  - Validate: Follow instructions from a clean dependency install.
- [x] **T-F16-01-B: Document architecture and data extension**
  - Change: Explain module ownership, dependency direction, game loop, events, adding content, and persistence.
  - Review: Diagram matches implemented imports and ownership.
  - Validate: Link and command checks pass; another developer can locate extension points.
- [x] **T-F16-01-C: Publish feature checklist and limitations**
  - Change: Mark only demonstrated features complete and record known bugs/future work honestly.
  - Review: Every claim links to visible proof or a test command.
  - Validate: Manual trace against product requirements passes.
- [x] **T-F16-01-D: Validate clean production build**
  - Change: Resolve only release-blocking type, test, build, and asset issues.
  - Review: Generated output and bundle size are summarized without committing unnecessary artifacts.
  - Validate: Clean install, typecheck, unit, E2E, and production build all pass.

### US-F16-04: Demonstrate the Game Reliably

- [x] **T-F16-04-A: Add known-good demo configuration**
  - Change: Define a production-safe seed and shortened demonstrable wave sequence without hidden cheats.
  - Review: Demo remains representative of normal gameplay.
  - Validate: Complete the route twice from fresh loads.
- [x] **T-F16-04-B: Prepare five-minute run sheet**
  - Change: Time required features, bonus features, architecture, tests, and result screen.
  - Review: Feature claims fit within five minutes with room for recovery.
  - Validate: Two timed rehearsals finish within target.
- [x] **T-F16-04-C: Prepare launch fallback**
  - Change: Verify hosted URL and local production build on the presentation device.
  - Review: Fonts and assets remain available if the network fails.
  - Validate: Run the full route once online and once with network disabled.

### Review Gate 8: Submission Candidate (Passed)

Review the production build, complete test evidence, feature checklist, known limitations, architecture explanation, bundle size, and timed demo. Only release-blocking fixes are accepted after this gate.

## 11. Story Coverage Index

| User Story | Tasks | Review Gate |
| --- | --- | --- |
| US-F01-01 | T-F01-01-A through C | 1 |
| US-F01-02 | T-F01-02-A through C | 1 |
| US-F02-01 | T-F02-01-A through C | 1 |
| US-F02-02 | T-F02-02-A through C | 1 |
| US-F03-01 | T-F03-01-A through C | 2 |
| US-F03-02 | T-F03-02-A through C | 2 |
| US-F03-03 | T-F03-03-A through B | 5 |
| US-F04-01 | T-F04-01-A through C | 2 and 5 |
| US-F04-02 | T-F04-02-A through C | 5 |
| US-F05-01 | T-F05-01-A through C | 3 |
| US-F05-02 | T-F05-02-A through C | 3 |
| US-F05-03 | T-F05-03-A through C | 3 |
| US-F05-04 | T-F05-04-A through C | 4 |
| US-F06-01 | T-F06-01-A through C | 3 |
| US-F06-02 | T-F06-02-A through B | 3 |
| US-F07-01 | T-F07-01-A through C | 3 |
| US-F07-02 | T-F07-02-A through B | 4 |
| US-F08-01 | T-F08-01-A through C | 2 |
| US-F08-02 | T-F08-02-A through B | 2 |
| US-F08-03 | T-F08-03-A through B | 2 |
| US-F09-01 | T-F09-01-A through B | 3 |
| US-F10-01 | T-F10-01-A through C | 4 |
| US-F10-02 | T-F10-02-A through D | 4 |
| US-F11-01 | T-F11-01-A through C | 5 |
| US-F11-02 | T-F11-02-A through B | 5 |
| US-F11-03 | T-F11-03-A through B | 5 |
| US-F12-01 | T-F12-01-A through D | 5 |
| US-F12-02 | T-F12-02-A through B | 5 |
| US-F13-01 | T-F13-01-A through D | 6 |
| US-F13-02 | T-F13-02-A through C | 6 |
| US-F14-01 | T-F14-01-A through C | 3 |
| US-F14-02 | T-F14-02-A through B | 7 |
| US-F14-03 | T-F14-03-A through C | 7 |
| US-F15-01 | T-F15-01-A through C | 6 |
| US-F15-02 | T-F15-02-A through C | 6 |
| US-F15-03 | T-F15-03-A through D | 6 |
| US-F16-01 | T-F16-01-A through D | 8 |
| US-F16-02 | T-F16-02-A through C | 8 |
| US-F16-03 | T-F16-03-A through C | 8 |
| US-F16-04 | T-F16-04-A through C | 8 |

Coverage: 40 of 40 approved user stories decomposed.
