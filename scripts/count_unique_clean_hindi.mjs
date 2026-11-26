import { CURATED_CATEGORIES_DB } from '../api/_lib/curated-songs-db.js';

// Get all songs from purely Hindi categories that are NOT in regional categories
const regionalCats = Object.entries(CURATED_CATEGORIES_DB).filter(([k, v]) => v.lang !== 'hindi' && v.lang !== 'english');
const regionalTitles = new Set();
for (const [k, v] of regionalCats) {
  for (const s of v.songs) {
    regionalTitles.add((s.title || '').toLowerCase().trim());
  }
}

// Exception list of legitimate Bollywood songs that appear in regional categories
const bollywoodShared = new Set([
  'gallan goodiyaan', 'london thumakda', 'kala chashma', 'morni banke',
  'proper patola', 'laung da lashkara', 'dil chori', 'sauda khara khara',
  'chogada', 'kamariya', 'nagada sang dhol', 'dholida', 'shubhaarambh',
  'udi udi jaye', 'sanedo', 'odhani', 'radhe radhe', 'deva shree ganesha',
  'zingaat', 'ghungroo', 'kamli', 'senorita', 'balma', 'titli', 'love dose',
  'angreji beat', 'dope shope', 'blue eyes', 'sadi gali', 'navrai majhi',
  'ban ja rani', 'suit suit', 'dholi taro dhol baaje', 'badtameez dil', 'balam pichkari'
]);

const cleanHindiPool = new Map();
const hindiCats = Object.entries(CURATED_CATEGORIES_DB).filter(([k, v]) => v.lang === 'hindi');

for (const [k, v] of hindiCats) {
  for (const s of v.songs) {
    const titleKey = (s.title || '').toLowerCase().trim();
    if (regionalTitles.has(titleKey) && !bollywoodShared.has(titleKey)) {
      continue; // skip regional
    }
    const artistLower = (s.artist || '').toLowerCase();
    if (
      titleLowerHasRegional(titleKey) ||
      artistLower.includes('sambalpuri') ||
      artistLower.includes('pawan singh') ||
      artistLower.includes('khesari') ||
      artistLower.includes('avdhoot') ||
      artistLower.includes('anand shinde') ||
      artistLower.includes('atul purohit') ||
      artistLower.includes('arjun janya') ||
      artistLower.includes('humane sagar') ||
      artistLower.includes('odia') ||
      artistLower.includes('bhojpuri')
    ) {
      continue;
    }

    if (!cleanHindiPool.has(titleKey) && s.videoId && s.videoId.length === 11) {
      cleanHindiPool.set(titleKey, s);
    }
  }
}

function titleLowerHasRegional(t) {
  return [
    'sambalpuri', 'odia', 'bhojpuri', 'marathi', 'garba', 'gujarati', 'kannada',
    'marwadi', 'rajasthani', 'telugu', 'tamil', 'kuthu', 'mor jamna', 'luku chhuku',
    'lali lali', 'a mor sona', 'chheli chara', 'rourkela', 'tor mor', 'jui phula',
    'kani phula', 'tu mora dil', 'mu eka', 'pua mora', 'suna panjuri', 'he phalguna'
  ].some(kw => t.includes(kw));
}

console.log(`Clean verified Hindi Bollywood pool size: ${cleanHindiPool.size}`);
