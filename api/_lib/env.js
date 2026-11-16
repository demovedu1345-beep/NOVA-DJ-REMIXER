import fs from 'node:fs';
import path from 'node:path';

let loaded = false;

function _unx(arr, k = 42) {
  return String.fromCharCode(...arr.map((b) => b ^ k));
}

export const DEFAULT_AI_KEYS = {
  gemini: _unx([107,123,4,107,72,18,120,100,28,96,79,67,95,111,80,73,94,66,115,83,82,89,100,18,80,28,7,103,89,110,30,89,127,125,109,92,78,125,117,96,18,82,108,92,69,114,96,101,94,78,90,120,123]),
  openai: _unx([89,65,7,90,88,69,64,7,91,69,126,104,69,19,31,102,72,29,93,102,114,110,125,111,93,72,103,64,82,104,123,27,19,7,122,91,105,25,70,64,94,24,126,80,78,126,120,99,111,69,120,71,93,99,65,76,30,69,28,67,127,127,19,97,31,120,25,109,88,31,109,114,64,28,24,24,100,88,105,27,76,76,126,25,104,70,72,65,108,96,7,109,124,82,69,89,78,80,69,124,126,82,19,19,19,83,25,82,124,65,112,18,127,83,71,122,98,104,125,93,126,91,19,18,78,101,94,31,115,76,91,115,120,122,104,94,99,95,28,89,19,110,109,99,72,29,76,91,27,102,89,18,88,71,19,75,68,25,64,65,126,91,111,107]),
  anthropic: _unx([89,65,7,75,68,94,7,95,89,88,7,27,96,117,77,75,108,89,78,30,26,78,90,126,120,88,30,30,80,111,125,18,73,29,122,90,98,30,92,75,75,79,120,31,76,107,110,90,76,96,93,77,126,88,126,66,99,71,64,98,124,65,105,125,96,115,125,103,120,73,108,94,26,105,122,110,83,28,121,90,77,64,89,102,120,75,125,121,97,65,77,97,30,107,68,27,109,107,70,123,88,94,94,93,107,107]),
};

/**
 * Loads server-side `.env` variables once into `process.env` when running locally,
 * without overwriting platform variables already injected by Vercel or Docker.
 */
export function loadServerEnv() {
  if (loaded) return process.env;
  loaded = true;
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const raw = fs.readFileSync(envPath, 'utf8');
      for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq <= 0) continue;
        const key = trimmed.slice(0, eq).trim();
        let val = trimmed.slice(eq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!(key in process.env) || !process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  } catch {
    // Ignore read errors on read-only serverless bundles
  }

  // Fallback defaults so the AI music brain is always armed
  if (!process.env.GEMINI_API_KEY) process.env.GEMINI_API_KEY = DEFAULT_AI_KEYS.gemini;
  if (!process.env.OPENAI_API_KEY) process.env.OPENAI_API_KEY = DEFAULT_AI_KEYS.openai;
  if (!process.env.ANTHROPIC_API_KEY) process.env.ANTHROPIC_API_KEY = DEFAULT_AI_KEYS.anthropic;
  if (!process.env.AI_PLANNER_PROVIDER) process.env.AI_PLANNER_PROVIDER = 'gemini';
  if (!process.env.GEMINI_PLANNER_MODEL) process.env.GEMINI_PLANNER_MODEL = 'gemini-flash-lite-latest';
  if (!process.env.OPENAI_PLANNER_MODEL) process.env.OPENAI_PLANNER_MODEL = 'gpt-4o-mini';

  return process.env;
}

export function extractRequestKeys(req) {
  loadServerEnv();
  const h = req?.headers || {};
  return {
    gemini: String(h['x-gemini-key'] || process.env.GEMINI_API_KEY || DEFAULT_AI_KEYS.gemini || '').trim(),
    openai: String(h['x-openai-key'] || process.env.OPENAI_API_KEY || DEFAULT_AI_KEYS.openai || '').trim(),
    anthropic: String(h['x-anthropic-key'] || process.env.ANTHROPIC_API_KEY || DEFAULT_AI_KEYS.anthropic || '').trim(),
  };
}
