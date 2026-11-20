import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cacheFile = path.join(__dirname, 'agent_2_cache.json');

let cache = {};
if (fs.existsSync(cacheFile)) {
  cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
}

function saveCache() {
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2), 'utf8');
}

async function verifyOembed(videoId) {
  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      return { valid: true, title: data.title, author: data.author_name };
    }
    return { valid: false, status: res.status };
  } catch (e) {
    return { valid: false, error: e.message };
  }
}

async function queryYouTubeOnce(query) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
  });

  if (res.status === 429) {
    console.warn(' (Rate limited 429, waiting 6s...) ');
    await new Promise(r => setTimeout(r, 6000));
    return { rateLimited: true };
  }
  if (!res.ok) return null;

  const text = await res.text();
  const idMatches = [...text.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)].map(m => m[1]);
  const uniqueIds = [...new Set(idMatches)];
  for (const vid of uniqueIds.slice(0, 6)) {
    const verify = await verifyOembed(vid);
    if (verify.valid) {
      return {
        videoId: vid,
        title: verify.title,
        durationSec: 215,
        channel: verify.author
      };
    }
  }
  return null;
}

const REMAINING_CANDIDATES = [
  // Paradox
  { title: "Babam Bam", artist: "Paradox", year: "2022", hook: 30, energy: 10, query: "Babam Bam Paradox Hustle 2.0 official video", fallback: "Babam Bam Paradox" },
  { title: "BT Ho Gayi", artist: "Paradox", year: "2022", hook: 28, energy: 10, query: "BT Ho Gayi Paradox Hustle 2.0 official video", fallback: "BT Ho Gayi Paradox" },
  { title: "Mileya Ni", artist: "Paradox", year: "2022", hook: 32, energy: 9, query: "Mileya Ni Paradox Hustle 2.0 official video", fallback: "Mileya Ni Paradox" },
  { title: "Ghatotkach", artist: "Paradox", year: "2022", hook: 30, energy: 10, query: "Ghatotkach Paradox Hustle 2.0 official video", fallback: "Ghatotkach Paradox" },
  { title: "Perfy", artist: "Paradox", year: "2023", hook: 28, energy: 9, query: "Paradox Perfy official music video", fallback: "Paradox Perfy" },
  { title: "Chore NCR Aale", artist: "Paradox ft. MC Square", year: "2022", hook: 30, energy: 10, query: "Chhore NCR Aale Paradox MC Square Hustle 2.0", fallback: "Chhore NCR Aale Paradox" },

  // Fotty Seven
  { title: "Boht Sahi", artist: "Fotty Seven", year: "2020", hook: 28, energy: 10, query: "Fotty Seven Boht Sahi official music video", fallback: "Fotty Seven Boht Sahi" },
  { title: "Haath Toh Laga", artist: "Fotty Seven ft. Rebel 7", year: "2020", hook: 30, energy: 10, query: "Fotty Seven Haath Toh Laga official music video", fallback: "Fotty Seven Haath Toh Laga" },
  { title: "Banjo", artist: "Fotty Seven", year: "2022", hook: 30, energy: 9, query: "Fotty Seven Banjo official music video", fallback: "Fotty Seven Banjo" },
  { title: "Kar Denge Khalaas", artist: "Fotty Seven", year: "2020", hook: 25, energy: 10, query: "Fotty Seven Kar Denge Khalaas official music video", fallback: "Fotty Seven Kar Denge Khalaas" },
  { title: "Galat Launde", artist: "Fotty Seven", year: "2020", hook: 28, energy: 9, query: "Fotty Seven Galat Launde official music video", fallback: "Fotty Seven Galat Launde" },
  { title: "Pagal Hai Kya", artist: "Fotty Seven", year: "2019", hook: 30, energy: 9, query: "Fotty Seven Pagal Hai Kya official music video", fallback: "Fotty Seven Pagal Hai Kya" },
  { title: "Baap Se", artist: "Fotty Seven ft. KR$NA", year: "2020", hook: 30, energy: 10, query: "Fotty Seven Baap Se KR$NA official video", fallback: "Fotty Seven Baap Se" },

  // Bella
  { title: "Humble Poet", artist: "Bella", year: "2020", hook: 35, energy: 9, query: "Bella Humble Poet official music video", fallback: "Bella Humble Poet" },
  { title: "Antidote", artist: "Bella", year: "2021", hook: 35, energy: 9, query: "Bella Antidote official music video", fallback: "Bella Antidote" },
  { title: "Sweet Poison", artist: "Bella", year: "2022", hook: 30, energy: 9, query: "Bella Sweet Poison official music video", fallback: "Bella Sweet Poison" },
  { title: "Monster", artist: "Bella", year: "2022", hook: 30, energy: 9, query: "Bella Monster official music video", fallback: "Bella Monster" },
  { title: "Khoya Sab", artist: "Bella", year: "2021", hook: 35, energy: 9, query: "Bella Khoya Sab official music video", fallback: "Bella Khoya Sab" },

  // Karma
  { title: "1 Sahaara", artist: "Karma", year: "2020", hook: 35, energy: 9, query: "Karma 1 Sahaara official music video Kalamkaar", fallback: "Karma 1 Sahaara" },
  { title: "Fate", artist: "Karma", year: "2021", hook: 30, energy: 9, query: "Karma Fate official music video Kalamkaar", fallback: "Karma Fate" },
  { title: "Success", artist: "Karma", year: "2022", hook: 30, energy: 9, query: "Karma Success official music video Kalamkaar", fallback: "Karma Success" },
  { title: "Zaruri Nahi", artist: "Karma", year: "2021", hook: 32, energy: 9, query: "Karma Zaruri Nahi official music video Kalamkaar", fallback: "Karma Zaruri Nahi" },
  { title: "Google Pay", artist: "Karma", year: "2021", hook: 28, energy: 10, query: "Karma Google Pay official music video Kalamkaar", fallback: "Karma Google Pay" },
  { title: "Baba Yaga", artist: "Karma", year: "2021", hook: 25, energy: 10, query: "Karma Baba Yaga official music video Kalamkaar", fallback: "Karma Baba Yaga" },

  // Raga
  { title: "Sheher", artist: "Raga", year: "2020", hook: 30, energy: 10, query: "Raga Sheher official music video", fallback: "Raga Sheher" },
  { title: "Jahannum", artist: "Raga", year: "2021", hook: 30, energy: 9, query: "Raga Jahannum official music video", fallback: "Raga Jahannum" },
  { title: "Badnaam", artist: "Raga", year: "2022", hook: 30, energy: 10, query: "Raga Badnaam official music video", fallback: "Raga Badnaam" },
  { title: "Kartoos", artist: "Raga", year: "2021", hook: 28, energy: 10, query: "Raga Kartoos official music video", fallback: "Raga Kartoos" },
  { title: "Bhasad", artist: "Raga", year: "2021", hook: 25, energy: 10, query: "Raga Bhasad official music video", fallback: "Raga Bhasad" },

  // Brodha V
  { title: "Aathma Raama", artist: "Brodha V", year: "2012", hook: 40, energy: 9, query: "Brodha V Aathma Raama official music video", fallback: "Brodha V Aathma Raama" },
  { title: "Vainko", artist: "Brodha V", year: "2019", hook: 35, energy: 10, query: "Brodha V Vainko official music video", fallback: "Brodha V Vainko" },
  { title: "Aigiri Nandini", artist: "Brodha V", year: "2013", hook: 35, energy: 10, query: "Brodha V Aigiri Nandini official music video", fallback: "Brodha V Aigiri Nandini" },
  { title: "Shook Ones", artist: "Brodha V", year: "2018", hook: 30, energy: 9, query: "Brodha V Shook Ones Freestyle", fallback: "Brodha V Shook Ones" },

  // Ikka, Dino James, MC Square, Others
  { title: "Angaar", artist: "Ikka ft. Raftaar", year: "2020", hook: 32, energy: 10, query: "Ikka Raftaar Angaar official music video", fallback: "Ikka Raftaar Angaar" },
  { title: "Level Up", artist: "Ikka ft. DIVINE, Kaater", year: "2021", hook: 30, energy: 10, query: "Ikka Level Up DIVINE official music video", fallback: "Ikka Level Up DIVINE" },
  { title: "Trap Munde", artist: "Ikka ft. Dino James", year: "2022", hook: 32, energy: 10, query: "Ikka Trap Munde Dino James official music video", fallback: "Ikka Trap Munde Dino James" },
  { title: "Shringaar", artist: "Ikka ft. Aastha Gill, AKASA", year: "2022", hook: 35, energy: 10, query: "Shringaar Akasa Aastha Gill Ikka official video", fallback: "Shringaar Akasa Aastha Gill Ikka" },
  { title: "Tandav", artist: "Dino James", year: "2019", hook: 35, energy: 10, query: "Dino James Tandav official music video", fallback: "Dino James Tandav" },
  { title: "Loser", artist: "Dino James", year: "2016", hook: 45, energy: 9, query: "Dino James Loser official music video", fallback: "Dino James Loser" },
  { title: "Wishlist", artist: "Dino James ft. Kaprila", year: "2020", hook: 35, energy: 9, query: "Dino James Wishlist Kaprila official music video", fallback: "Dino James Wishlist" },
  { title: "Ram Ram", artist: "MC Square", year: "2022", hook: 30, energy: 10, query: "Ram Ram MC Square Hustle 2.0 official video", fallback: "Ram Ram MC Square" },
  { title: "Badluram Ka Badan", artist: "EPR Iyer", year: "2022", hook: 30, energy: 10, query: "Badluram Ka Badan EPR Hustle 2.0 official video", fallback: "Badluram Ka Badan EPR" },
  { title: "Chill Kinda Guy", artist: "Srushti Tawade", year: "2022", hook: 25, energy: 9, query: "Chill Kinda Guy Srushti Tawade Hustle 2.0 official video", fallback: "Chill Kinda Guy Srushti Tawade" },
  { title: "Big Dawgs", artist: "Hanumankind ft. Kalmi", year: "2024", hook: 30, energy: 10, query: "Hanumankind Big Dawgs official music video", fallback: "Hanumankind Big Dawgs" },
  { title: "Dhundhala", artist: "Yashraj ft. Dropped Out, Talwiinder", year: "2022", hook: 35, energy: 10, query: "Dhundhala Yashraj Talwiinder official music video", fallback: "Dhundhala Yashraj Talwiinder" },
  { title: "Aafat!", artist: "Naezy", year: "2014", hook: 30, energy: 9, query: "Naezy Aafat official music video", fallback: "Naezy Aafat" },
  { title: "Asal Hustle", artist: "Naezy", year: "2015", hook: 30, energy: 9, query: "Naezy Asal Hustle official music video", fallback: "Naezy Asal Hustle" }
];

async function run() {
  console.log(`Checking & caching ${REMAINING_CANDIDATES.length} remaining candidate songs...`);
  for (let i = 0; i < REMAINING_CANDIDATES.length; i++) {
    const raw = REMAINING_CANDIDATES[i];
    if (cache[raw.query]) {
      console.log(`[${i+1}/${REMAINING_CANDIDATES.length}] CACHED: ${raw.title}`);
      continue;
    }
    process.stdout.write(`[${i+1}/${REMAINING_CANDIDATES.length}] Searching: ${raw.title} ... `);
    let v = await queryYouTubeOnce(raw.query);
    if (!v && raw.fallback) {
      v = await queryYouTubeOnce(raw.fallback);
    }
    if (v && v.videoId) {
      cache[raw.query] = v;
      saveCache();
      console.log(`OK: ${v.videoId} - ${v.title.slice(0, 40)}`);
    } else {
      console.log('FAILED');
    }
    await new Promise(r => setTimeout(r, 650));
  }
  console.log('Done caching remaining candidates!');
}
run().catch(console.error);
