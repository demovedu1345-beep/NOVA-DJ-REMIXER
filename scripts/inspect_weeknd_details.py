import re

for path in ['public/js/engine/artists-db.js', 'public/js/engine/curated-songs-db.js']:
    print(f"=== {path} ===")
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    
    # find weeknd tracks
    idx = text.find('The Weeknd')
    while idx != -1:
        start = max(0, idx - 50)
        end = min(len(text), idx + 200)
        snippet = text[start:end]
        print(snippet.replace('\n', ' '))
        idx = text.find('The Weeknd', idx + 100)
