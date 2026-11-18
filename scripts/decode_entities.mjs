import fs from 'node:fs';
let content = fs.readFileSync('public/js/engine/curated-songs-db.js', 'utf8');
content = content.replaceAll('&amp;', '&');
content = content.replaceAll('&#x27;', "'");
content = content.replaceAll('&quot;', '"');
fs.writeFileSync('public/js/engine/curated-songs-db.js', content, 'utf8');
console.log('Decoded HTML entities in curated-songs-db.js successfully');
