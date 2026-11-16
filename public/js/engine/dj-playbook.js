import { camelotDistance } from './camelot.js';
import { TRANSITION_TYPES } from './dj-brain.js';

/**
 * Curated Real-World DJ Transition Playbook
 * 24 battle-tested club, festival, and wedding transitions across major genre pairings.
 * Adheres strictly to DJustify (arXiv Oct 2026), Vande Veire & De Bie (2018), and Mosaikbox (ISMIR 2024).
 */
export const PLAYBOOK_ENTRIES = [
  {
    id: 'pb-bhangra-to-house-dhol-bridge',
    title: 'Punjabi Bhangra to Tech House Dhol Bridge',
    genreA: 'punjabi',
    genreB: 'house',
    type: 'drum_loop_bridge',
    bpmRangeA: [88, 104],
    bpmRangeB: [122, 128],
    camelotRelation: 'any',
    lengthBars: 8,
    energyDelta: 1,
    technique: 'Quantized Dhol chaal bridge loops over outgoing track outro while HPF removes bass; incoming House four-on-the-floor kick drops on bar 9 with full sub.',
    eqPlan: 'Deck A low EQ -28dB at bar 4; Deck B low EQ killed until bar 8 downbeat slam.',
    fx: ['dhol_bridge', 'club_impact'],
    why: 'Punjabi chaal triplet rhythm meshes organically with straight 4/4 house grooves when bridged with live dhol.',
  },
  {
    id: 'pb-bollywood-to-pop-vocal-swap',
    title: 'Bollywood Mukhda Hook into Pop Drop',
    genreA: 'bollywood',
    genreB: 'pop',
    type: 'vocal_mashup',
    bpmRangeA: [100, 122],
    bpmRangeB: [102, 124],
    camelotRelation: 'exact',
    lengthBars: 16,
    energyDelta: 1,
    technique: 'Isolate Bollywood vocal mukhda over incoming Pop instrumental backing groove; cut Deck A on word end directly into Pop chorus drop.',
    eqPlan: 'Single bassline rule: Deck A low cut immediately; Deck B low flat (0dB). Deck A mid boosted +1.5dB for vocal clarity.',
    fx: ['air_whoosh'],
    why: 'Crowd recognises the Hindi vocal hook instantly while groove continues without jarring rhythmic break.',
  },
  {
    id: 'pb-punjabi-hiphop-to-trap-sub-slam',
    title: 'Punjabi Hip-Hop into Trap 808 Slam',
    genreA: 'punjabi',
    genreB: 'trap',
    type: 'impact_cut',
    bpmRangeA: [90, 102],
    bpmRangeB: [136, 150],
    camelotRelation: 'neighbor',
    lengthBars: 4,
    energyDelta: 2,
    technique: 'Spinback or 1-bar echo cut on Deck A last vocal word; 1/2 beat silence; Deck B 808 sub drops on downbeat with club impact.',
    eqPlan: 'Deck A kill EQ all bands at 3.5 beats; Deck B enters at 100% gain on beat 1.',
    fx: ['spinback', 'sub_drop', 'club_impact'],
    why: 'Sudden high-contrast tempo jumps sound intentional and massive when punctuated by silence and a brutal 808 drop.',
  },
  {
    id: 'pb-house-to-techno-bass-swap',
    title: 'Deep House to Peak-Time Techno 16-Bar Bass Swap',
    genreA: 'house',
    genreB: 'techno',
    type: 'bass_swap_blend',
    bpmRangeA: [124, 128],
    bpmRangeB: [126, 132],
    camelotRelation: 'neighbor',
    lengthBars: 16,
    energyDelta: 1,
    technique: 'Vande Veire & De Bie EQ pattern: Deck B enters with low EQ killed; at bar 8 downbeat, low EQ swaps instantaneously. Deck A high EQ cuts at bar 12.',
    eqPlan: 'Never allow 2 low EQs or 2 high EQs audible together. Instant swap on phrase boundary.',
    fx: ['white_noise_riser'],
    why: 'Preserves hypnotic driving momentum without kick flamming or low-frequency phase cancellation.',
  },
  {
    id: 'pb-tamil-kuthu-to-global-bass',
    title: 'Tamil Kuthu to Global Bass Loop Roll',
    genreA: 'tamil_telugu',
    genreB: 'global_bass',
    type: 'loop_roll_drop',
    bpmRangeA: [130, 155],
    bpmRangeB: [128, 145],
    camelotRelation: 'any',
    lengthBars: 8,
    energyDelta: 2,
    technique: 'Catch live percussion fill on Deck A into 1-bar loop roll (1 -> 1/2 -> 1/4 -> 1/8 beat stutter) with HPF rising; slam into Deck B drop.',
    eqPlan: 'Deck A high-pass filter rises 20Hz -> 3.5kHz over 8 bars; Deck B slammed in flat on beat 1.',
    fx: ['loop_roll', 'crash_cymbal'],
    why: 'High-BPM Kuthu energy converts naturally into bass drops via accelerating stutter builds.',
  },
  {
    id: 'pb-bollywood-ballad-to-dance-echo-out',
    title: 'Acoustic Bollywood Outro Echo-Out into Dance',
    genreA: 'bollywood',
    genreB: 'house',
    type: 'echo_out',
    bpmRangeA: [75, 95],
    bpmRangeB: [120, 126],
    camelotRelation: 'any',
    lengthBars: 4,
    energyDelta: 2,
    technique: 'Catch final sung phrase in 1/2-note ping-pong delay with 65% feedback; high-pass filter tail while incoming track kicks on beat 1.',
    eqPlan: 'Deck A low cut on echo catch; Deck B flat.',
    fx: ['echo_throw', 'air_whoosh'],
    why: 'Echo tail acts as an organic acoustic reverb tail, masking wide BPM differentials completely.',
  },
  {
    id: 'pb-hiphop-half-time-switch',
    title: 'Hip-Hop to Double-Time UK Garage / D&B Switch',
    genreA: 'hiphop',
    genreB: 'garage',
    type: 'half_time_switch',
    bpmRangeA: [82, 92],
    bpmRangeB: [164, 180],
    camelotRelation: 'neighbor',
    lengthBars: 8,
    energyDelta: 2,
    technique: 'Exact 2x mathematical tempo match. Deck A 88 BPM rides alongside Deck B 176 BPM half-time groove; drop double-time drums on bar 9.',
    eqPlan: 'Crossfade mid/high smoothly over 8 bars; swap sub bass on bar 8 beat 4.',
    fx: ['white_noise_riser', 'downlifter_fall'],
    why: 'Double-time switches blow the roof off the dancefloor because the perceived tempo doubles without pitch disruption.',
  },
  {
    id: 'pb-pop-key-change-lift',
    title: 'Anthem Pop +2 Semitone Energy Lift',
    genreA: 'pop',
    genreB: 'pop',
    type: 'key_change_lift',
    bpmRangeA: [118, 126],
    bpmRangeB: [120, 128],
    camelotRelation: 'energy_lift',
    lengthBars: 8,
    energyDelta: 1,
    technique: 'Shift harmonic Camelot position up by +2 or +7 on the circle of fifths; cue incoming chorus right at outgoing breakdown.',
    eqPlan: 'Deck A low EQ carved -18dB; Deck B low EQ flat; instant high-frequency swap.',
    fx: ['reverse_cymbal', 'club_impact'],
    why: 'Truck driver key-lift creates physical goosebumps and an uncontrollable crowd energy surge.',
  },
  {
    id: 'pb-rnb-to-afrobeats-long-blend',
    title: 'R&B to Afrobeats 32-Bar Sunset Blend',
    genreA: 'rnb',
    genreB: 'afrobeats',
    type: 'long_blend',
    bpmRangeA: [98, 106],
    bpmRangeB: [100, 108],
    camelotRelation: 'exact',
    lengthBars: 16,
    energyDelta: 0,
    technique: 'Strict +-2.5 BPM tolerance. Warm analog high-pass on Deck B intro, slowly trading hi-hats over 16 bars before touching bass.',
    eqPlan: 'Deck A bass flat until bar 8; gradual dip to -24dB by bar 16 while Deck B bass rises 0dB.',
    fx: [],
    why: 'Subtle percussive overlap feels like a single extended record rather than two separate songs.',
  },
  {
    id: 'pb-trap-stutter-edit-drop',
    title: 'Drill / Trap 16th-Note Stutter Edit Cut',
    genreA: 'trap',
    genreB: 'trap',
    type: 'stutter_edit',
    bpmRangeA: [138, 145],
    bpmRangeB: [140, 146],
    camelotRelation: 'neighbor',
    lengthBars: 2,
    energyDelta: 1,
    technique: 'Repeated 16th-note rhythmic chop of the first syllable of incoming track over 2 beats; silence for 1 beat; drop 808 on 1.',
    eqPlan: 'Deck A cut cleanly on beat 3; Deck B bursts in on stutter hits at +0dB.',
    fx: ['stutter_gate', 'club_impact'],
    why: 'Rhythmic gating grabs attention instantly and signals a heavy drop.',
  },
  {
    id: 'pb-disco-to-nudisco-filter-sweep',
    title: 'Classic Disco to Nu-Disco Low-Pass Sweep',
    genreA: 'disco',
    genreB: 'house',
    type: 'filter_sweep',
    bpmRangeA: [118, 124],
    bpmRangeB: [120, 126],
    camelotRelation: 'neighbor',
    lengthBars: 8,
    energyDelta: 1,
    technique: 'Low-pass filter sweeps down on Deck A from 20kHz to 350Hz; Deck B sweeps up from 200Hz to 20kHz on the drop.',
    eqPlan: 'Filter sweep handles frequency carving; keep EQs flat.',
    fx: ['air_whoosh'],
    why: 'Filter sweeps emulate vintage rotary DJ mixers used at Paradise Garage and Studio 54.',
  },
  {
    id: 'pb-reggaeton-to-moombahton-drop-swap',
    title: 'Reggaeton Dembow to Moombahton Drop Swap',
    genreA: 'latin',
    genreB: 'moombahton',
    type: 'drop_swap',
    bpmRangeA: [94, 102],
    bpmRangeB: [104, 112],
    camelotRelation: 'any',
    lengthBars: 4,
    energyDelta: 2,
    technique: 'Let Deck A ride to the pre-chorus build; on the 4th beat of the build bar, cut Deck A completely; Deck B drop slams in.',
    eqPlan: 'Hard mute on Deck A at bar 4 beat 4; Deck B full unmuted on beat 1.',
    fx: ['sub_drop', 'club_impact'],
    why: 'Drop swaps deliver maximum shock value when both tracks share the syncopated dembow groove.',
  },
  {
    id: 'pb-bollywood-lyric-link',
    title: 'Bollywood Thematic Lyric Link Story Arc',
    genreA: 'bollywood',
    genreB: 'bollywood',
    type: 'lyric_link',
    bpmRangeA: [85, 115],
    bpmRangeB: [88, 118],
    camelotRelation: 'neighbor',
    lengthBars: 8,
    energyDelta: 0,
    technique: 'Deck A ends on a call lyric line; Deck B begins immediately with the response line, creating narrative continuity.',
    eqPlan: 'Deck A low cut to prevent mud; Deck B vocal unmasked with +1dB mid boost.',
    fx: ['reverb_wash'],
    why: 'DJustify & Mosaikbox: lyric linkage elevates a DJ mix into an emotional storytelling arc.',
  },
  {
    id: 'pb-edm-reverse-riser-drop',
    title: 'Festival EDM Reverse Cymbal Riser Drop',
    genreA: 'edm',
    genreB: 'edm',
    type: 'reverse_riser_drop',
    bpmRangeA: [126, 132],
    bpmRangeB: [128, 134],
    camelotRelation: 'exact',
    lengthBars: 8,
    energyDelta: 2,
    technique: 'Reverse cymbal swell + white noise riser over 4 bars of Deck A; silence for half a beat; Deck B drop downbeat explosive hit.',
    eqPlan: 'Deck A low cut during riser; Deck B flat on drop.',
    fx: ['reverse_cymbal', 'white_noise_riser', 'club_impact'],
    why: 'Reverse risers build physical tension that demands the explosive drop release.',
  },
  {
    id: 'pb-acapella-into-groove',
    title: 'Isolated Acapella In Over Stripped Groove',
    genreA: 'house',
    genreB: 'pop',
    type: 'acapella_in',
    bpmRangeA: [122, 126],
    bpmRangeB: [120, 125],
    camelotRelation: 'neighbor',
    lengthBars: 16,
    energyDelta: 1,
    technique: 'Strip Deck B to vocals only (Demucs neural stems); overlay Deck B acapella over Deck A drum & bass groove for 8 bars before handoff.',
    eqPlan: 'Deck B bass and drums muted (-60dB); Deck B vocals centered and uncompressed.',
    fx: [],
    why: 'Live mashup technique: crowds sing along to the new vocal while dancing to the familiar groove.',
  },
  {
    id: 'pb-instrumental-in-vocal-out',
    title: 'Instrumental Groove In Under Fading Vocal',
    genreA: 'pop',
    genreB: 'house',
    type: 'instrumental_in',
    bpmRangeA: [120, 126],
    bpmRangeB: [122, 128],
    camelotRelation: 'exact',
    lengthBars: 16,
    energyDelta: 0,
    technique: 'Mute Deck B vocals; sneak Deck B bass and drums under Deck A vocal outro; remove Deck A completely once vocal completes.',
    eqPlan: 'Deck A bass cut at bar 8; Deck B bass brought to 0dB.',
    fx: [],
    why: 'Seamlessly transfers the dancefloor from song-centric pop to groove-centric house.',
  },
  {
    id: 'pb-telugu-masala-percussion-slam',
    title: 'Telugu Cinema Masala Drum Fill Drop Slam',
    genreA: 'tamil_telugu',
    genreB: 'tamil_telugu',
    type: 'build_up_drop',
    bpmRangeA: [128, 145],
    bpmRangeB: [130, 150],
    camelotRelation: 'any',
    lengthBars: 8,
    energyDelta: 2,
    technique: '8-bar escalating snare & dhol roll into 1-bar drum breakdown; explosive cymbal crash and bass drop on beat 1.',
    eqPlan: 'HPF rises on Deck A; Deck B slammed with sub-drop on beat 1.',
    fx: ['snare_roll_hit', 'crash_cymbal', 'sub_drop'],
    why: 'Captures the high-octane theater celebration energy typical of South Indian cinema music.',
  },
  {
    id: 'pb-punjabi-hook-over-groove',
    title: 'Punjabi Folk Hook Over Tech House Groove',
    genreA: 'punjabi',
    genreB: 'house',
    type: 'hook_over_groove',
    bpmRangeA: [95, 105],
    bpmRangeB: [124, 128],
    camelotRelation: 'exact',
    lengthBars: 16,
    energyDelta: 1,
    technique: 'Timestretch Punjabi folk hook to half-time match of House 126 BPM (63 BPM equivalent); float vocal on top of rolling bassline.',
    eqPlan: 'Deck A vocal band boosted +2dB; low band killed (-42dB). Deck B full groove.',
    fx: ['reverb_wash'],
    why: 'Festival anthem mashup formula made famous by international DJ sets.',
  },
  {
    id: 'pb-club-spinback-cut',
    title: 'Vinyl Spinback Power Cut Into Fresh Anthem',
    genreA: 'any',
    genreB: 'any',
    type: 'spinback',
    bpmRangeA: [70, 160],
    bpmRangeB: [70, 160],
    camelotRelation: 'any',
    lengthBars: 2,
    energyDelta: 2,
    technique: 'Authentic turntable inertia spinback on Deck A; 1-beat silent pause; Deck B drops on 1 with air whoosh.',
    eqPlan: 'Deck A killed immediately on spinback start; Deck B full unmuted on downbeat.',
    fx: ['spinback', 'air_whoosh'],
    why: 'Universal club reset button when transitioning across totally disparate genres or tempos.',
  },
  {
    id: 'pb-reverb-wash-outro',
    title: 'Ambient Reverb Wash Energy Wind-Down',
    genreA: 'any',
    genreB: 'any',
    type: 'reverb_wash',
    bpmRangeA: [70, 140],
    bpmRangeB: [70, 140],
    camelotRelation: 'neighbor',
    lengthBars: 8,
    energyDelta: -2,
    technique: 'Send Deck A 100% into lush hall reverb with low-pass filter closing down to 400Hz; Deck B emerges gently from the wash.',
    eqPlan: 'Deck A low cut; reverb send 100%; Deck B gentle linear volume rise.',
    fx: ['reverb_wash'],
    why: 'Smoothly diffuses intense energy during set winddown or breakdown sections.',
  },
  {
    id: 'pb-afrobeats-to-dancehall-bassline',
    title: 'Afrobeats Log Drum to Dancehall Bassline Swap',
    genreA: 'afrobeats',
    genreB: 'dancehall',
    type: 'bass_swap_blend',
    bpmRangeA: [102, 114],
    bpmRangeB: [100, 112],
    camelotRelation: 'exact',
    lengthBars: 16,
    energyDelta: 0,
    technique: 'Amapiano log drum and Dancehall 808 swap precisely at bar 8 beat 1; shaker rhythm continues unbroken.',
    eqPlan: 'Deck A low cut at bar 8; Deck B low boosted 0dB on same beat.',
    fx: [],
    why: 'Natural rhythmic cousin genres that blend effortlessly with single-bassline discipline.',
  },
  {
    id: 'pb-progressive-trance-lift',
    title: 'Melodic House to Progressive Trance Riser',
    genreA: 'house',
    genreB: 'trance',
    type: 'reverse_riser_drop',
    bpmRangeA: [124, 128],
    bpmRangeB: [130, 136],
    camelotRelation: 'energy_lift',
    lengthBars: 16,
    energyDelta: 2,
    technique: 'Deck A reaches breakdown synth chords; Deck B rolling bassline filters in from 100Hz; riser builds into massive supersaw drop.',
    eqPlan: 'Deck A low EQ -24dB at bar 8; Deck B high EQ flat, low EQ enters at bar 16.',
    fx: ['white_noise_riser', 'club_impact'],
    why: 'Euphoric festival energy build that lifts crowds to peak intensity.',
  },
  {
    id: 'pb-ukg-to-bassline-cut',
    title: 'UK Garage 2-Step to Bassline Drop Cut',
    genreA: 'garage',
    genreB: 'bassline',
    type: 'impact_cut',
    bpmRangeA: [130, 136],
    bpmRangeB: [132, 138],
    camelotRelation: 'neighbor',
    lengthBars: 4,
    energyDelta: 2,
    technique: 'Mute Deck A drums on bar 4 beat 3; vocal chop solo on beat 4; Deck B heavy warped bassline drops on beat 1.',
    eqPlan: 'Deck A hard kill at beat 4; Deck B +0dB on downbeat.',
    fx: ['sub_drop', 'club_impact'],
    why: 'Iconic UK underground club move: vocal tease into devastating bassline drop.',
  },
  {
    id: 'pb-desi-trap-tabla-slide-drop',
    title: 'Desi Trap Tabla Bayan Slide Drop Slam',
    genreA: 'bollywood',
    genreB: 'trap',
    type: 'build_up_drop',
    bpmRangeA: [80, 100],
    bpmRangeB: [138, 146],
    camelotRelation: 'neighbor',
    lengthBars: 8,
    energyDelta: 2,
    technique: 'Deep pitch-bent Tabla Bayan bass slide on bar 8 beat 3; white noise riser sweep; explosive trap drop on 1.',
    eqPlan: 'Deck A low cut at bar 7; Deck B low flat with sub impact.',
    fx: ['tabla_bayan_slide', 'white_noise_riser', 'club_impact'],
    why: 'Traditional Indian acoustic bass slide provides organic tension that makes modern 808 drops hit twice as hard.',
  },
];

