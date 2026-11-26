with open('public/js/ui/app.js', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = list(re.finditer(r'<section class="mt-\[4vh\]', text))
print('Sections found:', len(matches))
for m in matches:
    print(text[m.start():m.start()+80])
