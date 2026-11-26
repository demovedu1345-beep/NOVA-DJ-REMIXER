import re

with open('api/_lib/curated-songs-db.js', 'r', encoding='utf-8') as f:
    text = f.read()

m = text.find('"english-rock":')
end = text.find('  "english-rnb":', m)
section = text[m:end]

# Find songs in this section
songs = re.findall(r'\{\s*"id":\s*"([^"]+)",\s*"title":\s*"([^"]+)",\s*"artist":\s*"([^"]+)"', section)
for sid, title, artist in songs:
    if any(k in artist.lower() or k in title.lower() for k in ['shankar', 'kanika', 'sunidhi', 'lungi', 'honey singh', 'diljit', 'dance pe']):
        print(f"{sid}: {title} by {artist}")
