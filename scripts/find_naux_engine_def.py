import os
import re

for root, dirs, files in os.walk('public'):
    for f in files:
        if f.endswith('.js'):
            p = os.path.join(root, f)
            with open(p, 'r', encoding='utf-8', errors='ignore') as fp:
                c = fp.read()
                if '__nauxEngine' in c:
                    print(f"Found __nauxEngine in: {p}")
                    for m in re.finditer(r'__nauxEngine', c):
                        idx = m.start()
                        print('  Snippet:', c[max(0, idx-100):min(len(c), idx+150)])
