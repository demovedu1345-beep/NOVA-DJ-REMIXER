with open('public/js/engine/beat-analyzer.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(240, min(330, len(lines))):
    print(f"Line {i+1}: {lines[i].rstrip()}")
