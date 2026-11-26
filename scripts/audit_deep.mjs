import fs from 'fs';
import { CURATED_CATEGORIES_DB } from '../api/_lib/curated-songs-db.js';

console.log('--- CURATED_CATEGORIES_DB SUMMARY ---');
const categories = Object.keys(CURATED_CATEGORIES_DB);
console.log('Total categories:', categories.length);

const suspectReport = {};

for (const [catKey, catObj] of Object.entries(CURATED_CATEGORIES_DB)) {
  const songs = catObj.songs || [];
  const lang = catObj.lang || 'hindi';
  const vids = new Set();
  let duplicates = 0;
  let wrongLangs = [];
  
  for (const s of songs) {
    const vid = s.videoId || (s.youtube_ids && s.youtube_ids[0]);
    if (vids.has(vid)) duplicates++;
    vids.add(vid);

    const art = (s.artist || '').toLowerCase();
    const title = (s.title || '').toLowerCase();

    if (lang === 'english') {
      if (art.includes('singh') || art.includes('pritam') || art.includes('badshah') || art.includes('kumar') ||
          art.includes('shreya') || art.includes('sunidhi') || art.includes('honey singh') || art.includes('diljit') ||
          art.includes('kanika') || art.includes('lahiri') || art.includes('vishal') || art.includes('shekhar') ||
          art.includes('arijit') || art.includes('jubin') || art.includes('shankar') || art.includes('gohil') ||
          art.includes('basrur') || art.includes('prakash') || art.includes('nautiyal')) {
        wrongLangs.push({ title: s.title, artist: s.artist, videoId: vid });
      }
    } else if (lang === 'hindi') {
      if (art.includes('drake') || art.includes('eminem') || art.includes('travis scott') || art.includes('kendrick') ||
          art.includes('taylor swift') || art.includes('ed sheeran') || art.includes('linkin park') || art.includes('queen') ||
          art.includes('post malone') || art.includes('billie eilish') || art.includes('adele') || art.includes('coldplay')) {
        wrongLangs.push({ title: s.title, artist: s.artist, videoId: vid });
      }
    }
  }

  suspectReport[catKey] = {
    lang,
    count: songs.length,
    uniqueVids: vids.size,
    duplicates,
    wrongLangsCount: wrongLangs.length,
    wrongLangsSample: wrongLangs.slice(0, 5)
  };
}

for (const [k, rep] of Object.entries(suspectReport)) {
  if (rep.duplicates > 0 || rep.wrongLangsCount > 0 || rep.count < 50) {
    console.log(`[ALERT] ${k} (lang: ${rep.lang}): total=${rep.count}, unique=${rep.uniqueVids}, dups=${rep.duplicates}, wrongLangs=${rep.wrongLangsCount}`);
    if (rep.wrongLangsCount > 0) {
      console.log('   Sample wrong songs:', rep.wrongLangsSample.map(x => `${x.title} by ${x.artist}`).join('; '));
    }
  }
}
