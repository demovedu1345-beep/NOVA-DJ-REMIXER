import { CURATED_CATEGORIES_DB } from '../api/_lib/curated-songs-db.js';

console.log('=== DIAGNOSING CURATED_CATEGORIES_DB ISSUES ===\n');

for (const [slug, cat] of Object.entries(CURATED_CATEGORIES_DB)) {
  const songs = cat.songs || [];
  const vIds = {};
  const titles = {};
  let genericCount = 0;

  for (const s of songs) {
    const vId = s.videoId || (s.youtube_ids && s.youtube_ids[0]) || 'NONE';
    vIds[vId] = (vIds[vId] || 0) + 1;

    const t = (s.title || '').toLowerCase().trim();
    titles[t] = (titles[t] || 0) + 1;

    if (vId === 'BddP6PYo2gs' || vId === '7PCkvCPvDXk' || vId === 'vX2cDW8LUWk' || vId === 'VAdGW7QDJUI' || vId === 'V7LwfY5U5WI' || vId === 'CZt-rVn2BJs' || vId === 'Gr8G_ldltDE' || vId === 'GftlBD-Apu8') {
      genericCount++;
    }
  }

  const dupVids = Object.entries(vIds).filter(([id, c]) => c > 1);
  console.log(`${slug.padEnd(30)}: Total Songs: ${songs.length} | Unique Videos: ${Object.keys(vIds).length} | Repeated IDs: ${dupVids.length} | Generic Fallback IDs: ${genericCount}`);
}
