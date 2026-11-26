import fs from 'fs';

const js = fs.readFileSync('public/js/ui/aurora-and-mix-engine.js', 'utf8');

// Find perimeter or border canvas
let idx = js.indexOf('border');
while (idx !== -1) {
  const snippet = js.slice(Math.max(0, idx - 50), Math.min(js.length, idx + 150));
  if (snippet.includes('canvas') || snippet.includes('box-shadow') || snippet.includes('style') || snippet.includes('ctx')) {
    console.log('--- At', idx, '---');
    console.log(snippet);
  }
  idx = js.indexOf('border', idx + 6);
}
