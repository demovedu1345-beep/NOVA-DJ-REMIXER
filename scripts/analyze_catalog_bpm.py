import json
import re

GENRE_BPM = {
    # Bollywood & Hindi
    "party": 128,
    "dance": 128,
    "club": 126,
    "diwali": 128,
    "retro": 120,
    "romantic": 86,
    "love": 86,
    "sad": 78,
    "emotional": 78,
    "breakup": 82,
    "trip": 96,
    "motivating": 124,
    "workout": 130,
    "gym": 130,
    "indie": 92,
    "chill": 84,
    "acoustic": 84,
    "rock": 132,
    "metal": 140,
    "classicrock": 124,
    "country": 94,
    "jazz": 90,
    "gospel": 110,
    "classical": 76,
    "focus": 80,
    "trending": 122,
    "pop": 120,
    "hiphop": 90,
    "rnb": 88,
    "edm": 128,
    
    # Regional
    "punjabi": 98,
    "punjabi-party": 102,
    "punjabi-wedding": 98,
    "punjabi-sad": 78,
    "punjabi-gym": 104,
    "tamil-telugu": 134,
    "kuthu": 138,
    "mass": 132,
    "gujarati": 116,
    "garba": 118,
    "marathi": 126,
    "marwadi": 110,
    "haryanvi-bhojpuri": 130,
    "kannada": 124,
    "odia": 120
}

print("Genre BPM mapping established with 35 specific musical tempos.")
