with open('public/styles/artist-explorer.css', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print('Total lines in artist-explorer.css:', len(lines))
print('First 30 lines:')
for l in lines[:30]:
    print(l.rstrip())
print('...')
print('Last 30 lines:')
for l in lines[-30:]:
    print(l.rstrip())
