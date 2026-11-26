import urllib.request, json

req = urllib.request.Request(
    'https://audifydj.vercel.app/api/artists?lang=english&sub=pop',
    headers={'Accept': 'application/json'}
)
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode('utf-8'))

artists = data.get('artists', [])
print(f"Production /api/artists returned {len(artists)} English Pop artists:")
for a in artists[:6]:
    print(f'  - {a.get("name")} ({a.get("id")}) [{a.get("country")}] - {a.get("songsCount")} songs')
