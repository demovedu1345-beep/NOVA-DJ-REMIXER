with open(r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\api\_lib\curated-songs-db.js", "r", encoding="utf-8") as f:
    text = f.read()

import re

# Let's inspect the unique artists in english-classical, english-jazz, english-metal, english-country
for cat_name in ['english-classical', 'english-jazz', 'english-metal', 'english-country', 'english-gospel', 'english-rock', 'english-pop', 'english-hiphop', 'english-edm']:
    m = re.search(r'"' + cat_name + r'":\s*\{.*?"songs":\s*\[(.*?)\]\s*\}', text, re.DOTALL)
    if m:
        songs_block = m.group(1)
        songs = re.findall(r'\{\s*"id":\s*"[^"]+",\s*"title":\s*"([^"]+)",\s*"artist":\s*"([^"]+)"', songs_block)
        print(f"=== {cat_name} (Total songs: {len(songs)}) ===")
        # Print first 5 and last 5 songs
        for title, artist in songs[:3]:
            print(f"  [START] {title} - {artist}")
        for title, artist in songs[-3:]:
            print(f"  [END] {title} - {artist}")
