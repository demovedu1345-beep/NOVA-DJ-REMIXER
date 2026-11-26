with open('public/naux/static/immutable/chunks/3cq6guoi7hqi2.js', 'r', encoding='utf-8') as f:
    c = f.read()

import re
matches = re.finditer(r'bottom-0', c)
for m in matches:
    idx = m.start()
    print('bottom-0 snippet:')
    print(c[max(0, idx-50):min(len(c), idx+150)])
