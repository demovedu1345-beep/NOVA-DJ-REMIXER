import json

def verify_artists_weeknd(path):
    print(f"=== Checking {path} ===")
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    marker = 'export const ARTISTS_DB = '
    idx = text.find(marker)
    end_marker = '\n};\n\nexport function'
    end_idx = text.find(end_marker, idx)
    raw = text[idx + len(marker):end_idx + 2].strip()
    if raw.endswith(';'): raw = raw[:-1].strip()
    db = json.loads(raw)
    weeknd = db.get('english', {}).get('the-weeknd')
    if not weeknd:
        print("Weeknd not found!")
        return
    for s in weeknd.get('songs', []):
        print(f"  {s.get('title')}: videoId={s.get('videoId')}, youtube_ids={s.get('youtube_ids')}")

verify_artists_weeknd('public/js/engine/artists-db.js')
verify_artists_weeknd('api/_lib/artists-db.js')
