with open(r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\api\set.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

print(f"Total lines in api/set.js: {len(lines)}")
for i, line in enumerate(lines):
    if "naux.party" in line or "candidatePool" in line or "slugMatchesSubtype" in line:
        print(f"Line {i+1}: {line.strip()[:100]}")
