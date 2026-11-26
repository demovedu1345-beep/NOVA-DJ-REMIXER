with open(r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\public\js\engine\background-audio.js", "r", encoding="utf-8") as f:
    text = f.read()

print(f"Total lines in background-audio.js: {len(text.splitlines())}")
print(text[:2500])
