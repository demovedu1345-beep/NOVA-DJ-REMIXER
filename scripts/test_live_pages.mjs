import https from 'node:https';

async function fetchUrl(url) {
  const res = await fetch(url);
  const text = await res.text();
  return { status: res.status, text };
}

const res = await fetchUrl('https://audifydj.vercel.app/songs');
console.log('GET https://audifydj.vercel.app/songs ->', res.status);
const matches = res.text.match(/<span class="font-display text-2xl uppercase leading-tight">[^<]+<\/span><span class="mt-1 text-white\/55">\d+<!-- --> songs<\/span>/g);
if (matches) {
  matches.forEach(m => {
    const clean = m.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    console.log(' - ' + clean);
  });
}
