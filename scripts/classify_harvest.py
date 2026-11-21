import os, json

with open('scripts/harvest_pool.py', 'r', encoding='utf-8') as f:
    pass

# Let's write an analyzer
from harvest_pool import all_songs

hindi_like = []
english_like = []
punjabi_like = []
others = []

for s in all_songs:
    title = s.get('title', '').lower()
    artist = s.get('artist', '').lower()
    combined = title + ' ' + artist
    
    # Simple heuristic
    if any(k in artist for k in ['arijit', 'badshah', 'shreya', 'sonu nigam', 'sunidhi', 'pritam', 'neha kakkar', 'honey singh', 'divine', 'kr$na', 'raftaar', 'vishal', 'darshan raval', 'b praak', 'mohit chauhan', 'atif aslam', 'jubin nautiyal', 'kk', 'anuv jain', 'prateek kuhad', 'king', 'mc stan', 'lata mangeshkar', 'kishore kumar', 'rafi', 'mukesh', 'asha bhosle', 'ar rahman', 'shankar mahadevan', 'amit trivedi', 'lucky ali']):
        hindi_like.append(s)
    elif any(k in artist for k in ['weeknd', 'taylor swift', 'ed sheeran', 'bruno mars', 'bieber', 'adele', 'rihanna', 'drake', 'kendrick', 'eminem', 'travis scott', 'post malone', 'billie eilish', 'dua lipa', 'ariana grande', 'lady gaga', 'coldplay', 'imagine dragons', 'linkin park', 'chainsmokers', 'guetta', 'calvin harris', 'sza', 'beyonce', 'harry styles', 'shawn mendes', 'olivia rodrigo', 'doja cat', 'lana del rey', 'sam smith', 'arctic monkeys', 'maroon 5', 'avicii', 'queen', 'michael jackson', 'dua lipa', 'charlie puth', 'maroon', 'shakira', 'marshmello', 'alan walker']):
        english_like.append(s)
    elif any(k in artist for k in ['diljit', 'sidhu moose', 'karan aujla', 'ap dhillon', 'shubh', 'amrit maan', 'jassi gill', 'guru randhawa', 'hardy sandhu', 'babbu maan']):
        punjabi_like.append(s)
    else:
        others.append(s)

print(f"Hindi artists matched: {len(hindi_like)}")
print(f"English artists matched: {len(english_like)}")
print(f"Punjabi artists matched: {len(punjabi_like)}")
print(f"Others/Unclassified: {len(others)}")
