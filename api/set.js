import { handlePreflight, readJsonBody, sendJson } from './_lib/http.js';
import { CURATED_CATEGORIES_DB } from './_lib/curated-songs-db.js';

const MASTER_COUNTS = {
  "counts": {
    "hindi": 1003,
    "hindi:diwali": 80,
    "hindi:dance": 253,
    "hindi:romantic": 200,
    "hindi:retro": 220,
    "hindi:sufi": 133,
    "hindi:hiphop": 117,
    "punjabi": 889,
    "punjabi:party": 385,
    "punjabi:wedding": 169,
    "punjabi:sad": 110,
    "punjabi:gym": 225,
    "english": 467,
    "english:pop": 136,
    "english:edm": 104,
    "english:hiphop": 108,
    "english:love": 119,
    "tamil-telugu": 245,
    "tamil-telugu:kuthu": 113,
    "tamil-telugu:mass": 132,
    "haryanvi-bhojpuri": 243,
    "haryanvi-bhojpuri:party": 113,
    "haryanvi-bhojpuri:desi-beats": 130,
    "gujarati": 75,
    "gujarati:garba": 75
  },
  "unsure": 484
};

function slugToSubtype(slug) {
  return slug.replace(/^[a-z]+-/, '');
}

function slugMatchesSubtype(slug, subtype) {
  const isFull = subtype.includes(':');
  const [lang, bareSub] = isFull ? subtype.split(':') : [null, subtype];
  const s = slug.toLowerCase();

  if (lang === 'hindi' && bareSub === 'hiphop') return s === 'hindi-hiphop';
  if (lang === 'english' && bareSub === 'hiphop') return s === 'english-hiphop';
  if (lang === 'punjabi' && bareSub === 'party') return s === 'punjabi-party';
  if (lang === 'haryanvi-bhojpuri' && bareSub === 'party') return s === 'haryanvi-bhojpuri-party';

  const bare = (bareSub || subtype).toLowerCase();
  if (bare === 'diwali') return s === 'diwali-party-songs';
  if (bare === 'dance') return s === 'hindi-dance';
  if (bare === 'retro') return s === 'hindi-retro';
  if (bare === 'romantic') return s === 'hindi-romantic';
  if (bare === 'sufi') return s === 'hindi-sufi';
  if (bare === 'hiphop') return s === 'hindi-hiphop';
  if (bare === 'party') return s === 'punjabi-party' || s === 'haryanvi-bhojpuri-party';
  if (bare === 'wedding') return s === 'punjabi-wedding';
  if (bare === 'sad') return s === 'punjabi-sad';
  if (bare === 'gym') return s === 'punjabi-gym';
  if (bare === 'pop') return s === 'english-pop';
  if (bare === 'edm') return s === 'english-edm';
  if (bare === 'love') return s === 'english-love';
  if (bare === 'kuthu') return s === 'tamil-telugu-kuthu';
  if (bare === 'mass') return s === 'tamil-telugu-mass';
  if (bare === 'desi-beats') return s === 'haryanvi-bhojpuri-desi-beats';
  if (bare === 'garba') return s === 'gujarati-garba';
  return s.includes(bare);
}

function catMatchesLang(catLang, requestedLangs) {
  const cl = (catLang || '').toLowerCase();
  for (const rl of requestedLangs) {
    if (cl === rl) return true;
    if ((rl === 'tamil-telugu' || rl === 'south') && (cl === 'south' || cl === 'tamil-telugu' || cl === 'tamil' || cl === 'telugu')) return true;
    if ((rl === 'haryanvi-bhojpuri' || rl === 'regional') && (cl === 'haryanvi-bhojpuri' || cl === 'regional')) return true;
    if (rl === 'gujarati' && (cl === 'gujarati' || cl === 'garba')) return true;
  }
  return false;
}

const BLACKLIST_VIDS = new Set([
  'BddP6PYo2gs', '7PCkvCPvDXk', 'vX2cDW8LUWk', 'VAdGW7QDJUI', 'V7LwfY5U5WI',
  'CZt-rVn2BJs', 'Gr8G_ldltDE', 'GftlBD-Apu8', 'k_WdQe_6k4g'
]);

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildSetFromCuratedDb(body) {
  const answers = body?.answers || {};
  const requestedLangs = (answers.languages || []).map(l => String(l).toLowerCase());
  const requestedSubtypes = (answers.subtypes || []).map(s => String(s).toLowerCase());
  const energy = answers.energy || 'peak';

  let candidatePool = [];
  const allCategories = Object.values(CURATED_CATEGORIES_DB);

  // 1. If specific subtypes are requested, pull from those exact categories
  if (requestedSubtypes.length > 0) {
    for (const sub of requestedSubtypes) {
      for (const cat of allCategories) {
        if (slugMatchesSubtype(cat.slug, sub)) {
          const songs = shuffleArray(cat.songs || []);
          for (const s of songs) {
            candidatePool.push({ song: s, cat });
          }
        }
      }
    }
  } else if (requestedLangs.length > 0) {
    // 2. If only languages are requested, pull an even balanced mix from all categories of that language
    for (const cat of allCategories) {
      if (catMatchesLang(cat.lang, requestedLangs)) {
        const songs = shuffleArray(cat.songs || []).slice(0, 40);
        for (const s of songs) {
          candidatePool.push({ song: s, cat });
        }
      }
    }
  }

  // 3. Fallback if candidate pool is empty
  if (!candidatePool.length) {
    for (const cat of allCategories) {
      const songs = shuffleArray(cat.songs || []).slice(0, 20);
      for (const s of songs) {
        candidatePool.push({ song: s, cat });
      }
    }
  }

  // 4. Shuffle candidate pool
  candidatePool = shuffleArray(candidatePool);

  // 5. Convert to cue format & deduplicate by title AND videoId
  const seenTitles = new Set();
  const seenVideos = new Set();
  const cues = [];

  for (const { song: s, cat } of candidatePool) {
    const vId = s.videoId || (s.youtube_ids && s.youtube_ids[0]);
    if (!vId || vId.length !== 11 || BLACKLIST_VIDS.has(vId)) continue;
    const titleKey = (s.title || '').toLowerCase().trim();

    if (seenTitles.has(titleKey)) continue;
    if (seenVideos.has(vId)) continue;

    seenTitles.add(titleKey);
    seenVideos.add(vId);

    const dur = Number(s.durationSec) || 210;
    const entry = Number.isFinite(s.entrySec) ? s.entrySec : (Number.isFinite(s.hookStartSec) ? s.hookStartSec : 35);
    const exit = Number.isFinite(s.exitSec) ? s.exitSec : (Number.isFinite(s.hookEndSec) ? s.hookEndSec : Math.min(entry + 42, dur));

    cues.push({
      song_id: s.id || `${cat.slug}-${cues.length + 1}`,
      title: s.title,
      artist: s.artist,
      youtube_ids: [vId],
      duration_sec: dur,
      entry_sec: entry,
      exit_sec: exit,
      play_full: Boolean(s.playFull),
      era: s.year && Number(s.year) < 2010 ? 'pre2020' : 'post2020',
      language: cat.lang || 'hindi',
      subtype: slugToSubtype(cat.slug),
      energy: s.energy || (energy === 'bangers' ? 9 : 8),
      tags: [],
      style: 'party',
      unsure: false,
      heat: s.heat || Array.from({ length: 100 }, (_, i) => +(0.5 + 0.4 * Math.sin(i / 10)).toFixed(3))
    });

    if (cues.length >= 100) break;
  }

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
