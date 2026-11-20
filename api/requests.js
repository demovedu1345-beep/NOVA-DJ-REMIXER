import { handlePreflight, readJsonBody, sendJson } from './_lib/http.js';

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;

  if (req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      console.log('Received song request:', body);
      // Attempt to forward upstream if possible
      try {
        await fetch('https://www.naux.party/api/requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(3000)
        });
      } catch {}

      return sendJson(res, 200, { ok: true });
    } catch {
      return sendJson(res, 200, { ok: true });
    }
  }

  res.setHeader('Allow', 'POST');
  return sendJson(res, 405, { error: 'Method not allowed' });
}
