with open('public/naux/static/immutable/chunks/3cq6guoi7hqi2.js', 'r', encoding='utf-8') as f:
    code = f.read()

import re
matches = [m.start() for m in re.finditer(r'togglePause', code)]
for idx in matches:
    print(f"=== togglePause at {idx} ===")
    print(code[max(0, idx-100):min(len(code), idx+200)])
