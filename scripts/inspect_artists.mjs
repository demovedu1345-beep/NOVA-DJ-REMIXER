import { ARTISTS_DB } from '../api/_lib/artists-db.js';

console.log('Total artists in ARTISTS_DB:', Object.keys(ARTISTS_DB).length);

const byLang = {};
for (const [id, a] of Object.entries(ARTISTS_DB)) {
  const lang = a.lang || 'unknown';
  byLang[lang] = (byLang[lang] || 0) + 1;
}

console.log('Artists by language:', byLang);

for (const [id, a] of Object.entries(ARTISTS_DB)) {
  console.log(`- [${a.lang}] ${a.name} (${a.songs?.length || 0} songs)`);
}
