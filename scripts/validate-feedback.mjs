// Checks that the site's feedback form still accepts what the site sends.
//
// This exists because the browser cannot tell. The site POSTs cross-origin with
// `mode: 'no-cors'`, which makes the response opaque — a 400 is indistinguishable
// from a 200, so a rejected submission shows the visitor a cheerful "Thanks"
// and is lost. Two form settings cause exactly that, silently:
//
//   * "Collect email addresses" — adds a required Email field, so every POST
//     without an `emailAddress` param is rejected.
//   * marking any question Required — same failure for any submission that
//     omits it, e.g. a row thumb, which carries no note.
//
// Node is not bound by CORS, so here we can read the real status. Run this after
// touching the form. `--dry` skips the POST and only checks structure, but note
// that the structural checks alone cannot see either setting above — the POST is
// the check that matters.
//
// Usage: node scripts/validate-feedback.mjs [--dry]

import { readFile } from 'node:fs/promises';

const DRY = process.argv.includes('--dry');
const SOURCE = 'src/main.jsx';

const fail = (message) => {
  console.error(`FAIL  ${message}`);
  process.exitCode = 1;
};

const src = await readFile(SOURCE, 'utf8');

const grab = (re, label) => {
  const m = src.match(re);
  if (!m) throw new Error(`Could not find ${label} in ${SOURCE}`);
  return m[1];
};

const formId = grab(/FEEDBACK_FORM_ID = '([^']+)'/, 'FEEDBACK_FORM_ID');
const entry = {
  vote: grab(/vote: '(entry\.[^']+)'/, 'vote entry'),
  about: grab(/about: '(entry\.[^']+)'/, 'about entry'),
  idea: grab(/idea: '(entry\.[^']+)'/, 'idea entry')
};
const answers = {
  up: grab(/VOTE_ANSWERS = \{ up: '([^']+)'/, 'VOTE_ANSWERS.up'),
  down: grab(/VOTE_ANSWERS = \{ up: '[^']+', down: '([^']+)'/, 'VOTE_ANSWERS.down')
};

if (formId.includes('PASTE_')) {
  console.log('Feedback form is not configured yet — nothing to check.');
  process.exit(0);
}

console.log(`Form ${formId.slice(0, 16)}…`);

// ---- structural: the questions and options the site assumes still exist ----
const viewform = await fetch(`https://docs.google.com/forms/d/e/${formId}/viewform`, {
  headers: { 'User-Agent': 'Mozilla/5.0' }
});
if (!viewform.ok) fail(`viewform returned ${viewform.status} — is the form still public?`);

const html = await viewform.text();
const blob = html.match(/FB_PUBLIC_LOAD_DATA_ = (.*?);\s*<\/script>/s);
if (!blob) {
  fail('could not read the form definition from the page');
} else {
  const items = JSON.parse(blob[1])[1][1];
  const found = new Map();
  for (const item of items) {
    for (const field of item[4] || []) {
      found.set(`entry.${field[0]}`, {
        title: item[1],
        required: Boolean(field[2]),
        options: (field[1] || []).map((o) => o[0])
      });
    }
  }

  for (const [role, id] of Object.entries(entry)) {
    if (id.includes('PASTE_')) continue;
    const q = found.get(id);
    if (!q) {
      fail(`${role} → ${id} is not a question on the form any more`);
      continue;
    }
    console.log(`  ok    ${role} → ${id}  "${q.title}"`);
    // A required question rejects every submission that leaves it blank.
    if (q.required) fail(`"${q.title}" is marked Required — make it optional`);
  }

  // Q1's answer has to match an option's text exactly or Google discards it.
  const vote = found.get(entry.vote);
  if (vote) {
    for (const [dir, text] of Object.entries(answers)) {
      if (!vote.options.includes(text)) {
        fail(`VOTE_ANSWERS.${dir} is "${text}" but the form's options are ${JSON.stringify(vote.options)}`);
      }
    }
  }
}

// ---- behavioural: the only check that sees the settings above ----
if (DRY) {
  console.log('\n--dry: skipped the live POST, so email collection and required\n' +
              'questions have NOT been checked. Re-run without --dry before release.');
} else {
  // The row-thumb shape: vote + about and no note. The most minimal thing the
  // site sends, so the most likely to be rejected.
  const body = new URLSearchParams({
    [entry.vote]: answers.down,
    [entry.about]: 'automated check — safe to delete'
  });
  const res = await fetch(`https://docs.google.com/forms/d/e/${formId}/formResponse`, {
    method: 'POST',
    headers: { 'User-Agent': 'Mozilla/5.0' },
    body
  });

  if (res.status === 200) {
    console.log('\n  ok    live POST accepted (200) — one response row added, safe to delete');
  } else {
    fail(`live POST rejected (${res.status}). The site would show "Thanks" and lose the ` +
         'feedback.\n      Almost always one of: "Collect email addresses" is on, or a ' +
         'question is Required.\n      Both are in the form\'s settings.');
  }
}

if (process.exitCode) {
  console.error('\nFeedback submission is broken. Do not deploy — it fails silently.');
} else {
  console.log('\nFeedback submission verified.');
}
