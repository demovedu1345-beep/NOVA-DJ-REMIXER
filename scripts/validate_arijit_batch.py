import urllib.request
import json

arijit_checks = {
    "Kesariya": "BddP6PYo2gs",
    "Tum Hi Ho": "IJq0cmW6HQQ",
    "Channa Mereya": "bzSTpdcs-EI",
    "Ae Dil Hai Mushkil": "6FURuLYrR_Q",
    "Shayad": "e1BTIauJimM",
    "Apna Bana Le": "ElZfdU54Cp8",
    "Kalank": "Grr0Wy8Ja1I",
    "Tujhe Kitna Chahne Lage": "AFtzdc__K5Y",
    "Gerua": "AEIVhBS6baE",
    "Hawayein": "cYOB941gyXI",
    "Agar Tum Saath Ho": "xRb8hxwN5zc",
    "Khairiyat": "hoNb6HuNmU0",
    "Zaalima": "hhdSyH4QCqA",
    "Chaleya": "VAdGW7QDJUI",
    "Satranga": "HrnrqYxYrbk",
    "O Maahi": "pzg-S0n8j7I",
    "Tum Kya Mile": "87JIOAX3njM"
}

for name, vid in arijit_checks.items():
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=4) as res:
            d = json.loads(res.read().decode())
            print(f"OK: {name} ({vid}) -> '{d.get('title')}'")
    except Exception as e:
        print(f"FAIL: {name} ({vid}) -> {e}")
