# Working with the Algolia Implementation Skills

This repo is a **suite** of companion skills that span the Algolia implementation
lifecycle. They are meant to be considered together, not triggered one at a time.

## Standing rule for any Algolia task

For any non-trivial Algolia work (build, add, migrate, redesign, audit, configure
search / browse / autocomplete / indexing / relevance / recommendations /
personalization / merchandising / events / analytics):

1. **Start with `algolia-discovery-planning`** even if the task looks already
   scoped or names one feature. It maps the request to the lifecycle and tells
   you which companion skills each phase needs.
2. **Enumerate the in-scope phases up front** and state the plan: which skill owns
   each phase and in what order. A greenfield build usually runs
   `data-modeling → index-configuration → instantsearch-ui / autocomplete →
   events-insights → release-qa`.
3. **Load each in-scope skill via the Skill tool for its phase and apply it.** Do
   not stop at the first matching skill, and do not substitute your own knowledge
   for a skill that applies. If you deliberately skip a phase, say so and why.
4. **Never claim a skill informed the work unless it was actually opened.** Report
   which skills ran and what each changed.

Only collapse to a single focused skill for a genuinely narrow, single-phase ask
(e.g. "rename one facet label").

## Why

The focused skills carry precise `Do NOT use for X` disambiguation so they don't
collide. That raises precision but lowers recall — left alone, the model tends to
fire exactly one skill and miss the rest of the suite. `algolia-discovery-planning`
is the front door that restores suite-level recall; this standing rule backstops it
so orchestration does not depend on any single description triggering.

## Live account operations

Record/settings/key writes and live inspection go through the official
`algolia-mcp` or `algolia-cli`, not these planning/validation skills.
