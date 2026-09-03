# User Story Backlog

Status: Approved scope, ready for estimation  
Source: [Product Plan](PRODUCT_PLAN.md)  
Feature backlog: [Feature Decomposition](FEATURES.md)  
Implementation backlog: [Incremental Tasks](TASKS.md)

## 1. Story Format and Completion

Each story is independently testable and links to one owning feature. A story is Done when:

- Its acceptance scenarios pass.
- Relevant unit or browser tests are added and passing.
- Error, empty, paused, and unaffordable states are handled where applicable.
- UI behaviour is readable at supported viewports.
- Judge-visible behaviour is available without developer tools.

## 2. Foundation and Map Stories

### US-F01-01: Deterministic Game Session

Feature: F01 Runtime and Game Session  
Priority: P0

As a player, I want the game to behave consistently at different frame rates so that combat feels fair and repeatable.

Acceptance scenarios:

- Given the same seed and command sequence, when simulations run with different render frame intervals, then their final gameplay state is identical.
- Given a delayed browser frame, when the game catches up, then no enemy, projectile, or timer skips required simulation rules.
- Given the game is paused, when render frames continue, then simulation time does not advance.

### US-F01-02: Safe Session Phases

Feature: F01 Runtime and Game Session  
Priority: P0

As a player, I want menus, gameplay, pause, and results to have clear boundaries so that inputs cannot produce broken states.

Acceptance scenarios:

- Given the player is in the menu, when a combat hotkey is pressed, then game state is unchanged.
- Given a session reaches victory or defeat, when combat input occurs, then no tower, enemy, or economy mutation is accepted.
- Given a valid navigation action, when it is selected, then the game enters only the documented next phase.

### US-F02-01: Understand the Enemy Route

Feature: F02 Map and Enemy Path  
Priority: P0

As a player, I want to see the complete enemy route before combat so that I can plan tower placement.

Acceptance scenarios:

- Given a map has loaded, when preparation begins, then its entry, path direction, and cellular core are visible.
- Given enemies traverse the path, when they cross waypoint boundaries, then movement remains continuous and forward.
- Given the board is busy, when effects overlap the route, then the path remains readable.

### US-F02-02: Understand Buildable Space

Feature: F02 Map and Enemy Path  
Priority: P0

As a player, I want buildable and blocked spaces to be obvious so that placement outcomes are predictable.

Acceptance scenarios:

- Given a tower is selected, when the pointer moves between cells, then the preview distinguishes valid, path, blocked, occupied, and out-of-bounds positions.
- Given a preview reports a valid cell, when placement is confirmed with enough ATP, then the simulation accepts it.
- Given a preview reports an invalid cell, when placement is attempted, then no tower is created and no ATP is charged.

## 3. Wave and Enemy Stories

### US-F03-01: Prepare for a Wave

Feature: F03 Wave Spawning and Progression  
Priority: P0

As a player, I want a visible countdown and wave number so that I know when enemies will arrive.

Acceptance scenarios:

- Given a wave is pending, when time advances, then the countdown decreases and shows the upcoming wave number.
- Given the countdown reaches zero, when the wave starts, then it starts exactly once.
- Given the game is paused, when real time passes, then the countdown remains unchanged.

### US-F03-02: Progress Through Waves

Feature: F03 Wave Spawning and Progression  
Priority: P0

As a player, I want waves to progress after I clear them so that the game builds toward a conclusion.

Acceptance scenarios:

- Given a wave definition, when it runs, then every configured enemy spawns once in order.
- Given the spawn queue is empty but enemies remain, when the tick ends, then the wave remains active.
- Given the spawn queue and active enemies are empty, when the tick ends, then the wave clears and progression advances.

### US-F03-03: Send a Wave Early

Feature: F03 Wave Spawning and Progression  
Priority: P1

As an experienced player, I want to call the next wave early so that I can trade preparation time for ATP and score.

Acceptance scenarios:

