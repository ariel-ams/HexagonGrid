# Honeycomb Wayfinder - Game Design Document

## 1. High Concept

**Honeycomb Wayfinder** is a tactical hex-grid dungeon crawler about a bee scouting dangerous honeycomb chambers to find food. The player explores procedurally generated cave-like hex rooms, gathers resources, manages health, shield, movement points, and one action per turn, avoids telegraphed hazards, and defeats a final boss to finish the run.

The game blends two modes:

- **Dungeon crawl mode:** tactical click movement on a hex grid with player turns, enemy responses, fog, hazards, and resource decisions.
- **Test mode:** focused scenarios for enemies, items, hazards, and other game objects so mechanics can be learned and tuned in isolation.

The prototype is implemented as a static browser game using `index.html`, `index.js`, a `<canvas>`, and sprite assets in `assets/`.

## 2. Design Pillars

### 2.1 Readable Tactics

Every cell should communicate risk, reward, and movement options quickly. The player should be able to scan the grid and understand:

- Where the bee can move next.
- Which nearby enemies are dangerous.
- Which resources are worth collecting.
- Which cells are hidden by mist.
- Which cells are persistent hazards.

### 2.2 Tactical Pressure

The player is making discrete tactical choices. Pressure comes from limited movement, one action per turn, route danger, and enemy responses:

- Wasps and similar enemies punish ending near their threat area.
- Bats and pursuers reposition after player actions.
- Hives, bombers, burrow beetles, fire, and other complex enemies use warnings before their strongest effects.
- The bee can attack normally without a cooldown, but only once per turn unless a later relic or item changes that rule.

This creates pressure without requiring complex controls or waiting for timers.

### 2.3 Resource Conversion

Resources should feed into each other:

- Pollen and water can be spent at beetles.
- Shield absorbs damage before health.
- Sting upgrades convert into stored stronger attacks.
- Water provides survival utility.
- Honey/pollen/water can be spent in markets or camp choices between rooms.

### 2.4 Learn By Inspecting

The player should be able to learn mechanics while playing:

- Hovering or selecting a cell opens a persistent inspect panel.
- The panel shows the object name, role, stats, damage, cost, route risk, and a short lesson.
- Floating popups are kept for quick confirmation only.

## 3. Target Platform

### 3.1 Current Platform

- Browser.
- Static site.
- No build step.
- Playable from `index.html`.
- Deployable through GitHub Pages.

### 3.2 Input

Current input is mouse/pointer based:

- Click cells to move or attack in dungeon mode.
- Press and hold cells for some dance moves.
- Pointer release ends hold input.

Future touch support should use the same pointer events.

## 4. Core Game Loop

### 4.1 Main Run Loop

1. Player starts from the start menu.
2. Player chooses `New Run`.
3. A cave-like dungeon room is generated.
4. Bee starts on a random entry cell.
5. Nearby cells are revealed through mist.
6. Player previews paths by hovering and clicks a destination.
7. The bee spends movement points along the route and may spend one action to collect, attack, open, trade, or trigger an interactable cell.
8. Enemies respond after the player turn: they move, attack, spawn, spread hazards, or advance warnings.
9. The player collects resources, fights enemies, avoids hazards, and reaches the exit.
10. Between rooms, the player can spend resources at camp/market choices and choose relic rewards.
11. After the final cave, the player defeats the boss to complete the run.
12. Run ends with stats and playtest metrics.

### 4.2 Test Loop

1. Player starts from the start menu.
2. Player chooses `Test`.
3. A scrollable list shows every current enemy, item, hazard, and interactable object.
4. Choosing an object creates a focused scenario for that interaction.
5. Test controls can pause the scenario or return to the object list without refreshing.

## 5. Game States

### 5.1 Start Menu

The start menu appears before gameplay.

Options:

- **New Run:** starts normal dungeon gameplay.
- **Test:** opens the object scenario list.

Design purpose:

- Let the player test individual mechanics quickly.
- Keep normal run flow separate from content testing.

### 5.2 Dungeon Mode

Dungeon mode is the primary exploration mode.

Characteristics:

- Cave-like connected hex rooms made from organic blobs and tunnels.
- Random entry and exit cells.
- Mist hides unrevealed cells.
- Objects and enemies are placed on cells.
- Bee can preview longer routes and spend movement points to follow them.
- Bee movement animates between cells.
- Enemy hazards respond after player actions or advance telegraphed countdowns.

### 5.3 Boss Mode

Boss mode replaces the old dance-finale run ending.

Characteristics:

