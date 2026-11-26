import urllib.request
import json

test_vids = {
    "circles": "wXhTHyIgQ_U",
    "stronger": "gG_dA32oH44",
    "jolene": "L0eeSoU35wM",
    "kill_bill": "r7qovpFAGrQ",
    "snooze": "6bOIhpff7s0",
    "wonderful_world": "A3yCcXgbKrE",
    "feeling_good": "oHs98TEYecM",
    "dancing_queen": "xXW7EC7VU2w"
}

for name, vid in test_vids.items():
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=4) as res:
            d = json.loads(res.read().decode('utf-8'))
            print(f"OK: {name} -> {d.get('title')} [{vid}]")
    except Exception as e:
        print(f"FAILED: {name} ({vid}) -> {e}")
