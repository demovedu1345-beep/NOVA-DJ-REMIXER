with open('public/naux/static/immutable/chunks/3cq6guoi7hqi2.js', 'r', encoding='utf-8') as f:
    code = f.read()

import re
for m in re.finditer(r'\.pause\(|\.resume\(|\.togglePause\(', code):
    idx = m.start()
    print(f"=== call at {idx} ===")
    print(code[max(0, idx-100):min(len(code), idx+150)])
