# Example Output Pack

Use these examples to calibrate what a strong skill response should look like. They are examples, not fixed templates.

## Data Modeling Output

- Clear recommendation: product-as-record, variant-as-record, grouped variants, or split records by locale, region, account, or permission.
- Sample record with stable `objectID`.
- Searchable, faceting, display, ranking, and event attribution fields.
- Update ownership and reindexing plan.
- Validation queries and edge cases.

## Events Output

- Minimal event map tied to the customer's business goal.
- `queryID`, `objectID`, `index`, `position`, and `userToken` source for each event.
- Frontend/backend ownership and duplicate-event prevention.
- One click and one primary conversion validated end to end before expansion.

## Release QA Output

- Findings first, ordered by severity.
- Evidence and reproduction steps.
- Recommended fix and owner.
- Tests run, tests not run, and residual risk.
- Clear launch recommendation.

## NeuralSearch Output

- Go, fix-first, or do-not-start status.
- Data, filters, events, query set, measurement, and rollback readiness.
- Representative query classes.
- Required fixes before rollout.

## Agent Studio Output

- Agent contract covering purpose, audience, tools, allowed actions, guardrails, and fallback behavior.
- Data, search-tool, events, feedback, authentication, and security readiness.
- Measurement plan tied to customer-visible outcomes.
- Limited-rollout or launch recommendation with fix-first items.
