import { CURATED_CATEGORIES_DB } from '../api/_lib/curated-songs-db.js';
import { ARTISTS_DB } from '../api/_lib/artists-db.js';

const verifiedMap = new Map(); // title -> song

function addSong(s) {
  const vId = s.videoId || (s.youtube_ids && s.youtube_ids[0]);
  if (!vId || vId.length !== 11 || vId.includes('K1n0v4')) return;
  const key = s.title.toLowerCase().trim();
  if (!verifiedMap.has(key)) {
    verifiedMap.set(key, { ...s, videoId: vId, youtube_ids: [vId] });
  }
}

for (const cat of Object.values(CURATED_CATEGORIES_DB)) {
  for (const s of (cat.songs || [])) addSong(s);
}

for (const lang of Object.values(ARTISTS_DB)) {
  for (const art of Object.values(lang)) {
    for (const s of (art.songs || [])) addSong(s);
  }
}

console.log(`Total verified unique songs harvested: ${verifiedMap.size}`);
