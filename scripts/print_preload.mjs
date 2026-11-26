import fs from 'fs';

const content = fs.readFileSync('public/naux/static/immutable/chunks/3cq6guoi7hqi2.js', 'utf8');
console.log('PLAYER STATE / PRELOAD (46500-48000):');
console.log(content.slice(46500, 48000));
