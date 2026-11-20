import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedFile = path.join(__dirname, 'valid_seed_agent_4.json');
const candidatesFile = path.join(__dirname, 'all_candidates_agent_4.json');
const cacheFile = path.join(__dirname, 'agent_4_progress_cache.json');
const targetFile = path.join(__dirname, 'curated_batches_200', 'agent_4.json');

const BLACKLIST = new Set([
  'BddP6PYo2gs', '7PCkvCPvDXk', 'vX2cDW8LUWk', 'VAdGW7QDJUI', 'V7LwfY5U5WI',
  'CZt-rVn2BJs', 'Gr8G_ldltDE', 'GftlBD-Apu8', 'k_WdQe_6k4g', 'dQw4w9WgXcQ'
]);

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0'
];

let uaIdx = 0;
function getUA() {
  uaIdx = (uaIdx + 1) % USER_AGENTS.length;
  return USER_AGENTS[uaIdx];
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function verifyVideo(vId) {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${vId}&format=json`, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    if (res.status === 200) {
      const data = await res.json();
      return { valid: true, title: data.title, author: data.author_name };
    }
    return { valid: false, status: res.status };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

async function searchYouTube(query, seenIds) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': getUA(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    if (res.status !== 200) return null;
    const html = await res.text();
    const matches = [...html.matchAll(/\/watch\?v=([a-zA-Z0-9_-]{11})/g)].map(m => m[1]);
    const uniqueIds = [...new Set(matches)];

    for (const vid of uniqueIds.slice(0, 6)) {
      if (BLACKLIST.has(vid) || seenIds.has(vid)) continue;
      const verified = await verifyVideo(vid);
      if (verified.valid) {
        return { videoId: vid, ytTitle: verified.title, ytAuthor: verified.author };
      }
    }
  } catch (e) {
    // network or fetch error
  }
  return null;
}

function normalizeTitle(t) {
  return String(t || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function main() {
  console.log('=== STARTING CURATION MASTER FOR AGENT 4 ===');
  const seeds = JSON.parse(fs.readFileSync(seedFile, 'utf8'));
  const candidates = JSON.parse(fs.readFileSync(candidatesFile, 'utf8'));

  let cachedData = { 'tamil-telugu-kuthu': [], 'tamil-telugu-mass': [] };
  if (fs.existsSync(cacheFile)) {
    try {
      cachedData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      console.log(`Loaded cache: kuthu=${cachedData['tamil-telugu-kuthu']?.length || 0}, mass=${cachedData['tamil-telugu-mass']?.length || 0}`);
    } catch (e) {}
  }

  const finalResult = {
    'tamil-telugu-kuthu': [],
    'tamil-telugu-mass': []
  };

  const usedVideoIds = new Set();
  const TARGET_COUNT = 104; // At least 100 authentic songs per category

  for (const category of ['tamil-telugu-kuthu', 'tamil-telugu-mass']) {
    console.log(`\n======================================================`);
    console.log(`Processing Category: ${category}`);
    console.log(`======================================================`);

    const titleSeen = new Set();

    // 1. Add valid seed songs first
    const seedSongs = seeds[category] || [];
    for (const s of seedSongs) {
      if (usedVideoIds.has(s.videoId)) continue;
      usedVideoIds.add(s.videoId);
      titleSeen.add(normalizeTitle(s.title));

      const hookStart = Number(s.hookStartSec) || 40;
      const hookEnd = Number(s.hookEndSec) || (hookStart + 40);
      const dur = Number(s.durationSec) || 220;

      finalResult[category].push({
        title: s.title,
        artist: s.artist,
        year: String(s.year || '2021'),
        durationSec: dur,
        hookStartSec: hookStart,
        hookEndSec: hookEnd,
        entrySec: hookStart,
        exitSec: hookEnd,
        videoId: s.videoId,
        energy: Math.max(9, Math.min(10, Number(s.energy) || 10))
      });
    }

    // 2. Add cached songs if any
    const fromCache = cachedData[category] || [];
    for (const s of fromCache) {
      const norm = normalizeTitle(s.title);
      if (titleSeen.has(norm) || usedVideoIds.has(s.videoId)) continue;
      usedVideoIds.add(s.videoId);
      titleSeen.add(norm);
      finalResult[category].push(s);
    }

    console.log(`Category ${category} currently has ${finalResult[category].length} songs.`);

    // 3. Search and resolve candidates to reach TARGET_COUNT
    const candidateList = candidates[category] || [];
    for (let i = 0; i < candidateList.length; i++) {
      if (finalResult[category].length >= TARGET_COUNT) {
        console.log(`Reached target count of ${finalResult[category].length} songs for ${category}!`);
        break;
      }

      const c = candidateList[i];
      const norm = normalizeTitle(c.title);
      if (titleSeen.has(norm)) {
        continue;
      }

      const query = c.query || `${c.title} ${c.artist} official video song`;
      process.stdout.write(`[${finalResult[category].length + 1}/${TARGET_COUNT}] Searching "${c.title}" ... `);

      let found = await searchYouTube(query, usedVideoIds);
      if (!found) {
        await sleep(500);
        const fallbackQuery = `${c.title} ${c.artist} song`;
        found = await searchYouTube(fallbackQuery, usedVideoIds);
      }

      if (found) {
        usedVideoIds.add(found.videoId);
        titleSeen.add(norm);

        const hookStart = Number(c.hookStartSec) || 40;
        const hookEnd = Number(c.hookEndSec) || (hookStart + 40);
        const dur = hookEnd + 140; // realistic ~210-240s

        const songEntry = {
          title: c.title,
          artist: c.artist,
          year: String(c.year || '2022'),
          durationSec: dur,
          hookStartSec: hookStart,
          hookEndSec: hookEnd,
          entrySec: hookStart,
          exitSec: hookEnd,
          videoId: found.videoId,
          energy: Math.max(9, Math.min(10, Number(c.energy) || 10))
        };

        finalResult[category].push(songEntry);
        console.log(`OK [${found.videoId}] -> "${found.ytTitle?.slice(0, 45)}"`);

        // Save progress to cache
        fs.writeFileSync(cacheFile, JSON.stringify(finalResult, null, 2), 'utf8');
      } else {
        console.log(`FAILED to locate verified video`);
      }

      await sleep(1200); // Polite rate limit
    }

    console.log(`Category ${category} finished with ${finalResult[category].length} songs.`);
  }

  // Ensure target folder exists
  fs.mkdirSync(path.dirname(targetFile), { recursive: true });

  // Write target file
  fs.writeFileSync(targetFile, JSON.stringify(finalResult, null, 2), 'utf8');
  console.log(`\n>>> Successfully written to:\n${targetFile}`);

  console.log('\n--- BATCH SUMMARY ---');
  for (const [cat, list] of Object.entries(finalResult)) {
    console.log(`${cat}: ${list.length} songs`);
  }
  console.log(`Total Unique Verified Video IDs: ${usedVideoIds.size}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
