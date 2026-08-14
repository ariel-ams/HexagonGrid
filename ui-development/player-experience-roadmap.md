# Honeycomb Wayfinder Player Experience Roadmap

## North Star

For the next couple of iterations, the game should become easier to learn and more satisfying to master:

> A new player should understand movement, inspection, resources, danger, and the first combat puzzle within the first 5 minutes, then feel that later rooms ask for better positioning and preparation rather than more waiting.

## Current Product Objective

Create a readable tactical dungeon loop:

- The player always knows the next objective.
- Hover/tap explains the selected cell without blocking the board.
- The route preview predicts cost, interruption, and danger.
- Enemies create position puzzles first and HP bags second.
- Resources matter because rooms ask the player to spend or preserve them.
- Theme art improves atmosphere without making non-playable surroundings look clickable.

## UX Oracle Framing

| Law | Risk If Ignored | Roadmap Response | Validation |
| --- | --- | --- | --- |
| Cognitive Load | First rooms feel crowded and players miss danger/state changes. | Stage mechanics by player level, reduce popup competition, keep inspect panel persistent. | Browser playtest notes: player can describe current objective, route cost, and one threat after room 1. |
| Fitts's Law | Mobile/touch users miss cells or settings controls. | Large bottom orbs, clear pause/settings corner, generous menu buttons, no HUD blocking cells. | UI layout smoke test plus manual mobile viewport click pass. |
| Hick's Law | Camp/relic/test screens slow decisions with too many similar options. | Limit first-run choices, chunk market/relic cards, show strongest stat/value first. | Choice screens fit viewport and each card has one clear primary value. |
| Goal-Gradient Effect | Player does not know whether the run is progressing. | Show room objective, XP progress, room theme, and boss preparation hints. | End screen and HUD show progress/reasonable next action. |
| Jakob's Law | Custom UI feels unpredictable. | Use familiar pause/settings overlay, cards, chips, hover/tap inspect, route highlight. | Manual browser pass confirms no hidden controls for core actions. |

## Iteration 1: First-Run Clarity

Goal: make the first 2-3 rooms teach the player without crowded screens.

Status: in progress. The first sprint implemented the level-1 onboarding room as an authored path with no starting enemies, a small supply set, a lamp cell, and a shield upgrade. Lamp lighting now comes from revealed/visited lamps, hidden empty mist cells can be stepped into, and inspect route chips read route damage/water/shield risk from the path-risk data.

The second sprint tightened room 2 and room 3 lessons. Room 2 now carves a readable wax-door route with pollen supplied before the blocker. Room 3 now clears the exit route, places a single guard away from the start, and reveals nearby route space so the player can inspect the threat before committing. Browser smoke checks now assert these authored lesson templates.

The third sprint improved the inspect panel's tactical explanation. Revealed objects and enemies now show route movement cost, how far the bee can get this turn, stop reasons, expected damage/shield/water costs, and a short lesson for wax doors, enemies, and lamp cells. Browser smoke checks now assert route-cost and wax-door lesson copy.

The fourth sprint made room 3's first combat lesson more explicit. The enemy-gate template now teaches an armored Thorn Beetle guard, reveals the guard before engagement, and highlights safe flank cells beside it with a non-red lesson marker. Browser smoke checks now assert the armored guard, visibility, and safe flank-cell placement.

The fifth sprint stabilized the first-run onboarding template. The required pollen, water, lamp cell, and shield pickup are now placed from the route first and nearby off-route cells second, so short entry-to-exit cave routes still teach the intended supplies instead of falling back to random room contents.

The sixth sprint improved inspect-panel scanning without adding more floating feedback. Every stat chip now pairs its HUD icon and value with a compact bilingual meaning label such as Gain, Cost, Damage, Threat, or Route, making pickup rewards and route consequences easier to distinguish at a glance.

The seventh sprint finished the current HUD declutter pass. Top feedback toasts now measure the visible stat and enemy-timer clusters and move below any cluster they would overlap, including wrapped mobile and crowded test-room layouts. The layout smoke test includes a Queen Signaler scenario so future HUD additions cannot silently cover feedback again.

