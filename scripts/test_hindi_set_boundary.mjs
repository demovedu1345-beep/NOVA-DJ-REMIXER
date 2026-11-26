import { buildSetFromCuratedDb } from '../api/set.js';
import { CURATED_CATEGORIES_DB } from '../api/_lib/curated-songs-db.js';

const odiaHits = CURATED_CATEGORIES_DB['odia-hits'];
const odiaTitles = new Set(odiaHits.songs.map(s => s.title.toLowerCase().trim()));

const regionalCategories = Object.entries(CURATED_CATEGORIES_DB).filter(([k, v]) => v.lang !== 'hindi' && v.lang !== 'english');
const allRegionalTitles = new Set();
for (const [k, v] of regionalCategories) {
  for (const s of v.songs) allRegionalTitles.add((s.title || '').toLowerCase().trim());
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

function auditSet(setResult, expectedLang) {
  const cues = setResult.cues || [];
  let odiaCount = 0;
  let nonExpectedLangCount = 0;

  for (const c of cues) {
    const t = (c.title || '').toLowerCase().trim();
    if (odiaTitles.has(t)) {
      odiaCount++;
      console.log(`  [ALERT] Odia track found: "${c.title}" by ${c.artist}`);
    }
    if (expectedLang === 'hindi' && c.language !== 'hindi') {
      nonExpectedLangCount++;
      console.log(`  [ALERT] Non-Hindi track language attribute: "${c.title}" lang: ${c.language}`);
    } else if (expectedLang === 'english' && c.language !== 'english') {
      nonExpectedLangCount++;
      console.log(`  [ALERT] Non-English track language attribute: "${c.title}" lang: ${c.language}`);
    }
  }

  return { total: cues.length, odiaCount, nonExpectedLangCount };
}

console.log('--- TEST 1: Hindi Trending ---');
const set1 = buildSetFromCuratedDb({ answers: { languages: ['hindi'], subtypes: ['hindi:trending'], crowd: 'large', time: 'bangers' } });
const res1 = auditSet(set1, 'hindi');
console.log(`Test 1 Result: ${res1.total} cues, Odia: ${res1.odiaCount}, Non-Hindi: ${res1.nonExpectedLangCount}`);

console.log('\n--- TEST 2: Hindi Pop ---');
const set2 = buildSetFromCuratedDb({ answers: { languages: ['hindi'], subtypes: ['pop'], crowd: 'large', time: 'bangers' } });
const res2 = auditSet(set2, 'hindi');
console.log(`Test 2 Result: ${res2.total} cues, Odia: ${res2.odiaCount}, Non-Hindi: ${res2.nonExpectedLangCount}`);

console.log('\n--- TEST 3: Hindi All Categories Mix ---');
const set3 = buildSetFromCuratedDb({ answers: { languages: ['hindi'], subtypes: [], crowd: 'large', time: 'bangers' } });
const res3 = auditSet(set3, 'hindi');
console.log(`Test 3 Result: ${res3.total} cues, Odia: ${res3.odiaCount}, Non-Hindi: ${res3.nonExpectedLangCount}`);

console.log('\n--- TEST 4: English Rock ---');
const set4 = buildSetFromCuratedDb({ answers: { languages: ['english'], subtypes: ['rock'], crowd: 'large', time: 'bangers' } });
const res4 = auditSet(set4, 'english');
console.log(`Test 4 Result: ${res4.total} cues, Odia: ${res4.odiaCount}, Non-English: ${res4.nonExpectedLangCount}`);

if (res1.odiaCount === 0 && res2.odiaCount === 0 && res3.odiaCount === 0 && res1.nonExpectedLangCount === 0 && res2.nonExpectedLangCount === 0 && res3.nonExpectedLangCount === 0 && res4.nonExpectedLangCount === 0) {
  console.log('\n>>> ALL 4 STRICT LANGUAGE TESTS PASSED WITH ZERO CONTAMINATION! <<<');
} else {
  console.error('\n>>> SOME TESTS FAILED! Check alerts above. <<<');
  process.exit(1);
}
