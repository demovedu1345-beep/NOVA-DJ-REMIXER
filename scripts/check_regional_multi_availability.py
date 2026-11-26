import json

with open('api/_lib/curated-songs-db.js', 'r', encoding='utf-8') as f:
    text = f.read()

prefix = 'export const CURATED_CATEGORIES_DB = '
db = json.loads(text[len(prefix):].rstrip().rstrip(';'))

multi_langs = ['punjabi', 'south', 'haryanvi-bhojpuri']

for lang in multi_langs:
    pool = {}
    for slug, cat in db.items():
        if cat.get('lang') == lang:
            for s in cat.get('songs', []):
                vid = s.get('videoId')
                if vid and len(vid) == 11:
                    title = (s.get('title') or '').strip().lower()
                    pool[title] = s
    print(f"Total unique {lang} songs in pool: {len(pool)}")
    for slug, cat in sorted(db.items()):
        if cat.get('lang') == lang:
            existing_titles = set((s.get('title') or '').strip().lower() for s in cat.get('songs', []))
            existing_vids = set(s.get('videoId') for s in cat.get('songs', []))
            available = [s for t, s in pool.items() if t not in existing_titles and s.get('videoId') not in existing_vids]
            print(f"  {slug:30} current={len(cat.get('songs', []))} -> available: {len(available)}")
