import re

with open('public/index.html', 'r', encoding='utf-8') as f:
    c = f.read()

print('Length of index.html:', len(c))
scripts = re.findall(r'<script.*?</script>', c, re.DOTALL)
print('Scripts count:', len(scripts))
for s in scripts:
    src = re.search(r'src=[\"\'](.*?)[\"\']', s)
    if src and 'naux/static' not in src.group(1):
        print('Custom script:', src.group(1))

# Check stylesheets
links = re.findall(r'<link.*?>', c)
for l in links:
    if 'stylesheet' in l:
        print('Stylesheet:', l)

# Check songs.html as well
with open('public/songs.html', 'r', encoding='utf-8') as f:
    s_html = f.read()

print('\nsongs.html length:', len(s_html))
s_links = re.findall(r'<link.*?>', s_html)
for l in s_links:
    if 'stylesheet' in l:
        print('songs.html Stylesheet:', l)
