import crypto from 'crypto';
import { handlePreflight, readJsonBody, sendJson } from './_lib/http.js';
import {
  clearSessionCookie,
  getOrigin,
  getSavedAccounts,
  getSessionUser,
  isOAuthConfigured,
  readStateCookie,
  removeSavedAccount,
  setSessionAndAccountCookies,
  setStateCookie,
} from './_lib/auth.js';

function redirect(res, location) {
  res.statusCode = 302;
  res.setHeader('Location', location);
  res.end();
}

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;

  const origin = getOrigin(req);
  const url = new URL(req.url || '/', origin);
  const action = url.searchParams.get('action') ||
    (url.pathname.endsWith('/google') ? 'google' :
     url.pathname.endsWith('/callback') ? 'callback' :
     url.pathname.endsWith('/logout') ? 'logout' : '');

  if (action === 'logout') {
    clearSessionCookie(res, req);
    if (req.method === 'POST') return sendJson(res, 200, { ok: true, accounts: getSavedAccounts(req) });
    return redirect(res, '/');
  }

  if (action === 'google' || action === 'callback') {
    if (!isOAuthConfigured()) {
      return redirect(res, '/?auth=unconfigured');
    }
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${origin}/api/auth/callback`;

    if (action === 'google') {
      const state = crypto.randomBytes(16).toString('hex');
      setStateCookie(res, req, state);
      const loginHint = url.searchParams.get('login_hint');
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        state,
        prompt: 'select_account',
        ...(loginHint ? { login_hint: loginHint } : {}),
      });
      return redirect(res, `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
    }

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

      setSessionAndAccountCookies(res, req, {
        id: profile.id || profile.sub,
        email: profile.email,
        name: profile.name || profile.given_name || profile.email,
        picture: profile.picture || null,
        provider: 'google',
      });
      return redirect(res, '/?auth=ok');
    } catch {
      return redirect(res, '/?auth=error');
    }
  }

  if (req.method === 'GET') {
    const user = getSessionUser(req);
    const accounts = getSavedAccounts(req);
    return sendJson(res, 200, {
      loaded: true,
      enabled: true,
      oauthConfigured: isOAuthConfigured(),
      googleClientId: process.env.GOOGLE_CLIENT_ID || null,
      user: user || null,
      accounts,
    }, 'no-store');
  }

  if (req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      if (body?.action === 'google_credential' && body?.credential) {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (!clientId) return sendJson(res, 400, { ok: false, error: 'GOOGLE_CLIENT_ID not configured' });
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(String(body.credential))}`);
        if (!verifyRes.ok) return sendJson(res, 401, { ok: false, error: 'Invalid Google credential' });
        const profile = await verifyRes.json();
        if (profile.aud !== clientId) return sendJson(res, 401, { ok: false, error: 'Token audience mismatch' });
        const user = {
          id: profile.sub,
          email: profile.email,
          name: profile.name || profile.given_name || profile.email,
          picture: profile.picture || null,
          provider: 'google',
        };
        const accounts = setSessionAndAccountCookies(res, req, user);
        return sendJson(res, 200, { ok: true, user, accounts });
      }
      if (body?.action === 'switch_account' && body?.id) {
        const saved = getSavedAccounts(req);
        const target = saved.find((a) => a.id === String(body.id));
        if (!target) return sendJson(res, 404, { ok: false, error: 'Account not found in session' });
        const accounts = setSessionAndAccountCookies(res, req, target);
        return sendJson(res, 200, { ok: true, user: target, accounts });
      }
      if (body?.action === 'remove_account' && body?.id) {
        const accounts = removeSavedAccount(res, req, body.id);
        const active = getSessionUser(req);
        const user = active && active.id === String(body.id) ? null : active;
        return sendJson(res, 200, { ok: true, user, accounts });
      }
    } catch {}
    return sendJson(res, 200, { ok: true });
  }

  res.setHeader('Allow', 'GET, POST');
  return sendJson(res, 405, { error: 'Method not allowed' });
}
