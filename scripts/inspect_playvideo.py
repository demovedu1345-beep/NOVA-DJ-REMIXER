with open('public/js/ui/aurora-and-mix-engine.js', 'r', encoding='utf-8') as f:
    code = f.read()

import re
matches = [m.start() for m in re.finditer(r'playVideo', code)]
print('playVideo in aurora-and-mix-engine.js:', len(matches))
for m in matches:
    print(m, repr(code[m-50:m+50]))
