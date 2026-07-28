# AI Shopping Assistant Bundle Guide

Use this guide for conversational product discovery grounded in Algolia data, with explicit tool, security, feedback, and cost boundaries.

## Start Prompt

```text
Use the Algolia skills library to plan an AI shopping assistant. Begin with product and variant data, search quality, permissions, and event readiness. Then define the Agent Studio contract, approved tools and actions, NeuralSearch evaluation, feedback, guardrails, escalation, cost controls, and limited-rollout QA.
```

## Priority Decisions

1. Define the assistant's audience, jobs, allowed actions, prohibited actions, and escalation path.
2. Confirm product data, inventory, price, locale, and permission freshness.
3. Separate read-only discovery tools from actions that change carts, accounts, or orders.
4. Define feedback, conversion, abandonment, escalation, and unsafe-output measurement.
5. Set rate, token, step, domain, authentication, and tool-authorization controls.

## Required Outputs

- Agent contract and tool allowlist.
- Product-data and search-readiness report.
- Event and feedback taxonomy.
- Representative conversation and adversarial test set.
- Limited-rollout recommendation with monitoring and rollback.

## Launch Gates

- Tools enforce authentication, authorization, and least privilege.
- Responses are grounded in current Algolia data with safe fallbacks.
- Cost and abuse controls are configured and observable.
- A limited rollout passes product, security, analytics, and escalation checks.
