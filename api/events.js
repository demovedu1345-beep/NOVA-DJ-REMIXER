import { handlePreflight, sendJson } from './_lib/http.js';

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;
  return sendJson(res, 200, { ok: true });
}
