# Ecommerce Search Bundle Guide

Use this guide to orient the bundled skills around a product-discovery journey rather than treating the ZIP as a generic collection.

## Start Prompt

```text
Use the Algolia skills library to plan an ecommerce search experience. Start with product and variant records, then define event attribution, relevance and merchandising, search and autocomplete UX, NeuralSearch readiness, and launch QA. Preserve assumptions, owners, validation evidence, and rollback decisions.
```

## Priority Decisions

1. Decide whether one hit represents a product, color, variant, SKU, offer, or grouped family.
2. Define price, inventory, locale, category, brand, promotion, and permission behavior.
3. Preserve queryID, objectID, position, index, and userToken from discovery through purchase.
4. Separate textual relevance, business ranking, merchandising rules, and sort replicas.
5. Validate desktop, mobile, autocomplete handoff, filters, empty states, and recovery paths.

## Required Outputs

- Indexing contract with variant and objectID strategy.
- Event taxonomy covering click, add-to-cart, purchase, and attribution ownership.
- Relevance and merchandising decision record with representative queries.
- Search and autocomplete state plan.
- Launch QA report with rollback criteria.

## Launch Gates

- Representative catalog edge cases pass.
- Price, availability, locale, and permissions cannot leak across audiences.
- At least one click and one primary conversion are validated end to end.
- High-value queries, filters, mobile behavior, and no-result recovery meet agreed expectations.
