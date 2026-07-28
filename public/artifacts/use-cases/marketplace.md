# Marketplace Bundle Guide

Use this guide for multi-seller discovery where offer identity, seller fairness, regional availability, permissions, and marketplace policy require distinct treatment from a single-merchant catalog.

## Start Prompt

```text
Use the Algolia skills library to plan a marketplace search experience. Start with product, offer, seller, region, inventory, and permission identity. Then define ranking and seller-policy boundaries, event attribution, search and autocomplete UX, AI readiness, and launch QA. Make marketplace-specific tradeoffs explicit.
```

## Priority Decisions

1. Decide whether one hit represents a product, seller offer, variant, listing, or grouped family.
2. Define canonical product identity separately from seller, price, fulfillment, condition, and availability.
3. Establish seller fairness, sponsored placement, policy, quality, and abuse controls.
4. Preserve seller and offer identity through clicks, conversions, disputes, and analytics.
5. Validate regional eligibility, duplicate listings, out-of-stock offers, and restricted products.

## Required Outputs

- Product-offer-seller indexing contract.
- Marketplace ranking and merchandising policy record.
- Event taxonomy with seller and offer attribution.
- Duplicate, region, permission, and restricted-item test set.
- Launch QA report covering fairness, leakage, abuse, and rollback.

## Launch Gates

- Seller, offer, region, and permission boundaries pass isolation tests.
- Sponsored and organic ranking behavior is explainable and auditable.
- Duplicate and grouped listings preserve a clear customer choice.
- Analytics attribute discovery and conversion to the correct seller offer.