- The boss is placed in the furthest cave room.
- Two hives support the boss and create pressure if the player attacks and retreats repeatedly.
- The fight ends the run when the boss is defeated or the bee reaches `0` health.
- Boss music is expected to be added as a dedicated asset later.

### 5.4 Test Mode

Test mode is a development and learning tool.

Characteristics:

- Shows all current game objects in a scrollable list.
- Each object creates a focused room where its behavior can be observed.
- Test controls allow pausing and returning to the test list.
- New enemies/items should always receive a test scenario.

### 5.5 End Screen

The end screen appears when:

- Health reaches `0`.
- Boss is defeated.

Current stats shown:

- Kills.
- Pollen collected.
- Water collected.
- Time survived.
- Playtest metrics such as moves, attacks, damage sources, resources left, and boss duration.

## 6. Board Design

### 6.1 Hex Grid

The game uses axial hex coordinates:

- `q`
- `r`
- Implicit `s = -q - r`

Current structure:

- Rooms are generated as connected cave blobs on axial coordinates.
- Multiple rooms can be linked into cave-like layouts.
- Entry is placed near the starting room.
- Exit or boss placement favors the furthest room from the start.

### 6.2 Tactical Movement

Adjacent directions:

- East.
- Northeast.
- Northwest.
- West.
- Southwest.
- Southeast.

Current movement behavior:

- Player hovers or selects a cell to preview a route.
- The path highlights the nearest safe route that avoids enemies and hazards when possible.
- If a route is blocked, the preview stops at the last reachable cell and explains the reason in the inspect panel.
- If the route would kill the bee, a death marker appears on the lethal cell.
- Bee starts each turn with `2` movement points.
- Moving costs `1` movement point per cell.
- A far-cell click moves only as far as the current movement points allow.
- The bee animates from old cell to new cell using eased interpolation.
- Movement increments step count.
- Movement reveals mist within range.
- Movement ends the turn when the queued route finishes unless the bee reaches an action-consuming object first.

### 6.3 Actions

The bee has one action per turn.

Action-consuming interactions:

- Attack an enemy.
- Collect an item.
- Open an exit, entry, or door.
- Trade with a beetle.
- Cross a damaging hazard that requires a resource or health payment.

Important routing rule:

- If auto-walk reaches a pickup, door, trader, exit, or hazard, the queued path stops because that cell used the turn action. This prevents accidental chained interactions and makes stacked items easier to understand.

### 6.4 Grid Fit

The board calculates actual grid bounds and scales hex size to fit the center container.

Design intent:

- No clipping.
- No page scroll.
- Board should remain playable at browser viewport size.

## 7. Visibility and Mist

### 7.1 Fog of War

Dungeon rooms hide unrevealed cells with mist.

Visibility rule:

- Cells within distance `2` of the bee are revealed.
- Revealed cells stay revealed.
- Unrevealed cells hide objects and enemies.

Design purpose:

- Encourage exploration.
- Prevent full-board planning from the start.
- Make enemy discovery tense.

### 7.2 Dance Visibility

Dance mode does not use mist.

Reason:

- The dance challenge depends on fast recognition.
- Hidden cells would interfere with timing and readability.

## 8. Room Progression

### 8.1 Entry Cells

Entry cells are randomly selected.

Purpose:

- Define where the bee starts in a room.
- In earlier versions, entry could return to previous rooms. The current direction is focused on forward run flow and final dance progression.

### 8.2 Exit Cells

Exit cells are randomly selected.

Purpose:

- Advance the run to the next room.
- After room progression reaches the final stage, normal room generation is replaced by dance mode.

### 8.3 Final Room

Current final room trigger:

- `FINAL_ROOM = 5`

When room depth reaches the final room, the game generates the dance stage instead of a normal dungeon room.

## 9. Objects and Cells

### 9.1 Empty Cell

Purpose:

- Safe movement space.

Behavior:

- Bee can move through it.
- No interaction.

### 9.2 Pollen

Purpose:

- Collectible resource.

Behavior:

- Adds `+1 pollen`.
- Consumed on pickup.
- Counts toward run pollen stats.

Uses:

- Trade with beetles.

### 9.3 Water

Purpose:

- Collectible resource and light sustain.

Behavior:

- Adds `+1 water`.
- Can restore small health depending on current tuning.
- Consumed on pickup.
- Counts toward run water stats.

Uses:

- Trade with beetles.

### 9.4 Shield Upgrade

Purpose:

- Defensive resource.

Behavior:

