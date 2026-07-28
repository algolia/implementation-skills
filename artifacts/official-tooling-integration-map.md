# Official Tooling Integration Map

Use this map to combine the customer-ready implementation bundles with Algolia's official agent skills.

## Core Relationship

Official Algolia skills provide the execution layer. These implementation skills provide the customer workflow layer.

This bundle can live as a separate companion repo linked from the official skills/docs experience, or it can be merged later as a customer implementation extension once reviewed. See `repo-integration-strategy.md` for both paths.

| Official tool or skill | Use it for | This library adds |
| --- | --- | --- |
| `algolia-mcp` | Live search, analytics, no-result analysis, click positions, top searches, recommendations, and index discovery through Algolia MCP. | Customer discovery questions, interpretation, readiness checks, and QA artifacts. |
| `algolia-cli` | Index operations, settings changes, rules, synonyms, records, profiles, backups, imports, exports, API keys, and admin workflows. | Safer implementation planning, settings intent, rollback expectations, and customer-facing validation. |
| `algobot-cli` | Agent Studio, RAG, conversational experiences, agent config-as-code, tools, memory, conversations, and AI workflows. | Agent contracts, readiness gates, security checks, event/feedback plans, and launch recommendations. |
| `instantsearch` | Production InstantSearch and Autocomplete implementation across React, Vue, and JavaScript, including source-of-truth checks. | Search UX decisions, business-context prompts, routing/event QA, maturity framing, and handoff artifacts. |

## Routing Pattern

1. Start with the relevant customer-ready implementation skill to clarify business context and define the artifact.
2. Use the official Algolia skill for live inspection, source-of-truth implementation, or account action.
3. Return to the implementation skill to interpret the result, identify customer tradeoffs, and produce the validation artifact.

## Skill Pairings

| Customer-ready skill | Official skill to pair with | Integration behavior |
| --- | --- | --- |
| `algolia-discovery-planning` | All official skills | Choose whether the request needs MCP, CLI, algobot, InstantSearch, or a customer planning artifact first. |
| `algolia-data-modeling` | `algolia-mcp`, `algolia-cli` | Inspect sample records and live index shape with MCP or CLI, then produce the indexing contract. |
| `algolia-index-configuration` | `algolia-cli`, `algolia-mcp` | Capture or change settings with CLI, inspect analytics/search behavior with MCP, then explain tradeoffs and validation queries. |
| `algolia-events-insights` | `algolia-mcp`, `instantsearch` | Use MCP for analytics signals and the official InstantSearch skill for UI event wiring, then produce event taxonomy and QA steps. |
| `algolia-instantsearch-ui` | `instantsearch`, `algolia-mcp` | Use the official InstantSearch skill for source-of-truth implementation and MCP for live index/schema checks, then validate UX and event behavior. |
| `algolia-autocomplete` | `instantsearch`, `algolia-mcp` | Use the official InstantSearch skill for Autocomplete implementation details and MCP for index/query-suggestion inspection, then validate selection behavior. |
| `algolia-agent-studio` | `algobot-cli`, `algolia-mcp`, `algolia-cli` | Use algobot for agent setup and config, MCP/CLI for search and data dependencies, then produce agent contract and launch QA. |
| `algolia-neuralsearch` | `algolia-mcp`, `algolia-cli` | Use MCP for query/analytics evidence and CLI where settings or index changes are needed, then produce rollout readiness and measurement plan. |
| `algolia-release-qa` | All official skills | Use official skills to inspect or act on the live implementation, then write severity-led customer QA findings. |
| `algolia-ui-libraries` | `instantsearch` | Use official InstantSearch source-of-truth behavior for implementation and this reference to choose the right current UI path. |

## Boundary

Do not duplicate official skill commands inside customer outputs unless the customer needs a runnable next step. Prefer naming the official skill or tool, stating why it is needed, and then using the customer-ready skill to explain the decision and validation criteria.
