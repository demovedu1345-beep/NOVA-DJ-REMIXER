import fs from 'fs';

const FILE = 'public/naux/static/immutable/chunks/2yak1xb5ht175.js';
let content = fs.readFileSync(FILE, 'utf8');

// 1. Replace max-w-[44vw] with max-w-[65vw]
const target1 = 'max-w-[44vw]';
const repl1 = 'max-w-[65vw]';

// 2. Replace min-w-0 truncate with whitespace-nowrap
const target2 = 'className:"min-w-0 truncate"';
const repl2 = 'className:"whitespace-nowrap"';

// 3. Replace mobile truncate with whitespace-nowrap
const target3 = 'children:[(0,t.jsx)("span",{className:"truncate",children:c(x)})';
const repl3 = 'children:[(0,t.jsx)("span",{className:"whitespace-nowrap",children:c(x)})';

let patched = content;
if (patched.includes(target1)) {
  patched = patched.replace(target1, repl1);
  console.log('Patched target1: max-w-[65vw]');
}
if (patched.includes(target2)) {
  patched = patched.replace(target2, repl2);
  console.log('Patched target2: min-w-0 truncate -> whitespace-nowrap');
}
if (patched.includes(target3)) {
  patched = patched.replace(target3, repl3);
  console.log('Patched target3: mobile truncate -> whitespace-nowrap');
}

fs.writeFileSync(FILE, patched, 'utf8');
console.log('Successfully updated 2yak1xb5ht175.js');
