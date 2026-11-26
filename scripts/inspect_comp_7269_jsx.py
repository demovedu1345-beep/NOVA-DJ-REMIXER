with open(r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\scripts\comp_7269.txt", "r", encoding="utf-8") as f:
    text = f.read()

# Let's search for return (0,t.jsxs) or return (0,t.jsx)
import re
returns = [m.start() for m in re.finditer(r'return\s*\(\d+,t\.jsx', text)]
print("Returns count:", len(returns))
for idx in returns[-3:]:
    print("--- Return at", idx, "---")
    print(text[idx:idx+1500])