- Given a pending wave and remaining countdown, when Send Early is selected, then the wave begins immediately.
- Given Send Early succeeds, when rewards are calculated, then one bonus based on remaining time is granted.
- Given the wave has started, when Send Early is selected again, then no additional spawn or bonus occurs.

### US-F04-01: Recognize Different Threats

Feature: F04 Enemy Lifecycle and Variety  
Priority: P1

As a player, I want enemies with distinct strengths and silhouettes so that tower selection remains strategic.

Acceptance scenarios:

- Given a mixed wave, when Rhinovirus, Influenza, and Corona Titan appear, then their speed, health, and armor profiles differ materially.
- Given the enemies are displayed together, when viewed without labels, then shape and motion distinguish them.
- Given a Corona Titan takes damage, when armor applies, then damage is reduced but remains at least one.

### US-F04-02: Respond to a Splitting Boss

Feature: F04 Enemy Lifecycle and Variety  
Priority: P1

As a player, I want a boss with a visible special ability so that the final waves create a memorable tactical surprise.

Acceptance scenarios:

- Given a Retro-Mutant is defeated, when cleanup resolves, then four Rhinoviruses spawn once at its current path progress.
- Given the child enemies spawn, when movement continues, then they follow the correct remaining route.
- Given a Retro-Mutant leaks instead of being defeated, when it reaches the core, then it does not split or grant a kill reward.

## 4. Tower, Placement, and Economy Stories

### US-F05-01: Use Rapid Single-Target Damage

Feature: F05 Distinct Antibody Combat  
Priority: P0

As a player, I want an affordable rapid-fire IgG tower so that I can handle early and fast enemies.

Acceptance scenarios:

- Given an eligible enemy is in range, when IgG completes its attack interval, then it fires at one deterministic target.
- Given the projectile reaches its living target, when damage resolves, then only that target loses health.
- Given no eligible enemy is in range, when the interval elapses, then no projectile is created.

### US-F05-02: Use Area Damage

Feature: F05 Distinct Antibody Combat  
Priority: P0

As a player, I want an IgM splash tower so that I can counter grouped enemies.

Acceptance scenarios:

- Given IgM fires at a group, when its projectile impacts, then all living enemies inside the radius take damage.
- Given an enemy is outside the radius boundary, when impact resolves, then that enemy takes no splash damage.
- Given the original target disappears before impact, when the projectile resolves, then it fails safely or impacts according to its defined projectile rule.

### US-F05-03: Slow Dangerous Enemies

Feature: F05 Distinct Antibody Combat  
Priority: P0

As a player, I want an IgA tether that slows enemies so that I can increase the time other towers have to attack.

Acceptance scenarios:

- Given an eligible enemy is tethered, when a tick resolves, then it takes configured damage and receives the configured slow.
- Given a slow is active, when movement resolves, then effective speed respects the minimum-speed limit.
- Given the effect duration expires, when movement resumes, then the enemy returns to its unmodified speed.

### US-F05-04: Focus a Priority Target

Feature: F05 Distinct Antibody Combat  
Priority: P1

As a player, I want a long-range Killer T-Cell beam so that I can eliminate armored or boss enemies.

Acceptance scenarios:

- Given the beam remains locked to one target, when time advances, then damage ramps to its configured maximum.
- Given the target changes, dies, or leaves range, when targeting resolves, then the ramp resets.
- Given First or Strongest targeting is selected, when targets are available, then the tower follows that preference deterministically.

### US-F06-01: Purchase and Place a Tower

Feature: F06 Tower Placement and Purchase  
Priority: P0

As a player, I want to preview and buy an antibody tower so that I can build my defence confidently.

Acceptance scenarios:

- Given a tower card is selected, when the pointer is over the board, then a ghost and range ring follow the resolved grid cell.
- Given the cell is valid and ATP is sufficient, when placement is confirmed, then one tower is created and its exact cost is deducted once.
- Given placement mode is cancelled, when Escape or cancel is used, then no tower or ATP change occurs.

### US-F06-02: Understand a Rejected Purchase

