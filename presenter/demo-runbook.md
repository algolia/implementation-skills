# Algolia Skills Demo Runbook

Private presenter notes for the Solutions demo. These scenarios are intentionally not shown on the public homepage or included in the downloadable skills library.

## Suggested Demo Flow

1. Open the site and explain the neutral routing cue: new build, unclear scope or migration, or existing-build audit.
2. Open a skill detail view to show its scope, questions, outputs, Academy alignment, documentation grounding, and reusable sample prompt.
3. Run one foundation scenario first: blank ecommerce or search-provider replacement.
4. Show NeuralSearch and Agent Studio as later-stage paths built on a healthy Algolia foundation.
5. Close with Release QA to demonstrate evidence-led launch review across data, settings, UI, events, and AI.

For a short demo, run scenarios 1 and 3. For a migration-focused audience, run scenarios 2 and 4.

## 1. Blank Ecommerce Start

```text
Use $algolia-search-implementation to plan an ecommerce search build.

Context: We sell [product type] in [markets]. Our users need to find [top tasks].
Data source: [platform/ERP/PIM]. Frontend: [framework]. Current state: new.
Success means: [conversion, discovery, support deflection, etc.].

First, identify the in-scope skills and assumptions. Then produce:
1. data contract,
2. event taxonomy,
3. relevance and UI plan,
4. phased implementation plan,
5. launch QA checklist.
Do not make live Algolia changes.
```

## 2. Replace Constructor Or Elasticsearch

```text
Use $algolia-discovery-planning to plan replacing Constructor or Elasticsearch with Algolia in an existing application.

Current provider: [Constructor/Elasticsearch]. Application: [framework and platform].
Current search surfaces: [search results, category pages, autocomplete, recommendations].
Data sources: [catalog/PIM/ERP/CMS]. Business-critical behavior: [queries, filters, sorts, merchandising, personalization].
Current events and analytics: [clicks, conversions, dashboards, experiments].

First, identify what must be preserved, redesigned, or intentionally retired. Then produce:
1. current-state inventory and parity risks,
2. target Algolia data and index strategy,
3. relevance, UI, and event migration plan,
4. phased cutover with validation and rollback,
5. owners, unknowns, and the smallest safe first milestone.
Do not make live provider or Algolia changes.
```

## 3. Add NeuralSearch To Algolia

```text
Use $algolia-neuralsearch to assess whether we are ready for NeuralSearch.

We already use Algolia for [search surfaces]. Our target queries are [examples].
Exact behavior that must remain stable: [examples].
Our semantic fields are [fields]. We have [click/conversion] events and [traffic level].

Return readiness gates, semantic attribute rationale, query evaluation set, hybrid evidence log, staged rollout, rollback, and blockers. Do not make live Algolia changes.
```

## 4. Add Agent Studio To Algolia

```text
Use $algolia-agent-studio to design a narrow first agent on our existing Algolia implementation.

The job is [one high-intent task]. Users are [audience].
The agent may access [indices/tools] and must not [out-of-scope actions].
Our current search experience and event setup are [summary].

Return an agent-room map, tool contracts, entry-point recommendation, guardrails, memory decision, test conversations, feedback events, and limited-rollout recommendation. Do not publish or deploy an agent.
```

## Presenter Checks

- Replace bracketed context before the meeting so the output feels concrete.
- Keep the first response focused on decisions and artifacts, not generated code.
- Point out explicit assumptions, blockers, ownership, validation, and rollback guidance.
- Do not connect to or modify a live Algolia application during the demo.
- Keep a generated response available as backup in case connectivity or model latency interrupts the live run.
