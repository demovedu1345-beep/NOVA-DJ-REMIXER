import fs from 'fs';
import path from 'path';

const dir = 'public/naux/static/immutable/chunks';
const files = fs.readdirSync(dir);
for (const f of files) {
  if (f.endsWith('.js')) {
    const code = fs.readFileSync(path.join(dir, f), 'utf8');
    if (code.includes('/api/set') || code.includes('fetchSet')) {
      console.log('Found /api/set in chunk:', f);
      const idx = code.indexOf('/api/set');
      console.log(code.slice(Math.max(0, idx - 100), idx + 400));
    }
  }
}
