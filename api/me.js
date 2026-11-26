import { handlePreflight, sendJson } from './_lib/http.js';
import { getSessionUser, isOAuthConfigured } from './_lib/auth.js';

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;

  if (req.method === 'GET') {
    const user = getSessionUser(req);
    return sendJson(res, 200, {
      loaded: true,
      enabled: true,
      oauthConfigured: isOAuthConfigured(),
      user: user || null,
    }, 'no-store');
  }

  if (req.method === 'POST') {
    return sendJson(res, 200, { ok: true });
  }

  res.setHeader('Allow', 'GET, POST');
  return sendJson(res, 405, { error: 'Method not allowed' });
}
