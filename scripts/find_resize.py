with open('public/js/ui/aurora-and-mix-engine.js', 'r', encoding='utf-8') as f:
    c = f.read()

import re
matches = re.finditer(r'function resize\(\)', c)
for m in matches:
    idx = m.start()
    print(c[idx:idx+400])
