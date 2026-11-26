with open('public/naux/static/immutable/chunks/3cq6guoi7hqi2.js', 'r', encoding='utf-8') as f:
    code = f.read()

import re

for method in ['pause()', 'resume()', 'togglePause()', 'onVisibility']:
    pos = 0
    while True:
        idx = code.find(method, pos)
        if idx == -1:
            break
        print(f"=== {method} at {idx} ===")
        print(code[max(0, idx-50):min(len(code), idx+300)])
        pos = idx + len(method)
