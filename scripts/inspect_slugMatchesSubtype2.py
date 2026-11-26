with open('api/set.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(58, 115):
    print(f"Line {i+1}: {lines[i].rstrip()}")
