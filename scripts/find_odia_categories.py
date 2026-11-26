import re, json

with open('api/_lib/curated-songs-db.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Match export const CURATED_SONGS_DB = { ... }
# Look for category objects: "key": { "title": "...", "lang": "...", ... "tracks": [ ... ] }
cat_pattern = re.compile(r'"slug":\s*"([^"]+)",\s*"label":\s*"([^"]+)",\s*"lang":\s*"([^"]+)"')
matches = list(cat_pattern.finditer(text))
print(f"Total categories found: {len(matches)}")

for i, m in enumerate(matches):
    cat_key = m.group(1)
    cat_title = m.group(2)
    cat_lang = m.group(3)
    start = m.start()
    end = matches[i+1].start() if i+1 < len(matches) else len(text)
    chunk = text[start:end]
    
    # Check for odia keywords or odia language tracks
    odia_count = len(re.findall(r'odia', chunk, re.IGNORECASE))
    if odia_count > 0:
        print(f"Cat: {cat_key} | Title: {cat_title} | Lang: {cat_lang} | Odia mentions: {odia_count}")
