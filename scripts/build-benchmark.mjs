import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Compass, ListChecks, ShieldCheck, Search, ScanSearch, SlidersHorizontal, ChartNoAxesCombined } from 'lucide-react';

// benchmark/ is canonical and hand-edited (template + data); public/benchmark/
// is the generated page Vite serves at /benchmark/. Re-run after adding a run
// to the versioned evidence files — tables recompute within their own cohort.
const root = fileURLToPath(new URL('../', import.meta.url));
const data = JSON.parse(readFileSync(join(root, 'benchmark', 'data.json'), 'utf8'));
const current = JSON.parse(readFileSync(join(root, 'benchmark', 'current-data.json'), 'utf8'));
// Preserve historical records verbatim, but replace obsolete administrative
// notes (including "Opus pending") in the customer-facing projection.
const historical = {
  ...data,
  notes: [
    'Historical September 2026 study: skills plus the Algolia CLI versus the bare setup; this combined treatment does not isolate the contribution of skills.',
    'All 13 original pair records and four follow-up records are retained. One pair is excluded for permission asymmetry and controller grading.',
    'Coverage: seven Sonnet 5 pairs, three GPT-5.6 Terra pairs (two counted), two Haiku 4.5 pairs and one Opus 5 pair.',
    'Build and vague-brief rubrics use 35 points; audits use 37. Live checks use a separate 10-point scale. Do not pool scores across rubrics or cohorts.',
    'Follow-up validations compare changed skills to earlier baselines and are not fresh paired comparisons. Timing and token records are not a complete invoice.',
  ],
};

const required = ['id', 'platform', 'model', 'modelLabel', 'task', 'taskLabel', 'mode', 'quality', 'live', 'effort', 'storefront', 'grading', 'excluded', 'decided'];
for (const p of data.pairs) {
  const missing = required.filter((k) => !(k in p));
  if (missing.length) throw new Error(`pair ${p.id ?? '?'} missing ${missing.join(', ')}`);
  if (![35, 37].includes(p.quality.max)) throw new Error(`pair ${p.id}: rubric max must be 35 (build) or 37 (audit)`);
}

const laneIds = new Set(current.lanes.map((lane) => lane.id));
const pairIds = new Set();
for (const pair of current.pairs) {
  const lane = current.lanes.find((item) => item.id === pair.lane);
  if (!pair.id || pairIds.has(pair.id) || !laneIds.has(pair.lane) || !current.models[pair.model]) {
    throw new Error(`Invalid or duplicate current pair: ${pair.id}`);
  }
  pairIds.add(pair.id);
  for (const arm of ['bare', 'skills']) {
    const result = pair[arm];
    if (!result || !Number.isFinite(result.score) || result.score < 0 || result.score > lane.max ||
        ![true, false, null].includes(result.skillsRead)) {
      throw new Error(`Invalid score or activation evidence: ${pair.id}/${arm}`);
    }
  }
}
for (const batch of current.validation) {
  for (const pair of batch.pairs) {
    if (!current.models[pair.model] || ![pair.candidate_lower, pair.bare_higher].every((n) => Number.isFinite(n) && n >= 0 && n <= 20) ||
        Math.abs(pair.candidate_lower - pair.bare_higher - pair.conservative_delta) > 1e-9) {
      throw new Error(`Invalid conservative validation score: ${batch.id}/${pair.model}/${pair.case}`);
    }
  }
}

const template = readFileSync(join(root, 'benchmark', 'template.html'), 'utf8');
const payload = (value) => JSON.stringify(value).replace(/</g, '\\u003c');
for (const marker of ['/*__DATA__*/', '/*__CURRENT_DATA__*/']) {
  if (template.split(marker).length !== 2) throw new Error(`Expected one ${marker} placeholder`);
}
const icons = {
  compass: Compass, checklist: ListChecks, shield: ShieldCheck,
  search: Search, audit: ScanSearch, relevance: SlidersHorizontal, analytics: ChartNoAxesCombined,
};
const html = template.replace('/*__DATA__*/', () => payload(historical))
  .replace('/*__CURRENT_DATA__*/', () => payload(current))
  .replace(/<!--ICON:([a-z]+)-->/g, (_marker, name) => {
    if (!icons[name]) throw new Error(`Unknown benchmark icon: ${name}`);
    return renderToStaticMarkup(createElement(icons[name], {
      className: 'icon', width: 24, height: 24, strokeWidth: 1.75,
      'aria-hidden': true, focusable: false,
    }));
  });

mkdirSync(join(root, 'public', 'benchmark'), { recursive: true });
writeFileSync(join(root, 'public', 'benchmark', 'index.html'), html);
writeFileSync(join(root, 'public', 'benchmark', 'evidence.json'), JSON.stringify({ current, historical }, null, 2) + '\n');
console.log(`Built benchmark: ${current.pairs.length} current pairs, ${data.pairs.length} historical records, and separate validation batches.`);
