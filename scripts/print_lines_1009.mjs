import fs from 'fs';

const css = fs.readFileSync('public/styles/artist-explorer.css', 'utf8');
const lines = css.split('\n');
console.log(lines.slice(1008, 1250).join('\n'));
