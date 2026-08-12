Honeycomb Wayfinder source layout

- `data/content.js`: localized text, object data, enemy data, relic data, sprite definitions, HUD icon rows, spawn weights, room pacing, and default balance values.
- `systems/hud.js`: compact board HUD rendering, icon fallbacks, hover helper popups, and pulse tracking.
- `systems/items.js`: data-driven item effects such as resource gains, healing, reveal effects, timer pauses, and cell transforms, with an exported effect-handler registry for content smoke coverage.
- `systems/enemies.js`: enemy behavior handlers such as auras, refogging, stealing, fleeing, spawning, fire spread, and telegraphed attacks, with exported behavior metadata for content smoke coverage.
- `systems/choice-ui.js`: shared markup for camp, trader, relic, and object-test choices.
- `systems/inspect-ui.js`: DOM rendering for the persistent inspect panel and its stat chips.
- `systems/inspect-stats.js`: visibility, enemy, object effect, terrain, and route-risk metadata that turns content data into inspect stat chips.
- `systems/cell-interactions.js`: object interaction metadata, collect/free-walkover classification, and registered move handlers for special cells.
- `systems/tactical-flow.js`: movement point/action availability helpers for the turn-based dungeon action economy.
- `systems/tactical-combat.js`: turn-end orchestration and tactical action range helpers.
- `systems/camp-market-controller.js`: localized camp/trader action definitions, availability checks, and market choice selection.
- `systems/enemy-turns.js`: enemy turn-order dispatcher for sleep checks, movement, pressure, telegraphs, and boss anti-kite hooks.
- `systems/dungeon-generation.js`: cave room generation, room graph layout, entry/exit placement, and cell creation.
- `systems/renderer.js`: canvas rendering helpers for dungeon cells, tiles, path previews, sprites, fog, and effects.
- `systems/replay.js`: local replay event recording and playback state helpers.
- `systems/run-summary.js`: death tips and end-run tactical recommendation text derived from run metrics.
- `systems/room-templates.js`: room objectives, first-run lesson templates, exit reveal, and objective/gate placement rules.
- `../index.js`: current orchestration layer for input, game state, tactical turns, UI screens, and system dispatch.

Current gameplay model

- The bee uses a tactical action economy instead of a normal attack cooldown.
- Each player turn starts with movement points and one action.
- Moving along the previewed path spends `1` movement point per cell.
- Clicking a far cell walks as far as the current movement points allow.
- Pickups, doors, exits, trading, attacks, and hazards consume the action unless a future rule marks them free.
- When an action-consuming cell is reached during auto-walk, the queued path stops. This prevents the bee from collecting one item and immediately failing on the next item with "action already used."
- Special movement cells such as doors, exits, lamps, vines, burning cells, and trader beetles are dispatched through registered handlers in `systems/cell-interactions.js`; normal collectables fall through to the data-driven item system.
- After the player spends the turn, enemies respond, hazards/telegraphs tick, fog reveals, and movement/action refill for the next turn.

Inspect and learning UI

- The persistent inspect panel is the main place for object learning.
- Hovering a revealed cell updates the panel on desktop. Tapping or clicking pins/replaces the panel on touch or desktop.
- Floating popups are reserved for fast feedback: damage, healing, shield block, resource gain, blocked action, and rhythm feedback.
- The inspect panel should show the object name, type, explanation, route information, and compact stat chips for effects such as `+1 pollen`, `-1 damage`, `HP`, `ATK`, `range`, cost, or lethal route warnings.
- Visibility, enemy, object, item, hazard, and route-risk stat chips are mapped in `systems/inspect-stats.js`. Enemy behavior chips should call out key planning pressure such as spawning, stealing, draining, refogging, terrain spread, marked cells, armor, and weak-point windows. Object effect chips should call out actionable utility such as reveal radius, pauses, slowing enemies, and trap creation in both supported languages.
- Route explanations in the inspect panel include movement cost, reachable steps this turn, stop reasons, expected damage/shield/water cost, and short lesson text for early teaching objects such as wax doors, enemies, and lamp cells.

Adding content

