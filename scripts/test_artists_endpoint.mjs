import handler from '../api/artists.js';

async function testArtistsEndpoint(query) {
  let statusCode = 0;
  let sentData = null;

  const req = {
    method: 'GET',
    url: '/api/artists?' + new URLSearchParams(query).toString()
  };

  const res = {
    setHeader: () => {},
    writeHead: (c) => { statusCode = c; },
    end: (str) => {
      try { sentData = JSON.parse(str); } catch { sentData = str; }
    }
  };

  await handler(req, res);
  console.log(`\n=== GET /api/artists ${JSON.stringify(query)} ===`);
  console.log(`Status: ${statusCode}`);
  if (sentData?.artists) {
    console.log(`Found ${sentData.artists.length} artists:`);
    for (const a of sentData.artists.slice(0, 6)) {
      console.log(`  - ${a.name} [${a.country}] (${a.songCount || a.songs?.length || 0} songs)`);
    }
  } else if (sentData?.artist) {
    console.log(`Artist: ${sentData.artist.name} - ${sentData.playableTracks.length} tracks`);
  } else {
    console.log('Response:', sentData);
  }
}

async function run() {
  await testArtistsEndpoint({ lang: 'hindi', sub: 'romantic' });
  await testArtistsEndpoint({ lang: 'english', sub: 'pop' });
  await testArtistsEndpoint({ id: 'atif-aslam', lang: 'hindi' });
  await testArtistsEndpoint({ id: 'ariana-grande', lang: 'english' });
}

run().catch(console.error);
