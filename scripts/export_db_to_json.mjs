import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dbModule = await import('../api/_lib/curated-songs-db.js');
const db = dbModule.CURATED_CATEGORIES_DB;

fs.writeFileSync(path.join(root, 'scripts/existing_db.json'), JSON.stringify(db, null, 2), 'utf8');
console.log(`Exported ${Object.keys(db).length} categories to scripts/existing_db.json`);
