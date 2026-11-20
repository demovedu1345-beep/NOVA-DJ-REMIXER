import fs from 'fs';
import path from 'path';

function searchModule(dir, modId) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    if (entry.isDirectory()) searchModule(full, modId);
    else if (entry.name.endsWith('.js')) {
      const txt = fs.readFileSync(full, 'utf8');
      if (txt.includes(`,${modId},`) || txt.includes(`[${modId},`) || txt.includes(`"${modId}":`) || txt.includes(` ${modId},`)) {
        console.log(`Found ${modId} in:`, full);
      }
    }
  }
}
searchModule('public', 298);
