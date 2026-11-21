"""
scripts/build_full_database.py
Master builder for:
1. 25 Hindi Categories (>= 100 songs each)
2. 25 English Categories (>= 100 songs each)
3. Regional Language Categories (Punjabi, Marathi, Gujarati, Tamil-Telugu, Kannada, Marwadi, Odia, Haryanvi-Bhojpuri)
4. Full Canonical ARTISTS_CATALOG for Hindi & English Artists
"""

import json
import os
import random

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Load existing DB
with open(os.path.join(ROOT, 'scripts/existing_db.json'), 'r', encoding='utf-8') as f:
    db = json.load(f)

# Load 4 Hindi and 4 English newly curated
with open(os.path.join(ROOT, 'scripts/curated_hindi_new_categories.json'), 'r', encoding='utf-8') as f:
    h4 = json.load(f)

with open(os.path.join(ROOT, 'scripts/curated_english_new_categories.json'), 'r', encoding='utf-8') as f:
    e4 = json.load(f)

print("Existing categories:", len(db))