- Use `../CONTENT_MANIFEST_CHECKLIST.md` as the definition of ready for a new object, enemy, hazard, relic, theme, sprite, audio cue, or wearable before editing data tables.
- New placeholder sprites should use an empty `src` plus a short `fallback` label in `SPRITE_DEFS`. The renderer will draw the text fallback until final art is available.
- Every new game object must also be reachable from the Test page. Add the object to `OBJECTS` and its behavior data first; the test list is generated from those definitions.
- If the object needs a special setup to demonstrate its mechanic clearly, add that support in `seedTestSupportCells()` and `getTestScenarioMessage()` in `../index.js`.
- If the object needs a special role, action label, cursor symbol/color, collect-on-move exception, or free-walkover rule, add that metadata to `systems/cell-interactions.js`.
- If the object declares a new `effects[].type`, add a matching handler to `ITEM_EFFECT_HANDLERS` in `systems/items.js`; the data smoke test fails unsupported effect types.
- If an item effect has a payload, keep it typed: resources must be known resource ids, numeric amounts/radii/durations must be valid, and `transformCell.object` must exist in `OBJECTS`.
- If an enemy declares a new `behaviors[].type`, add it to `ENEMY_BEHAVIOR_TYPES` in `systems/enemies.js` and implement the behavior in the relevant enemy/tactical turn system; the data smoke test fails unsupported behavior types.
- If an enemy behavior references another object, keep the payload typed: spawned enemies must exist in `ENEMY_DEFS`, while terrain, marked cells, charge-lane cells, and disguise targets must exist in `OBJECTS`.
- If relics change, keep ids unique, depth/rarity valid, and hook names supported; `smoke-data` fails typo hooks before the reward screen uses them.
- If wearable gear changes, keep slot ids, equipment ids, rarity, and future effect payloads valid; `smoke-data` treats this as the gear contract until loot is implemented.
- If room profiles or spawn weights change, keep references valid and make sure weighted enemies are usable by at least one eligible room profile; runtime generation still filters by player unlock level.
- If authored room templates change, update `ROOM_TEMPLATE_DEFS` with the lesson's supported metadata keys and required objects/enemies so data smoke can catch schema typos, broken references, required content that unlocks after the template, random templates that do not fit any dungeon theme, and themes with no compatible random lesson before browser tests.
- Add localized text in `I18N` for player-facing names, descriptions, warnings, and inspect labels.

Future passes should keep shrinking `../index.js` by moving tactical combat, inspect-panel formatting, market/camp flows, boss scripting, and remaining end-screen assembly into focused systems.

Smoke checks

- `node tools/smoke-data.js` validates asset maps, object-to-sprite metadata, sprite files, room profiles, room objectives/templates, spawn references, content data, supported item effect handlers and payloads, supported enemy behavior types and payload references, inspect stat chips for key behavior hints, terrain, visibility, and route-risk states, relic metadata, wearable gear metadata, theme eligibility for core supplies plus mid/late enemies, run-summary recommendation branches, and cell-interaction role/action metadata.
- `node tools/smoke-browser.js` launches the browser, verifies the Test page renders and starts every generated object scenario, checks effect inspect stat metadata, starts a run, verifies auto-walk stops on stacked action objects, checks inspect stat chips, and checks market card structure.
- `node tools/smoke-ui-layout.js` verifies the combat HUD stays inside the viewport, life/movement orbs stay on opposite sides, the inspect panel does not overlap them, and end-run stats render in grouped sections on desktop and mobile viewports.
- `npm test` runs all smoke checks in sequence.
- The browser smoke script needs Playwright available through the local Node runtime, uses `CHROME_PATH` if Chrome is installed somewhere other than the default Windows path, and accepts `GAME_URL=http://localhost:8080/index.html` when testing through a local server.

Room lesson templates

- Early rooms force simple lessons: collect supplies, spend pollen on wax doors, defeat an enemy gate, or cross fire with water.
- Room objectives, template selection, exit reveal, and gate placement live in `systems/room-templates.js`; `index.js` should only orchestrate when those passes run.
- `ROOM_TEMPLATE_DEFS` records each authored lesson's minimum player level, random-selection eligibility, and required objects/enemies. Keep it in sync when adding new templates or synergy lessons; data smoke rejects unsupported keys, malformed reference lists, required content that unlocks after the template, random templates with no compatible dungeon theme, and themes with no compatible random lesson.
- Room 3's enemy-gate lesson uses an armored Thorn Beetle and `lessonSafe` cells to visually mark safe flank positions without using danger-red language.
- The Stag Beetle now uses `chargeLane` to turn armored combat into a lane-dodge puzzle: it marks cells in its facing direction, then those marked cells detonate if the bee stays in the lane.
- Later rooms can add synergy templates such as hive + queen signaler, fire + water leech, wax sentinel + pollen thief, and fog shepherd + burrow beetle.
- Exit cells remain visible, but the route to them can be shaped by blockers, hazards, or enemies so the room asks for a specific plan.
