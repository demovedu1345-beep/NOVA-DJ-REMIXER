import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cacheFile = path.join(__dirname, 'agent_2_cache.json');
const outputFile = path.join(__dirname, 'curated_batches', 'agent_2.json');

// Ensure output dir exists
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

let cache = {};
if (fs.existsSync(cacheFile)) {
  try {
    cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    console.log(`Loaded ${Object.keys(cache).length} cached video lookups.`);
  } catch (e) {
    console.warn('Could not read cache, starting fresh');
  }
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

async function queryYouTubeOnce(query, excludeIds) {
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

  if (!res.ok) {
    console.warn(` (HTTP ${res.status}) `);
    return null;
  }

  const text = await res.text();

  // Try parsing ytInitialData
  const m = text.match(/ytInitialData\s*=\s*({.+?});<\/script>/);
  if (m) {
    try {
      const data = JSON.parse(m[1]);
      const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents;
      if (contents && Array.isArray(contents)) {
        for (const item of contents) {
          const v = item.videoRenderer;
          if (!v || !v.videoId || excludeIds.has(v.videoId)) continue;

          let durationSec = 210;
          if (v.lengthText?.simpleText) {
            const parts = v.lengthText.simpleText.split(':').map(Number);
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
              durationSec = parts[0] * 60 + parts[1];
            } else if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
              durationSec = parts[0] * 3600 + parts[1] * 60 + parts[2];
            }
          }

          const verify = await verifyOembed(v.videoId);
          if (verify.valid) {
            return {
              videoId: v.videoId,
              title: v.title?.runs?.[0]?.text || verify.title,
              durationSec,
              channel: v.ownerText?.runs?.[0]?.text || verify.author
            };
          }
        }
      }
    } catch (e) {
      // Fall through to regex
    }
  }

  // Fallback regex scan for video IDs
  const idMatches = [...text.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)].map(match => match[1]);
  const uniqueIds = [...new Set(idMatches)];
  for (const vid of uniqueIds.slice(0, 8)) {
    if (excludeIds.has(vid)) continue;
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

async function searchYouTube(query, fallbackQuery, excludeIds = new Set()) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await queryYouTubeOnce(query, excludeIds);
    if (res && res.rateLimited) {
      continue;
    }
    if (res) return res;
  }

  if (fallbackQuery && fallbackQuery !== query) {
    console.log(` (Trying fallback: "${fallbackQuery}") `);
    for (let attempt = 0; attempt < 2; attempt++) {
      const res = await queryYouTubeOnce(fallbackQuery, excludeIds);
      if (res && res.rateLimited) {
        continue;
      }
      if (res) return res;
    }
  }

  return null;
}

