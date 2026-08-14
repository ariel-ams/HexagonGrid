# Lamp Cell ImageGen Prompt

Mode: built-in ImageGen

Use case: stylized-concept

Asset type: Honeycomb Wayfinder gameplay sprite sheet for the non-pickable `lampCell` reveal beacon.

Create one horizontal 4-frame idle animation strip of the same small magical honeycomb cave lamp, designed to be walked over rather than collected. It is a short rooted wax lantern with a warm golden light core, tiny leaf-like base, and a subtle firefly glow. The four frames show only a gentle idle cycle: frame 1 steady, frame 2 light swells slightly, frame 3 two tiny glow motes rise, frame 4 settles. Keep the object centered at exactly the same position and scale in every frame so it never slides.

Style and medium: polished hand-painted cute fantasy game sprite matching a colorful bee dungeon game; strong readable silhouette at 64-96 px cell size; clean dark outline; golden yellow, wax amber, and a small muted green base.

Composition and framing: exactly four equal square frame regions arranged left-to-right in one horizontal strip, generous identical padding around each object, no dividers, no labels, no text, no hex cell, no floor, no cast shadow.

Scene and backdrop: perfectly flat solid `#ff00ff` chroma-key background across the entire image for background removal; no gradients, texture, reflections, lighting variation, or shadows in the background.

Constraints: same lamp identity and proportions in all four frames; animation changes light intensity and tiny motes only; keep all artwork fully inside each frame; do not use `#ff00ff` anywhere in the lamp; no watermark; no extra objects; do not make it resemble pollen, water, a pickup bag, an enemy, or a tall torch.

The generated source unexpectedly included a valid transparent alpha channel, so the preparation step only crops the strip to four square frames and preserves its alpha.
