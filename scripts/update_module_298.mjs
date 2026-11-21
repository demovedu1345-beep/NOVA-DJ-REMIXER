import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const chunkPath = path.join(root, 'public/naux/static/immutable/chunks/3cq6guoi7hqi2.js');

let content = fs.readFileSync(chunkPath, 'utf8');

const target = '298,e=>{"use strict";e.s(["LANGUAGES",0,[{id:"hindi",label:"Hindi",subtypes:[{id:"diwali",label:"Diwali Party Songs"},{id:"dance",label:"Hindi Dance Songs"},{id:"romantic",label:"Hindi Romantic Songs"},{id:"retro",label:"Hindi Retro Songs"},{id:"sufi",label:"Hindi Sufi Songs"},{id:"hiphop",label:"Hindi Desi Pop Songs"}]},{id:"english",label:"English",subtypes:[{id:"pop",label:"English Pop Songs"},{id:"edm",label:"English EDM Songs"},{id:"hiphop",label:"English Hip-Hop Songs"},{id:"love",label:"English Love Songs"}]},{id:"language",label:"Language",subtypes:[{id:"punjabi",label:"Punjabi Hits"},{id:"marathi",label:"Marathi Hits"},{id:"gujarati",label:"Gujarati Garba"},{id:"tamil-telugu",label:"Tamil & Telugu Mass"},{id:"kannada",label:"Kannada Hits"},{id:"marwadi",label:"Marwadi / Rajasthani"},{id:"odia",label:"Odia Hits"},{id:"haryanvi-bhojpuri",label:"Haryanvi & Bhojpuri"}]}],"MIN_LANGUAGE_SONGS",0,10,';

const replacement = '298,e=>{"use strict";e.s(["LANGUAGES",0,[{id:"hindi",label:"Hindi",subtypes:[{id:"diwali",label:"Diwali Party Songs"},{id:"dance",label:"Hindi Dance Songs"},{id:"romantic",label:"Hindi Romantic Songs"},{id:"retro",label:"Hindi Retro Songs"},{id:"sufi",label:"Hindi Sufi Songs"},{id:"hiphop",label:"Hindi Desi Pop Songs"},{id:"breakup",label:"Hindi Breakup Songs"},{id:"trip",label:"Hindi Trip & Travel Songs"},{id:"emotional",label:"Hindi Emotional & Soulful"},{id:"motivating",label:"Hindi Motivational & Gym"}]},{id:"english",label:"English",subtypes:[{id:"pop",label:"English Pop Songs"},{id:"edm",label:"English EDM Songs"},{id:"hiphop",label:"English Hip-Hop Songs"},{id:"love",label:"English Love Songs"},{id:"breakup",label:"English Breakup Songs"},{id:"trip",label:"English Road Trip & Travel"},{id:"emotional",label:"English Emotional & Soulful"},{id:"motivating",label:"English Motivational & Workout"}]},{id:"language",label:"Language",subtypes:[{id:"punjabi",label:"Punjabi Hits"},{id:"marathi",label:"Marathi Hits"},{id:"gujarati",label:"Gujarati Garba"},{id:"tamil-telugu",label:"Tamil & Telugu Mass"},{id:"kannada",label:"Kannada Hits"},{id:"marwadi",label:"Marwadi / Rajasthani"},{id:"odia",label:"Odia Hits"},{id:"haryanvi-bhojpuri",label:"Haryanvi & Bhojpuri"}]}],"MIN_LANGUAGE_SONGS",0,10,';

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(chunkPath, content, 'utf8');
  console.log('✓ Successfully updated Module 298 in public/naux/static/immutable/chunks/3cq6guoi7hqi2.js');
} else {
  console.error('Target string not found in chunk!');
  process.exit(1);
}
