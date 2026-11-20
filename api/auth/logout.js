import { handlePreflight, sendJson } from '../_lib/http.js';

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;

  if (req.method === 'POST') {
    return sendJson(res, 200, { ok: true });
  }

  res.setHeader('Allow', 'POST');
  return sendJson(res, 405, { error: 'Method not allowed' });
}
