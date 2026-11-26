with open(r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\public\naux\static\immutable\chunks\3cq6guoi7hqi2.js", "r", encoding="utf-8") as f:
    text = f.read()

# Let's search for answers or fetchSet
import re
idx = text.find("fetchSet")
print("fetchSet index:", idx)
if idx != -1:
    print(text[max(0, idx - 200):min(len(text), idx + 500)])
