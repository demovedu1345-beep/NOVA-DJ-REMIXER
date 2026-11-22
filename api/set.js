import { handlePreflight, readJsonBody, sendJson } from './_lib/http.js';
import { CURATED_CATEGORIES_DB } from './_lib/curated-songs-db.js';
import { ARTISTS_DB, getArtistProfile } from './_lib/artists-db.js';

function computeMasterCounts() {
  const counts = {
    "language": 0,
    "language:punjabi": 0,
    "language:marathi": 0,
    "language:gujarati": 0,
    "language:tamil-telugu": 0,
    "language:kannada": 0,
    "language:marwadi": 0,
    "language:odia": 0,
    "language:bhojpuri-haryanvi": 0,
    "language:haryanvi-bhojpuri": 0,
    "hindi": 0,
    "english": 0,
    "artists": 500,
    "hindi:artists": 500,
    "english:artists": 500
  };

  for (const [k, cat] of Object.entries(CURATED_CATEGORIES_DB)) {
    const lang = cat.lang || 'hindi';
    const sub = k.replace(/^[a-z]+-/, '');
    const c = (cat.songs || []).length;
    counts[k] = c;
    if (lang === 'hindi') {
      counts.hindi += c;
      counts[`hindi:${sub}`] = c;
      counts[sub] = c;
    } else if (lang === 'english') {
      counts.english += c;
      counts[`english:${sub}`] = c;
      counts[sub] = c;
    } else {
      counts.language += c;
      counts[`language:${sub}`] = c;
      counts[sub] = c;
      if (k.startsWith('punjabi')) counts['language:punjabi'] += c;
      else if (k.startsWith('tamil-telugu')) counts['language:tamil-telugu'] += c;
      else if (k.startsWith('haryanvi-bhojpuri')) {
        counts['language:haryanvi-bhojpuri'] += c;
        counts['language:bhojpuri-haryanvi'] += c;
      }
      else if (k.startsWith('gujarati')) counts['language:gujarati'] += c;
      else if (k.startsWith('marathi')) counts['language:marathi'] += c;
      else if (k.startsWith('marwadi')) counts['language:marwadi'] += c;
      else if (k.startsWith('kannada')) counts['language:kannada'] += c;
      else if (k.startsWith('odia')) counts['language:odia'] += c;
    }
  }
  return { counts, unsure: 484 };
}

const MASTER_COUNTS = computeMasterCounts();

function slugToSubtype(slug) {
  return slug.replace(/^[a-z]+-/, '');
}

function slugMatchesSubtype(slug, subtype, requestedLangs = []) {
  const isFull = subtype.includes(':');
  const [lang, bareSub] = isFull ? subtype.split(':') : [null, subtype];
  const s = slug.toLowerCase();
  const b = (bareSub || subtype).toLowerCase();

  if (lang === 'language') {
    if (b === 'punjabi') return s.startsWith('punjabi');
    if (b === 'marathi') return s.startsWith('marathi');
    if (b === 'gujarati') return s.startsWith('gujarati');
    if (b === 'tamil-telugu') return s.startsWith('tamil-telugu');
    if (b === 'kannada') return s.startsWith('kannada');
    if (b === 'marwadi') return s.startsWith('marwadi');
    if (b === 'odia') return s.startsWith('odia');
    if (b === 'haryanvi-bhojpuri' || b === 'bhojpuri-haryanvi') return s.startsWith('haryanvi-bhojpuri');
    return false;
  }

  // Strict prefix matching when language prefix is explicit
  if (lang === 'hindi') {
    if (s === `hindi-${b}` || (b === 'diwali' && s === 'diwali-party-songs')) return true;
    return false;
  }
  if (lang === 'english') {
    if (s === `english-${b}` || (b === 'rock' && (s === 'english-rock' || s === 'english-classicrock'))) return true;
    return false;
  }

  // If requested languages filter is active, respect it
  if (requestedLangs && requestedLangs.length > 0) {
    const onlyEnglish = requestedLangs.includes('english') && !requestedLangs.includes('hindi');
    const onlyHindi = requestedLangs.includes('hindi') && !requestedLangs.includes('english');
    if (onlyEnglish && !s.startsWith('english')) return false;
    if (onlyHindi && s.startsWith('english')) return false;
  }

  // Bare subtype matches
  if (s === b || s === `hindi-${b}` || s === `english-${b}`) return true;
  if (b === 'diwali' && s === 'diwali-party-songs') return true;
  if (b === 'party' && (s === 'punjabi-party' || s === 'haryanvi-bhojpuri-party' || s === 'marathi-party')) return true;
  if (b === 'wedding' && s === 'punjabi-wedding') return true;
  if (b === 'sad' && s === 'punjabi-sad') return true;
  if (b === 'gym' && s === 'punjabi-gym') return true;
  if (b === 'garba' && s === 'gujarati-garba') return true;
  if (b === 'kuthu' && s === 'tamil-telugu-kuthu') return true;
  if (b === 'mass' && s === 'tamil-telugu-mass') return true;
  if (b === 'desi-beats' && s === 'haryanvi-bhojpuri-desi-beats') return true;

  return s.endsWith(`-${b}`) || s === b;
}

