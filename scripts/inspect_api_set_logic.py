with open('api/set.js', 'r', encoding='utf-8') as f:
    c = f.read()

# Let's inspect catMatchesLang and how categories are selected
import re
print("Length of api/set.js:", len(c))
idx = c.find('catMatchesLang')
if idx != -1:
    print(c[idx:idx+1500])
else:
    print("catMatchesLang not found, let's search for language")
