# Honeycomb Wayfinder Asset Backlog

This file separates runtime art gaps from future content art. Before creating a raster asset, define its gameplay purpose and format here. Use the ImageGen skill when no final artist asset exists and generated art is appropriate; preserve user-provided artist files and create a new derivative or versioned sibling instead of overwriting them.

## Needed Now

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

- Wearable icons: 15 `4 x 1` transparent strips under `assets/equipment/`; generate only when the equipment art UI is ready for final review.
- Combat effects: `melee-hit.png`, `projectile-hit.png`, `boss-danger-lane.png`, and `boss-safe-lane.png`; create when those placeholders are replaced by per-attack visual assets.
- Wall derivative: final `assets/wall-alpha.png` with a hex-friendly blocker silhouette; current wall remains functional.
- Theme-specific playable tile sets for cave, wasp hive, and underground; the existing fallback tiles remain functional.

## ImageGen Requirements

1. Write the asset id, mechanic, animation rows/columns, silhouette, palette, and avoid list before generation.
2. Prefer a flat chroma-key background for simple opaque subjects, then remove it locally and validate corner alpha.
3. Keep every animation frame centered at the same scale and position.
4. Save project-bound source and final assets inside the workspace.
5. Add sprite metadata, a fallback, and a Test scenario or browser evidence.
6. Run `npm test` and visually inspect the asset at actual cell/HUD size.
