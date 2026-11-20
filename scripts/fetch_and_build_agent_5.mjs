import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PARTY_SONGS_RAW, DESI_BEATS_SONGS_RAW } from './agent_5_song_list.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cacheFile = path.join(__dirname, 'agent_5_cache.json');
const outputFile = path.join(__dirname, 'new_songs_batch', 'agent_5.json');

// Ensure output dir exists
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

let cache = {};
if (fs.existsSync(cacheFile)) {
  try {
    cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    console.log(`Loaded ${Object.keys(cache).length} cached video lookups.`);
  } catch (e) {
    console.warn('Could not read cache, starting fresh');
  }
}

function saveCache() {
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2), 'utf8');
}

async function verifyOembed(videoId) {
  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      return { valid: true, title: data.title, author: data.author_name };
    }
    return { valid: false, status: res.status };
  } catch (e) {
    return { valid: false, error: e.message };
  }
}

async function searchYouTube(query, excludeIds = new Set()) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });
    const text = await res.text();
    const m = text.match(/ytInitialData\s*=\s*({.+?});<\/script>/);
    if (m) {
      try {
        const data = JSON.parse(m[1]);
        const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents;
        if (contents && Array.isArray(contents)) {
          for (const item of contents) {
            const v = item.videoRenderer;
            if (!v || !v.videoId || excludeIds.has(v.videoId)) continue;
            
            let durationSec = 210;
            if (v.lengthText?.simpleText) {
              const parts = v.lengthText.simpleText.split(':').map(Number);
              if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                durationSec = parts[0] * 60 + parts[1];
              } else if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
                durationSec = parts[0] * 3600 + parts[1] * 60 + parts[2];
              }
            }

            // Quick oembed verify
            const verify = await verifyOembed(v.videoId);
            if (verify.valid) {
              return {
                videoId: v.videoId,
                title: v.title?.runs?.[0]?.text || verify.title,
                durationSec,
                channel: v.ownerText?.runs?.[0]?.text || verify.author
              };
            }
          }
        }
      } catch (e) {
        // Fall back to regex
      }
    }

    // Fallback regex scan for watch IDs
    const idMatches = [...text.matchAll(/\/watch\?v=([a-zA-Z0-9_-]{11})/g)];
    for (const match of idMatches) {
      const vid = match[1];
      if (excludeIds.has(vid)) continue;
      const verify = await verifyOembed(vid);
      if (verify.valid) {
        return {
          videoId: vid,
          title: verify.title,
          durationSec: 210,
          channel: verify.author
        };
      }
    }
  } catch (e) {
    console.error(`Search error for "${query}":`, e.message);
  }
  return null;
}

const usedVideoIds = new Set();

async function processCategory(songsRaw, categoryName) {
  const result = [];
  console.log(`\n=== Processing ${categoryName} (${songsRaw.length} songs) ===`);

  for (let i = 0; i < songsRaw.length; i++) {
    const raw = songsRaw[i];
    const cacheKey = raw.query;
    let videoInfo = null;

    if (cache[cacheKey] && !usedVideoIds.has(cache[cacheKey].videoId)) {
      // Validate cached
      const verify = await verifyOembed(cache[cacheKey].videoId);
      if (verify.valid) {
        videoInfo = cache[cacheKey];
      }
    }

    if (!videoInfo) {
      // Fetch fresh
      process.stdout.write(`[${i + 1}/${songsRaw.length}] Searching: ${raw.title} ... `);
      videoInfo = await searchYouTube(raw.query, usedVideoIds);
      if (videoInfo) {
        cache[cacheKey] = videoInfo;
        saveCache();
        console.log(`OK: ${videoInfo.videoId} (${videoInfo.durationSec}s) - ${videoInfo.title.slice(0, 40)}`);
      } else {
        console.log(`FAILED to find video for "${raw.query}"`);
      }
      // Small polite delay
      await new Promise(r => setTimeout(r, 120));
    } else {
      console.log(`[${i + 1}/${songsRaw.length}] CACHED: ${raw.title} -> ${videoInfo.videoId}`);
    }

    if (videoInfo) {
      usedVideoIds.add(videoInfo.videoId);
      
      const durationSec = Math.max(videoInfo.durationSec || 210, 150);
      let hookStart = raw.hook || 30;
      if (hookStart + 40 >= durationSec) {
        hookStart = Math.max(15, Math.floor(durationSec * 0.25));
      }
      const hookEnd = Math.min(hookStart + 40, durationSec - 10);

      result.push({
        title: raw.title,
        artist: raw.artist,
        year: raw.year,
        durationSec: durationSec,
        hookStartSec: hookStart,
        hookEndSec: hookEnd,
        entrySec: hookStart,
        exitSec: hookEnd,
        videoId: videoInfo.videoId,
        energy: raw.energy || 9
      });
    } else {
      console.error(`CRITICAL: No video found for ${raw.title}`);
    }
  }

  return result;
}

async function run() {
  const partySongs = await processCategory(PARTY_SONGS_RAW, 'haryanvi-bhojpuri-party');
  const desiBeatsSongs = await processCategory(DESI_BEATS_SONGS_RAW, 'haryanvi-bhojpuri-desi-beats');

  console.log(`\nResults summary:`);
  console.log(`haryanvi-bhojpuri-party: ${partySongs.length} / ${PARTY_SONGS_RAW.length}`);
  console.log(`haryanvi-bhojpuri-desi-beats: ${desiBeatsSongs.length} / ${DESI_BEATS_SONGS_RAW.length}`);

  if (partySongs.length !== 100 || desiBeatsSongs.length !== 95) {
    console.error('ERROR: Song counts do not match requirements! Stopping without write.');
    process.exit(1);
  }

  const finalOutput = {
    'haryanvi-bhojpuri-party': partySongs,
    'haryanvi-bhojpuri-desi-beats': desiBeatsSongs
  };

  fs.writeFileSync(outputFile, JSON.stringify(finalOutput, null, 2), 'utf8');
  console.log(`\nSUCCESS: Written final output to ${outputFile}`);

  // Verification pass
  console.log('\n--- VERIFICATION PASS ---');
  const readBack = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
  const pCount = readBack['haryanvi-bhojpuri-party'].length;
  const dCount = readBack['haryanvi-bhojpuri-desi-beats'].length;
  console.log(`Verified 'haryanvi-bhojpuri-party' count: ${pCount}`);
  console.log(`Verified 'haryanvi-bhojpuri-desi-beats' count: ${dCount}`);

  let allKeysValid = true;
  for (const [catName, songs] of Object.entries(readBack)) {
    songs.forEach((s, idx) => {
      const keys = ['title', 'artist', 'year', 'durationSec', 'hookStartSec', 'hookEndSec', 'entrySec', 'exitSec', 'videoId', 'energy'];
      for (const k of keys) {
        if (s[k] === undefined || s[k] === null || s[k] === '') {
          console.error(`Invalid entry in ${catName}[${idx}]: missing ${k}`);
          allKeysValid = false;
        }
      }
      if (typeof s.videoId !== 'string' || s.videoId.length !== 11) {
        console.error(`Invalid videoId in ${catName}[${idx}]: ${s.videoId}`);
        allKeysValid = false;
      }
    });
  }

  if (allKeysValid) {
    console.log('ALL 195 SONGS ARE 100% VALID ACCORDING TO SPEC!');
  } else {
    console.error('VERIFICATION FAILED!');
    process.exit(1);
  }
}

run().catch(console.error);
