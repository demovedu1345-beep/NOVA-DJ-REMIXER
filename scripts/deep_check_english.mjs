import { CURATED_CATEGORIES_DB } from '../api/_lib/curated-songs-db.js';

// We want to detect any song in an English category whose artist is Indian or regional
const allEnglishSongs = [];
for (const [slug, cat] of Object.entries(CURATED_CATEGORIES_DB)) {
  if (cat.lang === 'english' || slug.startsWith('english')) {
    for (const s of cat.songs || []) {
      allEnglishSongs.push({ cat: slug, ...s });
    }
  }
}

console.log(`Total English songs: ${allEnglishSongs.length}`);

// Let's check for any characters or words that indicate Indian / Hindi songs
const hindiWords = [
  'dil', 'pyar', 'ishq', 'tere', 'mere', 'tum', 'hum', 'zindagi', 'naina', 'deewani', 'channa',
  'nach', 'dhol', 'bhangra', 'shava', 'kudi', 'munda', 'jatt', 'yaar', 'soch', 'qismat',
  'saajan', 'hast', 'milap', 'garba', 'dandiya', 'appu', 'sambalpuri', 'odia', 'marathi',
  'pori', 'jhia', 'badmas', 'odisha', 'kuthu', 'marwadi', 'geet', 'bhajan', 'aarti',
  'kannada', 'tamil', 'telugu', 'bhojpuri', 'haryanvi'
];

const flagged = [];
for (const s of allEnglishSongs) {
  const words = `${s.title} ${s.artist}`.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/);
  for (const w of words) {
    if (hindiWords.includes(w)) {
      flagged.push({ cat: s.cat, id: s.id, title: s.title, artist: s.artist, word: w });
      break;
    }
  }
}

console.log(`Flagged songs count: ${flagged.length}`);
const uniqueFlagged = {};
for (const f of flagged) {
  uniqueFlagged[`${f.title} by ${f.artist}`] = f;
}
console.log('Unique flagged tracks:');
for (const [key, f] of Object.entries(uniqueFlagged)) {
  console.log(`  - "${f.title}" by ${f.artist} (word: ${f.word}, in: ${f.cat})`);
}
