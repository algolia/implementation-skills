# Repository Integration Strategy

Use this when deciding whether the customer-ready implementation skills should live in a separate repo or be merged into the official Algolia skills repo.

## Recommended Positioning

Position this bundle as an extension pack for the official Algolia skills:

```text
Algolia official skills provide execution: MCP, CLI, algobot, and InstantSearch workflows.
Algolia customer implementation skills provide education workflow: discovery, planning, readiness, validation, QA, and customer handoff artifacts.
```

This keeps ownership clear while making the two sets feel like one ecosystem.

## Option A: Separate Companion Repo

Recommended for first review and customer education programs.

Suggested repo name:

```text
algolia-customer-implementation-skills
```

Suggested structure:

```text
algolia-customer-implementation-skills/
  README.md
  skills/
    algolia-discovery-planning/
    algolia-data-modeling/
    algolia-index-configuration/
    algolia-events-insights/
    algolia-instantsearch-ui/
    algolia-autocomplete/
    algolia-release-qa/
    algolia-agent-studio/
    algolia-neuralsearch/
    algolia-ui-libraries/
  artifacts/
    official-tooling-integration-map.md
    repo-integration-strategy.md
    indexing-contract-template.md
    event-taxonomy-template.md
    qa-report-template.md
```

Benefits:

- Keeps the customer education layer easy to iterate.
- Avoids mixing procedural education artifacts into the official execution repo too early.
- Lets Academy embed specific skills or bundles inside relevant courses.
- Lets technical SMEs review content without blocking the official skills release path.

Tradeoff:

- Customers may need one extra link unless the official repo and docs page point to this companion pack.

## Option B: Merge Into Official Skills Repo

Recommended only after SME review and customer testing.

Suggested merged structure:

```text
skills/
  algolia-mcp/
  algolia-cli/
  algobot-cli/
  instantsearch/
  customer-implementation/
    algolia-discovery-planning/
    algolia-data-modeling/
    algolia-index-configuration/
    algolia-events-insights/
    algolia-instantsearch-ui/
    algolia-autocomplete/
    algolia-release-qa/
    algolia-agent-studio/
    algolia-neuralsearch/
    algolia-ui-libraries/
artifacts/
  customer-implementation/
    official-tooling-integration-map.md
    indexing-contract-template.md
    event-taxonomy-template.md
    qa-report-template.md
```

Benefits:

- One official install path.
- Stronger credibility.
- Easier for agents to discover both execution skills and customer implementation skills together.

Tradeoff:

- Requires clear naming, ownership, and validation so the customer education layer does not blur with official execution skills.

## Naming Guidance

Avoid:

- Replacement skills.
- Better official skills.
- Documentation skill pack.
- Static best practices library.

Use:

- Customer implementation skills.
- Customer-ready extension pack.
- Academy-informed implementation workflows.
- Companion skills for official Algolia agent tooling.

## Marketplace Manifest Guidance

If published as a plugin/marketplace package, describe it as:

```text
Customer-ready implementation skills that extend official Algolia MCP, CLI, algobot, and InstantSearch skills with discovery prompts, implementation planning, readiness checks, validation artifacts, and launch QA.
```

Each marketplace entry should say which official skill it extends. For example:

| Skill | Marketplace positioning |
| --- | --- |
| `algolia-data-modeling` | Extends `algolia-mcp` and `algolia-cli` by turning live index/data inspection into an indexing contract. |
| `algolia-events-insights` | Extends `algolia-mcp` and `instantsearch` by turning analytics and event wiring into a customer event taxonomy and QA plan. |
| `algolia-agent-studio` | Extends `algobot-cli` by turning Agent Studio setup into a customer-ready agent contract, guardrail plan, and launch recommendation. |
| `algolia-release-qa` | Extends all official skills by turning live inspection and implementation evidence into severity-led customer QA findings. |

## Course Embedding Pattern

In Academy, embed these as practice and implementation-review tools:

| Course area | Embed |
| --- | --- |
| Data modeling | `algolia-data-modeling` plus indexing contract template. |
| Events and Insights | `algolia-events-insights` plus event taxonomy template. |
| Search UI | `algolia-ui-libraries`, `algolia-instantsearch-ui`, and official `instantsearch`. |
| NeuralSearch | `algolia-neuralsearch` plus readiness report prompt. |
| Agent Studio | `algolia-agent-studio` plus official `algobot-cli`. |
| Launch readiness | `algolia-release-qa` plus QA report template. |

## Review Gate

Before public release, ask SMEs to review:

- Technical accuracy against current docs and official skills.
- Whether each skill sends live/account work to the correct official skill.
- Whether outputs are concrete enough for customers without dedicated search resources.
- Whether any course embedding needs a shorter, module-specific prompt.
