with open('public/naux/static/immutable/chunks/3cq6guoi7hqi2.js', 'r', encoding='utf-8') as f:
    code = f.read()

import re
matches = [m.start() for m in re.finditer(r'togglePause', code)]
for m in matches:
    print('togglePause at:', m)
    print(code[m-100:m+200])
