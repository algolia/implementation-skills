# Site feedback form

The skills site is static (GitHub Pages), so there is no endpoint of our own to
post to. Feedback goes to a Google Form instead, and the site passes the answers
across as **prefill parameters**: the form opens in a new tab with the thumb and
the note already filled in, so the person only has to press Submit.

Two places collect feedback, both in `src/main.jsx`:

| Where | Component | Q2 arrives as |
| --- | --- | --- |
| Block at the end of the page | `FeedbackSection` | `The site overall` |
| Thumbs on each skill row | `RowVote` | the skill title, e.g. `Search Implementation` |

Every control is a link, not a submit — which is why the site's
`form-action 'none'` CSP needs no change to allow this.

## The three questions

Create these in the form, in this order. Keep the wording as-is: **Q1's option
text has to match `VOTE_ANSWERS` in `src/main.jsx` character for character**, or
Google silently drops the prefill and Q1 arrives blank.

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

Q2 is never shown on the site — it is filled in for the visitor, which is why
the page promises a form that only needs a Submit rather than advertising three
questions.

Three is the cap on purpose. Every extra question costs completions, and the
thumb alone is already a useful signal.

If you want to know who sent something, add an optional email question **in the
form**. Don't add it to the site: the note travels in a URL, and personal data
does not belong in a query string. Turning on "Collect email addresses" in the
form settings does the same job without a fourth question.

## Current state

The form is https://forms.gle/FLt3EbqzdYcL37nVA and all three questions are
wired into `src/main.jsx` and verified against the live form:

| Question | Entry | Verified |
| --- | --- | --- |
| Q1 "How's it working out?" | `entry.931205562` | selection registers for both `Working well` and `Needs work` |
| Q2 "What's this about?" | `entry.1186007049` | skill name and `The site overall` both prefill |
| Q3 "What would make it better?" | `entry.1544401237` | note prefills |

Nothing further is needed for feedback to work.

If you ever reword Q1's options, update `VOTE_ANSWERS` in `src/main.jsx` in the
same commit. Prefill matches on the option's exact text — send a value that is
not one of the listed options and Google drops it silently, with no error and a
blank answer on the response. That is worth remembering because it is invisible
from the site side: the link still opens, the question just arrives empty.

Any id left as a `PASTE_` placeholder is skipped rather than sent as a junk
parameter, and the per-skill thumbs hide themselves entirely if Q2's id is
unset, since a per-skill vote with nowhere to record the skill is
indistinguishable from a site-wide one.

Optional: none of the three questions is marked Required. Making Q1 and Q3
required stops half-empty responses, at the cost of a little friction.

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