Feature: F06 Tower Placement and Purchase  
Priority: P0

As a player, I want clear feedback when placement fails so that I know how to correct it.

Acceptance scenarios:

- Given ATP is insufficient, when the tower is selected or placement is attempted, then affordability feedback is visible and state remains unchanged.
- Given the cell is occupied or blocked, when placement is attempted, then the relevant invalid state is shown.
- Given any rejected purchase, when the next valid attempt occurs, then placement mode still works correctly.

### US-F07-01: Earn and Spend ATP

Feature: F07 ATP Economy  
Priority: P0

As a player, I want ATP rewards and costs to be transparent so that I can make strategic purchases.

Acceptance scenarios:

- Given an enemy is defeated, when rewards resolve, then its ATP value is granted exactly once.
- Given an enemy reaches the core, when it leaks, then it grants no kill ATP.
- Given a purchase or upgrade is affordable, when it succeeds, then ATP decreases by the displayed amount and never becomes negative.

### US-F07-02: Sell a Tower

Feature: F07 ATP Economy  
Priority: P1

As a player, I want to sell a tower so that I can recover from placement mistakes and change strategy.

Acceptance scenarios:

- Given a tower has base and upgrade investment, when it is inspected, then the displayed refund is 70% using the documented rounding rule.
- Given Sell is confirmed, when the transaction resolves, then the tower is removed and the refund is credited once.
- Given a stale or missing tower ID, when Sell is requested, then state remains unchanged.

## 5. Integrity, End-State, and HUD Stories

### US-F08-01: Protect Organ Integrity

Feature: F08 Integrity, Victory, and Defeat  
Priority: P0

As a player, I want leaked enemies to damage Organ Integrity clearly so that the stakes are understandable.

Acceptance scenarios:

- Given an enemy reaches the route end, when the leak resolves, then configured core damage is applied exactly once and the enemy is removed.
- Given integrity changes, when the next presentation update occurs, then the HUD and cellular core reflect the same value.
- Given damage exceeds remaining integrity, when it resolves, then integrity is clamped to zero.

### US-F08-02: Win the Defence

Feature: F08 Integrity, Victory, and Defeat  
Priority: P0

As a player, I want a clear victory when the final threat is eliminated so that the session has a satisfying conclusion.

Acceptance scenarios:

- Given the final wave still has queued or living enemies, when a tick ends, then victory does not occur.
- Given the final queue and all active enemies are empty, when cleanup completes, then Host Stabilized appears once.
- Given victory is active, when combat controls are used, then simulation state does not change.

### US-F08-03: Lose the Defence

Feature: F08 Integrity, Victory, and Defeat  
Priority: P0

As a player, I want a clear defeat at zero integrity so that I understand why the run ended.

Acceptance scenarios:

- Given integrity reaches zero, when damage resolves, then Host Compromised appears immediately and once.
- Given defeat is active, when later systems would process, then no reward, spawn, or combat mutation occurs.
- Given Retry is selected, when the next session loads, then no entities or timers from the defeated run remain.

### US-F09-01: Monitor Required Game State

Feature: F09 Gameplay HUD  
Priority: P0

As a player, I want wave, ATP, score, and integrity visible at all times so that I can make decisions without opening menus.

Acceptance scenarios:

- Given gameplay is active, when the HUD renders, then all four required values are visible and labeled.
- Given any required value changes, when state is published, then the corresponding display updates to the exact value.
- Given the supported laptop viewport, when combat becomes busy, then telemetry does not overlap the board controls or become unreadable.

## 6. Upgrade and Control Stories

### US-F10-01: Inspect a Tower

Feature: F10 Tower Inspection and Upgrades  
Priority: P1

As a player, I want to inspect a tower's current and future statistics so that I can make informed upgrade decisions.

Acceptance scenarios:

- Given a placed tower is selected, when the panel opens, then current damage, range, cadence, effect, target mode, investment, and sell value are shown.
- Given an upgrade is available, when it is previewed, then cost and changed values are clear before purchase.
- Given another tower is selected, when the panel updates, then no values from the previous tower remain.