- Adds shield.
- Shield has no maximum cap.
- Shield is consumed by incoming damage before health.

Current pickup value:

- `+8 shield`

### 9.5 Double Sting Upgrade

Purpose:

- Offensive one-use stackable power-up.

Behavior:

- Adds `+1 Double Sting` charge.
- Charges stack.
- When attacking a bat, Double Sting is used before regular sting.
- Double Sting kills a bat in one hit.
- Regular sting requires two bat hits.

Design purpose:

- Let players prepare for bat-heavy rooms.
- Create a choice between routing for upgrades and rushing exits.

### 9.6 Vines

Purpose:

- Persistent hazard cell.

Behavior:

- Vines stay on the board.
- Crossing vines deals small damage.
- Vines are not consumed.

Current damage:

- `VINE_DAMAGE = 2`

Damage passes through shield first.

### 9.7 Equipment Loot

Purpose:

- Give the bee longer-term build identity across a run.
- Make room completion rewards matter after the immediate relic choice.
- Prepare the game for future visual loot without making content authors edit core gameplay code.

Current slots:

- Helmet.
- Jacket.
- Abdomen gear.
- Sting.
- Wings.

Acquisition rules:

- New runs begin with one starter item in each slot so the equipment UI always has a readable baseline.
- Equipment rewards are offered between rooms after relic choices when the room-depth cadence says a gear reward is available.
- Reward choices are filtered by player level and never include items already equipped.
- Reward cards show up to three choices, using rarity weight to keep common replacements frequent and rare upgrades occasional.
- Choosing a reward replaces the existing item in the same slot.
- Applying the loadout is idempotent: replacing gear recalculates bonuses instead of stacking stale bonuses.
- If no eligible unequipped gear exists, the equipment reward step is skipped.

Design purpose:

- Let the player build toward movement, attack range, scouting, survival, or resource-storage identity.
- Keep early choices understandable by unlocking common gear before rare gear.
- Give artists and content authors a stable slot and sprite contract before the full inventory screen exists.

## 10. Enemies

### 10.1 Wasp

Purpose:

- Area denial and proximity threat.

Behavior:

- Wasps do not deal damage when attacked.
- Wasps deal damage over time when adjacent to the bee.
- Damage timer is visible on the wasp cell.
- The bee can sting a wasp to defeat it, subject to sting cooldown.

Current values:

- Aura interval: `0.5s`
- Aura damage: `3`

Damage rule:

- Shield blocks first.
- Excess damage goes to health.

Design goal:

- Wasps should make standing nearby dangerous.
- Players should either kill quickly or move away.

### 10.2 Bat

Purpose:

- Pursuer and timed adjacent attacker.

Behavior:

- Up to 1 or 2 bats appear in a dungeon room.
- Bats move toward the bee by stepping into adjacent empty cells.
- Bats cannot start adjacent to the bee.
- Bats attack over time when adjacent.
- Bats do not deal damage when hit.
- Bats require two regular sting hits to kill.
- Double Sting kills a bat in one hit.

Current values:

- Attack interval: `1s`
- Attack damage: `6`
- Hits to kill: `2`

Damage rule:

- Shield blocks first.
- Excess damage goes to health.

### 10.3 Enemy Spawn Safety

No enemy should start adjacent to the bee in any grid.

Design purpose:

- Prevent unfair immediate damage.
- Give player at least one beat to react.

## 11. Combat and Damage

### 11.1 Sting Attack

The bee attacks by moving/clicking onto an enemy cell.

Current behavior:

- Attacking wasp defeats it.
- Attacking bat applies one hit.
- Double Sting charge, if available, is consumed first against bats and kills immediately.
- Sting has cooldown after attacking.

### 11.2 Sting Cooldown

Purpose:

- Prevent attack spamming.
- Force routing decisions around enemies.

Current base cooldown:

- `3000ms`

The UI shows:

- Sting icon.
- Pie-style cooldown fill.
- Remaining time.

### 11.3 Beetle Cooldown Trade

Trade beetles reduce sting cooldown.

Cost:

- `1 pollen`
- `1 water`

Effect:

- Reduces sting cooldown by `0.1s`.

Current minimum cooldown:

- `0.8s`

Beetle cells are one-time use.

### 11.4 Shield Blocking

Shield blocks all incoming damage before health.

Rules:

- Incoming damage first subtracts from shield.
- If shield is enough, health takes no damage.
- If damage exceeds shield, shield goes to `0` and excess subtracts from health.
- Shield has no cap.

Feedback:

- Blocked damage displays as gray text:
  - Example: `-3 blocked`
