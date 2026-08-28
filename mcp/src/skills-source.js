import { gunzipSync } from 'node:zlib';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

/**
 * Reads a gzipped tar stream without a tar dependency.
 *
 * tar is a sequence of 512-byte blocks: a header block, then ceil(size/512)
 * data blocks. We only need regular files (typeflag '0'/'\0') and GNU long
 * names (typeflag 'L'), which store an oversized path in their data block.
 */
function readTarGz(buffer) {
  const tar = gunzipSync(buffer);
  const files = new Map();
  let offset = 0;
  let longName = null;

  while (offset + 512 <= tar.length) {
    const header = tar.subarray(offset, offset + 512);
    // Two consecutive zero blocks terminate the archive.
    if (header.every((byte) => byte === 0)) break;

    const rawName = header.subarray(0, 100).toString('utf8').replace(/\0.*$/, '');
    const prefix = header.subarray(345, 500).toString('utf8').replace(/\0.*$/, '');
    const sizeField = header.subarray(124, 136).toString('utf8').replace(/\0.*$/, '').trim();
    const size = parseInt(sizeField, 8) || 0;
    const type = String.fromCharCode(header[156]);
    const dataStart = offset + 512;
    const data = tar.subarray(dataStart, dataStart + size);

    if (type === 'L') {
      longName = data.toString('utf8').replace(/\0.*$/, '');
    } else {
      const name = longName ?? (prefix ? `${prefix}/${rawName}` : rawName);
      longName = null;
      if (type === '0' || type === '\0') files.set(name, data);
    }

    // Data is padded to a 512-byte boundary.
    offset = dataStart + Math.ceil(size / 512) * 512;
  }

  return files;
}

/** Minimal YAML frontmatter reader — enough for the Agent Skills spec's fields. */
function parseFrontmatter(markdown) {
  if (!markdown.startsWith('---')) return { data: {}, body: markdown };
  const end = markdown.indexOf('\n---', 3);
  if (end === -1) return { data: {}, body: markdown };

  const block = markdown.slice(3, end);
  const body = markdown.slice(end + 4).replace(/^\r?\n/, '');
  const data = {};
  let key = null;
  let folded = [];

  const flush = () => {
    if (key && folded.length) data[key] = folded.join(' ').replace(/\s+/g, ' ').trim();
    folded = [];
  };

  for (const line of block.split('\n')) {
    const top = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (top && !line.startsWith(' ')) {
      flush();
      key = top[1];
      const value = top[2].trim();
      // `>` and `|` introduce a folded/literal block that continues indented.
      if (value === '>' || value === '|' || value === '>-' || value === '|-') {
        folded = [];
      } else if (value) {
        data[key] = value;
        key = null;
      } else {
        folded = [];
      }
    } else if (key && line.trim()) {
      folded.push(line.trim());
    }
  }
  flush();
  return { data, body };
}

export class SkillsSource {
  constructor(pin = JSON.parse(readFileSync(join(root, 'skills-pin.json'), 'utf8'))) {
    this.pin = pin;
    this.skills = null;
    this.loading = null;
  }

  get commit() {
    return this.pin.commit;
  }

  /** Loads the promoted commit once; concurrent callers share the same fetch. */
  async load() {
    if (this.skills) return this.skills;
    if (!this.loading) this.loading = this.#fetch().finally(() => { this.loading = null; });
    return this.loading;
  }

  /** Where a vendored copy of the promoted commit lives, if one was committed. */
  get vendoredPath() {
    return join(root, 'vendor', `skills-${this.pin.commit}.tar.gz`);
  }

