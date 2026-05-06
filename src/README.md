Honeycomb Wayfinder source layout

- `data/content.js`: localized text, object data, enemy data, relic data, sprite definitions, and default balance values.
- `../index.js`: current game runtime, rendering, input, replay, and state management.

This keeps the growing content tables editable outside the gameplay loop. Future passes can move rendering, replay, and input into their own folders.
