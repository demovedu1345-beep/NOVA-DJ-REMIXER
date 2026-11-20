import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const content = fs.readFileSync('scripts/build_agent_8.mjs', 'utf8');
const match = content.match(/const RAW_SONGS =\s*({[\s\S]+?});\s*async function/);
if (match) {
  // Evaluate the object safely
  const fn = new Function(`return ${match[1]}`);
  const raw = fn();
  fs.writeFileSync('scripts/raw_agent_8.json', JSON.stringify(raw, null, 2), 'utf8');
  console.log('Exported raw_agent_8.json with categories:', Object.keys(raw).map(k => `${k}: ${raw[k].length}`));
} else {
  console.error('Could not find RAW_SONGS match');
}
