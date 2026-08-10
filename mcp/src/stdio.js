import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';

// Local development and manual testing:
//   claude mcp add algolia-skills -- node /abs/path/to/mcp/src/stdio.js
const server = createServer();
await server.connect(new StdioServerTransport());
