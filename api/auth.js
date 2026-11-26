import crypto from 'crypto';
import { handlePreflight, sendJson } from './_lib/http.js';
import {
  clearSessionCookie,
  getOrigin,
  isOAuthConfigured,
  readStateCookie,
  setSessionCookie,
  setStateCookie,
} from './_lib/auth.js';

function redirect(res, location) {
  res.statusCode = 302;
  res.setHeader('Location', location);
  res.end();
}

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;

  const url = new URL(req.url || '/', getOrigin(req));
  const action = url.searchParams.get('action') || (url.pathname.endsWith('/callback') ? 'callback' : url.pathname.endsWith('/logout') ? 'logout' : 'google');
  const origin = getOrigin(req);

  if (action === 'logout') {
    clearSessionCookie(res, req);
    if (req.method === 'POST') return sendJson(res, 200, { ok: true });
    return redirect(res, '/');
  }

  if (!isOAuthConfigured()) {
    return redirect(res, '/?auth=unconfigured');
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${origin}/api/auth/callback`;

  if (action === 'google') {
    const state = crypto.randomBytes(16).toString('hex');
    setStateCookie(res, req, state);
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      prompt: 'select_account',
    });
    return redirect(res, `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  }

  if (action === 'callback') {
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const savedState = readStateCookie(req);

    if (!code || !state || !savedState || state !== savedState) {
      return redirect(res, '/?auth=error');
    }

    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });
      if (!tokenRes.ok) return redirect(res, '/?auth=error');
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) return redirect(res, '/?auth=error');

      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      if (!userRes.ok) return redirect(res, '/?auth=error');
      const profile = await userRes.json();

      setSessionCookie(res, req, {
        id: profile.id || profile.sub,
        email: profile.email,
        name: profile.name || profile.given_name || profile.email,
        picture: profile.picture || null,
      });
      return redirect(res, '/?auth=ok');
    } catch {
      return redirect(res, '/?auth=error');
    }
  }

  return sendJson(res, 404, { error: 'Unknown auth action' });
}
