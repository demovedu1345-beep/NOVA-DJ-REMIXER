import { CURATED_CATEGORIES_DB } from '../api/_lib/curated-songs-db.js';
import { getArtistsByLanguage, getArtistProfile } from '../api/_lib/artists-db.js';

// Build pool of authentic Bollywood songs
const bollywoodReplacements = [];
const seenReplacementKeys = new Set();

// 1. From artists-db
const hindiArtists = getArtistsByLanguage('hindi');
for (const a of hindiArtists) {
  const profile = getArtistProfile(a.id);
  if (!profile || !profile.songs) continue;
  for (const s of profile.songs) {
    const vId = s.videoId || s.video_id;
    if (!vId || vId.length !== 11) continue;
    const key = (s.title || '').toLowerCase().trim();
    if (!seenReplacementKeys.has(key)) {
      seenReplacementKeys.add(key);
      bollywoodReplacements.push({
        title: s.title,
        artist: s.artist || profile.name,
        videoId: vId,
        durationSec: s.durationSec || 210,
        entrySec: s.entrySec || 35,
        exitSec: s.exitSec || 75,
        bpm: s.bpm || 115,
        energy: s.energy || 8,
        year: s.year || 2021,
        heat: s.heat || Array.from({ length: 100 }, (_, i) => +(0.5 + 0.4 * Math.sin(i / 10)).toFixed(3))
      });
    }
  }
}

console.log(`Loaded ${bollywoodReplacements.length} replacements from Hindi artists`);

// 2. From known top Bollywood categories (e.g. hindi-dance, hindi-party, hindi-pop clean tracks)
const regionalTitles = new Set();
for (const [k, v] of Object.entries(CURATED_CATEGORIES_DB)) {
  if (v.lang !== 'hindi' && v.lang !== 'english') {
    for (const s of v.songs) regionalTitles.add((s.title || '').toLowerCase().trim());
  }
}

const bollywoodShared = new Set([
  'gallan goodiyaan', 'london thumakda', 'kala chashma', 'morni banke',
  'proper patola', 'laung da lashkara', 'dil chori', 'sauda khara khara',
  'chogada', 'kamariya', 'nagada sang dhol', 'dholida', 'shubhaarambh',
  'udi udi jaye', 'sanedo', 'odhani', 'radhe radhe', 'deva shree ganesha',
  'zingaat', 'ghungroo', 'kamli', 'senorita', 'balma', 'titli', 'love dose',
  'angreji beat', 'dope shope', 'blue eyes', 'sadi gali', 'navrai majhi',
  'ban ja rani', 'suit suit', 'dholi taro dhol baaje', 'badtameez dil', 'balam pichkari'
]);

for (const [k, v] of Object.entries(CURATED_CATEGORIES_DB)) {
  if (v.lang === 'hindi') {
    for (const s of v.songs) {
      const key = (s.title || '').toLowerCase().trim();
      if (seenReplacementKeys.has(key)) continue;
      if (regionalTitles.has(key) && !bollywoodShared.has(key)) continue;
      const vId = s.videoId || s.video_id;
      if (!vId || vId.length !== 11) continue;
      const artistLower = (s.artist || '').toLowerCase();
      if (
        artistLower.includes('sambalpuri') ||
        artistLower.includes('odia') ||
        artistLower.includes('bhojpuri') ||
        artistLower.includes('pawan singh') ||
        artistLower.includes('khesari') ||
        artistLower.includes('avdhoot') ||
        artistLower.includes('atul purohit') ||
        artistLower.includes('humane sagar')
      ) continue;

      seenReplacementKeys.add(key);
      bollywoodReplacements.push({
        title: s.title,
        artist: s.artist,
        videoId: vId,
        durationSec: s.durationSec || 210,
        entrySec: s.entrySec || 35,
        exitSec: s.exitSec || 75,
        bpm: s.bpm || 115,
        energy: s.energy || 8,
        year: s.year || 2020,
        heat: s.heat || Array.from({ length: 100 }, (_, i) => +(0.5 + 0.4 * Math.sin(i / 10)).toFixed(3))
      });
    }
  }
}

console.log(`Total authentic Bollywood replacement pool: ${bollywoodReplacements.length}`);
