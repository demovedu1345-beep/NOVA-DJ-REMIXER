with open('public/js/ui/eq-modal.js', 'r', encoding='utf-8') as f:
    c = f.read()

target = """        <!-- Quick Presets -->
        <div class="audify-eq-section-title">AUDIO & DYNAMICS PRESETS:</div>"""

replacement = """        <!-- Beat Sync Calibration & Precision Nudge -->
        <div class="audify-eq-section-title">BEAT SYNC & LATENCY CALIBRATION:</div>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:16px;flex-wrap:wrap;">
          <button id="audify-sync-tap-btn" class="audify-eq-preset-btn squeeze" style="flex:1;min-width:140px;background:rgba(212,255,0,0.14);border-color:#D4FF00;color:#D4FF00;font-weight:700;">🎯 SYNC DOWNBEAT NOW</button>
          <button id="audify-nudge-back-btn" class="audify-eq-preset-btn squeeze" style="flex:0 0 74px;" title="Nudge visual pulse 50ms earlier">⏪ -50ms</button>
          <button id="audify-nudge-fwd-btn" class="audify-eq-preset-btn squeeze" style="flex:0 0 74px;" title="Nudge visual pulse 50ms later">⏩ +50ms</button>
        </div>

        <!-- Quick Presets -->
        <div class="audify-eq-section-title">AUDIO & DYNAMICS PRESETS:</div>"""

if target in c:
    c = c.replace(target, replacement, 1)
    print("Added Beat Sync controls to eq-modal HTML")
else:
    print("Target not found directly in eq-modal HTML")

# Wire click listeners
target_wire = """    // Wire preset buttons"""
replacement_wire = """    // Wire beat sync calibration buttons
    modalRoot.querySelector('#audify-sync-tap-btn')?.addEventListener('click', () => {
      window.__audify_beat_analyzer?.syncDownbeatNow?.();
      const btn = modalRoot.querySelector('#audify-sync-tap-btn');
      if (btn) {
        btn.textContent = '⚡ LOCKED!';
        setTimeout(() => { if (btn) btn.textContent = '🎯 SYNC DOWNBEAT NOW'; }, 1000);
      }
    });

    modalRoot.querySelector('#audify-nudge-back-btn')?.addEventListener('click', () => {
      const tot = window.__audify_beat_analyzer?.nudgeBeatPhase?.(-50) ?? -50;
      const bpmEl = document.getElementById('audify-eq-bpm-readout');
      if (bpmEl) bpmEl.textContent = `NUDGE: ${tot > 0 ? '+' : ''}${tot}ms`;
    });

    modalRoot.querySelector('#audify-nudge-fwd-btn')?.addEventListener('click', () => {
      const tot = window.__audify_beat_analyzer?.nudgeBeatPhase?.(50) ?? 50;
      const bpmEl = document.getElementById('audify-eq-bpm-readout');
      if (bpmEl) bpmEl.textContent = `NUDGE: ${tot > 0 ? '+' : ''}${tot}ms`;
    });

    // Wire preset buttons"""

if target_wire in c:
    c = c.replace(target_wire, replacement_wire, 1)
    print("Added click handlers for Beat Sync buttons")
else:
    print("target_wire not found directly")

# Update BPM readout in renderLoop
target_bpm = """bpmEl.textContent = `${bpm} BPM · ${bpm > 130 ? 'UPBEAT' : 'LOCKED'}`;"""
replacement_bpm = """bpmEl.textContent = `${bpm} BPM · ACOUSTIC LOCKED`;"""

if target_bpm in c:
    c = c.replace(target_bpm, replacement_bpm)
    print("Updated BPM readout format to ACOUSTIC LOCKED")

with open('public/js/ui/eq-modal.js', 'w', encoding='utf-8') as f:
    f.write(c)

print("Saved public/js/ui/eq-modal.js")
