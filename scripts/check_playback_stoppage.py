import re

print("Analyzing why songs might stop after 1-2 seconds...")

with open('public/naux/static/immutable/chunks/3cq6guoi7hqi2.js', 'r', encoding='utf-8', errors='ignore') as f:
    engine_code = f.read()

# Let's inspect everything around pauseVideo and requestHandoff
for m in re.finditer(r'pauseVideo', engine_code):
    start = max(0, m.start() - 150)
    end = min(len(engine_code), m.end() + 150)
    print("--- PAUSEVIDEO OCCURRENCE ---")
    print(engine_code[start:end])
    print()
