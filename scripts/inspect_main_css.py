with open('public/naux/static/immutable/chunks/2imx6i21-1sy0.css', 'r', encoding='utf-8') as f:
    css = f.read()

print('2imx6i21-1sy0.css length:', len(css))
# Search for html, body rules
import re
for m in re.finditer(r'(html|body|\.min-h-dvh|\*)[^{]*\{[^}]+\}', css):
    print(m.group(0))
