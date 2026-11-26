with open('public/js/ui/aurora-and-mix-engine.js', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = [m.start() for m in re.finditer(r'PATTERNS', text)]
for pos in matches[:5]:
    print(text[max(0, pos-40):min(len(text), pos+150)])
