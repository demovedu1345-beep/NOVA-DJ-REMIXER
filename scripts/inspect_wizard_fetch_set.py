with open('public/naux/static/immutable/chunks/3cq6guoi7hqi2.js', 'r', encoding='utf-8') as f:
    c = f.read()

import re
matches = re.finditer(r'/api/set', c)
for m in matches:
    idx = m.start()
    print('Context around /api/set:')
    print(c[max(0, idx-300):min(len(c), idx+300)])
