import json

with open('api/_lib/curated-songs-db.js', 'r', encoding='utf-8') as f:
    text = f.read()

import re
m = re.search(r'export const CURATED_CATEGORIES_DB\s*=\s*(\{[\s\S]*\});', text)
db = json.loads(m.group(1))

print(f"Total categories in DB: {len(db)}")
hindi_cats = [k for k, v in db.items() if v.get('lang') == 'hindi']
english_cats = [k for k, v in db.items() if v.get('lang') == 'english']
regional_cats = [k for k, v in db.items() if v.get('lang') not in ('hindi', 'english')]

print(f"Hindi categories: {len(hindi_cats)}")
print(f"English categories: {len(english_cats)}")
print(f"Regional categories: {len(regional_cats)}")

under_100 = []
for k, v in db.items():
    cnt = len(v.get('songs', []))
    if cnt < 100:
        under_100.append((k, cnt))

if under_100:
    print("WARNING! Categories with under 100 songs:", under_100)
else:
    print("ALL categories in DB have >= 100 songs! Target 100% achieved!")

total_songs = sum(len(v.get('songs', [])) for v in db.values())
print(f"Total category song entries across DB: {total_songs}")
