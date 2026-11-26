import { CURATED_CATEGORIES_DB } from '../api/_lib/curated-songs-db.js';

const indianTerms = [
  'sambalpuri', 'appu', 'puneeth', 'devi sri', 'kumar sanu', 'arijit', 'badshah', 
  'geet', 'nacho', 'desi', 'dhol', 'garba', 'bhangra', 'punjabi', 'bollywood',
  'hindi', 'tamil', 'telugu', 'kannada', 'malayalam', 'marathi', 'gujarati', 'odia',
  'shreya', 'sonu nigam', 'kishore', 'lata', 'rafi', 'mukesh', 'asha bhosle', 'alka yagnik',
  'udit narayan', 'atif aslam', 'pritam', 'armaan malik', 'jubin nautiyal', 'neha kakkar',
  'diljit', 'karan aujla', 'sidhu moose', 'ap dhillon', 'divine', 'mc stan', 'honey singh',
  'amit trivedi', 'vishal-shekhar', 'sachin-jigar', 'shankar-ehsaan-loy', 'himesh', 'yo yo',
  'b praak', 'jaani', 'jasleen', 'anuradha', 'sadhana', 'kumar'
];

const badSongsList = [];

for (const [slug, cat] of Object.entries(CURATED_CATEGORIES_DB)) {
  if (cat.lang === 'english' || slug.startsWith('english')) {
    for (const s of cat.songs || []) {
      const full = `${s.title} ${s.artist}`.toLowerCase();
      for (const t of indianTerms) {
        if (full.includes(t)) {
          badSongsList.push({ cat: slug, id: s.id, title: s.title, artist: s.artist, term: t });
          break;
        }
      }
    }
  }
}

console.log('Total bad songs found:', badSongsList.length);
// Group by title to see the recurring culprits
const titleCounts = {};
for (const b of badSongsList) {
  titleCounts[`"${b.title}" by ${b.artist}`] = (titleCounts[`"${b.title}" by ${b.artist}`] || 0) + 1;
}
console.log('Unique culprit titles and their frequencies:');
for (const [t, c] of Object.entries(titleCounts)) {
  console.log(`  [${c}x] ${t}`);
}
