import { cpSync, mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const workspaceRoot = fileURLToPath(new URL('../', import.meta.url));
// Skills come from the algolia/skills submodule (the canonical home). Artifacts,
// the bundle guides and the packaged README live in this repo.
const skillsRoot = join(workspaceRoot, 'vendor', 'algolia-skills', 'skills');
const artifactsRoot = join(workspaceRoot, 'artifacts');
const packagingRoot = join(workspaceRoot, 'packaging');
const downloadsRoot = join(workspaceRoot, 'public', 'downloads');
const skillIds = JSON.parse(readFileSync(join(packagingRoot, 'suite.json'), 'utf8')).skills.slice().sort();

const commonArtifacts = [
  'start-here-prompt.md',
  'customer-implementation-brief.md',
  'example-output-pack.md',
  'indexing-contract-template.md',
  'event-taxonomy-template.md',
  'qa-report-template.md',
  'customer-maturity-scorecard.md',
  'academy-alignment-template.md',
  'use-case-bundle-template.md'
];

const bundles = [
  {
    id: 'ecommerce-search',
    guide: 'ecommerce-search.md',
    skills: ['algolia-search-implementation', 'algolia-discovery-planning', 'algolia-data-modeling', 'algolia-events-insights', 'algolia-index-configuration', 'algolia-instantsearch-ui', 'algolia-autocomplete', 'algolia-neuralsearch', 'algolia-release-qa'],
    artifacts: commonArtifacts
  },
  {
    id: 'b2b-catalog',
    guide: 'b2b-catalog.md',
    skills: ['algolia-search-implementation', 'algolia-discovery-planning', 'algolia-data-modeling', 'algolia-events-insights', 'algolia-index-configuration', 'algolia-instantsearch-ui', 'algolia-release-qa'],
    artifacts: commonArtifacts
  },
  {
    id: 'support-knowledge-base',
    guide: 'support-knowledge-base.md',
    skills: ['algolia-search-implementation', 'algolia-discovery-planning', 'algolia-data-modeling', 'algolia-events-insights', 'algolia-index-configuration', 'algolia-instantsearch-ui', 'algolia-autocomplete', 'algolia-neuralsearch', 'algolia-agent-studio', 'algolia-release-qa'],
    artifacts: commonArtifacts
  },
  {
    id: 'ai-shopping-assistant',
    guide: 'ai-shopping-assistant.md',
    skills: ['algolia-search-implementation', 'algolia-discovery-planning', 'algolia-data-modeling', 'algolia-events-insights', 'algolia-neuralsearch', 'algolia-agent-studio', 'algolia-release-qa'],
    artifacts: commonArtifacts
  },
  {
    id: 'marketplace',
    guide: 'marketplace.md',
    skills: ['algolia-search-implementation', 'algolia-discovery-planning', 'algolia-data-modeling', 'algolia-events-insights', 'algolia-index-configuration', 'algolia-instantsearch-ui', 'algolia-autocomplete', 'algolia-neuralsearch', 'algolia-release-qa'],
    artifacts: commonArtifacts
  }
];

mkdirSync(downloadsRoot, { recursive: true });

function copySkill(stage, skill) {
  cpSync(join(skillsRoot, skill), join(stage, skill), { recursive: true });
}

function copyLicense(stage) {
  cpSync(join(workspaceRoot, 'LICENSE'), join(stage, 'LICENSE'));
}

function copyArtifacts(stage, names = null) {
  const destination = join(stage, 'artifacts');
  mkdirSync(destination, { recursive: true });
  if (!names) {
    cpSync(artifactsRoot, destination, { recursive: true });
    return;
  }
  for (const name of names) cpSync(join(artifactsRoot, name), join(destination, basename(name)));
}

function zipStage(stage, outputName) {
  const output = join(downloadsRoot, outputName);
  rmSync(output, { force: true });
  const entries = readdirSync(stage).sort();
  const result = spawnSync('zip', ['-q', '-r', '-X', output, ...entries], { cwd: stage, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`Failed to build ${outputName}: ${result.stderr || result.stdout}`);
}

function withStage(callback) {
  const stage = mkdtempSync(join(tmpdir(), 'algolia-skills-package-'));
  try {
    callback(stage);
  } finally {
    rmSync(stage, { recursive: true, force: true });
  }
}

for (const skill of skillIds) {
  withStage((stage) => {
    copySkill(stage, skill);
    copyArtifacts(stage);
    copyLicense(stage);
    zipStage(stage, `${skill}.zip`);
  });
}

withStage((stage) => {
  for (const skill of skillIds) copySkill(stage, skill);
  copyArtifacts(stage);
  copyLicense(stage);
  cpSync(join(packagingRoot, 'library-README.md'), join(stage, 'README.md'));
  cpSync(join(workspaceRoot, 'CLAUDE.md'), join(stage, 'CLAUDE.md'));
  zipStage(stage, 'algolia-skills-library.zip');
});

for (const bundle of bundles) {
  withStage((stage) => {
    for (const skill of bundle.skills) copySkill(stage, skill);
    copyArtifacts(stage, bundle.artifacts);
    copyLicense(stage);
    cpSync(join(workspaceRoot, 'CLAUDE.md'), join(stage, 'CLAUDE.md'));
    const guide = readFileSync(join(artifactsRoot, 'use-cases', bundle.guide), 'utf8');
    writeFileSync(join(stage, 'BUNDLE.md'), guide);
    zipStage(stage, `${bundle.id}-bundle.zip`);
  });
}

console.log(`Built ${skillIds.length + bundles.length + 1} download archives.`);
