with open('public/naux/static/immutable/chunks/3cq6guoi7hqi2.js', 'r', encoding='utf-8') as f:
    code = f.read()

import re
matches = [m.start() for m in re.finditer(r'd\.current\.', code)]
for m in matches:
    print(m, repr(code[m:m+40]))
