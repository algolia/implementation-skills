# Skill support in the CLI onboarding wizard

Notes for the Growth team. The wizard's instructions are hand-written and hard-coded, so
updating them is manual and they drift from the skills. This is how to swap that out for
skills as the source of truth, in the order the steps are actually worth doing.

## Start here: can the wizard load skills natively?

If the wizard runs on Claude Code, the Agent SDK, or anything else that reads the
[Agent Skills](https://agentskills.io/specification) format, **it does not need this MCP
server**. Point it at the canonical repo and stop:

```bash
/plugin marketplace add algolia/skills      # Claude Code
npx skills add algolia/skills               # anything else
```

That is already evergreen: it resolves at install time against `algolia/skills`, which is
the one canonical copy. Everything below is for the case where the harness cannot read a
skills folder — a hosted agent with no filesystem, or a custom loop.

Worth ten minutes to confirm before designing anything, because it decides the whole
shape.

## If it can't: the MCP server in this directory

`algolia-skills-mcp` exists for exactly this consumer. Three tools:

| Tool | Returns | Cost |
| --- | --- | --- |
| `list_skills` | Every skill: name, when-to-use, available references | ~3.6k tokens |
| `get_skill(name)` | That skill's full guidance | ~1.5–4k tokens |
| `get_reference(name, path)` | One reference document | varies |

```bash
claude mcp add --transport http algolia-skills https://<your-host>/mcp
```

The granularity is the design, not an accident. The agent holds the catalogue once, then
pays for depth only for the phase it is in. That is the progressive-disclosure model of
the skills format, expressed as tool calls instead of a folder scan.

**Whole files, never chunks.** Each skill carries explicit `Do NOT use for X` boundaries
and a fixed phase order. A retrieval system that returns the middle of a skill strips the
boundary that stops skills colliding and the ordering that is most of the value. This is
the main reason not to put a search index between the agent and the skills.

## Migrating the hard-coded instructions

Do not swap everything at once. The skills change *what the agent asks and in what order*,
so the wizard's flow will visibly change.

1. **Pick one phase where the current instructions are thinnest.** Data modelling and
   event setup are the usual candidates — they are the phases where a hand-written prompt
   most often skips straight to code.
2. **Call `list_skills` at the start of a session** and let the agent route, rather than
   hard-coding which skill to load. `algolia-discovery-planning` is the front door and
   will name the phases and their order.
3. **Add the standing rule** to the wizard's system prompt. Without it, a model reliably
   fires one skill and misses the rest of the suite — the skills' tight `Do NOT` scoping
   raises precision at the cost of recall:

   > For any non-trivial Algolia work, start with `algolia-discovery-planning` even if the
   > task looks already scoped or names one feature. Enumerate the in-scope phases up
   > front and state which skill owns each and in what order. Load each in-scope skill for
   > its phase and apply it — don't stop at the first matching skill, and don't substitute
   > your own knowledge for a skill that applies. If you deliberately skip a phase, say so
   > and why.

4. **Delete the hand-written instructions for that phase** once the skill-driven path is
   behaving. Leaving both means two sources of truth and no way to tell which one the
   agent used.
5. **Repeat per phase.** Keep the hand-written instructions for anything the skills do not
   cover — wizard-specific mechanics, your own project conventions. Skills are the Algolia
   layer, not the whole wizard.

## What "evergreen" actually means here

Worth being precise, because it is the load-bearing claim.

Skills do **not** auto-sync from docs or Academy. They are hand-maintained markdown in
`algolia/skills`. What makes them current is two things:

- **One canonical copy.** This repo consumes `algolia/skills` as a submodule and never
  keeps its own; `algolia/internal-skills` does the same at `public/`. A fix lands once.
- **Live-lookup instructions.** The cached Academy pack carries an `updated_at`, and the
  skills tell the agent to fall back to `academy.algolia.com` and `algolia.com/doc` when
  it is stale. The skill routes to current sources rather than embedding a copy of them.

So the wizard gets currency from sourcing plus routing, not from anything automatic. When
someone updates a skill, the wizard picks it up on the next pin bump.

## The review gate

`skills-pin.json` pins a commit rather than tracking `main`. That is deliberate for a
customer-facing agent: an unreviewed edit to `main` should not reach a customer's project
mid-session. Rolling forward is a two-line change plus `npm test` — see the README.

The tradeoff to be explicit about with Growth: **a fix in `algolia/skills` does not reach
the wizard until someone bumps the pin.** If that latency is unacceptable, the honest
options are a scheduled auto-bump with the test suite as the gate, or tracking `main` and
accepting the risk. Do not leave it implicit.

## Not the skills website

`community.algolia.com/implementation-skills` is a human-facing download page. It does not
serve `SKILL.md` at all — verified: no skill body text appears anywhere in the built site.
It publishes card descriptions, artifact templates and the ZIPs, and it consumes
`algolia/skills` as a pinned submodule, so it is a snapshot too.

Indexing that page — with DocSearch or anything else — gives an agent marketing copy
where it needs procedure. Per-skill pages would be good for humans (deep links for Slack,
the Hub, docs) but are the wrong data source for an agent: markdown → HTML → crawler →
chunks, to reach content that is already plain markdown at a public URL.

## Open questions for Growth

- Which harness is the wizard on, and can it read a skills folder? Decides everything above.
- How stale may the pin be before it matters to a customer?
- Does the wizard need all 18 skills, or the implementation suite only? `suite` in
  `skills-pin.json` limits what is exposed.
- Who owns bumping the pin, and does it belong in the wizard's release process or this one?
