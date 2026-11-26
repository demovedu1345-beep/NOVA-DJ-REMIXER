import glob
import re

files = glob.glob('public/**/*.js', recursive=True) + glob.glob('public/**/*.html', recursive=True)

for f in files:
    try:
        with open(f, 'r', encoding='utf-8') as fp:
            content = fp.read()
        if 'BROWSE BY LANGUAGE' in content or '12 LANGUAGES' in content:
            print(f"Found match in {f}")
            for m in re.finditer(r'(?:BROWSE BY LANGUAGE|12 LANGUAGES)[^\n]{0,200}', content):
                print("  ", m.group(0))
    except Exception as e:
        pass
