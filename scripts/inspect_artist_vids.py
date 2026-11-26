import json
import re

with open('public/js/engine/artists-db.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Parse artists
idx_start = text.find('const ARTISTS_DB = {')
if idx_start == -1: idx_start = text.find('export const ARTISTS_DB = {')
idx_brace = text.find('{', idx_start)

# Let's inspect each artist's songs
artist_matches = list(re.finditer(r'"([a-z0-9\-]+)":\s*\{\s*"id":\s*"([^"]+)",\s*"name":\s*"([^"]+)"', text))
print(f"Total artists found: {len(artist_matches)}")

for am in artist_matches:
    a_id = am.group(2)
    a_name = am.group(3)
    start_pos = am.start()
    end_pos = text.find('},\n    "', start_pos + 10)
    if end_pos == -1: end_pos = text.find('}\n};', start_pos)
    sub = text[start_pos:end_pos]
    
    # Check for suspicious duplicates inside this artist
    vids = re.findall(r'"videoId":\s*"([^"]+)"', sub)
    titles = re.findall(r'"title":\s*"([^"]+)"', sub)
    if len(vids) != len(set(vids)):
        print(f"Artist {a_name} ({a_id}) has duplicate vids: {len(vids)} songs vs {len(set(vids))} unique vids")
