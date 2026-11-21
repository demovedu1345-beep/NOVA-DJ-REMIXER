"""
scripts/curate_all_50_categories.py
Creates the complete master catalog of 25 Hindi categories and 25 English categories,
each populated with 100+ authentic, playable songs with valid YouTube IDs and cue points.
Also builds the comprehensive ARTISTS_CATALOG mapping for Hindi & English artists.
"""

import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 1. Load existing DB
with open(os.path.join(ROOT, 'scripts/existing_db.json'), 'r', encoding='utf-8') as f:
    existing_db = json.load(f)

# 2. Load the 4 previously curated Hindi and 4 English categories
hindi_new_path = os.path.join(ROOT, 'scripts/curated_hindi_new_categories.json')
english_new_path = os.path.join(ROOT, 'scripts/curated_english_new_categories.json')

hindi_4_new = {}
if os.path.exists(hindi_new_path):
    with open(hindi_new_path, 'r', encoding='utf-8') as f:
        hindi_4_new = json.load(f)

english_4_new = {}
if os.path.exists(english_new_path):
    with open(english_new_path, 'r', encoding='utf-8') as f:
        english_4_new = json.load(f)

print(f"Loaded existing DB ({len(existing_db)} categories), hindi_4_new ({len(hindi_4_new)}), english_4_new ({len(english_4_new)})")
