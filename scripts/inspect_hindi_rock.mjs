import fs from 'fs';

const code = fs.readFileSync('api/_lib/curated-songs-db.js', 'utf8');
const match = code.match(/["']hindi-rock["']\s*:\s*\[([\s\S]*?)\]\s*,\s*["']/);
if (match) {
  const titles = [...match[1].matchAll(/["']title["']\s*:\s*["'](.*?)["']/g)].map(m => m[1]);
  console.log(`Total tracks in hindi-rock: ${titles.length}`);
  console.log('Sample tracks in hindi-rock:');
  titles.slice(0, 30).forEach((t, i) => console.log(`${i+1}. ${t}`));
  console.log('\nTracks with Character Dheela, Twist, etc:');
  titles.forEach((t, i) => {
    if (t.toLowerCase().includes('character') || t.toLowerCase().includes('twist') || t.toLowerCase().includes('thumakda') || t.toLowerCase().includes('chogada')) {
      console.log(`Index ${i}: ${t}`);
    }
  });
} else {
  console.log('Could not find hindi-rock');
}
