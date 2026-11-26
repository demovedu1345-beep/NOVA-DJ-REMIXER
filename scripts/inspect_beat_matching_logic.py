with open('public/js/engine/beat-analyzer.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(120, min(240, len(lines))):
    print(f"Line {i+1}: {lines[i].rstrip()}")
