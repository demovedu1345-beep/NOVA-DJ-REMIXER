with open('public/naux/static/immutable/chunks/3cq6guoi7hqi2.js', 'r', encoding='utf-8') as f:
    code = f.read()

import re
matches = [m.start() for m in re.finditer(r'playing["\']?\s*===?\s*C|C\s*===?\s*["\']playing', code)]
for m in matches:
    print(m, repr(code[m-50:m+150]))