  /**
   * Downloads the promoted commit, with a timeout and retries.
   *
   * Without a timeout a hung connection to codeload hangs boot forever, which is
   * worse than failing: the health check never comes up and nothing is logged.
   */
  async #download() {
    const { repo, commit } = this.pin;
    const url = `https://codeload.github.com/${repo}/tar.gz/${commit}`;
    let lastError = null;

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
        if (!response.ok) {
          // 4xx will not fix itself — a wrong or unpushed commit, most likely.
          if (response.status < 500) {
            throw new Error(`${response.status} ${response.statusText} (is ${commit.slice(0, 8)} pushed?)`);
          }
          throw new Error(`${response.status} ${response.statusText}`);
        }
        return Buffer.from(await response.arrayBuffer());
      } catch (error) {
        lastError = error;
        if (attempt < 3 && !/is .* pushed/.test(error.message)) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 500));
        } else {
          break;
        }
      }
    }

    throw new Error(`Could not fetch ${repo}@${commit.slice(0, 8)}: ${lastError?.message}`);
  }

  /**
   * Reads the promoted commit's tarball: network first, then the vendored copy.
   *
   * The vendored file is only used when its filename carries the same commit as
   * the pin. Serving a different commit than the one promoted would quietly
   * break the review gate that skills-pin.json exists to enforce, so a stale
   * vendored file is ignored rather than substituted.
   */
  async #read() {
    try {
      return await this.#download();
    } catch (networkError) {
      if (existsSync(this.vendoredPath)) {
        console.warn(
          `[algolia-skills-mcp] network fetch failed (${networkError.message}); ` +
            `serving the vendored copy of ${this.pin.commit.slice(0, 8)}`
        );
        return readFileSync(this.vendoredPath);
      }
      throw new Error(
        `${networkError.message}. No vendored fallback at vendor/skills-${this.pin.commit.slice(0, 8)}….tar.gz — ` +
          'run `npm run vendor` and commit it so a cold start cannot depend on GitHub.'
      );
    }
  }

  async #fetch() {
    const { repo, commit } = this.pin;
    const files = readTarGz(await this.#read());
    const allow = this.pin.suite ? new Set(this.pin.suite) : null;
    const skills = new Map();

    for (const [path, data] of files) {
      // Paths look like `<repo>-<sha>/skills/<name>/...`
      const match = path.match(/^[^/]+\/skills\/([^/]+)\/(.+)$/);
      if (!match) continue;
      const [, name, relative] = match;
      if (allow && !allow.has(name)) continue;

      if (!skills.has(name)) skills.set(name, { name, references: new Map() });
      const skill = skills.get(name);

      if (relative === 'SKILL.md') {
        const { data: frontmatter, body } = parseFrontmatter(data.toString('utf8'));
        skill.description = frontmatter.description ?? '';
        skill.license = frontmatter.license;
        skill.body = body;
      } else if (relative.startsWith('references/') && relative.endsWith('.md')) {
        skill.references.set(relative.slice('references/'.length), data.toString('utf8'));
      }
    }

    // A directory without SKILL.md is not a skill.
    for (const [name, skill] of skills) if (!skill.body) skills.delete(name);

    // An empty or partial catalogue is the dangerous failure: every tool call
    // still succeeds, the agent just silently loses skills it should have had.
    // Better to refuse to start.
    if (skills.size === 0) {
      throw new Error(`Parsed no skills from ${repo}@${commit.slice(0, 8)} — archive layout may have changed.`);
    }
    if (this.pin.suite) {
      const missing = this.pin.suite.filter((name) => !skills.has(name));
      if (missing.length) {
        throw new Error(
          `${repo}@${commit.slice(0, 8)} is missing skills listed in skills-pin.json: ${missing.join(', ')}. ` +
            'Either the pin predates them or they were renamed — fix the pin or the suite list.'
        );
      }
    }

    this.skills = skills;
    return skills;
  }

  /** The catalogue an agent needs to choose: names and descriptions only. */
  async list() {
    const skills = await this.load();
    return [...skills.values()]
      .map(({ name, description, references }) => ({
        name,
        description,
        references: [...references.keys()].sort()
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async get(name) {
    const skills = await this.load();
    return skills.get(name) ?? null;
  }

  async reference(name, path) {
    const skill = await this.get(name);
    return skill?.references.get(path) ?? null;
  }
}
