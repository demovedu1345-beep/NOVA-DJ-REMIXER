import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'https://www.naux.party';
const OUT_DIR = path.resolve('extracted_naux');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const PAGES = [
  '/',
  '/songs',
  '/songs/hindi-dance',
  '/songs/punjabi-party',
  '/songs/english-top-hits',
  '/songs/bollywood-bangers'
];

async function downloadFile(urlPath) {
  try {
    const fullUrl = urlPath.startsWith('http') ? urlPath : `${BASE_URL}${urlPath}`;
    const res = await fetch(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    if (!res.ok) {
      console.warn(`Failed to fetch ${fullUrl}: ${res.status}`);
      return null;
    }
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('text') || contentType.includes('javascript') || contentType.includes('json')) {
      return await res.text();
    } else {
      const arrayBuffer = await res.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }
  } catch (err) {
    console.error(`Error downloading ${urlPath}:`, err.message);
    return null;
  }
}

async function scrapeAll() {
  console.log('Downloading pages from', BASE_URL);
  const assetsToDownload = new Set();

  for (const pagePath of PAGES) {
    console.log(`Downloading page: ${pagePath}...`);
    const content = await downloadFile(pagePath);
    if (!content || typeof content !== 'string') continue;

    // Save page
    const filename = pagePath === '/' ? 'index.html' : `${pagePath.replace(/^\//, '').replace(/\//g, '_')}.html`;
    fs.writeFileSync(path.join(OUT_DIR, filename), content);
    console.log(`Saved ${filename}`);

    // Find all static chunks, CSS, and script links
    const matches = content.matchAll(/(?:src|href)="(\/_next\/[^"]+)"/g);
    for (const m of matches) {
      assetsToDownload.add(m[1]);
    }
  }

  console.log(`Found ${assetsToDownload.size} static assets to download.`);
  for (const assetPath of assetsToDownload) {
    console.log(`Downloading asset: ${assetPath}...`);
    const data = await downloadFile(assetPath);
    if (!data) continue;

    const localPath = path.join(OUT_DIR, assetPath.replace(/^\//, '').replace(/\//g, path.sep));
    const dir = path.dirname(localPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(localPath, data);
    console.log(`Saved ${assetPath}`);
  }

  console.log('\nDOWNLOAD COMPLETE! All files stored in', OUT_DIR);
}

scrapeAll();
