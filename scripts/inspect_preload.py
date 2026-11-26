with open(r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\public\naux\static\immutable\chunks\3cq6guoi7hqi2.js", "r", encoding="utf-8") as f:
    text = f.read()

import re

matches = [m.start() for m in re.finditer(r'preload', text)]
print(f"Total occurrences of preload: {len(matches)}")
for idx in matches:
    print("--- MATCH ---")
    print(text[max(0, idx - 150):min(len(text), idx + 250)])
