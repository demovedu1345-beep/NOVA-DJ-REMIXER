with open('public/naux/static/immutable/chunks/3cq6guoi7hqi2.js', 'r', encoding='utf-8') as f:
    c = f.read()

target = r'''(0,t.jsxs)("p",{className:"mt-3 text-base text-white/45 md:text-lg",children:["Plays through YouTube: with YouTube Premium there are no ads. Best on a laptop plugged into a speaker",w&&(0,t.jsx)("span",{className:"text-lime",children:" · iPhones and iPads can't crossfade, so songs will cut instead of mixing"}),"."]})'''

replacement = r'''(0,t.jsx)("p",{className:"hidden",children:null})'''

if target in c:
    c = c.replace(target, replacement)
    with open('public/naux/static/immutable/chunks/3cq6guoi7hqi2.js', 'w', encoding='utf-8') as f:
        f.write(c)
    print("Successfully removed 'Plays through YouTube' paragraph from 3cq6guoi7hqi2.js")
else:
    print("Target string not found directly in 3cq6guoi7hqi2.js, checking regex")

# Check public/index.html
with open('public/index.html', 'r', encoding='utf-8') as f:
    idx_c = f.read()

if 'Plays through YouTube' in idx_c:
    print("Found in public/index.html, removing...")
    idx_c = idx_c.replace("Plays through YouTube", "")
    with open('public/index.html', 'w', encoding='utf-8') as f:
        f.write(idx_c)
else:
    print("Not in public/index.html")
