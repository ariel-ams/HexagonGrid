# UI Project Profile

- Product and primary user task: Honeycomb Wayfinder, a browser-based tactical hex dungeon game where the player guides a bee through cave rooms, learns objects/enemies through inspection, manages resources, and defeats a final boss.
- Supported platforms and browsers: Desktop and mobile browser viewports. Chrome is the primary local verification target through Playwright. The game should also remain static-site friendly for GitHub Pages.
- Design system and component source: Custom HTML/CSS/canvas UI in `index.html`, `index.js`, and `src/systems/*`. Current visual language uses parchment panels, wood frame UI, compact icon HUD, canvas hexes, and sprite/fallback rendering.
- Token source: CSS custom properties in `index.html` under `:root`; art metadata in `src/data/art.js`; content and sprite metadata in `src/data/content.js`.
- Accessibility baseline: Target WCAG 2.2 AA where the game surface can reasonably support it. Prioritize readable contrast, no viewport scroll, visible state feedback, large pointer targets, keyboard Escape for pause/settings, and reduced cognitive load in first-run UI.
- Supported viewport range and breakpoints: Full viewport browser play with no page scrolling. Current automated checks cover desktop `1365x768` and mobile-like layout through `tools/smoke-ui-layout.js`.
- Localization/content constraints: English and Latin American Spanish via `I18N` in `src/data/content.js`. New player-facing copy must be added for both `en` and `es-419`.
- UI test commands: `npm test`, or targeted `node tools/smoke-data.js`, `node tools/smoke-browser.js`, `node tools/smoke-ui-layout.js`.
- Accessibility test commands/tools: No dedicated automated accessibility runner yet. Manual checks required for contrast, keyboard Escape pause/settings, focusable menu buttons, and text readability over art backgrounds.
- Visual regression method: Playwright screenshots through `tools/smoke-browser.js`, ad hoc screenshots saved under `.codex-video-frames/`, and visual inspection using the browser.
- PR/review location: Use `ui-development/oracle/pr-oracle-template.md` for PRs, review notes, or agent handoffs.
- Named UX/accessibility owner for exceptions: Project owner. If no explicit owner is available during agent work, mark unresolved UI/accessibility risk as `Iterate`, not `Ship`.

## Representative Journey

Primary journey for the next iterations:

1. Start a new run.
2. Understand the objective and current bee status without reading a wall of text.
3. Hover or tap cells to inspect objects and route risk.
4. Move through the first two rooms while learning pickups, resource costs, light cells, and one simple enemy.
5. Reach a boss room that asks for positioning, not repeated hit-and-run waiting.
6. End the run with clear cause, stats, and one useful next-run recommendation.

## Current Baseline Signals

- The project has smoke tests for data integrity, browser startup, HUD layout, inspect chips, market cards, lamp lighting, positional combat, and viewport fit.
- The game is playable but still has high cognitive load when many HUD popups, cell details, and enemy telegraphs compete for attention.
- The non-playable theme environment exists as a separate canvas layer conceptually, but the future mosaic system needs a clearer asset and placement contract before adding larger art pieces.

## Mandatory UX Laws For Near-Term UI Work

- Cognitive Load: first-run rooms and HUD must reduce competing signals.
- Fitts's Law: core controls and pause/settings must be easy to hit on desktop and touch.
- Jakob's Law: route preview, pause/settings, cards, and inspect panel should use familiar patterns.
- Goal-Gradient Effect: room objective, XP, and run progress should make the next useful action obvious.

