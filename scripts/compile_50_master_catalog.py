"""
scripts/compile_50_master_catalog.py
Compiles the complete 25 Hindi categories, 25 English categories,
and the canonical ARTISTS_CATALOG with full discography mappings.
"""

import json
import os
import random
import copy

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 1. Load existing DB
with open(os.path.join(ROOT, 'scripts/existing_db.json'), 'r', encoding='utf-8') as f:
    existing_db = json.load(f)

# 2. Load 4 curated Hindi & 4 curated English
with open(os.path.join(ROOT, 'scripts/curated_hindi_new_categories.json'), 'r', encoding='utf-8') as f:
    h4 = json.load(f)

with open(os.path.join(ROOT, 'scripts/curated_english_new_categories.json'), 'r', encoding='utf-8') as f:
    e4 = json.load(f)

# 3. Load artists metadata
from artists_metadata import HINDI_ARTISTS, ENGLISH_ARTISTS, HINDI_ARTIST_SUBCATEGORIES, ENGLISH_ARTIST_SUBCATEGORIES

# Harvest all songs from all sources
all_harvested = []
seen_vids = set()

def add_song(s):
    if not isinstance(s, dict): return
    vId = s.get('videoId') or (s.get('youtube_ids') and s['youtube_ids'][0])
    if vId and len(vId) == 11 and vId not in seen_vids:
        seen_vids.add(vId)
        all_harvested.append(s)

# From existing_db
for cat in existing_db.values():
    songs = cat.get('songs', []) if isinstance(cat, dict) else cat
    for s in songs:
        add_song(s)

# From h4 and e4
for cat in h4.values():
    songs = cat.get('songs', []) if isinstance(cat, dict) else cat
    for s in songs:
        add_song(s)

for cat in e4.values():
    songs = cat.get('songs', []) if isinstance(cat, dict) else cat
    for s in songs:
        add_song(s)

# From all scripts JSONs
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
                    add_song(s)
            except Exception:
                pass

print(f"Total harvest pool: {len(all_harvested)} unique verified songs")

# Partition pool into Hindi pool and English pool
hindi_pool = []
english_pool = []

for s in all_harvested:
    text = (s.get('title', '') + ' ' + s.get('artist', '')).lower()
    # Check if English
    is_eng = any(a['name'].lower() in text for a in ENGLISH_ARTISTS) or any(w in text for w in [
        'the weeknd', 'taylor swift', 'ed sheeran', 'bruno mars', 'drake', 'eminem', 'coldplay',
        'imagine dragons', 'linkin park', 'billie eilish', 'dua lipa', 'adele', 'david guetta',
        'calvin harris', 'post malone', 'avicii', 'queen', 'rihanna', 'ariana grande', 'lady gaga',
        'shawn mendes', 'charlie puth', 'maroon 5', 'katy perry', 'bebe rexha', 'selena gomez',
        'marshmello', 'alan walker', 'kygo', 'clean bandit', 'zedd', 'shakira', 'justin timberlake',
        'chainsmokers', 'snoop dogg', '50 cent', 'kanye', 'kendrick', 'travis scott', 'future'
    ])
    
    # Check if Hindi
    is_hin = any(a['name'].lower() in text for a in HINDI_ARTISTS) or any(w in text for w in [
        'arijit', 'badshah', 'shreya', 'sonu nigam', 'sunidhi', 'pritam', 'honey singh', 'divine',
        'krsna', 'kr$na', 'raftaar', 'vishal', 'darshan raval', 'b praak', 'mohit chauhan', 'atif aslam',
        'jubin nautiyal', 'kk', 'anuv jain', 'prateek kuhad', 'king', 'mc stan', 'lata mangeshkar',
        'kishore kumar', 'rafi', 'mukesh', 'asha bhosle', 'ar rahman', 'shankar mahadevan', 'amit trivedi',
        'lucky ali', 'jagjit singh', 'neha kakkar', 'mika singh', 'alka yagnik', 'udit narayan', 'kumar sanu',
        'seedhe maut', 'ikra', 'dino james', 'yashraj', 'kailash kher', 'papon', 'shaan'
    ])
    
    if is_eng:
        english_pool.append(s)
    elif is_hin:
        hindi_pool.append(s)
    else:
        hindi_pool.append(s)

print(f"Partitioned: {len(hindi_pool)} Hindi songs, {len(english_pool)} English songs")
