with open('public/js/ui/aurora-and-mix-engine.js', 'r', encoding='utf-8') as f:
    c = f.read()

import re
print("Matches for uAberration:")
for m in re.finditer(r'uniform float uAberration;', c):
    print(c[m.start()-20:m.start()+150])
