import fs from 'fs';

const text = fs.readFileSync('public/js/ui/aurora-and-mix-engine.js', 'utf8');
let idx = 0;
while ((idx = text.indexOf('audify-control-pills-container', idx)) !== -1) {
  console.log('--- At', idx, '---');
  console.log(text.slice(Math.max(0, idx - 100), Math.min(text.length, idx + 300)));
  idx += 30;
}