- Health damage displays as red text:
  - Example: `-2 Health`

### 11.5 Health and Game Over

If health reaches `0`, the run ends.

The end screen appears and shows run stats.

## 12. Dance Finale

### 12.1 Theme

The dance finale represents the bee performing a waggle dance to reveal the path to food.

Visual identity:

- Disco-like pulsing color floor.
- Bright directional arrows.
- Fast timing.
- Repeated motion across the hex grid.

### 12.2 Dance Objective

Complete `12` dance moves.

Current value:

- `DANCE_MOVES_REQUIRED = 12`

Failure condition:

- Miss `3` times.

Current value:

- `DANCE_MAX_MISSES = 3`

### 12.3 Dance Move Types

The dance mode uses multiple move patterns.

#### Fast 3-Step

Description:

- A sequence of 3 adjacent arrows.
- Player must click each arrow quickly.

Timing:

- Each arrow has `1s`.

Design goal:

- Tests quick recognition and rapid movement.

#### Single Hold

Description:

- One adjacent arrow appears.
- Player must press and hold until the ring fills.

Timing:

- Hold duration is `1s`.

Failure:

- Releasing early counts as a miss.

Design goal:

- Breaks up rapid clicking with controlled timing.

#### Multi-Click Cell

Description:

- One cell appears with a counter.
- Player must click it repeatedly.

Current range:

- 2 to 5 clicks.

Feedback:

- Counter decreases with each click.

Design goal:

- Adds pressure and physical input variety.

#### Spread Sequence

Description:

- Sequence is spread across the grid.
- The final step ends on an adjacent neighbor.

Design goal:

- Tests spatial reading across the whole board.
- Creates a larger visual gesture than normal adjacent movement.

### 12.4 Dance Misses

Misses happen when:

- Player clicks the wrong arrow.
- Player releases a hold too early.
- Timer expires.

On miss:

- Miss count increases.
- A new dance move is generated.

At 3 misses:

- Run ends.
- End screen shows path-to-food percentage.

### 12.5 Dance Completion Percentage

Percentage calculation:

```text
dance moves completed / required dance moves * 100
```

Current example:

```text
6 completed / 12 required = 50%
```

## 13. UI and HUD

### 13.1 Layout

The screen uses three main columns:

- Left panel: title, turn prompt, bee stats, cooldown widget, restart.
- Center panel: hex grid canvas.
- Right panel: scrollable game log.

The page is fixed to viewport size with no body scrolling.

### 13.2 Start Menu

Start menu buttons:

- New Run.
- Test Dance.

### 13.3 Stats Panel

Current stats:

- Health.
- Pollen.
- Water.
- Shield.
- Double Sting.
- Room or Dance progress.
- Steps.

### 13.4 Game Log

The log records major actions:

- Room start.
- Exits.
- Combat.
- Bat movement.
- Damage events.
- Dance moves.
- Dance misses.
- Run end.

### 13.5 Popups

Floating numbers appear over cells.

Examples:

- `+1 Pollen`
- `+1 Water`
- `-3 blocked`
- `-2 Health`
- `+1 Double Sting`

### 13.6 End Screen

Shows:

- Kills.
- Pollen.
- Water.
- Time survived.
- Path to food percentage.

## 14. Visual Design

### 14.1 Tone

The game should feel:

- Warm.
- Slightly dangerous.
- Tactical.
- Playful.
- Bee-themed without becoming too cute to read.

### 14.2 Color Usage

Current palette direction:

- Dark green dungeon background.
- Gold accent.
- Blue water.
- Green pollen/resources.
- Purple/blue bats.
- Red/orange wasp danger.
- Gray mist.

### 14.3 Sprite Assets

Current sprite sheets:

- `bee-alpha.png`
- `wasp-alpha.png`
- `bat-alpha.png`
- `bettle-alpha.png`
- `pollen-alpha.png`
- `water_drop-alpha.png`
- `shield-alpha.png`
- `sting-alpha.png`
- `vines-alpha.png`
- `entry-alpha.png`
- `exit-alpha.png`

Most sprites are `4 x 1`.

Bee sprite is `4 x 2`:

- Row 0: idle.
- Row 1: attack.

### 14.4 Sprite Processing

Original sprite files may have light/white backgrounds.

Processed `*-alpha.png` files remove the background and are used by the game.

### 14.5 Fallback Drawing

If sprite loading fails, canvas fallback icons are drawn procedurally.

Purpose:

- Game remains playable.
- Easier debugging when assets are missing.

