"""
scripts/update_module_298_full.py
Updates Module 298 in public/naux/static/immutable/chunks/3cq6guoi7hqi2.js
with all 25 Hindi categories, 25 English categories, and the Artists category!
"""

import os
import json
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
chunk_path = os.path.join(ROOT, 'public/naux/static/immutable/chunks/3cq6guoi7hqi2.js')

with open(chunk_path, 'r', encoding='utf-8') as f:
    text = f.read()

idx1 = text.find('298,e=>{')
idx2 = text.find(',"MIN_LANGUAGE_SONGS",0,10,', idx1)

if idx1 == -1 or idx2 == -1:
    raise ValueError(f"Could not find Module 298 boundaries in 3cq6guoi7hqi2.js (idx1={idx1}, idx2={idx2})")

hindi_subtypes = [
    {"id": "artists", "label": "⭐ Artists (All Singers)"},
    {"id": "hiphop", "label": "Hindi Hip-Hop & Rap"},
    {"id": "romantic", "label": "Hindi Love & Romance"},
    {"id": "breakup", "label": "Hindi Breakup & Heartbreak"},
    {"id": "emotional", "label": "Hindi Sad & Emotional"},
    {"id": "trip", "label": "Hindi Road Trip & Travel"},
    {"id": "dance", "label": "Hindi Party & Dance"},
    {"id": "workout", "label": "Hindi Workout & Gym"},
    {"id": "chill", "label": "Hindi Chill & Lo-Fi"},
    {"id": "indie", "label": "Hindi Indie & Acoustic"},
    {"id": "pop", "label": "Hindi Pop & Chartbusters"},
    {"id": "rock", "label": "Hindi Rock & Alternative"},
    {"id": "motivating", "label": "Hindi Motivational & Feel-Good"},
    {"id": "friendship", "label": "Hindi Friendship Songs"},
    {"id": "wedding", "label": "Hindi Wedding & Celebration"},
    {"id": "retro", "label": "Hindi Old Bollywood & Retro"},
    {"id": "sufi", "label": "Hindi Sufi & Qawwali"},
    {"id": "devotional", "label": "Hindi Devotional & Bhajan"},
    {"id": "classical", "label": "Hindi Classical & Semi-Classical"},
    {"id": "ghazal", "label": "Hindi Ghazal"},
    {"id": "folk", "label": "Hindi Folk & Traditional"},
    {"id": "edm", "label": "Hindi EDM & Electronic"},
    {"id": "focus", "label": "Hindi Focus & Instrumental"},
    {"id": "rainy", "label": "Hindi Rainy Day Songs"},
    {"id": "nightdrive", "label": "Hindi Night Drive"},
    {"id": "trending", "label": "Hindi Trending & Viral Hits"},
    {"id": "diwali", "label": "Diwali Party Songs"},
]

english_subtypes = [
    {"id": "artists", "label": "⭐ Artists (All Singers)"},
    {"id": "hiphop", "label": "English Hip-Hop & Rap"},
    {"id": "love", "label": "English Love & Romance"},
    {"id": "breakup", "label": "English Breakup & Heartbreak"},
    {"id": "emotional", "label": "English Sad & Emotional"},
    {"id": "trip", "label": "English Road Trip & Travel"},
    {"id": "dance", "label": "English Party & Dance"},
    {"id": "workout", "label": "English Workout & Gym"},
    {"id": "chill", "label": "English Chill & Lo-Fi"},
    {"id": "indie", "label": "English Indie & Acoustic"},
    {"id": "pop", "label": "English Pop & Chartbusters"},
    {"id": "rock", "label": "English Rock & Alternative"},
    {"id": "rnb", "label": "English R&B & Soul"},
    {"id": "edm", "label": "English EDM & Electronic"},
    {"id": "motivating", "label": "English Motivational & Feel-Good"},
    {"id": "friendship", "label": "English Friendship & Celebration"},
    {"id": "classicrock", "label": "English Classic Rock"},
    {"id": "retro", "label": "English Retro & Classics"},
    {"id": "country", "label": "English Country & Folk"},
    {"id": "jazz", "label": "English Jazz & Blues"},
    {"id": "gospel", "label": "English Gospel & Spiritual"},
    {"id": "classical", "label": "English Classical & Instrumental"},
    {"id": "metal", "label": "English Metal & Hard Rock"},
    {"id": "club", "label": "English Dance & Club Hits"},
    {"id": "focus", "label": "English Focus & Deep Work"},
    {"id": "trending", "label": "English Trending & Viral Hits"},
]

regional_subtypes = [
    {"id": "punjabi", "label": "Punjabi Hits"},
    {"id": "marathi", "label": "Marathi Hits"},
    {"id": "gujarati", "label": "Gujarati Garba"},
    {"id": "tamil-telugu", "label": "Tamil & Telugu Mass"},
    {"id": "kannada", "label": "Kannada Hits"},
    {"id": "marwadi", "label": "Marwadi / Rajasthani"},
    {"id": "odia", "label": "Odia Hits"},
    {"id": "haryanvi-bhojpuri", "label": "Haryanvi & Bhojpuri"},
]

languages_obj = [
    {"id": "hindi", "label": "Hindi", "subtypes": hindi_subtypes},
    {"id": "english", "label": "English", "subtypes": english_subtypes},
    {"id": "language", "label": "Language", "subtypes": regional_subtypes},
]

new_mod_prefix = '298,e=>{"use strict";e.s(["LANGUAGES",0,' + json.dumps(languages_obj, separators=(',', ':'))

new_text = text[:idx1] + new_mod_prefix + text[idx2:]

with open(chunk_path, 'w', encoding='utf-8') as f:
    f.write(new_text)

print("Updated Module 298 in 3cq6guoi7hqi2.js with all 25 Hindi + 25 English categories & Artists!")

# Check syntax with node
res = subprocess.run(['node', '--check', chunk_path], capture_output=True, text=True)
if res.returncode == 0:
    print("SUCCESS: 3cq6guoi7hqi2.js syntax is 100% valid!")
else:
    print("FAILED: syntax error:")
    print(res.stderr[:500])
