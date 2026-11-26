import re

files_to_check = [
    'public/js/ui/app.js',
    'public/index.html',
    'public/songs.html',
    'public/naux/static/immutable/chunks/3cq6guoi7hqi2.js'
]

for fp in files_to_check:
    try:
        with open(fp, 'r', encoding='utf-8') as f:
            c = f.read()
            m = re.findall(r'Made [^<>\n"]+', c)
            if m:
                print(f"{fp}: {m}")
    except Exception as e:
        print(f"Error {fp}: {e}")
