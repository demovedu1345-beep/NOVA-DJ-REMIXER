import fs from 'fs';

const html = fs.readFileSync('public/songs.html', 'utf8');
const regex = /<a[^>]+href="\/songs\/([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
let match;
console.log('Matches in public/songs.html:');
while ((match = regex.exec(html)) !== null) {
  const slug = match[1];
  const inner = match[2].replace(/\s+/g, ' ').trim();
  console.log(`${slug}: ${inner}`);
}
