with open('public/naux/static/immutable/chunks/3cq6guoi7hqi2.js', 'r', encoding='utf-8') as f:
    code = f.read()

import re
matches = [m.start() for m in re.finditer(r'Plays through YouTube', code)]
print("Matches for 'Plays through YouTube':", matches)
for pos in matches:
    print(code[max(0, pos-50):min(len(code), pos+150)])
