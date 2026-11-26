import fs from 'fs';

const c2 = fs.readFileSync('public/naux/static/immutable/chunks/2yak1xb5ht175.js', 'utf8');
let idx = c2.indexOf('IN ');
while (idx !== -1) {
  console.log('IN at', idx);
  console.log(c2.slice(Math.max(0, idx - 50), Math.min(c2.length, idx + 150)));
  idx = c2.indexOf('IN ', idx + 3);
}
