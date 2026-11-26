import re

def check():
    with open('public/naux/static/immutable/chunks/3cq6guoi7hqi2.js', 'r', encoding='utf-8') as f:
        code_3cq = f.read()

    print("=== 3cq6guoi7hqi2.js ===")
    print("Has 'function p({title:e,sub:i,onBack:s,children:n}){return(0,t.jsxs)(\"section\"':", 
          'function p({title:e,sub:i,onBack:s,children:n}){return(0,t.jsxs)("section"' in code_3cq)
    print("Has 'pb-56 pt-10 md:px-10 md:pb-44':", 
          'pb-56 pt-10 md:px-10 md:pb-44' in code_3cq)
    print("Has 'Select Regional Languages:':", 
          'Select Regional Languages:' in code_3cq)

    with open('public/js/ui/app.js', 'r', encoding='utf-8') as f:
        code_app = f.read()

    print("\n=== app.js ===")
    print("Has 'Select Regional Languages:':", 
          'Select Regional Languages:' in code_app)
    print("Has 'pb-36':", 
          'pb-36' in code_app)
    print("Has 'WIZARD_LANGUAGES':", 
          'WIZARD_LANGUAGES' in code_app)

if __name__ == '__main__':
    check()
