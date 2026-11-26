with open(r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\scripts\comp_7269.txt", "r", encoding="utf-8") as f:
    text = f.read()

idx = text.find('ea=`${(2.6-.17*er).toFixed(2)}s`;return')
print("Found at:", idx)
print(text[idx+33:idx + 4500])
