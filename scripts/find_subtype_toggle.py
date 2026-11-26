with open(r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\public\naux\static\immutable\chunks\3cq6guoi7hqi2.js", "r", encoding="utf-8") as f:
    text = f.read()

import re
matches = [m.start() for m in re.finditer(r'subtypes', text)]
print("Total occurrences of subtypes:", len(matches))
for idx in matches:
    snippet = text[max(0, idx - 100):min(len(text), idx + 200)]
    if "toggle" in snippet.lower() or "filter" in snippet.lower() or "includes" in snippet.lower():
        print("Match at", idx)
        print(snippet)
        print("-" * 40)
