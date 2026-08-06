# Algolia Implementation Skills Library

Codex/Claude-compatible implementation skill bundles that extend Algolia MCP, the Algolia CLI, and official Algolia skills with business context, implementation guardrails, and launch QA.

This package is generally available and SME-reviewed.

This library is the customer implementation layer for Algolia's agent tooling. Algolia MCP, the Algolia CLI, and official Algolia skills give agents live data, account actions, and official product workflows; these implementation skills make that tooling easier to apply by teaching agents how to ask better questions, sequence work, make safer assumptions, and produce validation artifacts before making implementation decisions.

When an agent downloads the full library, it should treat Algolia as a connected system, not a set of isolated tasks. Data modeling and event setup come first in that mental model because they shape how search behaves, how relevance can be tuned, how analytics can be trusted, and how AI features such as NeuralSearch, Dynamic Re-Ranking, Recommend, personalization, and Agent Studio can learn from user behavior.

It is designed to work either as a separate companion repo linked from the official Algolia skills/docs experience, or as a mergeable customer implementation extension inside the official skills repo after SME review.

## Who This Is For

This is for customer teams using Algolia with or without a dedicated search team. It is especially useful when a customer needs an AI agent to ask better setup questions, turn business goals into implementation steps, create handoff notes for the right owner, and validate the result before launch.

## How This Fits

These are customer-ready implementation skills that work alongside official Algolia Academy, docs, MCP, CLI, official Algolia skills, and support. Use them to add discovery prompts, readiness checks, implementation planning, and validation artifacts around official Algolia tooling.

The recommended lens is whole-product Algolia implementation:

1. Start with the data contract: records, variants, objectIDs, searchable fields, display fields, facets, ranking signals, merchandising fields, inventory, permissions, and update ownership.
2. Define the event foundation: userToken strategy, click and conversion taxonomy, queryID/objectID/position preservation, ownership, deduplication, and validation.
3. Configure relevance and UI from those foundations instead of letting the UI invent requirements after the index is built.
4. Evaluate AI features against the same foundations, because NeuralSearch, Dynamic Re-Ranking, Recommend, personalization, and Agent Studio quality all depend on useful records and trustworthy behavioral signals.

## Skills

### Foundation Skills

- `algolia-search-implementation`: guided workflow and readiness signposts for net-new search, browse, autocomplete, ecommerce, personalization, recommendations, Dynamic Re-Ranking, and search UI builds.
- `algolia-discovery-planning`: ask the right product, business, data, and measurement questions before implementation.
- `algolia-data-modeling`: design records, variants, SKUs, indices, replicas, objectIDs, and indexing contracts.
- `algolia-index-configuration`: configure relevance, ranking, facets, synonyms, rules, replicas, and merchandising.
- `algolia-events-insights`: implement a simple event plan for clicks, conversions, views, cart, purchase, queryID, and userToken.
- `algolia-instantsearch-ui`: build and review InstantSearch search and browse experiences.
- `algolia-autocomplete`: build and review autocomplete, query suggestions, recent searches, and federated panels.
- `algolia-release-qa`: audit implementation quality before release or after risky changes.

### Product-Focused AI Skills

- `algolia-agent-studio`: plan, implement, validate, and optimize Agent Studio experiences, including tools, LLM providers, memory, analytics, feedback, guardrails, authentication, and tool security.
- `algolia-neuralsearch`: plan, implement, validate, and optimize NeuralSearch with data readiness, semantic query sets, event measurement, A/B testing, and rollout checks.

### Living Reference Packs

- `algolia-ui-libraries`: select current Algolia UI libraries and docs paths for InstantSearch, Autocomplete, mobile SDKs, routing, SSR, events, and frontend architecture. This is kept beside the procedural skills as a living selector/reference pack rather than a frozen docs dump.

## Use

Copy one or more skill folders into an agent skills directory, or invoke them directly from this repository by path. Each folder has a `SKILL.md` and optional `references/` files. The same `SKILL.md` frontmatter pattern is intentionally usable by both Codex-style and Claude-style skill loaders.

