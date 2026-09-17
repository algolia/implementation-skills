import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// benchmark/ is canonical and hand-edited (template + data); public/benchmark/
// is the generated page Vite serves at /benchmark/. Re-run after adding a run
// to benchmark/data.json — every table and tier card recomputes from the data.
const root = fileURLToPath(new URL('../', import.meta.url));
const data = JSON.parse(readFileSync(join(root, 'benchmark', 'data.json'), 'utf8'));

const required = ['id', 'platform', 'model', 'modelLabel', 'task', 'taskLabel', 'mode', 'quality', 'live', 'effort', 'storefront', 'grading', 'excluded', 'decided'];
for (const p of data.pairs) {
  const missing = required.filter((k) => !(k in p));
  if (missing.length) throw new Error(`pair ${p.id ?? '?'} missing ${missing.join(', ')}`);
  if (![35, 37].includes(p.quality.max)) throw new Error(`pair ${p.id}: rubric max must be 35 (build) or 37 (audit)`);
}

const template = readFileSync(join(root, 'benchmark', 'template.html'), 'utf8');
const payload = JSON.stringify(data).replace(/<\//g, '<\\/');
const html = template.replace('/*__DATA__*/', payload);

mkdirSync(join(root, 'public', 'benchmark'), { recursive: true });
writeFileSync(join(root, 'public', 'benchmark', 'index.html'), html);
console.log(`Built public/benchmark/index.html from ${data.pairs.length} pairs and ${data.validation.length} validation runs.`);
