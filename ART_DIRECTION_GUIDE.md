# Honeycomb Wayfinder Art Direction Guide

This guide describes the target visual style for the game UI and the asset formats needed to replace the current procedural placeholders.

## Visual Target

The game should feel like a hand-painted forest board game: dark moss, warm honey light, carved wood edges, parchment UI, small flowers, vines, leaves, and storybook-style hex cells. The attached reference uses a readable gameplay center with decorative frame details around the edges, so art should support clarity first and decoration second.

Key mood words:

- Cozy forest dungeon
- Honey, wax, parchment, carved wood
- Dark green moss and soft golden path lights
- Hand-painted storybook texture
- Friendly but slightly mysterious

## Screen Composition

The main board should be a dark illustrated forest mat with a carved wooden border. Decorative leaves and flowers can live near the corners and side edges, but the middle of the screen must stay clear for the hex grid.

The UI should use separate pieces:

- Top-left HUD badges for health, shield, stamina, objective/object count, and level.
- Top-right parchment button for the log.
- Bottom-left parchment objective panel with a small ribbon title.
- Optional leafy corner ornaments that do not block gameplay.

Do not bake localized text into the art. The game renders Spanish and English text dynamically.

## Required UI Assets

Place these files under `assets/ui/`.

| Asset | Format | Suggested Size | Notes |
|---|---|---:|---|
| `forest-board-bg.webp` | WebP or PNG | 1920x1080 | Dark forest/moss background. Keep the center readable. |
| `wood-frame.png` | transparent PNG | 1920x1080 | Full-screen carved frame overlay. Transparent center. |
| `leaf-corners.png` | transparent PNG | 1920x1080 | Decorative leaves/flowers around edges. Transparent gameplay center. |
| `hud-pill.png` | transparent PNG, 9-slice friendly | 256x96 | Blank wooden/parchment capsule for stat badges. |
| `hud-icon-backing.png` | transparent PNG | 96x96 | Circular backing behind HUD icons. |
| `log-button.png` | transparent PNG, 9-slice friendly | 256x112 | Blank top-right parchment button. |
| `objective-panel.png` | transparent PNG, 9-slice friendly | 640x240 | Blank parchment panel for objective messages. |
| `objective-ribbon.png` | transparent PNG | 240x72 | Blank orange/brown ribbon for the panel label. |
| `modal-panel.png` | transparent PNG, 9-slice friendly | 720x520 | Blank parchment/wood modal frame. |
| `market-branch.png` | transparent PNG | 720x220 | Branch shelf for trader choices. |

If 9-slice export is not available, provide large transparent PNGs with generous clean centers so CSS can stretch them without visible distortion.

## Hex Grid Assets

Place these files under `assets/tiles/`.

| Asset | Format | Suggested Size | Notes |
|---|---|---:|---|
| `hex-empty.png` | transparent PNG | 256x256 | Dark moss hex with hand-painted border. |
| `hex-visited.png` | transparent PNG | 256x256 | Slightly warmer/flattened version. |
| `hex-hidden.png` | transparent PNG | 256x256 | Misty dark version. |
| `hex-path.png` | transparent PNG | 256x256 | Golden lit path cell. |
| `hex-exit.png` | transparent PNG | 256x256 | Exit highlight layer, not the exit icon itself. |
| `hex-danger.png` | transparent PNG | 256x256 | Faint red danger ring layer. |
| `hex-pickable-border.png` | transparent PNG | 256x256 | Colored border frame for items. |
| `hex-enemy-border.png` | transparent PNG | 256x256 | Colored border frame for enemies. |

Tiles must be centered in the square canvas. The hex shape should fill roughly 88-92% of the image width so it aligns with the current canvas geometry.

## Sprite Rules

Most object sprites should remain the current animation format:

- Static idle animation: `4 x 1` frames.
- Bee animation: `4 x 2` frames.
- Sleeping bat: `4 x 2` frames, first row sleeping, second row attacking/awake.
- Transparent PNG required.
- No white matte or solid background.
- Same frame width and height across the sheet.
- Keep the character centered in every frame so it does not slide inside the hex cell.

Suggested frame size: 256x256 per frame. A `4 x 1` sheet would be 1024x256. A `4 x 2` sheet would be 1024x512.

## HUD Icons

HUD icons should be readable at small sizes and use the same 4-frame sprite-sheet rule when animated. If a HUD icon reuses a game object sprite, make sure the important silhouette is visible inside a circular badge.

Needed HUD icon concepts:

- Health heart
- Shield
- Stamina lightning
- Level badge
- Objective marker
- Pollen
- Water
- Honey
- Attack cooldown/sting
- Danger warning
- Replay pause/close can remain simple UI icons

## Safe Zones

Keep these regions light on decoration:

- Center 65% of the screen: hex grid and bee movement.
- Top-left HUD area: leave contrast behind the HUD pills.
- Top-right log button area.
- Bottom-left objective panel area.

Decorative flowers, vines, and leaves are best near corners and edges.

## Current Code Hooks

The code now has procedural placeholders for the target look:

- Page frame and HUD styling live in `index.html`.
- Canvas forest background and hand-painted hex treatment live in `index.js`.
- Runtime UI art uses cleaned transparent derivatives under `assets/ui/alpha/` when artist exports arrive without an alpha channel.

When final art is delivered, the placeholders can be swapped for image-backed layers without changing gameplay logic. The safest implementation path is:

1. Add image files to `assets/ui/` and `assets/tiles/`.
2. Replace CSS gradient backgrounds with `background-image` layers for frame, buttons, and panels.
3. Add optional tile image loading in the canvas renderer for `hex-empty`, `hex-visited`, `hex-hidden`, `hex-path`, and border overlays.
4. Keep all text rendered by HTML/canvas for internationalization.

## Export Checklist For The Artist

- Use sRGB color.
- Export transparent PNG for overlays, UI frames, icons, and sprites.
- Export WebP or PNG for full-screen backgrounds.
- Avoid baked text.
- Avoid pure white backgrounds in sprites.
- Name files exactly as listed above or include a mapping sheet.
- Include a preview mockup showing the assets together at 1920x1080.
