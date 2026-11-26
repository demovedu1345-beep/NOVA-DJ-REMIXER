with open('public/js/engine/artists-db.js', 'r', encoding='utf-8') as f:
    text = f.read()

import re
exports = re.findall(r'export const (\w+)', text)
print("Exports in artists-db.js:", exports)
for exp in exports:
    pos = text.find(f'export const {exp}')
    print(f"Export {exp} at position {pos}")
