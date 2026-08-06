# Algolia Implementation Skills

Agent skill bundles for planning, building, and validating Algolia implementations.

**Release status:** generally available and SME-reviewed. Feedback from technical and nontechnical users is welcome through issues and pull requests.

This download contains the skills, the supporting `artifacts/` templates, and the MIT `LICENSE`.

## What This Is

These skills are a companion layer for Algolia MCP, the Algolia CLI, algobot/Agent Studio tooling, InstantSearch, and the official Algolia skills.

The official tools help an agent inspect live Algolia data, run account operations, use official product workflows, or write framework-specific implementation code. These implementation skills help the agent ask the right customer questions, sequence the work, avoid risky assumptions, create validation artifacts, and decide when to route to official tooling.

When an agent downloads the full library, it should treat Algolia as a connected system, not a set of isolated tasks. Data modeling and event setup come first in that mental model because they shape how search behaves, how relevance can be tuned, how analytics can be trusted, and how AI features such as NeuralSearch, Dynamic Re-Ranking, Recommend, personalization, and Agent Studio can learn from user behavior.

## Repository Structure

```text
skills/
  algolia-search-implementation/
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
  academy-reference-pack.md
  customer-implementation-brief.md
  indexing-contract-template.md
  event-taxonomy-template.md
  qa-report-template.md
  customer-maturity-scorecard.md
  use-cases/
    ecommerce-search.md
    b2b-catalog.md
    support-knowledge-base.md
    ai-shopping-assistant.md
    marketplace.md
  ...
```

Each skill folder contains a top-level `SKILL.md`, optional `references/`, and optional `agents/openai.yaml` metadata.

## Validate

Run the dependency-free validator before publishing:

```text
node scripts/validate-skills.mjs
```

It checks frontmatter naming and description limits, `agents/openai.yaml` discovery metadata, and referenced files.

## Skills

- `algolia-discovery-planning`: discovery questions and implementation routing.
- `algolia-search-implementation`: execution checklist and readiness signposts for net-new search, browse, autocomplete, ecommerce, personalization, recommendations, Dynamic Re-Ranking, and search UI builds (loaded via `algolia-discovery-planning`).
- `algolia-data-modeling`: record, variant, SKU, objectID, indexing, and merchandising data readiness.
- `algolia-index-configuration`: relevance settings, facets, synonyms, rules, replicas, and rollback planning.
- `algolia-events-insights`: click, conversion, add-to-cart, purchase, view, queryID, and userToken implementation guidance.
- `algolia-instantsearch-ui`: InstantSearch UI planning, review, and launch readiness.
- `algolia-autocomplete`: autocomplete, query suggestions, recent searches, source strategy, and selection behavior.
- `algolia-release-qa`: launch QA, severity-led findings, event checks, security checks, and residual risk.
- `algolia-agent-studio`: Agent Studio setup, readiness gates, tool boundaries, feedback, guardrails, and launch validation.
- `algolia-neuralsearch`: NeuralSearch rollout planning, data readiness, query evaluation, measurement, and optimization.
- `algolia-ui-libraries`: living selector for current Algolia UI libraries and docs paths.

