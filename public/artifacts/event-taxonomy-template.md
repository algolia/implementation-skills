# Search Event Taxonomy Template

Use this artifact before or during Algolia event implementation and audits. For search, browse, autocomplete, recommendations, personalization, Dynamic Re-Ranking, or ecommerce implementations, this table is a decision aid: instantiate it, or explicitly record what is deferred, unknown, and accepted before calling the work ready.

| Surface | User action | Event type | Event name | Required payload | Owner | Downstream feature | Validation evidence | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Autocomplete | Product or content selected from hits | Click | Autocomplete Result Clicked | `eventName`, `index`, `objectIDs`, `queryID`, `positions`, `userToken` | Frontend | Analytics, personalization |  | Planned / Implemented / Deferred |
| Autocomplete | Query suggestion selected | Search handoff | Query Suggestion Submitted | `query`, `source`, `userToken` | Frontend | Query analytics, UX measurement |  | Planned / Implemented / Deferred |
| Search results page | Result clicked | Click | Search Result Clicked | `eventName`, `index`, `objectIDs`, `queryID`, `positions`, `userToken` | Frontend | Analytics, personalization, Dynamic Re-Ranking |  | Planned / Implemented / Deferred |
| Browse or category page | Result clicked | Click | Browse Result Clicked | `eventName`, `index`, `objectIDs`, `queryID`, `positions`, `userToken` when available | Frontend | Analytics, personalization, Dynamic Re-Ranking |  | Planned / Implemented / Deferred |
| Product/content detail | Result viewed after search | View | Search Result Viewed | `eventName`, `index`, `objectIDs`, `userToken`, attribution context when available | Frontend | Recommend, analytics |  | Planned / Implemented / Deferred |
| Cart, save, lead, or primary action | Product added, saved, or lead submitted | Conversion | Product Added To Cart | `eventName`, `index`, `objectIDs`, `queryID` when available, `userToken` | Frontend/backend | Recommend, personalization, conversion measurement |  | Planned / Implemented / Deferred |
| Purchase or completed conversion | Purchase completed | Conversion | Product Purchased | `eventName`, `index`, `objectIDs`, `queryID` when available, `userToken`, `price`, `quantity`, `currency` where supported and needed | Backend or deduped pipeline | Analytics, revenue, optimization |  | Planned / Implemented / Deferred |

## Identity Rules

- Anonymous userToken strategy:
- Authenticated userToken strategy:
- Login merge behavior:
- Cross-device limitation:

## Ownership Rules

- Browser-owned events:
- Backend-owned events:
- Deduplication strategy:
- Environments:
- Deferred events approved by user:
- Deferred production concerns:

## Validation Checklist

- queryID is captured from the search response.
- objectIDs match records in the searched index or replica.
- positions match the displayed hit position when required.
- userToken is stable enough for downstream features.
- eventName values are business-readable and governed.
- Duplicate frontend/backend events are avoided.
- Autocomplete query suggestion submissions are distinguished from direct-result clicks.
- Conversion events are implemented, planned, or explicitly deferred by the user.
