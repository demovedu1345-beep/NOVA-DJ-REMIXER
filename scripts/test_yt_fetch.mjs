async function test() {
  const q = 'KR$NA Prarthana Far From Over official music video';
  const url = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
  });
  console.log('Status:', res.status);
  const text = await res.text();
  const idMatches = [...text.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)].map(m => m[1]);
  console.log('Unique IDs:', [...new Set(idMatches)].slice(0, 5));
  for (const id of [...new Set(idMatches)].slice(0, 5)) {
    const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);
    console.log('ID:', id, 'OEmbed status:', oembedRes.status);
    if (oembedRes.ok) {
      const data = await oembedRes.json();
      console.log('Title:', data.title);
    }
  }
}
test();
