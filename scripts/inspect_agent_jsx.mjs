import fs from 'fs';

const content = fs.readFileSync('public/naux/static/immutable/chunks/2yak1xb5ht175.js', 'utf8');

// Find AGENT occurrences
let idx = 0;
while ((idx = content.indexOf('AGENT', idx)) !== -1) {
  console.log('--- AGENT occurrence at', idx, '---');
  console.log(content.slice(Math.max(0, idx - 200), Math.min(content.length, idx + 300)));
  idx += 5;
}
