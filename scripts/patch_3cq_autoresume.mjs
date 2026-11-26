import fs from 'fs';

const FILE = 'public/naux/static/immutable/chunks/3cq6guoi7hqi2.js';
let content = fs.readFileSync(FILE, 'utf8');

const target = 'this.isMobile()&&(()=>{let l=this.liveDeck()';
const repl = '/*uncond_live*/(()=>{let l=this.liveDeck()';

if (content.includes(target)) {
  content = content.replace(target, repl);
  console.log('Successfully made live deck auto-resume unconditional across desktop, tablet, and mobile!');
} else {
  console.error('Target not found in 3cq6guoi7hqi2.js!');
  process.exit(1);
}

fs.writeFileSync(FILE, content, 'utf8');
