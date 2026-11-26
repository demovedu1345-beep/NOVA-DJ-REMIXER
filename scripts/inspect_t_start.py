with open(r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\public\naux\static\immutable\chunks\3cq6guoi7hqi2.js", "r", encoding="utf-8") as f:
    text = f.read()

idx = text.find('start(e){')
if idx == -1:
    idx = text.find('.start=')
if idx == -1:
    idx = text.find('start(')

print("start at:", idx)
print(text[max(0, idx - 100):min(len(text), idx + 600)])
