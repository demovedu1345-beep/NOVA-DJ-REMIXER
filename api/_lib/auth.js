import crypto from 'crypto';

const COOKIE_NAME = 'audify_session';
const ACCOUNTS_COOKIE = 'audify_accounts';
const STATE_COOKIE = 'audify_oauth_state';

function getSecret() {
  return process.env.SESSION_SECRET || process.env.GOOGLE_CLIENT_SECRET || 'audify-dj-dev-session-secret-2026';
}

function sign(payloadB64) {
  return crypto.createHmac('sha256', getSecret()).update(payloadB64).digest('base64url');
}

function signJson(obj) {
  const b64 = Buffer.from(JSON.stringify(obj), 'utf8').toString('base64url');
  return `${b64}.${sign(b64)}`;
}

function verifyJson(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [b64, sig] = parts;
  const expected = sign(b64);
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    return JSON.parse(Buffer.from(b64, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

export function parseCookies(req) {
  const header = req?.headers?.cookie || '';
  const out = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) {
      try { out[k] = decodeURIComponent(v); } catch { out[k] = v; }
    }
  }
  return out;
}

export function getOrigin(req) {
  const proto = String(req?.headers?.['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = String(req?.headers?.['x-forwarded-host'] || req?.headers?.host || 'audify-ai-dj.vercel.app').split(',')[0].trim();
  return `${proto}://${host}`;
}

export function isOAuthConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function normalizeUser(user) {
  return {
    id: String(user.id || user.sub || ''),
    email: String(user.email || ''),
    name: String(user.name || user.email || 'Audify User'),
    picture: user.picture ? String(user.picture) : null,
    provider: user.provider || 'google',
  };
}

export function createSessionToken(user) {
  return signJson({
    ...normalizeUser(user),
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000,
  });
}

export function verifySessionToken(token) {
  const data = verifyJson(token);
  if (!data?.id || (data.exp && Date.now() > data.exp)) return null;
  return normalizeUser(data);
}

export function getSessionUser(req) {
  const cookies = parseCookies(req);
  return verifySessionToken(cookies[COOKIE_NAME]);
}

export function getSavedAccounts(req) {
  const cookies = parseCookies(req);
  const data = verifyJson(cookies[ACCOUNTS_COOKIE]);
  if (!Array.isArray(data?.accounts)) return [];
  return data.accounts.filter((a) => a && a.id).map(normalizeUser).slice(0, 6);
}

function cookieFlags(req, maxAge) {
  const isHttps = getOrigin(req).startsWith('https://');
  return [
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    isHttps ? 'Secure' : '',
    `Max-Age=${maxAge}`,
  ].filter(Boolean).join('; ');
}

function appendSetCookie(res, cookieStr) {
  const existing = res.getHeader?.('Set-Cookie');
  if (!existing) {
    res.setHeader('Set-Cookie', [cookieStr]);
  } else if (Array.isArray(existing)) {
    res.setHeader('Set-Cookie', [...existing, cookieStr]);
  } else {
    res.setHeader('Set-Cookie', [String(existing), cookieStr]);
  }
}

export function setSessionAndAccountCookies(res, req, user) {
  const norm = normalizeUser(user);
  const token = createSessionToken(norm);
  appendSetCookie(res, `${COOKIE_NAME}=${encodeURIComponent(token)}; ${cookieFlags(req, 30 * 24 * 60 * 60)}`);

  const prev = getSavedAccounts(req).filter((a) => a.id !== norm.id && a.email !== norm.email);
  const nextAccounts = [norm, ...prev].slice(0, 6);
  const accToken = signJson({ accounts: nextAccounts });
  appendSetCookie(res, `${ACCOUNTS_COOKIE}=${encodeURIComponent(accToken)}; ${cookieFlags(req, 90 * 24 * 60 * 60)}`);
  return nextAccounts;
}

export function setSessionCookie(res, req, user) {
  return setSessionAndAccountCookies(res, req, user);
}

export function removeSavedAccount(res, req, accountId) {
  const nextAccounts = getSavedAccounts(req).filter((a) => a.id !== String(accountId));
  const accToken = signJson({ accounts: nextAccounts });
  appendSetCookie(res, `${ACCOUNTS_COOKIE}=${encodeURIComponent(accToken)}; ${cookieFlags(req, 90 * 24 * 60 * 60)}`);
  const active = getSessionUser(req);
  if (active && active.id === String(accountId)) {
    appendSetCookie(res, `${COOKIE_NAME}=; ${cookieFlags(req, 0)}`);
  }
  return nextAccounts;
}

export function clearSessionCookie(res, req) {
  appendSetCookie(res, `${COOKIE_NAME}=; ${cookieFlags(req, 0)}`);
}

export function setStateCookie(res, req, state) {
  appendSetCookie(res, `${STATE_COOKIE}=${encodeURIComponent(state)}; ${cookieFlags(req, 600)}`);
}

export function readStateCookie(req) {
  const cookies = parseCookies(req);
  return cookies[STATE_COOKIE] || null;
}

export { STATE_COOKIE };
