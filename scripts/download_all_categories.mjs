import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'https://www.naux.party';
const OUT_DIR = path.resolve('extracted_naux');

const SLUGS = [
  'diwali-party-songs',
  'hindi-dance',
  'hindi-retro',
  'hindi-romantic',
  'hindi-sufi',
  'hindi-hiphop',
  'punjabi-party',
  'punjabi-wedding',
  'punjabi-sad',
  'punjabi-gym',
  'english-hiphop',
  'english-pop',
  'english-love',
  'english-edm',
  'tamil-telugu-kuthu',
  'tamil-telugu-mass',
  'haryanvi-bhojpuri-party',
  'haryanvi-bhojpuri-desi-beats',
  'gujarati-garba'
];

async function downloadCategory(slug) {
  const filename = `songs_${slug}.html`;
  const filePath = path.join(OUT_DIR, filename);
  if (fs.existsSync(filePath)) {
    console.log(`Already have ${filename}`);
    return;
  }
  const url = `${BASE_URL}/songs/${slug}`;
  console.log(`Downloading ${url}...`);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) {
      console.warn(`Failed ${slug}: ${res.status}`);
      return;
    }
    const text = await res.text();
    fs.writeFileSync(filePath, text);
    console.log(`Saved ${filename} (${text.length} bytes)`);
  } catch (err) {
    console.error(`Error ${slug}:`, err.message);
  }
}

async function main() {
  for (const slug of SLUGS) {
    await downloadCategory(slug);
    await new Promise(r => setTimeout(r, 200));
  }
  console.log('Finished downloading all 19 category pages!');
}

main();
