Honeycomb Wayfinder source layout

- `data/content.js`: localized text, object data, enemy data, relic data, sprite definitions, HUD icon rows, spawn weights, room pacing, and default balance values.
- `systems/hud.js`: compact board HUD rendering, icon fallbacks, hover helper popups, and pulse tracking.
- `systems/items.js`: data-driven item effects such as resource gains, healing, reveal effects, timer pauses, and cell transforms.
- `systems/enemies.js`: enemy behavior handlers such as auras, refogging, stealing, fleeing, spawning, fire spread, and telegraphed attacks.
- `systems/choice-ui.js`: shared markup for camp, trader, relic, and object-test choices.
- `systems/inspect-ui.js`: DOM rendering for the persistent inspect panel and its stat chips.
- `systems/tactical-flow.js`: movement point/action availability helpers for the turn-based dungeon action economy.
- `systems/dungeon-generation.js`: cave room generation, room graph layout, entry/exit placement, and cell creation.
- `systems/renderer.js`: canvas rendering helpers for dungeon cells, tiles, path previews, sprites, fog, and effects.
- `systems/replay.js`: local replay event recording and playback state helpers.
- `../index.js`: current orchestration layer for input, game state, tactical turns, UI screens, and system dispatch.

Current gameplay model

- The bee uses a tactical action economy instead of a normal attack cooldown.
- Each player turn starts with movement points and one action.
- Moving along the previewed path spends `1` movement point per cell.
- Clicking a far cell walks as far as the current movement points allow.
- Pickups, doors, exits, trading, attacks, and hazards consume the action unless a future rule marks them free.
- When an action-consuming cell is reached during auto-walk, the queued path stops. This prevents the bee from collecting one item and immediately failing on the next item with "action already used."
- After the player spends the turn, enemies respond, hazards/telegraphs tick, fog reveals, and movement/action refill for the next turn.

Inspect and learning UI

- The persistent inspect panel is the main place for object learning.
- Hovering a revealed cell updates the panel on desktop. Tapping or clicking pins/replaces the panel on touch or desktop.
- Floating popups are reserved for fast feedback: damage, healing, shield block, resource gain, blocked action, and rhythm feedback.
- The inspect panel should show the object name, type, explanation, route information, and compact stat chips for effects such as `+1 pollen`, `-1 damage`, `HP`, `ATK`, `range`, cost, or lethal route warnings.

Adding content

- New placeholder sprites should use an empty `src` plus a short `fallback` label in `SPRITE_DEFS`. The renderer will draw the text fallback until final art is available.
- Every new game object must also be reachable from the Test page. Add the object to `OBJECTS` and its behavior data first; the test list is generated from those definitions.
- If the object needs a special setup to demonstrate its mechanic clearly, add that support in `seedTestSupportCells()` and `getTestScenarioMessage()` in `../index.js`.
- Add localized text in `I18N` for player-facing names, descriptions, warnings, and inspect labels.

Future passes should keep shrinking `../index.js` by moving tactical combat, inspect-panel formatting, market/camp flows, and boss scripting into focused systems.

Smoke checks

- `node tools/smoke-data.js` validates asset maps, sprite files, room profiles, and content data.
- `node tools/smoke-browser.js` launches the browser, starts a run, verifies auto-walk stops on stacked action objects, checks inspect stat chips, and checks market card structure.
- The browser smoke script needs Playwright available through the local Node runtime, uses `CHROME_PATH` if Chrome is installed somewhere other than the default Windows path, and accepts `GAME_URL=http://localhost:8080/index.html` when testing through a local server.
