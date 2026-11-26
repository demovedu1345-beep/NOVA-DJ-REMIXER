import fs from 'fs';

const c2 = fs.readFileSync('public/naux/static/immutable/chunks/2yak1xb5ht175.js', 'utf8');
const idx = c2.indexOf('hint:');
console.log('hint: at', idx);
console.log(c2.slice(idx - 100, idx + 300));
