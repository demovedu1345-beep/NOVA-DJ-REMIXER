import { handlePreflight, readJsonBody, sendJson } from './_lib/http.js';

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;

  if (req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      // Optional logging for diagnostics
      if (body?.type) {
        console.log(`[Telemetry Event] ${body.type} for song: ${body.song_id || 'unknown'}`);
      }
      return sendJson(res, 200, { ok: true });
    } catch {
      return sendJson(res, 200, { ok: true });
    }
  }

  res.setHeader('Allow', 'POST');
  return sendJson(res, 405, { error: 'Method not allowed' });
}
