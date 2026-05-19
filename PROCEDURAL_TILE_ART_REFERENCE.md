# Procedural Background Tile Art Reference

This reference is for creating theme-specific background mosaics for the hex dungeon board.

## Existing Local References

- `assets/tiles/hex-empty.png`
- `assets/tiles/hex-hidden.png`
- `assets/tiles/hex-visited.png`
- `assets/tiles/hex-path.png`
- `assets/background_cell.png`
- `assets/ui/forest-board-bg.webp`

These already show the current visual direction: dark readable cells, parchment/wood UI, soft hand-painted borders, and organic forest texture.

## Goal

Create tile sheets that can be procedurally mixed so every dungeon theme feels distinct without needing a unique painted map.

The board should feel like a mosaic made from small pieces:

- subtle variation per cell
- hand-painted material texture
- readable hex boundaries
- no strong focal points in ordinary cells
- no heavy contrast behind enemies/items
- art should support fog, reveal, danger rings, and route highlights

## Required Format

Create one PNG sheet per theme:

```text
assets/tiles/themes/{theme-id}-cells.png
```

Suggested sheet layout:

```text
6 columns x 4 rows
128 x 128 px per tile
768 x 512 px total
transparent background preferred
```

Each frame should be a flat-top hex tile centered in the 128 x 128 frame.

If alpha is not possible, use a solid chroma background color that is not used inside the artwork, but transparent PNG is strongly preferred.

## Tile Rows

Row 1: normal floor variants

- 6 low-contrast ordinary walkable cells
- same material, different cracks/dust/leaves/speckles

Row 2: revealed/visited variants

- 6 darker or quieter cells
- should read as already seen
- less visual energy than normal floor

Row 3: hidden/fog-compatible variants

- 6 muted cells
- lower saturation and contrast
- must work under mist overlay

Row 4: feature variants

- 2 brighter path-readable tiles
- 2 soft light/lamp-lit tiles
- 1 danger-compatible tile
- 1 rare decorative tile

## Theme Directions

### Cave

Material:

- mossy dark stone
- mineral veins
- damp cracks
- small pebble clusters
- occasional amber wax residue

Palette:

- deep green-gray
- cool stone blue
- muted moss
- tiny warm amber accents

Avoid:

- bright crystals as normal cells
- high-contrast cracks under sprites

### Forest

Material:

- moss floor
- compact leaves
- bark dust
- tiny flowers
- warm pollen specks

Palette:

- deep green
- olive
- honey yellow accents
- soft brown leaf edges

Avoid:

- large flowers in ordinary cells
- strong leaf shapes that look like pickups

### Wasp Hive

Material:

- wax comb floor
- hardened resin
- dark honey seams
- thin wasp-scratched lines

Palette:

- amber
- dark gold
- burnt orange
- brown wax shadows

Avoid:

- making normal cells look like pollen or honey pickups
- too much yellow behind yellow enemies

### Underground

Material:

- packed soil
- roots
- small stones
- fungal specks
- damp dirt gradients

Palette:

- dark umber
- muted clay
- desaturated root green
- pale fungus dots

Avoid:

- overly brown/orange one-note palette
- dense root lines that hide paths

## Procedural Mixing Rules

The game will be able to choose a tile frame based on:

- dungeon theme
- cell state: normal, visited, hidden, lit, danger
- stable cell seed
- optional rare decoration chance

So every frame should be loop-friendly and independently readable.

## Readability Checklist

Before final delivery, test each tile at:

- 128 px
- 72 px
- 48 px

At 48 px, the player should still understand:

- cell boundary
- whether it is hidden, visited, or active
- whether an object placed on top is readable

## Delivery Checklist

For each theme, provide:

- `assets/tiles/themes/cave-cells.png`
- `assets/tiles/themes/forest-cells.png`
- `assets/tiles/themes/wasp-hive-cells.png`
- `assets/tiles/themes/underground-cells.png`

Optional later:

- `assets/tiles/themes/{theme-id}-overlays.png` for cracks, vines, mist stains, burn marks, and light glows.
