import fs from 'fs';

const content = fs.readFileSync('public/naux/static/immutable/chunks/2yak1xb5ht175.js', 'utf8');

// Search for section with data-slot
const idx = content.indexOf('section",{ref:y,"data-slot":m');
console.log('Deck section JSX (1000-3000):');
console.log(content.slice(idx - 50, idx + 1200));
