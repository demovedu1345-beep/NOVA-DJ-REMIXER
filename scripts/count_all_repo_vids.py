import os, glob, re

target_dirs = ['api', 'public', 'scripts', 'extracted_naux']
all_vids = set()

for d in target_dirs:
    for root, _, files in os.walk(d):
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext not in ['.js', '.json', '.html', '.mjs', '.py']: continue
            path = os.path.join(root, f)
            try:
                with open(path, 'r', encoding='utf-8', errors='ignore') as fp:
                    content = fp.read()
                matches = re.findall(r'(?:videoId["\'\s:]+|watch\?v=|vi/|embed/)([A-Za-z0-9_-]{11})', content)
                for m in matches:
                    if m not in ['BddP6PYo2gs', '7PCkvCPvDXk', 'vX2cDW8LUWk']:
                        all_vids.add(m)
            except:
                pass

print(f'Total distinct 11-char YouTube video IDs: {len(all_vids)}')
