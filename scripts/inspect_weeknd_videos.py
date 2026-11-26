import re

for filepath in ['api/_lib/curated-songs-db.js', 'api/_lib/artists-db.js']:
    print(f"\nChecking Weeknd in {filepath}:")
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()
    
    matches = re.findall(r'\{\s*"id":\s*"([^"]+)",\s*"title":\s*"([^"]+)",\s*"artist":\s*"([^"]+)"[^\}]+"videoId":\s*"([^"]+)"', text)
    weeknd_songs = [m for m in matches if 'weeknd' in m[2].lower() or 'weeknd' in m[1].lower()]
    print(f"Found {len(weeknd_songs)} Weeknd songs:")
    for sid, t, a, vid in weeknd_songs:
        print(f"  [{sid}] {t} by {a} -> {vid}")
