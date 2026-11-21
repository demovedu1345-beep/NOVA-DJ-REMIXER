import handler from './api/artists.js';

class MockRes {
  body = null;
  setHeader() {}
  end(d) { this.body = d; }
}

// Test 1: Hindi Romantic Artists
const res1 = new MockRes();
await handler({ method: 'GET', url: '/api/artists?lang=hindi&sub=romantic' }, res1);
const data1 = JSON.parse(res1.body);
console.log('Hindi Romantic Artists count:', data1.count);
console.log('Artists:', data1.artists.map(a => a.name + ' (' + a.songsCount + ' songs)').join(', '));

// Test 2: Single Artist Profile (Arijit Singh)
const res2 = new MockRes();
await handler({ method: 'GET', url: '/api/artists?id=arijit-singh&lang=hindi' }, res2);
const data2 = JSON.parse(res2.body);
console.log('Arijit Singh verified:', data2.artist.verified, '| Total playable tracks:', data2.playableTracks?.length);

// Test 3: English Pop Artists
const res3 = new MockRes();
await handler({ method: 'GET', url: '/api/artists?lang=english&sub=pop' }, res3);
const data3 = JSON.parse(res3.body);
console.log('English Pop Artists count:', data3.count);
console.log('Artists:', data3.artists.map(a => a.name + ' (' + a.songsCount + ' songs)').join(', '));
