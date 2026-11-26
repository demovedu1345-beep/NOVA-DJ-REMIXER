import { getQueryParams, handlePreflight, readJsonBody, sendJson } from './_lib/http.js';
import { getSessionUser } from './_lib/auth.js';
import {
  deleteSetRecord,
  listLikedSongs,
  listSavedSets,
  removeLikedSong,
  saveSetRecord,
  syncLikedSongs,
  toggleLikedSong,
} from './_lib/db.js';

function resolveLikesOwner(req, q) {
  const user = getSessionUser(req);
  if (user?.id) return { ownerId: `google:${user.id}`, user };
  const sid = String(q?.sessionId || req.headers['x-nova-session'] || 'anon').slice(0, 80);
  return { ownerId: `anon:${sid}`, user: null };
}

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;

  const q = getQueryParams(req);

  // Likes endpoint (rewritten from /api/likes -> /api/sets?kind=likes to stay within 12 Vercel functions)
  if (q.kind === 'likes' || (req.url && req.url.split('?')[0].endsWith('/likes'))) {
    const { ownerId, user } = resolveLikesOwner(req, q);
    if (req.method === 'GET') {
      const data = await listLikedSongs(ownerId);
      return sendJson(res, 200, { ok: true, user, ...data }, 'no-store');
    }
    if (req.method === 'POST') {
      try {
        const body = await readJsonBody(req);
        if (body?.action === 'sync' && Array.isArray(body.tracks)) {
          const data = await syncLikedSongs(ownerId, body.tracks);
          return sendJson(res, 200, { ok: true, user, ...data }, 'no-store');
        }
        const track = body?.track || body;
        const songId = String(track?.song_id || track?.id || (Array.isArray(track?.youtube_ids) && track.youtube_ids[0]) || '').trim();
        if (!songId) return sendJson(res, 400, { ok: false, error: 'song_id is required' });
        const normalized = {
          song_id: songId,
          title: String(track.title || 'Unknown Track').slice(0, 140),
          artist: String(track.artist || 'Unknown Artist').slice(0, 140),
          youtube_ids: Array.isArray(track.youtube_ids) && track.youtube_ids.length
            ? track.youtube_ids
            : (track.videoId ? [track.videoId] : []),
          duration_sec: Number(track.duration_sec || track.durationSec) || 210,
          entry_sec: Number.isFinite(Number(track.entry_sec ?? track.entrySec)) ? Number(track.entry_sec ?? track.entrySec) : 35,
          exit_sec: Number.isFinite(Number(track.exit_sec ?? track.exitSec)) ? Number(track.exit_sec ?? track.exitSec) : 77,
          play_full: Boolean(track.play_full ?? track.playFull),
          language: String(track.language || 'hindi'),
          subtype: String(track.subtype || 'liked'),
          energy: Number(track.energy) || 8,
          heat: Array.isArray(track.heat) && track.heat.length ? track.heat : undefined,
        };
        const data = await toggleLikedSong(ownerId, normalized, body?.forceLike);
        return sendJson(res, 200, { ok: true, user, ...data }, 'no-store');
      } catch (err) {
        return sendJson(res, 400, { ok: false, error: err?.message || 'Invalid JSON' });
      }
    }
    if (req.method === 'DELETE') {
      const songId = String(q.songId || q.id || '').trim();
      if (!songId) return sendJson(res, 400, { ok: false, error: 'songId required' });
      const data = await removeLikedSong(ownerId, songId);
      return sendJson(res, 200, { ok: true, user, ...data }, 'no-store');
    }
    res.setHeader('Allow', 'GET, POST, DELETE');
    return sendJson(res, 405, { ok: false, error: 'Method not allowed' });
  }

  const sessionId = String(q.sessionId || req.headers['x-nova-session'] || 'anon').slice(0, 80);

  if (req.method === 'GET') {
    const data = await listSavedSets(sessionId);
    return sendJson(res, 200, { ok: true, ...data });
  }

  if (req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      if (!body || !Array.isArray(body.tracks) || !body.tracks.length) {
        return sendJson(res, 400, { ok: false, error: 'tracks array is required' });
      }
      const id = String(body.id || `set-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`);
      const setObj = {
        id,
        sessionId: String(body.sessionId || sessionId),
        name: String(body.name || 'NOVA Party Set').slice(0, 80),
        vibe: body.vibe || {},
        tracks: body.tracks.slice(0, 150),
        createdAt: new Date().toISOString(),
      };
      const result = await saveSetRecord(setObj);
      return sendJson(res, 200, { ok: true, ...result });
    } catch (err) {
      return sendJson(res, 400, { ok: false, error: err?.message || 'Invalid JSON' });
    }
  }

  if (req.method === 'DELETE') {
    const id = String(q.id || '');
    if (!id) return sendJson(res, 400, { ok: false, error: 'id required' });
    const result = await deleteSetRecord(id, sessionId);
    return sendJson(res, 200, { ok: true, ...result });
  }

  res.setHeader('Allow', 'GET, POST, DELETE');
  return sendJson(res, 405, { ok: false, error: 'Method not allowed' });
}
