# Feature Decomposition

Status: Approved scope, ready for implementation  
Source: [Product Plan](PRODUCT_PLAN.md)  
Story backlog: [User Stories](USER_STORIES.md)

## 1. Backlog Rules

- P0 features satisfy required gameplay or submission requirements and are never cut.
- P1 features satisfy optional and bonus criteria and should be protected.
- P2 subfeatures are polish or additional breadth and are reduced first if the schedule slips.
- A feature is complete only when its implementation, acceptance tests, and judge-visible proof all pass.
- Feature completion is tracked by IDs so implementation, tests, documentation, and the demo remain traceable.

## 2. Feature Summary

| Feature | Name | Priority | Brief Coverage | Build Block | Depends On |
| --- | --- | --- | --- | --- | --- |
| F01 | Runtime and Game Session | P0 | Technical foundation | 1 | None |
| F02 | Map and Enemy Path | P0 | R1 | 1 and 4 | F01 |
| F03 | Wave Spawning and Progression | P0 | R2 | 2 and 4 | F01, F02 |
| F04 | Enemy Lifecycle and Variety | P0/P1 | R2, R6, B1 | 2 and 6 | F02, F03 |
| F05 | Distinct Antibody Combat & 5-Branch Matrix | P0/P1 | R3 | 3, 4, and 5 | F01, F04 |
| F06 | Tower Placement, Membrane Rings & Purchase | P0 | R4 | 3 and 4 | F02, F05, F07 |
| F07 | ATP Economy, Synthesis Audio & Recycling | P0 | R5 | 3 and 4 | F01 |
| F08 | Integrity, Victory, and Defeat | P0 | R6, R7 | 2 and 4 | F03, F04 |
| F09 | Gameplay HUD & Biological SVG Icons | P0 | R8 | 3 and 4 | F03, F07, F08, F14 |
| F10 | Tower Inspection & 5-Branch Upgrades | P1 | B2 | 5 | F05, F06, F07 |
| F11 | Session Controls | P1 | B3 | 6 | F01, F03, F08 |
| F12 | Maps and Difficulty Selection (incl. Extreme) | P1 | B4 | 6 | F02, F03, F07 |
| F13 | Sound Synthesizer & ATP SFX | P1 | B5 | 7 | F04, F05, F08 |
| F14 | Score, Results, and High Scores | P0/P1 | R8, B6 | 3 and 8 | F03, F04, F08 |
| F15 | Microcosm Biological Experience & Fiber Sprites | P1 | B7 | 4 and 7 | F02, F05, F09, F13 |
| F16 | Architecture, Tests, and Delivery | P0 | T1, T2, T3 | Continuous, 9, and 10 | All completed features |

## 3. Feature Details

### F01: Runtime and Game Session

Goal: Provide a deterministic browser game loop and valid lifecycle states.

| Subfeature | Priority | Deliverable | Definition of Done |
| --- | --- | --- | --- |
| F01.1 Fixed timestep | P0 | Accumulator-based simulation at a fixed tick interval | Identical seed and commands produce identical simulation results across render frame rates. |
| F01.2 Game phases | P0 | Boot, menu, preparation, playing, paused, victory, and defeat states | Only valid phase transitions compile and each transition has a test. |
| F01.3 Seeded randomness | P0 | Seeded random source for reproducible runs | Restarting with the same seed reproduces spawn and combat randomness. |
| F01.4 Command boundary | P0 | Typed commands and typed success or failure results | UI and renderer cannot directly mutate simulation state. |
| F01.5 Domain events | P1 | Events for placement, firing, kills, leaks, waves, upgrades, and results | UI, audio, and effects react without adding presentation logic to the simulation. |

### F02: Map and Enemy Path

Goal: Make the route and legal build space immediately understandable.

| Subfeature | Priority | Deliverable | Definition of Done |
| --- | --- | --- | --- |
| F02.1 Grid model | P0 | Rows, columns, blocked cells, and coordinate conversion | Every in-bounds cell resolves consistently between simulation and renderer. |
| F02.2 Waypoint route | P0 | Ordered route from entry to cellular core | Route validation rejects missing, disconnected, or out-of-bounds waypoints. |
| F02.3 Path traversal | P0 | Distance-based enemy movement across segments | Enemies cannot skip, reverse, or become stuck at segment boundaries. |
| F02.4 Route rendering | P0 | Luminous channel, entry marker, core marker, and flow direction | The complete route is visible before wave one and remains readable in combat. |
| F02.5 Buildability overlay | P0 | Valid, invalid, blocked, path, and occupied cell states | Preview state matches placement validation exactly. |

