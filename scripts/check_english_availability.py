import json

with open('api/_lib/curated-songs-db.js', 'r', encoding='utf-8') as f:
    text = f.read()

prefix = 'export const CURATED_CATEGORIES_DB = '
db = json.loads(text[len(prefix):].rstrip().rstrip(';'))

# Pool of all English songs
english_pool = {}
for slug, cat in db.items():
    if cat.get('lang') == 'english':
        for s in cat.get('songs', []):
            vid = s.get('videoId')
            if vid and len(vid) == 11:
                title = (s.get('title') or '').strip().lower()
                english_pool[title] = s

print(f"Total unique English songs in pool: {len(english_pool)}")

for slug, cat in sorted(db.items()):
    if cat.get('lang') == 'english':
        existing_titles = set((s.get('title') or '').strip().lower() for s in cat.get('songs', []))
        existing_vids = set(s.get('videoId') for s in cat.get('songs', []))
        available = [s for t, s in english_pool.items() if t not in existing_titles and s.get('videoId') not in existing_vids]
        print(f"  {slug:25} current={len(cat.get('songs', []))} -> available to add: {len(available)}")
