# Honeycomb Wayfinder Asset Backlog

This file separates runtime art gaps from future content art. Before creating a raster asset, define its gameplay purpose and format here. Use the ImageGen skill when no final artist asset exists and generated art is appropriate; preserve user-provided artist files and create a new derivative or versioned sibling instead of overwriting them.

## Needed Now

### Lamp-Style Core Set

- Style version: `lamp-style-core-v1`
- Status: generated and integrated
- Reference: `assets/items/lamp-cell.png`
- Manifest: `assets/style-sources/lamp-style-core/manifest.json`
- Runtime backup: `assets/sprite-backups/pre-lamp-style-2026-08-14/`
- Build: `npm run sprites:core-style`
- Assets: Bee, Pollen, Water, Shield Upgrade, Entry, Exit, Wax Door, Thorn Beetle, Crawling Fire, and Burning Cell
- Format: transparent `4 x N` PNG sheets with `512 x 512` frames
- Recovery: run the dated backup's `restore.ps1`, then `npm test`

### Lamp Cell

- Variable: `lampCell`
- Runtime path: `assets/items/lamp-cell.png`
- Source path: `assets/items/source/lamp-cell-imagegen.png`
- Prompt: `assets/items/source/lamp-cell-imagegen.prompt.md`
- Status: generated and integrated
- Format: transparent PNG, `4 x 1`, square frames, consistent subject position, idle glow only
- Gameplay: walkable, persistent reveal beacon; softly reveals adjacent cells and is not collected
- Readability: warm gold wax lantern with a rooted leaf base; must not resemble pollen, water, an enemy, or a tall torch
- Generation: built-in ImageGen source, then `npm run sprites:lamp` for deterministic square-frame cropping

### Death Cell

- Variable: `deathCell`
- Planned path: `assets/effects/skull.png`
- Status: pending; current `KO` fallback remains functional
- Format: transparent PNG, `4 x 1`, square frames, centered marker
- Gameplay: appears on a route preview where following the route would kill the bee
- Animation: skull/defeat marker appears, pulses once, then settles; warning only, never reads as an enemy or pickup
- Readability: pale bone/gray with a restrained danger-red accent; readable over mist and dark cells

## Future Art

Migrate the remaining art through small roadmap batches. The normal Wasp, Bat, Trader Beetle, Vine, Double Sting, Glow Pollen, Nectar Cache, Honey Drop, Clean Water, Smoke Puff, Mite Swarm, and Guard Wasp are complete with reversible 2026-08-14 backups and runtime evidence.

1. Common movement/combat: Wasp, Bat, Trader Beetle, Vine, and Double Sting complete.
2. Common utility items: Glow Pollen, Nectar Cache, Honey Drop, Clean Water, and Smoke Puff complete.
3. Early/mid enemies: Sleeping Bat (`4 x 2`), Wax Moth, and Fog Moth. Mite Swarm and Guard Wasp complete.
4. Tactical objects: Sticky Honey, Sticky Trap, Compass Pollen, Sun Shard, and Flower Map.
5. Advanced enemies: Brood Wasp, Stag Beetle, Honey Leech, False Flower, and Wasp Hive (`4 x 3`).
6. Complex-enemy refresh: Honey Snare Spider, Burrow Beetle, Queen Signaler, Fog Shepherd, and Pollen Thief Moth.
7. Late-enemy refresh: Wax Sentinel, Mirror Wasp, Comb Bomber, Water Leech, and Larva Brood.
8. Effects and blockers: Death Cell, melee hit, projectile hit, boss lanes, wall alpha, and remaining warning/aura effects.
9. Wearable icons: 15 `4 x 1` transparent strips under `assets/equipment/` once equipment art is ready for final review.
10. Theme-specific playable tile sets for cave, wasp hive, and underground after object readability is stable.

## ImageGen Requirements

1. Write the asset id, mechanic, animation rows/columns, silhouette, palette, and avoid list before generation.
2. Prefer a flat chroma-key background for simple opaque subjects, then remove it locally and validate corner alpha.
3. Keep every animation frame centered at the same scale and position.
4. Save project-bound source and final assets inside the workspace.
5. Add sprite metadata, a fallback, and a Test scenario or browser evidence.
6. Run `npm test` and visually inspect the asset at actual cell/HUD size.