These skills are intentionally modular, but the library should be used through a whole-Algolia lens. For net-new search implementation requests, start with `algolia-search-implementation` so the data, events, index configuration, UI, and release QA decisions are visible in order. Start with `algolia-discovery-planning` when the request is broad or the implementation path is unclear, then route to the narrower implementation skill. Product-focused AI skills should still call into the foundation skills when data, events, relevance settings, UI integration, security, or release validation are prerequisites. Use `algolia-ui-libraries` as a living selector before implementation when the agent needs to choose a current frontend or mobile library.

When live Algolia app data, analytics, index inspection, settings changes, object imports, rules, synonyms, or account actions are needed, use Algolia MCP, the Algolia CLI, or official Algolia skills for the live operation, then use these implementation skills to interpret the result, ask the next customer question, and validate the implementation path.

## Source Of Truth

The skills-only GitHub repo is the reviewable source package: `algolia-implementation-skills-repo/`. The top-level `algolia-*` folders and `artifacts/` folder in this workspace are site packaging mirrors used to build downloadable ZIPs. When editing skills or artifacts, update the source repo and sync the top-level packaging copies before rebuilding downloads to avoid drift.

Customer start prompt:

```text
Use the Algolia Discovery Planning skill to help me choose the right implementation path. Ask me only the questions needed to understand my goal, data, search UI, events, and launch risk. Assume I may not know which technical details matter yet. Then recommend the next Algolia skill, the smallest useful first milestone, and the validation artifact I should create.
```

Guided search build prompt:

```text
Use the Algolia Search Implementation skill to build this search experience with clear decision points for the data contract, event taxonomy, index configuration, UI implementation, and release QA. If any decision is provisional or deferred, keep moving but document the assumption, owner, risk, and validation follow-up in the completion summary.
```

Whole-library orientation prompt:

```text
Use the Algolia skills library through the whole Algolia lens. Begin by clarifying the data contract and event foundation because they determine search behavior, relevance tuning, analytics trust, and AI feature readiness. Then route to the right skills for index configuration, UI, NeuralSearch, Dynamic Re-Ranking, Recommend, personalization, Agent Studio, and release QA.
```

## Install

Extends Algolia MCP/CLI/official skills: install those official tools when the agent needs live account inspection or write actions, then use these skills as the customer-ready implementation workflow layer.

