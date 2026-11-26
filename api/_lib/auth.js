import crypto from 'crypto';

const COOKIE_NAME = 'audify_session';
const STATE_COOKIE = 'audify_oauth_state';

function getSecret() {
  return process.env.SESSION_SECRET || process.env.GOOGLE_CLIENT_SECRET || 'audify-dj-dev-session-secret-2026';
}

function sign(payloadB64) {
  return crypto.createHmac('sha256', getSecret()).update(payloadB64).digest('base64url');
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

export function createSessionToken(user) {
  const payload = {
    id: String(user.id || user.sub || ''),
    email: String(user.email || ''),
    name: String(user.name || user.email || 'Audify User'),
    picture: user.picture ? String(user.picture) : null,
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000,
  };
  const b64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  return `${b64}.${sign(b64)}`;
}

export function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [b64, sig] = parts;
  const expected = sign(b64);
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(b64, 'base64url').toString('utf8'));
    if (!data?.id || (data.exp && Date.now() > data.exp)) return null;
    return { id: data.id, email: data.email, name: data.name, picture: data.picture || null };
  } catch {
    return null;
  }
}

export function getSessionUser(req) {
  const cookies = parseCookies(req);
  return verifySessionToken(cookies[COOKIE_NAME]);
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

export function setSessionCookie(res, req, user) {
  const token = createSessionToken(user);
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(token)}; ${cookieFlags(req, 30 * 24 * 60 * 60)}`);
}

export function clearSessionCookie(res, req) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; ${cookieFlags(req, 0)}`);
}

export function setStateCookie(res, req, state) {
  res.setHeader('Set-Cookie', `${STATE_COOKIE}=${encodeURIComponent(state)}; ${cookieFlags(req, 600)}`);
}

export function readStateCookie(req) {
  const cookies = parseCookies(req);
  return cookies[STATE_COOKIE] || null;
}

export { STATE_COOKIE };