function catMatchesLang(catLang, requestedLangs) {
  const cl = (catLang || '').toLowerCase();
  for (const rl of requestedLangs) {
    if (cl === rl) return true;
    if (rl === 'language' && cl !== 'hindi' && cl !== 'english') return true;
    if ((rl === 'tamil-telugu' || rl === 'south') && (cl === 'south' || cl === 'tamil-telugu' || cl === 'tamil' || cl === 'telugu')) return true;
    if ((rl === 'haryanvi-bhojpuri' || rl === 'regional') && (cl === 'haryanvi-bhojpuri' || cl === 'regional' || cl === 'haryanvi' || cl === 'bhojpuri')) return true;
    if (rl === 'gujarati' && (cl === 'gujarati' || cl === 'garba')) return true;
    if (rl === 'marathi' && cl === 'marathi') return true;
    if (rl === 'marwadi' && (cl === 'marwadi' || cl === 'rajasthani')) return true;
    if (rl === 'kannada' && cl === 'kannada') return true;
    if (rl === 'odia' && cl === 'odia') return true;
  }
  return false;
}

const BLACKLIST_VIDS = new Set([
  '7PCkvCPvDXk', 'vX2cDW8LUWk', 'VAdGW7QDJUI', 'V7LwfY5U5WI',
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
  const requestedArtist = body?.artist || answers.artist;
  const rawLangs = answers.languages || answers.language || (body?.lang ? [body.lang] : []);
  const requestedLangs = (Array.isArray(rawLangs) ? rawLangs : [rawLangs]).map(l => String(l).toLowerCase());
  const requestedSubtypes = (answers.subtypes || (body?.kind ? [body.kind] : [])).map(s => String(s).toLowerCase());
  const energy = answers.energy || 'peak';

  // 1. DIRECT ARTIST SET SUPPORT: If an artist is requested, return their complete verified discography
  if (requestedArtist) {
    const artProfile = getArtistProfile(requestedArtist, requestedLangs[0]);
    if (artProfile && artProfile.songs && artProfile.songs.length > 0) {
      const isShuffle = Boolean(body?.shuffle || answers.shuffle);
      const artistSongs = isShuffle ? shuffleArray(artProfile.songs) : [...artProfile.songs];
      const cues = [];
      const seenVideos = new Set();
      const seenTitles = new Set();

      for (const s of artistSongs) {
        const vId = s.videoId || (s.youtube_ids && s.youtube_ids[0]);
        if (!vId || vId.length !== 11 || BLACKLIST_VIDS.has(vId) || seenVideos.has(vId)) continue;
        const titleKey = (s.title || '').toLowerCase().trim();
        if (seenTitles.has(titleKey)) continue;

        seenVideos.add(vId);
        seenTitles.add(titleKey);

        const dur = Number(s.durationSec) || 210;
        const entry = Number.isFinite(s.entrySec) ? s.entrySec : (Number.isFinite(s.hookStartSec) ? s.hookStartSec : 35);
        const exit = Number.isFinite(s.exitSec) ? s.exitSec : (Number.isFinite(s.hookEndSec) ? s.hookEndSec : Math.min(entry + 42, dur));

        cues.push({
          song_id: s.id || `artist-${artProfile.id}-${cues.length + 1}`,
          title: s.title,
          artist: s.artist,
          youtube_ids: [vId],
          duration_sec: dur,
          entry_sec: entry,
          exit_sec: exit,
          play_full: Boolean(s.playFull),
          era: s.year && Number(s.year) < 2010 ? 'pre2020' : 'post2020',
          language: artProfile.lang || 'hindi',
          subtype: 'artist',
          energy: s.energy || (energy === 'bangers' ? 9 : 8),
          tags: artProfile.subcategories || [],
          style: 'artist-discography',
          unsure: false,
          heat: s.heat || Array.from({ length: 100 }, (_, i) => +(0.5 + 0.4 * Math.sin(i / 10)).toFixed(3))
        });
      }

      if (cues.length > 0) {
        return {
          cues,
          fillers: [],
          note: `${artProfile.name} Complete Discography (${cues.length} tracks). Tap APPROVE & PLAY.`,
          more: "more-token-audify",
          artist: {
            id: artProfile.id,
            name: artProfile.name,
            image: artProfile.image,
            bio: artProfile.bio,
            subcategories: artProfile.subcategories
          }
        };
      }
    }
  }

  let candidatePool = [];
  const allCategories = Object.values(CURATED_CATEGORIES_DB);

  // 2. If specific subtypes are requested, pull strictly from matching categories
  if (requestedSubtypes.length > 0) {
    for (const sub of requestedSubtypes) {
      for (const cat of allCategories) {
        if (slugMatchesSubtype(cat.slug, sub, requestedLangs)) {
          if (requestedLangs.length > 0 && !catMatchesLang(cat.lang, requestedLangs)) {
            continue;
          }
          const songs = shuffleArray(cat.songs || []);
          for (const s of songs) {
            candidatePool.push({ song: s, cat });
          }
        }
      }
    }
  } else if (requestedLangs.length > 0) {
    // 3. If only languages are requested, pull an even balanced mix from all categories of that language
    for (const cat of allCategories) {
      if (catMatchesLang(cat.lang, requestedLangs)) {
        const songs = shuffleArray(cat.songs || []).slice(0, 40);
        for (const s of songs) {
          candidatePool.push({ song: s, cat });
        }
      }
    }
  }

  // 4. Fallback if candidate pool is empty
  if (!candidatePool.length) {
    for (const cat of allCategories) {
      const songs = shuffleArray(cat.songs || []).slice(0, 20);
      for (const s of songs) {
        candidatePool.push({ song: s, cat });
      }
    }
  }

  // 5. Shuffle candidate pool
  candidatePool = shuffleArray(candidatePool);

  // 6. Convert to cue format & deduplicate by title AND videoId
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
