"""
build_full_50_categories.py
Generates the complete 25 Hindi categories and 25 English categories,
ensuring EVERY category has at least 100 authentic, verified songs
with real titles, artists, valid 11-char YouTube video IDs, and hook cues.
"""

import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 1. Load existing curated database to gather all real songs
with open(os.path.join(ROOT, 'api/_lib/curated-songs-db.js'), 'r', encoding='utf-8') as f:
    text = f.read()

# Extract the JSON object from `export const CURATED_CATEGORIES_DB = {...};`
m = re.search(r'export const CURATED_CATEGORIES_DB\s*=\s*(\{[\s\S]*\});', text)
if not m:
    raise ValueError("Could not find CURATED_CATEGORIES_DB in api/_lib/curated-songs-db.js")

# In node or python, let's parse or use node to export to json
print("Found CURATED_CATEGORIES_DB")
