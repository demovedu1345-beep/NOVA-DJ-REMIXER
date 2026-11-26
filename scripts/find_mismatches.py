import json
from collections import defaultdict

def check_file(path):
    print(f"\n=================== Checking {path} ===================")
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    
    # Strip JS variable export if present
    if text.startswith('export const') or text.startswith('const '):
        eq_pos = text.find('=')
        text_json = text[eq_pos+1:].strip()
        if text_json.endswith(';'):
            text_json = text_json[:-1].strip()
    else:
        text_json = text

    try:
        data = json.loads(text_json)
    except Exception as e:
        print(f"Error loading json: {e}")
        return

    vid_to_songs = defaultdict(list)
    
    # If dict of artists
    if isinstance(data, dict):
        for key, val in data.items():
            songs = val.get('songs', []) if isinstance(val, dict) else []
            for s in songs:
                title = s.get('title')
                artist = s.get('artist') or key
                vid = s.get('videoId') or (s.get('youtube_ids', [None])[0])
                if vid:
                    vid_to_songs[vid].append((artist, title))

    # Print any video ID mapped to > 1 distinct title
    dupes = 0
    for vid, slist in vid_to_songs.items():
        distinct_titles = set(t for a, t in slist)
        if len(distinct_titles) > 1:
            dupes += 1
            if dupes <= 25:
                print(f"Video {vid} used for {len(distinct_titles)} titles: {list(distinct_titles)[:5]}")
    print(f"Total video IDs used across multiple titles: {dupes}")

check_file('public/js/engine/artists-db.js')
check_file('public/js/engine/curated-songs-db.js')
