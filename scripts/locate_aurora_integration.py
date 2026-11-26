with open('public/js/ui/aurora-and-mix-engine.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Locate pillGroup.innerHTML
p_idx = code.find('pillGroup.innerHTML = `')
print("pillGroup.innerHTML found at:", p_idx)
print(code[p_idx:p_idx+800])

# Locate render beatPulse decay
r_idx = code.find('// Smooth beat decay & flow velocity')
print("render beatPulse found at:", r_idx)
print(code[r_idx:r_idx+400])
