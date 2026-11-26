import fs from 'fs';

const c2yak = fs.readFileSync('public/naux/static/immutable/chunks/2yak1xb5ht175.js', 'utf8');
let idx = c2yak.indexOf('clean copy');
if (idx === -1) idx = c2yak.indexOf('CLEAN COPY');
console.log('Index:', idx);
console.log(c2yak.slice(Math.max(0, idx - 200), Math.min(c2yak.length, idx + 400)));
