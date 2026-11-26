const path = require('path');
const { CURATED_CATEGORIES } = require('./api/_lib/curated-songs-db.js');

const odiaHits = CURATED_CATEGORIES.find(c => c.slug === 'odia-hits');
const odiaTitles = new Set((odiaHits ? odiaHits.songs : []).map(s => s.title.toLowerCase().trim()));
console.log('Odia hits total songs in odia-hits:', odiaTitles.size);

let totalOdiaInHindi = 0;
for (const cat of CURATED_CATEGORIES) {
  if (cat.slug === 'odia-hits') continue;
  const overlapping = cat.songs.filter(s => odiaTitles.has(s.title.toLowerCase().trim()));
  if (overlapping.length > 0) {
    console.log(`Category [${cat.slug}] (lang: ${cat.lang}) has ${overlapping.length} ODIA songs:`);
    console.log('  ' + overlapping.map(s => s.title).join(', '));
    if (cat.lang === 'hindi') {
      totalOdiaInHindi += overlapping.length;
    }
  }
}
console.log(`\nTotal Odia songs found in Hindi categories: ${totalOdiaInHindi}`);
