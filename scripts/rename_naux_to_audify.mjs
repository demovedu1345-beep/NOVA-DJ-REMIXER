import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Exact text replacements where NAUX is used as the brand name
const replacements = [
  // Titles & Headings
  ['NAUX · The aux, handled', 'Audify · The aux, handled'],
  ['· NAUX</title>', '· Audify</title>'],
  ['· NAUX\\"', '· Audify\\"'],
  ['· NAUX"', '· Audify"'],
  ['text-lime">NAUX</h1>', 'text-lime">Audify</h1>'],
  ['text-lime">NAUX</a>', 'text-lime">Audify</a>'],
  ['text-lime">NAUX</span>', 'text-lime">Audify</span>'],
  ['id="btn-naux-brand">NAUX</a>', 'id="btn-naux-brand">Audify</a>'],
  ['select-none">NAUX</h1>', 'select-none">Audify</h1>'],
  ['select-none">NAUX</button>', 'select-none">Audify</button>'],
  ['aria-label="NAUX home">NAUX</button>', 'aria-label="Audify home">Audify</button>'],
  ['aria-label=\\"NAUX home\\">NAUX</button>', 'aria-label=\\"Audify home\\">Audify</button>'],
  ['"aria-label":"NAUX home",children:"NAUX"', '"aria-label":"Audify home",children:"Audify"'],
  ['\\"aria-label\\":\\"NAUX home\\",\\"children\\":\\"NAUX\\"', '\\"aria-label\\":\\"Audify home\\",\\"children\\":\\"Audify\\"'],
  ['children:"NAUX"', 'children:"Audify"'],
  ['children:\\"NAUX\\"', 'children:\\"Audify\\"'],
  ['"children":"NAUX"', '"children":"Audify"'],
  ['\\"children\\":\\"NAUX\\"', '\\"children\\":\\"Audify\\"'],

  // Descriptions & Taglines
  ['Tell NAUX the room', 'Tell Audify the room'],
  ['The songs NAUX plays', 'The songs Audify plays'],
  ['and NAUX starts each one at its best part', 'and Audify starts each one at its best part'],
  ['and NAUX plays it as a set', 'and Audify plays it as a set'],
  ['NAUX picks the order', 'Audify picks the order'],
  ['NAUX starts every song at its best part', 'Audify starts every song at its best part'],
  ["What's NAUX for?", "What's Audify for?"],
  ['One tap. NAUX only gets your name', 'One tap. Audify only gets your name'],
  ['Open NAUX in ', 'Open Audify in '],
  ['Your ear can tune NAUX', 'Your ear can tune Audify'],
  ['set on NAUX', 'set on Audify'],
  ['[NAUX]', '[Audify]'],
  ['NAUX Home Splash', 'Audify Home Splash'],

  // OpenGraph & Meta
  ['content="NAUX"', 'content="Audify"'],
  ['content=\\"NAUX\\"', 'content=\\"Audify\\"'],
  ['"content":"NAUX"', '"content":"Audify"'],
  ['\\"content\\":\\"NAUX\\"', '\\"content\\":\\"Audify\\"'],
  ['name=\\"NAUX\\"', 'name=\\"Audify\\"'],
  ['"name":"NAUX"', '"name":"Audify"'],
  ['\\"name\\":\\"NAUX\\"', '\\"name\\":\\"Audify\\"'],
  ['\\\\\\"name\\\\\\":\\\\\\"NAUX\\\\\\"', '\\\\\\\"name\\\\\\\":\\\\\\\"Audify\\\\\\"'],
  ['"alternateName":"NAUX: the aux, handled"', '"alternateName":"Audify: the aux, handled"'],
  ['\\"alternateName\\":\\"NAUX: the aux, handled\\"', '\\"alternateName\\":\\"Audify: the aux, handled\\"'],
  ['\\\\\\"alternateName\\\\\\":\\\\\\"NAUX: the aux, handled\\\\\\"', '\\\\\\\"alternateName\\\\\\\":\\\\\\\"Audify: the aux, handled\\\\\\"'],
  ['image:alt" content="NAUX:', 'image:alt" content="Audify:'],
  ['image:alt\\" content=\\"NAUX:', 'image:alt\\" content=\\"Audify:'],
  ['image:alt\\",\\"content\\":\\"NAUX:', 'image:alt\\",\\"content\\":\\"Audify:'],
  ['image:alt\\\\\\",\\\\\\"content\\\\\\":\\\\\\"NAUX:', 'image:alt\\\\\\",\\\\\\"content\\\\\\":\\\\\\"Audify:']
];

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  let changed = 0;

  for (const [from, to] of replacements) {
    if (content.includes(from)) {
      const parts = content.split(from);
      changed += parts.length - 1;
      content = parts.join(to);
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${path.relative(root, filePath)} (${changed} replacements)`);
  }
}

// 1. Static HTML files
const htmlFiles = [
  'public/index.html',
  'public/index_legacy.html',
  'public/songs.html',
  'public/songs/index.html',
];

const songsDir = path.join(root, 'public/songs');
for (const item of fs.readdirSync(songsDir)) {
  const p = path.join(songsDir, item);
  if (item.endsWith('.html')) {
    htmlFiles.push(path.relative(root, p));
  } else if (fs.statSync(p).isDirectory()) {
    const subHtml = path.join(p, 'index.html');
    if (fs.existsSync(subHtml)) {
      htmlFiles.push(path.relative(root, subHtml));
    }
  }
}

for (const f of htmlFiles) {
  replaceInFile(path.join(root, f));
}

// 2. Chunks
const chunkFiles = [
  'public/naux/static/immutable/chunks/3cq6guoi7hqi2.js',
  'public/naux/static/immutable/chunks/2yak1xb5ht175.js',
];

for (const f of chunkFiles) {
  replaceInFile(path.join(root, f));
}

// 3. JS engines & UI
const jsFiles = [
  'public/js/ui/app.js',
  'public/js/engine/curated-songs-db.js',
  'api/_lib/curated-songs-db.js',
];

for (const f of jsFiles) {
  replaceInFile(path.join(root, f));
}

console.log('Renaming complete!');