/**
 * Normalizes genre strings to canonical playbook categories.
 */
function normalizeGenreKey(genreStr) {
  const g = String(genreStr || '').toLowerCase();
  if (/punjabi|bhangra|dhol/i.test(g)) return 'punjabi';
  if (/bollywood|desi|hindi|filmi/i.test(g)) return 'bollywood';
  if (/tamil|telugu|kuthu|south/i.test(g)) return 'tamil_telugu';
  if (/afro|amapiano/i.test(g)) return 'afrobeats';
  if (/dancehall|reggae/i.test(g)) return 'dancehall';
  if (/latin|reggaeton|moombah/i.test(g)) return 'latin';
  if (/drill|trap/i.test(g)) return 'trap';
  if (/hip[ -]?hop|rap/i.test(g)) return 'hiphop';
  if (/techno/i.test(g)) return 'techno';
  if (/trance/i.test(g)) return 'trance';
  if (/garage|ukg|bassline/i.test(g)) return 'garage';
  if (/disco|funk/i.test(g)) return 'disco';
  if (/r&b|rnb|soul/i.test(g)) return 'rnb';
  if (/edm|festival|electro/i.test(g)) return 'edm';
  if (/house/i.test(g)) return 'house';
  return 'pop';
}

/**
 * k-NN Retrieval: finds the top N best-matching transition playbook entries
 * for two tracks based on genre family, BPM distance, Camelot interval, and energy shift.
 */
