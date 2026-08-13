# Honeycomb Wayfinder Content Authoring Guide

This guide explains how new content is wired into the game and which files usually need to change. The game is still partly monolithic, but most content data now lives in tables, with systems reading from those tables.

Before adding or reviewing content, copy the relevant section from `CONTENT_MANIFEST_CHECKLIST.md`. That checklist is the quick definition of ready; it now includes a wearable-specific section for gear slots, planned art, and reward readiness. This guide explains the wiring details behind it.

## Main Files

- `index.html`: DOM, CSS, script order, overlays, HUD containers, replay controls.
- `index.js`: room generation, rendering, input, movement, combat, replay, progression, HUD data, and level-design rules.
- `src/data/content.js`: content tables for translations, relics, sprites, enemies, objects, spawn weights.
- `src/systems/items.js`: data-driven item effects.
- `src/systems/enemies.js`: data-driven enemy behaviors.
- `src/systems/cell-interactions.js`: object interaction roles, action labels, cursor hints, collect-on-move exceptions, free-walkover rules, and registered move handlers.
- `src/systems/inspect-stats.js`: maps visibility states, enemy stats, object effects, terrain costs, and route risk into inspect panel stat chips.
- `src/systems/dance.js`: final dance move generation, scoring, drawing, and dance replay events.
- `src/systems/audio.js`: music/audio tracks, cue start times, volume ducking, replay audio sync helpers.
- `src/systems/hud.js`: compact icon HUD rendering and tooltip/pulse behavior.
- `src/systems/equipment.js`: wearable loadout defaults, player-level availability filtering, reward-choice candidates, reward-choice details, equipped-item lookup, slot replacement helpers, active bonus summaries, idempotent loadout application, reward cadence planning, and effect delta summaries for future comparison UI.
- `src/systems/reward-flow.js`: post-room reward sequencing that packages relic choices before eligible equipment choices.
- `src/systems/choice-ui.js`: shared choice-card rendering, including the future equipment reward card that shows slot, rarity, replacement copy, and effect deltas.

## Adding a Sprite or Animation

Add the image to `assets/`. Current animated sprites use sprite sheets.

For most game objects:

```js
myObject: { src: 'assets/my-object.png', columns: 4, rows: 1, row: 0, frameMs: 180 }
```

For the bee:

```js
playerIdle: { src: 'assets/bee-alpha.png', columns: 4, rows: 2, row: 0, frameMs: 180 },
playerAttack: { src: 'assets/bee-alpha.png', columns: 4, rows: 2, row: 1, frameMs: 120 }
```

Where to edit:

- Add or update `SPRITE_DEFS` in `src/data/content.js`.
- For enemies, point `ENEMY_DEFS[id].sprite` at the sprite key.
- For items/objects, use the same object id as the sprite key when possible.
- If art is not ready, leave `src: ''` and add `fallback: 'XX'`.

The renderer trims transparent sprite bounds in `buildSpriteFrames()` and animates frames in `drawSprite()`.

## Adding Wearable Gear Art

Wearable gear uses `plannedAsset` paths in `EQUIPMENT_DEFS` until final art exists. Add final files under `assets/equipment/` using the contract in `ART_SPRITE_REQUESTS.md`.

Rules:

- Use transparent PNG files with no baked background.
- Use a `4 x 1` idle strip, left-to-right frames.
- Prefer `128 x 128` frames, exported as a `512 x 128` sheet.
- Keep the silhouette centered so reward cards, side-panel chips, hover details, and future inventory slots can reuse the same art.
- Keep one clear visual identity per slot: helmet, jacket, abdomen gear, sting, and wings should be distinguishable at HUD-chip size.

After adding or renaming wearable art, run `node tools/smoke-data.js`; it checks that each equipment id and planned asset path has artist-request coverage.

## Adding a New Item or Object

Edit `src/data/content.js`.

1. Add translation strings in `I18N.en.objects` and `I18N['es-419'].objects`.
2. Add a sprite entry in `SPRITE_DEFS`.
3. Add an object definition in `OBJECTS`.
4. Add an unlock level in `OBJECT_UNLOCK_LEVELS` in `src/data/progression.js`.
5. Add it to `DISCOVERY_OBJECT_WEIGHTS` if it should appear as a special generated item.
6. Add it to room profile `allowedDiscovery` or `allowedUtility` in `ROOM_PROFILES`.

Generation references are checked by `node tools/smoke-data.js`: discovery weights must point to objects, room profile item weights must point to objects or supported generation tokens, and profile allowed lists must point to existing objects or enemies. Runtime generation still filters by player unlock level.

