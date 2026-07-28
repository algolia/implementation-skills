# Known Limitations

These skills guide Algolia implementation work by extending official Algolia tooling with customer context, planning, and validation behavior. They do not replace customer access, current docs, or production validation.

Use Algolia MCP, the Algolia CLI, or official Algolia skills when an agent needs live account inspection, analytics, index operations, settings changes, rules, synonyms, object imports, or other account actions. Then use these implementation skills to interpret what was found, make customer-safe decisions, and produce validation artifacts.

## What The Skills Can Do

- Ask better setup questions.
- Create implementation plans.
- Produce indexing contracts, event taxonomies, QA reports, readiness checks, and handoff notes.
- Help agents avoid common setup mistakes around records, variants, events, relevance, UI, and AI readiness.

## What Customers Still Need

- Access to their Algolia app, indices, settings, and analytics where relevant.
- Access to source data, sample records, frontend code, backend conversion flows, and event payloads.
- Current official Algolia docs verification before using version-specific API calls, package names, or product features.
- Security review before exposing keys, secured data, user context, tools, or AI-agent actions.
- Customer approval for business tradeoffs such as ranking priority, merchandising rules, conversion definitions, and rollout risk.
- Web or browsing access when the agent needs to verify current public Academy or docs guidance. If browsing is unavailable, the agent should say the source check was not performed.

## Important Boundary

The skills are procedural education for AI agents. They improve the agent's questions, plans, and validation behavior, but they do not guarantee a correct production implementation without customer data, access, testing, and review.