### US-F10-02: Choose an Upgrade Branch

Feature: F10 Tower Inspection and Upgrades  
Priority: P1

As a player, I want mutually exclusive specializations so that each defence can support different strategies.

Acceptance scenarios:

- Given the prerequisite upgrade is owned, when one branch is purchased, then ATP is charged and its effect applies immediately.
- Given one branch is owned, when the alternative is viewed, then it is visibly locked and cannot be purchased.
- Given ATP is insufficient or prerequisites are missing, when purchase is attempted, then tower and economy state remain unchanged.

### US-F11-01: Pause and Resume

Feature: F11 Session Controls  
Priority: P1

As a player, I want to pause the game so that I can inspect the board or step away.

Acceptance scenarios:

- Given active combat, when Pause or Space is selected, then movement, attacks, projectiles, spawning, and countdowns stop.
- Given the game is paused, when the player inspects controls, then the pause interface remains interactive.
- Given Resume is selected, when simulation continues, then it resumes from the same state without a time jump.

### US-F11-02: Change Simulation Speed

Feature: F11 Session Controls  
Priority: P1

As a player, I want 1x, 2x, and 3x speed controls so that I can control downtime.

Acceptance scenarios:

- Given gameplay is active, when a speed is selected, then the control indicates the active multiplier.
- Given identical seeds and commands, when runs use different speed multipliers, then their simulation outcomes are identical.
- Given the game is paused, when speed changes, then simulation remains paused until resumed.

### US-F11-03: Restart or Leave a Session

Feature: F11 Session Controls  
Priority: P1

As a player, I want to restart or return to the menu so that I can quickly try another strategy.

Acceptance scenarios:

- Given Restart is confirmed, when the session reloads, then map and difficulty remain while all gameplay state resets.
- Given Quit is confirmed, when the menu appears, then no game loop, entity, or gameplay audio remains active.
- Given a confirmation is cancelled, when gameplay resumes, then state is unchanged.

## 7. Map and Difficulty Stories

### US-F12-01: Choose a Map

Feature: F12 Maps and Difficulty Selection  
Priority: P1

As a player, I want maps with visible route previews so that I can choose the style of defence I want to play.

Acceptance scenarios:

- Given level selection is open, when maps are viewed, then each shows its name, route preview, description, and best score.
- Given Vascular Run or Lymph Spiral is selected, when launched, then the matching validated route and build area load.
- Given Neural Fork is included in the build, when launched, then both entries spawn and converge correctly.

### US-F12-02: Choose a Difficulty

Feature: F12 Maps and Difficulty Selection  
Priority: P1

As a player, I want clear difficulty choices so that I can select an appropriate challenge.

Acceptance scenarios:

- Given Resident, Acute, and Critical are displayed, when one is selected, then its health, speed, and ATP modifiers are summarized.
- Given a difficulty is launched, when state is created, then each modifier applies exactly once.
- Given results are saved, when scores are ranked, then map and difficulty use separate tables.

## 8. Feedback and Theme Stories

### US-F13-01: Receive Responsive Combat Feedback

Feature: F13 Sound, Animation, and Feedback  
Priority: P1

As a player, I want actions to have distinct audiovisual responses so that combat feels polished and readable.

Acceptance scenarios:

- Given placement, attack, impact, defeat, upgrade, wave, leak, victory, or defeat occurs, when its event is emitted, then the corresponding feedback plays once.
- Given several effects occur together, when budgets are reached, then effects are capped without affecting simulation.
- Given an effect completes, when cleanup runs, then its object can be reused or removed without accumulating active resources.

### US-F13-02: Control Audio

Feature: F13 Sound, Animation, and Feedback  
Priority: P1

As a player, I want a persistent mute control so that I can play in a shared environment.

Acceptance scenarios:

