import urllib.request
import json

def check_video(vid):
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as res:
            data = json.loads(res.read().decode('utf-8'))
            print(f"Video {vid} title: {data.get('title')} (Author: {data.get('author_name')})")
    except Exception as e:
        print(f"Video {vid} error: {e}")

check_video("dCmp56tSSmA")
