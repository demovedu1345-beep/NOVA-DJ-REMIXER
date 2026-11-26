import { CURATED_CATEGORIES_DB } from '../api/_lib/curated-songs-db.js';

// Trace which categories are matching for subtypes: ['rock'], languages: ['english']
const requestedSubtypes = ['rock'];
const requestedLangs = ['english'];

function slugMatchesSubtype(slug, subtype, requestedLangs = []) {
  const isFull = subtype.includes(':');
  const [lang, bareSub] = isFull ? subtype.split(':') : [null, subtype];
  const s = slug.toLowerCase();
  const b = (bareSub || subtype).toLowerCase();

  if (lang === 'hindi') {
    if (s === `hindi-${b}` || (b === 'diwali' && s === 'diwali-party-songs')) return true;
    return false;
  }
  if (lang === 'english') {
    if (s === `english-${b}` || (b === 'rock' && (s === 'english-rock' || s === 'english-classicrock'))) return true;
    return false;
  }

  // If requested languages filter is active, respect it
  if (requestedLangs && requestedLangs.length > 0) {
    const onlyEnglish = requestedLangs.includes('english') && !requestedLangs.includes('hindi') && !requestedLangs.includes('language');
    const onlyHindi = requestedLangs.includes('hindi') && !requestedLangs.includes('english') && !requestedLangs.includes('language') && !requestedLangs.includes('odia') && !requestedLangs.includes('south') && !requestedLangs.includes('punjabi');
    if (onlyEnglish && !s.startsWith('english')) return false;
    if (onlyHindi && (s.startsWith('english') || s.startsWith('odia') || s.startsWith('punjabi') || s.startsWith('tamil-telugu') || s.startsWith('kannada') || s.startsWith('marathi') || s.startsWith('gujarati') || s.startsWith('marwadi') || s.startsWith('haryanvi-bhojpuri'))) return false;
  }

  // Bare subtype matches
  if (s === b || s === `hindi-${b}` || s === `english-${b}`) return true;
  if (b === 'rock' && (s === 'english-rock' || s === 'english-classicrock')) return true;

  return s.endsWith(`-${b}`) || s === b;
}

const matchingCategories = [];
for (const cat of Object.values(CURATED_CATEGORIES_DB)) {
  if (slugMatchesSubtype(cat.slug, 'rock', requestedLangs)) {
    matchingCategories.push(cat.slug);
  }
}

console.log('Categories matching rock:', matchingCategories);

for (const slug of matchingCategories) {
  const cat = CURATED_CATEGORIES_DB[slug];
  const drakeSongs = cat.songs.filter(s => (s.artist || '').includes('Drake') || (s.title || '').includes('Started From The Bottom'));
  console.log(`In ${slug}: found ${drakeSongs.length} Drake songs!`);
}
