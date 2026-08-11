# Using the UX Oracle in a Project

## What this system does

The Oracle gives Codex agents a repeatable UI development loop:

```text
Route the task -> define UX intent -> use proven patterns -> build states -> test proportionately -> verify -> record evidence -> learn
```

It is designed to be applied automatically when a task changes a screen, component, interaction, content hierarchy, responsive behavior, or user journey. It does not replace product strategy, user research, platform requirements, or professional accessibility review.

## Install in a repository

1. Keep `AGENTS.md` at the repository root and ensure its UX Oracle extension remains present.
2. Keep `UX_ORACLE.md` and the `ui-development/` directory in version control.
3. Start each UI task with `ui-development/oracle/routing-map.md`; it identifies the smallest set of documents required for the situation.
4. Create `ui-development/project-profile.md` from the template below and fill it with project facts.
5. Configure CI only for checks the repository can actually run. Do not claim that a check is automated when it is manual.

## Project profile template

Create `ui-development/project-profile.md` with this content and replace bracketed values:

```markdown
# UI Project Profile

- Product and primary user task: [task]
- Supported platforms and browsers: [scope]
- Design system and component source: [location]
- Token source: [location]
- Accessibility baseline: [for example, WCAG 2.2 AA]
- Supported viewport range and breakpoints: [range]
- Localization/content constraints: [constraints]
- UI test commands: [commands or â€œnone configuredâ€]
- Accessibility test commands/tools: [commands or â€œmanual onlyâ€]
- Visual regression method: [method or â€œnone configuredâ€]
- PR/review location: [system and template location]
- Named UX/accessibility owner for exceptions: [role or person]
```

The profile is project-specific evidence. It takes precedence over generic advice where it is compatible with higher-level requirements.

## The agent workflow for every UI change

### 1. Route and inspect

- Read the root guidance, routing map, and only the task-specific documents it selects.
- Read the project profile when it exists.
- Identify the user goal, affected journey, existing components/tokens, platform constraints, and whether the change introduces a new interaction pattern.

### 2. Define before building

Record a compact UI intent in the task notes, implementation plan, or PR description:

```markdown
UX intent: [user] needs to [complete a task] so that [outcome].
Primary action: [action].
States: [loading, empty, error, success, disabled, permission, long content].
Constraints: [accessibility, responsive, platform, privacy, performance].
Evidence: [requirement, existing pattern, research finding, or hypothesis].
Validation: [tests and manual checks].
```

If a field does not apply, say why. This prevents an agent from silently assuming the happy path is the whole experience.

### 3. Build with the Oracle

- Reuse existing components and tokens first.
- Apply the relevant Laws of UX as a decision check, not as decoration.
- Define focus, hover, active, disabled, loading, empty, error, success, and responsive behavior that apply to the change.
- Use native semantics before ARIA. For a custom widget, match the relevant APG pattern.
- When a UI choice is a trend or an AI-generated proposal, mark it as a hypothesis and specify the user outcome it should improve.

### 4. Test and verify before ending the cycle

- Select the minimum validation from `trust-and-trends-roadmap.md` based on change risk.
- Add or update automated tests when the behavior is repeatable and the project has an appropriate test layer.
- Run configured targeted checks when instructed by the project; otherwise report the checks that still need a human or CI run.
- Manually check the affected primary journey, visible focus, keyboard access, responsive/reflow behavior, and all applicable states.
- For high-risk interactions, additionally check screen-reader output and reversal/error recovery.
- Recheck the requirements actually relevant to the change. Do not manufacture irrelevant tests to satisfy a checklist.

An agent must not declare a UI cycle complete until it can state which requirements applied, what evidence supports them, what was checked, and any remaining limitation.

## Working with pull requests and external systems

Use `ui-development/oracle/pr-oracle-template.md` whenever the change is going into a pull request, issue, ticket, release note, or external review. The agent should complete only the sections that apply and must not claim verification it did not perform.

If there is no PR, keep the compact UX intent and verification result in the task summary, commit message convention, or project tracking system selected in the project profile. External posting or status changes need the authority and workflow of that system; this documentation specifies content, not authorization.

## Review rhythm

At the end of each UI cycle, the agent should answer:

1. What user task improved or changed?
2. Which project pattern, UX law, or requirement governed the decision?
3. Which non-happy states and input modes apply, and were they handled?
4. Which tests and manual checks were run, or intentionally deferred?
5. What remains uncertain and what evidence should the next cycle collect?

During a regular product review, use the roadmap to convert repeat defects or exceptions into design-system improvements, tests, or research questions.

## Example: adding a destructive action

An agent adding â€œDelete workspaceâ€ should route to the interaction, accessibility, and PR documents. Its intent should identify irreversibility; the implementation should provide a clear label, confirmation appropriate to risk, keyboard and focus handling, loading/error feedback, and a recovery path where technically possible. Validation should include the confirmation path, cancellation, failed deletion, focus return, narrow viewport behavior, and the projectâ€™s accessible interaction checks.

## Keeping the system healthy

- Review `project-profile.md` whenever the design system, test stack, product surface, or support matrix changes.
- Review `trust-and-trends-roadmap.md` every six months and remove advice that cannot be tied to a trustworthy source or measurable benefit.
- Update `UX_ORACLE.md` only when a new principle is durable enough to guide many UI decisions; keep task-specific details in the project profile or routing documents.
# Existing-project installer

For a project that already has its own `AGENTS.md`, run the installer from this Oracle repository:

```powershell
.\scripts\install-ux-oracle.ps1 -ProjectPath C:\path\to\project
```

The installer preserves all existing project guidance. It installs Oracle-owned files in `ui-development/oracle/` and appends one managed block between `UX-ORACLE:START` and `UX-ORACLE:END` markers to `AGENTS.md`. It does not create or replace the project-owned profile by default. Add a blank profile template only when wanted with `-InitializeProjectProfile`; an existing profile is never replaced. Run it again with `-Update` to refresh only the Oracle-owned files and that marker block. Use PowerShell's `-WhatIf` first when you want to preview changes.

