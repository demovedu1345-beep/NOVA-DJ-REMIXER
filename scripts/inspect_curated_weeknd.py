import re

with open('public/js/engine/curated-songs-db.js', 'r', encoding='utf-8') as f:
    text = f.read()

matches = list(re.finditer(r'"title":\s*"([^"]+)",\s*"artist":\s*"([^"]*The Weeknd[^"]*)",.*?videoId":\s*"([^"]+)"', text, re.DOTALL))
print(f"Total Weeknd songs in curated-songs-db.js: {len(matches)}")
for m in matches:
    print(f"'{m.group(1)}' by '{m.group(2)}' -> vid: {m.group(3)}")
