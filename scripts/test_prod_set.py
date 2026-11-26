import urllib.request, json

req = urllib.request.Request(
    'https://audifydj.vercel.app/api/set',
    data=json.dumps({'answers': {'languages': ['english'], 'subtypes': ['english:rock']}}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode('utf-8'))

cues = data.get('cues', [])
print(f"Production /api/set returned {len(cues)} cues for English Rock:")
for c in cues[:6]:
    print(f'  - "{c.get("title")}" by {c.get("artist")} [{c.get("language")}]')
