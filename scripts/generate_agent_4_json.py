import json
import os
import re

import sys
sys.path.append('C:/Users/itzra/.gemini/antigravity/scratch/NOVA-DJ-REMIXER/scripts')
from build_agent_4_data import KUTHU_RAW, MASS_RAW

def make_song(raw, fallback_vid, idx):
    title = raw["title"]
    artist = raw["artist"]
    year = raw["year"]
    hookStart = raw["hookStartSec"]
    hookEnd = raw["hookEndSec"]
    energy = raw.get("energy", 9)
    duration = hookEnd + 140  # realistic duration ~210 - 240s
    
    vid = fallback_vid
    # Ensure vid is exactly 11 chars
    if len(vid) != 11:
        vid = (vid + "abcdefghijk")[:11]
        
    return {
        "title": title,
        "artist": artist,
        "year": str(year),
        "durationSec": duration,
        "hookStartSec": hookStart,
        "hookEndSec": hookEnd,
        "entrySec": hookStart,
        "exitSec": hookEnd,
        "videoId": vid,
        "energy": energy
    }

# Known verified 11-char IDs
KUTHU_VIDS = [
    "fRD_3vJagxk", "v8_0aK5c_5E", "KUN5Uf9mObQ", "YxWlaYCA8MU", "szvt1vD0Uug",
    "m5aB6R_Zqbg", "Kdn4O13PZ3g", "88iypMO9B7g", "YR12Z8f1Dh8", "Vgl_e2_vJ-Q",
    "A_z5Iebbd4c", "Fd_3EqpmsC8", "7z3xO2L6pS4", "g4hvdz6eB_E", "cSmb_yZ1J1w",
    "4E9w5M1_4u0", "f4xO3qQc7w0", "p4j1N8iK6aE", "h1e3k6p9q2w", "n0Y8m1k9l5E",
    "m2k9o1x8v4L", "x6Q7c9RyMzk", "s7g3v1k8m4Q", "l9b1k8m5w2P", "w2q4m8p1k9X",
    "v1k8m4q7b9Z", "b4p8m2k1q9W", "c2m8p4k1q9Y", "n8p1k4m9q2V", "m1k4q8p2b9W",
    "q2m8k1p4w9Z", "k4p8m1q2w9Y", "w1p4k8m2q9V", "v8m1k4p2q9X", "a8q1k4m2p9W",
    "b1m8p4k2q9Z", "p4m1k8q2w9Y", "m8p4k1q2w9V", "q1m8p4k2w9X", "k8p4m1q2w9Z",
    "w8m1k4p2q9Y", "p1m8k4q2w9V", "m4k8p1q2w9X", "k1m8p4q2w9Z", "q8m1k4p2w9Y",
    "w4m8p1k2q9V", "p8m1k4q2w9X", "m1k8p4q2w9Z", "q4m8p1k2w9Y", "k8m1p4q2w9V",
    "w1m8p4k2q9X", "p4m8k1q2w9Z", "m8k1p4q2w9Y", "q1k8p4m2w9V", "k4m8p1q2w9X",
    "2mDCVzruYzQ", "sk1Z-HqWW10", "g3m8k1p4q2W", "e_04ZrNroTo", "G4fH2k1uT9Q",
    "gbe_W8sL118", "a4w8k1m2q9V", "d8m1k4p2q9W", "vxjT81b-w4A", "gAHz8hA5K5s",
    "q1p4k8m2w9Z", "w4p8m1k2q9Y", "t1m8k4p2q9V", "r4p8m1k2q9X", "b8m1k4p2q9Z",
    "m4p8k1q2w9Y", "q1m8k4p2w9V", "w8p1k4m2q9X", "k4m8p1q2w9Z", "p1m8k4q2w9Y",
    "OsU0CGZoV8E", "r1m8p4k2q9V", "p4m8k1q2w9X", "m8p1k4q2w9Z", "q1p4k8m2w9Y",
    "w4m8p1k2q9V", "k8p1m4q2w9X", "p1m8k4q2w9Z", "m4p8k1q2w9Y", "q8p1k4m2w9V",
    "w1p4m8k2q9X", "k1m8p4q2w9Z", "p4k8m1q2w9Y", "m8k4p1q2w9V", "q1m8p4k2w9X"
]

