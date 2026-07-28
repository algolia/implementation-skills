import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const workspaceRoot = fileURLToPath(new URL('../', import.meta.url));
const sourceRoot = join(workspaceRoot, 'algolia-implementation-skills-repo');
const downloadsRoot = join(workspaceRoot, 'public', 'downloads');
const skills = readdirSync(join(sourceRoot, 'skills'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
const bundleGuides = new Map([
  ['ecommerce-search-bundle.zip', 'ecommerce-search.md'],
  ['b2b-catalog-bundle.zip', 'b2b-catalog.md'],
  ['support-knowledge-base-bundle.zip', 'support-knowledge-base.md'],
  ['ai-shopping-assistant-bundle.zip', 'ai-shopping-assistant.md'],
  ['marketplace-bundle.zip', 'marketplace.md']
]);
const failures = [];

function unzip(zip, entry = null) {
  const args = entry ? ['-p', zip, entry] : ['-Z1', zip];
  const result = spawnSync('unzip', args, { encoding: entry ? null : 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr?.toString() || `Unable to inspect ${zip}`);
  return result.stdout;
}

for (const skill of skills) {
  const zip = join(downloadsRoot, `${skill}.zip`);
  if (!existsSync(zip)) {
    failures.push(`Missing ${skill}.zip`);
    continue;
  }
  const listing = unzip(zip);
  for (const required of [`${skill}/SKILL.md`, 'LICENSE']) {
    if (!listing.split('\n').includes(required)) failures.push(`${skill}.zip is missing ${required}`);
  }
  const archivedSkill = unzip(zip, `${skill}/SKILL.md`);
  const sourceSkill = readFileSync(join(sourceRoot, 'skills', skill, 'SKILL.md'));
  if (!archivedSkill.equals(sourceSkill)) failures.push(`${skill}.zip contains stale SKILL.md content`);
}

const fullZip = join(downloadsRoot, 'algolia-skills-library.zip');
const fullListing = unzip(fullZip).split('\n');
for (const required of ['README.md', 'CLAUDE.md', 'LICENSE', ...skills.map((skill) => `${skill}/SKILL.md`)]) {
  if (!fullListing.includes(required)) failures.push(`algolia-skills-library.zip is missing ${required}`);
}

const bundleContents = new Map();
for (const [zipName, guideName] of bundleGuides) {
  const zip = join(downloadsRoot, zipName);
  if (!existsSync(zip)) {
    failures.push(`Missing ${zipName}`);
    continue;
  }
  const listing = unzip(zip).split('\n');
  for (const required of ['BUNDLE.md', 'CLAUDE.md', 'LICENSE']) {
    if (!listing.includes(required)) failures.push(`${zipName} is missing ${required}`);
  }
  const bundle = unzip(zip, 'BUNDLE.md');
  const guide = readFileSync(join(sourceRoot, 'artifacts', 'use-cases', guideName));
  if (!bundle.equals(guide)) failures.push(`${zipName} contains stale BUNDLE.md content`);
  bundleContents.set(zipName, bundle.toString('utf8'));
}

if (bundleContents.get('ecommerce-search-bundle.zip') === bundleContents.get('marketplace-bundle.zip')) {
  failures.push('Ecommerce and Marketplace bundle guides must be distinct');
}

for (const zipName of readdirSync(downloadsRoot).filter((name) => name.endsWith('.zip'))) {
  if (unzip(join(downloadsRoot, zipName)).includes('.DS_Store')) failures.push(`${zipName} contains .DS_Store`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Validated ${skills.length + bundleGuides.size + 1} download archives.`);
