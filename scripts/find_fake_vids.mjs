import { CURATED_CATEGORIES_DB } from '../api/_lib/curated-songs-db.js';

let fakeCount = 0;
const fakeVids = [];

for (const [k, cat] of Object.entries(CURATED_CATEGORIES_DB)) {
  for (const s of cat.songs) {
    const vId = s.videoId || (s.youtube_ids && s.youtube_ids[0]);
    if (!vId) {
      fakeCount++;
      fakeVids.push({ cat: k, title: s.title, vId: 'MISSING' });
    } else if (vId.includes('K1n0v4') || vId.includes('dummy') || vId.includes('fake') || vId.length !== 11) {
      fakeCount++;
      fakeVids.push({ cat: k, title: s.title, vId });
    }
  }
}

console.log(`Total fake/invalid video IDs found: ${fakeCount}`);
console.log('Sample fake IDs:', fakeVids.slice(0, 30));
