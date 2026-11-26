import urllib.request
import json

tests = {
    "Tum Hi Ho (Umqb9KENgmk)": "Umqb9KENgmk",
    "Chaleya (VAdGW7QDJUI)": "sAZZz2tQ73o",
    "Chaleya 2 (1F3hm63CEHQ)": "1F3hm63CEHQ",
    "Kalank (j6J_GfZ7JpE)": "j6J_GfZ7JpE",
    "Kalank 2 (Grr0Wy8Ja1I)": "Grr0Wy8Ja1I",
    "Shayad (vvyi_H78dIs)": "vvyi_H78dIs",
    "Shayad 2 (caF_Ff466kY)": "caF_Ff466kY",
    "Tujhe Kitna Chahne Lage (wskn_N8K31s)": "wskn_N8K31s",
    "Tujhe Kitna Chahne Lage 2 (2o418u2714Y)": "2o418u2714Y",
    "O Maahi (8u_a2839b1k)": "pzgS0n8j7I",
    "O Maahi 2 (hcm55lU9knw)": "hcm55lU9knw",
    "Zaalima (hhdSyH4QCqA)": "lpdRqn6xO9Y"
}

for name, vid in tests.items():
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=4) as res:
            d = json.loads(res.read().decode())
            print(f"OK: {name} ({vid}) -> '{d.get('title')}'")
    except Exception as e:
        print(f"FAIL: {name} ({vid}) -> {e}")
