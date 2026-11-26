import os

for root, dirs, files in os.walk('public'):
    for f in files:
        if f.endswith(('.js', '.html', '.json')):
            p = os.path.join(root, f)
            with open(p, 'r', encoding='utf-8', errors='ignore') as fp:
                c = fp.read()
                if 'Plays through YouTube' in c:
                    print('Found in:', p)
