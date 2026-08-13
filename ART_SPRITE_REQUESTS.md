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

All wearable loot icons should be transparent PNG sprite strips, `4 x 1`, centered in a square frame. They are not rendered yet, but the data table now stores the planned asset path for each item so the future equipment UI and artist handoff stay aligned.

## Wearable Gear Format

Place final wearable art at each `plannedAsset` path under `assets/equipment/`.

- Format: transparent PNG with no white square or baked background.
- Sprite layout: `4 x 1` idle strip, left-to-right frames.
- Recommended frame size: `128 x 128` per frame, exported as a `512 x 128` sheet.
- Framing: keep the item centered with consistent padding so it can appear in reward cards, side-panel gear chips, hover details, and a future inventory screen without sliding between frames.
- Readability target: clear at small HUD chip size first, then polished at card size.
- Shape language: helmet=head gear, jacket=torso/body shell, abdomen=rear pouch/guard, sting=weapon silhouette, wings=movement silhouette.

| Equipment id | Target file | Rarity | Gameplay use |
|---|---|---:|---|
| `waxScoutHelmet` | `assets/equipment/helmet-wax-scout.png` | starter | Soft scout helmet for exit hints and reveal bonuses. |
| `leafJacket` | `assets/equipment/jacket-leaf.png` | starter | Light leaf body gear for first hazard protection. |
| `nectarPouch` | `assets/equipment/abdomen-nectar-pouch.png` | starter | Small abdomen pouch for future honey/resource storage. |
| `barbedSting` | `assets/equipment/sting-barbed.png` | starter | Basic attack gear with a sharper readable sting silhouette. |
| `scoutWings` | `assets/equipment/wings-scout.png` | starter | Simple movement wings for route-control identity. |
| `resinCrown` | `assets/equipment/helmet-resin-crown.png` | common | Resin head guard that reads as extra shield/defense. |
| `petalJacket` | `assets/equipment/jacket-petal.png` | common | Petal armor that reads as safer health for early bosses. |
| `honeySatchel` | `assets/equipment/abdomen-honey-satchel.png` | common | Honey-carrying abdomen gear with a small storage pouch. |
| `longSting` | `assets/equipment/sting-long.png` | common | Longer sting weapon that clearly suggests increased reach. |
| `wideWings` | `assets/equipment/wings-wide.png` | common | Wider movement wings that suggest longer tactical routes. |
| `pollenLens` | `assets/equipment/helmet-pollen-lens.png` | rare | Scout lens/headgear for stronger room-reading clues. |
| `amberJacket` | `assets/equipment/jacket-amber.png` | rare | Amber defensive jacket for heavier telegraphed danger. |
| `royalNectarBand` | `assets/equipment/abdomen-royal-nectar-band.png` | rare | Royal abdomen band for longer mixed-hazard routes. |
| `hookedSting` | `assets/equipment/sting-hooked.png` | rare | Curved sting weapon for stronger reposition-and-attack pressure. |
| `windcutWings` | `assets/equipment/wings-windcut.png` | rare | Sleek fast wings for larger cave-route control. |
