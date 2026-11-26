with open('public/js/engine/pro-mixer-engine.js', 'r', encoding='utf-8') as f:
    c = f.read()

import re
matches = re.finditer(r'bpm', c, re.IGNORECASE)
for i, m in enumerate(matches):
    if i > 10: break
    idx = m.start()
    print(f"--- BPM match {i+1} ---")
    print(c[max(0, idx-60):min(len(c), idx+150)])
