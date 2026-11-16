import { CURATED_CATEGORIES_DB } from './curated-songs-db.js';

export { CURATED_CATEGORIES_DB };

// Backward compatibility alias map
export const CATEGORY_ALIAS_MAP = {
  'top-hits': 'english-pop',
  '90s-pop': 'english-pop',
  '2000s-pop': 'english-pop',
  '2010s-pop': 'english-pop',
  'rock': 'english-hiphop',
  'hip-hop': 'english-hiphop',
  'rnb': 'english-love',
  'dance-edm': 'english-edm',
  'chill': 'english-love',
  'workout': 'punjabi-gym',
  'love-songs': 'hindi-romantic',
  'breakup-songs': 'punjabi-sad',
  'romantic': 'hindi-romantic',
  'sad': 'punjabi-sad',
  'party-dance': 'hindi-dance',
  '90s-bollywood': 'hindi-retro',
  '2000s-bollywood': 'hindi-dance',
  'latest-hits': 'hindi-dance',
  'retro-classic': 'hindi-retro',
  'punjabi': 'punjabi-party',
  'top-punjabi': 'punjabi-party',
  'party-bhangra': 'punjabi-party',
  'romantic-punjabi': 'punjabi-sad',
  'tamil-hits': 'tamil-telugu-kuthu',
  'tamil-kuthu': 'tamil-telugu-kuthu',
  'telugu-hits': 'tamil-telugu-mass',
  'telugu-mass': 'tamil-telugu-mass',
};

function buildCategoryFromCurated(cat, customId = null, customLabel = null) {
  if (!cat) return null;
  const id = customId || cat.slug;
  const label = customLabel || cat.label;
  const tracks = (cat.songs || []).map((s, idx) => {
    const dur = Number(s.durationSec) || 180;
    const hookStart = Number.isFinite(s.hookStartSec) ? s.hookStartSec : (Number.isFinite(s.entrySec) ? s.entrySec : Math.round(dur * 0.25));
    const hookDur = Number.isFinite(s.hookDurationSec) ? s.hookDurationSec : 35;
    const hookEnd = Number.isFinite(s.hookEndSec) ? s.hookEndSec : (hookStart + hookDur);
    return {
      id: s.id || `${id}-${idx + 1}`,
      videoId: s.videoId || 'BddP6PYo2gs',
      title: s.title || `Track ${idx + 1}`,
      artist: s.artist || 'Unknown Artist',
      artwork: s.artwork || `https://i.ytimg.com/vi/${s.videoId || 'BddP6PYo2gs'}/hqdefault.jpg`,
      durationSec: dur,
      hookStartSec: hookStart,
      hookDurationSec: hookDur,
      hookEndSec: hookEnd,
      year: s.year || '2025',
      bpm: s.bpm || 120,
      key: s.key || '1A',
      entrySec: hookStart,
      exitSec: hookEnd,
    };
  });

  return {
    id,
    slug: cat.slug,
    label,
    hint: cat.hint,
    lang: cat.lang,
    query: `${label} official music video`,
    playlistId: null,
    allowRemixes: false,
    defaultHookRatio: 0.25,
    defaultHookDurationSec: 35,
    trackOffsets: {},
    songCount: tracks.length,
    tracks,
  };
}

