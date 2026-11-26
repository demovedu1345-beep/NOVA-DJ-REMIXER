import fs from 'fs';

const content = fs.readFileSync('public/naux/static/immutable/chunks/2yak1xb5ht175.js', 'utf8');

// Find Deck definition
let idx = content.indexOf('function Deck(');
if (idx === -1) idx = content.indexOf('Deck:');
if (idx === -1) idx = content.indexOf('Deck=');

console.log('Deck search at', idx);
if (idx !== -1) {
  console.log(content.slice(Math.max(0, idx - 100), Math.min(content.length, idx + 600)));
} else {
  // search for "DECK "
  let dIdx = content.indexOf('DECK ');
  console.log('DECK search at', dIdx);
  console.log(content.slice(Math.max(0, dIdx - 200), Math.min(content.length, dIdx + 400)));
}
