import json, os

for filename in ["scripts/curated_hindi_new_categories.json", "scripts/curated_english_new_categories.json"]:
    if os.path.exists(filename):
        with open(filename, "r", encoding="utf-8") as f:
            data = json.load(f)
        print(f"=== {filename} ===")
        for k, v in data.items():
            songs = v.get("songs", [])
            print(f"  {k}: {len(songs)} songs (songCount={v.get('songCount')})")
    else:
        print(f"=== {filename} NOT FOUND ===")
