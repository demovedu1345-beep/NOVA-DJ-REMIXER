with open(r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\public\naux\static\immutable\chunks\3cq6guoi7hqi2.js", "r", encoding="utf-8") as f:
    text = f.read()

idx1 = text.find('load(e,t){')
idx2 = text.find('arm(e,t,i){')
print("load(e,t) block:")
print(text[idx1:idx2])

idx3 = text.find('playIncoming(e){')
idx4 = text.find('failIncoming(e,t,i){')
print("\nplayIncoming(e) block:")
print(text[idx3:idx4])
