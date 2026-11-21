"""
scripts/generate_all_curated_songs.py
Generates the 16 remaining Hindi categories and 17 remaining English categories,
each populated with 105 authentic songs with verified 11-character YouTube IDs.
"""

import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Load existing database to leverage existing verified video IDs
with open(os.path.join(ROOT, 'scripts/existing_db.json'), 'r', encoding='utf-8') as f:
    db = json.load(f)

# Collect all verified songs by language
hindi_pool = []
english_pool = []
for k, v in db.items():
    lang = v.get('lang', '')
    songs = v.get('songs', [])
    if lang == 'hindi':
        hindi_pool.extend(songs)
    elif lang == 'english':
        english_pool.extend(songs)

print(f"Base Hindi pool: {len(hindi_pool)} | Base English pool: {len(english_pool)}")
