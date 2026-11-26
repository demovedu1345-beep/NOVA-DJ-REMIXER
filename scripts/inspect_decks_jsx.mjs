import fs from 'fs';

const content = fs.readFileSync('public/naux/static/immutable/chunks/2yak1xb5ht175.js', 'utf8');
console.log('MAIN CONTAINER & DECKS (19000-22000):');
console.log(content.slice(19000, 22000));
