import subprocess
import json
import urllib.request
import time

songs_to_resolve = [
    # Pop songs needing real IDs
    {"cat": "pop", "title": "Starboy", "artist": "The Weeknd ft. Daft Punk", "year": "2016", "query": "The Weeknd Starboy official music video"},
    {"cat": "pop", "title": "Uptown Funk", "artist": "Mark Ronson ft. Bruno Mars", "year": "2014", "query": "Mark Ronson Uptown Funk ft Bruno Mars official video"},
    {"cat": "pop", "title": "STAY", "artist": "The Kid LAROI & Justin Bieber", "year": "2021", "query": "The Kid LAROI Justin Bieber STAY official video"},
    {"cat": "pop", "title": "As It Was", "artist": "Harry Styles", "year": "2022", "query": "Harry Styles As It Was official video"},
    {"cat": "pop", "title": "Please Please Please", "artist": "Sabrina Carpenter", "year": "2024", "query": "Sabrina Carpenter Please Please Please official video"},
    {"cat": "pop", "title": "Flowers", "artist": "Miley Cyrus", "year": "2023", "query": "Miley Cyrus Flowers official video"},
    {"cat": "pop", "title": "Cheap Thrills", "artist": "Sia ft. Sean Paul", "year": "2016", "query": "Sia Cheap Thrills Lyric Video ft Sean Paul"},
    {"cat": "pop", "title": "Havana", "artist": "Camila Cabello ft. Young Thug", "year": "2017", "query": "Camila Cabello Havana official music video"},
    {"cat": "pop", "title": "Closer", "artist": "The Chainsmokers ft. Halsey", "year": "2016", "query": "The Chainsmokers Closer lyric video Halsey"},
    {"cat": "pop", "title": "Bad Romance", "artist": "Lady Gaga", "year": "2009", "query": "Lady Gaga Bad Romance official music video"},
    {"cat": "pop", "title": "vampire", "artist": "Olivia Rodrigo", "year": "2023", "query": "Olivia Rodrigo vampire official music video"},
    {"cat": "pop", "title": "Something Just Like This", "artist": "The Chainsmokers & Coldplay", "year": "2017", "query": "The Chainsmokers Coldplay Something Just Like This lyric video"},

    # Love songs needing real IDs
    {"cat": "love", "title": "Until I Found You", "artist": "Stephen Sanchez", "year": "2021", "query": "Stephen Sanchez Until I Found You official video"},
    {"cat": "love", "title": "double take", "artist": "dhruv", "year": "2019", "query": "dhruv double take official audio video"},
    {"cat": "love", "title": "Die For You", "artist": "The Weeknd", "year": "2016", "query": "The Weeknd Die For You official music video"},
    {"cat": "love", "title": "Adore You", "artist": "Harry Styles", "year": "2019", "query": "Harry Styles Adore You official video"},
    {"cat": "love", "title": "Enchanted (Taylor's Version)", "artist": "Taylor Swift", "year": "2023", "query": "Taylor Swift Enchanted Taylor's Version lyric video"},
    {"cat": "love", "title": "Shallow", "artist": "Lady Gaga & Bradley Cooper", "year": "2018", "query": "Lady Gaga Bradley Cooper Shallow music video"},
    {"cat": "love", "title": "Before You Go", "artist": "Lewis Capaldi", "year": "2019", "query": "Lewis Capaldi Before You Go official video"},
    {"cat": "love", "title": "You Are The Reason", "artist": "Calum Scott", "year": "2017", "query": "Calum Scott You Are The Reason official video"},
    {"cat": "love", "title": "I'm Yours", "artist": "Jason Mraz", "year": "2008", "query": "Jason Mraz I'm Yours official video"},
    {"cat": "love", "title": "Put Your Records On", "artist": "Corinne Bailey Rae", "year": "2006", "query": "Corinne Bailey Rae Put Your Records On official video"},
    {"cat": "love", "title": "Can't Help Falling in Love", "artist": "Haley Reinhart", "year": "2015", "query": "Haley Reinhart Can't Help Falling in Love official video"},
    {"cat": "love", "title": "Here With Me", "artist": "d4vd", "year": "2022", "query": "d4vd Here With Me official video"},
    {"cat": "love", "title": "Romantic Homicide", "artist": "d4vd", "year": "2022", "query": "d4vd Romantic Homicide official video"},
    {"cat": "love", "title": "Pointless", "artist": "Lewis Capaldi", "year": "2022", "query": "Lewis Capaldi Pointless official video"}
]

print(f"Resolving {len(songs_to_resolve)} songs with yt-dlp...")
resolved = []

for s in songs_to_resolve:
    q = s["query"]
    cmd = f'yt-dlp "ytsearch1:{q}" --print "%(id)s|%(title)s|%(duration)s" --no-warnings'
    try:
        res = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=15)
        lines = [l for l in res.stdout.strip().split("\n") if "|" in l]
        if lines:
            parts = lines[-1].split("|")
            vid = parts[0]
            vtitle = parts[1]
            dur = int(float(parts[2])) if len(parts) > 2 and parts[2] else 210
            s["videoId"] = vid
            s["ytTitle"] = vtitle
            s["durationSec"] = dur
            resolved.append(s)
            print(f"[RESOLVED] {s['title']} -> {vid} | {vtitle} ({dur}s)")
        else:
            print(f"[FAIL] {s['title']} - no line output: {res.stderr}")
    except Exception as e:
        print(f"[ERROR] {s['title']}: {e}")

with open("resolved_songs.json", "w", encoding="utf-8") as f:
    json.dump(resolved, f, indent=2)

print(f"Done resolving! Saved {len(resolved)} to resolved_songs.json")
