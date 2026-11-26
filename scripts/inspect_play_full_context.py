import os, re

p = r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\public\naux\static\immutable\chunks\2yak1xb5ht175.js"
with open(p, "r", encoding="utf-8") as f:
    text = f.read()

matches = [m.start() for m in re.finditer("PLAY FULL", text)]
for idx in matches:
    print("=" * 50)
    print(text[max(0, idx - 400):min(len(text), idx + 400)])