Example:

```js
glowPollen: {
    name: 'Glow Pollen',
    color: '#7ee6a5',
    description: 'Reveals a wide patch of mist around this cell.',
    effects: [{ type: 'revealAround', radius: 4 }]
}
```

Item effects are resolved by the `ITEM_EFFECT_HANDLERS` registry in `src/systems/items.js`. Supported effect examples include:

- `gainResource`
- `gainShield`
- `heal`
- `revealAround`
- `pauseEnemyTimers`
- `revealEnemies`
- `revealExitRoute`
- `revealExitHint`
- `slowNearbyEnemies`
- `transformCell`
- `royalNectar`
- `tradeCooldown`

If an item needs a new effect, add a new handler to `ITEM_EFFECT_HANDLERS` in `src/systems/items.js`.
If the effect should be visible in the inspect panel, add its chip metadata to `src/systems/inspect-stats.js` for both English and Latin American Spanish. Utility effects that change planning, such as reveal, pause, slow, or trap creation, should have compact chips.
If route risk needs a new chip, add the metadata to `getRouteStats()` in `src/systems/inspect-stats.js`.
If the object is not a normal collectable, add or update its interaction rule in `src/systems/cell-interactions.js` so the inspect panel, action preview, and cursor all describe the same action.

Item effect payloads are also checked by `node tools/smoke-data.js`:

- `gainResource.resource` must be `pollen`, `water`, `honey`, or `stingCharges`, and `amount` must be positive.
- `gainShield.amount`, `heal.amount`, `revealAround.radius`, and `royalNectar.heal` must be positive.
- `pauseEnemyTimers` and `slowNearbyEnemies` need positive `durationMs` and non-negative `radius`.
- `transformCell.object` must be an object id in `OBJECTS`.
- `tradeCooldown` needs non-negative `pollen` and `water` costs; optional `attackRange` must be positive.

## Adding a New Enemy

Edit `src/data/content.js`.

1. Add translations in `I18N.en.enemies` and `I18N['es-419'].enemies`.
2. Add a sprite in `SPRITE_DEFS`.
3. Add an enemy definition in `ENEMY_DEFS`.
4. Add a matching object entry in `OBJECTS`.
5. Add an unlock level in `OBJECT_UNLOCK_LEVELS`.
6. Add spawn weight in `ENEMY_SPAWN_WEIGHTS`.
7. Add it to one or more `ROOM_PROFILES.allowedEnemies`.

Enemy spawn weights are checked by `node tools/smoke-data.js`: the enemy id must exist, `minDepth` must be a positive integer, `weight` must be positive, and at least one eligible room profile must allow that enemy.

Example:

```js
guardWasp: {
    name: 'Guard Wasp',
    color: '#b83f4a',
    sprite: 'enemy',
    hp: 2,
    attack: 2,
    intervalMs: 1200,
    range: 2,
    behavior: 'Stationary guard. Its larger aura reaches 2 cells.',
    lesson: 'Check your route before entering its zone.',
    behaviors: [{ type: 'damageAura' }]
}
```

Enemy behaviors are listed in `ENEMY_BEHAVIOR_TYPES` in `src/systems/enemies.js` and interpreted by `src/systems/enemies.js`, `src/systems/enemy-turns.js`, and the tactical orchestration in `index.js`.
If the enemy should show a new stat chip or behavior tag in the inspect panel, add that metadata to `src/systems/inspect-stats.js`. Reserve red danger chips for direct damage, lethal telegraphs, or marked danger cells; utility pressure such as water drain or resource theft should use cost/route tones so danger language stays readable.

Existing behavior types:

- `damageAura`: timed damage while the bee is in range.
- `biteAdjacent`: timed adjacent attack for bats.
- `moveTowardPlayer`: moves toward the bee after player movement.
- `pushPlayerOnAttack`: pushes the bee to an empty adjacent cell farther from the attacker after turn damage lands.
- `moveEverySteps`: moves on a cadence.
- `wakeOnRange`: activates when the bee gets close.
- `refogAura`: hides revealed cells again.
- `stealResourceAura`: steals a resource.
- `fleeFromPlayer`: moves away after stealing.
- `spawnEnemyAura`: spawns another enemy nearby. Set `preferTowardPlayer: true` for pressure spawns or `preferAwayFromPlayer: true` for defensive/fleeing spawns.
- `spawnTerrainAura`: spreads terrain or hazard cells nearby.
- `markCellsAura`: marks nearby cells for delayed danger.
- `chargeLane`: marks a short line in the enemy's facing direction with delayed danger cells.
- `burrowAmbush`: marks a cracked warning cell before resurfacing.
- `buffEnemiesAura`: accelerates nearby enemy timers.
- `waterDrainAura`: suppresses water utility nearby.
- `weakPointWindow`: exposes a timed attack opening.
- `mirrorMove`: copies the bee's last movement direction.
- `armoredFacing`: blocks careless frontal attacks.
- `disguiseAs`: appears as another object until close.

