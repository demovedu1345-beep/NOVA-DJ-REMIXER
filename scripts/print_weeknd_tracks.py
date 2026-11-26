import json

with open('public/js/engine/artists-db.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Parse the JS object or find the-weeknd
start = text.find('"the-weeknd":')
end = text.find('"drake":', start)
snippet = text[start:end]

lines = snippet.split('\n')
for l in lines:
    if any(k in l for k in ['"title":', '"videoId":', '"youtube_ids":', '"name":']):
        print(l.strip())