export function findPlaybookMatches(songA, songB, { limit = 5 } = {}) {
  if (!songA || !songB) return [];

  const gA = normalizeGenreKey(songA.genreKey || songA.genre);
  const gB = normalizeGenreKey(songB.genreKey || songB.genre);
  const bpmA = Number(songA.bpm) || 120;
  const bpmB = Number(songB.bpm) || bpmA;
  const bpmDelta = Math.abs(bpmA - bpmB);
  const camDist = camelotDistance(songA.camelot || songA.key_camelot, songB.camelot || songB.key_camelot);
  const energyA = Number(songA.energy) || 7;
  const energyB = Number(songB.energy) || 7;
  const energyDelta = energyB - energyA;

  const scored = PLAYBOOK_ENTRIES.map((entry) => {
    let score = 0;

    // 1. Genre Matching (Weight: 35)
    const matchA = entry.genreA === 'any' || entry.genreA === gA;
    const matchB = entry.genreB === 'any' || entry.genreB === gB;
    if (matchA && matchB) score += 35;
    else if (matchA || matchB) score += 18;
    else if (entry.genreA === 'any' || entry.genreB === 'any') score += 12;

    // 2. BPM Proximity (Weight: 30)
    const inRangeA = bpmA >= entry.bpmRangeA[0] - 5 && bpmA <= entry.bpmRangeA[1] + 5;
    const inRangeB = bpmB >= entry.bpmRangeB[0] - 5 && bpmB <= entry.bpmRangeB[1] + 5;
    if (inRangeA && inRangeB) score += 30;
    else if (inRangeA || inRangeB) score += 15;

    // Special tempo rules: tight blend vs wide jumps
    if (entry.type === 'long_blend' && bpmDelta <= 3.2) score += 15;
    if (entry.type === 'long_blend' && bpmDelta > 4.5) score -= 30; // Penalize long blend on wide BPM
    if (entry.type === 'half_time_switch') {
      const ratio = bpmB / Math.max(1, bpmA);
      if (Math.abs(ratio - 2.0) < 0.15 || Math.abs(ratio - 0.5) < 0.15) score += 35;
    }

    // 3. Harmonic Camelot Fit (Weight: 20)
    if (entry.camelotRelation === 'exact' && camDist === 0) score += 20;
    else if (entry.camelotRelation === 'neighbor' && camDist <= 1) score += 18;
    else if (entry.camelotRelation === 'energy_lift' && (camDist === 2 || camDist === 7)) score += 20;
    else if (entry.camelotRelation === 'any') score += 10;

    // 4. Energy Shift Fit (Weight: 15)
    const targetEDelta = entry.energyDelta;
    const diff = Math.abs(energyDelta - targetEDelta);
    score += Math.max(0, 15 - diff * 4);

    return {
      entry,
      score: Math.round(score),
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, Math.max(1, limit)).map((item) => ({
    ...item.entry,
    matchScore: item.score,
  }));
}

/**
 * Formats retrieved playbook entries into concise few-shot reference text for the AI DJ planner.
 */
export function formatPlaybookForPrompt(matches) {
  if (!Array.isArray(matches) || !matches.length) return '';
  return matches
    .map(
      (m, i) =>
        `EXAMPLE ${i + 1} [Score: ${m.matchScore || 0}]: "${m.title}" (${m.genreA.toUpperCase()} -> ${m.genreB.toUpperCase()})\n` +
        `  - Preferred Type: ${m.type} (${m.lengthBars} bars)\n` +
        `  - Technique: ${m.technique}\n` +
        `  - Single-Bassline EQ Rule: ${m.eqPlan}\n` +
        `  - Rationale: ${m.why}`
    )
    .join('\n\n');
}
