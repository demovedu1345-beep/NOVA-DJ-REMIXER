import re

with open('public/songs.html', 'r', encoding='utf-8') as f:
    html = f.read()

links = re.findall(r'<a\s+[^>]*href="([^"]+)"[^>]*>(.*?)</a>', html, re.S)
print(f"Total links in songs.html: {len(links)}")
for href, inner in links[:30]:
    clean = re.sub(r'<[^>]+>', ' ', inner).strip()
    clean = ' '.join(clean.split())
    print(f"  href: {href} | text: {clean[:70]}")
