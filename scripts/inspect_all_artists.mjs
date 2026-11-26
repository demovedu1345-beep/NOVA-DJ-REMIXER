import { ARTISTS_DB, HINDI_ARTIST_SUBCATEGORIES, ENGLISH_ARTIST_SUBCATEGORIES } from '../api/_lib/artists-db.js';

console.log('Hindi artists:', Object.keys(ARTISTS_DB.hindi || {}));
console.log('English artists:', Object.keys(ARTISTS_DB.english || {}));

console.log('\nHindi Subcategories:', HINDI_ARTIST_SUBCATEGORIES.map(s => s.id));
console.log('English Subcategories:', ENGLISH_ARTIST_SUBCATEGORIES.map(s => s.id));

console.log('\n--- Hindi Artists Details ---');
for (const [id, a] of Object.entries(ARTISTS_DB.hindi || {})) {
  console.log(`  - ${a.name} (${id}): ${a.songs?.length || 0} songs, tags: ${a.subcategories?.join(', ')}`);
}

console.log('\n--- English Artists Details ---');
for (const [id, a] of Object.entries(ARTISTS_DB.english || {})) {
  console.log(`  - ${a.name} (${id}): ${a.songs?.length || 0} songs, tags: ${a.subcategories?.join(', ')}`);
}
