import json

with open('public/js/engine/artists-db.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Find the weeknd in artists-db
idx = text.lower().find('the weeknd')
print('The Weeknd in artists-db.js:', idx)
if idx != -1:
    print(text[idx-50:idx+400])
