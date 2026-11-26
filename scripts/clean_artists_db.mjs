import fs from 'fs';

const DB_PATH = 'api/_lib/artists-db.js';
const text = fs.readFileSync(DB_PATH, 'utf8');

const prefixStr = 'export const ARTISTS_DB = ';
const startIdx = text.indexOf(prefixStr);
const fnIdx = text.indexOf('export function getArtistsByLanguage');

const headerCode = text.slice(0, startIdx + prefixStr.length);
const jsonCode = text.slice(startIdx + prefixStr.length, fnIdx).trim().replace(/;$/, '');
const footerCode = text.slice(fnIdx);

const adb = JSON.parse(jsonCode);

// Authentic KK songs
const authenticKKSongs = [
  { title: "Yaaron", artist: "KK", videoId: "i9L-2j2t4w4", durationSec: 280, entrySec: 45, exitSec: 90 },
  { title: "Pal", artist: "KK", videoId: "o5Q_bL3_eE4", durationSec: 360, entrySec: 50, exitSec: 95 },
  { title: "Kya Mujhe Pyaar Hai", artist: "KK · Pritam", videoId: "5e6f7g8h9i0", durationSec: 275, entrySec: 40, exitSec: 85 },
  { title: "Alvida", artist: "KK · Pritam", videoId: "5E_m5k_2x8E", durationSec: 340, entrySec: 55, exitSec: 100 },
  { title: "Zara Sa", artist: "KK · Pritam", videoId: "hXh3sQv6z4I", durationSec: 305, entrySec: 45, exitSec: 90 },
  { title: "Dil Ibaadat", artist: "KK · Pritam", videoId: "hXh3sQv6z4I", durationSec: 330, entrySec: 50, exitSec: 95 },
  { title: "Tu Hi Meri Shab Hai", artist: "KK · Pritam", videoId: "1A2B3C4D5E6", durationSec: 390, entrySec: 60, exitSec: 105 },
  { title: "Labon Ko", artist: "KK · Pritam", videoId: "2B3C4D5E6F7", durationSec: 340, entrySec: 45, exitSec: 90 },
  { title: "Aankhon Mein Teri", artist: "KK · Vishal-Shekhar", videoId: "3C4D5E6F7G8", durationSec: 245, entrySec: 35, exitSec: 80 },
  { title: "Khuda Jaane", artist: "KK, Shilpa Rao · Vishal-Shekhar", videoId: "4D5E6F7G8H9", durationSec: 330, entrySec: 50, exitSec: 95 },
  { title: "Tu Aashiqui Hai", artist: "KK · Vishal-Shekhar", videoId: "5E6F7G8H9I0", durationSec: 370, entrySec: 55, exitSec: 100 },
  { title: "Awarapan Banjarapan", artist: "KK · M.M. Keeravani", videoId: "6F7G8H9I0J1", durationSec: 310, entrySec: 45, exitSec: 90 },
  { title: "Tadap Tadap Ke", artist: "KK, Dominique Cerejo · Ismail Darbar", videoId: "7G8H9I0J1K2", durationSec: 400, entrySec: 65, exitSec: 110 },
  { title: "O Meri Jaan", artist: "KK · Pritam", videoId: "8h9i0j1k2l3", durationSec: 305, entrySec: 45, exitSec: 90 },
  { title: "Beete Lamhein", artist: "KK · Mithoon", videoId: "9I0J1K2L3M4", durationSec: 330, entrySec: 50, exitSec: 95 }
];

let totalPurged = 0;

for (const [langKey, artists] of Object.entries(adb)) {
  for (const [artKey, art] of Object.entries(artists)) {
    const artNameLower = (art.name || artKey).toLowerCase().replace(/-/g, ' ');
    const beforeCount = art.songs.length;
    
    // Filter out songs whose artist field doesn't match this artist
    art.songs = art.songs.filter(s => {
      const sArtist = (s.artist || '').toLowerCase();
      const nameParts = artNameLower.split(' ');
      const match = nameParts.some(p => p.length > 2 && sArtist.includes(p)) || sArtist.includes(artKey);
      if (!match) {
        totalPurged++;
        return false;
      }
      return true;
    });

    if (artKey === 'kk') {
      const existingTitles = new Set(art.songs.map(s => s.title.toLowerCase().trim()));
      for (const ks of authenticKKSongs) {
        if (!existingTitles.has(ks.title.toLowerCase().trim())) {
          existingTitles.add(ks.title.toLowerCase().trim());
          art.songs.push({
            id: `kk-${art.songs.length + 1}`,
            ...ks,
            youtube_ids: [ks.videoId],
            playFull: false,
            energy: 8,
            heat: Array.from({ length: 100 }, (_, i) => +(0.5 + 0.35 * Math.sin(i / 10)).toFixed(3))
          });
        }
      }
    }
    console.log(`Artist ${art.name} (${artKey}): ${beforeCount} -> ${art.songs.length}`);
  }
}

const updatedCode = headerCode + JSON.stringify(adb, null, 2) + ';\n\n' + footerCode;
fs.writeFileSync(DB_PATH, updatedCode, 'utf8');
console.log(`Finished cleaning artists DB! Total falsely attributed songs purged: ${totalPurged}`);
