import glob, json, os
from collections import defaultdict

regional_songs = {
    'gujarati': {},
    'marathi': {},
    'kannada': {},
    'marwadi': {},
    'odia': {}
}

# 1. Check curated-songs-db.js
with open('api/_lib/curated-songs-db.js', 'r', encoding='utf-8') as f:
    text = f.read()
prefix = 'export const CURATED_CATEGORIES_DB = '
db = json.loads(text[len(prefix):].rstrip().rstrip(';'))

for slug, cat in db.items():
    lang = cat.get('lang', '')
    for r in regional_songs:
        if r in slug or r in lang:
            for s in cat.get('songs', []):
                vid = s.get('videoId')
                if vid and len(vid) == 11:
                    regional_songs[r][vid] = s

print("From curated-songs-db.js:")
for r, v in regional_songs.items():
    print(f"  {r}: {len(v)} songs")

# 2. Check all JSON files in scripts/
for root, _, files in os.walk('scripts'):
    for f in files:
        if f.endswith('.json'):
            path = os.path.join(root, f)
            try:
                with open(path, 'r', encoding='utf-8') as fp:
                    d = json.load(fp)
                if isinstance(d, dict):
                    for k, val in d.items():
                        for r in regional_songs:
                            if r in k:
                                items = val.get('songs', []) if isinstance(val, dict) else val
                                for s in items:
                                    if isinstance(s, dict) and s.get('videoId') and len(s['videoId']) == 11:
                                        regional_songs[r][s['videoId']] = s
            except:
                pass

print("\nAfter scanning all scripts JSONs:")
for r, v in regional_songs.items():
    print(f"  {r}: {len(v)} songs")
