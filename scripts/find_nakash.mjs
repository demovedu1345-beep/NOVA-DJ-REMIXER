import { CURATED_CATEGORIES_DB } from '../api/_lib/curated-songs-db.js';

for (const [slug, cat] of Object.entries(CURATED_CATEGORIES_DB)) {
  if (slug.startsWith('english') || cat.lang === 'english') {
    for (const s of cat.songs || []) {
      const full = `${s.title} ${s.artist}`.toLowerCase();
      if (full.includes('nakash') || full.includes('arjun janya') || full.includes('aziz') || full.includes('janya')) {
        console.log(`Found in ${slug}: "${s.title}" by ${s.artist} (id: ${s.id})`);
      }
    }
  }
}