### F03: Wave Spawning and Progression

Goal: Deliver predictable escalating waves with visible pacing.

| Subfeature | Priority | Deliverable | Definition of Done |
| --- | --- | --- | --- |
| F03.1 Wave definitions | P0 | Data records for groups, enemy type, count, interval, and delay | Invalid enemy types, negative counts, and invalid intervals are rejected. |
| F03.2 Spawn queue | P0 | Timed enemy spawning from one or more entries | Exact configured counts spawn once and in the configured order. |
| F03.3 Wave state | P0 | Pending, spawning, active, cleared, and final states | A wave clears only when its queue and active enemies are both empty. |
| F03.4 Inter-wave countdown | P0 | Preparation timer between waves | Timer pauses with the game and never starts a wave twice. |
| F03.5 Send Early | P1 | Player-triggered start with time-based ATP and score bonus | Remaining time converts to one bonus and the wave starts immediately. |
| F03.6 Composition preview | P1 | Compact upcoming enemy summary | Preview counts match the wave definition. |

### F04: Enemy Lifecycle and Variety

Goal: Provide reliable enemy movement plus threats that require different tower choices.

| Subfeature | Priority | Deliverable | Definition of Done |
| --- | --- | --- | --- |
| F04.1 Base enemy | P0 | Health, speed, reward, core damage, path progress, and status state | Damage, movement, defeat, reward, and leak happen exactly once. |
| F04.2 Rhinovirus | P1 | Fast, fragile enemy | Its speed is materially higher and health lower than Influenza. |
| F04.3 Influenza | P0 | Balanced baseline enemy | It establishes the reference health and speed profile. |
| F04.4 Corona Titan | P1 | Slow armored enemy with flat reduction | Armor reduces each hit without reducing valid damage below one. |
| F04.5 Retro-Mutant | P1 | Boss that splits into four Rhinoviruses | Children spawn once at the parent's path progress and continue toward the core. |
| F04.6 Status effects | P0 | Timed slow and damage-over-time support | Effects refresh or stack by explicit rules and expire deterministically. |
| F04.7 Cleanup | P0 | End-of-tick removal for defeated, leaked, and expired entities | No system retains an invalid target or processes a removed enemy. |

### F05: Distinct Antibody Combat

Goal: Provide at least three strategically and visually different tower behaviours.

| Subfeature | Priority | Deliverable | Definition of Done |
| --- | --- | --- | --- |
| F05.1 Shared tower model | P0 | Cost, range, cadence, target mode, level, branch, and investment | Tower statistics come from validated data definitions. |
| F05.2 Target selection | P0 | First and Strongest target modes | Eligible targets are in range, alive, and selected deterministically. |
| F05.3 IgG Pulse Sentinel | P0 | Rapid single-target projectile | It attacks frequently and damages only its selected target. |
| F05.4 IgM Cluster Cannon | P0 | Slow area-impact projectile | It damages every enemy inside the impact radius and none outside it. |
| F05.5 IgA Cryo-Tether | P0 | Continuous damage and slow tether | It applies visible damage and a bounded temporary speed reduction. |
| F05.6 Killer T-Cell Prism | P1 | Long-range beam with target-lock damage ramp | Ramp increases while locked and resets when the target changes or leaves range. |
| F05.7 Combat visuals | P0 | Distinct silhouette, color, projectile, and impact for each tower | A viewer can identify all three required behaviours without opening a stat panel. |
| F05.8 Specialized ammunition & 5-Branch trees | P1 | Unique munitions (bio-photons, goo globs, plasma clouds, thermal lances) and 5 upgrade branches (Kinetic, Cryo, Acid, Thermal, Phagocytic) | Each branch manifests distinct projectile visuals, status mechanics, and apex tier 4 scaling. |

### F06: Tower Placement and Purchase

Goal: Make purchasing and placement fast, clear, and difficult to misuse.

