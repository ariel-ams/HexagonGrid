# Lamp-Style Core Art Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use godmode:task-runner to implement this plan task-by-task.

**Goal:** Replace ten first-run runtime sprite sheets with a cohesive hand-painted style derived from the Lamp Cell while preserving a complete reversible backup.

**Architecture:** Existing runtime paths remain unchanged so gameplay metadata and loading behavior do not need a parallel migration. Before replacement, every current runtime sheet is copied into `assets/sprite-backups/pre-lamp-style-2026-08-14/` with a manifest, checksums, and a restore script. Generated source images and prompts live under `assets/style-sources/lamp-style-core/`, while prepared runtime sheets retain the established `4 x N` square-frame contracts.

**Tech Stack:** Built-in ImageGen, PowerShell/System.Drawing asset preparation, existing canvas sprite renderer, Node smoke tests, Playwright browser evidence.

---

## Approved Sprite Set

| Asset | Runtime path | Sheet | States |
| --- | --- | --- | --- |
| Bee | `assets/bee-alpha.png` | `4 x 2` | idle, sting attack |
| Pollen | `assets/pollen-alpha.png` | `4 x 1` | idle glow |
| Water | `assets/water_drop-alpha.png` | `4 x 1` | idle ripple |
| Shield upgrade | `assets/shield-alpha.png` | `4 x 1` | idle protection pulse |
| Entry | `assets/entry-alpha.png` | `4 x 1` | quiet starting doorway |
| Exit | `assets/exit-alpha.png` | `4 x 1` | inviting destination pulse |
| Wax door | `assets/waxDoor.png` | `4 x 1` | sealed blocker idle |
| Thorn Beetle | `assets/thornBeetle-alpha.png` | `4 x 1` | armored idle |
| Crawling Fire | `assets/enemies/crawling-fire-alpha.png` | `4 x 3` | idle, crawl, extinguish |
| Burning Cell | `assets/effects/burning-cell-alpha.png` | `4 x 1` | persistent floor hazard |

## Task 1: Preserve Current Runtime Art

**Files:**

- Create: `assets/sprite-backups/pre-lamp-style-2026-08-14/README.md`
- Create: `assets/sprite-backups/pre-lamp-style-2026-08-14/restore.ps1`
- Create: `assets/sprite-backups/pre-lamp-style-2026-08-14/checksums.sha256`
- Copy: all ten runtime files listed above into matching relative paths below the backup directory

**Verification:** Compare SHA-256 hashes between each runtime source and its backup before any runtime replacement.

## Task 2: Generate Reproducible Source Art

**Files:**

- Create: `assets/style-sources/lamp-style-core/<asset>-imagegen.png`
- Create: `assets/style-sources/lamp-style-core/<asset>.prompt.md`

Use `assets/items/lamp-cell.png` as the visual reference. Require transparent backgrounds, stable subject position, strong silhouettes at 64-96 px, no hex tiles, and no labels. Preserve multi-row state order exactly.

## Task 3: Prepare Runtime Sheets

**Files:**

- Create: `tools/prepare-sprite-grid.ps1`
- Modify: `package.json`
- Replace: the ten approved runtime paths

The preparation script crops each generated source to the requested `4 x N` square-frame aspect without flattening alpha. It rejects invalid dimensions or content-free sources.

## Task 4: Validate Contracts And Gameplay Readability

**Files:**

- Modify: `tools/smoke-data.js`
- Modify: `tools/smoke-browser.js`
- Modify: `ASSET_BACKLOG.md`
- Modify: `ui-development/player-experience-roadmap.md`
- Modify: `roadmap-viewer/roadmap-state.js`

Checks:

1. Every runtime sheet exists and has the expected `4 x N` square-frame dimensions.
2. Corner alpha is transparent.
3. Existing sprite metadata continues to reference the same runtime paths.
4. A browser gallery and representative first-run/test scenarios show the assets at actual cell scale.
5. `npm test` passes.

## Task 5: Land The Migration

Commit only after the backup hash comparison, runtime contract checks, browser evidence, and full test suite pass.

Commit message: `feat: migrate core sprites to lamp art style`
