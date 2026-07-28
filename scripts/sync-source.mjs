import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const workspaceRoot = fileURLToPath(new URL('../', import.meta.url));
const sourceRoot = join(workspaceRoot, 'algolia-implementation-skills-repo');
const sourceSkills = join(sourceRoot, 'skills');
const sourceArtifacts = join(sourceRoot, 'artifacts');

if (!existsSync(sourceSkills) || !existsSync(sourceArtifacts)) {
  throw new Error('The skills source repository is missing expected skills or artifacts directories.');
}

for (const entry of readdirSync(sourceSkills, { withFileTypes: true }).filter((item) => item.isDirectory())) {
  cpSync(join(sourceSkills, entry.name), join(workspaceRoot, entry.name), { recursive: true, force: true });
}

for (const destination of [join(workspaceRoot, 'artifacts'), join(workspaceRoot, 'public', 'artifacts')]) {
  mkdirSync(destination, { recursive: true });
  cpSync(sourceArtifacts, destination, { recursive: true, force: true });
}

cpSync(join(sourceRoot, 'LICENSE'), join(workspaceRoot, 'LICENSE'), { force: true });

console.log('Synchronized skills, artifacts, and license from the source repository.');
