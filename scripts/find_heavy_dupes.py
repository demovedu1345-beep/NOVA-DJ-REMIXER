import re
from collections import defaultdict
import urllib.request
import json

with open('api/_lib/curated-songs-db.js', 'r', encoding='utf-8') as f:
    text = f.read()

vid_matches = re.findall(r'"title":\s*"([^"]+)",\s*"artist":\s*"([^"]+)"[^\}]+"videoId":\s*"([^"]+)"', text)

vid_to_songs = defaultdict(list)
for title, artist, vid in vid_matches:
    vid_to_songs[vid].append((title, artist))

heavy_dupes = []
for vid, songs in vid_to_songs.items():
    distinct_titles = set(s[0].strip().lower() for s in songs)
    if len(distinct_titles) > 3:
        heavy_dupes.append((vid, len(distinct_titles), len(songs), list(distinct_titles)[:5]))

heavy_dupes.sort(key=lambda x: x[1], reverse=True)
print(f"Total video IDs repeated across >3 distinct song titles: {len(heavy_dupes)}")
for vid, count, total_occur, sample in heavy_dupes:
    print(f"Video {vid}: {count} distinct titles, {total_occur} total usages. Sample: {sample}")
