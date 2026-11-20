import handler from '../api/set.js';

function mockRes() {
  let statusCode = 200;
  let headers = {};
  let bodyData = null;

  return {
    setHeader(k, v) { headers[k] = v; },
    status(code) { statusCode = code; return this; },
    end(data) {
      bodyData = data;
      return this;
    },
    getResult() {
      return {
        statusCode,
        headers,
        body: JSON.parse(bodyData)
      };
    }
  };
}

async function testCategory(lang, subtype) {
  const req = {
    method: 'POST',
    body: JSON.stringify({
      answers: {
        languages: lang ? [lang] : [],
        subtypes: subtype ? [subtype] : [],
        energy: 'peak'
      }
    })
  };
  const res = mockRes();
  await handler(req, res);
  const out = res.getResult().body;
  const cues = out.cues || [];
  const uniqueVids = new Set(cues.map(c => c.youtube_ids[0]));
  const hasPlaceholders = cues.some(c => ['BddP6PYo2gs', '7PCkvCPvDXk'].includes(c.youtube_ids[0]));

  console.log(`[TEST: ${lang || 'any'} / ${subtype || 'none'}]`);
  console.log(`  Cues count: ${cues.length}`);
  console.log(`  Unique YouTube IDs: ${uniqueVids.size}`);
  console.log(`  Has Placeholder: ${hasPlaceholders}`);
  console.log(`  First 3 songs:`);
  cues.slice(0, 3).forEach((c, idx) => {
    console.log(`    ${idx + 1}. "${c.title}" by ${c.artist} (${c.youtube_ids[0]}) [${c.entry_sec}s-${c.exit_sec}s]`);
  });
  console.log('--------------------------------------------------');
}

async function run() {
  await testCategory('hindi', 'hindi:dance');
  await testCategory('hindi', 'hindi:hiphop');
  await testCategory('hindi', 'hindi:romantic');
  await testCategory('hindi', 'hindi:retro');
  await testCategory('hindi', 'hindi:sufi');
  await testCategory('hindi', 'hindi:diwali');
  await testCategory('hindi', null);
  await testCategory('punjabi', 'punjabi:party');
  await testCategory('english', 'english:edm');
}

run();
