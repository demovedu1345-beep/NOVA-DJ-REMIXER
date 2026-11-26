import fs from 'fs';

const css = fs.readFileSync('public/naux/static/immutable/chunks/2imx6i21-1sy0.css', 'utf8');

const matches = [...css.matchAll(/(\.[a-zA-Z0-9_\-\[\]\:\=\"\>\+\~\*\, ]*?data-slot[^{]*?\{[^}]*?\})/g)].map(m => m[0]);
console.log('Matches with data-slot:', matches.length);
matches.forEach(m => console.log(m));

const deckMatches = [...css.matchAll(/(\.deck[^{]*?\{[^}]*?\})/g)].map(m => m[0]);
console.log('Matches with .deck:', deckMatches.length);
deckMatches.forEach(m => console.log(m));
