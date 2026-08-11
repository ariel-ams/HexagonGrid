# PR + Review Template: UI Oracle Gate

Use this exact block in PR descriptions or agent handoff notes.

```text
Task summary:
- User goal:
- UI scope:
- Files changed:

Oracle evidence:
- Mandatory laws:
  - <law> | criterion: <...> | test: <...> | pass: <yes/no> | evidence: <log/screenshot/metric>
  - <law> | criterion: <...> | test: <...> | pass: <yes/no> | evidence: <log/screenshot/metric>
- Optional laws:
  - <law> | criterion: <...> | test: <...> | pass: <yes/no>

Verification:
- Test commands run:
  - <command + result>
- Manual checks:
  - <check + result>
- Blockers:
  - <if any>

Decision:
- Verdict: [Ship | Iterate | Hold]
- Reason:
- Next cycle action (if Iterate):
  - <highest priority fix>
```

## Process rule

- The agent must include this block whenever UI change touches interaction, copy, layout, flow, or feedback behavior.
- If mandatory checks are incomplete, the final verdict must be `Iterate`.


