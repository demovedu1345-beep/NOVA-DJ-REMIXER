import { CURATED_CATEGORIES_DB } from '../api/_lib/curated-songs-db.js';

const searchTitles = [
  'sadda haq', 'jiyein kyun', 'alvida', 'rock on', 'bhaag d.k.', 'nadaan parindey', 'zinda',
  'dhan te nan', 'bulleya', 'aadat', 'woh lamhe', 'sayonee', 'bheegi bheegi', 'ya ali',
  'kya mujhe pyaar hai', 'dum maro dum', 'aarambh hai', 'dhaakad', 'kar har maidaan',
  'chaiyya chaiyya', 'dil se re', 'maa tujhe salaam', 'rang de basanti', 'rubaroo',
  'give me some sunshine', 'iktara', 'wake up sid', 'illahi', 'kabira', 'channa mereya',
  'matargashti', 'agar tum saath ho', 'kun faya kun', 'tum se hi', 'pee loon', 'khuda jaane',
  'mitwa', 'subhanallah', 'hothon se chhoo lo tum', 'tum itna jo', 'yeh daulat bhi',
  'woh kagaz ki kashti', 'chitthi na koi sandesh', 'jhuki jhuki si nazar', 'tum ko dekha',
  'achyutam keshavam', 'hanuman chalisa', 'shiv tandav', 'namo namo', 'radhe radhe',
  'maula mere maula', 'khwaja mere khwaja', 'arziyan', 'afreen afreen', 'chaap tilak',
  'tera hone laga hoon', 'tu jaane na', 'jeena jeena', 'pehli nazar mein'
];

const results = [];
for (const [k, cat] of Object.entries(CURATED_CATEGORIES_DB)) {
  for (const s of (cat.songs || [])) {
    const t = s.title.toLowerCase();
    for (const q of searchTitles) {
      if (t.includes(q)) {
        const vId = s.videoId || (s.youtube_ids && s.youtube_ids[0]);
        if (vId && vId.length === 11 && !vId.includes('K1n0v4')) {
          results.push({
            fromCat: k,
            query: q,
            title: s.title,
            artist: s.artist,
            videoId: vId,
            durationSec: s.durationSec,
            entrySec: s.entrySec ?? s.hookStartSec ?? 30,
            exitSec: s.exitSec ?? s.hookEndSec ?? 70,
            bpm: s.bpm,
            energy: s.energy
          });
        }
      }
    }
  }
}

console.log(`Found ${results.length} matched songs in DB:`);
const unique = new Map();
results.forEach(r => {
  if (!unique.has(r.title.toLowerCase())) {
    unique.set(r.title.toLowerCase(), r);
  }
});
console.log(`Unique titles found: ${unique.size}`);
for (const [t, s] of unique.entries()) {
  console.log(`- ${s.title} | ${s.artist} | ${s.videoId} (from: ${s.fromCat})`);
}
