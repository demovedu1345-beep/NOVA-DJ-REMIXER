import fs from 'fs';

const API_DB_PATH = 'api/_lib/curated-songs-db.js';
const PUBLIC_DB_PATH = 'public/js/engine/curated-songs-db.js';

const apiText = fs.readFileSync(API_DB_PATH, 'utf8');
const prefix = 'export const CURATED_CATEGORIES_DB = ';
const cdb = JSON.parse(apiText.slice(prefix.length).trim().replace(/;$/, ''));

const badPartyInSpecificGenres = new Set([
  'character dheela 2.0', 'character dheela', 'twist', 'twist kamariya',
  'gallan goodiyaan', 'london thumakda', 'zingaat', 'chogada', 'nagada sang dhol',
  'sauda khara khara', 'dholida', 'sweety tera drama', 'kamariya', 'shubhaarambh',
  'sanedo', 'odhani', 'dil chori', 'chhote chhote peg', 'bom diggy diggy', 'morni banke',
  'kar gayi chull', 'let\'s nacho', 'saturday saturday', 'the humma song', 'tammatamma again',
  'kala chashma', 'suit suit', 'cheez badi', 'koka', 'proper patola', 'abhi toh party shuru hui hai',
  'sheila ki jawani', 'munni badnaam', 'subah hone na de', 'hookah bar', 'lungi dance',
  'aankh marey', 'makhna', 'dheeme dheeme', 'ghungroo', 'jai jai shivshankar', 'burjkhalifa'
]);

for (const catKey of ['hindi-romantic', 'hindi-retro', 'hindi-folk', 'hindi-devotional', 'hindi-classical', 'hindi-ghazal', 'hindi-sufi']) {
  const cat = cdb[catKey];
  if (!cat) continue;
  const before = cat.songs.length;
  cat.songs = cat.songs.filter(s => {
    const t = (s.title || '').toLowerCase().trim();
    return !badPartyInSpecificGenres.has(t);
  });
  console.log(`Cleaned ${catKey}: ${before} -> ${cat.songs.length}`);
}

const outputText = 'export const CURATED_CATEGORIES_DB = ' + JSON.stringify(cdb, null, 2) + ';\n';
fs.writeFileSync(API_DB_PATH, outputText, 'utf8');
fs.writeFileSync(PUBLIC_DB_PATH, outputText, 'utf8');

console.log('Specific genres purified successfully.');
