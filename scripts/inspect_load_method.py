with open(r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\public\naux\static\immutable\chunks\3cq6guoi7hqi2.js", "r", encoding="utf-8") as f:
    text = f.read()

idx = text.find('load(e,t){')
print("load(e,t) at:", idx)
if idx != -1:
    print(text[idx:idx + 800])

idx2 = text.find('playIncoming(e){')
print("\nplayIncoming(e) at:", idx2)
if idx2 != -1:
    print(text[idx2:idx2 + 600])
