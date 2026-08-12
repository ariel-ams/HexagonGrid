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

## Backlog For Later

- Equipment loot loop: helmet, jacket, abdomen guard, sting, wings. Starter loadouts now exist, are equipped for new runs, carry level metadata, can be filtered by player level, can generate small weighted unequipped reward-choice sets, and can describe what a reward replaces; next work is loot acquisition and UI choices.
- Persistent progression: lifetime resources unlock cosmetics, encyclopedia entries, or starting relic choices.
- More readable relic economy with better card hierarchy and lower choice overload.
- Audio polish: boss music, object-specific pickup/attack cues, reduced overlap on track starts.
- Object encyclopedia from discovered/tested content.
- Optional accessibility pass for keyboard navigation beyond menus.

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
