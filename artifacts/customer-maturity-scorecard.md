# Customer Maturity Scorecard

Use this scorecard to adapt the agent's questions and deliverables to the customer's readiness.

## Level 1: Beginner Implementation

- Goal: get a correct first implementation running.
- Data: records, objectIDs, and index names are still being defined.
- Events: minimal or not yet instrumented.
- UI: basic search, browse, or autocomplete experience.
- Agent behavior: ask only decision-changing questions, choose reversible defaults, and create clear setup artifacts.

## Level 2: Production Readiness

- Goal: make the implementation reliable, secure, measurable, and launchable.
- Data: indexing pipeline, environments, replicas, secured records, and update ownership are defined.
- Events: queryID, userToken, objectIDs, positions, and conversion events can be validated.
- UI: routing, filters, empty states, mobile behavior, and accessibility are tested.
- Agent behavior: produce launch checks, rollback notes, and severity-led findings.

## Level 3: Optimization

- Goal: improve relevance, conversion, analytics quality, and operational workflows.
- Data: ranking signals and business attributes are trustworthy.
- Events: enough volume and quality exist for analytics, A/B testing, personalization, Recommend, or dynamic re-ranking.
- UI: search behavior is instrumented and monitored.
- Agent behavior: use representative query sets, baseline metrics, and controlled experiments.

## Level 4: AI Readiness

- Goal: support NeuralSearch, Agent Studio, AI shopping assistants, or AI-guided discovery.
- Data: semantic fields are useful, clean, current, and permission-aware.
- Events: feedback and conversion loops are reliable enough for evaluation.
- UI: user journeys expose enough context without leaking sensitive data.
- Agent behavior: validate data, events, security, tool permissions, failure modes, and human review before rollout.

## Readiness Notes

- Current level:
- Evidence:
- Gaps:
- Recommended next level:
- Skills to use:

## Output Style By Level

| Level | Agent should produce | Agent should avoid |
| --- | --- | --- |
| Beginner implementation | Smallest correct setup, plain-language assumptions, owner handoff, and first validation step. | Large taxonomies, advanced tuning, or AI feature setup before data/events are stable. |
| Production readiness | Launch blockers, severity, security checks, rollback notes, and QA evidence. | Treating unvalidated code or dashboard settings as launch-ready. |
| Optimization | Baseline metrics, query sets, experiment plan, and relevance/event diagnostics. | Tuning without representative queries or measurable outcomes. |
| AI readiness | Data/event/permission readiness gates, go/fix-first/do-not-start status, and rollout plan. | Treating NeuralSearch, Agent Studio, personalization, or AI assistants as standalone toggles. |
