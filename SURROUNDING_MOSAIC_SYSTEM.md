# Surrounding Mosaic System

This system is for non-playable environment art only. It should make the empty space around the dungeon feel themed without changing clickable cells, object readability, pathfinding, or combat rules.

## Goal

Create a procedural mosaic around the playable cave using joined hex pieces. The player can pan the camera and see theme art outside the dungeon, but only cells stored in `game.cells` remain interactive.

## Asset Format

Each dungeon theme can provide a surroundings sheet:

```text
assets/tiles/themes/{theme-id}-surroundings.png
```

Recommended format:

- Transparent PNG or WebP.
- Hex orientation must match the playable grid: pointy-top hexes.
- Pieces may cover 1, 2, 3, or 4 hex cells.
- Each piece should have transparent outer padding so it can overlap the dark board background without a square edge.
- Edge blend pieces should be separate transparent overlays, not full opaque tiles.

Suggested sheet groups:

```text
row 0: one-hex fillers
row 1: two-hex line pieces
row 2: three-hex bend / triangle pieces
row 3: four-hex blob / corridor pieces
row 4: accent pieces
row 5: transparent edge blend overlays
```

## Data Model

Each theme should eventually define a manifest like this:

```js
{
  id: 'forest',
  sheet: 'assets/tiles/themes/forest-surroundings.png',
  pieces: [
    {
      id: 'moss-single-a',
      size: 1,
      cells: [{ q: 0, r: 0 }],
      source: { row: 0, column: 0 },
      sockets: ['moss', 'moss', 'leaf', 'moss', 'moss', 'shadow'],
      weight: 8
    },
    {
      id: 'root-line-2',
      size: 2,
      cells: [{ q: 0, r: 0 }, { q: 1, r: 0 }],
      source: { row: 1, column: 0 },
      sockets: ['root', 'moss', 'moss', 'root', 'moss', 'moss'],
      weight: 4
    }
  ],
  blends: {
    mossRoot: { row: 5, column: 0 },
    mossStone: { row: 5, column: 1 }
  }
}
```

`cells` are local offsets from the piece anchor. The renderer places the whole piece as one visual object, but each occupied hex is reserved so pieces do not overlap.

## Generation Algorithm

1. Build an environment field around the current viewport and cave bounds.
2. Remove all playable coordinates from that field.
3. Split the field into deterministic chunks, for example 8x8 axial areas, using the run seed and theme id.
4. Fill each chunk with larger pieces first:
   - try 4-hex pieces
   - then 3-hex pieces
   - then 2-hex pieces
   - fill gaps with 1-hex pieces
5. Reject a piece if any occupied coordinate overlaps a playable cell or an already placed piece.
6. Store placed pieces by axial coordinate so camera panning shows stable art.
7. Draw edge blend overlays only where adjacent occupied hexes use different socket/material types.

## Rendering Rules

- Draw surroundings before playable cells.
- Surroundings must not be used by hit detection.
- Surroundings must not be included in pathfinding.
- Surroundings should be lower contrast than playable cells.
- Playable cells keep their current cell art, borders, fog, enemies, and pickups.
- Blend overlays are transparent and draw on top of neighboring surrounding pieces only.

## UI Changes Needed

The current board canvas can support this if the renderer keeps two layers:

- `environmentLayer`: non-clickable mosaic pieces around and beneath the cave.
- `gameplayLayer`: playable cells, fog, objects, hazards, path previews, and the bee.

For now both layers can remain in the same canvas draw pass. If the art becomes heavier, the environment can move to an offscreen cached canvas per camera chunk.

## Test Requirements

- Starting a run with any theme loads the matching surroundings sheet or falls back to the default theme.
- Environment pieces never overlap `game.cells`.
- Clicking a surrounding hex does nothing except clear or update inspect state.
- Panning reveals stable mosaic placement, not random flicker.
- Playable cell alignment remains unchanged.
- Blend overlays draw only on borders between different surrounding materials.
