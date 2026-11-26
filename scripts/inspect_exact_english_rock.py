import re

with open('api/_lib/curated-songs-db.js', 'r', encoding='utf-8') as f:
    text = f.read()

m = text.find('"english-rock":')
m_next = text.find('\n  "', m + 20)
rock_section = text[m:m_next]

songs = re.findall(r'"title":\s*"([^"]+)",\s*"artist":\s*"([^"]+)"', rock_section)
print(f"Total songs in english-rock: {len(songs)}")
for i, (t, a) in enumerate(songs[:25]):
    print(f"  {i+1}. {t} by {a}")
