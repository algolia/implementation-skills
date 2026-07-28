# Academy Alignment Template

Use this artifact when a skill needs to align implementation guidance with public Algolia Academy learning metadata or current Algolia documentation.

## Customer Request

- Request:
- Customer/team:
- Audience:
- Use case:
- Target maturity level:
- Customer maturity level:

## Retrieval Plan

- Cached metadata used: `academy-reference-pack.md` yes/no:
- Source used: cached metadata, public Academy/docs search, or customer-provided source access:
- Query terms:
- Product area filters:
- Use-case filters:
- Customer goal filters:
- Date or freshness filters:
- Useful source fields: title, url, course, module, learning_objectives, updated_at:

## Academy Metadata Match

| Title | URL | Course | Module | Learning objectives | Updated at |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |

## Retrieval Rule

Use the cached Academy metadata first for structure and routing. If `updated_at` is stale for the customer's question, if no metadata record matches, or if the agent needs current product behavior, setup steps, code, limits, or screenshots, fall back to live public lookup on `academy.algolia.com` and `algolia.com/doc`.

The cached Academy pack must contain metadata only: `title`, `url`, `course`, `module`, `learning_objectives`, and `updated_at`. Do not quote, reconstruct, or redistribute course body text.

## Procedural Implications

- Questions the agent must ask before setup:
- Decisions the agent can make with assumptions:
- Decisions that need customer confirmation:
- Misconceptions to correct:
- Current Academy/docs checks still required:
- Skill behavior to change because of the retrieved content:

## Skill Output

- Recommended next skill:
- Implementation path:
- Validation artifacts to produce:
- Follow-up prompt to give the user:
- Source confidence: strong, partial, or missing:
