# Install Instructions

Use the full library ZIP when you want every skill and artifact. Use an individual skill ZIP when you only need one workflow.

Use these implementation skills as customer-ready extensions to Algolia MCP, the Algolia CLI, and official Algolia skills. MCP and CLI are the right layer for live account inspection, analytics, index operations, settings changes, rules, synonyms, and record imports. These skills add the workflow layer for asking the right questions, choosing the right path, interpreting tool output, and validating the work.

When installing the full library, orient the agent to the whole Algolia system. Data and events are the foundation: the data contract shapes what search can retrieve, rank, filter, display, and attribute; the event foundation shapes analytics, personalization, Recommend, Dynamic Re-Ranking, NeuralSearch evaluation, and Agent Studio feedback loops.

## Codex

1. Download and unzip the skill or bundle.
2. Copy each extracted `algolia-*` folder into:

```text
~/.codex/skills/
```

3. Confirm each skill folder contains a `SKILL.md` file at the top level.
4. Start a new Codex task and reference the skill by name, for example:

```text
Use algolia-discovery-planning to help me choose the right Algolia implementation path.
```

Expected shape:

```text
~/.codex/skills/
  algolia-discovery-planning/
    SKILL.md
    references/
  algolia-events-insights/
    SKILL.md
    references/
```

## Claude

1. Download and unzip the skill or bundle.
2. Upload or import the complete extracted skill folder into the Claude skill or project area your Claude workspace uses.
3. Keep the folder structure intact. The `SKILL.md` file must stay at the top level of each `algolia-*` folder.
4. Ask Claude to use the skill by name, for example:

```text
Use algolia-events-insights to design the smallest useful event setup for my search result clicks and primary conversion.
```

Expected shape:

```text
algolia-events-insights/
  SKILL.md
  references/
    events-guide.md
    example-output.md
```

## Works With Official Algolia Tools

Install these official Algolia tools with the implementation bundles when the agent needs live data, account actions, or official product-specific workflows:

| Tool | Use it for | Install or setup |
| --- | --- | --- |
| Algolia Productivity MCP | Live analytics, index inspection, recommendations, and account-aware reviews. | `claude mcp add --transport http algolia https://mcp.algolia.com/mcp` |
| Algolia CLI | Index, settings, rules, synonyms, records, and operational account tasks. | `brew install algolia/algolia-cli/algolia` on macOS, or use the official CLI setup guide for Linux and other platforms. |
| Official Algolia skills | Official Algolia MCP, CLI, algobot, InstantSearch, and core tooling workflows. | `npx skills add https://github.com/algolia/skills` |

Official setup page: https://www.algolia.com/doc/guides/get-started/build-with-ai/
Official skills repo: https://github.com/algolia/skills

Repo integration strategy: `artifacts/repo-integration-strategy.md`

## Bundle Notes

- Use `algolia-skills-library.zip` for the full set.
- Use use-case bundles when the customer already knows the project type, such as ecommerce search or support knowledge base. Read the included `BUNDLE.md` first; it contains the scenario-specific start prompt, priority decisions, outputs, and launch gates.
- Keep validation artifacts with the skills so the agent can produce indexing contracts, event taxonomies, QA reports, and maturity notes.
- For the full set, start broad: data contract first, event foundation second, then relevance configuration, UI, AI feature readiness, and release QA.
- Keep the included `LICENSE` file with redistributed or modified copies.
