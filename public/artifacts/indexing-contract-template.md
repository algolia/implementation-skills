# Indexing Contract Template

Use this artifact before or during indexing work, record-shape changes, or Algolia search UI builds. For net-new search, browse, autocomplete, ecommerce, personalization, Dynamic Re-Ranking, or recommendations implementations, this template is a decision aid: complete what is known, mark provisional assumptions, and record what must be revisited before launch.

## Business Context

- Use case:
- Primary user journey:
- Success metric:
- Source systems:
- Environment names:

## Index Contract

| Field | Decision | Notes |
| --- | --- | --- |
| Index name pattern |  |  |
| Record entity |  | Product, variant, article, location, account, etc. |
| objectID strategy |  | Must be stable and not derived from mutable display fields. |
| Searchable attributes |  |  |
| Display attributes |  |  |
| Faceting attributes |  |  |
| Filter-only attributes |  |  |
| Custom ranking signals |  |  |
| Merchandising attributes |  | Newness, sale, own brand, campaign, editorial priority, inventory bucket, best-seller bucket. |
| Event attribution fields |  | Fields required for `objectID`, `index`, `queryID`, position, variant attribution, and conversion ownership. |
| Required UI fields |  | Title/name, image URL, destination URL, price, availability, rating, or other display fields needed by the UI. |
| Timestamp strategy |  | Source field, timezone, freshness definition, category-specific newness rules. |
| Inventory strategy |  | Prefer buckets/booleans over exact stock counts unless exact counts are required. |
| Sales signal strategy |  | Best-seller metric, category scope, time window, bucket values, refresh owner. |
| Secured or hidden attributes |  |  |
| Replica strategy |  |  |
| Locale, region, tenant, or channel strategy |  |  |

## Update Pipeline

- Full reindex trigger:
- Incremental update trigger:
- Partial update rules:
- Delete/unpublish rules:
- Freshness SLA:
- Owner:

## Minimal Prototype Contract

- One-paragraph data contract:
- Three validation queries:
- Deferred production concerns:

## Merchandising Data Gaps

| Gap | Required decision | Owner | Validation |
| --- | --- | --- | --- |
| Product vs. variant schema |  |  |  |
| New product timestamp or bucket |  |  |  |
| Sale or promotion attributes |  |  |  |
| Own-brand flag |  |  |  |
| Inventory bucket or in-stock flag |  |  |  |
| Best-seller bucket or sales rank |  |  |  |
| Monitoring cadence |  |  |  |

## Validation Checklist

- Record count matches the source system expectation.
- objectIDs are stable across reindexing.
- Required facets and filters exist and have expected values.
- Searchable fields contain user-facing language.
- Merchandising attributes are present, normalized, and owned upstream.
- Newness, high inventory, and best-seller definitions are documented before indexing.
- Secured records cannot be retrieved without authorization.
- UI and event code can access objectID, index, queryID, and position.
- Required UI fields such as image URL, destination URL, availability, price, and title/name are retrievable when the UI uses them.
- Event attribution fields are present, planned, or explicitly deferred before event instrumentation is marked ready.
