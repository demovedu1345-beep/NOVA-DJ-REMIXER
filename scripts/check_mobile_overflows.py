with open('public/styles/artist-explorer.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Let's inspect mobile rules
print("Length of artist-explorer.css:", len(css))
import re
print("Mobile rules count:", len(re.findall(r'@media[^{]+{[^}]+}', css)))
