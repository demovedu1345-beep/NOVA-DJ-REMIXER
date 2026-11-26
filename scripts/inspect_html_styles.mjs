import fs from 'fs';

const html = fs.readFileSync('public/index.html', 'utf8');
const links = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi)].map(m => m[0]);
console.log('Stylesheet links:', links);
const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[0].slice(0, 100) + '... (' + m[0].length + ' bytes)');
console.log('Style tags count:', styles.length);
styles.forEach((s, i) => console.log(`Style ${i}: ${s}`));
