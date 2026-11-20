import fs from 'fs';
import path from 'path';

const edmSongs = [
  { title: "Levels", artist: "Avicii", year: "2011", id: "_ovdm2yX4MA", hook: 65, dur: 202, energy: 10 },
  { title: "Wake Me Up", artist: "Avicii", year: "2013", id: "IcrbM1l_BoI", hook: 80, dur: 250, energy: 10 },
  { title: "The Nights", artist: "Avicii", year: "2014", id: "UtF6Jej8yb4", hook: 42, dur: 190, energy: 10 },
  { title: "Waiting For Love", artist: "Avicii", year: "2015", id: "cHHLHGNpCSA", hook: 55, dur: 230, energy: 10 },
  { title: "Hey Brother", artist: "Avicii", year: "2013", id: "6Cp6mKbRTQY", hook: 60, dur: 255, energy: 9 },
  { title: "Animals", artist: "Martin Garrix", year: "2013", id: "gCYcHz2k5x0", hook: 56, dur: 195, energy: 10 },
  { title: "In The Name Of Love", artist: "Martin Garrix & Bebe Rexha", year: "2016", id: "RnBT9uUYb1w", hook: 50, dur: 195, energy: 9 },
  { title: "Scared To Be Lonely", artist: "Martin Garrix & Dua Lipa", year: "2017", id: "e2vBLd5Egnk", hook: 55, dur: 220, energy: 9 },
  { title: "High On Life", artist: "Martin Garrix ft. Bonn", year: "2018", id: "Lpjcm1F8tY8", hook: 65, dur: 230, energy: 10 },
  { title: "Tremor", artist: "Dimitri Vegas & Like Mike, Martin Garrix", year: "2014", id: "9vMh9f41pqE", hook: 45, dur: 195, energy: 10 },
  { title: "Titanium", artist: "David Guetta ft. Sia", year: "2011", id: "JRfuAukYTKg", hook: 58, dur: 245, energy: 10 },
  { title: "Don't You Worry Child", artist: "Swedish House Mafia ft. John Martin", year: "2012", id: "1y6smkh6c-0", hook: 70, dur: 215, energy: 10 },
  { title: "Save The World", artist: "Swedish House Mafia", year: "2011", id: "BXpdmKELE1k", hook: 62, dur: 213, energy: 9 },
  { title: "Moth To A Flame", artist: "Swedish House Mafia & The Weeknd", year: "2021", id: "u9n7Cw-4_HQ", hook: 48, dur: 234, energy: 9 },
  { title: "Summer", artist: "Calvin Harris", year: "2014", id: "ebXbLfLACGM", hook: 48, dur: 220, energy: 10 },
  { title: "This Is What You Came For", artist: "Calvin Harris ft. Rihanna", year: "2016", id: "kOkQ4T5WO9E", hook: 72, dur: 235, energy: 10 },
  { title: "One Kiss", artist: "Calvin Harris, Dua Lipa", year: "2018", id: "DkeiKbqa02g", hook: 45, dur: 215, energy: 9 },
  { title: "How Deep Is Your Love", artist: "Calvin Harris & Disciples", year: "2015", id: "EgqUJOudrcM", hook: 58, dur: 210, energy: 9 },
  { title: "Under Control", artist: "Calvin Harris & Alesso ft. Hurts", year: "2013", id: "yZqmarGShxg", hook: 62, dur: 185, energy: 10 },
  { title: "Feel So Close", artist: "Calvin Harris", year: "2011", id: "dGghkjpNCQ8", hook: 60, dur: 206, energy: 9 },
  { title: "I Need Your Love", artist: "Calvin Harris ft. Ellie Goulding", year: "2013", id: "AtKZKl7Bgu0", hook: 50, dur: 225, energy: 9 },
  { title: "Clarity", artist: "Zedd ft. Foxes", year: "2012", id: "IxxstCcJlsc", hook: 60, dur: 250, energy: 10 },
  { title: "Stay The Night", artist: "Zedd ft. Hayley Williams", year: "2013", id: "i-gyZ35074k", hook: 52, dur: 225, energy: 10 },
  { title: "The Middle", artist: "Zedd, Maren Morris, Grey", year: "2018", id: "M3mJkSqZbX4", hook: 42, dur: 185, energy: 9 },
  { title: "Stay", artist: "Zedd & Alessia Cara", year: "2017", id: "h--P8HzYZ74", hook: 46, dur: 210, energy: 9 },
  { title: "I Want You To Know", artist: "Zedd ft. Selena Gomez", year: "2015", id: "X46t8ZFqUB4", hook: 52, dur: 240, energy: 9 },
  { title: "Lean On", artist: "Major Lazer & DJ Snake ft. MØ", year: "2015", id: "YqeW9_5kURI", hook: 42, dur: 180, energy: 10 },
  { title: "Turn Down For What", artist: "DJ Snake, Lil Jon", year: "2013", id: "HMUDVMiITOU", hook: 40, dur: 215, energy: 10 },
  { title: "Faded", artist: "Alan Walker", year: "2015", id: "60ItHLz5WEA", hook: 50, dur: 212, energy: 9 },
  { title: "Alone", artist: "Marshmello", year: "2016", id: "ALZHF5UqnU4", hook: 45, dur: 200, energy: 10 },
  { title: "Silence", artist: "Marshmello ft. Khalid", year: "2017", id: "Tx1sqYc3qas", hook: 45, dur: 180, energy: 9 },
  { title: "Happier", artist: "Marshmello ft. Bastille", year: "2018", id: "m7Bc3pLyij0", hook: 48, dur: 215, energy: 9 },
  { title: "Something Just Like This", artist: "The Chainsmokers & Coldplay", year: "2017", id: "FM7MFYoylVs", hook: 65, dur: 245, energy: 10 },
  { title: "Closer", artist: "The Chainsmokers ft. Halsey", year: "2016", id: "0zGcUoRlhmw", hook: 58, dur: 245, energy: 10 },
  { title: "Don't Let Me Down", artist: "The Chainsmokers ft. Daya", year: "2016", id: "Io0fBr1XBUA", hook: 48, dur: 208, energy: 9 },
  { title: "Roses", artist: "The Chainsmokers ft. ROZES", year: "2015", id: "G5Mv2iV0wkU", hook: 52, dur: 226, energy: 9 },
  { title: "Tsunami", artist: "DVBBS & Borgeous", year: "2013", id: "0EWbonj7f18", hook: 53, dur: 235, energy: 10 },
  { title: "Reload", artist: "Sebastian Ingrosso, Tommy Trash, John Martin", year: "2013", id: "GuAtcpFQpMw", hook: 60, dur: 220, energy: 10 },
  { title: "Calling (Lose My Mind)", artist: "Sebastian Ingrosso & Alesso ft. Ryan Tedder", year: "2012", id: "9G1I16gJBvU", hook: 75, dur: 205, energy: 10 },
  { title: "Heroes (we could be)", artist: "Alesso ft. Tove Lo", year: "2014", id: "a7SouU3ECpU", hook: 65, dur: 210, energy: 9 },
  { title: "If I Lose Myself", artist: "Alesso vs OneRepublic", year: "2013", id: "OOevVQwQ-LM", hook: 75, dur: 215, energy: 10 },
  { title: "Sandstorm", artist: "Darude", year: "1999", id: "y6120QOlsfU", hook: 30, dur: 225, energy: 10 },
  { title: "Bangarang", artist: "Skrillex ft. Sirah", year: "2011", id: "YJVmu6yttiw", hook: 30, dur: 215, energy: 10 },
  { title: "Scary Monsters and Nice Sprites", artist: "Skrillex", year: "2010", id: "WSeNSzJ2-Jw", hook: 40, dur: 245, energy: 10 },
  { title: "Where Are Ü Now", artist: "Skrillex & Diplo with Justin Bieber", year: "2015", id: "nntGTK2Fhb0", hook: 54, dur: 250, energy: 9 },
  { title: "The Business", artist: "Tiësto", year: "2020", id: "nCg3ufihKyU", hook: 45, dur: 165, energy: 9 },
  { title: "Red Lights", artist: "Tiësto", year: "2013", id: "CFF0mV24WCY", hook: 50, dur: 202, energy: 9 },
  { title: "Losing It", artist: "FISHER", year: "2018", id: "wE8Az1EV6UQ", hook: 45, dur: 248, energy: 10 },
  { title: "(It Goes Like) Nanana", artist: "Peggy Gou", year: "2023", id: "sCz5y84dwuA", hook: 40, dur: 230, energy: 9 },
  { title: "Firestone", artist: "Kygo ft. Conrad Sewell", year: "2014", id: "9Sc-ir2UwGU", hook: 60, dur: 212, energy: 9 }
];