If a behavior does not exist yet, add it to `ENEMY_BEHAVIOR_TYPES`, then implement it in `src/systems/enemies.js`, `src/systems/enemy-turns.js`, or the movement/timer functions in `index.js`.

Behavior payloads that reference another object are also checked by `node tools/smoke-data.js`:

- `spawnEnemyAura.object` must be an enemy id in `ENEMY_DEFS`.
- `spawnTerrainAura.object`, `markCellsAura.object`, and `chargeLane.object` must be object ids in `OBJECTS`.
- `disguiseAs.object` must be an object id in `OBJECTS`.

## Adding a Wall, Door, or Blocker

Blockers are objects with special movement rules.

- `wall` is a hard blocker. `getCellActionState()` returns unavailable and movement stops.
- `waxDoor` is a soft blocker. `openWaxDoor()` spends pollen or a ready sting.

To add another blocker:

1. Add `OBJECTS[id]` and translations.
2. Add a sprite/fallback.
3. Add an unlock level.
4. Add an interaction rule in `src/systems/cell-interactions.js`.
5. Register a move handler in `registerCellMoveHandlers()` if it can be opened, paid for, or transformed.
6. Add inspect stat metadata in `src/systems/inspect-stats.js` if it has a cost, damage, or special requirement.

## Adding Music or Audio

Add the audio file to `assets/`.

Register it in `index.js` where `audioSystem` is created:

```js
const audioSystem = window.HW_AUDIO.createAudioSystem({
    tracks: {
        gameplay: { src: GAMEPLAY_MUSIC_SRC, volume: 0.45, loop: true },
        dance: { src: DANCE_MUSIC_SRC, volume: 0.56, startAt: 48, loopFrom: 48 }
    }
});
```

Use:

- `audioSystem.play(id)`
- `audioSystem.stop(id)`
- `audioSystem.stopAll()`
- `audioSystem.duck(id, volume, durationMs)`
- `audioSystem.pauseAll()`
- `audioSystem.getDebugState()` for browser tests.

For MP3 cue starts, serve the game over HTTP with byte-range support. Browsers may not seek MP3s correctly from simple file serving.

## Adding a HUD Stat

HUD data is assembled in `renderStatsHud()` in `index.js` and rendered by `src/systems/hud.js`.

Add an item like:

```js
{ id: 'myStat', value: game.player.myStat, title: 'My Stat: What it does', sprite: 'mySprite', fallback: 'MS', color: '#f5c84b' }
```

Rules of thumb:

- Keep first-room HUD small.
- Use `sprite` when an icon exists.
- Use `fallback` when art does not exist.
- The HUD pulses automatically when `value` changes.

Enemy/damage timers are built in `renderTimerHud()`.

## Adding a Relic

Relics live in `RELICS` in `src/data/content.js`.

Basic shape:

```js
{
    id: 'coolComb',
    name: 'Cool Comb',
    description: 'Sting cooldown reduced by 0.2s.',
    minDepth: 2,
    rarity: 'common',
    apply: () => {
        game.player.attackCooldownMs = Math.max(MIN_ATTACK_COOLDOWN_MS, game.player.attackCooldownMs - 200);
    },
    onRoomStart: () => {
        // Optional recurring effect.
    }
}
```

Current hooks:

- `apply(game)`: when selected.
- `onRoomStart(game)`: after a new room is generated.

The data smoke test validates relic metadata:

- Every relic id must be unique.
- English and Latin American Spanish relic copy must exist.
- `name` and `description` must be readable text.
- `minDepth` must be a positive integer.
- `rarity` must be `common`, `rare`, `epic`, or `legendary`.
- Function properties are limited to supported hooks so typo hooks do not silently fail.
- Each pre-boss reward depth must have enough unlocked, unowned relics to offer three choices.

More hooks can be added through `runRelicHook(hookName, ...args)` in `index.js`. Good future hooks:

- `onDamage`
- `onCollect`
- `onAttack`
- `onReveal`
- `onDanceMove`
- `onExit`

## Adding a Dance Move

Dance logic lives in `src/systems/dance.js`.

