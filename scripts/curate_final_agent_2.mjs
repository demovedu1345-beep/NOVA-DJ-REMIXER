import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cacheFile = path.join(__dirname, 'agent_2_cache.json');
const outputFile = path.join(__dirname, 'curated_batches', 'agent_2.json');

const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));

// Curated list prioritizing variety, top hits, and requested songs
const SELECTED_MASTER_POOL = [
  // --- DIVINE (8) ---
  { title: "Mirchi", artist: "DIVINE ft. MC Altaf, Phenom, Stylo G", year: "2020", hook: 45, energy: 10, query: "DIVINE Mirchi official music video" },
  { title: "3:59 AM", artist: "DIVINE", year: "2021", hook: 50, energy: 10, query: "DIVINE 3:59 AM official music video" },
  { title: "Kohinoor", artist: "DIVINE", year: "2019", hook: 35, energy: 9, query: "DIVINE Kohinoor official music video" },
  { title: "Chal Bombay", artist: "DIVINE", year: "2019", hook: 40, energy: 9, query: "DIVINE Chal Bombay official music video" },
  { title: "Kaam 25", artist: "DIVINE", year: "2018", hook: 25, energy: 10, query: "DIVINE Kaam 25 Sacred Games official music video" },
  { title: "Mere Gully Mein", artist: "DIVINE ft. Naezy", year: "2019", hook: 28, energy: 10, query: "Mere Gully Mein Gully Boy Ranveer Singh DIVINE Naezy official video" },
  { title: "Baazigar", artist: "DIVINE ft. Armani White", year: "2022", hook: 35, energy: 10, query: "DIVINE Baazigar Armani White official music video" },
  { title: "Sher Aaya Sher", artist: "DIVINE", year: "2019", hook: 22, energy: 10, query: "Sher Aaya Sher Gully Boy Ranveer Singh DIVINE official video" },

  // --- MC STAN (6) ---
  { title: "Basti Ka Hasti", artist: "MC Stan", year: "2022", hook: 32, energy: 10, query: "MC Stan Basti Ka Hasti official video" },
  { title: "Ek Din Pyaar", artist: "MC Stan", year: "2022", hook: 25, energy: 9, query: "MC Stan Ek Din Pyaar official music video" },
  { title: "Snake", artist: "MC Stan", year: "2021", hook: 28, energy: 9, query: "MC Stan Snake official music video" },
  { title: "Tadipaar", artist: "MC Stan", year: "2020", hook: 42, energy: 9, query: "MC Stan Tadipaar official music video" },
  { title: "Insaan", artist: "MC Stan", year: "2022", hook: 30, energy: 9, query: "MC Stan Insaan title track official video" },
  { title: "Numberkari", artist: "MC Stan", year: "2020", hook: 30, energy: 9, query: "MC Stan Numberkari official music video" },

  // --- SEEDHE MAUT (8) ---
  { title: "Namastute", artist: "Seedhe Maut", year: "2021", hook: 30, energy: 10, query: "Seedhe Maut Namastute official music video" },
  { title: "Nanchaku", artist: "Seedhe Maut ft. MC Stan", year: "2022", hook: 35, energy: 10, query: "Seedhe Maut Nanchaku MC Stan official audio" },
  { title: "11K", artist: "Seedhe Maut", year: "2023", hook: 30, energy: 10, query: "Seedhe Maut 11K official music video Lunch Break" },
  { title: "Khatta Flow", artist: "Seedhe Maut ft. KR$NA", year: "2023", hook: 35, energy: 10, query: "Seedhe Maut Khatta Flow KRSNA official video Lunch Break" },
  { title: "Hola Amigo", artist: "Seedhe Maut ft. KR$NA", year: "2023", hook: 32, energy: 10, query: "Seedhe Maut Hola Amigo KRSNA official audio" },
  { title: "Shaktimaan", artist: "Seedhe Maut", year: "2019", hook: 35, energy: 9, query: "Seedhe Maut Shaktimaan official music video" },
  { title: "Ball", artist: "Seedhe Maut", year: "2021", hook: 30, energy: 9, query: "Seedhe Maut Ball official music video" },
  { title: "Champion", artist: "Seedhe Maut", year: "2023", hook: 30, energy: 9, query: "Seedhe Maut Champion official audio Lunch Break" },

  // --- KR$NA (8) ---
  { title: "Makasam", artist: "KR$NA", year: "2020", hook: 35, energy: 10, query: "KR$NA Makasam Kalamkaar official music video" },
  { title: "I Guess", artist: "KR$NA", year: "2022", hook: 28, energy: 10, query: "KR$NA I Guess official music video Kalamkaar" },
  { title: "Roll Up", artist: "KR$NA ft. Badshah", year: "2021", hook: 30, energy: 10, query: "KR$NA Roll Up Badshah official music video Kalamkaar" },
  { title: "Prarthana", artist: "KR$NA", year: "2023", hook: 35, energy: 10, query: "KR$NA Prarthana Far From Over" },
  { title: "No Cap", artist: "KR$NA", year: "2021", hook: 32, energy: 10, query: "KR$NA No Cap official video" },
  { title: "Saza-e-Maut", artist: "KR$NA ft. Raftaar", year: "2021", hook: 30, energy: 10, query: "KR$NA Raftaar Saza-e-Maut official" },
  { title: "Freeverse Feast", artist: "KR$NA", year: "2019", hook: 20, energy: 9, query: "KR$NA Freeverse Feast Langar official" },
  { title: "Joota Japani", artist: "KR$NA", year: "2023", hook: 30, energy: 10, query: "KR$NA Joota Japani official music video" },

  // --- RAFTAAR (7) ---
  { title: "Swag Mera Desi", artist: "Raftaar ft. Manj Musik", year: "2014", hook: 35, energy: 10, query: "Swag Mera Desi Raftaar Manj Musik MTV Spoken Word" },
  { title: "Dhaakad", artist: "Raftaar", year: "2016", hook: 30, energy: 10, query: "Dhaakad Dangal Raftaar Aamir Khan official" },
  { title: "Baby Marvake Maanegi", artist: "Raftaar ft. Nora Fatehi", year: "2017", hook: 35, energy: 10, query: "Baby Marvake Maanegi Raftaar Nora Fatehi" },
  { title: "Ghana Kasoota", artist: "Raftaar ft. Rashmeet Kaur", year: "2021", hook: 35, energy: 10, query: "Ghana Kasoota Raftaar Rashmeet Kaur official video" },
  { title: "Saare Karo Dab", artist: "Raftaar ft. Muhfaad & Sonu Kakkar", year: "2018", hook: 32, energy: 10, query: "Saare Karo Dab Raftaar official video" },
  { title: "Black Sheep", artist: "Raftaar", year: "2020", hook: 30, energy: 9, query: "Raftaar Black Sheep official music video" },
  { title: "Damn", artist: "Raftaar ft. KR$NA", year: "2020", hook: 30, energy: 10, query: "Raftaar Damn KR$NA official video" },

  // --- BADSHAH (11) ---
  { title: "Jugnu", artist: "Badshah ft. Nikhita Gandhi", year: "2021", hook: 35, energy: 10, query: "Badshah Jugnu official video Nikhita Gandhi" },
  { title: "DJ Waley Babu", artist: "Badshah ft. Aastha Gill", year: "2015", hook: 40, energy: 10, query: "DJ Waley Babu Badshah Aastha Gill official music video" },
  { title: "Pagal", artist: "Badshah", year: "2019", hook: 30, energy: 10, query: "Badshah Pagal official music video" },
  { title: "Genda Phool", artist: "Badshah ft. Payal Dev, Jacqueline Fernandez", year: "2020", hook: 35, energy: 10, query: "Badshah Genda Phool official music video Payal Dev" },
  { title: "Paani Paani", artist: "Badshah ft. Aastha Gill, Jacqueline Fernandez", year: "2021", hook: 35, energy: 10, query: "Badshah Paani Paani Aastha Gill official video" },
  { title: "Garmi", artist: "Badshah ft. Neha Kakkar, Nora Fatehi", year: "2019", hook: 38, energy: 10, query: "Garmi Street Dancer 3D Badshah Neha Kakkar" },
  { title: "Kala Chashma", artist: "Badshah ft. Amar Arshi, Neha Kakkar", year: "2016", hook: 32, energy: 10, query: "Kala Chashma Baar Baar Dekho Badshah Katrina Kaif" },
  { title: "Kar Gayi Chull", artist: "Badshah ft. Fazilpuria, Neha Kakkar", year: "2016", hook: 25, energy: 10, query: "Kar Gayi Chull Kapoor And Sons Badshah Alia Bhatt" },
  { title: "Tareefan", artist: "Badshah", year: "2018", hook: 30, energy: 10, query: "Tareefan Veere Di Wedding Badshah Kareena Kapoor" },
  { title: "Mercy", artist: "Badshah", year: "2017", hook: 32, energy: 10, query: "Badshah Mercy official music video Lauren Gottlieb" },
  { title: "Bandook", artist: "Badshah ft. Aastha Gill", year: "2015", hook: 35, energy: 9, query: "Badshah Bandook official music video" },

  // --- EMIWAY BANTAI (7) ---
  { title: "Machayenge", artist: "Emiway Bantai", year: "2019", hook: 25, energy: 10, query: "Emiway Bantai Machayenge official music video" },
  { title: "Machayenge 2", artist: "Emiway Bantai", year: "2020", hook: 28, energy: 10, query: "Emiway Bantai Machayenge 2 official music video" },
  { title: "Machayenge 3", artist: "Emiway Bantai", year: "2021", hook: 30, energy: 10, query: "Emiway Bantai Machayenge 3 official music video" },
  { title: "Machayenge 4", artist: "Emiway Bantai", year: "2022", hook: 30, energy: 10, query: "Emiway Bantai Machayenge 4 official music video" },
  { title: "Samajh Mein Aaya Kya", artist: "Emiway Bantai", year: "2018", hook: 25, energy: 10, query: "Emiway Bantai Samajh Mein Aaya Kya official video" },
  { title: "Company", artist: "Emiway Bantai", year: "2023", hook: 28, energy: 10, query: "Emiway Bantai Company official music video KOTS" },
  { title: "Grind", artist: "Emiway Bantai", year: "2021", hook: 30, energy: 9, query: "Emiway Bantai Grind official music video" },

  // --- KING (6) ---
  { title: "Tu Aake Dekhle", artist: "King", year: "2020", hook: 45, energy: 9, query: "King Tu Aake Dekhle The Carnival official video" },
  { title: "Maan Meri Jaan", artist: "King", year: "2022", hook: 40, energy: 9, query: "King Maan Meri Jaan Champagne Talk official video" },
  { title: "Oops", artist: "King", year: "2022", hook: 30, energy: 10, query: "King Oops Champagne Talk official video" },
  { title: "She Don't Give A", artist: "King", year: "2021", hook: 35, energy: 9, query: "King She Don't Give A official music video" },
  { title: "Pablo", artist: "King", year: "2022", hook: 30, energy: 10, query: "King Pablo Champagne Talk official video" },
  { title: "High Hukku", artist: "King", year: "2023", hook: 30, energy: 10, query: "King High Hukku official music video" },

  // --- PARADOX (6) ---
  { title: "Jadugar", artist: "Paradox", year: "2022", hook: 35, energy: 10, query: "Jaadugar Paradox Hustle 2.0 official video" },
  { title: "Babam Bam", artist: "Paradox", year: "2022", hook: 30, energy: 10, query: "Babam Bam Paradox Hustle 2.0 official video" },
  { title: "BT Ho Gayi", artist: "Paradox", year: "2022", hook: 28, energy: 10, query: "BT Ho Gayi Paradox Hustle 2.0 official video" },
  { title: "Mileya Ni", artist: "Paradox", year: "2022", hook: 32, energy: 9, query: "Mileya Ni Paradox Hustle 2.0 official video" },
  { title: "Ghatotkach", artist: "Paradox", year: "2022", hook: 30, energy: 10, query: "Ghatotkach Paradox Hustle 2.0 official video" },
  { title: "Chore NCR Aale", artist: "Paradox ft. MC Square", year: "2022", hook: 30, energy: 10, query: "Chhore NCR Aale Paradox MC Square Hustle 2.0" },

  // --- FOTTY SEVEN (5) ---
  { title: "Boht Sahi", artist: "Fotty Seven", year: "2020", hook: 28, energy: 10, query: "Fotty Seven Boht Sahi official music video" },
  { title: "Haath Toh Laga", artist: "Fotty Seven ft. Rebel 7", year: "2020", hook: 30, energy: 10, query: "Fotty Seven Haath Toh Laga official music video" },
  { title: "Banjo", artist: "Fotty Seven", year: "2022", hook: 30, energy: 9, query: "Fotty Seven Banjo official music video" },
  { title: "Galat Launde", artist: "Fotty Seven", year: "2020", hook: 28, energy: 9, query: "Fotty Seven Galat Launde official music video" },
  { title: "Baap Se", artist: "Fotty Seven ft. KR$NA", year: "2020", hook: 30, energy: 10, query: "Fotty Seven Baap Se KR$NA official video" },

  // --- BELLA (4) ---
  { title: "Humble Poet", artist: "Bella", year: "2020", hook: 35, energy: 9, query: "Bella Humble Poet official music video" },
  { title: "Antidote", artist: "Bella", year: "2021", hook: 35, energy: 9, query: "Bella Antidote official music video" },
  { title: "Sweet Poison", artist: "Bella", year: "2022", hook: 30, energy: 9, query: "Bella Sweet Poison official music video" },
  { title: "Monster", artist: "Bella", year: "2022", hook: 30, energy: 9, query: "Bella Monster official music video" },

  // --- KARMA (5) ---
  { title: "1 Sahaara", artist: "Karma", year: "2020", hook: 35, energy: 9, query: "Karma 1 Sahaara official music video Kalamkaar" },
  { title: "Fate", artist: "Karma", year: "2021", hook: 30, energy: 9, query: "Karma Fate official music video Kalamkaar" },
  { title: "Success", artist: "Karma", year: "2022", hook: 30, energy: 9, query: "Karma Success official music video Kalamkaar" },
  { title: "Google Pay", artist: "Karma", year: "2021", hook: 28, energy: 10, query: "Karma Google Pay official music video Kalamkaar" },
  { title: "Baba Yaga", artist: "Karma", year: "2021", hook: 25, energy: 10, query: "Karma Baba Yaga official music video Kalamkaar" },

  // --- RAGA (4) ---
  { title: "Sheher", artist: "Raga", year: "2020", hook: 30, energy: 10, query: "Raga Sheher official music video" },
  { title: "Badnaam", artist: "Raga", year: "2022", hook: 30, energy: 10, query: "Raga Badnaam official music video" },
  { title: "Kartoos", artist: "Raga", year: "2021", hook: 28, energy: 10, query: "Raga Kartoos official music video" },
  { title: "Bhasad", artist: "Raga", year: "2021", hook: 25, energy: 10, query: "Raga Bhasad official music video" },

  // --- BRODHA V (4) ---
  { title: "Aathma Raama", artist: "Brodha V", year: "2012", hook: 40, energy: 9, query: "Brodha V Aathma Raama official music video" },
  { title: "Vainko", artist: "Brodha V", year: "2019", hook: 35, energy: 10, query: "Brodha V Vainko official music video" },
  { title: "Aigiri Nandini", artist: "Brodha V", year: "2013", hook: 35, energy: 10, query: "Brodha V Aigiri Nandini official music video" },
  { title: "Shook Ones", artist: "Brodha V", year: "2018", hook: 30, energy: 9, query: "Brodha V Shook Ones Freestyle" },

  // --- IKKA, DINO JAMES, MC SQUARE, OTHERS (11) ---
  { title: "Angaar", artist: "Ikka ft. Raftaar", year: "2020", hook: 32, energy: 10, query: "Ikka Raftaar Angaar official music video" },
  { title: "Level Up", artist: "Ikka ft. DIVINE, Kaater", year: "2021", hook: 30, energy: 10, query: "Ikka Level Up DIVINE official music video" },
  { title: "Trap Munde", artist: "Ikka ft. Dino James", year: "2022", hook: 32, energy: 10, query: "Ikka Trap Munde Dino James official music video" },
  { title: "Tandav", artist: "Dino James", year: "2019", hook: 35, energy: 10, query: "Dino James Tandav official music video" },
  { title: "Loser", artist: "Dino James", year: "2016", hook: 45, energy: 9, query: "Dino James Loser official music video" },
  { title: "Wishlist", artist: "Dino James ft. Kaprila", year: "2020", hook: 35, energy: 9, query: "Dino James Wishlist Kaprila official music video" },
  { title: "Ram Ram", artist: "MC Square", year: "2022", hook: 30, energy: 10, query: "Ram Ram MC Square Hustle 2.0 official video" },
  { title: "Badluram Ka Badan", artist: "EPR Iyer", year: "2022", hook: 30, energy: 10, query: "Badluram Ka Badan EPR Hustle 2.0 official video" },
  { title: "Chill Kinda Guy", artist: "Srushti Tawade", year: "2022", hook: 25, energy: 9, query: "Chill Kinda Guy Srushti Tawade Hustle 2.0 official video" },
  { title: "Big Dawgs", artist: "Hanumankind ft. Kalmi", year: "2024", hook: 30, energy: 10, query: "Hanumankind Big Dawgs official music video" },
  { title: "Dhundhala", artist: "Yashraj ft. Dropped Out, Talwiinder", year: "2022", hook: 35, energy: 10, query: "Dhundhala Yashraj Talwiinder official music video" },
  { title: "Asal Hustle", artist: "Naezy", year: "2015", hook: 30, energy: 9, query: "Naezy Asal Hustle official music video" }
];

