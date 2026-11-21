import json

with open('scripts/existing_db.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

hindi_songs = []
english_songs = []
for k, v in db.items():
    lang = v.get('lang', '')
    songs = v.get('songs', [])
    if lang == 'hindi':
        hindi_songs.extend(songs)
    elif lang == 'english':
        english_songs.extend(songs)

print(f"Existing Hindi songs in DB: {len(hindi_songs)}")
print(f"Existing English songs in DB: {len(english_songs)}")

# Check unique videoIds
h_vids = {s.get('videoId') for s in hindi_songs if s.get('videoId')}
e_vids = {s.get('videoId') for s in english_songs if s.get('videoId')}
print(f"Unique Hindi video IDs: {len(h_vids)}")
print(f"Unique English video IDs: {len(e_vids)}")
