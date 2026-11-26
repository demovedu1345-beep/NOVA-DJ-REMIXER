import { CURATED_CATEGORIES_DB } from '../api/_lib/curated-songs-db.js';

// Let's check english-trending around index 100 to 140
const songs = CURATED_CATEGORIES_DB['english-trending'].songs;
for (let i = 100; i < Math.min(140, songs.length); i++) {
  console.log(`[${i}] ${songs[i].id}: "${songs[i].title}" by ${songs[i].artist}`);
}
