with open(r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\public\naux\static\immutable\chunks\3cq6guoi7hqi2.js", "r", encoding="utf-8") as f:
    text = f.read()

idx = text.find('onApprove:em')
print("onApprove:em at", idx)
print(text[max(0, idx - 800):min(len(text), idx + 200)])
