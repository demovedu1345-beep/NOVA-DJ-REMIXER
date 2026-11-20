import subprocess
import json

test_queries = [
    ("Blinding Lights", "The Weeknd", "4NRXx6U8ABQ"),
    ("Shape of You", "Ed Sheeran", "JGwWNGJdvx8"),
    ("Perfect", "Ed Sheeran", "2Vv-BfVoq4g"),
    ("Espresso", "Sabrina Carpenter", "eVli-tstM5E"),
    ("Flowers", "Miley Cyrus", "G7KNmW9a75Y")
]

for title, artist, vid in test_queries:
    cmd = f'yt-dlp "https://www.youtube.com/watch?v={vid}" --print "%(id)s|%(title)s|%(duration)s" --no-warnings'
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    out = res.stdout.strip().split("\n")[-1]
    print(f"{title}: {out}")
