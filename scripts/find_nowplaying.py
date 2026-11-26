import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
chunk_dir = os.path.join(ROOT, 'public/naux/static/immutable/chunks')
for f in os.listdir(chunk_dir):
    if f.endswith('.js'):
        p = os.path.join(chunk_dir, f)
        with open(p, 'r', encoding='utf-8', errors='ignore') as fp:
            c = fp.read()
            if 'NowPlaying' in c:
                print('Found NowPlaying in:', f)
