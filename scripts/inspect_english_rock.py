import json

with open('api/_lib/curated-songs-db.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's inspect the last 15 songs of english-rock
m = text.find('"english-rock":')
if m != -1:
    end = text.find('  "english-', m + 20)
    if end == -1:
        end = m + 50000
    section = text[m:end]
    print("Length of english-rock section:", len(section))
    # print the last 2000 chars of this section
    print(section[-2500:])
