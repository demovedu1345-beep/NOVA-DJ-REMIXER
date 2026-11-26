import os

for f in ['public/js/engine/pro-mixer-engine.js', 'public/js/engine/player-engine.js', 'public/js/engine/background-audio.js']:
    if os.path.exists(f):
        print(f"\n--- {f} ---")
        with open(f, 'r', encoding='utf-8') as fp:
            c = fp.read()
            print("Length:", len(c))
            for term in ['bpm', 'tempo', 'beat', 'analyser', 'AudioContext']:
                print(f"  Count of '{term}':", c.count(term))
