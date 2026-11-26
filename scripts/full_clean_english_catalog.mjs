import fs from 'fs';
import path from 'path';
import { CURATED_CATEGORIES_DB as apiDb } from '../api/_lib/curated-songs-db.js';
import { VERIFIED_ENGLISH_BANGERS } from './verified_english_pool.mjs';

const repoRoot = 'C:/Users/itzra/.gemini/antigravity/scratch/NOVA-DJ-REMIXER';
const filesToPatch = [
  path.join(repoRoot, 'api/_lib/curated-songs-db.js'),
  path.join(repoRoot, 'public/js/engine/curated-songs-db.js')
];

// List of non-english keywords/artists to match against English categories
const nonEnglishMarkers = [
  'kalia', 'rathayatra', 'danda', 'daryavarti', 'tarangato', 'koliyacha', 'pora',
  'tiger dance', 'ajaneesh', 'loknath', 'gauri', 'khanderaya', 'jhali', 'daina',
  'popat', 'chaka nayana', 'nayana', 'devotional', 'jagannath', 'koli', 'nakash',
  'aziz', 'arjun janya', 'janya', 'sambalpuri', 'appu', 'puneeth', 'devi sri',
  'kumar sanu', 'arijit', 'badshah', 'geet', 'nacho', 'desi', 'dhol', 'garba',
  'bhangra', 'punjabi', 'bollywood', 'hindi', 'tamil', 'telugu', 'kannada',
  'malayalam', 'marathi', 'gujarati', 'odia', 'shreya', 'sonu nigam', 'kishore',
  'lata', 'rafi', 'mukesh', 'asha', 'alka', 'udit', 'atif', 'pritam', 'diljit',
  'karan aujla', 'divine', 'shubh', 'ap dhillon', 'sidhu moose', 'b praak',
  'jaani', 'jasleen', 'jubin', 'neha kakkar', 'tony kakkar', 'armaan malik',
  'amal mallik', 'himesh', 'mika singh', 'honey singh', 'yo yo', 'raftaar',
  'emiway', 'mc stan', 'ikka', 'alka yagnik', 'sadhana sargam', 'udit narayan',
  'anuradha paudwal', 'kavita krishnamurthy', 'sachin-jigar', 'vishal-shekhar',
  'shankar-ehsaan-loy', 'ajay-atul', 'anirudh', 'thaman', 'sid sriram',
  'amit trivedi', 'harshdeep kaur', 'sukhwinder singh', 'sunidhi chauhan',
  'benny dayal', 'shaan', 'kk', 'mohit chauhan', 'javed ali', 'rahat fateh',
  'nusrat fateh', 'ali zafar', 'asima panda', 'human sagar', 'mantu chhuria',
  'umakant barik', 'ananya sritam', 'babushaan', 'archana', 'tapu mishra',
  'sailabhama', 'subash das', 'namita agrawal', 'chandan shetty', 'vijay prakash',
  'sanju vathsy', 'raghu dixit', 'naveen sajju', 'anthony daasan', 'dhee',
  'santhosh narayanan', 'hiphop tamizha', 'yuvan shankar', 'harris jayaraj',
  'g.v. prakash', 'devi sri prasad', 's.s. thaman', 'anirudh ravichander',
  'marathi pop', 'odia dance', 'festival dance', 'koli dance', 'folk dance',
  'sambalpuri dance', 'gujarati wedding', 'odia folk'
];

function isNonEnglish(title, artist) {
  const full = `${title} ${artist}`.toLowerCase();
  for (const m of nonEnglishMarkers) {
    // If marker has spaces or multiple words, do substring match
    if (m.includes(' ')) {
      if (full.includes(m)) return m;
    } else {
      // Single word: use word boundary regex
      const reg = new RegExp('\\b' + m + '\\b', 'i');
      if (reg.test(full)) return m;
    }
  }
  return null;
}

const db = JSON.parse(JSON.stringify(apiDb));

let totalReplaced = 0;
let repIdx = 0;

for (const [slug, cat] of Object.entries(db)) {
  if (cat.lang === 'english' || slug.startsWith('english')) {
    const songs = cat.songs || [];
    let catReplaced = 0;
    for (let i = 0; i < songs.length; i++) {
      const s = songs[i];
      const marker = isNonEnglish(s.title, s.artist);
      if (marker) {
        const rep = VERIFIED_ENGLISH_BANGERS[repIdx % VERIFIED_ENGLISH_BANGERS.length];
        repIdx++;
        songs[i] = {
          id: `${slug}-${i + 1}`,
          title: rep.title,
          artist: rep.artist,
          year: rep.year,
          durationSec: rep.durationSec,
          hookStartSec: rep.hookStartSec,
          hookEndSec: rep.hookEndSec,
          entrySec: rep.entrySec,
          exitSec: rep.exitSec,
          videoId: rep.videoId,
          youtube_ids: rep.youtube_ids,
          playFull: rep.playFull,
          energy: rep.energy,
          heat: s.heat || [0.5, 0.6, 0.7, 0.8, 0.9, 0.8, 0.7, 0.6, 0.5]
        };
        catReplaced++;
        totalReplaced++;
      }
    }
    if (catReplaced > 0) {
      console.log(`✓ Purged & replaced ${catReplaced} non-English tracks in ${slug}`);
    }
  }
}

console.log(`\nTOTAL NON-ENGLISH SONGS PURGED & REPLACED: ${totalReplaced}`);

const newContent = 'export const CURATED_CATEGORIES_DB = ' + JSON.stringify(db, null, 2) + ';\n';

for (const fp of filesToPatch) {
  console.log(`Writing to ${fp}...`);
  fs.writeFileSync(fp, newContent, 'utf-8');
  console.log(`Saved ${fp}`);
}
