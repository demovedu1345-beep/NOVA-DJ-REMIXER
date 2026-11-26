with open(r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\public\js\ui\artist-explorer.js", "r", encoding="utf-8") as f:
    text = f.read()

import re
matches = [m.start() for m in re.finditer(r'/api/artists', text)]
print(f"Occurrences of /api/artists: {len(matches)}")
for idx in matches:
    print(text[max(0, idx - 100):min(len(text), idx + 200)])
