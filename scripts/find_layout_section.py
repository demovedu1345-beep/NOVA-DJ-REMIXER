with open(r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\public\styles\artist-explorer.css", "r", encoding="utf-8") as f:
    text = f.read()

idx_start = text.find('/* =========================================================================\n   Player Layout & Positioning Protection')
print("Found start at:", idx_start)

idx_end = text.find('/* =========================================================================\n   Responsive Header & Category Button Alignment', idx_start)
print("Found end at:", idx_end)
