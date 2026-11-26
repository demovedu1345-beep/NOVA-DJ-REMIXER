with open(r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\api\artists.js", "r", encoding="utf-8") as f:
    text = f.read()

print(f"api/artists.js total lines: {len(text.splitlines())}")
print(text[:1500])
