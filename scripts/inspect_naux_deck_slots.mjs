import fs from 'fs';

const content = fs.readFileSync('public/naux/static/immutable/chunks/2yak1xb5ht175.js', 'utf8');

// Find Deck slots or container
const idx = content.indexOf('slot:es("A")');
console.log('Deck A & B usage (21500-22500):');
console.log(content.slice(idx - 100, idx + 600));

// Find slot:es definition
const esIdx = content.indexOf('es=');
if (esIdx !== -1) {
  console.log('es function definition:');
  console.log(content.slice(esIdx, esIdx + 200));
}
