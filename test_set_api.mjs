import handler from './api/set.js';

class MockRes {
  statusCode = 200;
  headers = {};
  body = null;
  setHeader(k, v) { this.headers[k] = v; }
  end(data) { this.body = data; }
}

// Test GET
const reqGet = { method: 'GET', url: '/api/set' };
const resGet = new MockRes();
await handler(reqGet, resGet);
const getData = JSON.parse(resGet.body);
console.log('GET /api/set counts count:', Object.keys(getData.counts).length);
console.log('Hindi count:', getData.counts.hindi);
console.log('English count:', getData.counts.english);
console.log('Sample hindi:breakup:', getData.counts['hindi:breakup']);
console.log('Sample english:rnb:', getData.counts['english:rnb']);

// Test POST for category
const reqPostCat = {
  method: 'POST',
  url: '/api/set',
  body: JSON.stringify({ answers: { languages: ['hindi'], subtypes: ['breakup'] } })
};
const resPostCat = new MockRes();
await handler(reqPostCat, resPostCat);
const catData = JSON.parse(resPostCat.body);
console.log('POST /api/set category cues count:', catData.cues?.length);
console.log('First cue:', catData.cues?.[0]?.title, 'by', catData.cues?.[0]?.artist);

// Test POST for artist
const reqPostArt = {
  method: 'POST',
  url: '/api/set',
  body: JSON.stringify({ artist: 'arijit-singh', lang: 'hindi' })
};
const resPostArt = new MockRes();
await handler(reqPostArt, resPostArt);
const artData = JSON.parse(resPostArt.body);
console.log('POST /api/set artist cues count:', artData.cues?.length);
console.log('Artist note:', artData.note);
console.log('First artist cue:', artData.cues?.[0]?.title, 'by', artData.cues?.[0]?.artist);
