import handler from '../api/set.js';

const mockReq = {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: {
    answers: {
      languages: ['hindi'],
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
console.log('Sample cues returned for HINDI ROCK:');
responseData.cues.slice(0, 15).forEach((c, i) => {
  console.log(`${i + 1}. ${c.title} by ${c.artist} (id: ${c.youtube_ids?.[0]})`);
});

const hasCharacter = responseData.cues.some(c => c.title.includes('Character'));
const hasTwist = responseData.cues.some(c => c.title.includes('Twist'));
const hasThumakda = responseData.cues.some(c => c.title.includes('Thumakda'));
console.log('\nIntegrity checks for HINDI ROCK:');
console.log('Has Character Dheela:', hasCharacter);
console.log('Has Twist:', hasTwist);
console.log('Has London Thumakda:', hasThumakda);
