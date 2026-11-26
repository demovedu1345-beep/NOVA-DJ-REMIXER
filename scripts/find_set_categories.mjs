import fs from 'fs';

const setJs = fs.readFileSync('api/set.js', 'utf8');
console.log('set.js length:', setJs.length);
const matches = [...setJs.matchAll(/([a-zA-Z0-9_\-]+)\s*:\s*\[/g)].map(m => m[1]);
console.log('Keys in set.js:', matches.slice(0, 30));
console.log('Rock in set.js:', matches.filter(k => k.includes('rock')));

const files = fs.readdirSync('api/_lib');
console.log('Files in api/_lib:', files);
