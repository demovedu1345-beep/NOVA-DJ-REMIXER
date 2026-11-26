import urllib.request
import json

check_list = {
    # Bruno Mars
    "Bruno Mars - That's What I Like": "PMivT7MJ41M",
    "ROSE & Bruno Mars - APT.": "ekr2nIex040",
    # Drake
    "Drake - Hotline Bling": "uxpDa-c-4Mc",
    "Drake - God's Plan": "xpVfcZ0ZcFM",
    "Drake - In My Feelings": "DRS_PpOrUZ4",
    # Taylor Swift
    "Taylor Swift - Cruel Summer": "ic8j13piAhQ",
    "Taylor Swift - Blank Space": "e-ORhEE9VVg",
    # Ed Sheeran
    "Ed Sheeran - Shape of You": "JGwWNGJdvx8",
    "Ed Sheeran - Perfect": "2Vv-BfVoq4g",
    "Ed Sheeran - Galway Girl": "87gWaABqGYs",
    "Ed Sheeran - Happier": "iWZmdoY1aTE"
}

for name, vid in check_list.items():
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=4) as res:
            d = json.loads(res.read().decode())
            print(f"OK: {name} ({vid}) -> '{d.get('title')}'")
    except Exception as e:
        print(f"FAIL: {name} ({vid}) -> {e}")
