import fs from 'fs';

const content = fs.readFileSync('public/songs/hindi-sufi.html', 'utf8');
const bodyIdx = content.indexOf('<body');
const olIdx = content.indexOf('<ol');
console.log(content.slice(bodyIdx, olIdx + 50));
