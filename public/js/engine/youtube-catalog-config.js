/**
 * Curated YouTube Music Catalog Configuration
 * Single source of truth for Languages, Categories, Search Queries, Curated Playlist IDs,
 * and per-track Hook / Best-Part Offsets.
 *
 * Edit search queries, playlist IDs, or track hook offsets here without modifying application logic.
 */

export const YOUTUBE_CATALOG_CONFIG = {
  languages: [
    {
      id: 'english',
      label: 'English / Hollywood',
      hint: 'Top Hits · Pop · Hip-Hop · Rock · R&B',
      categories: [
        {
          id: 'top-hits',
          label: 'Top Hits',
          hint: 'Billboard & Global Chart Toppers',
          query: 'Billboard Hot 100 top music hits official video',
          playlistId: null,
          allowRemixes: false,
          defaultHookRatio: 0.25,
          defaultHookDurationSec: 35,
          trackOffsets: {
            'JGwWNGJdvx8': { startSec: 48, durationSec: 35 }, // Ed Sheeran - Shape of You
            'kJQP7kiw5Fk': { startSec: 55, durationSec: 35 }, // Luis Fonsi - Despacito
            'fJ9rUzIMcZQ': { startSec: 62, durationSec: 35 }, // Queen - Bohemian Rhapsody
          },
        },
        {
          id: '90s-pop',
          label: '90s Pop',
          hint: 'Backstreet Boys, Britney Spears, Spice Girls',
          query: '90s pop hits greatest songs official music video',
          playlistId: null,
          allowRemixes: false,
          defaultHookRatio: 0.26,
          defaultHookDurationSec: 35,
          trackOffsets: {},
        },
        {
          id: '2000s-pop',
          label: '2000s Pop',
          hint: 'Rihanna, Eminem, Beyonce, Justin Timberlake',
          query: '2000s pop hits best songs official music video',
          playlistId: null,
          allowRemixes: false,
          defaultHookRatio: 0.25,
          defaultHookDurationSec: 35,
          trackOffsets: {},
        },
        {
          id: '2010s-pop',
          label: '2010s Pop',
          hint: 'Taylor Swift, Bruno Mars, Katy Perry, Adele',
          query: '2010s pop music hits greatest official video',
          playlistId: null,
          allowRemixes: false,
          defaultHookRatio: 0.25,
          defaultHookDurationSec: 35,
          trackOffsets: {},
        },
        {
          id: 'rock',
          label: 'Rock',
          hint: 'Classic & Modern Rock Legends',
          query: 'greatest rock hits songs official music video',
          playlistId: null,
          allowRemixes: false,
          defaultHookRatio: 0.28,
          defaultHookDurationSec: 38,
          trackOffsets: {},
        },
        {
          id: 'hip-hop',
          label: 'Hip-Hop',
          hint: 'Drake, Kendrick Lamar, Travis Scott, 50 Cent',
          query: 'hip hop rap greatest hits official music video',
          playlistId: null,
          allowRemixes: false,
          defaultHookRatio: 0.24,
          defaultHookDurationSec: 35,
          trackOffsets: {},
        },
        {
          id: 'rnb',
          label: 'R&B',
          hint: 'The Weeknd, SZA, Usher, Alicia Keys',
          query: 'rnb greatest soul hits official music video',
          playlistId: null,
          allowRemixes: false,
          defaultHookRatio: 0.26,
          defaultHookDurationSec: 35,
          trackOffsets: {},
        },
        {
          id: 'dance-edm',
          label: 'Dance / EDM',
          hint: 'Calvin Harris, Avicii, David Guetta, Martin Garrix',
          query: 'festival dance edm electronic hits official video',
          playlistId: null,
          allowRemixes: true, // Allow festival remixes for EDM
          defaultHookRatio: 0.22,
          defaultHookDurationSec: 40,
          trackOffsets: {},
        },
        {
          id: 'chill',
          label: 'Chill',
          hint: 'Acoustic, Indie, Lo-Fi & Downtempo',
          query: 'chill indie acoustic pop soothing songs official video',
          playlistId: null,
          allowRemixes: false,
          defaultHookRatio: 0.25,
          defaultHookDurationSec: 35,
          trackOffsets: {},
        },
        {
          id: 'workout',
          label: 'Workout',
          hint: 'High-BPM Cardio & Gym Hype Anthems',
          query: 'workout gym cardio hype energy music video',
          playlistId: null,
          allowRemixes: true,
          defaultHookRatio: 0.22,
          defaultHookDurationSec: 35,
          trackOffsets: {},
        },
        {
          id: 'love-songs',
          label: 'Love Songs',
          hint: 'Romantic Ballads & Soulful Duets',
          query: 'greatest english love songs romantic official video',
          playlistId: null,
          allowRemixes: false,
          defaultHookRatio: 0.28,
          defaultHookDurationSec: 35,
          trackOffsets: {},
        },
        {
          id: 'breakup-songs',
          label: 'Breakup Songs',
          hint: 'Heartbreak & Emotional Anthems',
          query: 'sad breakup songs emotional pop official video',
          playlistId: null,
          allowRemixes: false,
          defaultHookRatio: 0.26,
          defaultHookDurationSec: 35,
          trackOffsets: {},
        },
      ],
    },
    {
      id: 'bollywood',
      label: 'Hindi / Bollywood',
      hint: 'Romantic · Sad · Party · 90s · 2000s',
      categories: [
        {
          id: 'love-songs',
          label: 'Love Songs',
          hint: 'Arijit Singh, Atif Aslam, Shreya Ghoshal',
          query: 'bollywood love songs arijit singh romantic official video',
          playlistId: null,
          allowRemixes: false,
          defaultHookRatio: 0.25,
          defaultHookDurationSec: 35,
          trackOffsets: {},
        },
        {
          id: 'breakup-songs',
          label: 'Breakup Songs',
          hint: 'Heartbreak, Dard & Emotional Melodies',
          query: 'bollywood sad breakup songs emotional official video',
          playlistId: null,
          allowRemixes: false,
          defaultHookRatio: 0.26,
          defaultHookDurationSec: 35,
          trackOffsets: {},
        },
        {
          id: 'romantic',
          label: 'Romantic',
          hint: 'Evergreen Hindi Romance & Duets',
          query: 'superhit romantic hindi songs bollywood official video',
          playlistId: null,
          allowRemixes: false,
          defaultHookRatio: 0.25,
          defaultHookDurationSec: 35,
          trackOffsets: {},
        },
        {
          id: 'sad',
          label: 'Sad',
          hint: 'Soulful & Melancholic Ballads',
          query: 'sad hindi songs dard emotional arijit kk official',
          playlistId: null,
          allowRemixes: false,
          defaultHookRatio: 0.28,
          defaultHookDurationSec: 35,
          trackOffsets: {},
        },
        {
          id: 'party-dance',
          label: 'Party / Dance',
          hint: 'Club Banger & Wedding Anthems',
          query: 'bollywood party dance songs badshah neha kakkar official',
          playlistId: null,
          allowRemixes: true,
          defaultHookRatio: 0.22,
          defaultHookDurationSec: 38,
          trackOffsets: {},
        },
        {
          id: '90s-bollywood',
          label: '90s Bollywood',
          hint: 'Kumar Sanu, Alka Yagnik, Udit Narayan',
          query: '90s bollywood superhit songs kumar sanu udit narayan alka yagnik',
          playlistId: null,
          allowRemixes: false,
          defaultHookRatio: 0.25,
          defaultHookDurationSec: 35,
          trackOffsets: {},
        },
        {
          id: '2000s-bollywood',
          label: '2000s Bollywood',
          hint: 'KK, Sonu Nigam, Sunidhi Chauhan, Mohit Chauhan',
          query: '2000s bollywood hits sonu nigam kk shaan official video',
          playlistId: null,
          allowRemixes: false,
          defaultHookRatio: 0.25,
          defaultHookDurationSec: 35,
          trackOffsets: {},
        },
        {
          id: 'latest-hits',
          label: 'Latest Hits',
          hint: 'Newest Charting Bollywood Soundtracks',
          query: 'latest bollywood songs 2024 2025 2026 superhit official video',
          playlistId: null,
          allowRemixes: false,
          defaultHookRatio: 0.24,
          defaultHookDurationSec: 35,
          trackOffsets: {},
        },
        {
          id: 'retro-classic',
          label: 'Retro / Classic',
          hint: 'Kishore Kumar, Lata Mangeshkar, Mohd Rafi, RD Burman',
          query: 'retro bollywood classics kishore kumar mohd rafi lata mangeshkar',
          playlistId: null,
          allowRemixes: false,
          defaultHookRatio: 0.25,
          defaultHookDurationSec: 35,
          trackOffsets: {},
        },
        {
          id: 'workout',
          label: 'Workout',
          hint: 'High Energy Desi Gym & Cardio Beats',
          query: 'bollywood gym workout motivational high energy songs',
          playlistId: null,
          allowRemixes: true,
          defaultHookRatio: 0.22,
          defaultHookDurationSec: 35,
          trackOffsets: {},
        },
      ],
    },
    {
      id: 'punjabi',
      label: 'Punjabi',
      hint: 'Bhangra · Hip-Hop · Anthems',
      categories: [
        {
          id: 'latest-hits',
          label: 'Latest Hits',
          hint: 'Karan Aujla, Diljit Dosanjh, AP Dhillon, Shubh',
          query: 'latest punjabi hits karan aujla diljit dosanjh official video',
          playlistId: null,
          allowRemixes: false,
          defaultHookRatio: 0.24,
          defaultHookDurationSec: 35,
          trackOffsets: {},
        },
        {
          id: 'bhangra-anthems',
          label: 'Bhangra Anthems',
          hint: 'Traditional Dhol Chaal & High Voltage Dance',
          query: 'punjabi bhangra anthems dhol dance wedding official',
          playlistId: null,
          allowRemixes: false,
          defaultHookRatio: 0.24,
          defaultHookDurationSec: 35,
          trackOffsets: {},
        },
        {
          id: 'punjabi-hiphop',
          label: 'Punjabi Hip-Hop',
          hint: 'Sidhu Moose Wala, Shubh, Wazir Patar',
          query: 'punjabi hip hop rap sidhu moose wala official video',
          playlistId: null,
          allowRemixes: false,
          defaultHookRatio: 0.22,
          defaultHookDurationSec: 35,
          trackOffsets: {},
        },
        {
          id: 'romantic',
          label: 'Romantic',
          hint: 'Soothing Melodies & Love Ballads',
          query: 'romantic punjabi love songs official music video',
          playlistId: null,
          allowRemixes: false,
          defaultHookRatio: 0.26,
          defaultHookDurationSec: 35,
          trackOffsets: {},
        },
        {
          id: 'old-school',
          label: 'Old School',
          hint: 'Jazzy B, Gurdas Maan, Surjit Bindrakhia, Kuldeep Manak',
          query: 'punjabi old school folk hits gurdas maan jazzy b bindrakhia',
          playlistId: null,
          allowRemixes: false,
          defaultHookRatio: 0.25,
          defaultHookDurationSec: 35,
          trackOffsets: {},
        },
        {
          id: 'sad-heartbreak',
          label: 'Sad / Heartbreak',
          hint: 'B Praak, Jaani, Deep Emotional Songs',
          query: 'sad punjabi songs heartbreak b praak jaani official',
          playlistId: null,
          allowRemixes: false,
          defaultHookRatio: 0.26,
          defaultHookDurationSec: 35,
          trackOffsets: {},
        },
        {
          id: 'workout',
          label: 'Workout',
          hint: 'Heavy Dhol & Bassline Gym Motivation',
          query: 'punjabi gym workout motivational heavy bass songs',
          playlistId: null,
          allowRemixes: true,
          defaultHookRatio: 0.22,
          defaultHookDurationSec: 35,
          trackOffsets: {},
        },
      ],
    },
    {
      id: 'tamil',
      label: 'Tamil',
      hint: 'Mass · Kuthu · Melodies',
      categories: [
        {
          id: 'mass-hits',
          label: 'Mass Hits',
          hint: 'Anirudh, Vijay, Ajith, Rajinikanth Anthems',
          query: 'tamil mass hits anirudh ravichander superhit official video',
          playlistId: null,
          allowRemixes: false,
          defaultHookRatio: 0.22,
          defaultHookDurationSec: 35,
          trackOffsets: {},
        },
        {
          id: 'love-songs',
          label: 'Love Songs',
          hint: 'A.R. Rahman, Harris Jayaraj, Yuvan Shankar Raja',
          query: 'tamil romantic love songs ar rahman harris jayaraj official',
          playlistId: null,
          allowRemixes: false,
          defaultHookRatio: 0.26,
          defaultHookDurationSec: 35,
          trackOffsets: {},
        },
        {
          id: 'kuthu-party',
          label: 'Kuthu Party',
          hint: 'Dappankuthu Fast Beat Dance Celebration',
          query: 'tamil dappankuthu kuthu party dance songs official',
          playlistId: null,
          allowRemixes: true,
          defaultHookRatio: 0.22,
          defaultHookDurationSec: 38,
          trackOffsets: {},
        },
        {
          id: 'classics',
          label: '90s/2000s Classics',
          hint: 'Ilaiyaraaja, SPB, S. Janaki, 90s Rahman',
          query: 'tamil 90s 2000s superhit songs ilaiyaraaja ar rahman official',
          playlistId: null,
          allowRemixes: false,
          defaultHookRatio: 0.25,
          defaultHookDurationSec: 35,
          trackOffsets: {},
        },
        {
          id: 'melodies',
          label: 'Melodies',
          hint: 'Soulful & Peaceful Soothing Tamil Hits',
          query: 'tamil melody songs romantic soothing hits official',
          playlistId: null,
          allowRemixes: false,
          defaultHookRatio: 0.26,
          defaultHookDurationSec: 35,
          trackOffsets: {},
        },
      ],
    },
    {
      id: 'telugu',
      label: 'Telugu',
      hint: 'Mass · Melodies · Beats',
      categories: [
        {
          id: 'mass-hits',
          label: 'Mass Hits',
          hint: 'Thaman S, Devi Sri Prasad, Allu Arjun, Jr NTR',
          query: 'telugu mass hits thaman dsp allu arjun superhit official',
          playlistId: null,
          allowRemixes: false,
          defaultHookRatio: 0.22,
          defaultHookDurationSec: 35,
          trackOffsets: {},
        },
        {
          id: 'romantic',
          label: 'Romantic',
          hint: 'Sid Sriram, Anurag Kulkarni Love Melodies',
          query: 'telugu romantic love songs sid sriram official video',
          playlistId: null,
          allowRemixes: false,
          defaultHookRatio: 0.26,
          defaultHookDurationSec: 35,
          trackOffsets: {},
        },
        {
          id: 'party',
          label: 'Party',
          hint: 'Energetic Dance Beats & Celebrations',
          query: 'telugu party dance energetic beats superhit official',
          playlistId: null,
          allowRemixes: true,
          defaultHookRatio: 0.22,
          defaultHookDurationSec: 38,
          trackOffsets: {},
        },
        {
          id: 'classic-melodies',
          label: 'Classic Melodies',
          hint: 'SPB, K.S. Chithra, Evergreen Tollywood Hits',
          query: 'telugu evergreen classic melodies spb chithra official',
          playlistId: null,
          allowRemixes: false,
          defaultHookRatio: 0.25,
          defaultHookDurationSec: 35,
          trackOffsets: {},
        },
      ],
    },
  ],
};

/**
 * Finds language definition by language ID.
 */
export function findCatalogLanguage(langId) {
  const norm = String(langId || 'english').toLowerCase();
  return (
    YOUTUBE_CATALOG_CONFIG.languages.find((l) => l.id === norm) ||
    YOUTUBE_CATALOG_CONFIG.languages[0]
  );
}

/**
 * Finds category definition under a specific language.
 * Strictly guarantees NO cross-contamination.
 */
export function findCatalogCategory(langId, categoryId) {
  const lang = findCatalogLanguage(langId);
  const normCat = String(categoryId || '').toLowerCase();
  return (
    lang.categories.find((c) => c.id === normCat) ||
    lang.categories[0]
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
