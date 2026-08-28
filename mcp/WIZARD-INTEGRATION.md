# Skills in the CLI onboarding wizard

For the Growth team. The wizard's instructions are hand-written and hard-coded, so
updating them is manual and they drift from the skills. This replaces them with skills as
the source of truth.

The wizard runs on a custom harness, so it cannot read a skills folder. It talks to an MCP
server instead. That server is in this directory and is ready to deploy.

## Connect

```bash
claude mcp add --transport http algolia-skills https://<your-host>/mcp
```

Or run it locally first:

```bash
cd mcp
npm install
npm start                 # http://localhost:8787/mcp, health on :8787/health
```

Three tools:

| Tool | Returns | Cost |
| --- | --- | --- |
| `list_skills` | Every skill: name, when-to-use, available references | ~3.6k tokens |
| `get_skill(name)` | That skill's full guidance | ~1.5–4k tokens |
| `get_reference(name, path)` | One reference document | varies |

The granularity is the design. The agent holds the catalogue once, then pays for depth
only for the phase it is in — the progressive disclosure of the skills format, expressed
as tool calls instead of a folder scan.

**Whole files, never chunks.** Each skill carries explicit `Do NOT use for X` boundaries
and a fixed phase order. A retrieval system returning the middle of a skill strips the
boundary that stops skills colliding and the ordering that is most of the value. This is
why there is no search index between the agent and the skills.

## The one thing you must add to the wizard's prompt

Skills are tightly scoped so they do not collide. That raises precision and lowers recall:
left alone, a model fires one skill and misses the rest of the suite. This backstops it —
without it the integration underperforms and it looks like the skills are at fault.

> For any non-trivial Algolia work, start with `algolia-discovery-planning` even if the
> task looks already scoped or names one feature. Enumerate the in-scope phases up front
> and state which skill owns each and in what order. Load each in-scope skill for its
> phase and apply it — don't stop at the first matching skill, and don't substitute your
> own knowledge for a skill that applies. If you deliberately skip a phase, say so and
> why. Report which skills ran and what each changed.

## Replacing the hard-coded instructions

Not all at once. Skills change *what the agent asks and in what order*, so the wizard's
flow will visibly change.

1. **Pick the phase where the current instructions are thinnest.** Data modelling and
   event setup are the usual candidates — the phases where a hand-written prompt most
   often skips straight to code.
2. **Call `list_skills` at the start of a session** and let the agent route, rather than
   hard-coding which skill to load.
3. **Add the standing rule above** to the system prompt.
4. **Delete the hand-written instructions for that phase** once the skill-driven path
   behaves. Keeping both means two sources of truth and no way to tell which one ran.
5. **Repeat per phase.** Keep hand-written instructions for anything the skills do not
   cover — wizard mechanics, your own conventions. Skills are the Algolia layer, not the
   whole wizard.

## What is guaranteed, and what is not

**Cold start cannot fail on GitHub being down.** The promoted commit's tarball is vendored
at `vendor/skills-<commit>.tar.gz` and committed. Network first, vendored copy if that
fails. Verified by simulating a codeload outage: 18 skills, correct content.

**It refuses rather than degrading.** Three failure modes that would otherwise be silent
now stop the process at boot, because every one of them would leave tool calls succeeding
while the agent quietly lost guidance:

- Network fetch hangs → 15s timeout, 3 attempts with backoff. A hung boot logs nothing
  and never passes a health check, which is worse than failing.
- Vendored copy is for a different commit → refused, not substituted. Serving an
  unpromoted commit would break the review gate silently.
- Archive parses to an empty or partial catalogue → refused, naming the missing skills.

**What is not covered, deliberately:**

- **No auth.** The content is public and MIT, so the question is who may call your
  endpoint, not protecting the skills. Your call, and it depends where you deploy.
- **No rate limiting.** Same reasoning.
- **Pin latency.** See below. This is the one you must decide, not inherit.

## The pin, and how it moves

`skills-pin.json` serves a commit that has been promoted, not `main`. That is deliberate
for a customer-facing agent: an unreviewed edit should not reach a customer's project
mid-session.

It is no longer a manual chore. `.github/workflows/sync-skills.yml` watches the eleven
skills in `packaging/suite.json`; when one changes upstream it bumps the pin, refreshes the
offline fallback, rebuilds the download ZIPs and opens a PR. Merging that PR is the
promotion step, so review is preserved without anyone having to remember.

To roll forward by hand anyway:

```bash
# edit skills-pin.json: commit + promotedAt
npm run vendor      # refresh the offline fallback for the new commit
npm test
```

Two things to be explicit about with Growth:

- The seven skills we do not own (CLI, MCP, Crawler, algobot, InstantSearch, migration,
  quickstart) come along whenever one of ours changes. If none of ours change for a
  stretch, those sit slightly behind. `workflow_dispatch` with `force` pulls them through.
- Merging the sync PR deploys the site as well. That is one action promoting both.

## What "evergreen" actually means

Worth being precise, because it is the load-bearing claim.

Skills do **not** auto-sync from docs or Academy. They are hand-maintained markdown in
`algolia/skills`. Two things keep them current:

- **One canonical copy.** This repo consumes `algolia/skills` as a submodule and never
  keeps its own; `algolia/internal-skills` does the same at `public/`. A fix lands once.
- **Live-lookup instructions.** The cached Academy pack carries an `updated_at`, and the
  skills tell the agent to fall back to `academy.algolia.com` and `algolia.com/doc` when
  it is stale. The skill routes to current sources rather than embedding a copy.

So currency comes from canonical sourcing plus routing, not from anything automatic.

## Not the skills website

`community.algolia.com/implementation-skills` is a human-facing download page. It does not
serve `SKILL.md` at all — verified: no skill body text appears anywhere in the built site.
It publishes card descriptions, artifact templates and the ZIPs, and it consumes
`algolia/skills` as a pinned submodule, so it is a snapshot too.

Indexing that page, with DocSearch or anything else, gives an agent marketing copy where
it needs procedure. Per-skill pages would be good for humans — deep links for Slack, the
Hub, docs — but are the wrong data source for an agent: markdown → HTML → crawler →
chunks, to reach content that is already plain markdown at a public URL.

## Open questions for Growth

- Where does this deploy, and who may call it? Decides the auth question.
- Which of the three pin options, and who owns bumping it?
- All 18 skills, or the implementation suite only? `suite` in `skills-pin.json` limits what
  is exposed.
