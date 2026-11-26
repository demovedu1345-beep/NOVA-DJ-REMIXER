with open('public/js/engine/beat-analyzer.js', 'r', encoding='utf-8') as f:
    c = f.read()

# Let's inspect how dynamic track tempo can be integrated into analyzeBeat
smart_bpm_engine = """
  // -------------------------------------------------------------------------
  // CANONICAL TRACK & GENRE TEMPO DICTIONARY (BPM)
  // Ensures visual pulses match the REAL audible tempo of every track & genre
  // -------------------------------------------------------------------------
  const TRACK_BPM_MAP = {
    // The Weeknd
    'blinding lights': 171,
    'starboy': 93,
    'the hills': 113,
    'save your tears': 118,
    "can't feel my face": 108,
    'die for you': 67,
    'call out my name': 80,
    'often': 67,
    'wicked games': 114,
    'in your eyes': 100,
    'timeless': 138,
    'take my breath': 121,
    'popular': 99,
    'dancing in the flames': 120,
    'creepin': 98,
    'moth to a flame': 120,

    // Rock & Metal
    'bohemian rhapsody': 144,
    'we will rock you': 81,
    'back in black': 94,
    'highway to hell': 116,
    "livin' on a prayer": 123,
    "sweet child o' mine": 125,
    'smells like teen spirit': 117,
    'in the end': 105,
    'numb': 110,
    'believer': 125,
    'radioactive': 136,
    'demons': 90,
    'californication': 96,
    'viva la vida': 138,
    'yellow': 87,
    'do i wanna know': 85,
    'enter sandman': 123,
    'master of puppets': 105,
    'the trooper': 160,
    'paranoid': 163,
    'duality': 144,

    // Pop & Dance
    'one kiss': 124,
    'wake me up': 124,
    'closer': 95,
    'titanium': 126,
    'levitating': 103,
    "don't start now": 124,
    '24k magic': 107,
    "that's what i like": 134,
    'billie jean': 117,
    'beat it': 138,
    'espresso': 104,
    'good luck, babe!': 117,
    'beautiful things': 105,
    'lose control': 80,
    'ocean eyes': 84,
    'riptide': 102,
    'let her go': 75,
    'never gonna give you up': 113,
    'girls just want to have fun': 120,
    'circles': 120,
    'rockstar': 80,
    'lean on me': 75,
    'god\'s plan': 77,
    'humble.': 150,
    'sicko mode': 155,
    'without me': 112,
    'lose yourself': 86,
    'remember the name': 85,
    'tennessee whiskey': 74,
    'ring of fire': 104,
    'jolene': 110,
    'fly me to the moon': 119,
    'my way': 75,
    'what a wonderful world': 75,
    'don\'t know why': 88,

    // Hindi & Bollywood Hits
    'tum hi ho': 94,
    'kesariya': 88,
    'apna bana le': 84,
    'channa mereya': 72,
    'gallan goodiyaan': 128,
    'lungi dance': 130,
    'badtameez dil': 136,
    'dilliwaali girlfriend': 130,
    'dilliwali girlfriend': 130,
    'malhari': 134,
    'zingaat': 138,
    'kala chashma': 106,
    'kar gayi chull': 122,
    'ghungroo': 118,
    'nashe si chadh gayi': 112,
    'raataan lambiyan': 90,
    'jai jai shivshankar': 128,
    'subha hone na de': 130,
    'aankh marey': 128,
    'dilbar': 115,
    'garmi': 128,
    'chammak challo': 104,
    'hookah bar': 130,

    // Punjabi & Regional
    'brown munde': 88,
    '295': 88,
    'so high': 88,
    'elevated': 96,
    'cheques': 96,
    'lover': 104,
    'born to shine': 100,
    'naatu naatu': 136,
    'arabic kuthu': 130
  };

  const GENRE_DEFAULT_BPM = {
    'party': 128,
    'dance': 128,
    'club': 126,
    'edm': 128,
    'diwali': 128,
    'retro': 120,
    'workout': 130,
    'gym': 130,
    'motivating': 124,
    'rock': 130,
    'metal': 138,
    'classicrock': 124,
    'hiphop': 90,
    'rnb': 88,
    'trap': 140,
    'love': 82,
    'romantic': 82,
    'sad': 76,
    'emotional': 76,
    'breakup': 80,
    'chill': 84,
    'acoustic': 84,
    'indie': 92,
    'trip': 96,
    'country': 94,
    'jazz': 90,
    'gospel': 108,
    'classical': 76,
    'focus': 80,
    'trending': 122,
    'pop': 120,
    'punjabi': 98,
    'tamil-telugu': 134,
    'kuthu': 136,
    'mass': 132,
    'gujarati': 116,
    'garba': 118,
    'marathi': 126,
    'marwadi': 110,
    'haryanvi-bhojpuri': 130,
    'kannada': 124,
    'odia': 120
  };

  function resolveTrackBpm(cue) {
    if (!cue) return 124;
    // 1. Direct metadata check
    if (typeof cue.bpm === 'number' && cue.bpm >= 45 && cue.bpm <= 220) return cue.bpm;
    if (typeof cue.tempo === 'number' && cue.tempo >= 45 && cue.tempo <= 220) return cue.tempo;

    // 2. Exact song title match
    const title = (cue.title || '').toLowerCase().trim();
    for (const [key, bpm] of Object.entries(TRACK_BPM_MAP)) {
      if (title.includes(key)) return bpm;
    }

    // 3. Subtype or Genre match
    const subtype = (cue.subtype || cue.kind || '').toLowerCase();
    for (const [g, bpm] of Object.entries(GENRE_DEFAULT_BPM)) {
      if (subtype.includes(g)) return bpm;
    }

    // 4. Language match fallback
    const lang = (cue.language || cue.lang || '').toLowerCase();
    if (lang === 'punjabi') return 98;
    if (lang === 'south' || lang === 'tamil-telugu') return 134;
    if (lang === 'gujarati') return 118;
    if (lang === 'english') return 120;
    if (lang === 'hindi') return 128;

    return 124;
  }
"""

print("smart_bpm_engine ready")
