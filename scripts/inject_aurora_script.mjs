import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scriptTag = '<script src="/js/ui/aurora-and-mix-engine.js" defer></script>';

function injectScript(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('/js/ui/aurora-and-mix-engine.js')) {
    console.log(`Already injected: ${filePath}`);
    return;
  }
  if (content.includes('</body>')) {
    content = content.replace('</body>', `${scriptTag}</body>`);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Injected script in: ${filePath}`);
  }
}

injectScript(path.join(root, 'public/index.html'));
injectScript(path.join(root, 'public/songs.html'));
injectScript(path.join(root, 'public/songs/index.html'));

const songsDir = path.join(root, 'public/songs');
if (fs.existsSync(songsDir)) {
  const entries = fs.readdirSync(songsDir);
  for (const entry of entries) {
    const p = path.join(songsDir, entry);
    if (entry.endsWith('.html')) {
      injectScript(p);
    } else if (fs.statSync(p).isDirectory()) {
      injectScript(path.join(p, 'index.html'));
    }
  }
}

console.log('Script injection complete.');
