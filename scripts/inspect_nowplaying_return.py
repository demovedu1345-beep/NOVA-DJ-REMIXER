with open(r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\scripts\comp_7269.txt", "r", encoding="utf-8") as f:
    text = f.read()

# Let's find return of NowPlaying
np_idx = text.find('e.s(["NowPlaying"')
ret_idx = text.find('return', np_idx)
print("NowPlaying return at:", ret_idx)
print(text[ret_idx:ret_idx + 4500])