- Given no interaction has occurred, when the game boots, then it does not violate browser autoplay rules.
- Given Mute is selected in a menu or game, when audio events occur, then no sound is audible.
- Given mute preference is saved, when the page reloads, then the same preference is restored safely.

### US-F15-01: Experience a Cohesive Neon Body

Feature: F15 Cyber-Immunology Experience  
Priority: P1

As a player, I want a beautiful, non-gross microscopy-inspired biological theme so that defending the body feels distinctive and inviting.

Acceptance scenarios:

- Given any main screen, when it is viewed, then typography, palette, terminology, translucent cellular forms, and motion follow the approved Cyber-Immunology direction.
- Given friendly and enemy units share the board, when viewed during combat, then silhouette and motion distinguish role and allegiance.
- Given fonts fail to load remotely, when fallback fonts render, then layout remains usable and text does not overlap.

### US-F15-03: Load Detailed Cellular Sprites Efficiently

Feature: F15 Cyber-Immunology Experience  
Priority: P1

As a player, I want detailed cellular sprites to load quickly and animate smoothly so that the game looks rich without feeling heavy.

Acceptance scenarios:

- Given the game starts, when the loading phase completes, then the compressed sprite atlas is ready before gameplay begins.
- Given many enemies are visible, when PixiJS renders them, then shared atlas textures are batched and temporary effects remain capped.
- Given a shipped sprite is audited, when its provenance is checked, then it is original or has documented redistribution rights.

### US-F15-02: Read the Game During Heavy Combat

Feature: F15 Cyber-Immunology Experience  
Priority: P1

As a player, I want effects and telemetry to remain readable so that visual polish never interferes with play.

Acceptance scenarios:

- Given the stress wave is active, when attacks and deaths overlap, then path, enemies, placement state, and required HUD values remain visible.
- Given a status or allegiance is communicated, when color perception differs, then shape or motion provides a second cue.
- Given screen shake or flashes occur, when feedback ends, then stable layout and pointer alignment are preserved.

## 9. Score and Replay Stories

### US-F14-01: Track Live Score

Feature: F14 Score, Results, and High Scores  
Priority: P0

As a player, I want my score visible during play so that I can measure the value of riskier decisions.

Acceptance scenarios:

- Given a kill, wave clear, or early start occurs, when scoring resolves, then one documented score event is recorded.
- Given score events exist, when the HUD updates, then its total equals their sum.
- Given an enemy leaks, when score resolves, then no kill points are awarded for that enemy.

### US-F14-02: Understand the Result

Feature: F14 Score, Results, and High Scores  
Priority: P1

As a player, I want a post-game breakdown so that I understand why I earned my final score.

Acceptance scenarios:

- Given victory or defeat occurs, when results appear, then outcome, waves, kills, ATP earned, integrity, and score components are shown.
- Given the displayed components are added, when compared with final score, then the values reconcile exactly.
- Given Retry, New Map, or Menu is selected, when navigation completes, then it reaches the documented destination.

### US-F14-03: Compete Against Local High Scores

Feature: F14 Score, Results, and High Scores  
Priority: P1

As a returning player, I want high scores to persist by map and difficulty so that I have a replay goal.

Acceptance scenarios:

- Given a completed run qualifies, when saved, then it is inserted in deterministic order and the table is trimmed to ten.
- Given the page reloads, when high scores open, then valid saved entries remain available.
- Given storage is missing, outdated, or corrupt, when the game loads, then it uses an empty valid table instead of failing.

## 10. Delivery and Quality Stories

### US-F16-01: Run and Review the Project

Feature: F16 Architecture, Tests, and Delivery  
Priority: P0

As a judge or developer, I want clear setup and architecture instructions so that I can run, assess, and continue the project.

Acceptance scenarios:

- Given a clean supported environment, when documented install and run commands are executed, then the game opens successfully.
- Given the README is reviewed, when architecture, controls, features, tests, and limitations are sought, then each is documented accurately.
- Given the production command runs, when it completes, then it creates a static browser build without type errors.

### US-F16-02: Verify Game Rules Automatically

