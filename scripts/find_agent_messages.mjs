import fs from 'fs';

const c3cq = fs.readFileSync('public/naux/static/immutable/chunks/3cq6guoi7hqi2.js', 'utf8');
const c2yak = fs.readFileSync('public/naux/static/immutable/chunks/2yak1xb5ht175.js', 'utf8');

console.log('3cq contains clean copy:', c3cq.includes('clean copy') || c3cq.includes('CLEAN COPY') || c3cq.includes('MOVING ON') || c3cq.includes('moving on'));
console.log('2yak contains clean copy:', c2yak.includes('clean copy') || c2yak.includes('CLEAN COPY') || c2yak.includes('MOVING ON') || c2yak.includes('moving on'));