The eighth sprint extended the authored level-1 learning sequence into room 4. Instead of falling through to the level-3 mixed gate, room 4 now supplies water before one burning cell beside the visible exit, removes unrelated pickups and competing threats, and uses a bilingual `crossFire` objective that explicitly tells the player to collect water before crossing. Browser evidence verifies the route order, solvability, localized objective, and low-noise room composition.

The ninth sprint made that resource lesson structurally meaningful. All other playable approaches beside the room-4 exit become walls, so the bee must cross the authored burning cell; carrying the supplied water prevents its damage, while missing the pickup remains recoverable through the existing one-damage crossing rule. Browser coverage verifies that the burning cell is the exit's only traversable neighbor.

The tenth sprint made the room 2 wax-door lesson structurally required. Pollen remains before the blocker, every alternate playable approach beside the visible exit becomes a wall, and the sting fallback keeps the lesson recoverable if the player misses the supplied pollen. Data and browser smoke coverage now protect the multi-neighbor exit geometry.

The eleventh sprint aligned Room 2's HUD guidance with its authored route. A dedicated bilingual `openWaxDoor` objective now tells level-1 players to collect pollen before spending it on the door, while browser coverage protects both English and Latin American Spanish copy.

The twelfth sprint aligned Room 3's HUD guidance with its positional combat lesson. A dedicated bilingual `flankGuard` objective now directs level-1 players to a highlighted safe cell before stinging the Thorn Beetle, and completes through the existing room kill progress.

The thirteenth sprint improved the first combat target's visual salience. The authored Thorn Beetle now starts three to four route steps from the entrance, receives a pulsing gold lesson-focus ring, and keeps green safe-flank markers nearby. This puts the teaching target inside the opening camera view while keeping instruction and danger colors distinct.

The fourteenth sprint cleaned the Thorn Beetle's baked checkerboard background through a reusable boundary-connected alpha tool. The original artist sheet remains untouched, the game uses a generated transparent derivative, and enclosed highlights survive because only pale neutral pixels reachable from the sheet edge are removed.

The fifteenth sprint replaced the first-run Lamp Cell text fallback with a generated transparent four-frame idle strip. The walkable reveal beacon now has its own non-collectible visual treatment, reproducible source prompt, deterministic preparation script, data validation, and browser evidence at gameplay scale. Remaining art gaps are classified in `ASSET_BACKLOG.md` so functional fallbacks are not replaced before their mechanics need final art.

Scope:

- Define first-run room templates by player level:
  - Room A: move, inspect, collect pollen/water.
  - Room B: spend pollen/water on a simple blocker or bridge-like route.
  - Room C: one enemy with visible threat ring and a safe flank/move lesson.
- Keep exit visible, but route design should require one learned mechanic.
- Use light source cells to softly reveal adjacent content without fully revealing the whole room.
- Make danger feedback consistent: red is reserved for damage/death, other effects use distinct colors.
- Ensure objective/toast messages are smaller than the board focus area and never cover HUD or target cells.

Acceptance checks:

- `npm test` passes.
- Desktop and mobile viewport screenshots show no scrollbars and no HUD/cell-detail overlap.
- In room 1, at most one enemy mechanic is introduced.
- Every visible non-empty cell can be inspected and has localized text.
- A player can click a mist cell and route toward it until movement, danger, or an interaction interrupts.

## Iteration 2: Tactical Combat Loop

Goal: reduce repeated hit-run-wait patterns and make enemy interaction spatial.

Status: in progress. The first Iteration 2 sprint added a Stag Beetle `chargeLane` telegraph. This reuses the existing marked danger-cell visual language, teaches the behavior through the inspect panel, and has browser smoke coverage that triggers the telegraph deterministically.

The second Iteration 2 sprint added the first direct resource counter in combat. Clicking an adjacent Crawling Fire while carrying water spends `1 water`, extinguishes it without using the sting, awards the normal defeat progress, and ends the turn. The focused Test scenario teaches this counter, browser smoke coverage verifies it, and resource-cost popups now keep their utility colors instead of borrowing danger red.

