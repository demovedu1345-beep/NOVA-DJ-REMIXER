with open('public/js/ui/aurora-and-mix-engine.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Check where beatPulse is declared and used
import re
for m in re.finditer(r'beatPulse', text):
    start = max(0, m.start() - 40)
    end = min(len(text), m.end() + 60)
    print(f"Match at {m.start()}: {text[start:end].replace(chr(10), ' ')}")
