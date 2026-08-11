# Codex Agent UI Process

Run this exact loop for every UI-impacting task.

1. Intake
   - Detect UI surface and user goal.
   - List affected files and interaction points.
2. Law mapping
   - Select 2â€“4 primary laws and mark each as:
     - `mandatory`
     - `optional`
3. Define checks
   - For every mandatory law:
     - define one measurable criterion,
     - define one test (manual, automated, or both),
     - define pass threshold.
4. Implement
   - Apply changes aligned to law criteria.
5. Validate end of cycle
   - Execute all mandatory tests.
   - Record pass/fail and evidence links/log references.
6. Decide
   - `Ship` if all mandatory laws pass,
   - `Iterate` if any mandatory law fails,
   - `Hold` if risk/ambiguity blocks a confident decision.
7. Report
   - Attach compact evidence block (see template in `pr-oracle-template.md`).

# Required behavior

- If any mandatory check is not executed, treat it as failed.
- If implementation is incomplete but could be validated with follow-up tests, return `Iterate` and patch first.


