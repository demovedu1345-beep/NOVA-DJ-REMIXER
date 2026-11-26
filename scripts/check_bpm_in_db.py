import re

with open('api/_lib/curated-songs-db.js', 'r', encoding='utf-8') as f:
    c = f.read(50000)

has_bpm = '"bpm"' in c or "'bpm'" in c
has_tempo = '"tempo"' in c or "'tempo'" in c
print("Has bpm:", has_bpm, "Has tempo:", has_tempo)
