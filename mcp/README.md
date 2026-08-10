# algolia-skills-mcp

An MCP server that serves the official Algolia implementation skills to an agent, from
a **promoted commit** of [`algolia/skills`](https://github.com/algolia/skills).

Built as a reference implementation for the CLI onboarding agent: it is small enough to
read in one sitting and to lift into whatever service shape you already deploy.

## Why it exists

A customer-facing agent needs the current skills the moment a customer calls it, with no
user action. Reading GitHub at runtime does not deliver that:

- unauthenticated GitHub API is **60 requests/hour per IP**, which shared corporate NAT
  will exhaust for everyone behind it
- GitHub Actions and Pages were down for ~7 hours on 2026-08-06; skill loading should not
  inherit that
- tracking `main` live means an unreviewed edit reaches customers immediately

So this server sits in the middle: Algolia-controlled, one fetch per process, and it
serves a commit you promote deliberately.

## Tools

| Tool | Returns | Cost |
| --- | --- | --- |
| `list_skills` | Every skill: name, when-to-use description, available reference files | ~3.6k tokens |
| `get_skill(name)` | That skill's full guidance | ~1.5–4k tokens |
| `get_reference(name, path)` | One reference document | varies |

The split is the point: the agent holds the catalogue, then pays for depth only where a
phase needs it. That is the Agent Skills progressive-disclosure model expressed as tool
granularity, which works for a hosted agent with no skills folder to scan.

Tool results are text. Nothing is written to disk, so this is safe in a sandbox.

## Run it

```bash
npm install
npm start                 # streamable HTTP on :8787/mcp, health on :8787/health
npm run start:stdio       # stdio, for local testing
npm test                  # drives the real MCP protocol over an in-memory transport
```

Environment: `PORT` (default `8787`), `MCP_PATH` (default `/mcp`).

Try it from Claude Code:

```bash
claude mcp add --transport http algolia-skills http://localhost:8787/mcp
```

## Promoting a new version

`skills-pin.json` holds the commit being served. To roll forward:

1. Confirm the change is merged to `algolia/skills` `main` and has been reviewed.
2. Update `commit` (and `promotedAt`) in `skills-pin.json`.
3. `npm test`, then deploy.

Every customer session picks it up on next start. Do not point `commit` at a branch name
or at an unmerged PR — the review gate is the whole reason this file exists.

> **Known gap at the current pin:** `dc12547` predates
> [algolia/skills#34](https://github.com/algolia/skills/pull/34), so the
> `algolia-ui-libraries` selector still understates Angular InstantSearch as "not
> compatible with the latest Angular versions" rather than formally deprecated, and omits
> SiteSearch and the Next.js App Router guidance. Bump the pin once #34 merges.

## Notes for productionising

- **Caching.** The promoted commit is immutable, so one fetch per process is enough and
  there is no invalidation problem. A long-lived process never re-fetches.
- **Bundle a fallback.** Vendor the tarball into the image so a cold start cannot fail if
  codeload is unreachable. `src/http.js` currently fails fast at boot instead, which is
  the right default for a service behind a health check but not for a single instance.
- **Auth.** There is none here. The content is public and MIT, so the decision is about
  who may call your endpoint, not about protecting the skills.
- **Observability.** `list_skills`/`get_skill` calls are a useful signal for which parts
  of onboarding customers actually reach.
- **Serving a subset.** `suite` in `skills-pin.json` limits which skills are exposed;
  remove it to serve everything in the repo.
- **No dependency on the skills website.** `community.algolia.com/implementation-skills`
  is a human-facing download page that consumes `algolia/skills` as a pinned submodule.
  It is a snapshot, and it does not serve `SKILL.md` files at all.
