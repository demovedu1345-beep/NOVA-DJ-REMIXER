"""
scripts/generate_all_categories_and_artists.py
Builds the full 25 Hindi categories, 25 English categories, and canonical ARTISTS_CATALOG.
"""

import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 1. Load existing DB
with open(os.path.join(ROOT, 'scripts/existing_db.json'), 'r', encoding='utf-8') as f:
    existing_db = json.load(f)

# 2. Load 4 curated Hindi & 4 curated English
with open(os.path.join(ROOT, 'scripts/curated_hindi_new_categories.json'), 'r', encoding='utf-8') as f:
    h4 = json.load(f)

with open(os.path.join(ROOT, 'scripts/curated_english_new_categories.json'), 'r', encoding='utf-8') as f:
    e4 = json.load(f)

# Harvest all songs from scripts/
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

print(f"Harvested {len(harvested)} unique items with valid video IDs")