The third Iteration 2 sprint added a reusable forced-movement behavior. Guard Wasp turn attacks now push the bee one empty hex farther away when landing space exists, without consuming player movement. Only one forced move resolves per enemy turn, the inspect panel labels the threat as `Push`/`Empuja`, and browser coverage verifies both displacement and learning copy.

The fourth Iteration 2 sprint repaired the deterministic boss playtest contract by exposing `ended` and `endReason` through `HW_TEST_API`, including replay snapshots. A measured three-run baseline then showed 100% wins in 12-14 turns with no damage and no hive reinforcement. The boss hive now begins on its normal 2.2-second cadence instead of receiving an extra 1.4-second grace period, while retaining one hive and a one-spawn cap. The playtest report now tracks peak reinforcements as well as final cell counts; the follow-up produced one wasp in both measured runs but still no player damage, so the next boss slice should improve reinforcement placement or Queen commands rather than adding more hive quantity.

The fifth Iteration 2 sprint made hive reinforcement placement tactical instead of random-safe. `spawnEnemyAura` now supports `preferTowardPlayer`, Wasp Hives use it, and both data and browser smoke tests verify the nearest legal spawn cell. Three measured boss runs still ended in 11-12 turns, but the single reinforcement now dealt exactly 2 visible Wasp Attack damage in every run instead of zero, creating pressure without increasing hive or spawn counts.

The sixth Iteration 2 sprint completed the current positional-combat milestone. Guard Wasp pushes can now define a delayed landing hazard through data; the Guard Wasp marks the bee's landing cell for a one-damage blast with a 1.8-second response window. The warning preserves Guard Wasp damage attribution, replay metadata records the landing effect, localized inspect copy teaches the sideways escape, and browser evidence verifies the complete push-to-warning sequence.

Scope:

- Convert more enemies into position puzzles:
  - Armored fronts, flank bonuses, danger lanes, charge lines, marked cells, push/pull zones.
- Give bosses local aggro boundaries so they do not threaten from the opposite side of the dungeon.
- Boss room should include one support objective, not overwhelming global pressure:
  - one hive or spawner for now,
  - telegraphed lanes,
  - clear safe repositioning choices.
- Add route risk prediction to inspect panel:
  - movement cost,
  - expected damage,
  - resource cost,
  - stop reason.
- Add one new resource-to-combat interaction:
  - water extinguishes fire,
  - pollen opens/weakens wax,
  - honey creates a sticky safe pause,
  - shield allows crossing one hazard.

Acceptance checks:

- Browser playtest can beat or lose to boss with visible cause, not unexplained long-range damage.
- A normal enemy has at least one meaningful positional response beyond "click to hit".
- End screen recommendation uses metrics to explain what went wrong or what improved.
- Tests cover at least one positional enemy behavior and one route-risk inspect panel state.

## Iteration 3: Theme Surroundings And Atmosphere

Goal: make themes visually distinct without changing playable-cell readability.

The first Iteration 3 sprint moved surrounding placement into `src/systems/theme-surroundings.js`. The environment is now partitioned into deterministic connected 1-4 hex pieces with stable anchors, shared material metadata, and a single-cell fallback wherever a piece block touches playable space. Browser and data smoke checks verify all supported piece sizes, zero playable overlap, and a stable placement fingerprint across repeated renders.

The second Iteration 3 sprint made dungeon-theme selection understandable before a run. The Options menu now localizes every theme name and its gameplay identity in English and Latin American Spanish, keeps the chosen description attached to the select control, and has browser/data coverage for both languages. An asset audit found the supplied sheets' blend rows are fully opaque, so final transparent edge tuning remains an explicit artist dependency while theme gameplay work continues.

