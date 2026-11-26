import re

with open('api/_lib/curated-songs-db.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's inspect videoId duplicates across the entire database
vid_matches = re.findall(r'"title":\s*"([^"]+)",\s*"artist":\s*"([^"]+)"[^\}]+"videoId":\s*"([^"]+)"', text)
print(f"Total song entries: {len(vid_matches)}")

# Check how many distinct videoIds exist
from collections import defaultdict
vid_to_songs = defaultdict(list)
for title, artist, vid in vid_matches:
    vid_to_songs[vid].append((title, artist))

print(f"Distinct videoIds: {len(vid_to_songs)}")
mismatched_vids = []
for vid, songs in vid_to_songs.items():
    titles = set(s[0].lower().strip() for s in songs)
    if len(titles) > 1:
        # Check if they are actually different songs or just slight title variations
        mismatched_vids.append((vid, songs))

print(f"Video IDs shared across different song titles: {len(mismatched_vids)}")
for vid, songs in mismatched_vids[:15]:
    print(f"\nVideo ID {vid}:")
    for t, a in set(songs):
        print(f"  - '{t}' by '{a}'")
