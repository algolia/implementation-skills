import { createServer as createHttpServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from './server.js';
import { SkillsSource } from './skills-source.js';

const PORT = Number(process.env.PORT ?? 8787);
const PATH = process.env.MCP_PATH ?? '/mcp';

// One shared source across sessions: the promoted commit is immutable, so the
// tarball is fetched once per process and reused.
const source = new SkillsSource();
const sessions = new Map();

async function handleMcp(req, res) {
  const sessionId = req.headers['mcp-session-id'];
  let transport = sessionId ? sessions.get(sessionId) : undefined;

  if (!transport) {
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (id) => sessions.set(id, transport)
    });
    transport.onclose = () => {
      if (transport.sessionId) sessions.delete(transport.sessionId);
    };
    await createServer(source).connect(transport);
  }

  await transport.handleRequest(req, res);
}

const http = createHttpServer((req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);

  // Warm, dependency-free health check for load balancers: reports whether the
  // promoted commit has been loaded, without triggering a fetch.
  if (pathname === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'ok',
        promotedCommit: source.commit,
        skillsLoaded: source.skills ? source.skills.size : 0,
        sessions: sessions.size
      })
    );
    return;
  }

  if (pathname !== PATH) {
    res.writeHead(404, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: `Not found. MCP endpoint is ${PATH}` }));
    return;
  }

  handleMcp(req, res).catch((error) => {
    console.error('[algolia-skills-mcp]', error);
    if (!res.headersSent) {
      res.writeHead(500, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  });
});

// Fail fast and loudly if the promoted commit is unreachable, rather than
// surfacing it as a broken tool call to a customer mid-onboarding.
await source.load();
http.listen(PORT, () => {
  console.log(
    `[algolia-skills-mcp] ${source.skills.size} skills from ${source.commit.slice(0, 8)} ` +
      `on http://localhost:${PORT}${PATH}`
  );
});
