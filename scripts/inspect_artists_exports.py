with open(r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\api\_lib\artists-db.js", "r", encoding="utf-8") as f:
    text = f.read()

import re
exports = re.findall(r'export const ([A-Za-z0-9_]+)', text)
print("Exports:", exports)

# Let's check ARTISTS_DB definition
idx = text.find('export const ARTISTS_DB')
if idx != -1:
    print("Found export const ARTISTS_DB at", idx)
    print(text[idx:idx + 500])
