# Public Academy And Docs Source Guide

Use this guide when a skill needs current source-backed guidance or Academy learning alignment.

## Goal

The skills should stay portable for customers. They can use a small cached Academy metadata pack for orientation, then use public Algolia sources when current guidance is needed. Customer-provided source access is optional context only.

The agent should convert sources into questions, decisions, and validation checks. It should not paste course body text or large documentation excerpts into its answer.

## Cached Academy Metadata Pack

Use `academy-reference-pack.md` first when it is available. Treat it as a navigation cache, not as content.

Allowed cached fields:

- `title`
- `url`
- `course`
- `module`
- `learning_objectives`
- `updated_at`

Do not store course body text, lesson scripts, transcripts, screenshots, quizzes, or private notes in the cache.

## Default Public Sources

- Use `academy.algolia.com` for customer education alignment, courses, modules, and learning objectives.
- Use `algolia.com/doc` for implementation details, APIs, configuration, product behavior, package usage, and current feature constraints.

## Lookup Flow

1. Classify the customer request by product area, use case, and maturity level.
2. Check the cached Academy metadata pack for matching course/module structure and learning objectives.
3. If the cache has no strong match, if `updated_at` is stale for the question, or if the answer depends on current product behavior, search public Academy sources for relevant course or learning alignment.
4. Search public docs for current implementation guidance before version-specific or API-specific recommendations.
5. Select only the sources that materially affect the answer.
6. Summarize the source implications in plain language.
7. Convert the source-backed guidance into:
   - questions to ask
   - assumptions to confirm
   - setup decisions
   - validation artifacts
   - current-docs checks
8. Cite source titles or URLs when available.
9. If source lookup is unavailable, proceed from the skill's built-in guidance and state that current Academy/docs sources were not verified.

## Optional Customer-Provided Source Access

If a customer provides an Algolia index or other searchable source of Academy/docs content, use it only as an optional source. Do not require it. Prefer metadata-only records unless the customer explicitly asks the agent to search a private source during that engagement.

Recommended fields:

- `title`
- `url`
- `course` and `module`, when available
- `learning_objectives`, when available
- `updated_at`

## Mock Retrieval Example

Customer request:

```text
We want to prepare our ecommerce search for NeuralSearch and an AI shopping assistant.
```

Expected source lookup intent:

- Product area: NeuralSearch, Agent Studio, Insights, data modeling.
- Use case: ecommerce search, AI shopping assistant.
- Maturity level: AI readiness.
- Cached metadata: NeuralSearch, Agent Studio, Events, and Common Data Gaps records if current enough for orientation.

Expected source-backed output:

- Relevant learning objectives:
  - Clean semantic product fields before AI relevance rollout.
  - Validate click and conversion events before measuring AI features.
  - Preserve filters, permissions, and merchandising rules during AI rollout.
- Procedural implications:
  - Ask for sample product/variant records.
  - Audit `queryID`, `objectID`, `index`, position, and `userToken`.
  - Build a query evaluation set before rollout.
  - Produce a readiness report with go, fix-first, or do-not-start status.

## Failure Modes

- If public source lookup is unavailable, state that current sources were not verified.
- If cached Academy metadata is stale or incomplete, use it only for topic structure and say what still needs live verification.
- If results are generic, ask for product area or use case clarification.
- If source freshness is unknown, mark source confidence as partial.
- If the customer asks for implementation code, verify current official docs before version-specific code or package names.
