import { CURATED_CATEGORIES_DB } from '../api/_lib/curated-songs-db.js';

const regionalCategories = Object.entries(CURATED_CATEGORIES_DB).filter(([k, v]) => v.lang !== 'hindi' && v.lang !== 'english');

// Known regional signatures / keywords that are strictly NOT pure Hindi
const regionalKeywords = [
  'sambalpuri', 'odia', 'bhojpuri', 'khesari', 'pawan singh', 'shilpi raj',
  'akshara singh', 'dinesh lal', 'nirahua', 'marathi', 'avdhoot gupte', 'anand shinde',
  'swapnil bandodkar', 'atul purohit', 'garba', 'gujarati', 'kinjal dave', 'geeta rabari',
  'kannada', 'arjun janya', 'sanjith hegde', 'thaman', 'anirudh', 'kuthu', 'marwadi',
  'rajasthani', 'mame khan', 'chitralekha', 'seema mishra', 'humane sagar', 'babushan',
  'kuldeep manak', 'chamkila', 'sidhu moose', 'amrit maan' // strictly punjabi folk/drill not bollywood
];

// Specific known Odia / Sambalpuri titles
const odiaSpecificTitles = new Set([
  'mor jamna pari', 'sambalpuri dhuku dhuku', 'luku chhuku', 'lali lali phula',
  'a mor sona', 'chheli chara toka', 'chal tike prema kariba', 'rourkela wali',
  'tor mor jodi', 'jui phula', 'kani phula', 'tu mora dil ki dhadkan', 'mu eka tumara',
  'pua mora bhola shankara hit', 'suna panjuri golden hit', 'he phalguna tume',
  'mayabini', 'dahanijhia', 'hai re hai toh premara rangoli', 'gharana jhia',
  'golapi golapi', 'rangabati', 'aa phaguna', 'to bina mane pade'
]);

// Build set of all regional song titles from regional categories
const regionalTitlesMap = new Map();
for (const [slug, cat] of regionalCategories) {
  for (const s of cat.songs) {
    const key = (s.title || '').toLowerCase().trim();
    if (!regionalTitlesMap.has(key)) regionalTitlesMap.set(key, []);
    regionalTitlesMap.get(key).push({ slug, lang: cat.lang, title: s.title, artist: s.artist, videoId: s.videoId });
  }
}

const hindiCategories = Object.entries(CURATED_CATEGORIES_DB).filter(([k, v]) => v.lang === 'hindi');

console.log(`Checking ${hindiCategories.length} Hindi categories...`);

const results = {};
let grandTotal = 0;

for (const [slug, cat] of hindiCategories) {
  const badSongs = [];
  for (let i = 0; i < cat.songs.length; i++) {
    const s = cat.songs[i];
    const titleLower = (s.title || '').toLowerCase().trim();
    const artistLower = (s.artist || '').toLowerCase();

    let reason = null;
    if (odiaSpecificTitles.has(titleLower)) {
      reason = 'SPECIFIC_ODIA_TITLE';
    } else if (regionalTitlesMap.has(titleLower)) {
      const matches = regionalTitlesMap.get(titleLower);
      // If it's a known Bollywood song that happened to be in regional, ignore Bollywood exceptions
      const isBollywoodShared = [
        'gallan goodiyaan', 'london thumakda', 'kala chashma', 'morni banke',
        'proper patola', 'laung da lashkara', 'dil chori', 'sauda khara khara',
        'chogada', 'kamariya', 'nagada sang dhol', 'dholida', 'shubhaarambh',
        'udi udi jaye', 'sanedo', 'odhani', 'radhe radhe', 'deva shree ganesha',
        'zingaat', 'ghungroo', 'kamli', 'senorita', 'balma', 'titli', 'love dose',
        'angreji beat', 'dope shope', 'blue eyes', 'sadi gali', 'navrai majhi',
        'ban ja rani', 'suit suit', 'dholi taro dhol baaje'
      ].includes(titleLower);

      if (!isBollywoodShared) {
        reason = `MATCHES_REGIONAL_CATEGORY (${matches.map(m => m.slug).join(', ')})`;
      }
    } else {
      // Check keywords
      for (const kw of regionalKeywords) {
        if (titleLower.includes(kw) || artistLower.includes(kw)) {
          // Verify not bollywood
          if (!['badshah', 'neha kakkar', 'yo yo honey singh', 'arijit singh'].some(b => artistLower.includes(b))) {
            reason = `REGIONAL_KEYWORD (${kw})`;
            break;
          }
        }
      }
    }

    if (reason) {
      badSongs.push({ index: i, song: s, reason });
    }
  }

  if (badSongs.length > 0) {
    results[slug] = badSongs;
    grandTotal += badSongs.length;
    console.log(`[${slug}] has ${badSongs.length} non-Hindi songs:`);
    for (const b of badSongs.slice(0, 8)) {
      console.log(`   - "${b.song.title}" by ${b.song.artist} -> ${b.reason}`);
    }
    if (badSongs.length > 8) console.log(`   ... and ${badSongs.length - 8} more`);
  }
}

console.log(`\n========================================`);
console.log(`GRAND TOTAL CONTAMINATED SONGS TO PURGE: ${grandTotal}`);
console.log(`========================================`);