## 15. Audio Design

Audio is not currently implemented.

Recommended future audio:

- Soft buzzing idle loop.
- Click movement tick.
- Sting attack pluck.
- Shield block chime.
- Wasp warning buzz.
- Bat bite chirp.
- Vine scrape.
- Dance beat loop.
- Dance success/miss cues.

Dance mode should eventually be rhythmically supported, even if not strict beat-matching.

## 16. Tuning Values

Current values:

| System | Value |
|---|---:|
| Hex radius | 4 |
| Final room | 5 |
| Bat attack interval | 1s |
| Bat attack damage | 6 |
| Wasp aura interval | 0.5s |
| Wasp aura damage | 3 |
| Vine damage | 2 |
| Dance moves required | 12 |
| Dance arrow timer | 1s |
| Dance hold duration | 1s |
| Dance sequence length | 3 |
| Max dance misses | 3 |
| Max multi-click count | 5 |
| Base sting cooldown | 3s |
| Minimum sting cooldown | 0.8s |
| Beetle cooldown reduction | 0.1s |
| Shield pickup value | 8 |

## 17. Current Prototype Architecture

### 17.1 Files

```text
index.html
index.js
assets/
```

### 17.2 Rendering

Rendering is done through a single canvas:

- Grid background.
- Hex cells.
- Mist.
- Sprites.
- Timers.
- Arrows.
- Popups.
- Player.

### 17.3 Game State

The main state object stores:

- Cells.
- Logs.
- Room stack.
- Room depth.
- Entry and exit cells.
- Popups.
- Run start time.
- Ended flag.
- Current mode.
- Dance state.
- Player motion.
- Run stats.
- Player stats.

### 17.4 Sprite System

Sprite definitions describe:

- Source file.
- Columns.
- Rows.
- Row index.
- Frame timing.

At load time:

- Images are loaded.
- Alpha bounds are detected per frame.
- Sprites are cropped around visible pixels.
- Frames are drawn centered in each hex.

This prevents animation sliding when sprite padding differs between frames.

## 18. Known Design Risks

### 18.1 Real-Time Damage May Feel Harsh

Wasps and bats can damage the player while they think.

Mitigation options:

- Pause timers while pointer is outside canvas.
- Make first enemy tick delayed.
- Add clearer warning rings.
- Lower damage in early rooms.

### 18.2 Mist Can Hide Too Much

Mist creates tension but can make planning difficult.

Mitigation options:

- Reveal exit direction hint.
- Reveal enemies at distance 2 but not items.
- Add a scouting resource.

### 18.3 Dance Inputs Need Clear Tutorialization

Four dance move types may be confusing.

Mitigation options:

- Show small text labels for dance move type.
- Add distinct visual language per move.
- Introduce move types gradually.

### 18.4 Double Sting Auto-Use May Surprise Players

Double Sting is automatically used before regular sting on bats.

Mitigation options:

- Add a visible charge indicator near sting cooldown.
- Add a confirmation or toggle.
- Use Double Sting only when bat has full health.

## 19. Future Feature Ideas

### 19.1 Room Biomes

Possible room types:

- Flower chamber.
- Flooded comb.
- Wasp nest.
- Vine tunnel.
- Moonlit bat chamber.

### 19.2 More Bee Abilities

Ideas:

- Dash one extra cell.
- Reveal mist burst.
- Drop honey trap.
- Convert pollen to shield.
- Calm wasp aura temporarily.

### 19.3 Enemy Variants

Ideas:

- Wasp queen: larger aura.
- Sleeping bat: wakes when close.
- Spider web: slows movement.
- Mite swarm: follows slowly.

### 19.4 Better Dance Finale

Ideas:

- Beat-synced input.
- Combo scoring.
- Food quality rating.
- Dance trail visualization.
- Unlockable dance patterns.

### 19.5 Persistence

Ideas:

- Best run time.
- Best path-to-food percentage.
- Most kills.
- Most pollen gathered.
- Fastest successful dance.

## 20. Success Criteria

The prototype succeeds if:

- Player understands where they can move.
- Mist makes exploration tense but not confusing.
- Wasps feel dangerous without being unfair.
- Bats force tactical response.
- Shield blocking feels satisfying.
- Double Sting feels valuable.
- Vines affect path choice.
- Dance stage feels like a distinct finale.
- End screen gives clear run feedback.

## 21. Current One-Sentence Pitch

Guide a bee through dangerous honeycomb dungeons, survive wasps, bats, vines, and mist, then perform a final dance to reveal the path to food.