const hiphopSongs = [
  { title: "Goosebumps", artist: "Travis Scott", year: "2016", id: "Dst9gZkq1a8", hook: 45, dur: 243, energy: 10 },
  { title: "Sicko Mode", artist: "Travis Scott", year: "2018", id: "6ONRf7h3Mdk", hook: 60, dur: 312, energy: 10 },
  { title: "FE!N", artist: "Travis Scott ft. Playboi Carti", year: "2023", id: "B9synWjqBn8", hook: 40, dur: 191, energy: 10 },
  { title: "HIGHEST IN THE ROOM", artist: "Travis Scott", year: "2019", id: "tfSS1e3kYeo", hook: 32, dur: 176, energy: 9 },
  { title: "BUTTERFLY EFFECT", artist: "Travis Scott", year: "2017", id: "_EyZUTDAH0U", hook: 35, dur: 191, energy: 9 },
  { title: "God's Plan", artist: "Drake", year: "2018", id: "xpVfcZ0ZcFM", hook: 45, dur: 238, energy: 10 },
  { title: "One Dance", artist: "Drake ft. Wizkid & Kyla", year: "2016", id: "mym4sKoAnKs", hook: 40, dur: 174, energy: 9 },
  { title: "Hotline Bling", artist: "Drake", year: "2015", id: "uxpDa-c-4Mc", hook: 35, dur: 267, energy: 9 },
  { title: "In My Feelings", artist: "Drake", year: "2018", id: "DRS_PpOrUZ4", hook: 35, dur: 217, energy: 9 },
  { title: "Laugh Now Cry Later", artist: "Drake ft. Lil Durk", year: "2020", id: "JFm7YDVlqnI", hook: 38, dur: 261, energy: 9 },
  { title: "HUMBLE.", artist: "Kendrick Lamar", year: "2017", id: "tvTRZJ-4EyI", hook: 28, dur: 177, energy: 10 },
  { title: "Not Like Us", artist: "Kendrick Lamar", year: "2024", id: "H58vbez_m4E", hook: 32, dur: 274, energy: 10 },
  { title: "DNA.", artist: "Kendrick Lamar", year: "2017", id: "NLZRYQMLDW4", hook: 30, dur: 185, energy: 10 },
  { title: "Alright", artist: "Kendrick Lamar", year: "2015", id: "Z-48u_uWMHY", hook: 45, dur: 212, energy: 9 },
  { title: "Swimming Pools (Drank)", artist: "Kendrick Lamar", year: "2012", id: "8-ejyHzz3XE", hook: 45, dur: 247, energy: 9 },
  { title: "Lose Yourself", artist: "Eminem", year: "2002", id: "_Yhyp-_hX2s", hook: 53, dur: 326, energy: 10 },
  { title: "Without Me", artist: "Eminem", year: "2002", id: "YVkUvmDQ3HY", hook: 38, dur: 298, energy: 10 },
  { title: "The Real Slim Shady", artist: "Eminem", year: "2000", id: "eJO5HU_7_1w", hook: 32, dur: 284, energy: 10 },
  { title: "Circles", artist: "Post Malone", year: "2019", id: "wXhTHyIgQ_U", hook: 45, dur: 215, energy: 9 },
  { title: "Sunflower", artist: "Post Malone, Swae Lee", year: "2018", id: "ApXoWvfEYVU", hook: 35, dur: 158, energy: 9 },
  { title: "Rockstar", artist: "Post Malone ft. 21 Savage", year: "2017", id: "UceaB4D0jpo", hook: 38, dur: 218, energy: 10 },
  { title: "Congratulations", artist: "Post Malone ft. Quavo", year: "2016", id: "SC4xMk98Pdc", hook: 40, dur: 220, energy: 9 },
  { title: "Better Now", artist: "Post Malone", year: "2018", id: "UYwF-jdcVjY", hook: 32, dur: 231, energy: 9 },
  { title: "Industry Baby", artist: "Lil Nas X ft. Jack Harlow", year: "2021", id: "UTHLKHL_whs", hook: 35, dur: 212, energy: 10 },
  { title: "Old Town Road", artist: "Lil Nas X ft. Billy Ray Cyrus", year: "2019", id: "r7qovpFAGrQ", hook: 25, dur: 157, energy: 9 },
  { title: "Praise God", artist: "Kanye West", year: "2021", id: "9sJZOGxRxwM", hook: 40, dur: 226, energy: 10 },
  { title: "Can't Tell Me Nothing", artist: "Kanye West", year: "2007", id: "E58qLXBfLrs", hook: 40, dur: 271, energy: 10 },
  { title: "Stronger", artist: "Kanye West", year: "2007", id: "PsO6ZnUZI0g", hook: 45, dur: 311, energy: 10 },
  { title: "C.R.E.A.M.", artist: "Wu-Tang Clan", year: "1993", id: "PBwAxmrE194", hook: 40, dur: 252, energy: 10 },
  { title: "Hypnotize", artist: "The Notorious B.I.G.", year: "1997", id: "glEiPXAYE-U", hook: 30, dur: 230, energy: 10 },
  { title: "Juicy", artist: "The Notorious B.I.G.", year: "1994", id: "_JZom_gVfuw", hook: 35, dur: 251, energy: 10 },
  { title: "California Love", artist: "2Pac ft. Dr. Dre", year: "1995", id: "omfz62qu_Bc", hook: 38, dur: 285, energy: 10 },
  { title: "Changes", artist: "2Pac", year: "1998", id: "eXvBjCO19QY", hook: 40, dur: 269, energy: 9 },
  { title: "In Da Club", artist: "50 Cent", year: "2003", id: "5qm8PH4xAss", hook: 28, dur: 193, energy: 10 },
  { title: "Candy Shop", artist: "50 Cent ft. Olivia", year: "2005", id: "SRcnnId15BA", hook: 30, dur: 209, energy: 9 },
  { title: "Still D.R.E.", artist: "Dr. Dre ft. Snoop Dogg", year: "1999", id: "_CL6n0FJZpk", hook: 35, dur: 270, energy: 10 },
  { title: "The Next Episode", artist: "Dr. Dre ft. Snoop Dogg", year: "2000", id: "QZXc39hT8t4", hook: 30, dur: 161, energy: 10 },
  { title: "Gangsta's Paradise", artist: "Coolio ft. L.V.", year: "1995", id: "fPO76Jlnz6c", hook: 35, dur: 240, energy: 10 },
  { title: "First Class", artist: "Jack Harlow", year: "2022", id: "yQBImEeXNZ4", hook: 28, dur: 174, energy: 9 },
  { title: "Lovin On Me", artist: "Jack Harlow", year: "2023", id: "Iq8h3GEe22o", hook: 25, dur: 138, energy: 9 },
  { title: "WHATS POPPIN", artist: "Jack Harlow", year: "2020", id: "w9uWPBDHEKE", hook: 20, dur: 140, energy: 9 },
  { title: "Bank Account", artist: "21 Savage", year: "2017", id: "H1KBHFXm2Bg", hook: 30, dur: 220, energy: 9 },
  { title: "redrum", artist: "21 Savage", year: "2024", id: "U4mADkt6o-M", hook: 35, dur: 270, energy: 10 },
  { title: "Superhero (Heroes & Villains)", artist: "Metro Boomin, Future, Chris Brown", year: "2022", id: "_WCD3Z9UmJ4", hook: 42, dur: 182, energy: 10 },
  { title: "Creepin'", artist: "Metro Boomin, The Weeknd, 21 Savage", year: "2022", id: "61ymOWwOwuk", hook: 40, dur: 221, energy: 9 },
  { title: "Like That", artist: "Future, Metro Boomin, Kendrick Lamar", year: "2024", id: "N9bKBAA22Go", hook: 40, dur: 267, energy: 10 },
  { title: "Mask Off", artist: "Future", year: "2017", id: "xvZqHgFz51I", hook: 30, dur: 204, energy: 9 },
  { title: "Bodak Yellow", artist: "Cardi B", year: "2017", id: "PEGccV-NOm8", hook: 32, dur: 223, energy: 10 },
  { title: "Lucid Dreams", artist: "Juice WRLD", year: "2018", id: "mzB1VGEGcSU", hook: 30, dur: 239, energy: 9 },
  { title: "The Box", artist: "Roddy Ricch", year: "2019", id: "UNZqm3dxd2w", hook: 25, dur: 196, energy: 10 }
];

