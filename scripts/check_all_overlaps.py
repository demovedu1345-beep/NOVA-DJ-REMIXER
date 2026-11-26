import re

with open('api/_lib/curated-songs-db.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Collect all categories
cat_pattern = re.compile(r'"([a-zA-Z0-9_\-]+)":\s*\{\s*"slug":\s*"([^"]+)",(?:[^}]*?)"lang":\s*"([^"]+)"')
matches = list(cat_pattern.finditer(text))

categories = {}
for i, m in enumerate(matches):
    ckey = m.group(1)
    clang = m.group(3)
    start = m.start()
    end = matches[i+1].start() if i+1 < len(matches) else len(text)
    chunk = text[start:end]
    songs = []
    song_pattern = re.compile(r'\{\s*"id":\s*"([^"]+)",\s*"title":\s*"([^"]+)",\s*"artist":\s*"([^"]+)",(?:[^}]*?)"videoId":\s*"([^"]+)"')
    for sm in song_pattern.finditer(chunk):
        songs.append({
            "id": sm.group(1),
            "title": sm.group(2),
            "artist": sm.group(3),
            "videoId": sm.group(4)
        })
    categories[ckey] = {"lang": clang, "songs": songs}

print(f"Total categories loaded: {len(categories)}")

# Check each regional category vs Hindi categories
regional_langs = ['odia', 'south', 'haryanvi-bhojpuri', 'gujarati', 'marathi', 'marwadi', 'kannada']
for rlang in regional_langs:
    # Find all songs in this regional lang
    r_songs = []
    for ckey, cdata in categories.items():
        if cdata['lang'] == rlang:
            r_songs.extend(cdata['songs'])
    r_vids = {s['videoId']: s for s in r_songs}
    r_titles = {s['title'].lower().strip(): s for s in r_songs}
    
    # Check Hindi categories
    found_in_hindi = []
    for ckey, cdata in categories.items():
        if cdata['lang'] == 'hindi':
            for s in cdata['songs']:
                if s['videoId'] in r_vids or s['title'].lower().strip() in r_titles:
                    found_in_hindi.append((ckey, s))
    
    if found_in_hindi:
        print(f"Lang '{rlang}': found {len(found_in_hindi)} overlapping songs in Hindi categories!")
        for ckey, s in found_in_hindi[:5]:
            print(f"   [{ckey}] {s['title']} - {s['artist']} ({s['videoId']})")