These skills follow the open [Agent Skills specification](https://agentskills.io/specification), so one folder works across most tools. Unzip the download and copy each `algolia-*` folder into `.agents/skills/` in your project (or `~/.agents/skills/` for every project). That covers Codex, Cursor, GitHub Copilot, Gemini CLI, Antigravity and Devin Desktop (formerly Windsurf). Each copied folder must contain `SKILL.md` at its top level.

Two tools need their own path: Claude Code reads `~/.claude/skills/` or `.claude/skills/` and does **not** read `.agents/skills/`; Kiro reads `.kiro/skills/`.

For the Claude and ChatGPT apps, upload an **individual** skill ZIP (Customize → Skills in Claude, the Skills tab in ChatGPT) rather than copying folders. The uploader expects one skill folder at the ZIP root, so the full-library ZIP will be rejected.

Note: the specification standardises the skill folder, not where each tool looks for it. `.agents/skills/` is the documented cross-tool location for Codex; the older `~/.codex/skills/` still loads for backward compatibility.

See `artifacts/install-instructions.md` for a customer-facing install guide. The React site serves the same files from `public/artifacts/`.

## Works With Official Algolia Tools

Install these official Algolia tools with the implementation bundles so agents can move from customer context to live inspection, account operations, official workflows, and validation:

| Tool | Use it for | Install or setup |
| --- | --- | --- |
| Algolia Productivity MCP | Live analytics, index inspection, recommendations, and account-aware reviews for your own account. | `claude mcp add --transport http algolia https://mcp.algolia.com/mcp`, then `/mcp` to authorize by browser sign-in. For customer-facing agents use app-scoped Public MCP instead; there is no local/npx server. |
| Algolia CLI | Index, settings, rules, synonyms, records, and operational account tasks. | `brew install algolia` on macOS, `npx @algolia/cli` anywhere, or the official setup guide for Linux and Windows. |
| Official Algolia skills | Official Algolia MCP, CLI, algobot, Crawler, InstantSearch, and core tooling workflows. | `/plugin marketplace add algolia/skills` then `/plugin install algolia-implementation@algolia-skills` in Claude Code; `npx skills add https://github.com/algolia/skills` elsewhere. |

See `artifacts/repo-integration-strategy.md` for the recommended separate-repo and merge-into-official-repo options.

## Use-Case Bundles

The portal also packages scenario-specific bundles for:

- Ecommerce search.
- B2B catalog.
- Support knowledge base.
- AI shopping assistant.
- Marketplace.

Each bundle combines the relevant skills, validation artifacts, and a scenario-specific `BUNDLE.md` guide so an agent can work from customer context to implementation plan and QA evidence.

## Education Layer

Each skill can align work to:

- Academy course modules or learning objectives from the metadata-only Academy reference pack, public Academy sources, or optional customer-provided sources.
- Customer maturity: beginner implementation, production readiness, optimization, or AI readiness.
- Use-case bundles: ecommerce search, content search, B2B catalog, support knowledge base, marketplace, or AI shopping assistant.
- Guided prompts such as "Use this skill to audit my events setup" or "Use this skill to design my NeuralSearch rollout."
- Customer-facing guidance for teams implementing, auditing, or improving Algolia without requiring dedicated Algolia resources.

## Public Source Pattern

When a skill needs current source-backed guidance, use public Algolia sources:

- Use `artifacts/academy-reference-pack.md` first as a metadata-only structure cache with `title`, `url`, `course`, `module`, `learning_objectives`, and `updated_at`.
- Do not redistribute Academy body content in these skills. The cached pack is for routing and learning-objective alignment only.
- If the cached `updated_at` is stale, if no strong match is found, or if the agent needs current behavior, code, limits, or setup steps, fall back to live public lookup.
- Use `academy.algolia.com` for customer education alignment, relevant courses, and learning objectives.
- Use `algolia.com/doc` for implementation details, APIs, package usage, current feature behavior, limits, and configuration guidance.
- Summarize useful learning objectives or docs implications and cite source titles or URLs when available.
- Use source lookup to shape questions, assumptions, implementation paths, and validation checks.
- Avoid copying large docs or course content into the skill output.
- If no strong match is found or web/source lookup is unavailable, proceed with the skill's built-in guidance and state what was not verified.
- If a customer provides their own source access, use it as optional context. Do not require it.

## Validation Artifacts

The portal includes downloadable templates mirrored in `artifacts/` and served by the React site from `public/artifacts/`:

- Academy alignment template.
- Academy metadata reference pack.
- Public Academy/docs source guide.
- Customer maturity scorecard.
- Customer implementation brief.
- Install instructions.
- Official tooling integration map.
- Repository integration strategy.
- Known limitations.
- Forward test report.
- Start here prompt.
- Example output pack.
- Event taxonomy template.
- Indexing contract template.
- Algolia QA report template.
- Use-case bundle template.

## Source Basis

The current pass is based on Algolia documentation checked through 2026-07-09, supplied Academy course/design material for data gaps, events, InstantSearch, Autocomplete, Query Suggestions, NeuralSearch, and Agent Studio, plus review against the official Algolia skills bundle supplied locally as `skills-main.zip`. The Academy material is used procedurally: to shape questions, teaching moments, readiness gates, implementation plans, and validation artifacts. For customer use, verify current public Algolia docs and the latest official skills repository before version-specific implementation guidance.

For questions about this review package, contact Daniel Williams at daniel.williams@algolia.com.

## Usage And License Note

This is an SME-reviewed implementation companion library. Each skill declares the MIT license in its frontmatter, and the full terms are included in `LICENSE`. Position it as an implementation layer that works alongside official Algolia Academy, docs, MCP, CLI, official skills, and support; it does not replace current official product documentation or live-account validation.

## Known Limitations

These skills guide implementation work, but customers still need current official docs verification, access to their own Algolia/data systems, and production validation before launch.
