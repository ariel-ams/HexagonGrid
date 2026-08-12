# Honeycomb Wayfinder Content Manifest Checklist

Use this checklist before adding or merging a new enemy, item, hazard, relic, theme, sprite, audio cue, or wearable. It is meant to be copied into an issue, PR, or local handoff note.

## Universal Fields

- Content id:
- Content type: enemy | item | hazard | relic | theme | sprite | audio | wearable
- Player lesson:
- First unlock level:
- First room/theme where it should appear:
- English copy added:
- Latin American Spanish copy added:
- Sprite metadata or fallback label added:
- Test page scenario available:
- Inspect panel explains its value, cost, risk, or counterplay:
- Smoke tests run:

## Enemy

- `I18N.en.enemies[id]` and `I18N['es-419'].enemies[id]` include name, behavior, and lesson.
- `ENEMY_DEFS[id]` defines `name`, `color`, `sprite`, `hp`, `attack`, `range`, `behavior`, `lesson`, and any `behaviors`.
- `OBJECTS[id]` exists or is generated from `ENEMY_DEFS`.
- `OBJECT_UNLOCK_LEVELS[id]` exists in `src/data/progression.js`.
- The enemy appears in at least one `ROOM_PROFILES[*].allowedEnemies` entry at or after its unlock level.
- The enemy appears in at least one suitable `DUNGEON_THEMES[*].enemies` list.
- If it has a unique mechanic, `seedTestSupportCells()` and `getTestScenarioMessage()` make that mechanic visible on the Test page.
- Counterplay is visible through inspect text, route risk, telegraph art, or safe-cell placement.

## Item Or Hazard

- `I18N.en.objects[id]` and `I18N['es-419'].objects[id]` include name and description.
- `OBJECTS[id]` defines `name`, `color`, `description`, and data-driven `effects` when applicable.
- `SPRITE_DEFS[id]` exists, or a short fallback label is provided while art is pending.
- `OBJECT_UNLOCK_LEVELS[id]` exists in `src/data/progression.js`.
- Spawn path is intentional: room `itemWeights`, `allowedDiscovery`, `allowedUtility`, objective template, enemy behavior, or theme hazard list.
- Inspect stat chips show any resource gain, heal, shield, reveal, pause, damage, blocker cost, or hazard cost.
- If the object is persistent terrain, pathfinding and route-risk behavior are checked.

## Relic

- English and Latin American Spanish relic copy exist.
- Relic id, name, description, rarity/depth assumptions, and effect hook are documented.
- The effect is applied once at the correct timing.
- The relic appears in the chosen relic panel with readable copy.
- The effect is visible in HUD, inspect, room start, or combat feedback.

## Wearable

- `EQUIPMENT_DEFS[id]` uses one of the fixed slots: `helmet`, `jacket`, `abdomen`, `sting`, or `wings`.
- English and Latin American Spanish wearable copy exist.
- `rarity`, `minLevel`, and optional `rewardWeight` match the intended progression tier.
- `plannedAsset` points to a future transparent PNG under `assets/equipment/`.
- The wearable id and planned asset path are listed in `ART_SPRITE_REQUESTS.md`.
- Effects use registered equipment effect types, and future-only effects are clearly labeled as future behavior.
- Reward helpers can include the wearable without duplicating already equipped gear.

## Theme

- Theme defines `id`, `name`, `description`, `boardBackground`, `boardOverlay`, `cellTint`, and `borderTint`.
- Theme lists include `enemies`, `items`, and `hazards`.
- Core supplies are present unless the theme deliberately changes the economy: `pollen`, `water`, and `upgrade`.
- At least one eligible enemy exists for mid/late room profiles.
- Board background asset exists.
- Theme surroundings stay non-clickable and do not overlap playable cells.

## Sprite Or Audio

- Sprite sheet format is documented: columns, rows, animation rows, frame size if known, and alpha/transparency expectation.
- New sprite file path matches `SPRITE_DEFS`.
- Missing final art uses `src: ''`, `plannedAsset`, and `fallback`.
- Audio cues use the audio system rather than direct element playback.
- Music/effects volume settings apply to the new cue.

## Verification

- `node tools/smoke-data.js`
- `node tools/smoke-browser.js`
- `node tools/smoke-ui-layout.js` if UI, HUD, layout, overlay, or viewport behavior changed.
- `npm test` before committing meaningful code changes.
- Manual browser check or screenshot if the change affects visual readability.
