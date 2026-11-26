with open('public/js/ui/aurora-and-mix-engine.js', 'r', encoding='utf-8') as f:
    text = f.read()

import re
print("Length of aurora-and-mix-engine.js:", len(text))
for kw in ['BPM', 'beat', 'shockwave', 'pattern', 'uniform', 'AudioContext']:
    matches = len(re.findall(kw, text, re.I))
    print(f"Keyword '{kw}': {matches} occurrences")