| Subfeature | Priority | Deliverable | Definition of Done |
| --- | --- | --- | --- |
| F06.1 Tower dock | P0 | Four tower choices with role, cost, and hotkey | Affordable and unaffordable states update with ATP. |
| F06.2 Placement mode | P0 | Pointer-following tower ghost and range ring | Escape or right click cancels without changing state. |
| F06.3 Placement validation | P0 | Bounds, terrain, path, occupancy, and affordability checks | Simulation and visual preview return the same result for every cell. |
| F06.4 Purchase transaction | P0 | Atomic tower creation and ATP deduction | Success charges once; failure creates nothing and charges nothing. |
| F06.5 Placement feedback | P0 | Valid cyan state, invalid coral state, sound, and synthesis animation | The result is visible immediately and does not shift the board layout. |
| F06.6 Circular Bio-Membrane Rings | P1 | Organic circular placement rings with animated glow auras | Placement replaces rigid square tiles with translucent pulsing biological membranes. |

### F07: ATP Economy

Goal: Support meaningful purchasing decisions with exact, visible resource changes.

| Subfeature | Priority | Deliverable | Definition of Done |
| --- | --- | --- | --- |
| F07.1 Starting ATP | P0 | Difficulty-based initial balance | Each difficulty starts with its documented value. |
| F07.2 Kill rewards | P0 | Enemy-specific ATP rewards | Each defeated enemy awards its value once; leaked enemies award nothing. |
| F07.3 Wave rewards | P0 | Clear bonus and optional Send Early bonus | Bonuses are deterministic and itemized for score or results. |
| F07.4 Spending | P0 | Tower and upgrade charges | Transactions cannot make ATP negative. |
| F07.5 Selling & Tactical Recycling | P1 | Dynamic depreciation refund and tower recycling command (`RECYCLE_TOWER`) | Reclaims invested ATP adjusted for remaining tower lifespan. |
| F07.6 ATP Synthesizer Feedback | P1 | Dedicated Web Audio sound synthesis for ATP gain and spend | Chimes on income/rewards and thuds on expenditures trigger synchronously. |

### F08: Integrity, Victory, and Defeat

Goal: Give the player clear stakes and reliable end conditions.

| Subfeature | Priority | Deliverable | Definition of Done |
| --- | --- | --- | --- |
| F08.1 Organ Integrity | P0 | Health value initialized at 100 and clamped to 0-100 | HUD and core presentation always reflect the simulation value. |
| F08.2 Core leak | P0 | Enemy removal and configured integrity damage at route end | One enemy can damage the core no more than once. |
| F08.3 Defeat | P0 | Immediate transition when integrity reaches zero | Combat commands stop and the defeat result appears once. |
| F08.4 Victory | P0 | Transition after final queue and all active enemies are cleared | Victory cannot occur while a final-wave enemy or spawn remains. |
| F08.5 End-state input | P0 | Retry, new map, and menu actions | Each action creates the correct next state without stale entities. |

### F09: Gameplay HUD

Goal: Keep every required status visible and readable during play.

| Subfeature | Priority | Deliverable | Definition of Done |
| --- | --- | --- | --- |
| F09.1 Wave telemetry | P0 | Current wave, total waves, and countdown | Values update at state changes and match wave state. |
| F09.2 ATP telemetry | P0 | Current ATP and animated gains or costs | Display never disagrees with simulation ATP. |
| F09.3 Score telemetry | P0 | Live score | Score is visible from wave one and updates after score events. |
| F09.4 Integrity telemetry | P0 | Numeric value and compact visual meter | Critical integrity is clear without obscuring the board. |
| F09.5 Responsive layout | P0 | Stable top HUD and bottom tower dock | No overlap occurs at supported desktop and laptop viewports. |

### F10: Tower Inspection and 5-Branch Upgrades

Goal: Add strategic progression without hiding important costs or effects.

| Subfeature | Priority | Deliverable | Definition of Done |
| --- | --- | --- | --- |
| F10.1 Inspection panel | P1 | Current stats, target mode, upgrades, branch, and sell value | Selecting a tower shows values derived from current state. |
| F10.2 Base upgrade | P1 | Initial stat improvement with performance discounts | Cost and before-or-after values are shown before purchase. |
| F10.3 5-Branch specialization matrix | P1 | Five strategic branches (Kinetic, Cryo, Acid, Thermal, Phagocytic) | Purchasing a branch permanently commits the tower to that evolutionary path. |
| F10.4 Apex tier upgrades | P2 | Tier 4 Master upgrade for each branch | Boosts damage multiplier and applies apex specialization mechanics. |
| F10.5 Upgrade transaction | P1 | Atomic ATP charge, performance multiplier calculation, and stat mutation | Unaffordable or invalid upgrades leave state unchanged. |

