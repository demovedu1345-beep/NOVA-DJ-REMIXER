import json
from collections import defaultdict

with open('public/js/engine/artists-db.js', 'r', encoding='utf-8') as f:
    text = f.read()

marker = 'export const ARTISTS_DB = '
idx = text.find(marker)
end_marker = '\n};\n\nexport function'
end_idx = text.find(end_marker, idx)
raw = text[idx + len(marker):end_idx + 2]
artists_db = json.loads(raw)

vid_to_tracks = defaultdict(list)
for lang, artists in artists_db.items():
    print(f"=== Language: {lang} ({len(artists)} artists) ===")
    for a_id, a in artists.items():
        songs = a.get('songs', [])
        print(f"  {a.get('name')}: {len(songs)} songs")
        for s in songs:
            title = s.get('title')
            vid = s.get('videoId') or (s.get('youtube_ids', [None])[0])
            if vid:
                vid_to_tracks[vid].append((a.get('name'), title))

print(f"\nTotal video IDs across all artists: {len(vid_to_tracks)}")
dupes = 0
for vid, tlist in vid_to_tracks.items():
    distinct_titles = set(f"{a} - {t}" for a, t in tlist)
    if len(distinct_titles) > 1:
        dupes += 1
        print(f"Video {vid} used for {len(distinct_titles)} tracks: {list(distinct_titles)}")
print(f"\nTotal duplicate video IDs across artists: {dupes}")
