# Install Instructions

Use the full library ZIP when you want every skill and artifact. Use an individual skill ZIP when you only need one workflow.

Use these implementation skills as customer-ready extensions to Algolia MCP, the Algolia CLI, and official Algolia skills. MCP and CLI are the right layer for live account inspection, analytics, index operations, settings changes, rules, synonyms, and record imports. These skills add the workflow layer for asking the right questions, choosing the right path, interpreting tool output, and validating the work.

When installing the full library, orient the agent to the whole Algolia system. Data and events are the foundation: the data contract shapes what search can retrieve, rank, filter, display, and attribute; the event foundation shapes analytics, personalization, Recommend, Dynamic Re-Ranking, NeuralSearch evaluation, and Agent Studio feedback loops.

## Most AI tools

These skills follow the open [Agent Skills specification](https://agentskills.io/specification).
One folder works across Codex, Cursor, GitHub Copilot, the ChatGPT desktop app,
Gemini CLI, Antigravity and Windsurf/Devin.

1. Download and unzip the skill or bundle.
2. Copy each extracted `algolia-*` folder into your project:

```text
.agents/skills/
```

Or `~/.agents/skills/` to make them available in every project.

3. Confirm each skill folder contains a `SKILL.md` file at the top level.
4. Reference the skill by name, for example:

```text
Use algolia-discovery-planning to help me choose the right Algolia implementation path.
```

Expected shape:

```text
.agents/skills/
  algolia-discovery-planning/
    SKILL.md
    references/
  algolia-events-insights/
    SKILL.md
    references/
```

Tool-specific paths that also work:

| Tool | Path |
| --- | --- |
| Claude Code | `~/.claude/skills/` or `.claude/skills/` (does **not** read `.agents/skills/`) |
| Cursor | `.cursor/skills/` (also reads `.claude/skills/` and `.codex/skills/`) |
| GitHub Copilot / VS Code | `.github/skills/` |
| Windsurf / Devin Desktop | `.agents/skills/` or `.devin/skills/`; `.windsurf/skills/` still loads |
| Gemini CLI | `.gemini/skills/` (`.agents/skills/` takes precedence) |
| Kiro | `.kiro/skills/` — its docs don't list `.agents/skills/` |

Note: `.agents/skills/` is the documented cross-tool location for Codex, but the
older `~/.codex/skills/` still loads for backward compatibility. Codex budgets its
startup skill list to 2% of the model's context window (8,000 characters when that
is unknown); past that it shortens descriptions, then omits skills and warns you.
Install only the skills you need.

## Claude and ChatGPT apps

These upload a ZIP rather than reading a folder.

**Claude (app or web)**

1. Enable **Settings → Capabilities → Code execution and file creation**. Skills
   depend on code execution, so turn it on first.
2. Go to **Customize → Skills** and choose **+ → Create skill → Upload a skill**.
3. Upload an **individual** skill ZIP. The uploader expects one skill folder at
   the root, so `algolia-skills-library.zip` will be rejected. If a single-skill
   ZIP is also rejected, unzip it and re-zip just the `algolia-*` folder — the
   download includes a `LICENSE` file beside it.
4. Type `/` in the composer to confirm the skill is listed.

Skills uploaded this way are private to your account, and are shared between
Claude chat and Cowork.

**ChatGPT**

1. Sidebar → **Plugins → Plugin Directory → Skills**.
2. **Create → Upload from your computer**, one skill ZIP at a time.
3. Wait for the security scan. Uploads can come back **Needs Review**, or
   **Blocked** if the scan flags them.

Personal skills do not sync between the ChatGPT desktop app and web, so add them
in both. Native Skills are generally available on Business, Enterprise,
Healthcare and Edu plans, though on Enterprise and Edu an admin has to enable
them first; on other plans, paste the `SKILL.md` contents into a Project's
instructions instead.

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
