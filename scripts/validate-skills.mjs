import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('../', import.meta.url));
// Skills are consumed from the algolia/skills submodule — the canonical home.
// Only the suite this site packages is validated; the rest of that repo has its
// own CI.
const skillsRoot = join(repoRoot, 'vendor', 'algolia-skills', 'skills');
const suite = new Set(JSON.parse(readFileSync(join(repoRoot, 'packaging', 'suite.json'), 'utf8')).skills);
const allowedFrontmatterKeys = new Set(['name', 'description', 'license', 'allowed-tools', 'metadata']);
const failures = [];

function fail(skill, message) {
  failures.push(`${skill}: ${message}`);
}

function frontmatterFor(skill, content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    fail(skill, 'missing or invalid YAML frontmatter');
    return null;
  }

  const block = match[1];
  const lines = block.split('\n');
  const keys = lines
    .filter((line) => /^[A-Za-z][A-Za-z0-9_-]*:/.test(line))
    .map((line) => line.slice(0, line.indexOf(':')));
  const unexpected = keys.filter((key) => !allowedFrontmatterKeys.has(key));
  if (unexpected.length) fail(skill, `unexpected frontmatter keys: ${unexpected.join(', ')}`);

  const name = block.match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const descriptionStart = lines.findIndex((line) => /^description:\s*>\s*$/.test(line));
  let description = '';
  if (descriptionStart >= 0) {
    const folded = [];
    for (const line of lines.slice(descriptionStart + 1)) {
      if (!/^\s+/.test(line)) break;
      folded.push(line.trim());
    }
    description = folded.join(' ');
  } else {
    description = block.match(/^description:\s*(.+)$/m)?.[1]?.trim() ?? '';
  }

  return { name, description };
}

for (const entry of readdirSync(skillsRoot, { withFileTypes: true }).filter((item) => item.isDirectory() && suite.has(item.name))) {
  const skill = entry.name;
  const skillDir = join(skillsRoot, skill);
  const skillFile = join(skillDir, 'SKILL.md');
  if (!existsSync(skillFile)) {
    fail(skill, 'SKILL.md not found');
    continue;
  }

  const content = readFileSync(skillFile, 'utf8');
  const frontmatter = frontmatterFor(skill, content);
  if (!frontmatter) continue;

  if (!frontmatter.name) fail(skill, 'frontmatter name is required');
  if (frontmatter.name !== basename(skillDir)) fail(skill, `name must match folder (${skill})`);
  if (!/^[a-z0-9-]+$/.test(frontmatter.name ?? '') || frontmatter.name?.length > 64 || frontmatter.name?.includes('--')) {
    fail(skill, 'name must be hyphen-case and at most 64 characters');
  }
  if (!frontmatter.description) fail(skill, 'frontmatter description is required');
  if (frontmatter.description.length > 1024) fail(skill, `description is ${frontmatter.description.length} characters; maximum is 1024`);
  if (/[<>]/.test(frontmatter.description)) fail(skill, 'description cannot contain angle brackets');

  const agentFile = join(skillDir, 'agents', 'openai.yaml');
  if (!existsSync(agentFile)) {
    fail(skill, 'agents/openai.yaml not found');
  } else {
    const agent = readFileSync(agentFile, 'utf8');
    const shortDescription = agent.match(/^\s+short_description:\s+"([^"]+)"$/m)?.[1];
    const defaultPrompt = agent.match(/^\s+default_prompt:\s+"([^"]+)"$/m)?.[1];
    if (!shortDescription || shortDescription.length < 25 || shortDescription.length > 64) {
      fail(skill, `short_description must be 25-64 characters (found ${shortDescription?.length ?? 0})`);
    }
    if (!defaultPrompt?.includes(`$${skill}`)) fail(skill, `default_prompt must mention $${skill}`);
  }

  for (const reference of content.matchAll(/`(references\/[A-Za-z0-9._/-]+\.md)`/g)) {
    if (!existsSync(join(skillDir, reference[1]))) fail(skill, `missing referenced file ${reference[1]}`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Validated ${suite.size} skills from vendor/algolia-skills.`);
