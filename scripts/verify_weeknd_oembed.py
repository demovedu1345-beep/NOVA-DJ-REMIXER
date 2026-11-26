import urllib.request
import json

weeknd_tracks = {
    "Blinding Lights": "4NRXx6U8ABQ",
    "Starboy": "34Na4j8AVgA",
    "The Hills": "yzTuBuRdAyA",
    "Save Your Tears": "XXYlFuWEuKI",
    "Die For You": "QLCpqdqeoII",
    "Can't Feel My Face": "dqt8Z1k0oWQ",
    "I Feel It Coming": "qFLhGq0060w",
    "Earned It": "waU75jdUnYw",
    "Call Out My Name": "M4ZoCHID9GI",
    "Heartless": "1DpH-icPpl0",
    "Take My Breath": "rhTl_OyehF8",
    "Popular": "vt0i6nuqNEo",
    "Dancing In The Flames": "MLlSSJ0z7xM",
    "Moth To A Flame": "u9n7Cw-4_HQ",
    "Creepin'": "61ymOWwOwuk",
    "Wicked Games": "O1OTWCd40bc",
    "In Your Eyes": "dqRZDebPIGs",
    "Often": "JPIhUaONiLU",
    "Timeless": "16jA-6hiSUo"
}

for title, vid in weeknd_tracks.items():
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as res:
            data = json.loads(res.read().decode())
            print(f"OK: {title} ({vid}) -> '{data.get('title')}' by '{data.get('author_name')}'")
    except Exception as e:
        print(f"FAILED: {title} ({vid}) -> {e}")
