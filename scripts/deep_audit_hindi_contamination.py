import re, json

with open('api/_lib/curated-songs-db.js', 'r', encoding='utf-8') as f:
    text = f.read()

cat_pattern = re.compile(r'"([a-zA-Z0-9_\-]+)":\s*\{\s*"slug":\s*"([^"]+)",(?:[^}]*?)"lang":\s*"([^"]+)"')
matches = list(cat_pattern.finditer(text))

REGIONAL_SUSPECT_WORDS = [
    # Odia / Sambalpuri
    'odia', 'sambalpuri', 'odisha', 'jhia', 'badmas', 'mahua', 'kalia re kalia', 
    'rathayatra', 'danda', 'rangabati', 'asima panda', 'humane sagar', 'mantu chhuria',
    'satyajeet pradhan', 'tariq aziz', 'kuldeep pattanaik', 'ananya sritam nanda',
    'namita agrawal', 'ira mohanty', 'ollywood', 'chheli chara', 'rourkela', 'baje ghadghadi',
    # Bhojpuri / Haryanvi
    'bhojpuri', 'haryanvi', 'khesari', 'pawan singh', 'shilpi raj', 'dinesh lal', 'nirahua',
    'sapna choudhary', 'gulzaar chhaniwala', 'masakali haryanvi', 'bhojpuriya',
    # Marathi
    'marathi', 'lavani', 'zingaat marathi', 'ajay atul marathi', 'swapnil bandodkar', 
    'adityaraj', 'prathamesh laghate', 'kolhapur',
    # Gujarati
    'gujarati', 'garba', 'dandiya', 'kinjal dave', 'geeta rabari', 'kirtidan gadhvi',
    # South (Tamil, Telugu, Kannada, Malayalam)
    'tamil', 'telugu', 'kannada', 'malayalam', 'kollywood', 'tollywood', 'sandalwood',
    'anirudh tamil', 'thaman s telugu', 'sid sriram telugu', 'dsp telugu'
]

results = []

for i, m in enumerate(matches):
    cat_key = m.group(1)
    cat_lang = m.group(3)
    if cat_lang != 'hindi':
        continue
    start = m.start()
    end = matches[i+1].start() if i+1 < len(matches) else len(text)
    chunk = text[start:end]
    
    song_pattern = re.compile(r'\{\s*"id":\s*"([^"]+)",\s*"title":\s*"([^"]+)",\s*"artist":\s*"([^"]+)",(?:[^}]*?)"videoId":\s*"([^"]+)"')
    for sm in song_pattern.finditer(chunk):
        sid = sm.group(1)
        stitle = sm.group(2)
        sartist = sm.group(3)
        svid = sm.group(4)
        full_song_str = f"{stitle} {sartist}".lower()
        for kw in REGIONAL_SUSPECT_WORDS:
            if kw in full_song_str:
                results.append({
                    "cat": cat_key,
                    "id": sid,
                    "title": stitle,
                    "artist": sartist,
                    "videoId": svid,
                    "keyword": kw
                })
                break

print(f"Total non-Hindi regional tracks found in Hindi categories: {len(results)}")
# Group by category
from collections import defaultdict
by_cat = defaultdict(list)
for r in results:
    by_cat[r['cat']].append(r)

for cat, songs in by_cat.items():
    print(f"\n--- {cat} ({len(songs)} flagged songs) ---")
    for s in songs[:10]:
        print(f"  * {s['title']} - {s['artist']} (KW: {s['keyword']})")
    if len(songs) > 10:
        print(f"  ... and {len(songs)-10} more")
