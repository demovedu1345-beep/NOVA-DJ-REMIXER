"""
scripts/patch_chunk_artists.py
Patches public/naux/static/immutable/chunks/3cq6guoi7hqi2.js to:
1. Expose window.__startSetWithCues = em
2. Wire clicking "Artists" in Step 1 to call window.openAudifyArtistExplorer(e.id)
"""

import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
chunk_path = os.path.join(ROOT, 'public/naux/static/immutable/chunks/3cq6guoi7hqi2.js')

with open(chunk_path, 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Expose window.__startSetWithCues
target1 = 'let em=(0,i.useCallback)(e=>{'
rep1 = 'let em=(0,i.useCallback)(e=>{(typeof window!=="undefined"&&(window.__startSetWithCues=em));'
if target1 in code and 'window.__startSetWithCues' not in code:
    code = code.replace(target1, rep1, 1)
    print("Exposed window.__startSetWithCues in 3cq6guoi7hqi2.js")
else:
    print("target1 already patched or not found")

# 2. Wire Step 1 Artists onClick
target2 = 'onClick:()=>v(S(b,s)),label:i.label,hint:`${n} ready`'
rep2 = 'onClick:()=>{if(i.id==="artists"){window.openAudifyArtistExplorer&&window.openAudifyArtistExplorer(e.id)}else{v(S(b,s))}},label:i.label,hint:`${n} ready`'
if target2 in code:
    code = code.replace(target2, rep2, 1)
    print("Wired Step 1 Artists card onClick in 3cq6guoi7hqi2.js")
else:
    print("target2 already patched or not found")

with open(chunk_path, 'w', encoding='utf-8') as f:
    f.write(code)

print("Finished patching 3cq6guoi7hqi2.js")
