import fs from 'fs';
import path from 'path';

const songsDir = 'public/songs';
const files = fs.readdirSync(songsDir).filter(f => f.endsWith('.html') && f !== 'index.html');

for (const file of files) {
  const content = fs.readFileSync(path.join(songsDir, file), 'utf8');
  const count = (content.match(/<li class="flex items-baseline/g) || []).length;
  console.log(`${file.padEnd(35)}: ${count} songs in HTML`);
}
