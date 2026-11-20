import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const songsDir = path.join(root, 'public/songs');
const scriptTag = '<script src="/js/ui/aurora-and-mix-engine.js" defer></script>';

const dbModule = await import('../api/_lib/curated-songs-db.js?t=' + Date.now());
const db = dbModule.CURATED_CATEGORIES_DB;

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

const templateFile = path.join(songsDir, 'hindi-dance.html');
const templateHtml = fs.readFileSync(templateFile, 'utf8');

// 1. Rebuild / create every category song list page
for (const [slug, cat] of Object.entries(db)) {
  const songs = cat.songs || [];
  const count = songs.length;
  const label = cat.label || slug.replace(/-/g, ' ').toUpperCase();

  const targetFiles = [
    path.join(songsDir, `${slug}.html`),
    path.join(songsDir, slug, 'index.html')
  ];

  // If page doesn't exist, generate from template
  if (!fs.existsSync(targetFiles[0])) {
    let newHtml = templateHtml;
    newHtml = newHtml.replace(/Hindi Dance Songs/g, label);
    newHtml = newHtml.replace(/hindi-dance/g, slug);
    newHtml = newHtml.replace(/Hindi dance/g, label);
    fs.writeFileSync(targetFiles[0], newHtml, 'utf8');
    console.log(`Created new page: public/songs/${slug}.html`);
  }

  const slugDir = path.join(songsDir, slug);
  if (!fs.existsSync(slugDir)) {
    fs.mkdirSync(slugDir, { recursive: true });
  }
  if (!fs.existsSync(targetFiles[1])) {
    fs.copyFileSync(targetFiles[0], targetFiles[1]);
  }

  for (const filePath of targetFiles) {
    if (!fs.existsSync(filePath)) continue;
    let html = fs.readFileSync(filePath, 'utf8');

    // Build the <li> items
    const liItems = songs.map((s, idx) => {
      const vId = s.videoId || (s.youtube_ids && s.youtube_ids[0]) || '2gcsgfzqN8k';
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

    // Replace count in <title>: e.g. <title>...: \d+ hits...
    html = html.replace(/(<title>[^:]+:\s*)\d+(\s*hits)/i, `$1${count}$2`);

    // Replace count in meta description
    html = html.replace(/(<meta name="description" content=")\d+(\s+[a-z\s]+songs)/i, `$1${count}$2`);

    // Replace numberOfItems in JSON-LD schema
    html = html.replace(/"numberOfItems":\s*\d+/g, `"numberOfItems":${count}`);

    // Replace <p class="mt-3 text-base text-white/45">\d+<!-- --> songs
    html = html.replace(/(<p class="mt-3 text-base text-white\/45">)\d+(<!-- -->\s*songs)/i, `$1${count}$2`);

    // Inject aurora script tag if missing
    if (!html.includes('/js/ui/aurora-and-mix-engine.js') && html.includes('</body>')) {
      html = html.replace('</body>', `${scriptTag}</body>`);
    }

    fs.writeFileSync(filePath, html, 'utf8');
  }
  console.log(`✓ Updated public/songs/${slug} -> ${count} songs`);
}

// 2. Rebuild directory pages: public/songs.html and public/songs/index.html
const dirPages = [
  path.join(root, 'public/songs.html'),
  path.join(songsDir, 'index.html')
];

for (const dirFile of dirPages) {
  if (!fs.existsSync(dirFile)) continue;
  let html = fs.readFileSync(dirFile, 'utf8');

  // Replace counts in static HTML
  for (const [slug, cat] of Object.entries(db)) {
    const count = (cat.songs || []).length;
    const linkRegex = new RegExp(`(<a[^>]+href="\\/songs\\/${slug}"[\\s\\S]*?<span class="mt-1 text-white\\/55">)\\d+(<!-- -->\\s*songs<\\/span>)`, 'gi');
    if (linkRegex.test(html)) {
      html = html.replace(linkRegex, `$1${count}$2`);
    }

    // Also replace in React serialization: [COUNT," songs"]
    const nextFRegex = new RegExp(`(\\[\\\\\"\\$\\\\\",\\\\\"li\\\\\",\\\\\"${slug}\\\\\"[\\s\\S]*?\\\\\"children\\\\\":\\[)\\d+(,\\\\\" songs\\\\\"\\])`, 'gi');
    if (nextFRegex.test(html)) {
      html = html.replace(nextFRegex, `$1${count}$2`);
    }
  }

  // Ensure new regional categories are added to the directory list if missing
  const newSlugsToAdd = ['marathi-party', 'marwadi-rajasthani', 'kannada-hits', 'odia-hits'];
  for (const slug of newSlugsToAdd) {
    if (!html.includes(`href="/songs/${slug}"`)) {
      const cat = db[slug];
      if (cat) {
        const count = cat.songs.length;
        const newLi = `<li><a href="/songs/${slug}" class="flex h-full flex-col rounded-2xl border-2 border-white/15 p-5 transition hover:border-lime"><span class="font-display text-2xl uppercase leading-tight">${escapeHtml(cat.label)}</span><span class="mt-1 text-white/55">${count}<!-- --> songs</span></a></li></ul>`;
        html = html.replace('</ul>', newLi);
      }
    }
  }

  // Ensure aurora script is injected
  if (!html.includes('/js/ui/aurora-and-mix-engine.js') && html.includes('</body>')) {
    html = html.replace('</body>', `${scriptTag}</body>`);
  }

  fs.writeFileSync(dirFile, html, 'utf8');
  console.log(`✓ Updated directory page: ${path.relative(root, dirFile)}`);
}

console.log('\nAll song pages and directory counts rebuilt successfully!');
