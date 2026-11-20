import re

def update_set_api():
    path = r'api/set.js'
    with open(path, 'r', encoding='utf-8') as f:
        code = f.read()

    # Add language counts to MASTER_COUNTS
    if '"language": 3118' not in code:
        old_mc = '"counts": {'
        new_mc = '''"counts": {
    "language": 3118,
    "language:punjabi": 1097,
    "language:marathi": 200,
    "language:gujarati": 221,
    "language:tamil-telugu": 400,
    "language:kannada": 200,
    "language:marwadi": 200,
    "language:odia": 200,
    "language:bhojpuri-haryanvi": 400,
    "language:haryanvi-bhojpuri": 400,'''
        code = code.replace(old_mc, new_mc, 1)

    # Update catMatchesLang
    if 'rl === \'language\'' not in code:
        old_cml = 'for (const rl of requestedLangs) {\n    if (cl === rl) return true;'
        new_cml = '''for (const rl of requestedLangs) {
    if (cl === rl) return true;
    if (rl === 'language' && cl !== 'hindi' && cl !== 'english') return true;'''
        code = code.replace(old_cml, new_cml, 1)

    # Update slugMatchesSubtype
    if 'lang === \'language\'' not in code:
        old_sms = 'const s = slug.toLowerCase();'
        new_sms = '''const s = slug.toLowerCase();
  if (lang === 'language') {
    if (bareSub === 'punjabi') return s.startsWith('punjabi');
    if (bareSub === 'marathi') return s.startsWith('marathi');
    if (bareSub === 'gujarati') return s.startsWith('gujarati');
    if (bareSub === 'tamil-telugu') return s.startsWith('tamil-telugu');
    if (bareSub === 'kannada') return s.startsWith('kannada');
    if (bareSub === 'marwadi') return s.startsWith('marwadi');
    if (bareSub === 'odia') return s.startsWith('odia');
    if (bareSub === 'haryanvi-bhojpuri' || bareSub === 'bhojpuri-haryanvi') return s.startsWith('haryanvi-bhojpuri');
  }'''
        code = code.replace(old_sms, new_sms, 1)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(code)
    print("Updated api/set.js successfully.")

def update_aurora_engine():
    path = r'public/js/ui/aurora-and-mix-engine.js'
    with open(path, 'r', encoding='utf-8') as f:
        code = f.read()

    # Remove the injected #audify-languages-section
    idx1 = code.find('// 2. Language Section')
    if idx1 != -1:
        idx2 = code.find('setInterval(injectPlayerControls', idx1)
        if idx2 != -1:
            code = code[:idx1] + code[idx2:]
            print("Removed bottom #audify-languages-section from aurora-and-mix-engine.js")

    with open(path, 'w', encoding='utf-8') as f:
        f.write(code)

def update_chunk_3cq():
    path = r'public/naux/static/immutable/chunks/3cq6guoi7hqi2.js'
    with open(path, 'r', encoding='utf-8') as f:
        code = f.read()

    # 1. Update Module 298 LANGUAGES
    old_mod298_marker = '298,e=>{"use strict";e.s(["LANGUAGES",0,['
    idx_m298 = code.find(old_mod298_marker)
    if idx_m298 != -1:
        end_m298 = code.find('],"MIN_LANGUAGE_SONGS",0,10,', idx_m298)
        new_languages = '''298,e=>{"use strict";e.s(["LANGUAGES",0,[{id:"hindi",label:"Hindi",subtypes:[{id:"diwali",label:"Diwali Party Songs"},{id:"dance",label:"Hindi Dance Songs"},{id:"romantic",label:"Hindi Romantic Songs"},{id:"retro",label:"Hindi Retro Songs"},{id:"sufi",label:"Hindi Sufi Songs"},{id:"hiphop",label:"Hindi Desi Pop Songs"}]},{id:"english",label:"English",subtypes:[{id:"pop",label:"English Pop Songs"},{id:"edm",label:"English EDM Songs"},{id:"hiphop",label:"English Hip-Hop Songs"},{id:"love",label:"English Love Songs"}]},{id:"language",label:"Language",subtypes:[{id:"punjabi",label:"Punjabi Hits"},{id:"marathi",label:"Marathi Hits"},{id:"gujarati",label:"Gujarati Garba"},{id:"tamil-telugu",label:"Tamil & Telugu Mass"},{id:"kannada",label:"Kannada Hits"},{id:"marwadi",label:"Marwadi / Rajasthani"},{id:"odia",label:"Odia Hits"},{id:"haryanvi-bhojpuri",label:"Haryanvi & Bhojpuri"}]}'''
        code = code[:idx_m298] + new_languages + code[end_m298:]
        print("Updated Module 298 LANGUAGES in 3cq6guoi7hqi2.js")

    # 2. Update Step 0 rendering to add the expandable subcategories right there
    old_step0 = '0===g&&(0,t.jsxs)(p,{title:"What are we playing?",sub:"Pick every language the room wants.",children:[(0,t.jsx)("div",{className:"grid gap-4 sm:grid-cols-2",children:s.LANGUAGES.filter(e=>k(e.id)>=s.MIN_LANGUAGE_SONGS).map(e=>(0,t.jsx)(x,{selected:y.includes(e.id),onClick:()=>w(S(y,e.id)),label:e.label,hint:`${k(e.id)} song${1===k(e.id)?"":"s"} ready`,dim:0===k(e.id)},e.id))}),s.LANGUAGES.some(e=>k(e.id)<s.MIN_LANGUAGE_SONGS)'
    new_step0 = '0===g&&(0,t.jsxs)(p,{title:"What are we playing?",sub:"Pick every language the room wants.",children:[(0,t.jsx)("div",{className:"grid gap-4 sm:grid-cols-3",children:s.LANGUAGES.filter(e=>k(e.id)>=s.MIN_LANGUAGE_SONGS).map(e=>(0,t.jsx)(x,{selected:y.includes(e.id),onClick:()=>w(S(y,e.id)),label:e.label,hint:`${k(e.id)} song${1===k(e.id)?"":"s"} ready`,dim:0===k(e.id)},e.id))}),y.includes("language")&&(0,t.jsxs)("div",{className:"mt-6 rounded-3xl border-2 border-lime/40 bg-white/5 p-5 md:p-6 transition-all duration-300",children:[(0,t.jsx)("h3",{className:"mb-4 font-display text-2xl uppercase tracking-wide text-lime",children:"Select Regional Languages:"}),(0,t.jsx)("div",{className:"grid gap-3 sm:grid-cols-2 md:grid-cols-4",children:s.LANGUAGES.find(e=>e.id==="language")?.subtypes.map(i=>{let subKey=`language:${i.id}`,cnt=k(i.id)||k("language",i.id)||200;return(0,t.jsx)(x,{selected:b.includes(subKey),onClick:()=>v(S(b,subKey)),label:i.label,hint:`${cnt} songs ready`,compact:!0},subKey)})})]}),s.LANGUAGES.some(e=>k(e.id)<s.MIN_LANGUAGE_SONGS)'

    if old_step0 in code:
        code = code.replace(old_step0, new_step0, 1)
        print("Updated Step 0 with in-place expandable Language subcategories in 3cq6guoi7hqi2.js")
    else:
        print("Warning: old_step0 exact match not found; looking for partial match...")
        idx_p = code.find('title:"What are we playing?"')
        print(code[idx_p:idx_p+400])

    with open(path, 'w', encoding='utf-8') as f:
        f.write(code)

if __name__ == '__main__':
    update_set_api()
    update_aurora_engine()
    update_chunk_3cq()
