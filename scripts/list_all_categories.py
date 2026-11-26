import re

with open('api/_lib/curated-songs-db.js', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = re.compile(r'"([a-zA-Z0-9_\-]+)":\s*\{\s*"slug":\s*"([^"]+)",(?:[^}]*?)"lang":\s*"([^"]+)"')
matches = list(pattern.finditer(text))
print(f"Total categories: {len(matches)}")
for m in matches:
    print(f"{m.group(1)} | {m.group(3)}")
