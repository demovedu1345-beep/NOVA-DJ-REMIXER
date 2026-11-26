import fs from 'fs';

const css = fs.readFileSync('public/styles/artist-explorer.css', 'utf8');
const lines = css.split('\n');
lines.forEach((l, i) => {
  if (l.includes('Deck') || l.includes('DeckA') || l.includes('agent') || l.includes('skip') || l.includes('play-full') || l.includes('max-height') || l.includes('landscape') || l.includes('flex-1') || l.includes('container-type')) {
    console.log(`Line ${i+1}: ${l}`);
  }
});
