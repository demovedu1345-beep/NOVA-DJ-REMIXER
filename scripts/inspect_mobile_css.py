with open('public/styles/artist-explorer.css', 'r', encoding='utf-8') as f:
    css = f.read()

print('artist-explorer.css length:', len(css))
# Search for media queries or mobile rules
import re
media_queries = re.findall(r'@media[^{]+{[^}]+}', css)
print('Media queries count:', len(media_queries))
for mq in media_queries[:10]:
    print('---')
    print(mq[:200])

print('\nCheck 100vw usages:')
for line in css.splitlines():
    if '100vw' in line or '100vh' in line or 'viewport' in line:
        print(line.strip())
