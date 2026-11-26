import json, re

with open('api/_lib/curated-songs-db.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Find start of CURATED_CATEGORIES_DB = {
start_idx = text.find('CURATED_CATEGORIES_DB = {')
if start_idx == -1:
    print("Could not find CURATED_CATEGORIES_DB")
    exit(1)

# Let's inspect Hindi categories
# We can find all keys and extract their objects
cat_pattern = re.compile(r'"([a-zA-Z0-9_\-]+)":\s*\{\s*"slug":\s*"([^"]+)",(?:[^}]*?)"lang":\s*"([^"]+)"')
matches = list(cat_pattern.finditer(text))

ODIA_KEYWORDS = [
    'odia', 'sambalpuri', 'odisha', 'jhia', 'badmas', 'mahua', 'kalia re kalia', 
    'rathayatra', 'danda', 'rangabati', 'asima panda', 'humane sagar', 'mantu chhuria',
    'satyajeet pradhan', 'tariq aziz', 'prabin', 'kuldeep pattanaik', 'ananya sritam nanda',
    'namita agrawal', 'babul supriyo odia', 'ira mohanty', 'subhashree', 'papu pom pom'
]

flagged = []

for i, m in enumerate(matches):
    cat_key = m.group(1)
    cat_lang = m.group(3)
    if cat_lang != 'hindi':
        continue
    start = m.start()
    end = matches[i+1].start() if i+1 < len(matches) else len(text)
    chunk = text[start:end]
    
    # Search for any song in this category that matches odia keywords
    song_pattern = re.compile(r'\{\s*"id":\s*"([^"]+)",\s*"title":\s*"([^"]+)",\s*"artist":\s*"([^"]+)",(?:[^}]*?)"videoId":\s*"([^"]+)"')
    for sm in song_pattern.finditer(chunk):
        sid = sm.group(1)
        stitle = sm.group(2)
        sartist = sm.group(3)
        svid = sm.group(4)
        full_song_str = f"{stitle} {sartist}".lower()
        for kw in ODIA_KEYWORDS:
            if kw in full_song_str:
                flagged.append({
                    "cat": cat_key,
                    "id": sid,
                    "title": stitle,
                    "artist": sartist,
                    "videoId": svid,
                    "matched": kw
                })

print(f"Total flagged Odia/regional songs in Hindi categories: {len(flagged)}")
for item in flagged:
    print(f"[{item['cat']}] {item['title']} - {item['artist']} (Matched: {item['matched']}, Vid: {item['videoId']})")
