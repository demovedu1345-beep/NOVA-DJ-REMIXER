with open('public/js/engine/artists-db.js', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('export const ARTISTS_DB = ')
print(text[pos:pos+500])
print("...")
print(text[-500:])
