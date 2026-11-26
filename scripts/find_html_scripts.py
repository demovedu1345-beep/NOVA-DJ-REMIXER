import glob

for f in glob.glob('public/**/*.html', recursive=True):
    try:
        with open(f, 'r', encoding='utf-8') as fp:
            txt = fp.read()
        if 'aurora' in txt or 'artist-explorer' in txt:
            print(f"=== {f} ===")
            for line in txt.split('\n'):
                if any(k in line for k in ['script', 'link', 'css', 'aurora', 'artist']):
                    print("  ", line.strip())
    except:
        pass
