import fs from 'fs';

const code = fs.readFileSync('api/_lib/curated-songs-db.js', 'utf8');
const keys = [...code.matchAll(/["']([a-zA-Z0-9_\-]+)["']\s*:\s*\[/g)].map(m => m[1]);
console.log('Keys count:', keys.length);
console.log('Keys matching rock:', keys.filter(k => k.includes('rock')));
console.log('All keys starting with hindi:', keys.filter(k => k.startsWith('hindi') || k.startsWith('bollywood')));
