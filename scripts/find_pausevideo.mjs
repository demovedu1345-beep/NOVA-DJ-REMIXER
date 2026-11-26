import fs from 'fs';

const content = fs.readFileSync('public/naux/static/immutable/chunks/3cq6guoi7hqi2.js', 'utf8');

let idx = 0;
while ((idx = content.indexOf('pauseVideo', idx)) !== -1) {
  console.log('--- pauseVideo at', idx, '---');
  console.log(content.slice(Math.max(0, idx - 150), Math.min(content.length, idx + 250)));
  idx += 10;
}
