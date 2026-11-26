import urllib.request
import json

test_vids = {
    'Blinding Lights': '4NRXx6U8ABQ',
    'Starboy': '34Na4j8AVgA',
    'The Hills': 'yzTuBuRdAyA',
    'Save Your Tears': 'XXYlFuWEuKI',
    'Die For You': 'QLCpqdqeoII',
    'Can\'t Feel My Face': 'KEI4qS4P-3Y',
    'I Feel It Coming': 'qFLhGq0060w',
    'Earned It': 'waU75jdUnYw',
    'Call Out My Name': 'M4ZoCHID9GI',
    'Heartless': '1DpH-icPpl0',
    'Wicked Games': 'O1OTWCd40Bc',
    'Take My Breath': 'rhTl_OyehF8',
    'Popular': 'vt0i6nuqNEo',
    'Dancing In The Flames': 'MLlSSJ0z7xM',
    'Moth To A Flame': 'u9n7Cw-4_HQ',
    'Creepin': '61ymOWwOwuk'
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