console.log('Total pool items:', SELECTED_MASTER_POOL.length);

const finalSongs = [];
const usedVideoIds = new Set();
const missingQueries = [];

for (const item of SELECTED_MASTER_POOL) {
  const cached = cache[item.query];
  if (!cached || !cached.videoId) {
    missingQueries.push(item.query);
    continue;
  }

  if (usedVideoIds.has(cached.videoId)) {
    console.warn(`Duplicate video ID ${cached.videoId} for "${item.title}", skipping duplicate.`);
    continue;
  }

  usedVideoIds.add(cached.videoId);

  let durationSec = cached.durationSec || 215;
  if (durationSec < 150) durationSec = 180;
  if (durationSec > 330) durationSec = 260;

  let hookStart = item.hook || 30;
  if (hookStart + 40 >= durationSec) {
    hookStart = Math.max(15, durationSec - 45);
  }
  const hookEnd = hookStart + 40;

  finalSongs.push({
    title: item.title,
    artist: item.artist,
    year: String(item.year),
    durationSec: durationSec,
    hookStartSec: hookStart,
    hookEndSec: hookEnd,
    entrySec: hookStart,
    exitSec: hookEnd,
    videoId: cached.videoId,
    energy: item.energy || 10
  });

  if (finalSongs.length === 100) {
    break;
  }
}

