with open('public/js/engine/pro-mixer-engine.js', 'r', encoding='utf-8') as f:
    c = f.read()

idx = c.find('analyzeTrack')
if idx == -1:
    idx = c.find('analysis =')
if idx != -1:
    print(c[idx:idx+1200])
else:
    print("Not found directly, searching for .analysis")
    m = c.find('this.analysis')
    print(c[m:m+1200] if m != -1 else "None")