> **Canonical source:** these skills ship in [algolia/skills](https://github.com/algolia/skills)
> as the `algolia-implementation` plugin. In Claude Code:
> `/plugin marketplace add algolia/skills` then
> `/plugin install algolia-implementation@algolia-skills`.

## How To Use

These skills follow the open [Agent Skills specification](https://agentskills.io/specification). Copy the desired `skills/algolia-*` folders into:

```text
.agents/skills/
```

That one path covers Codex, Cursor, GitHub Copilot, Gemini CLI, Antigravity and Devin Desktop (formerly Windsurf). Use `~/.agents/skills/` to make them available in every project.

The specification standardises the skill folder, not where each tool looks for it. Claude Code does not read `.agents/skills/` — use `~/.claude/skills/` or `.claude/skills/`. Kiro uses `.kiro/skills/`. For the Claude and ChatGPT apps, upload an individual skill ZIP instead of copying folders.

Keep `SKILL.md` at the top level of each skill folder with its `references/` folder. `.agents/skills/` is the documented cross-tool location for Codex; the older `~/.codex/skills/` still loads for backward compatibility.

For a use-case bundle (the packaged ZIP downloads built from this repo), read its top-level `BUNDLE.md` first. In this repo, the source guides for those bundles live in `artifacts/use-cases/`. Each guide supplies a scenario-specific start prompt, priority decisions, required outputs, and launch gates before the companion skills run.

Use the library through a whole-Algolia lens:

1. Start with the data contract: records, variants, objectIDs, searchable fields, display fields, facets, ranking signals, merchandising fields, inventory, permissions, and update ownership.
2. Define the event foundation: userToken strategy, click and conversion taxonomy, queryID/objectID/position preservation, ownership, deduplication, and validation.
3. Configure relevance and UI from those foundations instead of letting the UI invent requirements after the index is built.
4. Evaluate AI features against the same foundations, because NeuralSearch, Dynamic Re-Ranking, Recommend, personalization, and Agent Studio quality all depend on useful records and trustworthy behavioral signals.

Start with:

```text
Use the Algolia Discovery Planning skill to help me choose the right implementation path. Ask me only the questions needed to understand my goal, data, search UI, events, and launch risk. Assume I may not know which technical details matter yet. Then recommend the next Algolia skill, the smallest useful first milestone, and the validation artifact I should create.
```

Discovery planning is the single entry point; for net-new builds it loads `algolia-search-implementation`, whose checkpoints keep the data contract, event taxonomy, index configuration, UI implementation, and release QA visible, with provisional or deferred decisions documented (assumption, owner, risk, validation follow-up) in the completion summary.

For full-library orientation:

```text
Use the Algolia skills library through the whole Algolia lens. Begin by clarifying the data contract and event foundation because they determine search behavior, relevance tuning, analytics trust, and AI feature readiness. Then route to the right skills for index configuration, UI, NeuralSearch, Dynamic Re-Ranking, Recommend, personalization, Agent Studio, and release QA.
```

## Works Best With

- Algolia MCP for live search, analytics, recommendations, and index inspection.
- Algolia CLI for index operations, settings, rules, synonyms, records, keys, backups, imports, and exports.
- algobot / Agent Studio tooling for Agent Studio configuration, dry runs, tools, memory, conversations, and deployment workflows.
- Official Algolia skills for official MCP, CLI, algobot, and InstantSearch behavior.

## Academy Reference Pack

The repo includes `artifacts/academy-reference-pack.md` as a versioned, metadata-only living reference pack. It contains only `title`, `url`, `course`, `module`, `learning_objectives`, and `updated_at` fields. It does not include course body text, lesson scripts, transcripts, quizzes, screenshots, or private notes.

Agents should use the cache first for structure and learning-objective alignment. If the cached `updated_at` is stale, if nothing matches the customer request, or if implementation details may have changed, agents should fall back to live public lookup on `academy.algolia.com` and `algolia.com/doc`.

## Reviewer Note

SME feedback is especially requested on:

- Events attribution, queryID handling, userToken guidance, and conversion event boundaries.
- NeuralSearch readiness, rollout planning, evaluation query sets, and measurement guidance.
- Agent Studio setup, tool boundaries, feedback loops, guardrails, and launch validation.
- Data modeling variants, product/SKU strategy, objectID decisions, and permission or regional data patterns.
- Merchandising signals such as newness, inventory buckets, sale flags, own-brand flags, and best-seller buckets.

For questions about this review template, contact Daniel Williams at daniel.williams@algolia.com.

## Security

This repo should not contain customer data, Algolia application credentials, API keys, private Academy indices, build outputs, `node_modules`, or generated website assets.

The skills intentionally tell agents to ask for customer-specific access or route live operations through official Algolia tools when needed. Do not commit real credentials, event payloads with personal data, production exports, or customer-private implementation details.

## Source Basis

This pass incorporates supplied Academy course/design material for data gaps, events, InstantSearch, Autocomplete, Query Suggestions, NeuralSearch, and Agent Studio. The material is used procedurally: to shape questions, teaching moments, readiness gates, implementation plans, and validation artifacts. The bundled Academy reference pack stores metadata only, not lesson body content. It should not be treated as a frozen replacement for current public Algolia Academy, docs, or official skills.

## Usage And License Note

This is an SME-reviewed implementation companion library. Each skill declares the MIT license in its frontmatter, and the repository includes the full terms in `LICENSE`. Position it as an implementation layer that works alongside official Algolia Academy, docs, MCP, CLI, official skills, and support; it does not replace current official product documentation or live-account validation.

Maintained by Daniel Williams (`daniel.williams@algolia.com`).

## Known Limitations

These skills guide implementation and validation behavior. Customers still need current official docs verification, access to their own Algolia app/source data/codebase, and production validation before launch.
