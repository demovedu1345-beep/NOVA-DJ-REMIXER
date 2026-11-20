import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const targetFile = 'C:\\Users\\itzra\\.gemini\\antigravity\\scratch\\NOVA-DJ-REMIXER\\scripts\\curated_batches\\agent_3.json';
const cacheFile = 'C:\\Users\\itzra\\.gemini\\antigravity\\scratch\\NOVA-DJ-REMIXER\\scripts\\curated_batches\\agent_3_cache.json';

// Import candidate lists
const candidatesModule = await import(pathToFileURL('C:/Users/itzra/.gemini/antigravity/scratch/NOVA-DJ-REMIXER/scripts/curate_agent_3.mjs').href);
const { romanticCandidates, retroCandidates } = candidatesModule;

const PUBLIC_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
};

function loadCache() {
  if (fs.existsSync(cacheFile)) {
    try {
      return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    } catch (e) {
      return {};
    }
  }
  return {};
}

function saveCache(cache) {
  const dir = path.dirname(cacheFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2), 'utf8');
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function searchYouTube(query, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const url = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(query);
      const res = await fetch(url, {
        headers: PUBLIC_HEADERS,
        signal: AbortSignal.timeout(12000),
      });

      if (!res.ok) {
        console.warn(`  [Attempt ${attempt}] HTTP ${res.status} for query "${query}"`);
        await sleep(3000 * attempt);
        continue;
      }

      const html = await res.text();
      const match = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/);
      if (!match) {
        console.warn(`  [Attempt ${attempt}] No ytInitialData match in HTML (${html.length} chars)`);
        await sleep(3000 * attempt);
        continue;
      }

      const data = JSON.parse(match[1]);
      const renderers = [];
      const walk = (node) => {
        if (!node || typeof node !== 'object') return;
        if (node.videoRenderer?.videoId) renderers.push(node.videoRenderer);
        else if (Array.isArray(node)) node.forEach(walk);
        else Object.values(node).forEach(walk);
      };
      walk(data.contents);

      const results = [];
      for (const v of renderers) {
        const videoId = v.videoId;
        if (!videoId || videoId.length !== 11) continue;
        const title = v.title?.runs?.map(r => r.text).join('') || v.title?.simpleText || '';
        const owner = v.ownerText?.runs?.map(r => r.text).join('') || '';
        const lengthText = v.lengthText?.simpleText || '';
        if (!lengthText.includes(':')) continue;
        const parts = lengthText.split(':').map(Number);
        const secs = parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0] * 3600 + parts[1] * 60 + parts[2];
        if (secs < 60 || secs > 600) continue;
        results.push({ videoId, title, owner, lengthText, secs });
      }

      if (results.length > 0) {
        return results;
      } else {
        console.warn(`  [Attempt ${attempt}] 0 videoRenderers parsed`);
        await sleep(2500 * attempt);
      }
    } catch (err) {
      console.warn(`  [Attempt ${attempt}] Fetch error for "${query}": ${err.message}`);
      await sleep(3000 * attempt);
    }
  }
  return [];
}

async function verifyOembed(videoId) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`, {
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) {
        return await res.json();
      }
      if (res.status === 404) return null;
      await sleep(1000);
    } catch (err) {
      await sleep(1000);
    }
  }
  return null;
}

async function processCategory(catName, items, cache, globalSeenIds) {
  console.log(`\n========================================`);
  console.log(`Processing ${catName}: ${items.length} songs...`);
  console.log(`========================================`);

  const processed = [];

  for (let i = 0; i < items.length; i++) {
    const song = items[i];
    const cacheKey = `${catName}::${song.title}`;

    if (cache[cacheKey] && !globalSeenIds.has(cache[cacheKey].videoId)) {
      const cached = cache[cacheKey];
      // Quick verify cached video ID is still valid and not duplicate
      console.log(`[${i + 1}/${items.length}] Using cached for "${song.title}": ${cached.videoId}`);
      globalSeenIds.add(cached.videoId);
      processed.push(cached);
      continue;
    }

    console.log(`[${i + 1}/${items.length}] Searching: "${song.title}" (${song.year})...`);
    
    let candidateList = await searchYouTube(song.query);
    if (!candidateList || candidateList.length === 0) {
      const fallbackQuery = `${song.title} ${song.artist.split(',')[0]} official song`;
      console.log(`  Retry with fallback query: "${fallbackQuery}"`);
      candidateList = await searchYouTube(fallbackQuery);
    }

    let selected = null;

    // Filter through candidates
    for (const cand of candidateList) {
      if (globalSeenIds.has(cand.videoId)) continue;

      const oe = await verifyOembed(cand.videoId);
      if (oe && oe.title) {
        selected = {
          videoId: cand.videoId,
          secs: cand.secs,
          ytTitle: oe.title,
          author: oe.author_name,
        };
        break;
      }
    }

    if (!selected) {
      console.error(`  ERROR: Could not resolve video ID for ${song.title}`);
      throw new Error(`Unresolved videoId for ${song.title}`);
    }

    globalSeenIds.add(selected.videoId);
    console.log(`  -> Selected: ${selected.videoId} (${selected.secs}s) | ${selected.author} - ${selected.ytTitle.slice(0, 45)}...`);

    let durationSec = selected.secs;
    if (durationSec < 180) durationSec = Math.min(240, Math.max(180, durationSec));
    if (durationSec > 280) durationSec = Math.min(280, durationSec);

    const hookStart = Math.min(song.hookStartSec || 45, durationSec - 45);
    const hookEnd = hookStart + 40;

    const entry = {
      title: song.title,
      artist: song.artist,
      year: String(song.year),
      durationSec: Math.round(durationSec),
      hookStartSec: Math.round(hookStart),
      hookEndSec: Math.round(hookEnd),
      entrySec: Math.round(hookStart),
      exitSec: Math.round(hookEnd),
      videoId: selected.videoId,
      energy: song.energy || 8,
    };

    cache[cacheKey] = entry;
    saveCache(cache);
    processed.push(entry);

    // Respectful delay between songs to avoid throttling
    await sleep(1500);
  }

  return processed;
}

async function main() {
  const cache = loadCache();
  const globalSeenIds = new Set();

  console.log('Starting Robust Curation for Agent 3...');
  console.log('Cache entries loaded:', Object.keys(cache).length);

  const romanticSongs = await processCategory('hindi-romantic', romanticCandidates, cache, globalSeenIds);
  const retroSongs = await processCategory('hindi-retro', retroCandidates, cache, globalSeenIds);

  const result = {
    'hindi-romantic': romanticSongs,
    'hindi-retro': retroSongs,
  };

  const outDir = path.dirname(targetFile);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(targetFile, JSON.stringify(result, null, 2), 'utf8');
  console.log(`\n========================================`);
  console.log(`SUCCESS! Saved Agent 3 curated batches.`);
  console.log(`romantic songs: ${romanticSongs.length}`);
  console.log(`retro songs: ${retroSongs.length}`);
  console.log(`total unique videoIds: ${globalSeenIds.size}`);
  console.log(`Target: ${targetFile}`);
  console.log(`========================================`);
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
