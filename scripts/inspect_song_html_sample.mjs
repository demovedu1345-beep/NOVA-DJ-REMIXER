import fs from 'fs';

const content = fs.readFileSync('public/songs/hindi-sufi.html', 'utf8');
console.log('--- hindi-sufi.html head & start of body ---');
console.log(content.slice(0, 1500));

const songItemMatch = content.match(/<li class="flex items-baseline[\s\S]*?<\/li>/);
console.log('\n--- Sample song item ---');
console.log(songItemMatch ? songItemMatch[0] : 'not found');

const endOfList = content.indexOf('</ol>');
console.log('\n--- Around </ol> ---');
console.log(content.slice(endOfList - 200, endOfList + 300));
