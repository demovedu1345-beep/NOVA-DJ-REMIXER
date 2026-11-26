with open('public/js/ui/aurora-and-mix-engine.js', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = [m.start() for m in re.finditer(r'requestAnimationFrame', text)]
print("requestAnimationFrame matches in aurora-and-mix-engine.js:", len(matches))
for pos in matches[:5]:
    print(f"--- Pos {pos} ---")
    print(text[max(0, pos-50):min(len(text), pos+300)])
