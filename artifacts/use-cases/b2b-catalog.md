# B2B Catalog Bundle Guide

Use this guide for account-aware catalogs where permissions, price lists, contract terms, regional availability, and operational accuracy outrank generic ecommerce assumptions.

## Start Prompt

```text
Use the Algolia skills library to plan a B2B catalog search experience. Begin with account, region, permission, price-list, and availability boundaries. Then define event ownership, relevance, UI behavior, secured filtering, and launch QA without exposing restricted records or commercial terms.
```

## Priority Decisions

1. Define which account, role, region, contract, and entitlement fields control visibility.
2. Choose stable record identity across shared products and customer-specific offers.
3. Decide which constraints require secured filters or separate indices.
4. Separate procurement conversions from consumer-commerce event assumptions.
5. Validate large catalogs, exact identifiers, part numbers, and low-frequency queries.

## Required Outputs

- Permission-aware indexing contract.
- Secured-filter and API-key boundary review.
- Event plan for quote, order, reorder, download, or contact outcomes.
- Representative query and facet test set.
- Launch QA report covering data isolation and rollback.

## Launch Gates

- Cross-account and cross-region leakage tests pass.
- Price and availability rules are deterministic and explainable.
- Identifier searches and permission-filtered empty states behave correctly.
- Operational owners can recover or roll back indexing and settings changes.
