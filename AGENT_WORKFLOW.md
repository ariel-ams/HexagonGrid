# Honeycomb Wayfinder Agent Workflow

This file gives future agents enough project context to work independently without re-learning the same constraints every turn.

## Start Of Work Checklist

1. Read `AGENTS.md`.
2. For UI work, read:
   - `ui-development/oracle/UX_ORACLE.md`
   - `ui-development/oracle/routing-map.md`
   - `ui-development/oracle/agent-process.md`
   - `ui-development/oracle/trust-and-trends-roadmap.md`
   - `ui-development/oracle/project-usage-guide.md`
   - `ui-development/project-profile.md`
3. Read the relevant project docs:
   - `src/README.md` for architecture and current gameplay model.
   - `CONTENT_AUTHORING_GUIDE.md` for adding content.
   - `CONTENT_MANIFEST_CHECKLIST.md` for the definition of ready for new content.
   - `GAME_DESIGN_DOCUMENT.md` for design pillars and mechanics.
   - `ui-development/player-experience-roadmap.md` for current roadmap priorities.
   - `SURROUNDING_MOSAIC_SYSTEM.md` for theme environment work.
   - `ASSET_BACKLOG.md` before generating or replacing raster game art.
4. Inspect current code before editing. Prefer `rg` and focused reads.
5. Check `git status --short` and preserve user changes.

## Current Implementation Shape

- `index.html`: DOM structure, CSS, menu/overlay containers, canvas shell.
- `index.js`: orchestration layer and still the largest file. It owns game state, input, room flow, many render passes, and system wiring.
- `src/data/content.js`: localized copy, objects, enemies, sprites, relics.
- `src/data/progression.js`: player levels, room profiles, dungeon themes, unlocks.
- `src/data/art.js`: UI art, tile art, theme sheet metadata, HUD icon rows.
- `src/systems/*`: extracted systems for audio, HUD, inspect UI, pathfinding, tactical combat, dungeon generation, enemies, items, equipment, market/camp, replay, and rendering helpers.
- `roadmap-viewer/*`: static React Flow roadmap graph. Update `roadmap-viewer/roadmap-state.js` when active roadmap work changes, completes, or gains new evidence.
- `tools/update-roadmap-state.js`: CLI helper for focused roadmap graph updates. Prefer `npm run roadmap:update -- --node <id> ...` over hand-editing sprint status.

## Product Priorities

Near-term work should favor:

1. First-run clarity.
2. Tactical combat that uses position and route planning.
3. UI decluttering and stronger inspect panel explanations.
4. Non-clickable theme surroundings.
5. Data-driven content authoring and automated content checks.

Avoid adding large new content batches until the player can understand and test existing mechanics clearly.

## UX Oracle Mini-Gate

For every UI-affecting task, include this compact gate in notes or the final response:

```text
UX scope:
Mandatory laws:
- <law>: <criterion> -> <test/result>
Verification:
- <command/manual check>
Verdict: Ship | Iterate | Hold
```

Use `Iterate` when a visual/manual check could not be run or when a known readability/accessibility risk remains.

## Test Commands

- Full smoke suite: `npm test`
- Data/content checks: `node tools/smoke-data.js`
- Browser gameplay smoke: `node tools/smoke-browser.js`
- HUD/layout smoke: `node tools/smoke-ui-layout.js`
- Roadmap viewer smoke: `node tools/smoke-roadmap-viewer.js`
- Roadmap viewer browser smoke: `node tools/smoke-roadmap-browser.js`
- Roadmap-only suite: `npm run test:roadmap`
- Roadmap state updater: `npm run roadmap:update -- --node <id> --status <status> --current --remove-left "<completed left item>" --evidence "npm test"`

On this Windows workspace, Node/Playwright may need elevated execution if sandboxing blocks access to the user path. If a sandbox failure occurs, rerun the same command with the proper approval request rather than changing the command.

## Browser And Screenshot Expectations

Use browser checks for:

- any layout or HUD change,
- theme/cell art alignment,
- start/menu/settings/relic/market overlays,
- movement, inspect, path preview, or combat feedback changes.

For layout-heavy work, save or reference screenshots under `.codex-video-frames/` and summarize what was inspected.

## Content Authoring Rules

- Every new object needs English and Latin American Spanish text.
- Every new object needs either a sprite file or a fallback label.
- Every new enemy/item/hazard should appear in the Test list.
- Use the ImageGen skill for new raster assets when no final artist asset exists and generation suits the requirement. Record the prompt/format, keep source and final files in the workspace, and never overwrite user-provided art without explicit approval.
- The current object-art direction is `lamp-style-core-v1`: hand-painted fantasy materials, clean dark silhouettes, warm wax/gold lighting, transparent backgrounds, and stable frame anchors. Use `assets/items/lamp-cell.png` as the reference and `assets/style-sources/lamp-style-core/manifest.json` as the runtime precedent.
- Before coordinated sprite replacement, create a dated mirrored backup under `assets/sprite-backups/` with hashes and restore instructions. Never edit a dated backup.
- If a mechanic needs setup to understand, add a focused test scenario.
- Use `CONTENT_MANIFEST_CHECKLIST.md` before adding or reviewing new content.
- Red visual language is reserved for damage, death, or immediate danger.
- Pickups, buffs, drains, and utility effects need distinct colors/icons.

## Refactor Rules

When shrinking `index.js`, prefer extracting around stable responsibilities:

- room/objective templates,
- route preview and path risk,
- object interaction handlers,
- boss scripting,
- theme surroundings,
- overlay/menu controllers,
- replay playback visualization,
- inspect panel data formatting.

Do not extract just to move lines. Extract when it gives content authors or future agents a clearer place to add behavior.

## Handoff Notes Pattern

Borrowed from the orchestration subproject: make the next agent's state obvious.

End meaningful work with:

- files changed,
- commands run and results,
- screenshots or manual checks,
- unresolved risks,
- next recommended action.

When the user has authorized publishing, finish the task by committing focused changes and pushing the active branch. Keep unrelated or unsafe local files out of the commit, and report the commit hash, branch, remote, and verification results.
