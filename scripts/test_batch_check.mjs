async function checkSongs() {
  const testList = [
    { query: "DIVINE 3:59 AM official music video", title: "3:59 AM" },
    { query: "Seedhe Maut Namastute official audio", title: "Namastute" },
    { query: "KR$NA Makasam official video", title: "Makasam" },
    { query: "MC Stan Basti Ka Hasti official video", title: "Basti Ka Hasti" },
    { query: "Badshah Jugnu official video", title: "Jugnu" },
    { query: "Paradox Jadugar official video", title: "Jadugar" }
  ];

  for (const t of testList) {
    const url = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(t.query);
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });
    const text = await res.text();
    const idMatches = [...text.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)].map(m => m[1]);
    const uniqueIds = [...new Set(idMatches)];
    
    let found = null;
    for (const vid of uniqueIds.slice(0, 5)) {
      const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${vid}&format=json`);
      if (oembedRes.ok) {
        const data = await oembedRes.json();
        found = { videoId: vid, title: data.title, author: data.author_name };
        break;
      }
    }
    console.log(t.title, '=>', found);
  }
}
checkSongs();
