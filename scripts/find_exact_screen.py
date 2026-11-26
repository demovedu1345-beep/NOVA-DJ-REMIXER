import os

keywords = [
    'EXPLORE ALL REGIONS',
    'BROWSE BY LANGUAGE',
    '12 LANGUAGES AVAILABLE',
    'DSP',
    'Zingaat',
    'Salaar',
    'Kantara',
    'REGIONS'
]

matches = []
for root, dirs, files in os.walk('.'):
    if '.git' in root or 'node_modules' in root:
        continue
    for f in files:
        path = os.path.join(root, f)
        try:
            with open(path, 'r', encoding='utf-8', errors='ignore') as fp:
                content = fp.read()
            for kw in keywords:
                if kw in content:
                    matches.append((path, kw))
                    break
        except Exception as e:
            pass

for m in matches:
    print(f"Match: {m[0]} -> {m[1]}")