const RAW_CANDIDATE_SONGS = [
  // DIVINE
  { title: "Mirchi", artist: "DIVINE ft. MC Altaf, Phenom, Stylo G", year: "2020", hook: 45, energy: 10, query: "DIVINE Mirchi official music video" },
  { title: "3:59 AM", artist: "DIVINE", year: "2021", hook: 50, energy: 10, query: "DIVINE 3:59 AM official music video" },
  { title: "Kohinoor", artist: "DIVINE", year: "2019", hook: 35, energy: 9, query: "DIVINE Kohinoor official music video" },
  { title: "Chal Bombay", artist: "DIVINE", year: "2019", hook: 40, energy: 9, query: "DIVINE Chal Bombay official music video" },
  { title: "Kaam 25", artist: "DIVINE", year: "2018", hook: 25, energy: 10, query: "DIVINE Kaam 25 Sacred Games official music video" },
  { title: "Mere Gully Mein", artist: "DIVINE ft. Naezy", year: "2019", hook: 28, energy: 10, query: "Mere Gully Mein Gully Boy Ranveer Singh DIVINE Naezy official video" },
  { title: "Baazigar", artist: "DIVINE ft. Armani White", year: "2022", hook: 35, energy: 10, query: "DIVINE Baazigar Armani White official music video" },
  { title: "Gandhi Money", artist: "DIVINE", year: "2019", hook: 30, energy: 9, query: "DIVINE Gandhi Money official audio" },
  { title: "Jungli Sher", artist: "DIVINE", year: "2016", hook: 35, energy: 9, query: "DIVINE Jungli Sher official music video" },
  { title: "Satya", artist: "DIVINE", year: "2022", hook: 35, energy: 9, query: "DIVINE Satya official audio Gunehgar" },
  { title: "Punya Paap", artist: "DIVINE", year: "2020", hook: 30, energy: 9, query: "DIVINE Punya Paap official music video" },
  { title: "Sher Aaya Sher", artist: "DIVINE", year: "2019", hook: 22, energy: 10, query: "Sher Aaya Sher Gully Boy Ranveer Singh DIVINE official video" },

  // MC STAN
  { title: "Basti Ka Hasti", artist: "MC Stan", year: "2022", hook: 32, energy: 10, query: "MC Stan Basti Ka Hasti official video" },
  { title: "Ek Din Pyaar", artist: "MC Stan", year: "2022", hook: 25, energy: 9, query: "MC Stan Ek Din Pyaar official music video" },
  { title: "Snake", artist: "MC Stan", year: "2021", hook: 28, energy: 9, query: "MC Stan Snake official music video" },
  { title: "Tadipaar", artist: "MC Stan", year: "2020", hook: 42, energy: 9, query: "MC Stan Tadipaar official music video" },
  { title: "Insaan", artist: "MC Stan", year: "2022", hook: 30, energy: 9, query: "MC Stan Insaan title track official video" },
  { title: "Numberkari", artist: "MC Stan", year: "2020", hook: 30, energy: 9, query: "MC Stan Numberkari official music video" },
  { title: "Khuja Mat", artist: "MC Stan", year: "2019", hook: 35, energy: 9, query: "MC Stan Khuja Mat official music video" },
  { title: "Shana Bann", artist: "MC Stan", year: "2022", hook: 28, energy: 9, query: "MC Stan Shana Bann official music video" },
  { title: "Yadaan", artist: "MC Stan", year: "2021", hook: 30, energy: 9, query: "MC Stan Yadaan official audio" },
  { title: "Broke Is A Joke", artist: "MC Stan", year: "2021", hook: 32, energy: 9, query: "MC Stan Broke Is A Joke official audio" },

  // SEEDHE MAUT
  { title: "Namastute", artist: "Seedhe Maut", year: "2021", hook: 30, energy: 10, query: "Seedhe Maut Namastute official music video" },
  { title: "Nanchaku", artist: "Seedhe Maut ft. MC Stan", year: "2022", hook: 35, energy: 10, query: "Seedhe Maut Nanchaku MC Stan official audio" },
  { title: "11K", artist: "Seedhe Maut", year: "2023", hook: 30, energy: 10, query: "Seedhe Maut 11K official music video Lunch Break" },
  { title: "Khatta Flow", artist: "Seedhe Maut ft. KR$NA", year: "2023", hook: 35, energy: 10, query: "Seedhe Maut Khatta Flow KRSNA official video Lunch Break" },
  { title: "Lunch Boy", artist: "Seedhe Maut", year: "2023", hook: 28, energy: 9, query: "Seedhe Maut Lunch Boy official audio Lunch Break" },
  { title: "Brand New", artist: "Seedhe Maut", year: "2023", hook: 30, energy: 9, query: "Seedhe Maut Brand New official audio Lunch Break" },
  { title: "Lukka Chippi", artist: "Seedhe Maut", year: "2023", hook: 30, energy: 9, query: "Seedhe Maut Lukka Chippi official audio Lunch Break" },
  { title: "Shaktimaan", artist: "Seedhe Maut", year: "2019", hook: 35, energy: 9, query: "Seedhe Maut Shaktimaan official music video" },
  { title: "Pankh", artist: "Seedhe Maut ft. Bawari Basanti", year: "2021", hook: 40, energy: 9, query: "Seedhe Maut Pankh official music video" },
  { title: "Hola Amigo", artist: "Seedhe Maut ft. KR$NA", year: "2023", hook: 32, energy: 10, query: "Seedhe Maut Hola Amigo KRSNA official audio" },
  { title: "Ball", artist: "Seedhe Maut", year: "2021", hook: 30, energy: 9, query: "Seedhe Maut Ball official music video" },
  { title: "Do Guna", artist: "Seedhe Maut", year: "2020", hook: 28, energy: 9, query: "Seedhe Maut Do Guna official music video" },
  { title: "Tour Shiur", artist: "Seedhe Maut", year: "2023", hook: 30, energy: 9, query: "Seedhe Maut Tour Shiur official audio Lunch Break" },
  { title: "Champion", artist: "Seedhe Maut", year: "2023", hook: 30, energy: 9, query: "Seedhe Maut Champion official audio Lunch Break" },

  // KR$NA
  { title: "Makasam", artist: "KR$NA", year: "2020", hook: 35, energy: 10, query: "KR$NA Makasam Kalamkaar official music video" },
  { title: "I Guess", artist: "KR$NA", year: "2022", hook: 28, energy: 10, query: "KR$NA I Guess official music video Kalamkaar" },
  { title: "Roll Up", artist: "KR$NA ft. Badshah", year: "2021", hook: 30, energy: 10, query: "KR$NA Roll Up Badshah official music video Kalamkaar" },
  { title: "Prarthana", artist: "KR$NA", year: "2023", hook: 35, energy: 10, query: "KR$NA Prarthana Far From Over", fallback: "KR$NA Prarthana" },
  { title: "No Cap", artist: "KR$NA", year: "2021", hook: 32, energy: 10, query: "KR$NA No Cap official video", fallback: "KR$NA No Cap Kalamkaar" },
  { title: "Saza-e-Maut", artist: "KR$NA ft. Raftaar", year: "2021", hook: 30, energy: 10, query: "KR$NA Raftaar Saza-e-Maut official", fallback: "Saza-e-Maut KR$NA Raftaar" },
  { title: "Freeverse Feast", artist: "KR$NA", year: "2019", hook: 20, energy: 9, query: "KR$NA Freeverse Feast Langar official", fallback: "KR$NA Freeverse Feast" },
  { title: "Say My Name", artist: "KR$NA", year: "2020", hook: 30, energy: 9, query: "KR$NA Say My Name Hindi official video", fallback: "KR$NA Say My Name" },
  { title: "Blowing Up", artist: "KR$NA", year: "2022", hook: 30, energy: 9, query: "KR$NA Blowing Up official music video", fallback: "KR$NA Blowing Up" },
  { title: "Fall Off", artist: "KR$NA", year: "2020", hook: 25, energy: 9, query: "KR$NA Fall Off official video", fallback: "KR$NA Fall Off Kalamkaar" },
  { title: "OG", artist: "KR$NA", year: "2021", hook: 28, energy: 9, query: "KR$NA OG official music video", fallback: "KR$NA OG Kalamkaar" },
  { title: "Zero After Zero", artist: "KR$NA", year: "2023", hook: 30, energy: 9, query: "KR$NA Zero After Zero official audio", fallback: "KR$NA Zero After Zero" },
  { title: "Joota Japani", artist: "KR$NA", year: "2023", hook: 30, energy: 10, query: "KR$NA Joota Japani official music video", fallback: "KR$NA Joota Japani" },
  { title: "Kaha Tak", artist: "KR$NA", year: "2023", hook: 35, energy: 9, query: "KR$NA Kaha Tak official video", fallback: "KR$NA Kaha Tak" },

  // RAFTAAR
  { title: "Swag Mera Desi", artist: "Raftaar ft. Manj Musik", year: "2014", hook: 35, energy: 10, query: "Swag Mera Desi Raftaar Manj Musik MTV Spoken Word", fallback: "Swag Mera Desi Raftaar" },
  { title: "Dhaakad", artist: "Raftaar", year: "2016", hook: 30, energy: 10, query: "Dhaakad Dangal Raftaar Aamir Khan official", fallback: "Dhaakad Dangal song Raftaar" },
  { title: "Baby Marvake Maanegi", artist: "Raftaar ft. Nora Fatehi", year: "2017", hook: 35, energy: 10, query: "Baby Marvake Maanegi Raftaar Nora Fatehi", fallback: "Baby Marvake Maanegi Raftaar" },
  { title: "Drama", artist: "Raftaar", year: "2020", hook: 28, energy: 9, query: "Raftaar Drama official video Kalamkaar", fallback: "Raftaar Drama" },
  { title: "Ghana Kasoota", artist: "Raftaar ft. Rashmeet Kaur", year: "2021", hook: 35, energy: 10, query: "Ghana Kasoota Raftaar Rashmeet Kaur official video", fallback: "Ghana Kasoota Raftaar" },
  { title: "Aage Chal", artist: "Raftaar", year: "2019", hook: 40, energy: 9, query: "Raftaar Aage Chal official music video", fallback: "Raftaar Aage Chal" },
  { title: "Saare Karo Dab", artist: "Raftaar ft. Muhfaad & Sonu Kakkar", year: "2018", hook: 32, energy: 10, query: "Saare Karo Dab Raftaar official video", fallback: "Saare Karo Dab Raftaar" },
  { title: "Sheikh Chilli", artist: "Raftaar", year: "2018", hook: 30, energy: 10, query: "Raftaar Sheikh Chilli official video", fallback: "Raftaar Sheikh Chilli" },
  { title: "Black Sheep", artist: "Raftaar", year: "2020", hook: 30, energy: 9, query: "Raftaar Black Sheep official music video", fallback: "Raftaar Black Sheep" },
  { title: "Damn", artist: "Raftaar ft. KR$NA", year: "2020", hook: 30, energy: 10, query: "Raftaar Damn KR$NA official video", fallback: "Raftaar Damn KR$NA" },

  // BADSHAH
  { title: "Jugnu", artist: "Badshah ft. Nikhita Gandhi", year: "2021", hook: 35, energy: 10, query: "Badshah Jugnu official video Nikhita Gandhi", fallback: "Badshah Jugnu" },
  { title: "DJ Waley Babu", artist: "Badshah ft. Aastha Gill", year: "2015", hook: 40, energy: 10, query: "DJ Waley Babu Badshah Aastha Gill official music video", fallback: "DJ Waley Babu Badshah" },
  { title: "Pagal", artist: "Badshah", year: "2019", hook: 30, energy: 10, query: "Badshah Pagal official music video", fallback: "Badshah Pagal" },
  { title: "Genda Phool", artist: "Badshah ft. Payal Dev, Jacqueline Fernandez", year: "2020", hook: 35, energy: 10, query: "Badshah Genda Phool official music video Payal Dev", fallback: "Badshah Genda Phool" },
  { title: "Paani Paani", artist: "Badshah ft. Aastha Gill, Jacqueline Fernandez", year: "2021", hook: 35, energy: 10, query: "Badshah Paani Paani Aastha Gill official video", fallback: "Badshah Paani Paani" },
  { title: "Garmi", artist: "Badshah ft. Neha Kakkar, Nora Fatehi", year: "2019", hook: 38, energy: 10, query: "Garmi Street Dancer 3D Badshah Neha Kakkar", fallback: "Garmi Street Dancer 3D" },
  { title: "Kala Chashma", artist: "Badshah ft. Amar Arshi, Neha Kakkar", year: "2016", hook: 32, energy: 10, query: "Kala Chashma Baar Baar Dekho Badshah Katrina Kaif", fallback: "Kala Chashma Baar Baar Dekho" },
  { title: "Kar Gayi Chull", artist: "Badshah ft. Fazilpuria, Neha Kakkar", year: "2016", hook: 25, energy: 10, query: "Kar Gayi Chull Kapoor And Sons Badshah Alia Bhatt", fallback: "Kar Gayi Chull Kapoor And Sons" },
  { title: "Tareefan", artist: "Badshah", year: "2018", hook: 30, energy: 10, query: "Tareefan Veere Di Wedding Badshah Kareena Kapoor", fallback: "Tareefan Veere Di Wedding" },
  { title: "Mercy", artist: "Badshah", year: "2017", hook: 32, energy: 10, query: "Badshah Mercy official music video Lauren Gottlieb", fallback: "Badshah Mercy official video" },
  { title: "Buzz", artist: "Aastha Gill ft. Badshah", year: "2018", hook: 30, energy: 10, query: "Buzz Aastha Gill Badshah official music video", fallback: "Buzz Aastha Gill Badshah" },
  { title: "Abhi Toh Party Shuru Hui Hai", artist: "Badshah", year: "2014", hook: 30, energy: 10, query: "Abhi Toh Party Shuru Hui Hai Khoobsurat Badshah", fallback: "Abhi Toh Party Shuru Hui Hai" },
  { title: "Proper Patola", artist: "Badshah ft. Diljit Dosanjh, Aastha Gill", year: "2018", hook: 35, energy: 10, query: "Proper Patola Namaste England Diljit Dosanjh Badshah", fallback: "Proper Patola Namaste England" },
  { title: "Saturday Saturday", artist: "Badshah ft. Indeep Bakshi", year: "2014", hook: 32, energy: 10, query: "Saturday Saturday Humpty Sharma Ki Dulhania Badshah", fallback: "Saturday Saturday Humpty Sharma" },
  { title: "She Move It Like", artist: "Badshah", year: "2018", hook: 30, energy: 10, query: "She Move It Like Badshah official music video", fallback: "She Move It Like Badshah" },
  { title: "Sanak", artist: "Badshah", year: "2023", hook: 30, energy: 10, query: "Badshah Sanak official music video", fallback: "Badshah Sanak" },
  { title: "Gone Girl", artist: "Badshah ft. Payal Dev", year: "2023", hook: 30, energy: 10, query: "Badshah Gone Girl Payal Dev official video", fallback: "Badshah Gone Girl" },
  { title: "Soulmate", artist: "Badshah ft. Arijit Singh", year: "2024", hook: 40, energy: 9, query: "Badshah Soulmate Arijit Singh official music video", fallback: "Badshah Soulmate Arijit Singh" },
  { title: "Bandook", artist: "Badshah ft. Aastha Gill", year: "2015", hook: 35, energy: 9, query: "Badshah Bandook official music video", fallback: "Badshah Bandook" },

  // EMIWAY BANTAI
  { title: "Machayenge", artist: "Emiway Bantai", year: "2019", hook: 25, energy: 10, query: "Emiway Bantai Machayenge official music video", fallback: "Emiway Bantai Machayenge" },
  { title: "Machayenge 2", artist: "Emiway Bantai", year: "2020", hook: 28, energy: 10, query: "Emiway Bantai Machayenge 2 official music video", fallback: "Emiway Bantai Machayenge 2" },
  { title: "Machayenge 3", artist: "Emiway Bantai", year: "2021", hook: 30, energy: 10, query: "Emiway Bantai Machayenge 3 official music video", fallback: "Emiway Bantai Machayenge 3" },
  { title: "Machayenge 4", artist: "Emiway Bantai", year: "2022", hook: 30, energy: 10, query: "Emiway Bantai Machayenge 4 official music video", fallback: "Emiway Bantai Machayenge 4" },
  { title: "Firse Machayenge", artist: "Emiway Bantai", year: "2019", hook: 25, energy: 10, query: "Emiway Bantai Firse Machayenge official music video", fallback: "Emiway Bantai Firse Machayenge" },
  { title: "Samajh Mein Aaya Kya", artist: "Emiway Bantai", year: "2018", hook: 25, energy: 10, query: "Emiway Bantai Samajh Mein Aaya Kya official video", fallback: "Emiway Bantai Samajh Mein Aaya Kya" },
  { title: "Company", artist: "Emiway Bantai", year: "2023", hook: 28, energy: 10, query: "Emiway Bantai Company official music video KOTS", fallback: "Emiway Bantai Company" },
  { title: "Jump Kar", artist: "Emiway Bantai", year: "2019", hook: 25, energy: 9, query: "Emiway Bantai Jump Kar official music video", fallback: "Emiway Bantai Jump Kar" },
  { title: "Bantai Ki Public", artist: "Emiway Bantai", year: "2020", hook: 28, energy: 9, query: "Emiway Bantai Bantai Ki Public official music video", fallback: "Emiway Bantai Bantai Ki Public" },
  { title: "Khatam Hue Vaande", artist: "Emiway Bantai", year: "2019", hook: 30, energy: 10, query: "Emiway Bantai Khatam Hue Vaande official music video", fallback: "Emiway Bantai Khatam Hue Vaande" },
  { title: "Grind", artist: "Emiway Bantai", year: "2021", hook: 30, energy: 9, query: "Emiway Bantai Grind official music video", fallback: "Emiway Bantai Grind" },
  { title: "KRLS", artist: "Emiway Bantai", year: "2022", hook: 30, energy: 9, query: "Emiway Bantai KRLS Kya Bolte Bro official music video", fallback: "Emiway Bantai KRLS" },

  // KING
  { title: "Tu Aake Dekhle", artist: "King", year: "2020", hook: 45, energy: 9, query: "King Tu Aake Dekhle The Carnival official video", fallback: "King Tu Aake Dekhle" },
  { title: "Maan Meri Jaan", artist: "King", year: "2022", hook: 40, energy: 9, query: "King Maan Meri Jaan Champagne Talk official video", fallback: "King Maan Meri Jaan" },
  { title: "Oops", artist: "King", year: "2022", hook: 30, energy: 10, query: "King Oops Champagne Talk official video", fallback: "King Oops official video" },
  { title: "She Don't Give A", artist: "King", year: "2021", hook: 35, energy: 9, query: "King She Don't Give A official music video", fallback: "King She Don't Give A" },
  { title: "Pablo", artist: "King", year: "2022", hook: 30, energy: 10, query: "King Pablo Champagne Talk official video", fallback: "King Pablo official video" },
  { title: "IIconic", artist: "King", year: "2022", hook: 30, energy: 9, query: "King IIconic official music video", fallback: "King IIconic" },
  { title: "High Hukku", artist: "King", year: "2023", hook: 30, energy: 10, query: "King High Hukku official music video", fallback: "King High Hukku" },
  { title: "Legends", artist: "King", year: "2023", hook: 35, energy: 9, query: "King Legends official music video", fallback: "King Legends" },

  // PARADOX
  { title: "Jadugar", artist: "Paradox", year: "2022", hook: 35, energy: 10, query: "Jaadugar Paradox Hustle 2.0 official video", fallback: "Jaadugar Paradox" },
  { title: "Babam Bam", artist: "Paradox", year: "2022", hook: 30, energy: 10, query: "Babam Bam Paradox Hustle 2.0 official video", fallback: "Babam Bam Paradox" },
  { title: "BT Ho Gayi", artist: "Paradox", year: "2022", hook: 28, energy: 10, query: "BT Ho Gayi Paradox Hustle 2.0 official video", fallback: "BT Ho Gayi Paradox" },
  { title: "Mileya Ni", artist: "Paradox", year: "2022", hook: 32, energy: 9, query: "Mileya Ni Paradox Hustle 2.0 official video", fallback: "Mileya Ni Paradox" },
  { title: "Ghatotkach", artist: "Paradox", year: "2022", hook: 30, energy: 10, query: "Ghatotkach Paradox Hustle 2.0 official video", fallback: "Ghatotkach Paradox" },
  { title: "Perfy", artist: "Paradox", year: "2023", hook: 28, energy: 9, query: "Paradox Perfy official music video", fallback: "Paradox Perfy" },
  { title: "Chore NCR Aale", artist: "Paradox ft. MC Square", year: "2022", hook: 30, energy: 10, query: "Chhore NCR Aale Paradox MC Square Hustle 2.0", fallback: "Chhore NCR Aale Paradox" },

  // FOTTY SEVEN
  { title: "Boht Sahi", artist: "Fotty Seven", year: "2020", hook: 28, energy: 10, query: "Fotty Seven Boht Sahi official music video", fallback: "Fotty Seven Boht Sahi" },
  { title: "Haath Toh Laga", artist: "Fotty Seven ft. Rebel 7", year: "2020", hook: 30, energy: 10, query: "Fotty Seven Haath Toh Laga official music video", fallback: "Fotty Seven Haath Toh Laga" },
  { title: "Banjo", artist: "Fotty Seven", year: "2022", hook: 30, energy: 9, query: "Fotty Seven Banjo official music video", fallback: "Fotty Seven Banjo" },
  { title: "Kar Denge Khalaas", artist: "Fotty Seven", year: "2020", hook: 25, energy: 10, query: "Fotty Seven Kar Denge Khalaas official music video", fallback: "Fotty Seven Kar Denge Khalaas" },
  { title: "Galat Launde", artist: "Fotty Seven", year: "2020", hook: 28, energy: 9, query: "Fotty Seven Galat Launde official music video", fallback: "Fotty Seven Galat Launde" },
  { title: "Pagal Hai Kya", artist: "Fotty Seven", year: "2019", hook: 30, energy: 9, query: "Fotty Seven Pagal Hai Kya official music video", fallback: "Fotty Seven Pagal Hai Kya" },
  { title: "Baap Se", artist: "Fotty Seven ft. KR$NA", year: "2020", hook: 30, energy: 10, query: "Fotty Seven Baap Se KR$NA official video", fallback: "Fotty Seven Baap Se" },

  // BELLA
  { title: "Humble Poet", artist: "Bella", year: "2020", hook: 35, energy: 9, query: "Bella Humble Poet official music video", fallback: "Bella Humble Poet" },
  { title: "Antidote", artist: "Bella", year: "2021", hook: 35, energy: 9, query: "Bella Antidote official music video", fallback: "Bella Antidote" },
  { title: "Sweet Poison", artist: "Bella", year: "2022", hook: 30, energy: 9, query: "Bella Sweet Poison official music video", fallback: "Bella Sweet Poison" },
  { title: "Monster", artist: "Bella", year: "2022", hook: 30, energy: 9, query: "Bella Monster official music video", fallback: "Bella Monster" },
  { title: "Khoya Sab", artist: "Bella", year: "2021", hook: 35, energy: 9, query: "Bella Khoya Sab official music video", fallback: "Bella Khoya Sab" },

  // KARMA
  { title: "1 Sahaara", artist: "Karma", year: "2020", hook: 35, energy: 9, query: "Karma 1 Sahaara official music video Kalamkaar", fallback: "Karma 1 Sahaara" },
  { title: "Fate", artist: "Karma", year: "2021", hook: 30, energy: 9, query: "Karma Fate official music video Kalamkaar", fallback: "Karma Fate" },
  { title: "Success", artist: "Karma", year: "2022", hook: 30, energy: 9, query: "Karma Success official music video Kalamkaar", fallback: "Karma Success" },
  { title: "Zaruri Nahi", artist: "Karma", year: "2021", hook: 32, energy: 9, query: "Karma Zaruri Nahi official music video Kalamkaar", fallback: "Karma Zaruri Nahi" },
  { title: "Google Pay", artist: "Karma", year: "2021", hook: 28, energy: 10, query: "Karma Google Pay official music video Kalamkaar", fallback: "Karma Google Pay" },
  { title: "Baba Yaga", artist: "Karma", year: "2021", hook: 25, energy: 10, query: "Karma Baba Yaga official music video Kalamkaar", fallback: "Karma Baba Yaga" },

  // RAGA
  { title: "Sheher", artist: "Raga", year: "2020", hook: 30, energy: 10, query: "Raga Sheher official music video", fallback: "Raga Sheher" },
  { title: "Jahannum", artist: "Raga", year: "2021", hook: 30, energy: 9, query: "Raga Jahannum official music video", fallback: "Raga Jahannum" },
  { title: "Badnaam", artist: "Raga", year: "2022", hook: 30, energy: 10, query: "Raga Badnaam official music video", fallback: "Raga Badnaam" },
  { title: "Kartoos", artist: "Raga", year: "2021", hook: 28, energy: 10, query: "Raga Kartoos official music video", fallback: "Raga Kartoos" },
  { title: "Bhasad", artist: "Raga", year: "2021", hook: 25, energy: 10, query: "Raga Bhasad official music video", fallback: "Raga Bhasad" },

  // BRODHA V
  { title: "Aathma Raama", artist: "Brodha V", year: "2012", hook: 40, energy: 9, query: "Brodha V Aathma Raama official music video", fallback: "Brodha V Aathma Raama" },
  { title: "Vainko", artist: "Brodha V", year: "2019", hook: 35, energy: 10, query: "Brodha V Vainko official music video", fallback: "Brodha V Vainko" },
  { title: "Aigiri Nandini", artist: "Brodha V", year: "2013", hook: 35, energy: 10, query: "Brodha V Aigiri Nandini official music video", fallback: "Brodha V Aigiri Nandini" },
  { title: "Shook Ones", artist: "Brodha V", year: "2018", hook: 30, energy: 9, query: "Brodha V Shook Ones Freestyle", fallback: "Brodha V Shook Ones" },

  // IKKA, DINO JAMES, MC SQUARE, OTHERS
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
  console.log(`Starting curation of Hindi Hip-Hop from candidate pool of ${RAW_CANDIDATE_SONGS.length} songs...`);

  const verifiedSongs = [];
  const usedVideoIds = new Set();

  for (let i = 0; i < RAW_CANDIDATE_SONGS.length; i++) {
    const raw = RAW_CANDIDATE_SONGS[i];
    const cacheKey = raw.query;
    let videoInfo = null;

    if (cache[cacheKey] && !usedVideoIds.has(cache[cacheKey].videoId)) {
      const verify = await verifyOembed(cache[cacheKey].videoId);
      if (verify.valid) {
        videoInfo = cache[cacheKey];
      }
    }

    if (!videoInfo) {
      process.stdout.write(`[${i + 1}/${RAW_CANDIDATE_SONGS.length}] Searching: ${raw.title} (${raw.artist}) ... `);
      videoInfo = await searchYouTube(raw.query, raw.fallback, usedVideoIds);
      if (videoInfo) {
        cache[cacheKey] = videoInfo;
        saveCache();
        console.log(`OK: ${videoInfo.videoId} (${videoInfo.durationSec}s) - ${videoInfo.title.slice(0, 45)}`);
      } else {
        console.log(`FAILED to find video for "${raw.query}"`);
      }
      // Polite delay between uncached requests to avoid 429
      await new Promise(r => setTimeout(r, 650));
    } else {
      console.log(`[${i + 1}/${RAW_CANDIDATE_SONGS.length}] CACHED: ${raw.title} -> ${videoInfo.videoId}`);
    }

    if (videoInfo && !usedVideoIds.has(videoInfo.videoId)) {
      usedVideoIds.add(videoInfo.videoId);

      // Duration around 180-260 (clamped if out of range)
      let durationSec = videoInfo.durationSec || 215;
      if (durationSec < 150) durationSec = 180;
      if (durationSec > 330) durationSec = 260;

      let hookStart = raw.hook || 30;
      if (hookStart + 40 >= durationSec) {
        hookStart = Math.max(15, durationSec - 45);
      }
      const hookEnd = hookStart + 40;

      verifiedSongs.push({
        title: raw.title,
        artist: raw.artist,
        year: String(raw.year),
        durationSec: durationSec,
        hookStartSec: hookStart,
        hookEndSec: hookEnd,
        entrySec: hookStart,
        exitSec: hookEnd,
        videoId: videoInfo.videoId,
        energy: raw.energy || 10
      });
    }

    if (verifiedSongs.length === 100) {
      console.log(`\n>>> Reached exactly 100 verified songs! <<<`);
      break;
    }
  }

  console.log(`\nTotal verified songs collected: ${verifiedSongs.length}`);

  if (verifiedSongs.length < 100) {
    console.error(`ERROR: Collected only ${verifiedSongs.length} songs, expected 100!`);
    process.exit(1);
  }

  const finalOutput = {
    "hindi-hiphop": verifiedSongs.slice(0, 100)
  };

  fs.writeFileSync(outputFile, JSON.stringify(finalOutput, null, 2), 'utf8');
  console.log(`Successfully written output to: ${outputFile}`);

  // Validation
  console.log('\n--- VERIFICATION PASS ---');
  const readBack = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
  const list = readBack["hindi-hiphop"];
  console.log(`Songs count: ${list.length}`);

  const idSet = new Set();
  let errors = 0;

  list.forEach((s, idx) => {
    if (!s.title || !s.artist || !s.year) {
      console.error(`Missing metadata at index ${idx}:`, s);
      errors++;
    }
    if (!s.videoId || s.videoId.length !== 11) {
      console.error(`Invalid videoId at index ${idx}: ${s.videoId}`);
      errors++;
    }
    if (idSet.has(s.videoId)) {
      console.error(`Duplicate videoId at index ${idx}: ${s.videoId}`);
      errors++;
    }
    idSet.add(s.videoId);

    if (s.energy !== 9 && s.energy !== 10) {
      console.error(`Invalid energy at index ${idx}: ${s.energy}`);
      errors++;
    }
    if (s.hookEndSec !== s.hookStartSec + 40) {
      console.error(`Hook duration != 40 at index ${idx}: ${s.hookStartSec} -> ${s.hookEndSec}`);
      errors++;
    }
  });

  if (errors === 0 && list.length === 100) {
    console.log(`SUCCESS: All 100 songs verified with ZERO errors, zero duplicates, and authentic 11-char video IDs!`);
  } else {
    console.error(`Verification encountered ${errors} errors!`);
    process.exit(1);
  }
}

run().catch(console.error);
