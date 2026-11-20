import { handlePreflight, readJsonBody, sendJson } from './_lib/http.js';
import { CURATED_CATEGORIES_DB } from './_lib/curated-songs-db.js';

const MASTER_COUNTS = {
  counts: {
    "hindi": 798,
    "hindi:dance": 358,
    "hindi:retro": 165,
    "hindi:romantic": 256,
    "hindi:sufi": 76,
    "hindi:hiphop": 46,
    "punjabi": 606,
    "punjabi:party": 454,
    "punjabi:wedding": 201,
    "punjabi:sad": 83,
    "punjabi:gym": 284,
    "english": 143,
    "english:hiphop": 46,
    "english:pop": 107,
    "english:love": 22,
    "english:edm": 34,
    "tamil-telugu": 14,
    "tamil-telugu:kuthu": 14,
    "tamil-telugu:melody": 0,
    "tamil-telugu:mass": 13,
    "haryanvi-bhojpuri": 11,
    "haryanvi-bhojpuri:party": 6,
    "haryanvi-bhojpuri:desi-beats": 11,
    "gujarati": 46,
    "gujarati:garba": 46
  },
  unsure: 484
};

function buildFallbackSet(body) {
  const answers = body?.answers || {};
  const requestedLangs = (answers.languages || ['hindi', 'punjabi']).map(l => String(l).toLowerCase());
  const requestedSubtypes = (answers.subtypes || []).map(s => String(s).toLowerCase());

  let pool = [];
  for (const cat of Object.values(CURATED_CATEGORIES_DB)) {
    const catLang = (cat.lang || 'hindi').toLowerCase();
    const catSlug = (cat.slug || '').toLowerCase();
    const matchesLang = requestedLangs.includes(catLang);
    const matchesSubtype = requestedSubtypes.some(s => {
      const bareSub = s.includes(':') ? s.split(':')[1] : s;
      return catSlug.includes(bareSub);
    });

    if (matchesLang || matchesSubtype || pool.length < 15) {
      for (const s of cat.songs || []) {
        pool.push({
          song_id: s.id || `${cat.slug}-${Math.random().toString(36).slice(2, 7)}`,
          title: s.title,
          artist: s.artist,
          youtube_ids: s.youtube_ids && s.youtube_ids.length ? s.youtube_ids : [s.videoId || 'k89egJyAlDE'],
          duration_sec: s.durationSec || s.duration_sec || 180,
          entry_sec: s.entrySec || s.entry_sec || 30,
          exit_sec: s.exitSec || s.exit_sec || 140,
          play_full: Boolean(s.playFull || s.play_full),
          era: 'post2020',
          language: catLang,
          subtype: catSlug.replace(/^[a-z]+-/, ''),
          energy: s.energy || 7,
          tags: [],
          style: 'party',
          unsure: false,
          heat: s.heat || Array.from({ length: 100 }, (_, i) => 0.5 + 0.4 * Math.sin(i / 10))
        });
      }
    }
  }

  // Deduplicate pool by title+artist
  const seen = new Set();
  const deduped = [];
  for (const item of pool) {
    const key = `${item.title.toLowerCase()}::${item.artist.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(item);
    }
  }

  // Pick 30 songs
  const cues = deduped.slice(0, 30);
  return {
    cues,
    fillers: [],
    note: null,
    more: "fallback-more-token"
  };
}

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;

  if (req.method === 'GET') {
    try {
      const remote = await fetch('https://www.naux.party/api/set', {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(4000)
      });
      if (remote.ok) {
        const data = await remote.json();
        return sendJson(res, 200, data, 'public, max-age=60');
      }
    } catch (e) {
      console.warn('GET /api/set upstream fetch failed, using fallback:', e.message);
    }
    return sendJson(res, 200, MASTER_COUNTS, 'public, max-age=60');
  }

  if (req.method === 'POST') {
    let body = {};
    try {
      body = await readJsonBody(req);
    } catch {}

    try {
      const remote = await fetch('https://www.naux.party/api/set', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(7000)
      });
      if (remote.ok) {
        const data = await remote.json();
        return sendJson(res, 200, data);
      }
    } catch (e) {
      console.warn('POST /api/set upstream fetch failed, using fallback:', e.message);
    }

    const fallbackData = buildFallbackSet(body);
    return sendJson(res, 200, fallbackData);
  }

  res.setHeader('Allow', 'GET, POST');
  return sendJson(res, 405, { error: 'Method not allowed' });
}