To add a move:

1. Add the move type to the `types` list in `spawnMove()`.
2. Add a branch that creates `game.dance.move`.
3. Make sure the move produces `steps`, `index`, and any custom fields.
4. Update `handleClick()`, `startHold()`, `endHold()`, or `update()` if it needs custom input.
5. Update `drawArrow()`, `drawStepReference()`, or `drawUpcomingSteps()` if it needs custom visuals.
6. Add label text in `getStepLabel()`.
7. Record replay events with `helpers.recordReplayEvent()`.

Current move types:

- `fastSequence`
- `hold`
- `multiClick`
- `spreadSequence`

## Adding Level Design Rules

Room generation starts in `generateRoom()`:

1. `generateCaveBlob()` creates connected room cells.
2. `choosePortalCells()` picks entry and exit.
3. `randomObjectFor()` fills the room from the current `ROOM_PROFILES` weights.
4. Lesson passes modify the room:
   - `placeFirstRoomTeachingPickups()`
   - `placeRoomLessonGate()`
   - `revealExitCell()`
   - `placeTeachingEnemy()`
   - `placeBats()`

Use lesson passes for authored mechanics. Keep random generation broad, then place intentional constraints after.

Authored templates also need metadata in `ROOM_TEMPLATE_DEFS` in `src/systems/room-templates.js`. Supported keys are `minLevel`, `random`, `requiredObjects`, `requiredEnemies`, and `synergyEnemies`. Add the template's required content references there so `node tools/smoke-data.js` catches typos, malformed arrays, missing object/enemy references, required content locked after the template's `minLevel`, random templates that do not fit any dungeon theme, and themes that have no compatible random template before a browser run. Set `random: true` when the template should enter the normal post-tutorial room pool.

Examples:

- Room 1: sparse safe start, one pollen, one water, one shield.
- Room 2: wax door near exit plus pollen near start.
- Room 3: enemy guarding exit.
- Later rooms: mixed walls, doors, and stronger guards.

When adding a new mechanic, ask:

- What resource or action does it teach?
- Does the room also generate that resource?
- Is the exit still reachable?
- Is the threat visible before it punishes the player?
- Does the tooltip explain the mechanic?

## Adding Dungeon Themes

Theme data lives in `src/data/progression.js` under `DUNGEON_THEMES`.

Each theme defines:

- `id`, `name`, and `description`.
- `boardBackground`, `boardOverlay`, `cellTint`, and `borderTint`.
- `enemies`: enemy ids allowed to appear in that theme.
- `items`: pickup, utility, and trader ids allowed to appear in that theme.
- `hazards`: terrain/blocker ids allowed to appear in that theme.

The main menu Options panel can force a theme or leave it on `Random`. Room generation still respects player level and `ROOM_PROFILES`; the theme is an additional filter, so a late enemy will not appear early just because the theme allows it.

When adding a new theme, make sure it has at least one valid enemy for mid/late profiles and enough basic supplies (`pollen`, `water`, `upgrade`, and `stingUpgrade`) unless the theme deliberately changes the economy.

The data smoke test verifies that room profile references exist, spawn weights point to usable content, theme object references have unlock levels, board background files exist, core supplies are present, and each theme has at least one eligible enemy in mid/late room profiles.

## Adding Wearable Gear

Wearable metadata lives in `src/data/content.js`:

- `EQUIPMENT_SLOTS` defines the fixed slots.
- `EQUIPMENT_DEFS` defines individual gear pieces and their future effects.

Current slots are:

- `helmet`
- `jacket`
- `abdomen` (`Abdomen Guard`, replacing the less readable "butt" name)
- `sting`
- `wings`