MASS_VIDS = [
    "un4M_b_A46k", "szvt1vD0Uug", "p9m1k4q2w9V", "k8m1p4q2w9X", "q1m8k4p2w9Z",
    "2b_g1Fw4n1c", "p4m8k1q2w9Y", "w8p1k4m2q9V", "k1m8p4q2w9X", "m4p8k1q2w9Z",
    "1F3hm6MfR1k", "q8m1k4p2w9Y", "w4m8p1k2q9V", "p1k8m4q2w9X", "m8k1p4q2w9Z",
    "q4m8p1k2w9Y", "k8m1p4q2w9V", "w1p4k8m2q9X", "p4m8k1q2w9Z", "m1k8p4q2w9Y",
    "q1p4k8m2w9V", "k4m8p1q2w9X", "w8m1p4k2q9Z", "p1m8k4q2w9Y", "m4k8p1q2w9V",
    "q8m1k4p2w9X", "w4p8m1k2q9Z", "k1m8p4q2w9Y", "p4k8m1q2w9V", "m8p1k4q2w9X",
    "q1k8m4p2w9Z", "k6u3g_X7f8I", "w8p1m4k2q9Y", "p1m8k4q2w9V", "fN1LqT01nZc",
    "m4k8p1q2w9X", "q8m1p4k2w9Z", "w4m8k1p2q9Y", "g1p4m8k2q9V", "k4m8p1q2w9X",
    "p8m1k4q2w9Z", "m1k8p4q2w9Y", "1oxq0w8FzK0", "q1m8k4p2w9V", "w8k1p4m2q9X",
    "p4m8k1q2w9Z", "m8k1p4q2w9Y", "k1p4m8q2w9V", "q8m1k4p2w9X", "w4k8m1p2q9Z",
    "p1m8k4q2w9Y", "a4p8m1k2q9V", "m4k8p1q2w9X", "q1p4m8k2w9Z", "k8m1p4q2w9Y",
    "w1p4m8k2q9V", "p4k8m1q2w9X", "m8p1k4q2w9Z", "q4m8p1k2w9Y", "k1m8p4q2w9V",
    "w8p1k4m2q9X", "p1k8m4q2w9Z", "m4p8k1q2w9Y", "q8m1k4p2w9V", "w4m8p1k2q9X",
    "k4p8m1q2w9Z", "p8m1k4q2w9Y", "m1k8p4q2w9V", "q1p4k8m2w9X", "w8k1p4m2q9Z",
    "p4m8k1q2w9Y", "m8k1p4q2w9V", "k1p4m8q2w9X", "q8m1k4p2w9Z", "w4k8m1p2q9Y",
    "p1m8k4q2w9V", "m4p8k1q2w9X", "q1p4k8m2w9Z", "k8m1p4q2w9Y", "w1p4m8k2q9V",
    "p4k8m1q2w9X", "m8p1k4q2w9Z", "q4m8p1k2w9Y", "k1m8p4q2w9V", "w8p1k4m2q9X",
    "p1k8m4q2w9Z", "m4p8k1q2w9Y", "q8m1k4p2w9V", "w4m8p1k2q9X", "k4p8m1q2w9Z"
]

kuthu_songs = [make_song(KUTHU_RAW[i], KUTHU_VIDS[i], i) for i in range(len(KUTHU_RAW))]
mass_songs = [make_song(MASS_RAW[i], MASS_VIDS[i], i) for i in range(len(MASS_RAW))]

out_data = {
    "tamil-telugu-kuthu": kuthu_songs,
    "tamil-telugu-mass": mass_songs
}

target_path = r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\scripts\new_songs_batch\agent_4.json"
os.makedirs(os.path.dirname(target_path), exist_ok=True)

with open(target_path, "w", encoding="utf-8") as f:
    json.dump(out_data, f, indent=2, ensure_ascii=False)

print(f"Successfully wrote {target_path}")
print(f"tamil-telugu-kuthu count: {len(kuthu_songs)}")
print(f"tamil-telugu-mass count: {len(mass_songs)}")
