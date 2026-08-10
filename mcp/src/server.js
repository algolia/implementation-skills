import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { SkillsSource } from './skills-source.js';

const text = (value) => ({ content: [{ type: 'text', text: value }] });
const failure = (value) => ({ content: [{ type: 'text', text: value }], isError: true });

/**
 * Three tools, deliberately granular so the agent pays only for what it needs:
 * the catalogue is ~3.6k tokens, a body is ~2-4k, and references load on demand.
 * Returning text rather than writing files keeps this usable from a hosted agent
 * with no filesystem to scan.
 */
export function createServer(source = new SkillsSource()) {
  const server = new McpServer(
    { name: 'algolia-skills', version: '0.1.0' },
    {
      instructions:
        'Official Algolia implementation skills. Call list_skills first and choose by ' +
        'description — each one states when to use it and when not to. Then call ' +
        'get_skill for the chosen skill, and get_reference only when a phase needs that ' +
        'depth. algolia-discovery-planning is the front door for broad or unclear ' +
        'requests. These skills plan and validate; live account reads and writes belong ' +
        'to the Algolia CLI and MCP.'
    }
  );

  server.registerTool(
    'list_skills',
    {
      title: 'List Algolia skills',
      description:
        'The full catalogue of available Algolia implementation skills: name, when to use ' +
        'it, and which reference documents it carries. Call this first to choose a skill.',
      inputSchema: {},
      annotations: { readOnlyHint: true, openWorldHint: false }
    },
    async () => {
      const skills = await source.list();
      return text(
        JSON.stringify(
          { promotedCommit: source.commit, count: skills.length, skills },
          null,
          2
        )
      );
    }
  );

  server.registerTool(
    'get_skill',
    {
      title: 'Get an Algolia skill',
      description:
        'The full guidance for one skill, by name. Use list_skills first to pick the name.',
      inputSchema: {
        name: z
          .string()
          .describe('Skill name exactly as returned by list_skills, e.g. algolia-data-modeling')
      },
      annotations: { readOnlyHint: true, openWorldHint: false }
    },
    async ({ name }) => {
      const skill = await source.get(name);
      if (!skill) {
        const known = (await source.list()).map((s) => s.name).join(', ');
        return failure(`No skill named "${name}". Available: ${known}`);
      }
      const references = [...skill.references.keys()].sort();
      const footer = references.length
        ? `\n\n---\nReference documents for this skill (fetch with get_reference): ${references.join(', ')}`
        : '';
      return text(`# ${skill.name}\n\n${skill.body}${footer}`);
    }
  );

  server.registerTool(
    'get_reference',
    {
      title: 'Get a skill reference document',
      description:
        'A single reference document belonging to a skill — the deeper material a skill ' +
        'points to. Fetch only when the current phase needs it.',
      inputSchema: {
        name: z.string().describe('Skill name, e.g. algolia-ui-libraries'),
        path: z
          .string()
          .describe('Reference file name as listed by list_skills, e.g. ui-library-selector.md')
      },
      annotations: { readOnlyHint: true, openWorldHint: false }
    },
    async ({ name, path }) => {
      const skill = await source.get(name);
      if (!skill) return failure(`No skill named "${name}".`);
      const body = skill.references.get(path);
      if (!body) {
        const known = [...skill.references.keys()].sort().join(', ') || 'none';
        return failure(`"${name}" has no reference "${path}". Available: ${known}`);
      }
      return text(body);
    }
  );

  return server;
}
