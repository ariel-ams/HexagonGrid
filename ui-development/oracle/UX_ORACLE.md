# UX Oracle for Investigation & Development (Codex Agents)

## Scope

This oracle is a practical guide for building and reviewing UX/UI with Codex agents.
It combines:

1. The Laws of UX principles collected at [lawsofux.com](https://lawsofux.com/).
2. A structured investigation/development workflow so each design decision is testable.

## What is in the source at lawsofux.com (as observed 2026-08-05)

The site is an interactive catalog of principles and short summaries used in product design:

1. Aesthetic-Usability Effect
2. Choice Overload
3. Chunking
4. Cognitive Bias
5. Cognitive Load
6. Doherty Threshold
7. Fittsâ€™s Law
8. Flow
9. Goal-Gradient Effect
10. Hickâ€™s Law
11. Jakobâ€™s Law
12. Law of Common Region
13. Law of Proximity
14. Law of PrÃ¤gnanz
15. Law of Similarity
16. Law of Uniform Connectedness
17. Mental Model
18. Millerâ€™s Law
19. Occamâ€™s Razor
20. Paradox of the Active User
21. Pareto Principle
22. Parkinsonâ€™s Law
23. Peak-End Rule
24. Postelâ€™s Law
25. Selective Attention
26. Serial Position Effect
27. Teslerâ€™s Law
28. Von Restorff Effect
29. Working Memory
30. Zeigarnik Effect

Bonus resources on the site include:
1. Shorter essays in the [Articles](https://lawsofux.com/articles/) section.
2. Creator statement and design context in [Info](https://lawsofux.com/info/).
3. A broad â€œhuman perception and memoryâ€ foundation behind the laws.

## Oracle Core Values

1. Reduce cognitive load before adding visual novelty.
2. Prefer user predictability and continuity over cleverness.
3. Design for memory limits and attention limits before design polish.
4. Keep every decision measurable through interaction evidence.
5. Choose defaults that minimize time-to-task completion.

## Golden Investigation Questions

Use these before proposing or approving UI changes:

1. What user goal is this change trying to improve?
2. Which mental model is being reinforced or broken?
3. Which law(s) can predict failure or friction here?
4. What is the shortest user path through this task?
5. What is the expected delay between intention and action completion?
6. Which part must be protected as high-salience (peak moments)?
7. Where can complexity be hidden, simplified, or deferred?
8. What should be remembered by the user now, at the end, and not at all?
9. Which controls are hard to hit or easy to miss on touch and mouse?
10. What test will prove this is better?

## Law-to-Action Matrix

Use this matrix when reviewing or implementing any feature.

1. Hickâ€™s Law
   - Minimize visible choice count where decisions are urgent.
   - Split long sequences into steps.
2. Millerâ€™s Law
   - Group information into chunks.
   - Keep working memory to roughly 5â€“9 meaningful units.
3. Fittsâ€™s Law
   - Make key targets large and near the expected cursor/finger path.
4. Jakobâ€™s Law
   - Use established interaction patterns users already know.
5. Teslerâ€™s Law
   - Do not pretend complexity is gone; move it to invisible defaults and guidance.
6. Doherty Threshold
   - Keep critical interactions under ~400ms where feasible.
7. Zeigarnik / Peak-End
   - Signal progress and leave users at a clear, confident closure.
8. Postel + Paradox of Active User
   - Be forgiving in input; avoid requiring full reading-heavy onboarding.
9. Proximity / Similarity / Uniform Connectedness / Common Region / PrÃ¤gnanz
   - Group related controls visually and remove ambiguous boundaries.
10. Pareto + Goal-Gradient
   - Optimize the 20% of interactions with highest user impact and provide progress cues.
11. Aesthetic-Usability
   - Polish and hierarchy can increase perceived usability and trust.

## Standard Oracle Workflow for Codex

1. Discovery stage
   - Define success metrics (time, error rate, task completion, confidence).
   - Map user journey and pick 1â€“3 likely impacted laws.
2. Design stage
   - Draft layout/content with law mapping notes beside each section.
   - Add a â€œfriction auditâ€ for every component.
3. Implementation stage
   - Enforce focus order, target sizes, spacing, and visible hierarchy tied to laws above.
4. Validation stage
   - Simulate edge behaviors: novice users, expert users, interruption, latency.
   - Verify against the law checklist and add regression assertions.
5. Review stage
   - Reject non-compliant designs unless explicitly justified by test data.
   - Record decisions in a compact Oracle log.

## Oracle Check Prompt (for Codex)

Use this prompt when asking Codex for design help:

1. "Act as a UX oracle for this task.
   Context:
   - Objective: [what the user is trying to do]
   - Target user: [who]
   - Constraints: [platform, brand, accessibility, performance]
   - Current state: [screen/state summary]
   Return:
   1) laws likely affecting behavior (ranked by impact),
   2) risks of violating each law,
   3) proposed UI edits,
   4) acceptance tests with measurable pass/fail criteria,
   5) one experiment to validate the noisiest assumption."

