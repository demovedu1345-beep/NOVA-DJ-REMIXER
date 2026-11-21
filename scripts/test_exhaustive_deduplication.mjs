import handler from '../api/set.js';
import { ARTISTS_DB } from '../api/_lib/artists-db.js';
import { CURATED_CATEGORIES_DB } from '../api/_lib/curated-songs-db.js';

class MockRes {
  statusCode = 200;
  headers = {};
  body = null;
  setHeader(k, v) { this.headers[k] = v; }
  end(data) { this.body = data; }
}

async function runSetRequest(body) {
  const req = { method: 'POST', url: '/api/set', body: JSON.stringify(body) };
  const res = new MockRes();
  await handler(req, res);
  return JSON.parse(res.body);
}

console.log("==================================================================");
console.log("STARTING EXHAUSTIVE DEDUPLICATION AUDIT ACROSS ALL ARTISTS & CATEGORIES");
console.log("==================================================================");

let totalSetsTested = 0;
let failedSets = 0;

function checkSet(name, setObj) {
  totalSetsTested++;
  const cues = setObj.cues || [];
  if (cues.length === 0) {
    console.error(`[FAIL - EMPTY] ${name} returned 0 cues!`);
    failedSets++;
    return false;
  }
  const vids = cues.map(c => c.youtube_ids[0]);
  const uniqueVids = new Set(vids);
  const titles = cues.map(c => (c.title || '').toLowerCase().trim());
  const uniqueTitles = new Set(titles);

  const hasDupeVids = vids.length !== uniqueVids.size;
  const hasDupeTitles = titles.length !== uniqueTitles.size;

  if (hasDupeVids || hasDupeTitles) {
    console.error(`[FAIL - DUPLICATES] ${name}: cues=${cues.length}, uniqueVids=${uniqueVids.size}, uniqueTitles=${uniqueTitles.size}`);
    failedSets++;
    return false;
  }
  return true;
}

// 1. Test EVERY Artist in ARTISTS_DB (both English and Hindi)
console.log("\n--- PHASE 1: Testing all artists in ARTISTS_DB (non-shuffled and shuffled) ---");
for (const lang of ['english', 'hindi']) {
  for (const [artId, art] of Object.entries(ARTISTS_DB[lang] || {})) {
    // Non-shuffled
    const set1 = await runSetRequest({ artist: artId, lang });
    checkSet(`Artist [${lang}] ${art.name} (order)`, set1);

    // Shuffled
    const set2 = await runSetRequest({ artist: artId, lang, shuffle: true });
    checkSet(`Artist [${lang}] ${art.name} (shuffle)`, set2);
  }
}

// 2. Test EVERY Category in CURATED_CATEGORIES_DB
console.log("\n--- PHASE 2: Testing all 64 categories in CURATED_CATEGORIES_DB ---");
for (const [catKey, cat] of Object.entries(CURATED_CATEGORIES_DB)) {
  const sub = catKey.replace(/^[a-z]+-/, '');
  // Query by subtype
  const setBySub = await runSetRequest({ answers: { languages: [cat.lang], subtypes: [sub] } });
  checkSet(`Category ${catKey} (by lang+subtype)`, setBySub);

  // Direct slug query
  const setBySlug = await runSetRequest({ kind: catKey });
  checkSet(`Category ${catKey} (by kind)`, setBySlug);
}

// 3. Test Language mixes & Edge cases
console.log("\n--- PHASE 3: Testing Language mixes & Edge cases ---");
const languageCombinations = [
  ['hindi'],
  ['english'],
  ['punjabi'],
  ['hindi', 'english'],
  ['hindi', 'punjabi'],
  ['tamil-telugu'],
  ['marathi'],
  ['gujarati'],
  ['haryanvi-bhojpuri'],
  ['hindi', 'english', 'punjabi', 'tamil-telugu']
];

for (const langs of languageCombinations) {
  const setObj = await runSetRequest({ answers: { languages: langs } });
  checkSet(`Languages: [${langs.join(', ')}]`, setObj);
}

// Edge case tests
const edgeCases = [
  { name: 'Empty body', body: {} },
  { name: 'Empty answers', body: { answers: {} } },
  { name: 'Unknown artist', body: { artist: 'non-existent-artist-12345' } },
  { name: 'Unknown subtype', body: { answers: { subtypes: ['quantum-edm-polka'] } } },
  { name: 'Bangers energy', body: { answers: { energy: 'bangers', languages: ['english'] } } },
  { name: 'Chill energy', body: { answers: { energy: 'chill', languages: ['hindi'] } } }
];

for (const ec of edgeCases) {
  const setObj = await runSetRequest(ec.body);
  checkSet(`Edge Case: ${ec.name}`, setObj);
}

// Random repeat tests across 20 iterations
console.log("\n--- PHASE 4: Random repeat stress test (20 iterations) ---");
for (let i = 1; i <= 20; i++) {
  const setObj = await runSetRequest({ answers: { languages: ['hindi', 'english'], energy: 'peak' } });
  checkSet(`Random iteration ${i}`, setObj);
}

console.log("\n==================================================================");
console.log(`TOTAL SETS EVALUATED: ${totalSetsTested}`);
console.log(`FAILED SETS: ${failedSets}`);
if (failedSets === 0) {
  console.log("SUCCESS: 100% of sets across ALL tests have ZERO duplicate video IDs and ZERO duplicate titles!");
} else {
  console.error("FAILURES DETECTED!");
  process.exit(1);
}
console.log("==================================================================");
