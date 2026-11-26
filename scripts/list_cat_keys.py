import json, re

with open(r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\api\_lib\curated-songs-db.js", "r", encoding="utf-8") as f:
    text = f.read()

keys = re.findall(r'^\s*"([a-z0-9\-]+)":\s*\{', text, re.MULTILINE)
print(f"Total categories: {len(keys)}")
for k in keys:
    print(" ", k)
