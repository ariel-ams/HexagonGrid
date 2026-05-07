Honeycomb Wayfinder source layout

- `data/content.js`: localized text, object data, enemy data, relic data, sprite definitions, and default balance values.
- `systems/hud.js`: compact board HUD rendering, icon fallbacks, hover helper popups, and pulse tracking.
- `../index.js`: current game runtime, rendering, input, replay, state management, and effect systems.

Recent refactors keep spawn weights, sprite hooks, object text, and enemy balance in content data. Runtime behavior is moving toward small systems such as item effect handlers, shared timed enemy effects, and reusable reveal/timer helpers.

New placeholder sprites should use an empty `src` plus a short `fallback` label in `SPRITE_DEFS`. The renderer will draw the text fallback until final art is available.

Future passes can move rendering, replay, input, dance, combat, and room generation into their own folders once the gameplay shape settles.
