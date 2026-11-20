import json
import re

db_path = r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\api\_lib\curated-songs-db.js"
with open(db_path, "r", encoding="utf-8") as f:
    text = f.read()

# Match export const CURATED_CATEGORIES_DB = { ... };
prefix = "export const CURATED_CATEGORIES_DB = "
if prefix in text:
    raw_json = text[text.find(prefix) + len(prefix):].rstrip().rstrip(";")
    try:
        db = json.loads(raw_json)
        print("Successfully parsed DB JSON!")
        for cat in ["english-pop", "english-love"]:
            songs = db.get(cat, {}).get("songs", [])
            print(f"{cat}: {len(songs)} songs")
            for i, s in enumerate(songs[:5]):
                print(f"  {i+1}. {s.get('title')} by {s.get('artist')} ({s.get('year')}) vid={s.get('videoId')}")
    except Exception as e:
        print("JSON parse error:", e)