## Deliverables the Oracle Produces

1. `UX Law Impact` table with risk levels.
2. `Interaction Spec` with concrete copy and spacing/click target decisions.
3. `Evidence Plan` with manual and automated checks.
4. `Fallback Plan` for low-confidence decisions.

## Practical Red Flags

1. Too many controls in one view (Choice Overload).
2. Dense paragraphs in instruction-heavy pages (Cognitive Load, Working Memory).
3. New patterns without precedent for basic tasks (Jakobâ€™s Law).
4. Long processing waits without visible feedback (Doherty, Zeigarnik).
5. Hidden action states and ambiguous related controls (Proximity/Law of Similarity/Uniform Connectedness).
6. Over-customization that removes user control flow (Teslerâ€™s Law + Paradox of Active User).
7. Aesthetic changes that reduce clarity (Aesthetic-Usability only helps when legibility remains high).

## Oracle Upgrade Rule

If a proposed design decision cannot be justified against at least two laws and one measurable test, mark it as "needs evidence-first" and defer release.

## Compact Codex Oracle (Paste-ready)

Use this version for automatic enforcement in every task cycle:

1. Detect UI impact
   - If UI/UX behavior changes (layout, interaction, copy, navigation, feedback, onboarding), trigger the loop automatically.
2. Define constraints up front
   - For each affected component, select 2â€“4 laws and mark each as mandatory or optional.
   - Set one measurable criterion per mandatory law.
3. Generate validation
   - For each mandatory law, define a minimal test.
   - If no existing test exists, create one (manual if needed).
4. Verify end of cycle
   - Run tests; any failed mandatory law requires rework before finalization.
5. Return structured verdict
   - Impact: law, criteria, test, outcome.
   - Verdict: Ship / Iterate / Hold.

Minimal response block:

```text
Task: <summary>
UI scope: <screens/components>
Mandatory laws:
- <law> â€” criterion <...> â€” test <...> â€” result <pass/fail>
Optional laws:
- <law> â€” criterion <...> â€” test <...> â€” result <pass/fail>
No-go checks: <list>
Final verdict: <Ship|Iterate|Hold>
```

## References

