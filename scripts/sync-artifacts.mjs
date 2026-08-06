import { cpSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// artifacts/ is canonical and hand-edited; public/artifacts/ is the copy Vite
// serves. Skills are not synced anywhere — they are read straight from the
// algolia/skills submodule at vendor/algolia-skills, so there is only ever one
// copy of skill content.
const workspaceRoot = fileURLToPath(new URL('../', import.meta.url));
const source = join(workspaceRoot, 'artifacts');
const destination = join(workspaceRoot, 'public', 'artifacts');

mkdirSync(destination, { recursive: true });
cpSync(source, destination, { recursive: true, force: true });

console.log('Copied artifacts/ to public/artifacts/.');
