import re

path = 'public/naux/static/immutable/chunks/3cq6guoi7hqi2.js'
with open(path, 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update function p section class to include pb-36
target_p = 'function p({title:e,sub:i,onBack:s,children:n}){return(0,t.jsxs)("section",{className:"mt-[4vh] flex flex-1 flex-col md:mt-[6vh]",children:['
repl_p = 'function p({title:e,sub:i,onBack:s,children:n}){return(0,t.jsxs)("section",{className:"mt-[4vh] flex flex-1 flex-col md:mt-[6vh] pb-36",children:['

if target_p in code:
    code = code.replace(target_p, repl_p, 1)
    print("SUCCESS: Updated function p in 3cq6guoi7hqi2.js with pb-36")
else:
    print("WARNING: target_p not found")

# 2. Update main container pb-56 to valid pb-36
target_main = 'className:"mx-auto flex min-h-dvh max-w-6xl flex-col px-6 pb-56 pt-10 md:px-10 md:pb-44"'
repl_main = 'className:"mx-auto flex min-h-dvh max-w-6xl flex-col px-6 pb-36 pt-10 md:px-10 md:pb-44"'

if target_main in code:
    code = code.replace(target_main, repl_main, 1)
    print("SUCCESS: Updated main in 3cq6guoi7hqi2.js from pb-56 to pb-36 md:pb-44")
else:
    print("WARNING: target_main not found")

with open(path, 'w', encoding='utf-8') as f:
    f.write(code)