The third Iteration 3 sprint moved final-room composition into each theme's data. Every theme now defines a boss, support threat, and weighted ambient object pool; runtime boss placement, approach clearing, delayed engagement, anti-kite pressure, and debug state consume that encounter profile. The existing Queen Signaler plus one Wasp Hive balance remains consistent, while forest, cave, wasp hive, and underground final rooms now draw supplies and hazards only from their own authored pools.

The fourth Iteration 3 sprint corrected boss durability before alternate boss identities are introduced. Theme encounter data now owns `hitsRequired`, the generated boss uses that value as runtime health, and final-room attacks follow the normal multi-hit interaction path instead of forcing the first successful sting to end the run. Data and browser smoke checks require multi-hit boss metadata and verify that the Queen Signaler survives the opening sting.

The fifth Iteration 3 sprint unlocked a playable surroundings bridge without changing playable cells. `npm run themes:surroundings` now derives transparent first-pass sheets for forest, cave, wasp hive, and underground, all four themes are wired through centralized art metadata, and browser coverage verifies that every sheet loads, renders non-playable environment cells, and preserves zero overlap with gameplay coordinates. Dedicated multi-hex compositions and final atmosphere tuning remain an art-and-performance polish pass rather than a blocker for using the feature.

The sixth Iteration 3 sprint removed the four-theme surroundings bundle from the startup-critical path. The selected theme, or forest when Random is selected before a run, is the only surroundings sheet tracked by the loading screen; other sheets load once on demand and reuse their in-flight promise. The renderer keeps its current/default sheet available during a theme transition, while browser coverage verifies one startup sheet and successful lazy loading for every supported theme.

The seventh Iteration 3 sprint reduced repeated work in the continuous canvas animation loop. Visible surroundings metadata is cached while theme, room, seed, camera, board geometry, and sheet layout remain unchanged; repeated stationary queries reuse the decorated cell set, while camera and room changes naturally invalidate it. Browser coverage now asserts a cache hit with zero rebuilds for an unchanged viewport.

Scope:

- Implement the non-clickable surrounding mosaic described in `SURROUNDING_MOSAIC_SYSTEM.md`.
- Place 1, 2, 3, and 4-hex environment pieces outside `game.cells`.
- Use seeded chunk placement so panning is stable.
- Draw transparent blend overlays only where surrounding material types meet.
- Keep playable cells visually dominant and clearly separated from background art.

Acceptance checks:

- Theme surroundings never appear in pathfinding or hit detection.
- Theme debug API reports `overlapsPlayable = 0`.
- Panning shows stable art, not re-randomized flicker.
- Playable cells still pass contrast/readability checks in mist, revealed, visited, enemy, pickup, and path states.

## Iteration 4: Content Scaling

Goal: make adding enemies, items, relics, and themes less dependent on editing `index.js`.

