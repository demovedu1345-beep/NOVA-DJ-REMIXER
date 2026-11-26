import json
from collections import defaultdict

with open('public/js/engine/artists-db.js', 'r', encoding='utf-8') as f:
    text = f.read()

marker = 'export const ARTISTS_DB = '
idx = text.find(marker)
if idx != -1:
    end = text.rfind('};') + 1
    raw = text[idx + len(marker):end]
    artists = json.loads(raw)
    
    vid_to_tracks = defaultdict(list)
    for artist_id, a in artists.items():
        for s in a.get('songs', []):
            title = s.get('title')
            vid = s.get('videoId') or (s.get('youtube_ids', [None])[0])
            if vid:
                vid_to_tracks[vid].append((a.get('name'), title))

    print(f"Total artists: {len(artists)}")
    print(f"Total tracks: {sum(len(a.get('songs', [])) for a in artists.values())}")
    
    dupes = 0
    for vid, tlist in vid_to_tracks.items():
        distinct_titles = set(f"{a} - {t}" for a, t in tlist)
        if len(distinct_titles) > 1:
            dupes += 1
            print(f"Video {vid} used for {len(distinct_titles)} tracks: {list(distinct_titles)[:4]}")
    print(f"Total shared video IDs across distinct artist tracks: {dupes}")
