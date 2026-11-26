with open('public/js/ui/aurora-and-mix-engine.js', 'r', encoding='utf-8') as f:
    aurora_js = f.read()

import re
matches = re.findall(r'style\.textContent\s*=\s*`([^`]+)`', aurora_js)
print('aurora-and-mix-engine textContent styles count:', len(matches))
for m in matches:
    print('Aurora style snippet:\n', m[:1000])

with open('public/js/ui/audify-rgb-aurora-border.js', 'r', encoding='utf-8') as f:
    border_js = f.read()

matches2 = re.findall(r'style\.textContent\s*=\s*`([^`]+)`', border_js)
print('audify-rgb-aurora-border textContent styles count:', len(matches2))
for m in matches2:
    print('Border style snippet:\n', m[:1000])
