import handler from '../api/set.js';

async function testEnglishSet(langs, subtypes) {
  let resStatus = 200;
  let resData = null;
  const req = {
    method: 'POST',
    body: {
      answers: {
        languages: langs,
        subtypes: subtypes
      }
    }
  };
  const res = {
    status: (s) => { resStatus = s; return res; },
    json: (d) => { resData = d; return res; },
    setHeader: () => {},
    end: (d) => { if (d && !resData) { try { resData = JSON.parse(d); } catch(_) {} } return res; }
  };

  await handler(req, res);
  return resData;
}

const data = await testEnglishSet(['english'], ['english:rock']);
console.log('Result cues count:', data?.cues?.length);
if (data?.cues?.length > 0) {
  console.log('First 10 cues in English Rock:');
  data.cues.slice(0, 10).forEach((c, idx) => {
    console.log(`  ${idx+1}. ${c.title} by ${c.artist} (${c.videoId})`);
  });
}
