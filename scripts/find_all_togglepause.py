import glob, re

for f in glob.glob('public/**/*.js', recursive=True):
    try:
        with open(f, 'r', encoding='utf-8') as fp:
            txt = fp.read()
        for m in re.finditer(r'togglePause', txt):
            idx = m.start()
            print(f, idx, txt[max(0, idx-80):min(len(txt), idx+120)])
    except:
        pass
