import os
import re

for root, dirs, files in os.walk('public/naux/static/immutable/chunks'):
    for f in files:
        if f.endswith('.js'):
            p = os.path.join(root, f)
            with open(p, 'r', encoding='utf-8') as fp:
                c = fp.read()
                if '/api/set' in c:
                    print(f"Found in {f}")
                    for m in re.finditer(r'/api/set', c):
                        idx = m.start()
                        print('  Snippet:', c[max(0, idx-100):min(len(c), idx+100)])
