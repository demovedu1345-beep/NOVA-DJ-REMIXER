import json, re

with open(r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\api\_lib\curated-songs-db.js", "r", encoding="utf-8") as f:
    text = f.read()

# Find all english categories
eng_cats = re.findall(r'"(english-[a-z0-9\-]+)":\s*\{([^\}]+?"songs":\s*\[(.*?)\]\s*\})', text, re.DOTALL)
print(f"Found {len(eng_cats)} english categories")

# Let's inspect all songs in english categories for Indian artists / keywords
indian_keywords = [
    'kumar', 'singh', 'shreya', 'arijit', 'badshah', 'sonu', 'pritam', 'neha', 'kakkar',
    'atif', 'aslam', 'armaan', 'malik', 'jubin', 'nautiyal', 'vishal', 'shekhar', 'sunidhi',
    'chohan', 'kanika', 'kapoor', 'mika', 'honey singh', 'yo yo', 'diljit', 'dosanjh',
    'karan', 'aujla', 'sidhu', 'moose', 'devi sri', 'dsp', 'puneeth', 'rajkumar', 'anirudh',
    'ar rahman', 'rahman', 'thaman', 'sid sriram', 'amit trivedi', 'harshdeep', 'jasleen',
    'b praak', 'jaani', 'gurinder', 'ap dhillon', 'shubh', 'divine', 'emiway', 'raftaar',
    'mc stan', 'king', 'ikka', 'alka yagnik', 'udit narayan', 'kumar sanu', 'lata', 'kishore',
    'rafi', 'mukesh', 'asha', 'rd burman', 'sd burman', 'anuradha', 'kavita', 'shankardas'
]

suspects = []

# Better regex to extract songs from JS file
pattern = r'\{\s*"id":\s*"(english-[^"]+)",\s*"title":\s*"([^"]+)",\s*"artist":\s*"([^"]+)"'
all_songs = re.findall(pattern, text)
print(f"Total songs matched in english categories: {len(all_songs)}")

for song_id, title, artist in all_songs:
    art_lower = artist.lower()
    title_lower = title.lower()
    for kw in indian_keywords:
        if re.search(r'\b' + re.escape(kw) + r'\b', art_lower) or re.search(r'\b' + re.escape(kw) + r'\b', title_lower):
            suspects.append((song_id, title, artist, kw))
            break

print(f"\nTotal suspects found in English categories: {len(suspects)}")
for s in suspects:
    print(f"  {s[0]} | Title: {s[1]} | Artist: {s[2]} | Keyword: {s[3]}")
