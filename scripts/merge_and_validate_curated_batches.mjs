import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const batchesDir = path.join(root, 'scripts/curated_batches');
const dbApiFile = path.join(root, 'api/_lib/curated-songs-db.js');
const dbPubFile = path.join(root, 'public/js/engine/curated-songs-db.js');

const dbModule = await import('../' + 'api/_lib/curated-songs-db.js' + `?t=${Date.now()}`);
const db = dbModule.CURATED_CATEGORIES_DB;

console.log('--- CHECKING AVAILABLE AGENT BATCHES ---');
const files = fs.readdirSync(batchesDir).filter(f => /^agent_[1-8]\.json$/.test(f));
console.log('Found batch files:', files);

let totalReplacedOrEnriched = 0;
const globalSeenVids = new Set();

for (const file of files) {
  try {
    const raw = fs.readFileSync(path.join(batchesDir, file), 'utf8');
    const data = JSON.parse(raw);

    for (const [slug, songs] of Object.entries(data)) {
      if (!db[slug]) {
        console.warn(`Category ${slug} not found in DB, skipping`);
        continue;
      }

      console.log(`Processing ${slug} from ${file}: ${songs.length} curated songs`);

      // We replace old generic songs with the authentic curated ones
      // keeping only valid songs with distinct video IDs
      const validCurated = [];
      const seenTitles = new Set();

      for (const s of songs) {
        const vId = (s.videoId || '').trim();
        const titleKey = (s.title || '').toLowerCase().trim();

        if (!vId || vId.length !== 11 || vId === 'BddP6PYo2gs' || vId === '7PCkvCPvDXk' || vId === 'vX2cDW8LUWk') {
          continue; // Skip invalid or placeholder IDs
        }

        if (seenTitles.has(titleKey)) continue;
        seenTitles.add(titleKey);

        const dur = Number(s.durationSec) || 210;
        const entry = Number(s.hookStartSec) || 35;
        const exit = Number(s.hookEndSec) || (entry + 40);

        validCurated.push({
          id: `${slug}-${validCurated.length + 1}`,
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
      }

      // If we got high quality curated songs, replace or prepend them
      if (validCurated.length >= 20) {
        // Replace existing songs with validated curated songs + any existing non-placeholder songs
        const existingGood = (db[slug].songs || []).filter(s => {
          const vId = s.videoId || '';
          return vId && vId.length === 11 && !['BddP6PYo2gs', '7PCkvCPvDXk', 'vX2cDW8LUWk', 'VAdGW7QDJUI', 'V7LwfY5U5WI', 'CZt-rVn2BJs', 'Gr8G_ldltDE', 'GftlBD-Apu8'].includes(vId) && !seenTitles.has((s.title || '').toLowerCase().trim());
        });

        db[slug].songs = [...validCurated, ...existingGood];
        db[slug].songCount = db[slug].songs.length;
        totalReplacedOrEnriched += validCurated.length;
        console.log(`  -> ${slug}: now has ${db[slug].songs.length} songs (${validCurated.length} new distinct curated)`);
      }
    }
  } catch (err) {
    console.error(`Error processing ${file}:`, err.message);
  }
}

// Write back to DB files
const exportCode = `export const CURATED_CATEGORIES_DB = ${JSON.stringify(db, null, 2)};\n`;
fs.writeFileSync(dbApiFile, exportCode, 'utf8');
fs.writeFileSync(dbPubFile, exportCode, 'utf8');

console.log(`\nUpdated database written! Total curated songs merged: ${totalReplacedOrEnriched}`);
