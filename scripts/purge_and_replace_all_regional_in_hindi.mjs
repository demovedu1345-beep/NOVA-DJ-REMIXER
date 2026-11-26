import fs from 'fs';
import path from 'path';
import { CURATED_CATEGORIES_DB } from '../api/_lib/curated-songs-db.js';
import { getArtistsByLanguage, getArtistProfile } from '../api/_lib/artists-db.js';

// 1. Build authentic Bollywood replacement pool
const bollywoodPool = [];
const seenReplacementKeys = new Set();

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
      bollywoodPool.push({
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

// Additional clean Bollywood tracks from clean Hindi categories
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
      const a = (s.artist || '').toLowerCase();
      if (
        a.includes('sambalpuri') || a.includes('odia') || a.includes('bhojpuri') ||
        a.includes('pawan singh') || a.includes('khesari') || a.includes('avdhoot') ||
        a.includes('atul purohit') || a.includes('humane sagar')
      ) continue;

      seenReplacementKeys.add(key);
      bollywoodPool.push({
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

console.log(`Ready with ${bollywoodPool.length} authentic Bollywood replacement songs.`);

// 2. Identify regional contaminants
const bollywoodWhitelist = new Set([
  'kesariya', 'ranjha', 'pachtaoge', 'teri mitti', 'guzarish', 'naina',
  'saturday saturday', 'tere bina', 'journey song', 'not ramaiya vastavaiya',
  'zinda banda', 'judaai', 'filhall', 'filhaal 2 mohabbat', 'mann bharryaa 2.0',
  'dil tod ke', 'aadat', 'baarish ki jaaye', 'qismat 2 sad theme', 'tauba tauba',
  'nachde ne saare', 'baari barsi', 'jee karda', 'gallan goodiyaan', 'london thumakda',
  'kala chashma', 'morni banke', 'proper patola', 'laung da lashkara', 'dil chori',
  'sauda khara khara', 'chogada', 'kamariya', 'nagada sang dhol', 'dholida',
  'shubhaarambh', 'udi udi jaye', 'sanedo', 'odhani', 'radhe radhe', 'deva shree ganesha',
  'zingaat', 'ghungroo', 'kamli', 'senorita', 'balma', 'titli', 'love dose',
  'angreji beat', 'dope shope', 'blue eyes', 'sadi gali', 'navrai majhi',
  'ban ja rani', 'suit suit', 'dholi taro dhol baaje', 'badtameez dil', 'balam pichkari',
  'pagal', 'bandook', 'antidote', 'fate', 'desi kalakaar', 'goat', 'nit khair manga',
  'sanu ek pal chain', 'ishq tera tadpave (oh ho ho ho)', 'aayi nai', 'jhume re gori',
  'trending nakhra', 'white brown black', 'chitta kurta'
]);

function isContaminant(song) {
  const t = (song.title || '').toLowerCase().trim();
  const a = (song.artist || '').toLowerCase().trim();

  if (bollywoodWhitelist.has(t)) return false;

  // Odia / Sambalpuri
  if (
    t.includes('sambalpuri') || t.includes('odia') || a.includes('sambalpuri') || a.includes('odia') ||
    a.includes('humane sagar') || a.includes('chitta jena') || a.includes('sabyasachi') ||
    t.includes('mor jamna') || t.includes('luku chhuku') || t.includes('lali lali') ||
    t.includes('a mor sona') || t.includes('chheli chara') || t.includes('chal tike prema') ||
    t.includes('rourkela') || t.includes('tor mor jodi') || t.includes('jui phula') ||
    t.includes('kani phula') || t.includes('tu mora dil') || t.includes('mu eka') ||
    t.includes('pua mora') || t.includes('suna panjuri') || t.includes('he phalguna') ||
    t.includes('mayabini') || t.includes('dahanijhia') || t.includes('rangoli') ||
    t.includes('gharana jhia') || t.includes('golapi golapi') || t.includes('rangabati') ||
    t.includes('aa phaguna') || t.includes('to bina mane') || t.includes('disco night')
  ) {
    return true;
  }

  // Bhojpuri non-Bollywood
  if (
    a.includes('pawan singh') || a.includes('khesari') || a.includes('shilpi raj') ||
    a.includes('nirahua') || a.includes('dinesh lal') || a.includes('akshara singh') ||
    t.includes('lollypop lagelu') || t.includes('raate diya butake') || t.includes('marad abhi') ||
    t.includes('chhalakata hamro') || t.includes('chhatiya se')
  ) {
    return true;
  }

  // Marathi non-Bollywood
  if (
    a.includes('avdhoot gupte') || a.includes('anand shinde') || a.includes('swapnil bandodkar') ||
    a.includes('sanjay londhe') || a.includes('rege') ||
    t.includes('shitti vajali') || t.includes('vaat majhi baghtoy') || t.includes('dolby walya') ||
    t.includes('shantabai') || t.includes('aga aga pori')
  ) {
    return true;
  }

  // Gujarati Garba non-Bollywood
  if (
    a.includes('atul purohit') || a.includes('kinjal dave') || a.includes('geeta rabari') ||
    t.includes('pankhida tu udi') || t.includes('maa pavate thi') || t.includes('sona no garbo') ||
    t.includes('hu to gai ti mele') || t.includes('radha dhundh rahi') || t.includes('odhaji mara') ||
    t.includes('kumkum na pagla') || t.includes('he karuna na') || t.includes('saybo re govaliyo') ||
    t.includes('maru man mohi') || t.includes('aso sud ekam')
  ) {
    return true;
  }

  // South (Telugu/Tamil/Kannada) non-Bollywood
  if (
    t.includes('jai balayya') || t.includes('maa bava manobhavalu') || t.includes('feelingu roberrt') ||
    t.includes('sittharala sirapadu') || t.includes('kurchi madathapetti') || t.includes('ordinary person') ||
    a.includes('arjun janya') || (a.includes('thaman') && !t.includes('bollywood')) ||
    t.includes('the theri theme') || t.includes('sword of destiny') || t.includes('bad eyes villain') ||
    t.includes('jithu theme') || t.includes('rolex theme') || t.includes('muthuvel pandian') ||
    t.includes('jd intro theme')
  ) {
    return true;
  }

  // Rajasthani / Marwadi non-Bollywood
  if (
    t.includes('banna re') || t.includes('banna thari') || t.includes('cham cham chamke chunri') ||
    a.includes('chitralekha sen') || a.includes('seema mishra')
  ) {
    return true;
  }

  return false;
}

// 3. Perform replacements across all Hindi categories
let totalReplaced = 0;
let replacementIndex = 0;

for (const [slug, cat] of Object.entries(CURATED_CATEGORIES_DB)) {
  if (cat.lang !== 'hindi') continue;

  const currentTitles = new Set(cat.songs.map(s => (s.title || '').toLowerCase().trim()));

  for (let i = 0; i < cat.songs.length; i++) {
    const s = cat.songs[i];
    if (isContaminant(s)) {
      // Find replacement not already in this category
      let replacement = null;
      let attempts = 0;
      while (attempts < bollywoodPool.length) {
        const candidate = bollywoodPool[replacementIndex % bollywoodPool.length];
        replacementIndex++;
        attempts++;
        const candidateKey = candidate.title.toLowerCase().trim();
        if (!currentTitles.has(candidateKey)) {
          replacement = candidate;
          currentTitles.add(candidateKey);
          break;
        }
      }

      if (replacement) {
        cat.songs[i] = {
          id: `${slug}-${i + 1}`,
          title: replacement.title,
          artist: replacement.artist,
          videoId: replacement.videoId,
          durationSec: replacement.durationSec,
          entrySec: replacement.entrySec,
          exitSec: replacement.exitSec,
          bpm: replacement.bpm,
          energy: replacement.energy,
          year: replacement.year,
          heat: replacement.heat
        };
        totalReplaced++;
      }
    }
  }
  cat.songCount = cat.songs.length;
}

console.log(`Successfully replaced ${totalReplaced} regional songs in Hindi categories with authentic Bollywood hits!`);

// 4. Serialize and write back to both files
const serialized = `export const CURATED_CATEGORIES_DB = ${JSON.stringify(CURATED_CATEGORIES_DB, null, 2)};\n`;

fs.writeFileSync(path.resolve('./api/_lib/curated-songs-db.js'), serialized, 'utf8');
fs.writeFileSync(path.resolve('./public/js/engine/curated-songs-db.js'), serialized, 'utf8');

console.log('Successfully wrote clean CURATED_CATEGORIES_DB to:');
console.log('  1. api/_lib/curated-songs-db.js');
console.log('  2. public/js/engine/curated-songs-db.js');
