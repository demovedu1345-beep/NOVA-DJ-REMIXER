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
      if (k === 'diwali-party-songs') {
        counts['hindi:diwali'] = c;
        counts['diwali'] = c;
      }
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
    const onlyEnglish = requestedLangs.includes('english') && !requestedLangs.includes('hindi') && !requestedLangs.includes('language');
    const onlyHindi = requestedLangs.includes('hindi') && !requestedLangs.includes('english') && !requestedLangs.includes('language') && !requestedLangs.includes('odia') && !requestedLangs.includes('south') && !requestedLangs.includes('punjabi');
    if (onlyEnglish && !s.startsWith('english')) return false;
    if (onlyHindi && (s.startsWith('english') || s.startsWith('odia') || s.startsWith('punjabi') || s.startsWith('tamil-telugu') || s.startsWith('kannada') || s.startsWith('marathi') || s.startsWith('gujarati') || s.startsWith('marwadi') || s.startsWith('haryanvi-bhojpuri'))) return false;
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
  const onlyHindi = requestedLangs.includes('hindi') && !requestedLangs.includes('english') && !requestedLangs.includes('language') && !requestedLangs.includes('odia') && !requestedLangs.includes('south') && !requestedLangs.includes('punjabi') && !requestedLangs.includes('marathi') && !requestedLangs.includes('gujarati') && !requestedLangs.includes('kannada') && !requestedLangs.includes('marwadi') && !requestedLangs.includes('bhojpuri') && !requestedLangs.includes('haryanvi');
  const onlyEnglish = requestedLangs.includes('english') && !requestedLangs.includes('hindi') && !requestedLangs.includes('language');
  if (onlyHindi) return cl === 'hindi';
  if (onlyEnglish) return cl === 'english';

  for (const rl of requestedLangs) {
    if (cl === rl) return true;
    if (rl === 'language' && cl !== 'hindi' && cl !== 'english') return true;
    if (rl === 'punjabi' && cl === 'punjabi') return true;
    if ((rl === 'tamil-telugu' || rl === 'south' || rl === 'tamil' || rl === 'telugu') && (cl === 'south' || cl === 'tamil-telugu' || cl === 'tamil' || cl === 'telugu')) return true;
    if ((rl === 'haryanvi-bhojpuri' || rl === 'regional' || rl === 'haryanvi' || rl === 'bhojpuri') && (cl === 'haryanvi-bhojpuri' || cl === 'regional' || cl === 'haryanvi' || cl === 'bhojpuri')) return true;
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

function decodeMoreToken(token) {
  if (!token || typeof token !== 'string' || !token.startsWith('audify1:')) return null;
  try {
    return JSON.parse(Buffer.from(token.slice(8), 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

function encodeMoreToken(payload) {
  return 'audify1:' + Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

function toCue(s, cat, idx = 0, energy = 'peak', langOverride = null, subtypeOverride = null) {
  const vId = s.videoId || (s.youtube_ids && s.youtube_ids[0]);
  const dur = Number(s.durationSec) || 210;
  const entry = Number.isFinite(s.entrySec) ? s.entrySec : (Number.isFinite(s.hookStartSec) ? s.hookStartSec : 35);
  const exit = Number.isFinite(s.exitSec) ? s.exitSec : (Number.isFinite(s.hookEndSec) ? s.hookEndSec : Math.min(entry + 42, dur));
  return {
    song_id: s.id || `${cat?.slug || 'track'}-${idx + 1}`,
    title: s.title,
    artist: s.artist,
    youtube_ids: [vId],
    duration_sec: dur,
    entry_sec: entry,
    exit_sec: exit,
    ...(s.bpm ? { bpm: s.bpm } : {}),
    play_full: Boolean(s.playFull),
    era: s.year && Number(s.year) < 2010 ? 'pre2020' : 'post2020',
    language: langOverride || cat?.lang || 'hindi',
    subtype: subtypeOverride || (cat?.slug ? slugToSubtype(cat.slug) : 'party'),
    energy: s.energy || (energy === 'bangers' ? 9 : 8),
    tags: [],
    style: 'party',
    unsure: false,
    heat: s.heat || Array.from({ length: 100 }, (_, i) => +(0.5 + 0.4 * Math.sin(i / 10)).toFixed(3))
  };
}

function getAllCatalogEntries() {
  const entries = [];
  for (const cat of Object.values(CURATED_CATEGORIES_DB)) {
    for (const s of (cat.songs || [])) {
      entries.push({ song: s, cat });
    }
  }
  for (const [langKey, list] of Object.entries(ARTISTS_DB || {})) {
    const items = Array.isArray(list) ? list : Object.values(list || {});
    for (const art of items) {
      const cat = { slug: `${langKey}-artists`, lang: art.lang || langKey };
      for (const s of (art.songs || [])) {
        entries.push({ song: s, cat });
      }
    }
  }
  return entries;
}

function buildSetFromCuratedDb(body) {
  const tokenData = decodeMoreToken(body?.more);
  const answers = (body?.answers && Object.keys(body.answers).length > 0)
    ? body.answers
    : (tokenData?.answers || {});
  const requestedArtist = body?.artist || answers.artist || tokenData?.artist;

  const rawLangs = answers.languages || answers.language || (body?.lang ? [body.lang] : (tokenData?.lang ? [tokenData.lang] : []));
  const requestedLangs = (Array.isArray(rawLangs) ? rawLangs : [rawLangs]).filter(Boolean).map(l => String(l).toLowerCase());
  const rawSubs = answers.subtypes || (body?.kind ? [body.kind] : (tokenData?.kind ? [tokenData.kind] : []));
  const requestedSubtypes = (Array.isArray(rawSubs) ? rawSubs : [rawSubs]).filter(Boolean).map(s => String(s).toLowerCase());

  // Deep extraction for category, genre, prompt, preset, mood, vibe, style, subtype
  const inputGenre = String(body?.genre || body?.category || body?.subtype || body?.style || body?.preset || body?.mood || body?.vibe || '').trim().toLowerCase();
  if (inputGenre) {
    if (inputGenre.includes(':')) {
      const [gLang, gSub] = inputGenre.split(':');
      if (gLang && !requestedLangs.includes(gLang)) requestedLangs.push(gLang);
      if (gSub && !requestedSubtypes.includes(inputGenre)) requestedSubtypes.push(inputGenre, gSub);
    } else if (inputGenre.startsWith('hindi-') || inputGenre.startsWith('english-') || inputGenre.startsWith('punjabi-') || inputGenre.startsWith('gujarati-') || inputGenre.startsWith('marathi-') || inputGenre.startsWith('kannada-') || inputGenre.startsWith('odia-') || inputGenre.startsWith('marwadi-') || inputGenre.startsWith('tamil-telugu-') || inputGenre.startsWith('haryanvi-bhojpuri-')) {
      const gLang = inputGenre.split('-')[0];
      const gSub = inputGenre.slice(gLang.length + 1);
      const mappedLang = gLang === 'tamil' ? 'tamil-telugu' : gLang;
      if (!requestedLangs.includes(mappedLang)) requestedLangs.push(mappedLang);
      if (!requestedSubtypes.includes(inputGenre)) requestedSubtypes.push(inputGenre, `${mappedLang}:${gSub}`, gSub);
    } else if (['hindi', 'english', 'punjabi', 'marathi', 'gujarati', 'kannada', 'odia', 'marwadi', 'bhojpuri', 'haryanvi', 'tamil', 'telugu', 'south', 'regional', 'language'].includes(inputGenre)) {
      const mapped = inputGenre === 'tamil' || inputGenre === 'telugu' ? 'tamil-telugu' : (inputGenre === 'bhojpuri' || inputGenre === 'haryanvi' ? 'haryanvi-bhojpuri' : inputGenre);
      if (!requestedLangs.includes(mapped)) requestedLangs.push(mapped);
      if (inputGenre !== 'hindi' && inputGenre !== 'english') {
        const subTag = `language:${inputGenre}`;
        if (!requestedSubtypes.includes(subTag)) requestedSubtypes.push(subTag, inputGenre);
      }
    } else {
      if (!requestedSubtypes.includes(inputGenre)) requestedSubtypes.push(inputGenre);
    }
  }

  const energy = answers.energy || 'peak';
  const excludedIds = new Set([
    ...(Array.isArray(body?.exclude) ? body.exclude : []),
    ...(Array.isArray(body?.have) ? body.have : []),
    ...(Array.isArray(body?.done) ? body.done : [])
  ].map(x => String(x).toLowerCase()));

  // 0a. Direct song IDs lookup (fetchSongs)
  if (Array.isArray(body?.ids) && body.ids.length > 0) {
    const want = new Set(body.ids.map(x => String(x)));
    const cues = [];
    const seen = new Set();
    for (const { song: s, cat } of getAllCatalogEntries()) {
      const vId = s.videoId || (s.youtube_ids && s.youtube_ids[0]);
      if (!vId || vId.length !== 11 || BLACKLIST_VIDS.has(vId)) continue;
      if (!want.has(String(s.id)) && !want.has(String(vId))) continue;
      if (seen.has(vId)) continue;
      seen.add(vId);
      cues.push(toCue(s, cat, cues.length, energy));
    }
    return { cues, fillers: [], note: 'Loaded requested tracks.', more: null };
  }

  // 0b. Direct song/artist search (searchSongs)
  if (typeof body?.q === 'string' && body.q.trim().length > 0) {
    const q = body.q.trim().toLowerCase();
    const terms = q.split(/\s+/).filter(Boolean);
    const scored = [];
    const seenVideos = new Set();
    const seenTitles = new Set();
    for (const { song: s, cat } of getAllCatalogEntries()) {
      if (requestedLangs.length > 0 && !catMatchesLang(cat.lang, requestedLangs)) continue;
      const vId = s.videoId || (s.youtube_ids && s.youtube_ids[0]);
      if (!vId || vId.length !== 11 || BLACKLIST_VIDS.has(vId)) continue;
      if (excludedIds.has(String(s.id || '').toLowerCase()) || excludedIds.has(vId.toLowerCase())) continue;
      const title = (s.title || '').toLowerCase();
      const artist = (s.artist || '').toLowerCase();
      const hay = `${title} ${artist} ${cat.slug || ''}`;
      if (!terms.every(t => hay.includes(t))) continue;
      const titleKey = `${title.trim()}|${artist.split(',')[0].trim()}`;
      if (seenVideos.has(vId) || seenTitles.has(titleKey)) continue;
      seenVideos.add(vId);
      seenTitles.add(titleKey);
      let score = 0;
      if (title === q) score += 100;
      else if (title.startsWith(q)) score += 60;
      else if (title.includes(q)) score += 35;
      if (artist.includes(q)) score += 25;
      scored.push({ score, cue: toCue(s, cat, scored.length, energy) });
    }
    scored.sort((a, b) => b.score - a.score);
    return { cues: scored.slice(0, 40).map(x => x.cue), fillers: [], note: `Search results for "${body.q.trim()}".`, more: null };
  }

  const nextMoreToken = encodeMoreToken({
    answers: {
      languages: requestedLangs,
      subtypes: requestedSubtypes,
      ...(answers.time ? { time: answers.time } : {}),
      ...(answers.crowd ? { crowd: answers.crowd } : {}),
      ...(answers.energy ? { energy: answers.energy } : {})
    },
    ...(requestedArtist ? { artist: requestedArtist } : {}),
    page: (tokenData?.page || 0) + 1
  });

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
        if (excludedIds.has(String(s.id || '').toLowerCase()) || excludedIds.has(vId.toLowerCase())) continue;
        const titleKey = (s.title || '').toLowerCase().trim();
        if (seenTitles.has(titleKey)) continue;

        seenVideos.add(vId);
        seenTitles.add(titleKey);

        const cue = toCue(s, { slug: `artist-${artProfile.id}`, lang: artProfile.lang || 'hindi' }, cues.length, energy, artProfile.lang || 'hindi', 'artist');
        cue.tags = artProfile.subcategories || [];
        cue.style = 'artist-discography';
        cues.push(cue);
      }

      if (cues.length > 0) {
        return {
          cues,
          fillers: [],
          note: `${artProfile.name} Complete Discography (${cues.length} tracks). Tap APPROVE & PLAY.`,
          more: nextMoreToken,
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
      if (sub === 'hindi:artists' || sub === 'english:artists' || sub === 'artists') {
        const artLang = sub.startsWith('english') ? 'english' : (sub.startsWith('hindi') ? 'hindi' : (requestedLangs[0] || 'hindi'));
        const list = ARTISTS_DB?.[artLang];
        const items = Array.isArray(list) ? list : Object.values(list || {});
        for (const art of items) {
          const cat = { slug: `${artLang}-artists`, lang: art.lang || artLang };
          for (const s of (art.songs || [])) {
            candidatePool.push({ song: s, cat });
          }
        }
        continue;
      }
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

  // 4. Fallback ONLY within requestedLangs (never cross-language when a language is selected)
  if (!candidatePool.length) {
    for (const cat of allCategories) {
      if (requestedLangs.length > 0 && !catMatchesLang(cat.lang, requestedLangs)) {
        continue;
      }
      const songs = shuffleArray(cat.songs || []).slice(0, 30);
      for (const s of songs) {
        candidatePool.push({ song: s, cat });
      }
    }
  }

  // 5. Shuffle candidate pool
  candidatePool = shuffleArray(candidatePool);

  // 6. Convert to cue format & deduplicate by title AND videoId AND exclude already-played tracks
  const seenTitles = new Set();
  const seenVideos = new Set();
  const cues = [];

  const isStrictEnglish = requestedLangs.includes('english') && !requestedLangs.includes('hindi') && !requestedLangs.includes('language');
  const isStrictHindi = requestedLangs.includes('hindi') && !requestedLangs.includes('english') && !requestedLangs.includes('language') && !requestedLangs.includes('odia') && !requestedLangs.includes('south') && !requestedLangs.includes('punjabi');

  const collectFromPool = (pool, ignoreExcluded = false) => {
    for (const { song: s, cat } of pool) {
      if (isStrictEnglish && cat.lang !== 'english') continue;
      if (isStrictHindi && cat.lang !== 'hindi') continue;
      if (requestedLangs.length > 0 && !catMatchesLang(cat.lang, requestedLangs)) continue;
      const vId = s.videoId || (s.youtube_ids && s.youtube_ids[0]);
      if (!vId || vId.length !== 11 || BLACKLIST_VIDS.has(vId)) continue;
      const sIdLower = String(s.id || '').toLowerCase();
      if (!ignoreExcluded && (excludedIds.has(sIdLower) || excludedIds.has(vId.toLowerCase()))) continue;
      const titleKey = (s.title || '').toLowerCase().trim();

      if (seenTitles.has(titleKey)) continue;
      if (seenVideos.has(vId)) continue;

      seenTitles.add(titleKey);
      seenVideos.add(vId);

      cues.push(toCue(s, cat, cues.length, energy, cat.lang || (isStrictEnglish ? 'english' : 'hindi')));
      if (cues.length >= 100) break;
    }
  };

  collectFromPool(candidatePool, false);

  // If candidate pool tracks were already played (fetchMore / pagination)
  if (cues.length === 0) {
    if (requestedSubtypes.length > 0) {
      // Strictly reshuffle the requested subtype pool without leaking cross-genre tracks
      collectFromPool(candidatePool, true);
    } else if (requestedLangs.length > 0) {
      // If only language was requested (no specific subtype), try other categories of the same language
      const sameLangPool = [];
      for (const cat of allCategories) {
        if (catMatchesLang(cat.lang, requestedLangs)) {
          for (const s of shuffleArray(cat.songs || []).slice(0, 30)) {
            sameLangPool.push({ song: s, cat });
          }
        }
      }
      collectFromPool(shuffleArray(sameLangPool), false);
      if (cues.length === 0) {
        collectFromPool(candidatePool, true);
      }
    } else {
      collectFromPool(candidatePool, true);
    }
  }

  return {
    cues,
    fillers: [],
    note: "Tonight's set, curated from official YouTube party hits. Tap APPROVE & PLAY.",
    more: nextMoreToken
  };
}

export { buildSetFromCuratedDb };
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
    return sendJson(res, 200, localSet);
  }

  res.setHeader('Allow', 'GET, POST');
  return sendJson(res, 405, { error: 'Method not allowed' });
}
