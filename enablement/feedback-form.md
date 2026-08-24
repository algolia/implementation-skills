# Site feedback form

The skills site is static (GitHub Pages), so there is no endpoint of our own to
post to. Feedback goes to a Google Form instead — but it is **POSTed in the
background** from the page. Nobody is ever sent to the raw Google Form. That is
the entire point: a visitor sees the site's own controls, presses one button, and
stays where they are.

Two places collect feedback, both in `src/main.jsx`:

| Where | Component | Q2 arrives as |
| --- | --- | --- |
| Block at the end of the page | `FeedbackSection` | `The site overall` |
| Thumbs on each skill row | `RowVote` | the skill title, e.g. `Search Implementation` |

## The thing that will bite you

The POST is cross-origin with `mode: 'no-cors'`, which is what lets a static page
submit to Google without a preflight. The trade is that **the response is opaque**
— the browser cannot tell a 200 from a 400. So a rejected submission shows the
visitor "Thanks — that's landed" and is silently thrown away.

Two form settings cause exactly that. Both were hit for real during this build:

- **"Collect email addresses"** adds a required Email field. Every POST without
  an `emailAddress` param is rejected 400. Keep it **off**. If you want to know
  who sent something, you cannot have it and a one-press widget both.
- **Marking any question Required** does the same to any submission that omits it
  — a row thumb sends no note, so a required Q3 rejects every thumb. Keep all
  three **optional**.

Neither is visible from the site, and neither can be detected from the form's
public page. That is what `npm run validate:feedback` is for: Node is not bound
by CORS, so it POSTs a canary and reads the real status.

```bash
npm run validate:feedback
```

Run it after any change to the form. It adds one clearly-labelled response row,
which is safe to delete. `--dry` checks only the questions and option text — it
cannot see either setting above, so it is not a substitute. `release:prepare`
runs the full check.

## The three questions

Keep the wording as-is: **Q1's option text has to match `VOTE_ANSWERS` in
`src/main.jsx` character for character**, or Google discards the answer and Q1
arrives blank on the response.

**Q1 — "How's it working out?"** · Multiple choice · Required
- `Working well`
- `Needs work`

**Q2 — "What's this about?"** · Short answer · not required
- Description: *Filled in automatically. Leave it as it is.*

**Q3 — "What would make it better?"** · Paragraph · Required
- Description: *An idea, a rough edge, a skill you wish existed — anything.*

Q1 and Q3 are also the two labels shown in the page-end block, so a visitor
reads the same words on the site and in the form. If you reword one, reword its
twin in `FeedbackSection` (`src/main.jsx`) to match. Q1 stays generic rather
than naming the library, because the per-skill thumbs reuse it for a single
skill.

Q2 is never shown on the site — it is filled in automatically, with the skill
name for a row thumb or `The site overall` for the page-end block.

Three is the cap on purpose. Every extra question costs completions, and the
thumb alone is already a useful signal.

Do not add an email question, and do not turn on "Collect email addresses" — see
the warning above; it rejects every submission the site makes. Feedback here is
anonymous by design, which is also why the site collects no personal data at
all.

## Current state

The form is https://forms.gle/FLt3EbqzdYcL37nVA. All three questions are wired
into `src/main.jsx` and verified end to end — the site posts, Google returns 200,
and the page never navigates:

| Question | Entry |
| --- | --- |
| Q1 "How's it working out?" | `entry.931205562` |
| Q2 "What's this about?" | `entry.1186007049` |
| Q3 "What would make it better?" | `entry.1544401237` |

Email collection is off and no question is Required, which is what makes the
background POST work. Do not change either without re-running
`npm run validate:feedback`.

If you reword Q1's options, update `VOTE_ANSWERS` in `src/main.jsx` in the same
commit — Google matches the answer against the option text exactly and discards
anything else, leaving Q1 blank on the response.

Any entry id left as a `PASTE_` placeholder is skipped rather than sent as a junk
parameter, and the per-skill thumbs hide themselves entirely if Q2's id is unset,
since a per-skill vote with nowhere to record the skill is indistinguishable from
a site-wide one.

## Reading the results

Responses tab → **Link to Sheets** for a spreadsheet that updates as answers come
in. Q2 is what makes it useful: sort by it to see which skills draw
`Needs work`.

Votes only count once someone actually submits the form. The thumb click itself
also fires a GA4 `feedback_vote` event (`vote`, `feedback_about`) against
`G-SR64HVSLY6`, so clicks that never reach a Submit are still counted.

`vote` and `feedback_about` must be registered as event-scoped custom dimensions
in GA4 (Admin > Data display > Custom definitions) before they appear in reports.
Registration is not retroactive, so anything clicked before you add them is
counted but not broken down.
