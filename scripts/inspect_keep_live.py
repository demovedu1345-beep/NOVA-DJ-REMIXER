with open(r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\public\naux\static\immutable\chunks\3cq6guoi7hqi2.js", "r", encoding="utf-8") as f:
    text = f.read()

idx = text.find('keepLiveAudible(){')
print("keepLiveAudible at:", idx)
if idx != -1:
    print(text[idx:idx + 600])
