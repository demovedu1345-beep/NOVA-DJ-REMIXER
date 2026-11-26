with open('public/js/ui/aurora-and-mix-engine.js', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.findall(r'function\s+([A-Za-z0-9_]+)\s*\(', text)
print("Functions in aurora-and-mix-engine.js:", len(matches))
print(matches[:30])
