import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'scripts/new_songs_batch');
const dbApiFile = path.join(root, 'api/_lib/curated-songs-db.js');
const dbPubFile = path.join(root, 'public/js/engine/curated-songs-db.js');

const dbModule = await import('../api/_lib/curated-songs-db.js?t=' + Date.now());
const db = dbModule.CURATED_CATEGORIES_DB;

const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
console.log('Merging new_songs_batch files:', files);

let totalAdded = 0;

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  for (const [slug, songs] of Object.entries(data)) {
    if (!db[slug]) {
      console.warn('Unknown slug:', slug);
      continue;
    }
    const existing = db[slug].songs || [];
    const seenTitles = new Set(existing.map(s => (s.title || '').toLowerCase().trim()));
    const seenVids = new Set(existing.map(s => s.videoId));

    let addedForCat = 0;
    for (const s of songs) {
      const vId = (s.videoId || '').trim();
      const titleKey = (s.title || '').toLowerCase().trim();
      if (!vId || vId.length !== 11 || ['BddP6PYo2gs', '7PCkvCPvDXk', 'vX2cDW8LUWk'].includes(vId)) continue;
      if (seenTitles.has(titleKey) || seenVids.has(vId)) continue;

      seenTitles.add(titleKey);
      seenVids.add(vId);

      const dur = Number(s.durationSec) || 210;
      const entry = Number(s.hookStartSec) || 35;
      const exit = Number(s.hookEndSec) || (entry + 40);

      existing.push({
        id: `${slug}-${existing.length + 1}`,
        title: s.title,
        artist: s.artist,
        year: String(s.year || '2024'),
        durationSec: dur,
        hookStartSec: entry,
        hookEndSec: exit,
        entrySec: entry,
        exitSec: exit,
        videoId: vId,
        youtube_ids: [vId],
        playFull: false,
        energy: s.energy || 9,
        heat: Array.from({ length: 100 }, (_, i) => +(0.5 + 0.4 * Math.sin(i / 10)).toFixed(3))
      });
      addedForCat++;
    }
    db[slug].songs = existing;
    db[slug].songCount = existing.length;
    totalAdded += addedForCat;
    console.log(`  -> ${slug}: +${addedForCat} new songs, total now: ${existing.length}`);
  }
}

const exportCode = `export const CURATED_CATEGORIES_DB = ${JSON.stringify(db, null, 2)};\n`;
fs.writeFileSync(dbApiFile, exportCode, 'utf8');
fs.writeFileSync(dbPubFile, exportCode, 'utf8');

console.log(`\nSuccessfully merged ${totalAdded} songs from new_songs_batch!`);
