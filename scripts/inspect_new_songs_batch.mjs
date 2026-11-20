import fs from 'fs';
import path from 'path';

const dir = 'scripts/new_songs_batch';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

for (const f of files) {
  const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  console.log(`=== ${f} ===`);
  for (const [k, v] of Object.entries(data)) {
    const vids = new Set(v.map(s => s.videoId));
    const sample = v.slice(0, 3).map(s => `${s.title} (${s.videoId})`);
    console.log(`  ${k}: ${v.length} songs, ${vids.size} unique vIds. Sample: ${sample.join(', ')}`);
  }
}
