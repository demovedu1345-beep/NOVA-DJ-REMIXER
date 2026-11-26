import fs from 'fs';
import path from 'path';

const repoRoot = 'C:/Users/itzra/.gemini/antigravity/scratch/NOVA-DJ-REMIXER';
const files = [
  path.join(repoRoot, 'api/_lib/artists-db.js'),
  path.join(repoRoot, 'public/js/engine/artists-db.js')
];

const helperCode = `
export function getArtistsByLanguage(lang = 'hindi', subcategory = 'all') {
  const normLang = (lang || 'hindi').toLowerCase();
  const pool = ARTISTS_DB[normLang] || (normLang === 'english' ? ARTISTS_DB.english : ARTISTS_DB.hindi) || {};
  const list = Object.values(pool);

  if (!subcategory || subcategory === 'all') {
    return list;
  }
  const normSub = subcategory.toLowerCase();
  return list.filter(a => Array.isArray(a.subcategories) && a.subcategories.includes(normSub));
}

export function getArtistProfile(artistId, lang = 'hindi') {
  if (!artistId) return null;
  const normId = String(artistId).toLowerCase().trim();
  const normLang = (lang || 'hindi').toLowerCase();

  const primaryPool = ARTISTS_DB[normLang] || {};
  if (primaryPool[normId]) return primaryPool[normId];

  for (const a of Object.values(primaryPool)) {
    if (a.id.toLowerCase() === normId || a.name.toLowerCase() === normId) return a;
    if (Array.isArray(a.altNames) && a.altNames.some(alt => alt.toLowerCase() === normId)) return a;
  }

  for (const pool of Object.values(ARTISTS_DB)) {
    if (pool[normId]) return pool[normId];
    for (const a of Object.values(pool)) {
      if (a.id.toLowerCase() === normId || a.name.toLowerCase() === normId) return a;
      if (Array.isArray(a.altNames) && a.altNames.some(alt => alt.toLowerCase() === normId)) return a;
    }
  }

  return null;
}
`;

for (const fp of files) {
  let content = fs.readFileSync(fp, 'utf-8');
  if (!content.includes('export function getArtistsByLanguage')) {
    content += helperCode;
    fs.writeFileSync(fp, content, 'utf-8');
    console.log(`Appended helpers to ${fp}`);
  } else {
    console.log(`Helpers already present in ${fp}`);
  }
}
