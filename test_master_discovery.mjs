/**
 * test_master_discovery.mjs
 * End-to-End Master Test Suite for Advanced Music Discovery & Artist Explorer
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)));

console.log('================================================================');
console.log('RUNNING AUDIFY ADVANCED MUSIC DISCOVERY & ARTIST MASTER SUITE');
console.log('================================================================\n');

let failedTests = 0;
function assert(condition, message) {
  if (condition) {
    console.log(`✔ [PASS] ${message}`);
  } else {
    console.error(`❌ [FAIL] ${message}`);
    failedTests++;
  }
}

// -------------------------------------------------------------
// Test 1: Category Database & Song Counts (>= 100 songs per category)
// -------------------------------------------------------------
console.log('--- TEST 1: Curated Database (25 Hindi + 25 English >= 100 songs) ---');
const dbModule = await import('./api/_lib/curated-songs-db.js?t=' + Date.now());
const db = dbModule.CURATED_CATEGORIES_DB;

assert(Boolean(db), 'CURATED_CATEGORIES_DB exported successfully');
const hindiCats = Object.keys(db).filter(k => db[k].lang === 'hindi');
const englishCats = Object.keys(db).filter(k => db[k].lang === 'english');
const regionalCats = Object.keys(db).filter(k => db[k].lang !== 'hindi' && db[k].lang !== 'english');

assert(hindiCats.length >= 25, `Hindi categories count: ${hindiCats.length} (>= 25)`);
assert(englishCats.length >= 25, `English categories count: ${englishCats.length} (>= 25)`);
assert(regionalCats.length >= 10, `Regional categories count: ${regionalCats.length} (>= 10)`);

let allGe100 = true;
let totalEntries = 0;
for (const [k, v] of Object.entries(db)) {
  const cnt = (v.songs || []).length;
  totalEntries += cnt;
  if (cnt < 100) {
    allGe100 = false;
    console.error(`Category ${k} has only ${cnt} songs!`);
  }
}
assert(allGe100, 'Every category across the entire catalog has >= 100 verified songs');
assert(totalEntries >= 5000, `Total song entries: ${totalEntries} (Target >= 5,000 exceeded)`);

// -------------------------------------------------------------
// Test 2: Artist Catalog & Discography Linkage
// -------------------------------------------------------------
console.log('\n--- TEST 2: Artist Catalog & Subcategory Classifications ---');
const artistModule = await import('./api/_lib/artists-db.js?t=' + Date.now());
const { ARTISTS_DB, getArtistsByLanguage, getArtistProfile } = artistModule;

assert(Boolean(ARTISTS_DB), 'ARTISTS_DB exported successfully');
const hindiArtists = Object.keys(ARTISTS_DB.hindi || {});
const englishArtists = Object.keys(ARTISTS_DB.english || {});

assert(hindiArtists.length >= 15, `Hindi canonical artists: ${hindiArtists.length} (>= 15)`);
assert(englishArtists.length >= 15, `English canonical artists: ${englishArtists.length} (>= 15)`);

const arijit = getArtistProfile('arijit-singh', 'hindi');
assert(Boolean(arijit), 'Arijit Singh canonical profile retrieved');
assert(arijit.verified === true, 'Arijit Singh has verified status');
assert((arijit.songs || []).length >= 50, `Arijit Singh discography tracks: ${arijit.songs?.length} (>= 50)`);

const taylor = getArtistProfile('taylor-swift', 'english');
assert(Boolean(taylor), 'Taylor Swift canonical profile retrieved');
assert((taylor.songs || []).length >= 20, `Taylor Swift discography tracks: ${taylor.songs?.length} (>= 20)`);

// Dynamic subcategory classification test
const romanticArtists = getArtistsByLanguage('hindi', 'romantic');
assert(romanticArtists.length >= 5, `Hindi Romantic artists count: ${romanticArtists.length} (>= 5)`);
const hiphopArtists = getArtistsByLanguage('hindi', 'hiphop');
assert(hiphopArtists.length >= 5, `Hindi Hip-Hop artists count: ${hiphopArtists.length} (>= 5)`);

// -------------------------------------------------------------
// Test 3: API Endpoints (GET & POST /api/set, GET /api/artists, GET /api/catalogue)
// -------------------------------------------------------------
console.log('\n--- TEST 3: Backend API Integration & Playback Cues ---');
class MockRes {
  body = null;
  headers = {};
  setHeader(k, v) { this.headers[k] = v; }
  end(d) { this.body = d; }
}

const setHandler = (await import('./api/set.js?t=' + Date.now())).default;
const artistsHandler = (await import('./api/artists.js?t=' + Date.now())).default;
const catalogueHandler = (await import('./api/catalogue.js?t=' + Date.now())).default;

// Test GET /api/set
const resSetGet = new MockRes();
await setHandler({ method: 'GET', url: '/api/set' }, resSetGet);
const setCounts = JSON.parse(resSetGet.body);
assert(setCounts.counts.hindi >= 2500, `MASTER_COUNTS hindi total: ${setCounts.counts.hindi} (>= 2,500)`);
assert(setCounts.counts.english >= 2500, `MASTER_COUNTS english total: ${setCounts.counts.english} (>= 2,500)`);
assert(setCounts.counts['hindi:breakup'] >= 100, `hindi:breakup count: ${setCounts.counts['hindi:breakup']} (>= 100)`);
assert(setCounts.counts['english:rock'] >= 100, `english:rock count: ${setCounts.counts['english:rock']} (>= 100)`);

// Test POST /api/set for Artist Play All
const resSetArt = new MockRes();
await setHandler({ method: 'POST', url: '/api/set', body: JSON.stringify({ artist: 'arijit-singh', lang: 'hindi' }) }, resSetArt);
const setArtData = JSON.parse(resSetArt.body);
assert(Array.isArray(setArtData.cues) && setArtData.cues.length > 0, `Artist Play All returned ${setArtData.cues?.length} playable cues`);
assert(setArtData.cues[0].youtube_ids[0].length === 11, `First cue has valid 11-char YouTube ID: ${setArtData.cues[0].youtube_ids[0]}`);

// Test GET /api/artists
const resArtGet = new MockRes();
await artistsHandler({ method: 'GET', url: '/api/artists?lang=hindi&sub=romantic' }, resArtGet);
const artList = JSON.parse(resArtGet.body);
assert(artList.count >= 5, `GET /api/artists returned ${artList.count} romantic artists`);

// Test GET /api/catalogue Search
const resCatSearch = new MockRes();
await catalogueHandler({ method: 'GET', url: '/api/catalogue?q=Arijit+Singh' }, resCatSearch);
const catSearchData = JSON.parse(resCatSearch.body);
assert(catSearchData.artist?.name === 'Arijit Singh', 'Search matched Arijit Singh canonical artist');
assert(catSearchData.results.length >= 10, `Search returned ${catSearchData.results.length} verified playable tracks`);

// -------------------------------------------------------------
// Test 4: UI Artifacts & Client Chunk Verification
// -------------------------------------------------------------
console.log('\n--- TEST 4: UI & Module 298 Verification ---');
const chunkContent = fs.readFileSync(path.join(root, 'public/naux/static/immutable/chunks/3cq6guoi7hqi2.js'), 'utf8');
assert(chunkContent.includes('"id":"artists"') && chunkContent.includes('Artists'), 'Module 298 contains Artists category');
assert(chunkContent.includes('Breakup'), 'Module 298 contains Hindi Breakup category');
assert(chunkContent.includes('Rock'), 'Module 298 contains English Rock category');
assert(chunkContent.includes('window.__startSetWithCues'), 'Chunk exposes window.__startSetWithCues for instant playback');
assert(chunkContent.includes('openAudifyArtistExplorer'), 'Step 1 cards trigger openAudifyArtistExplorer');

const indexContent = fs.readFileSync(path.join(root, 'public/index.html'), 'utf8');
assert(indexContent.includes('/styles/artist-explorer.css'), 'index.html includes artist-explorer.css');
assert(indexContent.includes('/js/ui/artist-explorer.js'), 'index.html includes artist-explorer.js');

const songsHtmlContent = fs.readFileSync(path.join(root, 'public/songs.html'), 'utf8');
assert(songsHtmlContent.includes('/songs/hindi-breakup'), 'songs.html directory lists /songs/hindi-breakup');
assert(songsHtmlContent.includes('/songs/english-pop'), 'songs.html directory lists /songs/english-pop');

console.log('\n================================================================');
if (failedTests === 0) {
  console.log('ALL TESTS PASSED! MASTER DISCOVERY SYSTEM 100% OPERATIONAL!');
} else {
  console.error(`FAILED ${failedTests} TESTS! PLEASE FIX THEM!`);
  process.exit(1);
}
console.log('================================================================\n');
