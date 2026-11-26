import os, re

p = r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\public\naux\static\immutable\chunks\2yak1xb5ht175.js"
with open(p, "r", encoding="utf-8") as f:
    text = f.read()

idx = text.find('className:"relative z-10 flex gap-[2vw]"')
if idx != -1:
    print("MATCH AT", idx)
    print("--- 1500 chars before ---")
    print(text[max(0, idx - 1500):idx])
    print("--- 1000 chars after ---")
    print(text[idx:min(len(text), idx + 1000)])
