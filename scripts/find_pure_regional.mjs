import { CURATED_CATEGORIES_DB } from '../api/_lib/curated-songs-db.js';

// Load all regional categories
const regionalCategories = ['odia-hits', 'marathi-party', 'gujarati-garba', 'tamil-telugu-kuthu', 'tamil-telugu-mass', 'haryanvi-bhojpuri-party', 'haryanvi-bhojpuri-desi-beats', 'marwadi-rajasthani', 'kannada-hits'];

// Songs that are definitely Bollywood / Hindi films (DO NOT PURGE)
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

const pureRegionalFoundInHindi = [];

for (const [slug, cat] of Object.entries(CURATED_CATEGORIES_DB)) {
  if (cat.lang !== 'hindi') continue;

  for (let i = 0; i < cat.songs.length; i++) {
    const s = cat.songs[i];
    const t = (s.title || '').toLowerCase().trim();
    const a = (s.artist || '').toLowerCase().trim();

    if (bollywoodWhitelist.has(t)) continue;

    let isRegional = false;
    let reason = '';

    // Check Odia
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
      isRegional = true;
      reason = 'ODIA / SAMBALPURI';
    }
    // Check Bhojpuri / Haryanvi non-Bollywood
    else if (
      a.includes('pawan singh') || a.includes('khesari') || a.includes('shilpi raj') ||
      a.includes('nirahua') || a.includes('dinesh lal') || a.includes('akshara singh') ||
      t.includes('lollypop lagelu') || t.includes('raate diya butake') || t.includes('marad abhi') ||
      t.includes('chhalakata hamro') || t.includes('chhatiya se')
    ) {
      isRegional = true;
      reason = 'BHOJPURI';
    }
    // Check Marathi non-Bollywood
    else if (
      a.includes('avdhoot gupte') || a.includes('anand shinde') || a.includes('swapnil bandodkar') ||
      a.includes('sanjay londhe') || a.includes('rege') ||
      t.includes('shitti vajali') || t.includes('vaat majhi baghtoy') || t.includes('dolby walya') ||
      t.includes('shantabai') || t.includes('aga aga pori')
    ) {
      isRegional = true;
      reason = 'MARATHI';
    }
    // Check Gujarati Garba non-Bollywood
    else if (
      a.includes('atul purohit') || a.includes('kinjal dave') || a.includes('geeta rabari') ||
      t.includes('pankhida tu udi') || t.includes('maa pavate thi') || t.includes('sona no garbo') ||
      t.includes('hu to gai ti mele') || t.includes('radha dhundh rahi') || t.includes('odhaji mara') ||
      t.includes('kumkum na pagla') || t.includes('he karuna na') || t.includes('saybo re govaliyo') ||
      t.includes('maru man mohi') || t.includes('aso sud ekam')
    ) {
      isRegional = true;
      reason = 'GUJARATI GARBA';
    }
    // Check South (Telugu/Tamil/Kannada) non-Bollywood
    else if (
      t.includes('jai balayya') || t.includes('maa bava manobhavalu') || t.includes('feelingu roberrt') ||
      t.includes('sittharala sirapadu') || t.includes('kurchi madathapetti') || t.includes('ordinary person') ||
      a.includes('arjun janya') || (a.includes('thaman') && !t.includes('bollywood')) ||
      t.includes('the theri theme') || t.includes('sword of destiny') || t.includes('bad eyes villain') ||
      t.includes('jithu theme') || t.includes('rolex theme') || t.includes('muthuvel pandian') ||
      t.includes('jd intro theme')
    ) {
      isRegional = true;
      reason = 'SOUTH (TELUGU/TAMIL/KANNADA)';
    }
    // Check Rajasthani / Marwadi non-Bollywood
    else if (
      t.includes('banna re') || t.includes('banna thari') || t.includes('cham cham chamke chunri') ||
      a.includes('chitralekha sen') || a.includes('seema mishra')
    ) {
      isRegional = true;
      reason = 'RAJASTHANI / MARWADI';
    }

    if (isRegional) {
      pureRegionalFoundInHindi.push({ catSlug: slug, index: i, song: s, reason });
    }
  }
}

console.log(`Found ${pureRegionalFoundInHindi.length} PURE REGIONAL songs inside Hindi categories.`);

const byCat = {};
for (const item of pureRegionalFoundInHindi) {
  byCat[item.catSlug] = (byCat[item.catSlug] || 0) + 1;
}
console.log('Breakdown by category:', byCat);
