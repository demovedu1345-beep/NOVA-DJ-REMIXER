import { getQueryParams, handlePreflight, sendJson } from './_lib/http.js';
import {
  ARTISTS_DB,
  HINDI_ARTIST_SUBCATEGORIES,
  ENGLISH_ARTIST_SUBCATEGORIES,
  getArtistsByLanguage,
  getArtistProfile,
} from './_lib/artists-db.js';

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  const query = getQueryParams(req);
  const lang = (query.lang || 'hindi').toLowerCase();
  const sub = (query.sub || query.category || 'all').toLowerCase();
  const artistId = query.id || query.artist;
  const searchTerm = (query.q || query.search || '').toLowerCase().trim();

  // 1. Single Artist Full Profile
  if (artistId) {
    const profile = getArtistProfile(artistId, lang);
    if (!profile) {
      return sendJson(res, 404, { error: 'Artist not found' });
    }
    return sendJson(res, 200, {
      artist: profile,
      playableTracks: profile.songs || []
    }, 'public, max-age=120');
  }

  // 2. Artist List by Language and Subcategory
  let artists = getArtistsByLanguage(lang, sub);

  // 3. Search filtering
  if (searchTerm) {
    artists = artists.filter(a => {
      const matchName = (a.name || '').toLowerCase().includes(searchTerm);
      const matchBio = (a.bio || '').toLowerCase().includes(searchTerm);
      const matchAlts = (a.altNames || []).some(alt => alt.toLowerCase().includes(searchTerm));
      const matchTracks = (a.songs || []).some(s => (s.title || '').toLowerCase().includes(searchTerm));
      return matchName || matchBio || matchAlts || matchTracks;
    });
  }

  // Map to lightweight summary cards (exclude full 100+ song discography to keep payload ultra-fast)
  const summaries = artists.map(a => ({
    id: a.id,
    name: a.name,
    altNames: a.altNames || [],
    lang: a.lang || lang,
    image: a.image,
    country: a.country || 'India',
    verified: Boolean(a.verified),
    bio: a.bio || '',
    subcategories: a.subcategories || [],
    songsCount: a.songsCount || (a.songs || []).length,
    popularTracks: (a.songs || []).slice(0, 5).map(s => ({
      title: s.title,
      artist: s.artist,
      durationSec: s.durationSec,
      entrySec: s.entrySec,
      exitSec: s.exitSec,
      videoId: s.videoId
    }))
  }));

  const subcategories = lang === 'english' ? ENGLISH_ARTIST_SUBCATEGORIES : HINDI_ARTIST_SUBCATEGORIES;

  return sendJson(res, 200, {
    lang,
    subcategory: sub,
    subcategories,
    count: summaries.length,
    artists: summaries
  }, 'public, max-age=60');
}
