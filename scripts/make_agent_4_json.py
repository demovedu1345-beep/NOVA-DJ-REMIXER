import json
import sys
sys.path.append('scripts')
import build_agent_4_data

kuthu = build_agent_4_data.KUTHU_RAW
mass = build_agent_4_data.MASS_RAW

def format_songs(songs, slug):
    res = []
    for idx, s in enumerate(songs):
        dur = s.get('durationSec', 240)
        h_start = s.get('hookStartSec', 35)
        h_end = s.get('hookEndSec', 75)
        v_id = s.get('videoId') or 'fRD_3vJagxk'
        res.append({
            'title': s['title'],
            'artist': f"{s['artist']} ({s.get('movie', '')})",
            'year': s.get('year', '2023'),
            'durationSec': dur,
            'hookStartSec': h_start,
            'hookEndSec': h_end,
            'entrySec': h_start,
            'exitSec': h_end,
            'videoId': v_id,
            'energy': s.get('energy', 9)
        })
    return res

out = {
    'tamil-telugu-kuthu': format_songs(kuthu, 'tamil-telugu-kuthu'),
    'tamil-telugu-mass': format_songs(mass, 'tamil-telugu-mass')
}

with open('scripts/new_songs_batch/agent_4.json', 'w', encoding='utf-8') as f:
    json.dump(out, f, indent=2)

print('Wrote agent_4.json! Kuthu:', len(out['tamil-telugu-kuthu']), 'Mass:', len(out['tamil-telugu-mass']))
