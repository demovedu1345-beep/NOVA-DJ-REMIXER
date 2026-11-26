with open('public/js/ui/app.js', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('Made with ❤️ By Vedant', 'Made With ❤️By Vedant & Kishu')
with open('public/js/ui/app.js', 'w', encoding='utf-8') as f:
    f.write(c)

print("Updated public/js/ui/app.js to Made With ❤️By Vedant & Kishu")
