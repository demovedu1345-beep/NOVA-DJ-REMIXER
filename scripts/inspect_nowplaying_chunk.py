with open('public/naux/static/immutable/chunks/2yak1xb5ht175.js', 'r', encoding='utf-8') as f:
    code = f.read()

import re
matches = [m.start() for m in re.finditer(r'pause', code, re.IGNORECASE)]
print('Matches for pause in 2yak1xb5ht175.js:', len(matches))
for m in matches[:10]:
    print(m, repr(code[m-40:m+80]))
