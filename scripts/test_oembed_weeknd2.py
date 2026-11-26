import urllib.request
import json

test_vids = {
    'Can\'t Feel My Face': 'dqt8Z1k0oWQ',
    'Can\'t Feel My Face alt': '2iFaP_H0Zq0',
    'Wicked Games': 'kgo4a3sN5q4',
    'Wicked Games alt': 'O1OTWCd40Bc',
    'After Hours': 'ygTZZpVkm3o',
    'In Your Eyes': 'dqRZDebPIGs',
    'Often': 'JPIhUaONiLU'
}

for name, vid in test_vids.items():
    try:
        url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req, timeout=5)
        data = json.loads(res.read().decode('utf-8'))
        print(f"✔ {name} ({vid}): {data.get('title')} [{data.get('author_name')}]")
    except Exception as e:
        print(f"❌ {name} ({vid}): {e}")
