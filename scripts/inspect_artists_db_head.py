with open('public/js/engine/artists-db.js', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('ARTISTS_DB = {')
print('ARTISTS_DB = { at:', idx)
print(text[idx:idx+400])
