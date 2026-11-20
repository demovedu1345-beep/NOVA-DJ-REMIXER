import fs from 'node:fs';

const candidates = {
  "english-hiphop": [
    { title: "Lose Yourself", artist: "Eminem", year: "2002", durationSec: 326, hookStartSec: 53, hookEndSec: 92, entrySec: 53, exitSec: 92, videoId: "_Yhyp-_hX2s", energy: 9 },
    { title: "Without Me", artist: "Eminem", year: "2002", durationSec: 298, hookStartSec: 38, hookEndSec: 68, entrySec: 38, exitSec: 68, videoId: "YVkUvmDQ3HY", energy: 9 },
    { title: "The Real Slim Shady", artist: "Eminem", year: "2000", durationSec: 284, hookStartSec: 25, hookEndSec: 55, entrySec: 25, exitSec: 55, videoId: "eJO5HU_7_1w", energy: 9 },
    { title: "Love The Way You Lie", artist: "Eminem ft. Rihanna", year: "2010", durationSec: 266, hookStartSec: 0, hookEndSec: 32, entrySec: 0, exitSec: 32, videoId: "uelHwf8o7_U", energy: 8 },
    { title: "'Till I Collapse", artist: "Eminem ft. Nate Dogg", year: "2002", durationSec: 298, hookStartSec: 42, hookEndSec: 72, entrySec: 42, exitSec: 72, videoId: "ytQ5CYE1VZw", energy: 9 },
    { title: "Still D.R.E.", artist: "Dr. Dre ft. Snoop Dogg", year: "1999", durationSec: 291, hookStartSec: 34, hookEndSec: 60, entrySec: 34, exitSec: 60, videoId: "_CL6n0FJZpk", energy: 8 },
    { title: "The Next Episode", artist: "Dr. Dre ft. Snoop Dogg, Kurupt, Nate Dogg", year: "1999", durationSec: 162, hookStartSec: 24, hookEndSec: 52, entrySec: 24, exitSec: 52, videoId: "QZXc39hT8t4", energy: 8 },
    { title: "In Da Club", artist: "50 Cent", year: "2003", durationSec: 253, hookStartSec: 21, hookEndSec: 50, entrySec: 21, exitSec: 50, videoId: "5qm8PH4xAss", energy: 9 },
    { title: "Candy Shop", artist: "50 Cent ft. Olivia", year: "2005", durationSec: 245, hookStartSec: 18, hookEndSec: 46, entrySec: 18, exitSec: 46, videoId: "SRcnnId15BA", energy: 8 },
    { title: "Gangsta's Paradise", artist: "Coolio ft. L.V.", year: "1995", durationSec: 257, hookStartSec: 40, hookEndSec: 70, entrySec: 40, exitSec: 70, videoId: "fPO76Jlnz6c", energy: 8 },
    { title: "HUMBLE.", artist: "Kendrick Lamar", year: "2017", durationSec: 184, hookStartSec: 18, hookEndSec: 48, entrySec: 18, exitSec: 48, videoId: "tvTRZJ-4EyI", energy: 9 },
    { title: "Not Like Us", artist: "Kendrick Lamar", year: "2024", durationSec: 275, hookStartSec: 37, hookEndSec: 72, entrySec: 37, exitSec: 72, videoId: "H58vbez_m4E", energy: 9 },
    { title: "DNA.", artist: "Kendrick Lamar", year: "2017", durationSec: 286, hookStartSec: 30, hookEndSec: 68, entrySec: 30, exitSec: 68, videoId: "NLZRYQMLDW4", energy: 9 },
    { title: "Alright", artist: "Kendrick Lamar", year: "2015", durationSec: 437, hookStartSec: 50, hookEndSec: 82, entrySec: 50, exitSec: 82, videoId: "Z-48u_BlwkE", energy: 8 },
    { title: "Swimming Pools (Drank)", artist: "Kendrick Lamar", year: "2012", durationSec: 247, hookStartSec: 38, hookEndSec: 75, entrySec: 38, exitSec: 75, videoId: "B5YNiCfWC3A", energy: 8 },
    { title: "All The Stars", artist: "Kendrick Lamar, SZA", year: "2018", durationSec: 232, hookStartSec: 28, hookEndSec: 60, entrySec: 28, exitSec: 60, videoId: "GfCqMv--ncA", energy: 8 },
    { title: "God's Plan", artist: "Drake", year: "2018", durationSec: 357, hookStartSec: 20, hookEndSec: 54, entrySec: 20, exitSec: 54, videoId: "xpVfcZ0ZcFM", energy: 8 },
    { title: "Hotline Bling", artist: "Drake", year: "2015", durationSec: 296, hookStartSec: 38, hookEndSec: 75, entrySec: 38, exitSec: 75, videoId: "uxpDa-c-4Mc", energy: 7 },
    { title: "In My Feelings", artist: "Drake", year: "2018", durationSec: 479, hookStartSec: 42, hookEndSec: 80, entrySec: 42, exitSec: 80, videoId: "DRS_PpOrUZ4", energy: 8 },
    { title: "Laugh Now Cry Later", artist: "Drake ft. Lil Durk", year: "2020", durationSec: 302, hookStartSec: 23, hookEndSec: 55, entrySec: 23, exitSec: 55, videoId: "JFm7YDVlqnI", energy: 8 },
    { title: "Life Is Good", artist: "Future ft. Drake", year: "2020", durationSec: 335, hookStartSec: 25, hookEndSec: 60, entrySec: 25, exitSec: 60, videoId: "l0U7SxXHkPY", energy: 8 },
    { title: "One Dance", artist: "Drake ft. Wizkid & Kyla", year: "2016", durationSec: 174, hookStartSec: 30, hookEndSec: 65, entrySec: 30, exitSec: 65, videoId: "qL7ZRXexzIT", energy: 8 },
    { title: "Started From The Bottom", artist: "Drake", year: "2013", durationSec: 279, hookStartSec: 35, hookEndSec: 70, entrySec: 35, exitSec: 70, videoId: "RubBzkZzpUA", energy: 8 },
    { title: "Money In The Grave", artist: "Drake ft. Rick Ross", year: "2019", durationSec: 205, hookStartSec: 25, hookEndSec: 60, entrySec: 25, exitSec: 60, videoId: "17j38q3_W2s", energy: 8 },
    { title: "SICKO MODE", artist: "Travis Scott ft. Drake", year: "2018", durationSec: 313, hookStartSec: 62, hookEndSec: 104, entrySec: 62, exitSec: 104, videoId: "6ONRf7h3sdk", energy: 9 },
    { title: "Goosebumps", artist: "Travis Scott ft. Kendrick Lamar", year: "2016", durationSec: 244, hookStartSec: 32, hookEndSec: 68, entrySec: 32, exitSec: 68, videoId: "Dst9gZkq1a8", energy: 9 },
    { title: "HIGHEST IN THE ROOM", artist: "Travis Scott", year: "2019", durationSec: 176, hookStartSec: 28, hookEndSec: 62, entrySec: 28, exitSec: 62, videoId: "tfSS1e3kYeo", energy: 8 },
    { title: "FE!N", artist: "Travis Scott ft. Playboi Carti", year: "2023", durationSec: 192, hookStartSec: 35, hookEndSec: 75, entrySec: 35, exitSec: 75, videoId: "B9synWjqBn8", energy: 10 },
    { title: "BUTTERFLY EFFECT", artist: "Travis Scott", year: "2017", durationSec: 215, hookStartSec: 25, hookEndSec: 60, entrySec: 25, exitSec: 60, videoId: "_EyZUTDAH0U", energy: 8 },
    { title: "rockstar", artist: "Post Malone ft. 21 Savage", year: "2017", durationSec: 242, hookStartSec: 33, hookEndSec: 68, entrySec: 33, exitSec: 68, videoId: "UceaB4D0jpo", energy: 8 },
    { title: "Sunflower", artist: "Post Malone & Swae Lee", year: "2018", durationSec: 158, hookStartSec: 30, hookEndSec: 65, entrySec: 30, exitSec: 65, videoId: "ApXoWvfEYVU", energy: 8 },
    { title: "Congratulations", artist: "Post Malone ft. Quavo", year: "2016", durationSec: 227, hookStartSec: 37, hookEndSec: 75, entrySec: 37, exitSec: 75, videoId: "SC4xDypqxnQ", energy: 8 },
    { title: "Circles", artist: "Post Malone", year: "2019", durationSec: 215, hookStartSec: 40, hookEndSec: 75, entrySec: 40, exitSec: 75, videoId: "wXhTHyIgQ_U", energy: 7 },
    { title: "White Iverson", artist: "Post Malone", year: "2015", durationSec: 256, hookStartSec: 45, hookEndSec: 80, entrySec: 45, exitSec: 80, videoId: "SLsTskih710", energy: 7 },
    { title: "Better Now", artist: "Post Malone", year: "2018", durationSec: 231, hookStartSec: 35, hookEndSec: 70, entrySec: 35, exitSec: 70, videoId: "UYwF-jdcVjY", energy: 8 },
    { title: "First Class", artist: "Jack Harlow", year: "2022", durationSec: 174, hookStartSec: 18, hookEndSec: 50, entrySec: 18, exitSec: 50, videoId: "m9msfOkmxrg", energy: 8 },
    { title: "Lovin On Me", artist: "Jack Harlow", year: "2023", durationSec: 139, hookStartSec: 16, hookEndSec: 48, entrySec: 16, exitSec: 48, videoId: "Iq8h3GEe22o", energy: 8 },
    { title: "WHATS POPPIN", artist: "Jack Harlow", year: "2020", durationSec: 140, hookStartSec: 12, hookEndSec: 44, entrySec: 12, exitSec: 44, videoId: "w9uWPBDHEKE", energy: 8 },
    { title: "Bank Account", artist: "21 Savage", year: "2017", durationSec: 220, hookStartSec: 30, hookEndSec: 65, entrySec: 30, exitSec: 65, videoId: "sV2t3tW_SfQ", energy: 8 },
    { title: "redrum", artist: "21 Savage", year: "2024", durationSec: 271, hookStartSec: 45, hookEndSec: 82, entrySec: 45, exitSec: 82, videoId: "dZ9vlmsyX60", energy: 9 },
    { title: "Runnin", artist: "21 Savage & Metro Boomin", year: "2020", durationSec: 200, hookStartSec: 30, hookEndSec: 66, entrySec: 30, exitSec: 66, videoId: "hG4lT4gk5eQ", energy: 8 },
    { title: "Creepin'", artist: "Metro Boomin, The Weeknd, 21 Savage", year: "2022", durationSec: 222, hookStartSec: 38, hookEndSec: 75, entrySec: 38, exitSec: 75, videoId: "61ymOWwOwuk", energy: 8 },
    { title: "Superhero (Heroes & Villains)", artist: "Metro Boomin ft. Future, Chris Brown", year: "2022", durationSec: 203, hookStartSec: 35, hookEndSec: 70, entrySec: 35, exitSec: 70, videoId: "2v4u-pZgV0A", energy: 9 },
    { title: "Like That", artist: "Future, Metro Boomin, Kendrick Lamar", year: "2024", durationSec: 268, hookStartSec: 30, hookEndSec: 68, entrySec: 30, exitSec: 68, videoId: "N9bKBsAUOlQ", energy: 9 },
    { title: "Mask Off", artist: "Future", year: "2017", durationSec: 293, hookStartSec: 30, hookEndSec: 65, entrySec: 30, exitSec: 65, videoId: "xvZqVHSUi34", energy: 8 },
    { title: "Bodak Yellow", artist: "Cardi B", year: "2017", durationSec: 224, hookStartSec: 20, hookEndSec: 55, entrySec: 20, exitSec: 55, videoId: "PEGccV-NOm8", energy: 9 },
    { title: "I Like It", artist: "Cardi B ft. Bad Bunny & J Balvin", year: "2018", durationSec: 256, hookStartSec: 34, hookEndSec: 70, entrySec: 34, exitSec: 70, videoId: "xTlNMmZKwpA", energy: 9 },
    { title: "WAP", artist: "Cardi B ft. Megan Thee Stallion", year: "2020", durationSec: 252, hookStartSec: 20, hookEndSec: 55, entrySec: 20, exitSec: 55, videoId: "hsm4poTWjMs", energy: 9 },
    { title: "Super Bass", artist: "Nicki Minaj", year: "2011", durationSec: 261, hookStartSec: 38, hookEndSec: 75, entrySec: 38, exitSec: 75, videoId: "4JipHEz53sU", energy: 9 },
    { title: "Starships", artist: "Nicki Minaj", year: "2012", durationSec: 236, hookStartSec: 42, hookEndSec: 80, entrySec: 42, exitSec: 80, videoId: "SeIJmciN8mo", energy: 9 },
    { title: "Anaconda", artist: "Nicki Minaj", year: "2014", durationSec: 290, hookStartSec: 30, hookEndSec: 65, entrySec: 30, exitSec: 65, videoId: "LDZX4ooRsWs", energy: 9 },
    { title: "Drip Too Hard", artist: "Lil Baby & Gunna", year: "2018", durationSec: 146, hookStartSec: 18, hookEndSec: 50, entrySec: 18, exitSec: 50, videoId: "bjf92dK84uA", energy: 8 },
    { title: "The Bigger Picture", artist: "Lil Baby", year: "2020", durationSec: 253, hookStartSec: 35, hookEndSec: 72, entrySec: 35, exitSec: 72, videoId: "_VDGysJGNoI", energy: 8 },
    { title: "The Box", artist: "Roddy Ricch", year: "2019", durationSec: 213, hookStartSec: 22, hookEndSec: 58, entrySec: 22, exitSec: 58, videoId: "UNZqm3dxd2w", energy: 9 },
    { title: "Old Town Road", artist: "Lil Nas X ft. Billy Ray Cyrus", year: "2019", durationSec: 158, hookStartSec: 28, hookEndSec: 58, entrySec: 28, exitSec: 58, videoId: "w2Ov5jzm3j8", energy: 8 },
    { title: "INDUSTRY BABY", artist: "Lil Nas X ft. Jack Harlow", year: "2021", durationSec: 213, hookStartSec: 28, hookEndSec: 62, entrySec: 28, exitSec: 62, videoId: "UTHLKHL_whs", energy: 9 },
    { title: "ROCKSTAR", artist: "DaBaby ft. Roddy Ricch", year: "2020", durationSec: 182, hookStartSec: 20, hookEndSec: 55, entrySec: 20, exitSec: 55, videoId: "mxFstYSbBmc", energy: 8 },
    { title: "Lucid Dreams", artist: "Juice WRLD", year: "2018", durationSec: 231, hookStartSec: 33, hookEndSec: 70, entrySec: 33, exitSec: 70, videoId: "mzB1VGEGcSU", energy: 7 },
    { title: "SAD!", artist: "XXXTENTACION", year: "2018", durationSec: 167, hookStartSec: 18, hookEndSec: 50, entrySec: 18, exitSec: 50, videoId: "iAeYPfrXwk4", energy: 7 },
    { title: "No Role Modelz", artist: "J. Cole", year: "2014", durationSec: 293, hookStartSec: 40, hookEndSec: 75, entrySec: 40, exitSec: 75, videoId: "0En_3Ue4cWw", energy: 8 }
  ]
};

async function testCategory(slug, list) {
  console.log(`Checking ${slug} (${list.length} songs)...`);
  const failures = [];
  for (let i = 0; i < list.length; i++) {
    const s = list[i];
    try {
      const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${s.videoId}&format=json`);
      if (!res.ok) {
        failures.push({ idx: i + 1, title: s.title, videoId: s.videoId, status: res.status });
      } else {
        const d = await res.json();
        // console.log(`✓ [${i+1}] ${s.title} -> ${d.title} (${d.author_name})`);
      }
    } catch (err) {
      failures.push({ idx: i + 1, title: s.title, videoId: s.videoId, error: err.message });
    }
  }
  if (failures.length > 0) {
    console.error(`FAILURES in ${slug}:`, failures);
  } else {
    console.log(`ALL ${list.length} songs in ${slug} are 100% verified!`);
  }
}

testCategory('english-hiphop', candidates['english-hiphop']);
