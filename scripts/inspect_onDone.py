with open('public/naux/static/immutable/chunks/3cq6guoi7hqi2.js', 'r', encoding='utf-8') as f:
    c = f.read()

import re
matches = re.finditer(r'onDone', c)
for m in matches:
    idx = m.start()
    print('Context around onDone:')
    print(c[max(0, idx-100):min(len(c), idx+150)])
