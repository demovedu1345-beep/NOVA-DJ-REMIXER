import { CURATED_CATEGORIES_DB } from '../api/_lib/curated-songs-db.js';

console.log('Total categories in CURATED_CATEGORIES_DB:', Object.keys(CURATED_CATEGORIES_DB).length);

const indianTerms = [
  'sambalpuri', 'appu', 'puneeth', 'devi sri', 'kumar sanu', 'arijit', 'badshah', 
  'geet', 'nacho', 'desi', 'dhol', 'garba', 'bhangra', 'punjabi', 'bollywood',
  'hindi', 'tamil', 'telugu', 'kannada', 'malayalam', 'marathi', 'gujarati', 'odia',
  'shreya', 'sonu nigam', 'kishore', 'lata', 'rafi', 'mukesh', 'asha bhosle', 'alka yagnik',
  'udit narayan', 'atif aslam', 'pritam', 'armaan malik', 'jubin nautiyal', 'neha kakkar',
  'diljit', 'karan aujla', 'sidhu moose', 'ap dhillon', 'divine', 'mc stan', 'honey singh',
  'amit trivedi', 'vishal-shekhar', 'sachin-jigar', 'shankar-ehsaan-loy'
];

let totalMismatched = 0;

for (const [slug, cat] of Object.entries(CURATED_CATEGORIES_DB)) {
  const isEnglish = cat.lang === 'english' || slug.startsWith('english');
  const songs = cat.songs || [];
  
  if (isEnglish) {
    const badSongs = [];
    for (const s of songs) {
      const full = `${s.title} ${s.artist}`.toLowerCase();
      for (const t of indianTerms) {
        if (full.includes(t)) {
          badSongs.push({ id: s.id, title: s.title, artist: s.artist, term: t });
          break;
        }
      }
    }
    if (badSongs.length > 0) {
      console.log(`❌ ${slug} (${cat.label}) has ${badSongs.length} Indian tracks! (Total songs: ${songs.length})`);
      totalMismatched += badSongs.length;
      for (const b of badSongs.slice(0, 5)) {
        console.log(`     - [${b.id}] "${b.title}" by ${b.artist} (matched: ${b.term})`);
      }
    } else {
      console.log(`✓ ${slug} (${cat.label}): ${songs.length} songs, 100% clean`);
    }
  }
}

console.log('\nTOTAL INDIAN TRACKS IN ENGLISH CATEGORIES:', totalMismatched);