Status: in progress. The first content-scaling sprint expanded `tools/smoke-data.js` so it now validates localized object/enemy copy, unlock levels, enemy object mirrors, sprite metadata, theme references, and equipment slot references. `stickyTrap` now has unlock metadata because it is created by sticky honey and spider behavior. The next sprint added browser smoke coverage for Test page availability, comparing the rendered scenario list against the generated object entries and checking that each scenario has an icon canvas. The latest sprints added inspect stat coverage for effect-bearing objects, including the missing Royal Nectar heal chip, theme eligibility coverage for core supplies, unlock levels, board background assets, and mid/late enemy availability, scenario-start coverage for every generated Test page object, `CONTENT_MANIFEST_CHECKLIST.md` as the definition of ready for new content, `src/systems/inspect-stats.js` for visibility, enemy, object effect, terrain, and route-risk inspect chips, a first `src/systems/cell-interactions.js` interaction-rule registry consumed by object role/action/cursor previews, removal of stale object-specific `moveTo()` fallback branches now owned by registered move handlers, cleanup of duplicate room objective/gate-placement code now owned by `src/systems/room-templates.js`, removal of room-template pass-through wrappers from `index.js`, extraction of death-tip/run-recommendation text into `src/systems/run-summary.js`, smoke coverage for the run-summary recommendation branches, smoke coverage for cell-interaction role/action/cursor metadata, item-effect handler registry coverage so new item effect types fail data smoke checks until runtime support exists, item-effect payload coverage for resources, numeric values, trade costs, and transform targets, enemy-behavior registry coverage so new enemy behavior types fail data smoke checks until handler support exists, enemy-behavior payload coverage so spawned, terrain, marked-cell, charge-lane, and disguise object references stay valid, relic metadata coverage for ids, depths, rarity, and supported hooks, wearable gear metadata coverage for slot ids, gear ids, rarity, and future effects, and room-profile/spawn-weight coverage so generation references stay valid while runtime player-level filtering remains intact. Recent room-template guardrails also centralized authored template metadata, moved random template selection onto `ROOM_TEMPLATE_DEFS`, added schema validation for template keys, booleans, and reference arrays, validated theme compatibility and active-theme runtime filtering, added browser smoke coverage for forced-theme template compatibility, and corrected `mixedGate` required enemy metadata so unlock-level checks match its level-3 fallback behavior. The current inspect-stat sprints fixed spawner chips for `spawnEnemyAura` enemies, expanded compact behavior cues for stealing, draining, fog, terrain spread, marked cells, and weak-point windows, generalized data smoke coverage so supported tactical behavior chips are checked across every enemy, extended those checks to Latin American Spanish labels, added bilingual inspect-chip coverage for planning-focused item effects such as slow and trap creation, added data smoke coverage for terrain, visibility, and route-risk inspect chips, added object-to-sprite metadata coverage for every non-empty object, added sprite sheet row/frame timing validation, added usage-path coverage so non-internal objects must be reachable from generation, themes, templates, or behavior payloads, added enemy fallback color validation, added relic localization coverage, added relic reward-depth choice coverage, added wearable slot uniqueness coverage, and added starter wearable coverage for each slot, and centralized wearable effect metadata in the equipment system.

Scope:

- Move remaining object-specific interaction branches into registered handlers by object id: done for existing special movement cells; future pass can move item-effect resolution branches as new reusable handlers emerge.
- Move room templates/objective placement fully into `src/systems/room-templates.js`: mostly done for current objective and gate placement rules; remaining work should focus on reducing orchestration-only wrappers when adjacent systems can consume the template system directly.
- Add content smoke tests for:
  - localized names/descriptions,
  - sprite fallback or file existence,
  - test scenario availability: done for Test page list coverage and scenario startup coverage,
  - theme eligibility: done for core supplies, unlocks, board backgrounds, and mid/late enemy availability,
  - inspect panel stat metadata: done for object effect, enemy, terrain, and route-risk chips.
- Add a content manifest or authoring checklist for each object type: done in `CONTENT_MANIFEST_CHECKLIST.md`.
- Keep every new object available from the Test screen.

Acceptance checks:

- A new simple item can be added through data plus one item effect handler.
- A new enemy can be added with behavior data plus an enemy system handler.
- `npm test` catches missing sprite, missing localization, or missing test scenario.

## Iteration 5: Cohesive Object Art

Goal: move game objects toward the Lamp Cell's readable hand-painted fantasy style without losing animation contracts or recovery paths.

Status: in progress. The first art-cohesion sprint replaced ten first-run runtime sheets: Bee, Pollen, Water, Shield Upgrade, Entry, Exit, Wax Door, Thorn Beetle, Crawling Fire, and Burning Cell. Every previous runtime file is hash-verified under `assets/sprite-backups/pre-lamp-style-2026-08-14/`, exact prompts and generated sources are retained, and `npm run sprites:core-style` deterministically removes connected neutral backgrounds, detects visual row bands, and composes `512 x 512` runtime frames. Browser evidence covers the onboarding room and the first authored resource/combat lessons.

The second art-cohesion sprint migrated the normal Wasp as the first small post-core replacement. Its lean black-and-amber armor, long sting, aggressive eyes, and sharper silhouette distinguish it from the friendly Bee at cell scale. The source, prompt, per-batch checksum, and one-file restore script are retained, while the art smoke test now supports independent immutable backup metadata for later small batches.

