# Forward Test Report

These tests were run as structured prompt simulations against the current skill instructions and reference files. They are meant to catch vague behavior before customer review.

## Results Summary

| Scenario | Skill path | Result | Tuning applied |
| --- | --- | --- | --- |
| New apparel ecommerce implementation with colors and sizes | Discovery, Data Modeling, Events, InstantSearch, QA | Passed. The skills route correctly and ask for sample records, variants, filters, events, and first milestone. | Added install and known-limitations artifacts for customer readiness. |
| B2B catalog with account-specific pricing and availability | Discovery, Data Modeling, Index Configuration, QA | Passed. Variant and permission guidance is concrete. | No content change needed. |
| Customer wants event setup but has limited developer access | Events, Release QA | Passed. Low-dev path asks who owns frontend/backend/data layer and starts with one click plus one conversion. | Added install instructions and forward-test docs for reviewers. |
| NeuralSearch for support knowledge base | NeuralSearch, Data Modeling, Events, Release QA | Passed. The skill gives fix-first readiness gates instead of treating NeuralSearch as a toggle. | No content change needed. |
| Agent Studio AI shopping assistant | Agent Studio, Data Modeling, Events, Release QA | Passed. The example contract gives purpose, tools, guardrails, measurement, and limited-rollout recommendation. | No content change needed. |
| Relevance tuning for poor top queries | Index Configuration, Release QA | Mostly passed. Initial behavior could be generic without maturity context. | Added maturity behavior to Index Configuration. |
| Search UI build with filters and mobile behavior | InstantSearch UI, Events, Release QA | Mostly passed. Initial behavior could understate production/optimization differences. | Added maturity behavior to InstantSearch UI. |
| Autocomplete query suggestions with recent searches | Autocomplete, Events, Release QA | Mostly passed. Initial behavior could be too implementation-focused without staged maturity guidance. | Added maturity behavior to Autocomplete. |
| Customer asks where files go in Codex and Claude | Install guide | Failed before this pass. | Added dedicated install instructions and tightened the install modal. |
| Public Academy/docs source-backed behavior | Academy alignment template and public source guide | Passed. The skills now use public Academy/docs lookup by default and treat customer-provided source access as optional context. | Replaced private-index assumptions with a portable public source pattern. |
| "I want to build a simple search for my ecommerce site" technical reviewer test | Discovery, Data Modeling, UI Libraries, InstantSearch, Events, QA | Passed as a simulated end-to-end prompt. The expected path is full library download first, then discovery questions for app/index/data/sample records, product vs variant model, filters, merchandising signals, UI framework, event ownership, and launch criteria. | Added explicit recommendation to run this with one technical reviewer and one CSE/education reviewer before broader sharing. |
| "I want to build a simple search for my ecommerce site" nontechnical reviewer test | Discovery, Data Modeling, InstantSearch, Events | Passed as a simulated comprehension test. The expected output should avoid jargon, name the smallest useful first milestone, explain who owns each decision, and produce an implementation brief plus indexing contract instead of jumping straight to code. | Added explicit recommendation to watch for install confusion, official tooling confusion, and unclear next steps. |

## Review Recommendation

Ready for customer-style review. Reviewers should focus on whether the skills ask the right questions, produce practical artifacts, and avoid overconfident implementation claims when customer data, access, or docs freshness is missing.

Use the first review round to run one live end-to-end test with a technical reviewer and one live end-to-end test with a nontechnical CSE or education reviewer using this prompt: "I want to build a simple search for my ecommerce site." Preserve the prompt, output, reviewer role, friction points, and follow-up changes as review evidence.

## Trigger Collision Eval Matrix

Use these prompts with the official Algolia skills installed side-by-side. The expected behavior is that official skills perform live/account/code-specific actions, while these implementation skills provide discovery, readiness, planning, and validation.

| Prompt | Expected primary route | Expected companion behavior |
| --- | --- | --- |
| "Add search to my React app." | Official `instantsearch` for code once requirements are known. | `algolia-discovery-planning` only if goal, data, UI, or events are unclear; `algolia-instantsearch-ui` for customer-facing UX/readiness review. |
| "Use Algolia CLI to copy this index to staging." | Official `algolia-cli`. | No implementation skill unless the user asks for migration planning or QA. |
| "Audit my events setup for NeuralSearch and DRR readiness." | `algolia-events-insights`, with `algolia-mcp` for live analytics/debug data if available. | Produce Event Plan, Developer Handoff, queryID/userToken/objectID findings, and downstream readiness risks. |
| "Which Algolia UI library should I use for a Next.js ecommerce site?" | `algolia-ui-libraries`. | Route to official `instantsearch` after the library/framework choice is made. |
| "Create an Agent Studio assistant for product discovery." | Official `algobot-cli` for live setup/dry run/publish. | `algolia-agent-studio` defines agent contract, readiness gates, tools, guardrails, feedback, and launch recommendation. |
| "Turn on NeuralSearch for my production index." | Official `algolia-cli` or `algolia-mcp` for live inspection/actions. | `algolia-neuralsearch` should stop and require readiness, query set, measurement, and rollout/rollback plan before launch. |
| "My category filters are confusing and users cannot recover." | `algolia-instantsearch-ui`. | Produce UX/readiness findings; route to official `instantsearch` for framework-specific code fixes. |
| "What should my product records look like for variants and merchandising?" | `algolia-data-modeling`. | Produce indexing contract, variant strategy, data-gap report, and owner handoff. |