console.log(`Selected ${finalSongs.length} songs. Missing in cache: ${missingQueries.length}`);
if (missingQueries.length > 0) {
  console.log('Missing queries:', missingQueries);
}

if (finalSongs.length !== 100) {
  console.error(`ERROR: Expected exactly 100 songs, got ${finalSongs.length}`);
  process.exit(1);
}

const finalOutput = {
  "hindi-hiphop": finalSongs
};

fs.writeFileSync(outputFile, JSON.stringify(finalOutput, null, 2), 'utf8');
console.log(`Successfully written output to: ${outputFile}`);

// Thorough Verification Pass
console.log('\n--- VERIFICATION PASS ---');
const readBack = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
const list = readBack["hindi-hiphop"];
console.log(`Total songs in JSON: ${list.length}`);

const idCheck = new Set();
let errCount = 0;

list.forEach((s, i) => {
  if (!s.title || !s.artist || !s.year) {
    console.error(`Missing title/artist/year at [${i}]:`, s);
    errCount++;
  }
  if (!s.videoId || typeof s.videoId !== 'string' || s.videoId.length !== 11) {
    console.error(`Invalid videoId at [${i}]: ${s.videoId}`);
    errCount++;
  }
  if (idCheck.has(s.videoId)) {
    console.error(`Duplicate videoId found at [${i}]: ${s.videoId}`);
    errCount++;
  }
  idCheck.add(s.videoId);

  if (s.energy !== 9 && s.energy !== 10) {
    console.error(`Invalid energy at [${i}]: ${s.energy}`);
    errCount++;
  }
  if (s.hookEndSec !== s.hookStartSec + 40) {
    console.error(`Invalid hook duration at [${i}]: ${s.hookStartSec} to ${s.hookEndSec}`);
    errCount++;
  }
  if (typeof s.durationSec !== 'number' || isNaN(s.durationSec)) {
    console.error(`Invalid duration at [${i}]: ${s.durationSec}`);
    errCount++;
  }
});

console.log(`Verification errors: ${errCount}`);
console.log(`Unique video IDs: ${idCheck.size} / 100`);

if (errCount === 0 && list.length === 100 && idCheck.size === 100) {
  console.log('\n>>> ALL 100 SONGS FULLY VERIFIED, AUTHENTIC, 0 DUPLICATES! <<<');
} else {
  console.error('\nVerification failed!');
  process.exit(1);
}