1. [Home | Laws of UX](https://lawsofux.com/)
2. [Info | Laws of UX](https://lawsofux.com/info/)
3. [Articles | Laws of UX](https://lawsofux.com/articles/)

### Operational docs (for agents)

For UI task reporting and process control, use:

1. [ui-development/oracle/agent-process.md](./agent-process.md)
2. [ui-development/oracle/routing-map.md](./routing-map.md)
3. [ui-development/oracle/pr-oracle-template.md](./pr-oracle-template.md)


## Applying the Oracle as a Codex Agent Feedback Loop

Use this flow to make Codex use the oracle as a closed-loop design quality gate.

1. Prime the agent with a fixed pre-task prompt.
2. Run code/design changes.
3. Run a structured self-review pass against the oracle.
4. Run measurable checks.
5. Record a short verdict before final response.

### 1) Pre-task prompt block (paste into the task instruction)

Use this exact instruction in Codex prompts when a task affects UI/UX:

```
You are the UX Oracle Gate for this task.
1) Read UX_ORACLE.md before editing.
2) For every UI-affecting decision, identify the likely UX laws and rank by risk.
3) For each law, define one measurable acceptance criterion and one minimal test.
4) Before finalizing, provide:
   - a) UX Law Impact matrix (law, risk, rationale, pass/fail status)
   - b) changed UI elements mapped to at least one law each
   - c) a 3-step post-change verification plan (manual + automated where possible)
5) If any P0/P1 item is unresolved or cannot be measured, pause and ask for clarification before finalizing.
```

### 2) Codex-native feedback loop

For any feature/change request:

1. Discovery
   - Pull user goal and target task.
   - Define affected paths/screens and impacted user cohorts.
2. Design hypothesis
   - Choose primary laws (2â€“4 only) likely to impact behavior.
   - Define expected gains and risks.
3. Implementation
   - Apply design/code changes aligned to law mappings.
4. Self-audit (required by agent)
   - Run this audit and keep it in the task response:
     - `Law â†’ Evidence â†’ Decision â†’ Risk â†’ Next step`
5. Measurable validation
   - Define at least one measurable criterion per law:
     - time-to-task, completion rate, error rate, clicks-to-complete, interruption recovery, user confidence.
6. Close the loop
   - If tests pass and risks are cleared, produce a concise go/no-go line.
   - If risk remains, issue a corrective patch and re-run from Step 4.

### 3) Severity rubric for Codex auto-prioritization

1. P0 (Must fix before shipping)
   - Blocks completion or causes repeated failure in key flow.
2. P1 (High risk)
   - Likely causes frustration/drop-off in common tasks.
3. P2 (Important)
   - Confusing but non-blocking; requires explicit follow-up patch or rationale.
4. P3 (Nice)
   - Aesthetic/consistency improvements with minor impact.

### 4) Output format for Codex review turns

```
Impact Matrix:
- Law:
- Affected UI:
- Why now:
- Expected effect:
- Acceptance test:
- Result:

Verdict:
- Ship / Iterate / Hold
Reason:
```

### 5) Suggested lightweight data schema for machine readability

```json
{
  "task_id": "ui-task-001",
  "laws": [
    {
      "name": "Hickâ€™s Law",
      "risk": "P1",
      "evidence": "reduced options from 7 to 4",
      "metric": "choice_time_ms",
      "status": "pass"
    }
  ],
  "tests": [
    {
      "name": "task_completion_time",
      "target": "< 2500",
      "result": "pending"
    }
  ],
  "final_recommendation": "iterate"
}
```

### 6) Example Codex mini-routine (one-screen change)

1. Parse request.
2. Map screen component to likely laws.
3. Draft patch.
4. Audit patch against 2â€“4 laws.
5. Append matrix and metrics.
6. Return to user with either:
   - `Ship` and explicit criteria passed, or
   - `Iterate` with a single next highest-risk fix.

### 7) Why this works in Codex

OpenAIâ€™s agent loop already works through repeated inference/tool rounds before termination, so embedding this oracle in each loop enforces an explicit review checkpoint without slowing the task.
This is aligned with documented best-practice guidance for agents:
- clear instructions reduce ambiguity and errors,
- loops should be structured around explicit actions,
- guardrails and human checks improve safety and reliability.

Core references for this loop design:
- OpenAI: [Unrolling the Codex agent loop](https://openai.com/index/unrolling-the-codex-agent-loop/)
- OpenAI: [A practical guide to building agents](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf)
- OpenAI: [Introducing Codex](https://openai.com/index/introducing-codex/)
# Evidence and change policy

Use `./trust-and-trends-roadmap.md` to distinguish durable requirements from trend signals. Treat WCAG and platform/component guidance as release gates; treat a trend as a hypothesis that needs a user benefit, an owner, and validation.

