import os

p = r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\public\naux\static\immutable\chunks\2yak1xb5ht175.js"
with open(p, "r", encoding="utf-8") as f:
    text = f.read()

start_idx = text.find('7269,e=>')
end_idx = text.find('17241,e=>', start_idx)

print("Component 7269 length:", end_idx - start_idx)
with open(r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\scripts\comp_7269.txt", "w", encoding="utf-8") as out:
    out.write(text[start_idx:end_idx])
print("Written to comp_7269.txt")
