import fs from 'fs';

const txt = fs.readFileSync('public/naux/static/immutable/chunks/3cq6guoi7hqi2.js', 'utf8');
const idx = txt.indexOf(',298,');
console.log('Index of ,298,:', idx);
if (idx !== -1) {
  console.log(txt.slice(idx, idx + 1500));
}
