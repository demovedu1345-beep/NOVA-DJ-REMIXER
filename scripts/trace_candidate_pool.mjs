import { CURATED_CATEGORIES_DB } from '../api/_lib/curated-songs-db.js';

function slugMatchesSubtype(slug, subtype) {
  const isFull = subtype.includes(':');
  const [lang, bareSub] = isFull ? subtype.split(':') : [null, subtype];
  const s = slug.toLowerCase();
  const b = (bareSub || subtype).toLowerCase();

  if (lang === 'language') {
    if (b === 'punjabi') return s.startsWith('punjabi');
    if (b === 'marathi') return s.startsWith('marathi');
    if (b === 'gujarati') return s.startsWith('gujarati');
    if (b === 'tamil-telugu') return s.startsWith('tamil-telugu');
    if (b === 'kannada') return s.startsWith('kannada');
    if (b === 'marwadi') return s.startsWith('marwadi');
    if (b === 'odia') return s.startsWith('odia');
    if (b === 'haryanvi-bhojpuri' || b === 'bhojpuri-haryanvi') return s.startsWith('haryanvi-bhojpuri');
  }

  // Exact matching for language-prefixed slugs
  if (lang === 'hindi') {
    if (s === `hindi-${b}`) return true;
    if (b === 'diwali' && s === 'diwali-party-songs') return true;
  }
  if (lang === 'english') {
    if (s === `english-${b}`) return true;
  }

  // Bare subtype matches
  if (s === b || s === `hindi-${b}` || s === `english-${b}`) return true;
  if (b === 'diwali' && s === 'diwali-party-songs') return true;
  if (b === 'party' && (s === 'punjabi-party' || s === 'haryanvi-bhojpuri-party' || s === 'marathi-party')) return true;
  if (b === 'wedding' && s === 'punjabi-wedding') return true;
  if (b === 'sad' && s === 'punjabi-sad') return true;
  if (b === 'gym' && s === 'punjabi-gym') return true;
  if (b === 'garba' && s === 'gujarati-garba') return true;
  if (b === 'kuthu' && s === 'tamil-telugu-kuthu') return true;
  if (b === 'mass' && s === 'tamil-telugu-mass') return true;
  if (b === 'desi-beats' && s === 'haryanvi-bhojpuri-desi-beats') return true;

  return s.includes(b);
}

const allCategories = Object.values(CURATED_CATEGORIES_DB);
const matched = [];
for (const cat of allCategories) {
  if (slugMatchesSubtype(cat.slug, 'english:rock')) {
    matched.push(cat.slug);
  }
}
console.log('Categories matching english:rock:', matched);
