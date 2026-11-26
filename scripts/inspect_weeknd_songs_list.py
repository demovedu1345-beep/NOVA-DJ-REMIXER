with open('public/js/engine/artists-db.js', 'r', encoding='utf-8') as f:
    text = f.read()

import re
idx = text.find('"the-weeknd":')
idx_next = text.find('},\n    "', idx + 20)
chunk = text[idx:idx_next]

for match in re.finditer(r'"title":\s*"([^"]+)",\s*"artist":\s*"([^"]+)",.*?videoId":\s*"([^"]+)"', chunk, re.DOTALL):
    print(f"Title: {match.group(1)} | Artist: {match.group(2)} | videoId: {match.group(3)}")
