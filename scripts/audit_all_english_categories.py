import re

with open(r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\api\_lib\curated-songs-db.js", "r", encoding="utf-8") as f:
    text = f.read()

# Parse categories using regex
cat_matches = list(re.finditer(r'^\s*"([a-z0-9\-]+)":\s*\{\s*"slug":\s*"[^"]+",\s*"label":\s*"([^"]+)",\s*"lang":\s*"([^"]+)"', text, re.MULTILINE))

print(f"Total categories parsed: {len(cat_matches)}")

for i, m in enumerate(cat_matches):
    slug = m.group(1)
    label = m.group(2)
    lang = m.group(3)
    start_pos = m.start()
    end_pos = cat_matches[i+1].start() if i + 1 < len(cat_matches) else len(text)
    cat_chunk = text[start_pos:end_pos]
    
    songs = re.findall(r'\{\s*"id":\s*"[^"]+",\s*"title":\s*"([^"]+)",\s*"artist":\s*"([^"]+)"', cat_chunk)
    
    # Check if this category is English
    if lang == 'english' or slug.startswith('english'):
        # Check songs for non-english titles or artists
        bad_in_eng = []
        for title, artist in songs:
            # Check for non-latin or known indian names/terms
            lower = (title + " " + artist).lower()
            if any(term in lower for term in [
                'sambalpuri', 'appu', 'puneeth', 'devi sri', 'kumar sanu', 'arijit', 'badshah', 
                'geet', 'nacho', 'desi', 'dhol', 'garba', 'bhangra', 'punjabi', 'bollywood',
                'hindi', 'tamil', 'telugu', 'kannada', 'malayalam', 'marathi', 'gujarati', 'odia'
            ]):
                bad_in_eng.append((title, artist))
        if bad_in_eng:
            print(f"❌ {slug} ({label}) has {len(bad_in_eng)} Indian/non-English songs! Examples:")
            for b_title, b_artist in bad_in_eng[:5]:
                print(f"     - {b_title} by {b_artist}")
        else:
            print(f"✓ {slug} ({label}) - {len(songs)} songs, clean.")
