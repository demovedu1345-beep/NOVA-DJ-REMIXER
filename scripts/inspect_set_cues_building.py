with open('api/set.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'matchedCategories' in l or 'CURATED_CATEGORIES_DB' in l or 'cues' in l:
        print(f"Line {i+1}: {l.rstrip()}")
