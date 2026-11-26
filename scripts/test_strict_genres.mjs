import handler from '../api/set.js';

async function testQuery(name, body) {
  let statusCode = 0;
  let sentData = null;
  const req = {
    method: 'POST',
    body
  };

  await handler({
    ...req,
    headers: { 'content-type': 'application/json' },
    [Symbol.asyncIterator]: async function* () {
      yield Buffer.from(JSON.stringify(body));
    }
  }, {
    setHeader: () => {},
    writeHead: (c) => { statusCode = c; },
    end: (str) => {
      try { sentData = JSON.parse(str); } catch { sentData = str; }
    }
  });

  const cues = sentData?.cues || [];
  console.log(`\n=== Test: ${name} ===`);
  console.log(`Cues returned: ${cues.length}`);
  
  const indianTerms = [
    'sambalpuri', 'appu', 'puneeth', 'devi sri', 'kumar sanu', 'arijit', 'badshah', 
    'geet', 'nacho', 'desi', 'dhol', 'garba', 'bhangra', 'punjabi', 'bollywood',
    'hindi', 'tamil', 'telugu', 'kannada', 'malayalam', 'marathi', 'gujarati', 'odia',
    'shreya', 'sonu nigam', 'kishore', 'lata', 'rafi', 'mukesh', 'asha', 'alka',
    'udit', 'atif', 'pritam', 'diljit', 'karan aujla', 'divine'
  ];

  let badCount = 0;
  for (const c of cues) {
    const full = `${c.title} ${c.artist}`.toLowerCase();
    for (const t of indianTerms) {
      const reg = new RegExp('\\b' + t + '\\b', 'i');
      if (reg.test(full)) {
        console.log(`  ❌ Non-English track found: "${c.title}" by ${c.artist} (matched ${t})`);
        badCount++;
        break;
      }
    }
  }

  if (badCount === 0) {
    console.log(`  ✓ 100% CLEAN. Sample tracks:`);
    for (const c of cues.slice(0, 5)) {
      console.log(`     - "${c.title}" by ${c.artist} [${c.language}]`);
    }
  }
}

async function runAll() {
  await testQuery("English: Rock", { answers: { languages: ['english'], subtypes: ['english:rock'] } });
  await testQuery("English: Pop", { answers: { languages: ['english'], subtypes: ['pop'] } });
  await testQuery("English: EDM", { answers: { languages: ['english'], subtypes: ['english:edm'] } });
  await testQuery("English: Hip-Hop", { answers: { languages: ['english'], subtypes: ['hiphop'] } });
  await testQuery("English: Country", { answers: { languages: ['english'], subtypes: ['english:country'] } });
  await testQuery("English: General (No sub)", { answers: { languages: ['english'] } });
}

runAll().catch(console.error);
