# Honeycomb Wayfinder Art Requests

Sprite sheets should be PNG files with transparent background unless the note says otherwise. Most gameplay sprites use 4 columns per animation row. Keep the subject centered in each frame with consistent padding so it does not slide inside the hex cell.

## Missing Or Unclear Gameplay Sprites

| Sprite name | Target file | Sheet | What it represents | Gameplay readability |
|---|---|---:|---|---|
| `deathCell` | `assets/effects/skull.png` | `4 x 1` | A skull/KO marker shown on path preview when the planned route would kill the bee. | Must be readable over dark and misty hexes. It should look like a warning marker, not an enemy or pickup. |
| `meleeHit` | `assets/effects/melee-hit.png` | `4 x 1` | Generic close attack impact used by bites, punches, thorn hits, and stings until enemies get custom hit effects. | Short burst over the target cell: snap, impact shape, fade. Warm white/yellow for bee attacks or red/orange for enemy attacks if you make variants. |
| `projectileHit` | `assets/effects/projectile-hit.png` | `4 x 1` | Generic ranged attack projectile/impact placeholder for enemies that attack from more than one cell away. | Small moving threat with a clear direction, then pop on impact. Should not look like pollen/water. |
| `bossDangerLane` | `assets/effects/boss-danger-lane.png` | `4 x 1` | Future queen boss telegraph for unsafe adjacent lane. | Red/orange warning lane overlay inside a hex, pulsing but not hiding the cell content. |
| `bossSafeLane` | `assets/effects/boss-safe-lane.png` | `4 x 1` | Future queen boss telegraph for safe lane/reposition hint. | Green/gold lane overlay, visibly different from danger and pickup borders. |
| `wall` | `assets/wall-alpha.png` | `4 x 1` | Impassable rock/wax wall cell. Current wall art can read as a square because it lacks alpha. | Needs transparent background and a hex-friendly silhouette. It should clearly block movement without looking like a collectible. |

## Sprites That Were Reused Or Easy To Confuse

| Sprite name | Target file | Sheet | Current issue | Desired direction |
|---|---|---:|---|---|
| `miteSwarm` | `assets/miteSwarm.png` | `4 x 1` | It was previously wired to the wrong sprite, so verify the final art reads as many small mites rather than a wasp. | A clustered swarm of tiny crawling mites, low to the ground, with many small eyes/legs. |
| `guardWasp` | `assets/guardWasp.png` | `4 x 1` | It was previously reusing the normal wasp in gameplay. | Larger armored wasp with stronger red/black markings and a bigger threat silhouette than `enemy`. |
| `enemy` | `assets/wasp-alpha.png` | `4 x 1` | Normal wasp must stay visually simpler than guard/brood/mirror variants. | Small standard wasp, readable as the base threat. Avoid making it look like a boss. |
| `queenSignaler` | `assets/enemies/queen-signaler-alpha.png` | `4 x 3` | Boss identity needs to be unmistakable at cell size. | Regal commander with crown-like head, glowing antennae, signal rings. Row 1 idle, row 2 signal pulse, row 3 command/angry state. |
| `waspHive` | `assets/enemies/wasp-hive-alpha.png` | `4 x 3` | Boss fight now uses one hive as a pure spawner, so its warning state matters. | Hanging wax hive with glowing holes. Row 1 idle, row 2 spawn warning, row 3 wasp release. |

## Dungeon Theme Art Needed Later

| Sprite/name | Target path | Format | Purpose |
|---|---|---|---|
| `forestBoardBackground` | `assets/ui/forest-board-bg.webp` | WebP or PNG | Existing default background. Keep as fallback theme. |
| `caveBoardBackground` | `assets/ui/cave-board-bg.webp` | WebP or PNG | Dark stone/moss cave background for cave theme. |
| `waspHiveBoardBackground` | `assets/ui/wasp-hive-board-bg.webp` | WebP or PNG | Wax/honeycomb interior background for wasp hive theme. |
| `undergroundBoardBackground` | `assets/ui/underground-board-bg.webp` | WebP or PNG | Soil/root underground background for underground theme. |
| `caveHexTiles` | `assets/tiles/cave/*.png` | PNG transparent/hex art | Theme-specific hidden, visited, path, danger, enemy-border, pickable-border, exit tiles. |
| `waspHiveHexTiles` | `assets/tiles/wasp-hive/*.png` | PNG transparent/hex art | Wax-cell tile set, warmer and more hostile than forest. |
| `undergroundHexTiles` | `assets/tiles/underground/*.png` | PNG transparent/hex art | Dirt/root tile set with readable fog contrast. |

## Future Wearable Loot Icons

| Slot | Suggested files | Sheet | Gameplay use |
|---|---|---:|---|
| Helmet | `assets/equipment/helmet-wax-scout.png` | `4 x 1` | Head gear for scouting, exit hints, reveal bonuses. |
| Jacket | `assets/equipment/jacket-leaf.png` | `4 x 1` | Body gear for defense and hazard mitigation. |
| Abdomen Guard | `assets/equipment/abdomen-nectar-pouch.png` | `4 x 1` | Carrying gear for honey/resource storage. |
| Sting | `assets/equipment/sting-barbed.png` | `4 x 1` | Attack gear for range, damage, or special sting rules. |
| Wings | `assets/equipment/wings-scout.png` | `4 x 1` | Movement gear for route control and repositioning. |

