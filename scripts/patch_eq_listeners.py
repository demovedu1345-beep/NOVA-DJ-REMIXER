with open('public/js/ui/eq-modal.js', 'r', encoding='utf-8') as f:
    c = f.read()

target = "document.getElementById('audify-eq-close-btn').onclick = closeEqModal;"

replacement = """document.getElementById('audify-eq-close-btn').onclick = closeEqModal;

    // Beat Sync Calibration Buttons
    const syncTapBtn = document.getElementById('audify-sync-tap-btn');
    if (syncTapBtn) {
      syncTapBtn.onclick = () => {
        window.__audify_beat_analyzer?.syncDownbeatNow?.();
        syncTapBtn.textContent = '⚡ LOCKED!';
        setTimeout(() => { syncTapBtn.textContent = '🎯 SYNC DOWNBEAT NOW'; }, 1000);
      };
    }

    const nudgeBackBtn = document.getElementById('audify-nudge-back-btn');
    if (nudgeBackBtn) {
      nudgeBackBtn.onclick = () => {
        const tot = window.__audify_beat_analyzer?.nudgeBeatPhase?.(-50) ?? -50;
        const bpmEl = document.getElementById('audify-eq-bpm-readout');
        if (bpmEl) bpmEl.textContent = `NUDGE: ${tot > 0 ? '+' : ''}${tot}ms`;
      };
    }

    const nudgeFwdBtn = document.getElementById('audify-nudge-fwd-btn');
    if (nudgeFwdBtn) {
      nudgeFwdBtn.onclick = () => {
        const tot = window.__audify_beat_analyzer?.nudgeBeatPhase?.(50) ?? 50;
        const bpmEl = document.getElementById('audify-eq-bpm-readout');
        if (bpmEl) bpmEl.textContent = `NUDGE: ${tot > 0 ? '+' : ''}${tot}ms`;
      };
    }"""

if target in c:
    c = c.replace(target, replacement, 1)
    print("Added click listeners for beat sync buttons in eq-modal.js")
    with open('public/js/ui/eq-modal.js', 'w', encoding='utf-8') as f:
        f.write(c)
else:
    print("target not found directly")