### F11: Session Controls

Goal: Let the player manage pace and recover quickly between attempts.

| Subfeature | Priority | Deliverable | Definition of Done |
| --- | --- | --- | --- |
| F11.1 Pause and resume | P1 | Button and Space shortcut | Simulation freezes while menu interaction remains available. |
| F11.2 Speed control | P1 | 1x, 2x, and 3x segmented control | Speed changes simulation throughput without changing deterministic outcomes. |
| F11.3 Restart | P1 | Confirmation and clean session recreation | Map, difficulty, seed, ATP, score, integrity, waves, and entities reset. |
| F11.4 Quit to menu | P1 | Safe return from pause or results | No game input or audio loop survives after leaving the session. |

### F12: Maps and Difficulty Selection

Goal: Provide replay variety through configuration rather than duplicated game logic.

| Subfeature | Priority | Deliverable | Definition of Done |
| --- | --- | --- | --- |
| F12.1 Level select | P1 | Map previews, descriptions, difficulty control, and best scores | Selected configuration is visible and launches correctly. |
| F12.2 Vascular Run | P1 | Long beginner-friendly route | Route validates and provides useful build space. |
| F12.3 Lymph Spiral | P1 | Curved route with central coverage opportunities | Route validates and creates a distinct range strategy. |
| F12.4 Neural Fork | P2 | Two entries that converge near the core | Both queues and paths progress and complete correctly. |
| F12.5 Difficulty modifiers | P1 | Resident, Acute, Critical, and Extreme health, speed, and income multipliers | Modifiers apply once and are shown before launch. |

### F13: Sound, Animation, and Feedback

Goal: Make actions satisfying while preserving readability and performance.

| Subfeature | Priority | Deliverable | Definition of Done |
| --- | --- | --- | --- |
| F13.1 Procedural sound effects | P1 | Distinct placement, attack, impact, kill, leak, upgrade, wave, and result cues | Audio starts only after interaction and simultaneous sounds are capped. |
| F13.2 Ambient music | P2 | Low-intensity synthesized background loop | Loop is seamless and subordinate to action cues. |
| F13.3 Audio settings | P1 | Persistent mute control | Mute is reachable in menus and gameplay and survives reload. |
| F13.4 Combat animation | P1 | Recoil, trails, impact rings, shatter effects, and damage numbers | Effects correspond to domain events and never alter simulation. |
| F13.5 Core feedback | P1 | Integrity-dependent pulse, leak flash, and brief shake | Feedback is noticeable but does not obscure controls or telemetry. |
| F13.6 Effect budgets | P1 | Caps and pooling for short-lived visuals and sounds | Stress scenario remains responsive without unbounded objects. |
| F13.7 ATP Sound Synthesis | P1 | Dual-oscillator melodic chime (`playAtpGain`) and filtered thud (`playAtpSpend`) | Triggers synchronously with all currency earnings and expenditures. |

### F14: Score, Results, and High Scores

Goal: Make performance measurable during and after a run.

| Subfeature | Priority | Deliverable | Definition of Done |
| --- | --- | --- | --- |
| F14.1 Live score | P0 | Deterministic score events for kills, waves, early starts, and integrity | HUD total equals the sum of recorded score events. |
| F14.2 Results summary | P1 | Outcome, waves, kills, ATP earned, integrity, and score breakdown | Results reconcile exactly with final session statistics. |
| F14.3 Local high scores | P1 | Top ten per map and difficulty | Valid scores sort consistently, trim to ten, and survive reload. |
| F14.4 High-score screen | P1 | Menu view with map and difficulty filters | Stored entries display rank, score, outcome, and date. |
| F14.5 Storage validation | P1 | Versioned parsing and safe fallback | Corrupt or old local data cannot prevent the game from starting. |

### F15: Microcosm Biological Experience

Goal: Present one coherent, attractive, non-gross world across every screen.

