import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CURATED_CATEGORIES_DB } from '../api/_lib/curated-songs-db.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const songsDir = path.join(root, 'public/songs');

function fmtSec(sec) {
  const s = Math.round(Number(sec) || 0);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${String(rem).padStart(2, '0')}`;
}

let totalEnriched = 0;

for (const [slug, cat] of Object.entries(CURATED_CATEGORIES_DB)) {
  const filesToUpdate = [
    path.join(songsDir, `${slug}.html`),
    path.join(songsDir, slug, 'index.html')
  ];

  for (const filePath of filesToUpdate) {
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    // Map each song
    (cat.songs || []).forEach((song, idx) => {
      const vId = song.videoId || 'BddP6PYo2gs';
      const entry = song.entrySec || 30;
      const exit = song.exitSec || 70;
      const hookStr = `${fmtSec(entry)}–${fmtSec(exit)}`;
      const ytUrl = `https://www.youtube.com/watch?v=${vId}&t=${entry}s`;

      // Match the song in HTML by its title and index
      // Pattern: <li class="flex items-baseline gap-3 border-b border-white/10 py-3"><span ...>${idx+1}</span><div ...>${title}</div>...<span class="shrink-0 text-right text-sm text-white/45">from the best part</span></li>
      const titleEsc = song.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(
        `(<li class="flex items-baseline gap-3 border-b border-white/10 py-3"><span[^>]*>${idx + 1}</span><div[^>]*><div[^>]*>${titleEsc}</div>[\\s\\S]*?)<span class="shrink-0 text-right text-sm text-white/45">from the best part</span>(</li>)`
      );

      const replacement = `$1<a href="${ytUrl}" target="_blank" rel="noopener noreferrer" class="shrink-0 text-right text-sm text-lime/80 hover:text-lime transition underline" title="Listen on YouTube at hook">▶ ${hookStr}</a>$2`;

      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        totalEnriched++;
      }
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${path.relative(root, filePath)}`);
    }
  }
}

console.log(`Finished enriching songs with YouTube links! Total items enriched: ${totalEnriched}`);
