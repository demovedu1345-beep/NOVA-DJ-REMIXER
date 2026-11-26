import fs from 'fs';

const css = fs.readFileSync('public/styles/artist-explorer.css', 'utf8');
const js = fs.readFileSync('public/js/ui/aurora-and-mix-engine.js', 'utf8');

console.log('CSS matches for border glow:');
const cssGlow = [...css.matchAll(/([^{}]*?glow[^{}]*?\{[^}]*?\})/gi)].map(m => m[0]);
cssGlow.forEach(g => console.log(g.slice(0, 100)));

console.log('\nSearching for perimeter or border in JS:');
const jsMatches = [...js.matchAll(/(border-glow|perimeter|gold|yellow|#D4FF00)/gi)].map(m => m[0]);
console.log('JS matches count:', jsMatches.length);
