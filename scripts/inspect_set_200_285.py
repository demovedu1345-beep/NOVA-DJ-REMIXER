with open('api/set.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(195, min(290, len(lines))):
    print(f"Line {i+1}: {lines[i].rstrip()}")
