import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dbPath = pathToFileURL(path.join(root, 'api/_lib/curated-songs-db.js')).href;
const dbModule = await import(dbPath);
const db = dbModule.CURATED_CATEGORIES_DB;

const party = db['haryanvi-bhojpuri-party']?.songs || [];
const desi = db['haryanvi-bhojpuri-desi-beats']?.songs || [];

fs.writeFileSync(
  path.join(root, 'scripts/existing_hb_songs.json'),
  JSON.stringify({ 'haryanvi-bhojpuri-party': party, 'haryanvi-bhojpuri-desi-beats': desi }, null, 2),
  'utf8'
);

console.log(`Saved existing songs: Party=${party.length}, Desi=${desi.length}`);
