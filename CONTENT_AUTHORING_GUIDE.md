# Honeycomb Wayfinder Content Authoring Guide

This guide explains how new content is wired into the game and which files usually need to change. The game is still partly monolithic, but most content data now lives in tables, with systems reading from those tables.

## Main Files

- `index.html`: DOM, CSS, script order, overlays, HUD containers, replay controls.
- `index.js`: room generation, rendering, input, movement, combat, replay, progression, HUD data, and level-design rules.
- `src/data/content.js`: content tables for translations, relics, sprites, enemies, objects, spawn weights.
- `src/systems/items.js`: data-driven item effects.
- `src/systems/enemies.js`: data-driven enemy behaviors.
- `src/systems/dance.js`: final dance move generation, scoring, drawing, and dance replay events.
- `src/systems/audio.js`: music/audio tracks, cue start times, volume ducking, replay audio sync helpers.
- `src/systems/hud.js`: compact icon HUD rendering and tooltip/pulse behavior.

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

## Adding a New Item or Object

Edit `src/data/content.js`.

1. Add translation strings in `I18N.en.objects` and `I18N['es-419'].objects`.
2. Add a sprite entry in `SPRITE_DEFS`.
3. Add an object definition in `OBJECTS`.
4. Add an unlock level in `OBJECT_UNLOCK_LEVELS` in `index.js`.
5. Add it to `DISCOVERY_OBJECT_WEIGHTS` if it should appear as a special generated item.
6. Add it to room profile `allowedDiscovery` or `allowedUtility` in `ROOM_PROFILES`.

Example:

```js
glowPollen: {
    name: 'Glow Pollen',
    color: '#7ee6a5',
    description: 'Reveals a wide patch of mist around this cell.',
    effects: [{ type: 'revealAround', radius: 4 }]
}
```

Item effects are resolved by `src/systems/items.js`. Supported effect examples include:

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

If an item needs a new effect, add a new branch to `applyEffect()` in `src/systems/items.js`.

## Adding a New Enemy

Edit `src/data/content.js`.

1. Add translations in `I18N.en.enemies` and `I18N['es-419'].enemies`.
2. Add a sprite in `SPRITE_DEFS`.
3. Add an enemy definition in `ENEMY_DEFS`.
4. Add a matching object entry in `OBJECTS`.
5. Add an unlock level in `OBJECT_UNLOCK_LEVELS`.
6. Add spawn weight in `ENEMY_SPAWN_WEIGHTS`.
7. Add it to one or more `ROOM_PROFILES.allowedEnemies`.

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

Enemy behaviors are interpreted by `src/systems/enemies.js` and `index.js`.

Existing behavior types:

- `damageAura`: timed damage while the bee is in range.
- `biteAdjacent`: timed adjacent attack for bats.
- `moveTowardPlayer`: moves toward the bee after player movement.
- `moveEverySteps`: moves on a cadence.
- `wakeOnRange`: activates when the bee gets close.
- `refogAura`: hides revealed cells again.
- `stealResourceAura`: steals a resource.
- `fleeFromPlayer`: moves away after stealing.
- `spawnEnemyAura`: spawns another enemy nearby.
- `chargeLane`: marks a short line in the enemy's facing direction with delayed danger cells.
- `disguiseAs`: appears as another object until close.

If a behavior does not exist yet, add a data entry and then implement it in `src/systems/enemies.js` or the movement/timer functions in `index.js`.

## Adding a Wall, Door, or Blocker

Blockers are objects with special movement rules.

- `wall` is a hard blocker. `getCellActionState()` returns unavailable and movement stops.
- `waxDoor` is a soft blocker. `openWaxDoor()` spends pollen or a ready sting.

To add another blocker:

1. Add `OBJECTS[id]` and translations.
2. Add a sprite/fallback.
3. Add an unlock level.
4. Add cursor/action handling in `getCellActionState()`.
5. Add movement handling in `moveTo()` if it can be opened, paid for, or transformed.
6. Add tooltip role/action text in `getObjectRole()` and `getActionPreview()`.

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

The data smoke test verifies that theme object references have unlock levels, board background files exist, core supplies are present, and each theme has at least one eligible enemy in mid/late room profiles.

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

The run state stores `game.equipment`, and `applyEquipmentLoadout(player)` is the hook for applying gear stats. Only simple stat effects are active for now; future loot should add deliberate effects such as route reveal, hazard reduction, extra room carrying capacity, attack range, or movement control.

## Testing Checklist

After content changes:

- Run `node tools/smoke-data.js` to catch missing localization, unlock levels, sprite metadata, missing asset files, invalid room/theme references, and equipment slot mismatches.
- Run `node tools/smoke-browser.js` to catch Test page omissions; it compares the rendered scenario list against the generated object list, verifies each entry has an icon canvas, starts every generated scenario, and checks that objects with effects expose inspect stat chips with HUD sprite rows.
- Run syntax checks on changed JS files.
- Start a new run and inspect the first revealed cells.
- Verify no scrollbars on desktop and mobile.
- Hover the new object and read the tooltip.
- Click the object with valid and invalid resources.
- Check replay if the object creates animation, popups, damage, or movement.
- For audio, verify `audioSystem.getDebugState()`.
- For dance, verify a full run and replay.
