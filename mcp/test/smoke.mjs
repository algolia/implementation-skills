import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../src/server.js';

let failures = 0;
const check = (label, condition, detail = '') => {
  if (condition) {
    console.log(`  ok   ${label}`);
  } else {
    failures += 1;
    console.log(`  FAIL ${label}${detail ? ` — ${detail}` : ''}`);
  }
};

const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
await createServer().connect(serverTransport);
const client = new Client({ name: 'smoke', version: '0.0.0' });
await client.connect(clientTransport);

console.log('tools');
const { tools } = await client.listTools();
const names = tools.map((t) => t.name).sort();
check('exposes the three tools', names.join(',') === 'get_reference,get_skill,list_skills', names.join(','));
check('every tool is described', tools.every((t) => t.description?.length > 20));

console.log('list_skills');
const listed = await client.callTool({ name: 'list_skills', arguments: {} });
const catalogue = JSON.parse(listed.content[0].text);
check('returns the whole suite', catalogue.count === 18, `count=${catalogue.count}`);
check('reports the promoted commit', /^[0-9a-f]{40}$/.test(catalogue.promotedCommit));
check('every skill has a description', catalogue.skills.every((s) => s.description?.length > 50));
const size = listed.content[0].text.length;
check('catalogue stays small enough to hold in context', size < 40000, `${size} chars`);

console.log('get_skill');
const skill = await client.callTool({
  name: 'get_skill',
  arguments: { name: 'algolia-discovery-planning' }
});
check('returns the body', skill.content[0].text.includes('# algolia-discovery-planning'));
check('lists its references for follow-up', /get_reference/.test(skill.content[0].text));
check('not an error', skill.isError !== true);

console.log('get_reference');
const reference = await client.callTool({
  name: 'get_reference',
  arguments: { name: 'algolia-ui-libraries', path: 'ui-library-selector.md' }
});
check('returns the reference', reference.content[0].text.includes('UI Library Selector'));
check('reference has substantive content', reference.content[0].text.length > 2000);
// Deliberately not asserting specific guidance text: what this serves is whatever
// the promoted commit contains, and that is the point of the pin. Content accuracy
// is reviewed when the pin moves, not here.
check('reference covers Angular at all', /Angular/.test(reference.content[0].text));

console.log('error handling');
const missingSkill = await client.callTool({ name: 'get_skill', arguments: { name: 'nope' } });
check('unknown skill is an error', missingSkill.isError === true);
check('unknown skill lists valid names', /algolia-discovery-planning/.test(missingSkill.content[0].text));

const missingRef = await client.callTool({
  name: 'get_reference',
  arguments: { name: 'algolia-ui-libraries', path: 'nope.md' }
});
check('unknown reference is an error', missingRef.isError === true);
check('unknown reference lists valid paths', /ui-library-selector\.md/.test(missingRef.content[0].text));

await client.close();
console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed');
process.exit(failures ? 1 : 0);
