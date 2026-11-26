import handler from '../api/set.js';

const mockReq = {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: {
    answers: {
      languages: ['english'],
      subtypes: ['rock'],
      energy: 'peak'
    }
  }
};

let responseData = null;
const mockRes = {
  statusCode: 200,
  setHeader: () => {},
  end: (payload) => {
    responseData = JSON.parse(payload);
  }
};

await handler(mockReq, mockRes);

console.log('Result cues count:', responseData?.cues?.length);
console.log('Sample cues returned for ENGLISH ROCK:');
responseData.cues.slice(0, 15).forEach((c, i) => {
  console.log(`${i + 1}. ${c.title} by ${c.artist} (id: ${c.youtube_ids?.[0]})`);
});

const hasTravis = responseData.cues.some(c => c.artist.includes('Travis') || c.title.includes('Goosebumps'));
const hasDrake = responseData.cues.some(c => c.artist.includes('Drake') || c.title.includes("God's Plan"));
console.log('\nIntegrity checks for ENGLISH ROCK:');
console.log('Has Travis Scott:', hasTravis);
console.log('Has Drake:', hasDrake);