| Subfeature | Priority | Deliverable | Definition of Done |
| --- | --- | --- | --- |
| F15.1 Typography | P1 | Syne Mono display, Share Tech Mono telemetry, and Rajdhani interface text | Fonts preload or fall back without layout instability. |
| F15.2 Visual tokens | P1 | Color, spacing, borders, glow, and motion variables | UI and renderer use the same semantic palette. |
| F15.3 Biological Vector Sprites | P1 | Procedural SVG vectors for all pathogens, antibody sentinels, and upgrade branches | Rendered with `makeFibers`, `smoothBlob`, and `pseudopod` algorithms. |
| F15.4 Biological HUD Icons | P1 | ATPIcon (adenine + triphosphate), HealthBar (vessel + EKG), ScoreIcon | High-fidelity vector telemetry icons integrated across HUD and modals. |
| F15.5 Interface language | P1 | Microcosm, ATP, Organ Integrity, Host Stabilized, and Host Compromised terminology | Copy is consistent across HUD, menus, help, and results. |
| F15.6 Accessibility and readability | P1 | Contrast, motion restraint, stable sizing, and non-color cues | Required information remains readable during the busiest tested wave. |

### F16: Architecture, Tests, and Delivery

Goal: Make the project reliable, reviewable, and runnable by judges and future developers.

| Subfeature | Priority | Deliverable | Definition of Done |
| --- | --- | --- | --- |
| F16.1 Modular architecture | P0 | Separate core, renderer, UI, audio, data, and persistence modules | Dependency direction matches the approved architecture and avoids circular ownership. |
| F16.2 Unit tests | P0 | Vitest coverage for critical game rules | Tests pass headlessly and include success, rejection, and boundary cases. |
| F16.3 Simulation tests | P0 | Scripted victory, defeat, speed equivalence, and stress scenarios | Runs are deterministic and detect stuck waves or invalid numeric state. |
| F16.4 Automated UI tests | P0 | Playwright primary journey and persistence coverage | Tests pass against the production-equivalent browser app. |
| F16.5 Production build | P0 | Static browser output | Clean install, typecheck, test, and build commands pass. |
| F16.6 Submission documentation | P0 | README with setup, controls, architecture, checklist, tests, and limitations | A new developer can run and review the project without assistance. |
| F16.7 Demo route | P0 | Rehearsed five-minute sequence and known-good seed | The route demonstrates required and completed bonus features reliably. |

## 4. Requirement Coverage Check

| Requirement | Covered By | Completion Evidence |
| --- | --- | --- |
| R1 Playable map and path | F02 | Route validation, traversal test, rendered map, invalid path placement demo |
| R2 Enemy spawning and waves | F03, F04 | Spawn-count tests and two-wave demo |
| R3 Three tower behaviours | F05 | IgG, IgM, and IgA unit tests and simultaneous combat demo |
| R4 Placement and purchase | F06 | Transaction tests and valid or invalid placement demo |
| R5 Currency | F07 | Economy tests and live ATP changes |
| R6 Health or lives | F08 | Leak test and visible core damage |
| R7 Win and lose | F08 | End-state tests and prepared demo outcomes |
| R8 Wave, currency, score, health UI | F09, F14 | HUD assertions and live demonstration |
| B1 Multiple enemy types | F04 | Mixed wave with speed, health, armor, and split differences |
| B2 Upgrades or branches | F10 | Upgrade transaction and branch-lock tests |
| B3 Pause, restart, or level selection | F11, F12 | Control tests and live control demo |
| B4 Maps or difficulties | F12 | Configuration tests and level-select demo |
| B5 Sound, music, animation, or polish | F13 | Audio toggle and combat-effects demo |
| B6 Score, high scores, or results | F14 | Score tests, results, and reload persistence |
| B7 Creative theme or art direction | F15 | Cohesive final screens and unit presentation |
| T1 Architecture description | F16.1, F16.6 | README diagram and module guide |
| T2 Unit tests | F16.2, F16.3 | Passing Vitest suite |
| T3 Automated UI tests | F16.4 | Passing Playwright suite |

## 5. Delivery Order

1. F01 and F02 establish deterministic runtime and path traversal.
2. F03, F04, and F08 complete waves, enemies, integrity, victory, and defeat.
3. F07, F05, F06, and F14.1 complete economy, three towers, placement, and live score.
4. F09 and the required portions of F15 create the first complete browser game.
5. F10 adds upgrades and F05.6 adds the fourth tower.
6. F11, F12, and optional F04 variants add controls, maps, difficulty, and enemy variety.
7. F13 and remaining F15 work add audiovisual polish.
8. Remaining F14 work adds results and persistent high scores.
9. F16 is developed continuously, then closed with browser automation, documentation, build validation, and demo rehearsal.