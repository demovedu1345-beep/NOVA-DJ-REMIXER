import { handlePreflight, readJsonBody, sendJson } from './_lib/http.js';
import { CURATED_CATEGORIES_DB } from './_lib/curated-songs-db.js';

const MASTER_COUNTS = {
  "counts": {
    "hindi": 1687,
    "hindi:diwali": 696,
    "hindi:dance": 358,
    "hindi:romantic": 256,
    "hindi:retro": 165,
    "hindi:sufi": 111,
    "hindi:hiphop": 101,
    "punjabi": 1044,
    "punjabi:party": 454,
    "punjabi:wedding": 201,
    "punjabi:sad": 105,
    "punjabi:gym": 284,
    "english": 419,
    "english:pop": 107,
    "english:edm": 101,
    "english:hiphop": 107,
    "english:love": 104,
    "tamil-telugu": 204,
    "tamil-telugu:kuthu": 101,
    "tamil-telugu:mass": 103,
    "haryanvi-bhojpuri": 210,
    "haryanvi-bhojpuri:party": 105,
    "haryanvi-bhojpuri:desi-beats": 105,
    "gujarati": 104,
    "gujarati:garba": 104
  },
  "unsure": 484
};

function slugToSubtype(slug) {
  return slug.replace(/^[a-z]+-/, '');
}

function buildSetFromCuratedDb(body) {
  const answers = body?.answers || {};
  const requestedLangs = (answers.languages || []).map(l => String(l).toLowerCase());
  const requestedSubtypes = (answers.subtypes || []).map(s => String(s).toLowerCase());
  const energy = answers.energy || 'peak';

  let matchingSongs = [];
  const allCategories = Object.values(CURATED_CATEGORIES_DB);

  // 1. Try to find categories matching requested subtypes first
  for (const cat of allCategories) {
    const catSlug = (cat.slug || '').toLowerCase();
    const catLang = (cat.lang || '').toLowerCase();

    const matchesSubtype = requestedSubtypes.some(s => {
      const bare = s.includes(':') ? s.split(':')[1] : s;
      return catSlug.includes(bare);
    });

    const matchesLang = requestedLangs.includes(catLang);

    if (matchesSubtype || (requestedSubtypes.length === 0 && matchesLang)) {
      for (const s of cat.songs || []) {
        const vId = s.videoId || (s.youtube_ids && s.youtube_ids[0]) || 'BddP6PYo2gs';
        const dur = Number(s.durationSec) || 180;
        const entry = Number.isFinite(s.entrySec) ? s.entrySec : (Number.isFinite(s.hookStartSec) ? s.hookStartSec : 30);
        const exit = Number.isFinite(s.exitSec) ? s.exitSec : (Number.isFinite(s.hookEndSec) ? s.hookEndSec : Math.min(entry + 40, dur));

        matchingSongs.push({
          song_id: s.id || `${cat.slug}-${matchingSongs.length + 1}`,
          title: s.title,
          artist: s.artist,
          youtube_ids: [vId],
          duration_sec: dur,
          entry_sec: entry,
          exit_sec: exit,
          play_full: Boolean(s.playFull),
          era: s.year && Number(s.year) < 2010 ? 'pre2020' : 'post2020',
          language: catLang,
          subtype: slugToSubtype(cat.slug),
          energy: s.energy || (energy === 'bangers' ? 9 : 8),
          tags: [],
          style: 'party',
          unsure: false,
          heat: s.heat || Array.from({ length: 100 }, (_, i) => 0.5 + 0.4 * Math.sin(i / 10))
        });
      }
    }
  }

  // 2. If nothing matched, fall back to all Hindi & Punjabi party songs
  if (!matchingSongs.length) {
    for (const cat of allCategories) {
      if (['hindi-dance', 'punjabi-party', 'hindi-retro', 'english-pop'].includes(cat.slug)) {
        for (const s of cat.songs || []) {
          const vId = s.videoId || 'BddP6PYo2gs';
          const dur = Number(s.durationSec) || 180;
          const entry = s.entrySec || 30;
          const exit = s.exitSec || Math.min(entry + 40, dur);
          matchingSongs.push({
            song_id: s.id || `${cat.slug}-${matchingSongs.length + 1}`,
            title: s.title,
            artist: s.artist,
            youtube_ids: [vId],
            duration_sec: dur,
            entry_sec: entry,
            exit_sec: exit,
            play_full: Boolean(s.playFull),
            era: 'post2020',
            language: cat.lang,
            subtype: slugToSubtype(cat.slug),
            energy: s.energy || 8,
            tags: [],
            style: 'party',
            unsure: false,
            heat: s.heat || Array.from({ length: 100 }, (_, i) => 0.5 + 0.4 * Math.sin(i / 10))
          });
        }
      }
    }
  }

  // 3. Deduplicate
  const seen = new Set();
  const deduped = [];
  for (const item of matchingSongs) {
    const key = `${item.title.toLowerCase()}::${item.artist.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(item);
    }
  }

  // 4. Return top 30
  const cues = deduped.slice(0, 30);
  return {
    cues,
    fillers: [],
    note: "Tonight's set, curated from official YouTube party hits. Tap APPROVE & PLAY.",
    more: "more-token-audify"
  };
}

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;

  if (req.method === 'GET') {
    return sendJson(res, 200, MASTER_COUNTS, 'public, max-age=60');
  }

  if (req.method === 'POST') {
    let body = {};
    try {
      body = await readJsonBody(req);
    } catch {}

    const localSet = buildSetFromCuratedDb(body);
    if (localSet.cues && localSet.cues.length >= 10) {
      return sendJson(res, 200, localSet);
    }

    // Upstream fallback if needed
    try {
      const remote = await fetch('https://www.naux.party/api/set', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(4000)
      });
      if (remote.ok) {
        const data = await remote.json();
        return sendJson(res, 200, data);
      }
    } catch (e) {
      console.warn('POST /api/set upstream fetch failed:', e.message);
    }

    return sendJson(res, 200, localSet);
  }

  res.setHeader('Allow', 'GET, POST');
  return sendJson(res, 405, { error: 'Method not allowed' });
}