async function verifyAll() {
  console.log("Verifying 50 EDM + 50 Hip-Hop songs...");
  const seen = new Set();
  const output = {
    "english-edm": [],
    "english-hiphop": []
  };

  const allItems = [
    ...edmSongs.map(s => ({ ...s, cat: 'english-edm' })),
    ...hiphopSongs.map(s => ({ ...s, cat: 'english-hiphop' }))
  ];

  for (let idx = 0; idx < allItems.length; idx++) {
    const s = allItems[idx];
    if (seen.has(s.id)) {
      throw new Error(`Duplicate videoId found: ${s.id} for "${s.title}"`);
    }
    seen.add(s.id);

    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${s.id}&format=json`);
    if (!res.ok) {
      throw new Error(`Failed oEmbed for ${s.title} (${s.id}): status ${res.status}`);
    }
    const oembed = await res.json();
    console.log(`[${idx+1}/100] [${s.cat}] "${s.title}" -> "${oembed.title}" (${s.id})`);

    output[s.cat].push({
      title: s.title,
      artist: s.artist,
      year: s.year,
      durationSec: s.dur,
      hookStartSec: s.hook,
      hookEndSec: s.hook + 40,
      videoId: s.id,
      energy: s.energy
    });
  }

  const outDir = path.resolve('scripts/curated_batches');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'agent_7.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');

  console.log("\n================ SUCCESS ================");
  console.log(`Saved 100 perfectly curated and verified songs to: ${outPath}`);
  console.log(`english-edm: ${output["english-edm"].length}`);
  console.log(`english-hiphop: ${output["english-hiphop"].length}`);
  console.log(`Total unique verified video IDs: ${seen.size}`);
}

verifyAll().catch(e => {
  console.error("Verification failed:", e);
  process.exit(1);
});
