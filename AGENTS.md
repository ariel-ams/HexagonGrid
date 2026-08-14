# Project Agent Guidance

<!-- UX-ORACLE:START -->
## UX Oracle extension

For every task that changes a user interface, read and apply:

- `ui-development/oracle/UX_ORACLE.md`
- `ui-development/oracle/routing-map.md`
- `ui-development/oracle/agent-process.md`
- `ui-development/oracle/trust-and-trends-roadmap.md`
- `ui-development/oracle/project-usage-guide.md`
- `ui-development/project-profile.md`, when it exists

Use `ui-development/oracle/pr-oracle-template.md` for PRs, tickets, or other external reviews. These documents supplement this repository's existing instructions. Accessibility requirements, established project constraints, and explicit user requirements take precedence.
<!-- UX-ORACLE:END -->

## Honeycomb Wayfinder Agent Context

Before making gameplay or UI changes, also read:

- `AGENT_WORKFLOW.md`
- `ui-development/project-profile.md`
- `ui-development/player-experience-roadmap.md`
- `src/README.md`
- `CONTENT_AUTHORING_GUIDE.md`

The nested `hackerrank-orchestrate-august26/` directory is a separate reference project. Do not apply its hackathon onboarding or logging rules to this game unless the user explicitly asks to work inside that subproject. Use it only as inspiration for agent independence patterns such as clear contracts, evidence, validation, and handoff notes.

Current product direction:

- Prioritize first-run clarity, readable tactical choices, and UI decluttering.
- Keep theme mosaic art non-clickable and separate from playable cells.
- Every new game object should have localized text, sprite or fallback, data definitions, and a Test scenario.
- For new raster game art without a final artist asset, read `ASSET_BACKLOG.md` and use the ImageGen skill when generation is appropriate. Define requirements first, preserve user-provided source art, save project-bound outputs in the workspace, and verify transparency, frame alignment, and in-game readability.
- Run `npm test` after meaningful code changes when available; for UI-heavy work, add a browser screenshot or manual visual check summary.
