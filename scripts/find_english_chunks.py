import glob, re

for p in glob.glob('public/naux/**/*.js', recursive=True):
    with open(p, 'r', encoding='utf-8') as f:
        text = f.read()
    if '"english"' in text:
        print('Found english in', p)
        for m in re.finditer(r'"english"', text):
            print(text[max(0, m.start()-50):m.end()+250])
            print('---')
