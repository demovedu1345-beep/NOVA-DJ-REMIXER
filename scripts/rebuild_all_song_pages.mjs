import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CURATED_CATEGORIES_DB } from '../api/_lib/curated-songs-db.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const songsDir = path.join(root, 'public/songs');

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function fmtSec(sec) {
  const s = Math.round(Number(sec) || 0);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${String(rem).padStart(2, '0')}`;
}

// 1. Rebuild every category song list page
for (const [slug, cat] of Object.entries(CURATED_CATEGORIES_DB)) {
  const songs = cat.songs || [];
  const count = songs.length;

  const targetFiles = [
    path.join(songsDir, `${slug}.html`),
    path.join(songsDir, slug, 'index.html')
  ];

  for (const filePath of targetFiles) {
    if (!fs.existsSync(filePath)) continue;

    let html = fs.readFileSync(filePath, 'utf8');

    // Build the <li> items
    const liItems = songs.map((s, idx) => {
      const vId = s.videoId || (s.youtube_ids && s.youtube_ids[0]) || 'BddP6PYo2gs';
      const entry = s.entrySec || s.hookStartSec || 30;
      const exit = s.exitSec || s.hookEndSec || (entry + 40);
      const hookStr = `${fmtSec(entry)}–${fmtSec(exit)}`;
      const ytUrl = `https://www.youtube.com/watch?v=${vId}&t=${entry}s`;
      const titleEsc = escapeHtml(s.title);
      const artistEsc = escapeHtml(s.artist);
      const year = s.year || '2024';

      return `<li class="flex items-baseline gap-3 border-b border-white/10 py-3"><span class="w-8 shrink-0 font-display text-xl text-white/35 tabular-nums">${idx + 1}</span><div class="min-w-0 flex-1"><div class="font-display text-xl uppercase leading-tight md:text-2xl">${titleEsc}</div><div class="text-white/55">${artistEsc}<!-- --> · ${year}</div></div><a href="${ytUrl}" target="_blank" rel="noopener noreferrer" class="shrink-0 text-right text-sm text-lime/80 hover:text-lime transition underline" title="Listen on YouTube at hook">▶ ${hookStr}</a></li>`;
    }).join('');

    // Replace the <ol ...>...</ol>
    const olRegex = /<ol class="mt-8 flex flex-col">[\s\S]*?<\/ol>/;
    if (olRegex.test(html)) {
      html = html.replace(olRegex, `<ol class="mt-8 flex flex-col">${liItems}</ol>`);
    }

    // Replace count in <title>: e.g. <title>Hindi Sufi Songs 2026: 76 hits...
    html = html.replace(/<title>([^:]+):\s*\d+\s*hits/i, `<title>$1: ${count} hits`);

    // Replace count in meta description: e.g. content="76 hindi sufi songs...
    html = html.replace(/(<meta name="description" content=")\d+(\s+[a-z\s]+songs)/i, `$1${count}$2`);

    // Replace numberOfItems in JSON-LD schema
    html = html.replace(/"numberOfItems":\s*\d+/g, `"numberOfItems":${count}`);

    // Replace <p class="mt-3 text-base text-white/45">\d+<!-- --> songs
    html = html.replace(/(<p class="mt-3 text-base text-white\/45">)\d+(<!-- -->\s*songs)/i, `$1${count}$2`);

    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`Updated ${path.relative(root, filePath)} -> ${count} songs`);
  }
}

// 2. Rebuild song directory counts in public/songs.html and public/songs/index.html
const dirPages = [
  path.join(root, 'public/songs.html'),
  path.join(songsDir, 'index.html')
];

for (const dirFile of dirPages) {
  if (!fs.existsSync(dirFile)) continue;
  let html = fs.readFileSync(dirFile, 'utf8');

  for (const [slug, cat] of Object.entries(CURATED_CATEGORIES_DB)) {
    const count = (cat.songs || []).length;
    // Pattern: <a ... href="/songs/hindi-sufi" ...>...<span ...>\d+<!-- --> songs</span>...</a>
    const linkRegex = new RegExp(`(<a[^>]+href="\\/songs\\/${slug}"[\\s\\S]*?<span class="mt-1 text-white\\/55">)\\d+(<!-- -->\\s*songs<\\/span>)`, 'i');
    if (linkRegex.test(html)) {
      html = html.replace(linkRegex, `$1${count}$2`);
    }
  }

  fs.writeFileSync(dirFile, html, 'utf8');
  console.log(`Updated directory counts in ${path.relative(root, dirFile)}`);
}

console.log('Rebuild completed successfully!');
