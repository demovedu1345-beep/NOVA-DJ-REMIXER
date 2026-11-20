import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const targetFile = path.join(__dirname, 'curated_batches_200', 'agent_4.json');

async function verifyVideo(vId) {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${vId}&format=json`);
    if (res.status === 200) {
      const data = await res.json();
      return { valid: true, title: data.title, author: data.author_name };
    }
    return { valid: false, status: res.status };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

async function run() {
  console.log('=== VERIFYING AGENT 4 FINAL OUTPUT ===');
  if (!fs.existsSync(targetFile)) {
    console.error(`Target file not found: ${targetFile}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(targetFile, 'utf8');
  const data = JSON.parse(raw);

  const expectedCategories = ['tamil-telugu-kuthu', 'tamil-telugu-mass'];
  const globalSeenIds = new Set();
  const errors = [];

  for (const cat of expectedCategories) {
    if (!data[cat]) {
      errors.push(`Missing category: ${cat}`);
      continue;
    }

    const songs = data[cat];
    console.log(`\n--- Validating ${cat} (${songs.length} songs) ---`);

    if (songs.length < 100) {
      errors.push(`Category ${cat} has only ${songs.length} songs (requires at least 100)`);
    }

    for (let i = 0; i < songs.length; i++) {
      const s = songs[i];
      const prefix = `[${cat} #${i+1}: ${s.title}]`;

      if (!s.title || typeof s.title !== 'string') errors.push(`${prefix} missing title`);
      if (!s.artist || typeof s.artist !== 'string') errors.push(`${prefix} missing artist`);
      if (!s.year) errors.push(`${prefix} missing year`);
      if (typeof s.durationSec !== 'number' || s.durationSec < 60) errors.push(`${prefix} invalid durationSec`);
      if (typeof s.hookStartSec !== 'number') errors.push(`${prefix} invalid hookStartSec`);
      if (typeof s.hookEndSec !== 'number') errors.push(`${prefix} invalid hookEndSec`);
      if (typeof s.entrySec !== 'number') errors.push(`${prefix} invalid entrySec`);
      if (typeof s.exitSec !== 'number') errors.push(`${prefix} invalid exitSec`);
      if (s.energy !== 9 && s.energy !== 10) errors.push(`${prefix} energy must be 9 or 10, got ${s.energy}`);

      if (!s.videoId || typeof s.videoId !== 'string' || s.videoId.length !== 11) {
        errors.push(`${prefix} invalid videoId format: ${s.videoId}`);
        continue;
      }

      if (globalSeenIds.has(s.videoId)) {
        errors.push(`${prefix} duplicate videoId detected: ${s.videoId}`);
      }
      globalSeenIds.add(s.videoId);
    }
  }

  if (errors.length > 0) {
    console.error('\n❌ FORMAT VALIDATION FAILED WITH ERRORS:');
    for (const e of errors) console.error('  -', e);
    process.exit(1);
  }

  console.log('\n✅ ALL STRUCTURAL REQUIREMENTS PASSED!');
  console.log(`Total songs: ${globalSeenIds.size}`);
  console.log(`Checking oEmbed verification across all ${globalSeenIds.size} videos...`);

  let validCount = 0;
  let oembedFails = [];

  for (const cat of expectedCategories) {
    for (const s of data[cat]) {
      const v = await verifyVideo(s.videoId);
      if (v.valid) {
        validCount++;
      } else {
        oembedFails.push({ title: s.title, videoId: s.videoId, error: v });
      }
    }
  }

  console.log(`\noEmbed Verification: ${validCount} / ${globalSeenIds.size} PASSED`);
  if (oembedFails.length > 0) {
    console.error(`❌ OEMBED FAILED FOR ${oembedFails.length} SONGS:`, oembedFails);
    process.exit(1);
  }

  console.log('\n🎉 100% PERFECT VERIFICATION! ALL VIDEOS AUTHENTIC AND EMBEDDABLE ON YOUTUBE!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
