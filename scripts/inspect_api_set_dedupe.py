with open('api/set.js', 'r', encoding='utf-8') as f:
    code = f.read()

import re
print("api/set.js length:", len(code))
idx = code.find('seenVideos')
if idx != -1:
    print(code[max(0, idx-50):min(len(code), idx+300)])
else:
    print("seenVideos not found, searching videoId:")
    for m in re.finditer(r'videoId', code):
        print(code[max(0, m.start()-40):min(len(code), m.start()+100)])
        break