Feature: F16 Architecture, Tests, and Delivery  
Priority: P0

As a developer, I want fast deterministic unit and simulation tests so that gameplay regressions are caught before the demo.

Acceptance scenarios:

- Given the Vitest command runs, when tests complete, then required mechanics include success, rejection, boundary, victory, and defeat coverage.
- Given scripted victory and no-tower scenarios, when simulated headlessly, then each reaches its expected terminal state without stuck waves.
- Given the stress scenario completes, when state is inspected, then it contains no invalid numbers, orphaned targets, or unbounded active entities.

### US-F16-03: Verify the User Journey Automatically

Feature: F16 Architecture, Tests, and Delivery  
Priority: P0

As a developer, I want automated browser tests so that the judge-facing journey remains functional.

Acceptance scenarios:

- Given the browser app starts, when Playwright follows menu, level select, tower placement, and wave-start actions, then the expected HUD and state changes appear.
- Given pause, upgrade, result, and persistence flows are exercised, when assertions run, then each critical interaction passes.
- Given tests use shortened deterministic scenarios, when they run, then they remain reliable without arbitrary long waits.

### US-F16-04: Demonstrate the Game Reliably

Feature: F16 Architecture, Tests, and Delivery  
Priority: P0

As a presenter, I want a rehearsed five-minute path so that every completed feature can be shown within the judging window.

Acceptance scenarios:

- Given the production build and known-good seed, when the demo route is performed, then all eight required features are visible.
- Given the planned bonus demonstrations, when the route completes, then upgrades, controls, enemy variety, polish, results, and high scores are shown within five minutes.
- Given the hosted build is unavailable, when the local production fallback is used, then the same route remains playable.

## 11. Requirement-to-Story Traceability

| Brief Requirement | Primary Stories |
| --- | --- |
| R1 Playable map and path | US-F02-01, US-F02-02 |
| R2 Enemy spawning and waves | US-F03-01, US-F03-02 |
| R3 Three tower behaviours | US-F05-01, US-F05-02, US-F05-03 |
| R4 Placement and purchase | US-F06-01, US-F06-02 |
| R5 Currency | US-F07-01 |
| R6 Health or lives | US-F08-01 |
| R7 Win and lose | US-F08-02, US-F08-03 |
| R8 Wave, currency, score, health UI | US-F03-01, US-F07-01, US-F09-01, US-F14-01 |
| B1 Multiple enemy types | US-F04-01, US-F04-02 |
| B2 Upgrades or branches | US-F10-01, US-F10-02 |
| B3 Pause, restart, or level selection | US-F11-01, US-F11-02, US-F11-03, US-F12-01 |
| B4 Maps or difficulties | US-F12-01, US-F12-02 |
| B5 Sound, music, animation, or polish | US-F13-01, US-F13-02 |
| B6 Score, high scores, or results | US-F14-01, US-F14-02, US-F14-03 |
| B7 Creative theme or art direction | US-F15-01, US-F15-02 |
| T1 Architecture description | US-F16-01 |
| T2 Unit tests | US-F16-02 |
| T3 Automated UI tests | US-F16-03 |

## 12. Recommended Story Order

1. US-F01-01, US-F01-02, US-F02-01, US-F02-02.
2. US-F03-01, US-F03-02, US-F08-01, US-F08-02, US-F08-03.
3. US-F07-01, US-F05-01, US-F05-02, US-F05-03, US-F06-01, US-F06-02, US-F14-01.
4. US-F09-01 and the required visual portion of US-F15-01.
5. US-F10-01, US-F10-02, US-F05-04, and US-F07-02.
6. US-F04-01, US-F04-02, US-F11-01, US-F11-02, US-F11-03, US-F12-01, US-F12-02, US-F03-03.
7. US-F13-01, US-F13-02, US-F15-02.
8. US-F14-02 and US-F14-03.
9. US-F16-01, US-F16-02, US-F16-03, and US-F16-04 are developed continuously and closed before submission.