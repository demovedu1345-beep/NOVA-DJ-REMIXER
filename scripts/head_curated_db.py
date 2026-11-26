with open(r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\api\_lib\curated-songs-db.js", "r", encoding="utf-8") as f:
    lines = [f.readline() for _ in range(30)]

print("".join(lines))
