import fs from 'fs';

const content = fs.readFileSync('public/naux/static/immutable/chunks/2yak1xb5ht175.js', 'utf8');
const idx = content.indexOf('Audify');
console.log('Audify surrounding (18500-19500):');
console.log(content.slice(Math.max(0, idx - 500), Math.min(content.length, idx + 500)));
