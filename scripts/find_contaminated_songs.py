import re

english_categories = [
  "english-hiphop", "english-love", "english-breakup", "english-emotional",
  "english-trip", "english-dance", "english-workout", "english-chill",
  "english-indie", "english-pop", "english-rock", "english-rnb",
  "english-edm", "english-motivating", "english-friendship", "english-classicrock",
  "english-retro", "english-country", "english-jazz", "english-gospel",
  "english-classical", "english-metal", "english-club", "english-focus", "english-trending"
]

bollywood_clues = [
    'Arijit', 'Badshah', 'Neha Kakkar', 'Diljit', 'Sidhu', 'Shreya Ghoshal',
    'Yo Yo Honey Singh', 'Atif Aslam', 'Sunidhi', 'Sonu Nigam', 'Kumar Sanu',
    'Pritam', 'Vishal-Shekhar', 'Mika Singh', 'Kanika Kapoor', 'Guru Randhawa',
    'Lovely', 'Dance Pe Chance', 'Lungi Dance', 'Rock \'N\' Roll Soniye',
    'Desi Boyz', 'Chammak Challo', 'Kar Gayi Chull', 'Kala Chashma',
    'Tum Hi Ho', 'Kesariya', 'Apna Bana Le', 'Ghungroo', 'Nashe Si Chadh Gayi',
    'Raataan Lambiyan', 'Jai Jai Shivshankar', 'Badtameez Dil', 'Dilliwaali Girlfriend',
    'Gallan Goodiyaan', 'Malhari', 'Zingaat', 'Aankh Marey', 'Subha Hone Na De',
    'High Rated Gabru', 'Lahore', 'Proper Patola', 'Bom Diggy', 'Dilbar',
    'Kamariya', 'Garmi', 'Sauda Khara Khara', 'Makhna', 'Saaki Saaki', 'Hookah Bar',
    'Shah Rukh', 'Deepika', 'Ranbir', 'Salman', 'Katrina', 'Karan Johar', 'T-Series', 'Zee Music'
]

with open('api/_lib/curated-songs-db.js', 'r', encoding='utf-8') as f:
    current_cat = None
    in_songs = False
    current_song = {}
    contaminated_by_cat = {c: [] for c in english_categories}
    total_by_cat = {c: 0 for c in english_categories}
    
    for line in f:
        # Check category start
        for c in english_categories:
            if f'"{c}":' in line:
                current_cat = c
                break
        
        # If in an english category
        if current_cat:
            if '"title":' in line:
                m = re.search(r'"title":\s*"([^"]+)"', line)
                if m:
                    current_song['title'] = m.group(1)
            elif '"artist":' in line:
                m = re.search(r'"artist":\s*"([^"]+)"', line)
                if m:
                    current_song['artist'] = m.group(1)
            elif '"videoId":' in line:
                m = re.search(r'"videoId":\s*"([^"]+)"', line)
                if m:
                    current_song['videoId'] = m.group(1)
            elif line.strip().startswith('},') or line.strip() == '}':
                if 'title' in current_song:
                    total_by_cat[current_cat] += 1
                    t = current_song.get('title', '')
                    a = current_song.get('artist', '')
                    # Check if bollywood
                    for b in bollywood_clues:
                        if b.lower() in t.lower() or b.lower() in a.lower():
                            contaminated_by_cat[current_cat].append({
                                'title': t,
                                'artist': a,
                                'videoId': current_song.get('videoId', '')
                            })
                            break
                    current_song = {}
            # Check category end
            if line.strip() == '},' and current_song == {} and total_by_cat[current_cat] > 0:
                # Might be end of category
                pass
        # Check if next category started
        if line.startswith('  "') and current_cat and not any(f'"{current_cat}":' in line for _ in [1]):
            # If line is another category key
            m = re.match(r'^\s*"([^"]+)":', line)
            if m and m.group(1) != current_cat:
                current_cat = None

print("=== CONTAMINATION SUMMARY ===")
for cat, bad_songs in contaminated_by_cat.items():
    print(f"{cat}: Total {total_by_cat[cat]} songs | {len(bad_songs)} Bollywood contaminated")
    if bad_songs:
        for s in bad_songs[:5]:
            print(f"   -> {s['title']} by {s['artist']} ({s['videoId']})")
