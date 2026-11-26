with open('public/index.html', 'r', encoding='utf-8') as f:
    c = f.read()

import re
body_match = re.search(r'<body[^>]*>(.*?)</body>', c, re.DOTALL)
if body_match:
    body_content = body_match.group(1)
    print('Body first 2000 chars:')
    print(body_content[:2000])
