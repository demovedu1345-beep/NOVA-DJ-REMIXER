import fs from 'fs';

const content = fs.readFileSync('public/naux/static/immutable/chunks/3cq6guoi7hqi2.js', 'utf8');

// Find keepLiveAudible
const idx = content.indexOf('keepLiveAudible');
if (idx !== -1) {
  console.log('--- keepLiveAudible ---');
  console.log(content.slice(Math.max(0, idx - 100), Math.min(content.length, idx + 800)));
} else {
  console.log('keepLiveAudible not found');
}
