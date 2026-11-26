with open('public/js/engine/curated-songs-db.js', 'r', encoding='utf-8') as f:
    text = f.read()

print("File length:", len(text))
pos = text.find('export const CURATED_CATEGORIES_DB = ')
print("Marker pos:", pos)
# Find the next export
next_export = text.find('export ', pos + 35)
print("Next export pos:", next_export)
if next_export != -1:
    print("Next export snippet:")
    print(text[next_export-100:next_export+200])
else:
    print("Last 300 chars:")
    print(text[-300:])
