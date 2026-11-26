import re
from collections import defaultdict

with open('public/js/engine/curated-songs-db.js', 'r', encoding='utf-8') as f:
    text = f.read()

vid_map = defaultdict(list)
for match in re.finditer(r'"title":\s*"([^"]+)",\s*"artist":\s*"([^"]+)",.*?videoId":\s*"([^"]+)"', text, re.DOTALL):
    title = match.group(1)
    artist = match.group(2)
    vid = match.group(3)
    vid_map[vid].append(f"{title} - {artist}")

print(f"Total unique video IDs: {len(vid_map)}")
dupes = {v: songs for v, songs in vid_map.items() if len(songs) > 1}
print(f"Duplicate video IDs count: {len(dupes)}")
top_dupes = sorted(dupes.items(), key=lambda x: len(x[1]), reverse=True)[:10]
for v, songs in top_dupes:
    print(f"Video {v} used for {len(songs)} songs:")
    for s in songs[:5]:
        print(f"   {s}")
