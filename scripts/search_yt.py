import urllib.request
import re
import json

url = 'https://www.youtube.com/results?search_query=The+Weeknd+Playboi+Carti+Timeless+official'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')
vids = list(dict.fromkeys(re.findall(r'"videoId":"([a-zA-Z0-9_-]{11})"', html)))
for vid in vids[:5]:
    try:
        r = urllib.request.urlopen(f'https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json')
        print(vid, json.loads(r.read().decode('utf-8')).get('title'))
    except Exception as e:
        print(vid, e)
