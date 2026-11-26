import { CURATED_CATEGORIES_DB } from '../api/_lib/curated-songs-db.js';

const categoryEntries = Object.entries(CURATED_CATEGORIES_DB);
console.log('Total categories:', categoryEntries.length);

const regionalCategories = categoryEntries.filter(([slug, cat]) => cat.lang !== 'hindi' && cat.lang !== 'english');
console.log('Regional categories:', regionalCategories.map(([slug, c]) => `${slug} (${c.lang}): ${c.songs.length}`));

// Collect all titles from regional categories
const regionalMap = new Map(); // title.toLowerCase() -> list of { slug, lang, title, artist, video_id }
for (const [slug, rc] of regionalCategories) {
  for (const s of rc.songs) {
    const key = s.title.toLowerCase().trim();
    if (!regionalMap.has(key)) regionalMap.set(key, []);
    regionalMap.get(key).push({ slug, lang: rc.lang, title: s.title, artist: s.artist, video_id: s.video_id });
  }
}

console.log(`\nUnique regional songs in DB: ${regionalMap.size}`);

// Check which Hindi categories have regional songs
let totalHindiContaminated = 0;
const hindiCategories = categoryEntries.filter(([slug, cat]) => cat.lang === 'hindi');
console.log(`Total Hindi categories: ${hindiCategories.length}`);

for (const [slug, hc] of hindiCategories) {
  const contaminated = [];
  for (const s of hc.songs) {
    const key = s.title.toLowerCase().trim();
    if (regionalMap.has(key)) {
      contaminated.push({ song: s, regions: regionalMap.get(key) });
    }
  }
  if (contaminated.length > 0) {
    totalHindiContaminated += contaminated.length;
    console.log(`\nHindi Category [${slug}] has ${contaminated.length} REGIONAL songs:`);
    for (const item of contaminated) {
      console.log(`  - "${item.song.title}" by ${item.song.artist} (matches: ${item.regions.map(r => r.slug).join(', ')})`);
    }
  }
}

console.log(`\n========================================`);
console.log(`TOTAL REGIONAL SONGS IN HINDI CATEGORIES: ${totalHindiContaminated}`);
console.log(`========================================\n`);
