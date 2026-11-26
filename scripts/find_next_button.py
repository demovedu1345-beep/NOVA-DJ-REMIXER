import glob
import re

files = [
    'public/js/engine/discovery-engine.js',
    'public/js/ui/app.js',
    'public/naux/static/immutable/chunks/3cq6guoi7hqi2.js'
]

for f in files:
    try:
        with open(f, 'r', encoding='utf-8') as fp:
            content = fp.read()
        for m in re.finditer(r'NEXT', content, re.IGNORECASE):
            start = max(0, m.start() - 60)
            end = min(len(content), m.end() + 60)
            print(f"--- Found in {f} at {m.start()} ---")
            print(content[start:end])
    except Exception as e:
        print(f"Error reading {f}: {e}")
