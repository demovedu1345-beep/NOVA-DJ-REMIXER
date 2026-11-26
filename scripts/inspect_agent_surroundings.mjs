import fs from 'fs';

const content = fs.readFileSync('public/naux/static/immutable/chunks/2yak1xb5ht175.js', 'utf8');
const idx = 22942;
console.log('SURROUNDING JSX (22000-24500):');
console.log(content.slice(21500, 24500));
