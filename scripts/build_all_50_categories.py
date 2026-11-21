"""
scripts/build_all_50_categories.py
Generates the complete 25 Hindi and 25 English categories (each with >= 100 songs),
merges with regional languages, and outputs both:
- api/_lib/curated-songs-db.js
- public/js/engine/curated-songs-db.js
- api/_lib/artists-db.js
- public/js/engine/artists-db.js
"""

import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 1. Load existing DB
with open(os.path.join(ROOT, 'scripts/existing_db.json'), 'r', encoding='utf-8') as f:
    existing_db = json.load(f)

# 2. Load 4 Hindi & 4 English newly curated
with open(os.path.join(ROOT, 'scripts/curated_hindi_new_categories.json'), 'r', encoding='utf-8') as f:
    h4 = json.load(f)

with open(os.path.join(ROOT, 'scripts/curated_english_new_categories.json'), 'r', encoding='utf-8') as f:
    e4 = json.load(f)

# 3. Harvest all unique songs with valid 11-char video IDs
seen_vids = set()
harvested = []
for root_dir, dirs, files in os.walk(os.path.join(ROOT, 'scripts')):
    for f in files:
        if f.endswith('.json') and not f.startswith('existing_db'):
            try:
                with open(os.path.join(root_dir, f), 'r', encoding='utf-8') as fp:
                    d = json.load(fp)
                items = []
                if isinstance(d, list): items = d
                elif isinstance(d, dict):
                    for k, v in d.items():
                        if isinstance(v, dict) and 'songs' in v: items.extend(v['songs'])
                        elif isinstance(v, list): items.extend(v)
                for s in items:
                    if isinstance(s, dict):
                        vId = s.get('videoId') or (s.get('youtube_ids') and s['youtube_ids'][0])
                        if vId and len(vId) == 11 and vId not in seen_vids:
                            seen_vids.add(vId)
                            harvested.append(s)
            except Exception:
                pass

# Also harvest from existing_db
for cat in existing_db.values():
    for s in cat.get('songs', []):
        vId = s.get('videoId') or (s.get('youtube_ids') and s['youtube_ids'][0])
        if vId and len(vId) == 11 and vId not in seen_vids:
            seen_vids.add(vId)
            harvested.append(s)

print(f"Total verified harvest pool: {len(harvested)} unique songs")
