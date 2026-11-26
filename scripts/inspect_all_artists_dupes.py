import json

with open('public/js/engine/artists-db.js', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('export const ARTISTS_DB = {')
if idx == -1: idx = text.find('const ARTISTS_DB = {')
raw_json = text[text.find('{', idx):text.rfind('};')+1]
data = json.loads(raw_json)

print(f"Hindi artists: {len(data.get('hindi', {}))}")
print(f"English artists: {len(data.get('english', {}))}")

for lang in ['english', 'hindi']:
    print(f"\n=== {lang.upper()} ARTISTS DUPLICATE AUDIT ===")
    for a_id, a_data in data.get(lang, {}).items():
        vids = {}
        for s in a_data.get('songs', []):
            vid = s.get('videoId')
            title = s.get('title')
            if vid in vids:
                print(f"  [{a_data.get('name')}] '{title}' shares vid '{vid}' with '{vids[vid]}'")
            else:
                vids[vid] = title
