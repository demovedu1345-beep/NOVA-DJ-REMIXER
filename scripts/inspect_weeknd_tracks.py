with open('public/js/engine/artists-db.js', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('"the-weeknd":')
print(text[idx:idx+1500])
