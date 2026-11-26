import os, re

files = [
    r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\public\naux\static\immutable\chunks\2yak1xb5ht175.js",
    r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\public\styles\mobile-fixes.css",
    r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\public\naux\static\immutable\assets\app.css"
]

for fp in files:
    if os.path.exists(fp):
        print("Checking", fp)
        with open(fp, "r", encoding="utf-8") as f:
            content = f.read()
        for pat in [r'\.deck\b', r'container-type', r'h-dvh', r'data-slot']:
            m = re.findall(pat, content)
            print(f"  {pat}: {len(m)} occurrences")
