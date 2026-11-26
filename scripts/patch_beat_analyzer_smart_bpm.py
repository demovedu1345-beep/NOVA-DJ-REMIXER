import re

with open('public/js/engine/beat-analyzer.js', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Insert smart_bpm_engine dictionary before function analyzeBeat
target_before = "  // Real-Time Beat Analyzer Step (called inside 60 FPS requestAnimationFrame render loop)\n  function analyzeBeat(dt, nowMs) {"

with open('scripts/build_smart_beat_analyzer.py', 'r', encoding='utf-8') as sf:
    s_content = sf.read()

# Extract smart_bpm_engine
m = re.search(r'smart_bpm_engine = """(.*?)"""', s_content, re.DOTALL)
smart_dict_code = m.group(1) if m else ""

if smart_dict_code and target_before in c:
    c = c.replace(target_before, smart_dict_code + "\n" + target_before, 1)
    print("Inserted TRACK_BPM_MAP and resolveTrackBpm")
else:
    print("target_before not found or smart_dict_code empty")

# 2. Replace the BPM calculation in analyzeBeat
old_calc = """      // ---------------------------------------------------------------------
      // 2. Dynamic BPM & Beat Phase Extraction
      // ---------------------------------------------------------------------
      const rawBpm = cue?.bpm ?? cue?.tempo ?? 124;
      const trackBpm = (typeof rawBpm === 'number' && Number.isFinite(rawBpm) && rawBpm >= 40 && rawBpm <= 240) ? rawBpm : 124;
      currentBpm = trackBpm;

      const beatDuration = 60.0 / currentBpm;
      const barDuration = beatDuration * 4.0;

      const offset = (cue && typeof cue.entrySec === 'number')
        ? cue.entrySec
        : ((cue && typeof cue.hookStartSec === 'number') ? cue.hookStartSec : 0);

      let beatElapsed = (pllEstimatedTime - offset) % beatDuration;
      if (beatElapsed < 0) beatElapsed += beatDuration;
      beatPhase = beatElapsed / beatDuration; // 0.0 -> 1.0 within beat"""

new_calc = """      // ---------------------------------------------------------------------
      // 2. Intelligent Real-Time BPM & Calibrated Acoustic Phase Locking
      // ---------------------------------------------------------------------
      currentBpm = resolveTrackBpm(cue);

      const beatDuration = 60.0 / currentBpm;
      const barDuration = beatDuration * 4.0;

      const offset = (cue && typeof cue.entrySec === 'number')
        ? cue.entrySec
        : ((cue && typeof cue.hookStartSec === 'number') ? cue.hookStartSec : 0);

      // Latency calibration: Compensate for YouTube iframe audio-to-DOM buffer delay (~115ms)
      // plus user-adjustable phase nudge from EQ modal
      const userNudgeSec = (settings.beatNudgeMs || 0) * 0.001;
      const latencyCorrectionSec = 0.115 + userNudgeSec;

      let beatElapsed = (pllEstimatedTime - offset - latencyCorrectionSec) % beatDuration;
      if (beatElapsed < 0) beatElapsed += beatDuration;
      beatPhase = beatElapsed / beatDuration; // 0.0 -> 1.0 within beat"""

if old_calc in c:
    c = c.replace(old_calc, new_calc, 1)
    print("Replaced old_calc with new intelligent acoustic phase locked BPM")
else:
    print("old_calc not found directly")

# 3. Add beat nudge API to export
old_export = """    getCurrentBpm: () => currentBpm,"""
new_export = """    getCurrentBpm: () => currentBpm,
    nudgeBeatPhase: (ms) => {
      settings.beatNudgeMs = (settings.beatNudgeMs || 0) + ms;
      try { localStorage.setItem('audify_eq_settings', JSON.stringify(settings)); } catch(_) {}
      console.log('[Audify Beat] Phase nudged by', ms, 'ms. Total nudge:', settings.beatNudgeMs, 'ms');
      return settings.beatNudgeMs;
    },
    syncDownbeatNow: () => {
      if (lastRawTime >= 0) {
        pllEstimatedTime = lastRawTime;
      }
      console.log('[Audify Beat] Downbeat synced to current playback position.');
    },"""

if old_export in c:
    c = c.replace(old_export, new_export, 1)
    print("Added nudgeBeatPhase and syncDownbeatNow to export")

with open('public/js/engine/beat-analyzer.js', 'w', encoding='utf-8') as f:
    f.write(c)

print("Saved public/js/engine/beat-analyzer.js")
