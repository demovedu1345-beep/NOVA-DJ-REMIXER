with open('public/js/ui/aurora-and-mix-engine.js', 'r', encoding='utf-8') as f:
    c = f.read()

import re
matches = re.finditer(r'onRenderFrame', c)
for m in matches:
    idx = m.start()
    print(c[max(0, idx-50):min(len(c), idx+100)])