Planned small migrations:

1. Common movement/combat: Bat, Trader Beetle, Vine, Double Sting. Wasp complete.
2. Common utility: Glow Pollen, Nectar Cache, Honey Drop, Clean Water, Smoke Puff.
3. Early/mid enemies: Mite Swarm, Guard Wasp, Sleeping Bat, Wax Moth, Fog Moth.
4. Tactical objects: Sticky Honey, Sticky Trap, Compass Pollen, Sun Shard, Flower Map.
5. Advanced enemies: Brood Wasp, Stag Beetle, Honey Leech, False Flower, Wasp Hive.
6. Complex enemies: Spider, Burrow Beetle, Queen Signaler, Fog Shepherd, Pollen Thief Moth.
7. Late enemies: Wax Sentinel, Mirror Wasp, Comb Bomber, Water Leech, Larva Brood.
8. Combat effects/blockers, then wearables, then theme-specific playable tiles.

Acceptance checks for every batch:

- Preserve current runtime files in a dated backup before replacement.
- Keep exact ImageGen prompts and original generated outputs.
- Preserve sprite row/state contracts and stable frame anchors.
- Validate dimensions, transparency, data references, and Test scenario availability.
- Capture browser evidence at actual cell size and run `npm test` before committing.

## Backlog For Later

- Equipment loot loop: helmet, jacket, abdomen guard, sting, wings. Starter loadouts now exist, are equipped for new runs, carry level metadata, include level-2 common and level-4 rare reward tiers, carry English and Latin American Spanish copy for slots, gear, rarity labels, and reward effects, record planned asset paths for the artist handoff with smoke coverage, include a final wearable sprite format contract, include a wearable manifest checklist, can describe each equipped slot and aggregate equipped effects for future UI, can compare candidate effect gains/losses against the current loadout, can summarize active stat bonuses, can apply replacement loadouts without stacking stale active bonuses, can be filtered by player level, can report whether gear rewards are available for a player/loadout, can plan room-depth reward cadence, can package localized reward-offer status with available pool counts, can generate small weighted unequipped reward-choice sets, can apply selected rewards into a replacement loadout, can bundle each reward with localized replacement, slot display, rarity, reward weight, effect summary details, and effect delta details, has shared equipment reward-card rendering for future loot screens, has post-room reward-flow planning for relic/equipment ordering, now shows eligible equipment choices after relic rewards, and shows a compact equipped-gear list plus aggregate effect chips in the side panel; next work is balancing reward cadence, improving inventory details, and requesting final wearable sprites.
- Persistent progression: lifetime resources unlock cosmetics, encyclopedia entries, or starting relic choices.
- More readable relic economy: first pass improved reward-card hierarchy with rarity/depth kicker and separated effect copy; future work should add stronger icons, comparison values, and lower choice overload.
- Audio polish: boss music, object-specific pickup/attack cues, reduced overlap on track starts.
- Object encyclopedia from discovered/tested content.
- Optional accessibility pass: first pass added modal dialog semantics, Escape pause/settings focus coverage, focus return, and Tab trapping inside the pause modal; future work should expand keyboard navigation beyond menus.

## Roadmap Evidence Pattern

Borrowing from the `hackerrank-orchestrate-august26` folder, future agents should treat this roadmap as a contract:

- Record the user goal before changing screens.
- Tie each UI change to one or more UX laws.
- Run the available checks.
- Capture screenshots for layout-heavy work.
- Write down unresolved risks instead of hiding them in a final "done" message.

## Visual Roadmap Viewer

The interactive roadmap lives in `roadmap-viewer/` and renders `roadmap-viewer/roadmap-state.js` with React Flow. Use it as the visual companion to this Markdown document:

- update `currentTaskId` when a sprint starts,
- move node status through `active`, `in_progress`, `planned`, `backlog`, `done`, or `blocked`,
- add evidence entries for tests, docs, screenshots, commits, or files that prove the node's state,
- run `npm run test:roadmap` for graph-only changes, or `npm test` when the sprint also touches gameplay.
