import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const targetFile = 'C:\\Users\\itzra\\.gemini\\antigravity\\scratch\\NOVA-DJ-REMIXER\\scripts\\curated_batches\\agent_3.json';

// Import candidate lists
const candidatesModule = await import(pathToFileURL('C:/Users/itzra/.gemini/antigravity/scratch/NOVA-DJ-REMIXER/scripts/curate_agent_3.mjs').href);
const { romanticCandidates, retroCandidates } = candidatesModule;

const PUBLIC_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
};

async function searchYouTube(query) {
  try {
    const url = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(query);
    const res = await fetch(url, {
      headers: PUBLIC_HEADERS,
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const html = await res.text();
    const match = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/);
    if (!match) return [];
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
    return results;
  } catch (err) {
    console.error('Search error for:', query, err.message);
    return [];
  }
}

async function verifyOembed(videoId) {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`, {
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function processCategory(catName, items, globalSeenIds) {
  console.log(`\n========================================`);
  console.log(`Processing ${catName}: ${items.length} songs...`);
  console.log(`========================================`);

  const processed = [];

  for (let i = 0; i < items.length; i++) {
    const song = items[i];
    console.log(`[${i + 1}/${items.length}] Searching: "${song.title}" (${song.year})...`);
    
    let candidateList = await searchYouTube(song.query);
    if (!candidateList || candidateList.length === 0) {
      // fallback query
      const fallbackQuery = `${song.title} ${song.artist} official video`;
      console.log(`  Retry with fallback query: "${fallbackQuery}"`);
      candidateList = await searchYouTube(fallbackQuery);
    }

    let selected = null;

    // Filter through candidates to find one that passes oEmbed and isn't duplicated
    for (const cand of candidateList) {
      if (globalSeenIds.has(cand.videoId)) {
        continue;
      }

      // Check oembed
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
      console.error(`  ERROR: No verified video ID found for ${song.title}!`);
      // We'll throw or handle
      throw new Error(`Failed to find verified videoId for ${song.title}`);
    }

    globalSeenIds.add(selected.videoId);
    console.log(`  -> Selected: ${selected.videoId} (${selected.secs}s) | ${selected.author} - ${selected.ytTitle.slice(0, 45)}...`);

    // Target duration around 180-280
    let durationSec = selected.secs;
    if (durationSec < 180) durationSec = Math.min(240, Math.max(180, durationSec));
    if (durationSec > 280) durationSec = Math.min(280, durationSec);

    const hookStart = Math.min(song.hookStartSec || 45, durationSec - 45);
    const hookEnd = hookStart + 40;

    processed.push({
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
    });

    // small throttle to be respectful
    await sleep(250);
  }

  return processed;
}

async function main() {
  const globalSeenIds = new Set();

  console.log('Starting curation for Agent 3...');
  const romanticSongs = await processCategory('hindi-romantic', romanticCandidates, globalSeenIds);
  const retroSongs = await processCategory('hindi-retro', retroCandidates, globalSeenIds);

  const result = {
    'hindi-romantic': romanticSongs,
    'hindi-retro': retroSongs,
  };

  // Ensure output directory exists
  const outDir = path.dirname(targetFile);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(targetFile, JSON.stringify(result, null, 2), 'utf8');
  console.log(`\nSuccessfully wrote ${romanticSongs.length} romantic and ${retroSongs.length} retro songs to:`);
  console.log(targetFile);
  console.log(`Total unique video IDs: ${globalSeenIds.size}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
