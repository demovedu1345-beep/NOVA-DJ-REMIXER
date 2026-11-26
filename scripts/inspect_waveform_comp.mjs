import fs from 'fs';

const c2 = fs.readFileSync('public/naux/static/immutable/chunks/2yak1xb5ht175.js', 'utf8');
console.log('Waveform component (25500-27000):');
console.log(c2.slice(25500, 27000));
