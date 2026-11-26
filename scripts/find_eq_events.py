with open('public/js/ui/eq-modal.js', 'r', encoding='utf-8') as f:
    c = f.read()

import re
matches = re.finditer(r'addEventListener', c)
for m in matches:
    idx = m.start()
    print('addEventListener snippet:')
    print(c[max(0, idx-50):min(len(c), idx+150)])