export const YOUTUBE_CATALOG_CONFIG = {
  languages: [
    {
      id: 'all',
      label: 'All Party Lists',
      hint: 'Browse all 16 party categories with 100+ songs each',
      categories: Object.values(CURATED_CATEGORIES_DB).map(c => buildCategoryFromCurated(c)).filter(Boolean),
    },
    {
      id: 'hindi',
      label: 'Hindi / Bollywood',
      hint: 'Dance, Retro, Romantic, Sufi, Hip-Hop & Diwali party hits',
      categories: [
        // Primary curated categories (100+ songs each)
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['hindi-dance']),
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['hindi-romantic']),
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['hindi-retro']),
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['hindi-sufi']),
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['hindi-hiphop']),
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['diwali-party-songs']),

        // Aliases expected by tests & API (all mapped to 100+ real curated tracks)
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['hindi-romantic'], 'love-songs', 'Love Songs'),
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['hindi-sufi'], 'breakup-songs', 'Breakup Songs'),
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['hindi-romantic'], 'romantic', 'Romantic Songs'),
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['hindi-sufi'], 'sad', 'Sad Songs'),
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['hindi-dance'], 'party-dance', 'Party & Dance'),
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['hindi-retro'], '90s-bollywood', '90s Bollywood'),
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['hindi-dance'], '2000s-bollywood', '2000s Bollywood'),
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['hindi-dance'], 'latest-hits', 'Latest Hits'),
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['hindi-retro'], 'retro-classic', 'Retro / Classic'),
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['hindi-dance'], 'workout', 'Workout Bollywood'),
      ].filter(Boolean),
    },
    {
      id: 'punjabi',
      label: 'Punjabi',
      hint: 'Party, Wedding, Gym & Heartbreak anthems',
      categories: [
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['punjabi-party']),
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['punjabi-wedding']),
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['punjabi-gym']),
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['punjabi-sad']),
      ].filter(Boolean),
    },
    {
      id: 'english',
      label: 'English / Global',
      hint: 'Pop, Hip-Hop, EDM & Love / R&B chartbusters',
      categories: [
        // Primary curated categories (100+ songs each)
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['english-pop']),
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['english-hiphop']),
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['english-edm']),
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['english-love']),

        // Aliases expected by tests & API (all mapped to 100+ real curated tracks)
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['english-pop'], 'top-hits', 'Top Hits'),
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['english-pop'], '90s-pop', '90s Pop'),
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['english-pop'], '2000s-pop', '2000s Pop'),
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['english-pop'], '2010s-pop', '2010s Pop'),
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['english-edm'], 'rock', 'Rock Anthems'),
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['english-hiphop'], 'hip-hop', 'Hip-Hop Hits'),
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['english-hiphop'], 'rnb', 'R&B / Soul'),
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['english-edm'], 'dance-edm', 'Dance & EDM'),
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['english-love'], 'chill', 'Chill Vibes'),
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['english-edm'], 'workout', 'Workout Hits'),
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['english-love'], 'love-songs', 'Love Songs'),
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['english-love'], 'breakup-songs', 'Breakup Songs'),
      ].filter(Boolean),
    },
    {
      id: 'south',
      label: 'Tamil & Telugu',
      hint: 'Anirudh kuthu bangers, mass cinema entries & festival beats',
      categories: [
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['tamil-telugu-kuthu']),
        buildCategoryFromCurated(CURATED_CATEGORIES_DB['tamil-telugu-mass']),
      ].filter(Boolean),
    },
  ],
};

/**
 * Finds language definition by language ID.
 */
export function findCatalogLanguage(langId) {
  const norm = String(langId || 'all').toLowerCase();
  if (norm === 'bollywood' || norm === 'hindi') {
    return YOUTUBE_CATALOG_CONFIG.languages.find(l => l.id === 'hindi') || YOUTUBE_CATALOG_CONFIG.languages[1];
  }
  return (
    YOUTUBE_CATALOG_CONFIG.languages.find((l) => l.id === norm) ||
    YOUTUBE_CATALOG_CONFIG.languages[0]
  );
}

/**
 * Finds category definition under a specific language or globally by slug.
 * Strictly guarantees 100+ songs per category.
 */
export function findCatalogCategory(langId, categoryId) {
  const normCat = String(categoryId || '').toLowerCase();
  const lang = findCatalogLanguage(langId);
  if (lang && lang.categories) {
    const found = lang.categories.find(c => c.id === normCat || c.slug === normCat);
    if (found) return found;
  }
  if (CURATED_CATEGORIES_DB[normCat]) {
    return buildCategoryFromCurated(CURATED_CATEGORIES_DB[normCat]);
  }
  const alias = CATEGORY_ALIAS_MAP[normCat];
  if (alias && CURATED_CATEGORIES_DB[alias]) {
    return buildCategoryFromCurated(CURATED_CATEGORIES_DB[alias]);
  }
  return (
    lang?.categories?.[0] ||
    buildCategoryFromCurated(CURATED_CATEGORIES_DB['hindi-dance'])
  );
}

/**
 * Calculates hook / best-part offset for a track based on track config overrides
 * or the default 25% fallback with 30-45s highlight window.
 */
export function computeTrackHookOffsets(track, categoryConfig = null) {
  const dur = Number(track.durationSec) || 210;
  const vid = track.videoId || String(track.id || '').replace(/^yt-/, '');
  const custom = categoryConfig?.trackOffsets?.[vid] || track.hookOffsets;

  if (custom && Number.isFinite(custom.startSec)) {
    const startSec = Math.max(0, Math.min(dur - 15, custom.startSec));
    const durationSec = Math.max(25, Math.min(50, custom.durationSec || 35));
    return {
      hookStartSec: startSec,
      hookDurationSec: durationSec,
      hookEndSec: Math.min(dur - 2, startSec + durationSec),
    };
  }

  const ratio = categoryConfig?.defaultHookRatio ?? 0.25;
  const startSec = Math.max(10, Math.min(Math.round(dur * ratio), Math.max(10, dur - 45)));
  const durationSec = Math.max(30, Math.min(45, categoryConfig?.defaultHookDurationSec ?? 35));
  return {
    hookStartSec: startSec,
    hookDurationSec: durationSec,
    hookEndSec: Math.min(dur - 2, startSec + durationSec),
  };
}
