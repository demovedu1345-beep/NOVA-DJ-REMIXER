with open(r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\api\_lib\curated-songs-db.js", "r", encoding="utf-8") as f:
    text = f.read()

import re
slugs = re.findall(r"slug:\s*['\"]([^'\"]+)['\"]", text)
print(f"Total categories: {len(slugs)}")
print("Categories:", slugs)
