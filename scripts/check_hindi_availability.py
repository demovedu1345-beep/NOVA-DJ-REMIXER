import json
from collections import defaultdict

with open('api/_lib/curated-songs-db.js', 'r', encoding='utf-8') as f:
    text = f.read()

prefix = 'export const CURATED_CATEGORIES_DB = '
db = json.loads(text[len(prefix):].rstrip().rstrip(';'))

# Pool of all Hindi songs
hindi_pool = {}
for slug, cat in db.items():
    if cat.get('lang') == 'hindi':
        for s in cat.get('songs', []):
            vid = s.get('videoId')
            if vid and len(vid) == 11:
                title = (s.get('title') or '').strip().lower()
                hindi_pool[title] = s

print(f"Total unique Hindi songs in pool: {len(hindi_pool)}")

# Check each Hindi category: how many can we add?
for slug, cat in sorted(db.items()):
    if cat.get('lang') == 'hindi':
        existing_titles = set((s.get('title') or '').strip().lower() for s in cat.get('songs', []))
        existing_vids = set(s.get('videoId') for s in cat.get('songs', []))
        available = [s for t, s in hindi_pool.items() if t not in existing_titles and s.get('videoId') not in existing_vids]
        print(f"  {slug:25} current={len(cat.get('songs', []))} -> available to add: {len(available)}")
