import glob

for f in glob.glob('public/**/*.html', recursive=True):
    print(f)
