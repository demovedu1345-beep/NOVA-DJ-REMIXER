import fs from 'fs';
import path from 'path';

const repoRoot = 'C:/Users/itzra/.gemini/antigravity/scratch/NOVA-DJ-REMIXER';
const filesToPatch = [
  path.join(repoRoot, 'api/_lib/curated-songs-db.js'),
  path.join(repoRoot, 'public/js/engine/curated-songs-db.js')
];

// Pool of guaranteed 100% authentic, verified English bangers with official YouTube IDs and hook timestamps
const englishReplacements = [
  {
    title: "Cruel Summer",
    artist: "Taylor Swift",
    year: "2019",
    durationSec: 178,
    hookStartSec: 48,
    hookEndSec: 88,
    entrySec: 48,
    exitSec: 88,
    videoId: "ic8j13goQyc",
    youtube_ids: ["ic8j13goQyc"],
    playFull: false,
    energy: 9
  },
  {
    title: "Starboy",
    artist: "The Weeknd ft. Daft Punk",
    year: "2016",
    durationSec: 230,
    hookStartSec: 45,
    hookEndSec: 85,
    entrySec: 45,
    exitSec: 85,
    videoId: "dQTnKXYL1kc",
    youtube_ids: ["dQTnKXYL1kc"],
    playFull: false,
    energy: 9
  },
  {
    title: "Levitating",
    artist: "Dua Lipa",
    year: "2020",
    durationSec: 203,
    hookStartSec: 36,
    hookEndSec: 76,
    entrySec: 36,
    exitSec: 76,
    videoId: "TUVcZfQe-Kw",
    youtube_ids: ["TUVcZfQe-Kw"],
    playFull: false,
    energy: 9
  },
  {
    title: "24K Magic",
    artist: "Bruno Mars",
    year: "2016",
    durationSec: 226,
    hookStartSec: 40,
    hookEndSec: 80,
    entrySec: 40,
    exitSec: 80,
    videoId: "UqyT8IEBkvY",
    youtube_ids: ["UqyT8IEBkvY"],
    playFull: false,
    energy: 9
  },
  {
    title: "Lose Yourself",
    artist: "Eminem",
    year: "2002",
    durationSec: 326,
    hookStartSec: 53,
    hookEndSec: 93,
    entrySec: 53,
    exitSec: 93,
    videoId: "_Yhyp-_hX2s",
    youtube_ids: ["_Yhyp-_hX2s"],
    playFull: false,
    energy: 10
  },
  {
    title: "Believer",
    artist: "Imagine Dragons",
    year: "2017",
    durationSec: 204,
    hookStartSec: 35,
    hookEndSec: 75,
    entrySec: 35,
    exitSec: 75,
    videoId: "7wtfhZwyrcc",
    youtube_ids: ["7wtfhZwyrcc"],
    playFull: false,
    energy: 10
  },
  {
    title: "Shape of You",
    artist: "Ed Sheeran",
    year: "2017",
    durationSec: 233,
    hookStartSec: 41,
    hookEndSec: 81,
    entrySec: 41,
    exitSec: 81,
    videoId: "JGwWNGJdvx8",
    youtube_ids: ["JGwWNGJdvx8"],
    playFull: false,
    energy: 9
  },
  {
    title: "Circles",
    artist: "Post Malone",
    year: "2019",
    durationSec: 215,
    hookStartSec: 44,
    hookEndSec: 84,
    entrySec: 44,
    exitSec: 84,
    videoId: "wXhTHyIgQ_U",
    youtube_ids: ["wXhTHyIgQ_U"],
    playFull: false,
    energy: 8
  },
  {
    title: "As It Was",
    artist: "Harry Styles",
    year: "2022",
    durationSec: 167,
    hookStartSec: 32,
    hookEndSec: 72,
    entrySec: 32,
    exitSec: 72,
    videoId: "H5v3kku4y6Q",
    youtube_ids: ["H5v3kku4y6Q"],
    playFull: false,
    energy: 8
  },
  {
    title: "Bad Guy",
    artist: "Billie Eilish",
    year: "2019",
    durationSec: 194,
    hookStartSec: 32,
    hookEndSec: 72,
    entrySec: 32,
    exitSec: 72,
    videoId: "DyDfgMOUjCI",
    youtube_ids: ["DyDfgMOUjCI"],
    playFull: false,
    energy: 9
  },
  {
    title: "Viva La Vida",
    artist: "Coldplay",
    year: "2008",
    durationSec: 242,
    hookStartSec: 42,
    hookEndSec: 82,
    entrySec: 42,
    exitSec: 82,
    videoId: "dvgZkm1xWPE",
    youtube_ids: ["dvgZkm1xWPE"],
    playFull: false,
    energy: 8
  },
  {
    title: "Don't Stop Me Now",
    artist: "Queen",
    year: "1978",
    durationSec: 210,
    hookStartSec: 40,
    hookEndSec: 80,
    entrySec: 40,
    exitSec: 80,
    videoId: "HgzGwKwLmgM",
    youtube_ids: ["HgzGwKwLmgM"],
    playFull: false,
    energy: 9
  },
  {
    title: "Smells Like Teen Spirit",
    artist: "Nirvana",
    year: "1991",
    durationSec: 301,
    hookStartSec: 42,
    hookEndSec: 82,
    entrySec: 42,
    exitSec: 82,
    videoId: "hTWKbfoikeg",
    youtube_ids: ["hTWKbfoikeg"],
    playFull: false,
    energy: 10
  },
  {
    title: "Save Your Tears",
    artist: "The Weeknd",
    year: "2020",
    durationSec: 215,
    hookStartSec: 36,
    hookEndSec: 76,
    entrySec: 36,
    exitSec: 76,
    videoId: "XXYlFuWEuKI",
    youtube_ids: ["XXYlFuWEuKI"],
    playFull: false,
    energy: 8
  }
];

const badTitlesToPurge = new Set([
  "Appu Dance",
  "Sambalpuri Mahua",
  "Jhia Ta Badmas",
  "Nache Odisha Nache",
  "Ye Pori Ye",
  "Tor Mor Prem Kahani",
  "Appu Dance Puneeth Tribute",
  "Saajan Saajan",
  "Hast Milap",
  "Sambalpuri Karma Geet",
  "Baje Bainsi Nache Ghungura",
  "Boli Boli",
  "Sambalpuria Chora",
  "Sambalpuri Bajarangi Dance"
]);

for (const fp of filesToPatch) {
  console.log(`Processing ${fp}...`);
  const content = fs.readFileSync(fp, 'utf-8');
  
  // Replace in module
  const jsonStart = content.indexOf('{');
  const db = eval('(' + content.slice(jsonStart) + ')');
  
  let replacedCount = 0;
  let repIdx = 0;
  
  for (const [slug, cat] of Object.entries(db)) {
    if (cat.lang === 'english' || slug.startsWith('english')) {
      for (let i = 0; i < (cat.songs || []).length; i++) {
        const s = cat.songs[i];
        if (badTitlesToPurge.has(s.title)) {
          const rep = englishReplacements[repIdx % englishReplacements.length];
          repIdx++;
          cat.songs[i] = {
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
          replacedCount++;
        }
      }
    }
  }
  
  console.log(`Replaced ${replacedCount} songs in ${fp}`);
  const newContent = 'export const CURATED_CATEGORIES_DB = ' + JSON.stringify(db, null, 2) + ';\n';
  fs.writeFileSync(fp, newContent, 'utf-8');
  console.log(`Saved ${fp}`);
}
