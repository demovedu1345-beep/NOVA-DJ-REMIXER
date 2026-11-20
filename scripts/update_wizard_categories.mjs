import fs from 'fs';

const filePath = 'public/naux/static/immutable/chunks/3cq6guoi7hqi2.js';
let code = fs.readFileSync(filePath, 'utf8');

const targets = [
  {
    target: '{id:"party",label:"Party"},{id:"wedding",label:"Wedding"},{id:"sad",label:"Sad"},{id:"gym",label:"Gym / Workout"}',
    replacement: '{id:"party",label:"Punjabi Party Songs"},{id:"wedding",label:"Punjabi Wedding Songs"},{id:"sad",label:"Punjabi Sad Songs"},{id:"gym",label:"Punjabi Gym Songs"}'
  },
  {
    target: '{id:"hiphop",label:"Hip-Hop"},{id:"pop",label:"Pop"},{id:"love",label:"Love"},{id:"edm",label:"EDM"}',
    replacement: '{id:"pop",label:"English Pop Songs"},{id:"edm",label:"English EDM Songs"},{id:"hiphop",label:"English Hip-Hop Songs"},{id:"love",label:"English Love Songs"}'
  },
  {
    target: '{id:"kuthu",label:"Kuthu"},{id:"melody",label:"Melody"},{id:"mass",label:"Mass"}',
    replacement: '{id:"kuthu",label:"Tamil & Telugu Kuthu Songs"},{id:"mass",label:"Tamil & Telugu Mass Songs"}'
  },
  {
    target: '{id:"party",label:"Party"},{id:"desi-beats",label:"Desi Beats"}',
    replacement: '{id:"party",label:"Haryanvi & Bhojpuri Party Songs"},{id:"desi-beats",label:"Haryanvi & Bhojpuri Desi Beats Songs"}'
  },
  {
    target: '{id:"garba",label:"Garba & Dandiya"}',
    replacement: '{id:"garba",label:"Garba & Dandiya Party Songs"}'
  }
];

for (const t of targets) {
  if (code.includes(t.target)) {
    code = code.replace(t.target, t.replacement);
    console.log('SUCCESS: replaced', t.target.slice(0, 30));
  } else {
    console.log('NOT FOUND:', t.target.slice(0, 30));
  }
}

fs.writeFileSync(filePath, code, 'utf8');