The run state stores `game.equipment`, new runs equip the starter loadout from `src/systems/equipment.js`, `getAvailableEquipment(playerLevel)` filters loot candidates by player level, `hasEquipmentRewardsAvailable({ playerLevel, loadout })` lets room/camp flow decide whether a gear reward can be offered, `createEquipmentLoadoutDetails(loadout, options)` lists every slot with localized equipped gear details, `createEquipmentEffectTotals(loadout, options)` aggregates matching equipped effects for future inventory/stat summaries, `createActiveEquipmentBonuses(loadout)` summarizes active stat bonuses, `createEquipmentEffectDeltas(loadout, equipmentId, options)` compares the current loadout against one candidate and reports gained/lost/unchanged effect amounts, `createEquipmentRewardPlan(options)` decides whether the current room depth should offer gear or wait for the next reward cadence, `createEquipmentRewardChoices()` builds small unequipped reward sets for future loot screens using rarity weights, `getEquipmentChoiceDetails()` describes whether a reward fills an empty slot or replaces current gear and includes slot display metadata, localized rarity metadata, reward weight, localized effect summaries, and effect deltas, `createEquipmentRewardChoiceDetails()` returns reward choices already bundled with that replacement metadata, `createEquipmentRewardOffer(options)` packages localized reward-screen status copy, choice details, and available pool size for the loot UI, `choiceUi.renderEquipmentRewardOffer()` renders those details as comparison cards, `rewardFlow.createPostRoomRewardPlan()` sequences relic choices before eligible gear choices after a room, `selectEquipmentReward(loadout, equipmentId, options)` applies a chosen reward and returns the replacement details plus updated loadout, and `applyEquipmentLoadout(player)` is the hook for applying gear stats. Active gear application is idempotent: previous gear bonuses are removed before new active bonuses are applied, so replacing gear does not stack old stats. Only simple stat effects are active for now; future loot should add deliberate effects such as route reveal, hazard reduction, extra room carrying capacity, attack range, or movement control.

The first reward-ready gear tier unlocks at player level 2. It adds one common replacement per slot so the future loot UI can offer real choices without exposing late-run complexity too early. A second rare tier unlocks at player level 4 with one higher-impact piece per slot, giving the future loot loop a mid-run upgrade target without adding a large content batch.

The data smoke test keeps future gear data ready for implementation:

- Every slot needs `id`, `name`, and `description`.
- Slot ids must be unique.
- Every equipment entry key must match `equipment.id`.
- `slot` must be one of the ids in `EQUIPMENT_SLOTS`.
- Every equipment slot and item needs English and Latin American Spanish `i18n` text before it can appear in future loot UI.
- `rarity` must be `starter`, `common`, `rare`, `epic`, or `legendary`.
- `minLevel` must be a positive integer, and `starter` gear must unlock at level 1.
- `plannedAsset` must point to a future transparent PNG under `assets/equipment/`, and the same id/path must appear in `ART_SPRITE_REQUESTS.md`.
- Optional `rewardWeight` can override the default rarity weight when a specific item should be more or less common in reward choices.
- Every slot must have exactly one `starter` item so future loadout and loot screens have a stable default.
- The equipment and reward-flow systems must be able to create empty and starter loadouts, describe every loadout slot, aggregate equipped effect totals, summarize active bonuses, compare candidate effect deltas, localize slot/item/rarity/effect copy, filter available gear by player level, report whether a non-equipped reward exists, plan room-depth reward cadence, sequence relic choices before eligible equipment choices, generate weighted non-duplicated reward choices, package localized reward offers with pool counts, render equipment reward cards with readable effect deltas, return reward choices with slot replacement, slot display, rarity, reward weight, effect summary details, and effect delta details, apply a selected reward into the loadout without stacking stale active bonuses, equip each item into its declared slot, and mirror applied loadouts onto player state.
- Current effects must be registered in `src/systems/equipment.js`. Future-effect placeholders currently include `futureRevealHint`, `futureHazardBlock`, `futureRoomHoney`, `futureAttackRange`, and `futureMovePoint`, each with a positive `amount`.

## Testing Checklist

After content changes:

- Run `node tools/smoke-data.js` to catch missing localization, unlock levels, missing object-to-sprite metadata, invalid sprite sheet rows or frame timing, missing asset files, objects with no spawn/theme/template/behavior usage path, invalid enemy/object fallback colors, invalid room/theme/spawn/template references, unsupported item effect types, invalid item effect payloads, missing English or Spanish inspect hints for key item effects, terrain, visibility, and route-risk states, unsupported enemy behavior types, invalid enemy behavior payload references, missing English or Spanish inspect hints for key tactical behaviors, invalid relic localization, metadata, or reward-depth coverage, and equipment metadata, planned-art request coverage, slot-id, starter-loadout, or loadout-system mismatches.
- Run `node tools/smoke-browser.js` to catch Test page omissions; it compares the rendered scenario list against the generated object list, verifies each entry has an icon canvas, starts every generated scenario, and checks that objects with effects expose inspect stat chips with HUD sprite rows.
- Run syntax checks on changed JS files.
- Start a new run and inspect the first revealed cells.
- Verify no scrollbars on desktop and mobile.
- Hover the new object and read the tooltip.
- Click the object with valid and invalid resources.
- Check replay if the object creates animation, popups, damage, or movement.
- For audio, verify `audioSystem.getDebugState()`.
- For dance, verify a full run and replay.
