with open('public/index.html', 'r', encoding='utf-8') as f:
    c = f.read()

import re
matches = re.findall(r'style="[^"]*(?:width|min-width)[^"]*"', c)
print(f"Inline width styles in index.html: {len(matches)}")
for m in matches:
    print(" ", m)
