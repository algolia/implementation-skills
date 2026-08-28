// Downloads the promoted commit's tarball into vendor/ so a cold start cannot
// depend on GitHub being reachable. Commit the result.
//
//   npm run vendor
//
// The filename carries the commit, and the loader only falls back to a file
// matching the current pin — so a stale vendored copy is ignored, never served
// in place of the promoted one. Re-run this whenever you bump the pin.

import { mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const pin = JSON.parse(readFileSync(join(root, 'skills-pin.json'), 'utf8'));
const dir = join(root, 'vendor');
const target = join(dir, `skills-${pin.commit}.tar.gz`);

const url = `https://codeload.github.com/${pin.repo}/tar.gz/${pin.commit}`;
const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
if (!response.ok) {
  console.error(`Could not download ${pin.repo}@${pin.commit.slice(0, 8)}: ${response.status} ${response.statusText}`);
  process.exit(1);
}

mkdirSync(dir, { recursive: true });
const bytes = Buffer.from(await response.arrayBuffer());
writeFileSync(target, bytes);
console.log(`wrote vendor/skills-${pin.commit.slice(0, 8)}....tar.gz - ${Math.round(bytes.length / 1024)} KB`);

// Drop copies of commits we no longer serve, so the directory does not grow.
for (const name of readdirSync(dir)) {
  if (name.startsWith('skills-') && !name.includes(pin.commit)) {
    rmSync(join(dir, name));
    console.log(`removed stale ${name}`);
  }
}
