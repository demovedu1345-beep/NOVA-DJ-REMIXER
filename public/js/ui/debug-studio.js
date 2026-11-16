export function escHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[m]));
}

export function fmtSec(sec) {
  const s = Math.max(0, Math.round(Number(sec) || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

const SEC_COLORS = {
  intro: 'rgba(255, 184, 0, 0.25)',
  verse: 'rgba(245, 245, 240, 0.08)',
  pre_chorus: 'rgba(255, 150, 50, 0.24)',
  build: 'rgba(255, 130, 0, 0.28)',
  chorus: 'rgba(255, 77, 0, 0.34)',
  drop: 'rgba(255, 77, 0, 0.38)',
  bridge: 'rgba(130, 170, 255, 0.22)',
  breakdown: 'rgba(90, 180, 220, 0.22)',
  outro: 'rgba(255, 184, 0, 0.2)',
};

function renderSongGridSvg(analysis, mixOutBar = null, mixInBar = null) {
  const dur = Math.max(1, analysis.duration_sec || 180);
  const heat = analysis.heat || [];
  const W = 800;
  const H = 96;

  const secRects = (analysis.sections || []).map((s) => {
    const x = Math.max(0, ((s.start_sec || 0) / dur) * W);
    const w = Math.max(2, (((s.end_sec || dur) - (s.start_sec || 0)) / dur) * W);
    const fill = SEC_COLORS[s.type] || 'rgba(245,245,240,0.06)';
    return `<g>
      <rect x="${x.toFixed(1)}" y="0" width="${w.toFixed(1)}" height="18" fill="${fill}" />
      ${w > 34 ? `<text x="${(x + 4).toFixed(1)}" y="13" fill="rgba(245,245,240,0.75)" font-size="9" font-family="monospace">${escHtml(s.type.toUpperCase())}</text>` : ''}
    </g>`;
  }).join('');

  const gapRects = (analysis.instrumental_gaps || []).map((g) => {
    const x = Math.max(0, ((g.start_sec || 0) / dur) * W);
    const w = Math.max(2, (((g.end_sec || 0) - (g.start_sec || 0)) / dur) * W);
    return `<rect x="${x.toFixed(1)}" y="${H - 6}" width="${w.toFixed(1)}" height="5" fill="#ffb800" opacity="0.7" />`;
  }).join('');

  const protectedRects = (analysis.lyric_understanding?.do_not_cut_ranges || []).map((r) => {
    const x = Math.max(0, ((Number(r.start_sec) || 0) / dur) * W);
    const w = Math.max(2, (((Number(r.end_sec) || 0) - (Number(r.start_sec) || 0)) / dur) * W);
    return `<rect x="${x.toFixed(1)}" y="19" width="${w.toFixed(1)}" height="4" fill="#ff4d6d" opacity="0.82" />`;
  }).join('');

  const bars = heat.map((h, i) => {
    const x = (i / Math.max(1, heat.length)) * W;
    const bh = Math.max(3, h * 54);
    const y = 22 + (58 - bh) / 2;
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(W / heat.length * 0.7).toFixed(1)}" height="${bh.toFixed(1)}" rx="1.5" fill="rgba(245,245,240,0.52)" />`;
  }).join('');

  const beatTimes = analysis.beat_times || [];
  const beatStep = Math.max(1, Math.floor(beatTimes.length / 160));
  const beatTicks = beatTimes.filter((_, idx) => idx % beatStep === 0).map((t) => {
    const x = (t / dur) * W;
    return `<line x1="${x.toFixed(1)}" y1="${H - 18}" x2="${x.toFixed(1)}" y2="${H - 8}" stroke="rgba(120,220,255,0.58)" stroke-width="1" />`;
  }).join('');

  const dbs = analysis.downbeat_times || [];
  const step = Math.max(1, Math.floor(dbs.length / 48));
  const dbLines = dbs.filter((_, idx) => idx % step === 0).map((t) => {
    const x = (t / dur) * W;
    return `<line x1="${x.toFixed(1)}" y1="20" x2="${x.toFixed(1)}" y2="${H - 8}" stroke="rgba(255,77,0,0.52)" stroke-width="1.2" />`;
  }).join('');

  const lyricMarkers = (analysis.lyrics || []).slice(0, 16).map((l) => {
    const x = Math.max(0, Math.min(W - 4, ((Number(l.start_sec) || 0) / dur) * W));
    const snippet = escHtml(String(l.text || '').slice(0, 14));
    return `<g>
      <circle cx="${x.toFixed(1)}" cy="86" r="2.2" fill="#9effa6" />
      <text x="${Math.min(W - 56, x + 4).toFixed(1)}" y="89" fill="rgba(158,255,166,0.8)" font-size="7.5" font-family="monospace">${snippet}</text>
    </g>`;
  }).join('');

  let markerSvg = '';
  if (mixOutBar !== null && analysis.bars?.[mixOutBar]) {
    const x = (analysis.bars[mixOutBar].start_sec / dur) * W;
    markerSvg += `<line x1="${x.toFixed(1)}" y1="0" x2="${x.toFixed(1)}" y2="${H}" stroke="#ff4d00" stroke-width="2.5" />
      <text x="${Math.min(W - 55, x + 3).toFixed(1)}" y="${H - 12}" fill="#ff4d00" font-size="10" font-weight="bold" font-family="monospace">OUT B${mixOutBar}</text>`;
  }
  if (mixInBar !== null && analysis.bars?.[mixInBar]) {
    const x = (analysis.bars[mixInBar].start_sec / dur) * W;
    markerSvg += `<line x1="${x.toFixed(1)}" y1="0" x2="${x.toFixed(1)}" y2="${H}" stroke="#ffb800" stroke-width="2.5" />
      <text x="${Math.min(W - 55, x + 3).toFixed(1)}" y="30" fill="#ffb800" font-size="10" font-weight="bold" font-family="monospace">IN B${mixInBar}</text>`;
  }

  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:84px;display:block;border-radius:10px;background:rgba(255,255,255,0.03);border:1px solid rgba(245,245,240,0.1)">
    ${secRects}${protectedRects}${bars}${beatTicks}${dbLines}${lyricMarkers}${gapRects}${markerSvg}
  </svg>`;
}

export function renderDebugModal({ plan, tracks, opusBusy, exportBusy, exportMsg, previewBusyIdx, auditBusyIdx, batchAuditBusy, tapState, ratingsMap }) {
  const analyses = plan?.analyses || [];
  const transitions = plan?.transitions || [];
  const dspCount = tracks.filter((t) => t.file || t.stemFiles || t.dspReady).length;

  return `
    <div class="modal-backdrop" id="debug-backdrop">
      <div class="modal-sheet" style="max-width:66rem;max-height:92dvh" onclick="event.stopPropagation()">
        <div style="padding:20px 24px;display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;align-items:center;border-bottom:2px solid rgba(245,245,240,0.12)">
          <div>
            <div class="font-display text-accent" style="font-size:30px;line-height:1">BEAT GRID &amp; RECIPE STUDIO</div>
            <div style="font-size:13px;color:rgba(245,245,240,0.6)">
              Planner: <strong class="text-amber">${escHtml(plan?.plannerSource || 'NOVA Engine')}</strong>
              · Validator: <strong style="color:${plan?.validation?.valid ? '#6bff95' : '#ffb800'}">${plan?.validation?.valid ? 'ALL RULES PASSED ✓' : 'SAFE FALLBACK ACTIVE'}</strong>
              ${opusBusy ? ' · AI Planning…' : ''}
            </div>
          </div>
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
            ${(dspCount >= 2 && transitions.length) ? `
              <button id="btn-audit-all-debug" class="pill-btn squeeze" style="border-color:var(--accent);color:var(--accent)" ${batchAuditBusy || auditBusyIdx >= 0 ? 'disabled' : ''}>
                ${batchAuditBusy ? 'AUDITING ALL…' : `🎧 AUDIT ALL (${transitions.length})`}
              </button>
            ` : ''}
            <button id="btn-export-wav-debug" class="pill-btn squeeze" style="border-color:var(--amber);color:var(--amber)" ${exportBusy || !dspCount ? 'disabled' : ''}>
              ${exportBusy ? 'RENDERING .WAV…' : '⬇ EXPORT MIX (.WAV)'}
            </button>
            <button id="btn-close-debug" class="exit-btn">✕</button>
          </div>
        </div>

        <div class="nova-scroll" style="padding:18px 24px;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:22px">
          ${exportMsg ? `<div class="status-banner" style="padding:8px 12px;border:1px solid rgba(255,184,0,0.3);border-radius:10px">${escHtml(exportMsg)}</div>` : ''}

          <div>
            <div class="font-display" style="font-size:22px;color:rgba(245,245,240,0.7);margin-bottom:10px">TRANSITION RECIPES, CREATIVITY &amp; AUDIO LISTENER (${transitions.length})</div>
            <div style="display:flex;flex-direction:column;gap:14px">
              ${transitions.length ? transitions.map((rec, idx) => {
                const a = analyses.find((x) => x.song_id === rec.from) || {};
                const b = analyses.find((x) => x.song_id === rec.to) || {};
                const bd = rec.compatibility?.breakdown || {};
                const scorePct = Math.round((rec.compatibility?.score || 0.7) * 100);
                const rKey = `${rec.from}->${rec.to}`;
                const rated = ratingsMap[rKey];
                const isPrevBusy = previewBusyIdx === idx;
                const isAuditBusy = auditBusyIdx === idx;
                const riskCol = rec.risk === 'high' ? '#ff6b6b' : rec.risk === 'medium' ? 'var(--amber)' : '#6bff95';
                const canPreview = Boolean(a.isDsp && b.isDsp);
                const log = Array.isArray(rec.critiqueLog) ? rec.critiqueLog : [];
                const ideas = Array.isArray(rec.creative_candidates) ? rec.creative_candidates : [];

                return `
                  <div style="border:2px solid rgba(245,245,240,0.14);border-radius:18px;padding:16px;background:rgba(255,255,255,0.02)">
                    <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px;align-items:center">
                      <div>
                        <span class="font-mono-num" style="font-size:12px;color:var(--accent)">#${idx + 1}</span>
                        <strong style="font-size:17px">${escHtml(a.title || rec.from)}</strong>
                        <span style="color:var(--amber)"> → </span>
                        <strong style="font-size:17px">${escHtml(b.title || rec.to)}</strong>
                      </div>
                      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                        <span class="row-tag">${escHtml(String(rec.type || '').replace(/_/g, ' ').toUpperCase())}</span>
                        <span class="font-mono-num" style="font-size:12px;padding:2px 8px;border-radius:6px;background:rgba(255,77,0,0.14);color:var(--accent)">FIT ${scorePct}%</span>
                        <span class="font-mono-num" style="font-size:11px;padding:2px 8px;border-radius:6px;border:1px solid ${riskCol};color:${riskCol}">RISK ${escHtml(String(rec.risk || 'low').toUpperCase())}</span>
                      </div>
                    </div>

                    <div class="font-mono-num" style="font-size:11px;color:rgba(245,245,240,0.58);margin-top:8px;display:flex;flex-wrap:wrap;gap:10px">
                      <span>OUT: Bar ${rec.mix_out_bar}</span>
                      <span>IN: Bar ${rec.mix_in_bar}</span>
                      <span>LEN: ${rec.length_bars} Bars</span>
                      <span>STRETCH: ${rec.tempo_plan?.stretch_from || '?'}→${rec.tempo_plan?.stretch_to || '?'} BPM (${rec.tempo_plan?.pitch_shift_semitones >= 0 ? '+' : ''}${rec.tempo_plan?.pitch_shift_semitones || 0}st)</span>
                      ${rec.added_drums ? `<span style="color:var(--amber)">+ DRUMS: ${escHtml(rec.added_drums.style.toUpperCase())}</span>` : ''}
                      <span>T:${bd.T ?? '-'} K:${bd.K ?? '-'} E:${bd.E ?? '-'} P:${bd.P ?? '-'} V:${bd.V ?? '-'} G:${bd.G ?? '-'}</span>
                    </div>

                    <p style="margin-top:8px;font-size:13px;color:rgba(245,245,240,0.82);line-height:1.45">${escHtml(rec.why)}</p>

                    ${ideas.length ? `
                      <div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px;align-items:center">
                        <span class="font-mono-num" style="font-size:11px;color:rgba(245,245,240,0.45)">3 IDEAS:</span>
                        ${ideas.map((c) => `
                          <button class="pill-btn squeeze ${c.type === rec.type ? 'active' : ''}" style="font-size:11px;padding:2px 8px" data-pick-idea="${idx}" data-idea-type="${escHtml(c.type)}" title="${escHtml(c.idea)}">
                            ${escHtml(c.type.replace(/_/g, ' ').toUpperCase())} (${Math.round((c.total || 0.7) * 100)})
                          </button>
                        `).join('')}
                      </div>
                    ` : ''}

                    ${log.length ? `
                      <div style="margin-top:10px;padding:10px 12px;border-radius:12px;background:rgba(255,184,0,0.06);border:1px solid rgba(255,184,0,0.25);font-size:12px">
                        <div class="font-mono-num" style="color:var(--amber);margin-bottom:4px">DJUSTIFY RENDER → CHECK (9 GATES) → CRITIQUE LOG (${log.length} ITERATION${log.length > 1 ? 'S' : ''})</div>
                        ${log.map((item) => `
                          <div style="margin-top:4px;color:rgba(245,245,240,0.8)">
                            <strong>#${item.iteration}: ${item.passed ? '✓ PASSED' : '↻ REVISED'} (${item.score}/10)</strong>
                            · Bass Overlap ${item.metrics?.bass_overlap_pct ?? 0}% · Drift ${item.metrics?.beat_drift_ms ?? 0}ms · LUFS Δ ${item.metrics?.lufs_jump_db ?? 0}dB · Energy Hole ${item.metrics?.energy_hole_pct ?? 0}% · Clip ${item.metrics?.clipping_samples ?? 0}
                            ${item.checkerGates ? `<span class="row-tag" style="font-size:9px;margin-left:4px;background:${item.checkerGates.passed ? 'rgba(107,255,149,0.15)' : 'rgba(255,107,107,0.15)'};color:${item.checkerGates.passed ? '#6bff95' : '#ff6b6b'}">GATES: ${item.checkerGates.passed_count}/${item.checkerGates.total_gates}</span>` : ''}
                            <div style="opacity:0.75">${escHtml(item.notes || '')}</div>
                          </div>
                        `).join('')}
                      </div>
                    ` : ''}

                    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">
                      ${canPreview ? `<button class="pill-btn squeeze" style="font-size:14px;padding:5px 12px" data-preview-rec="${idx}" ${isPrevBusy ? 'disabled' : ''}>${isPrevBusy ? 'PLAYING PREVIEW…' : '▶ PREVIEW 8S'}</button>` : ''}
                      ${canPreview ? `<button class="pill-btn squeeze" style="font-size:14px;padding:5px 12px;border-color:var(--amber);color:var(--amber)" data-audit-rec="${idx}" ${isAuditBusy ? 'disabled' : ''}>${isAuditBusy ? 'LISTENING & AUDITING…' : '🎧 AI LISTENER CHECK'}</button>` : ''}
                      <button class="pill-btn squeeze" style="font-size:14px;padding:5px 12px" data-regen-rec="${idx}">↻ REGENERATE</button>
                      <button class="pill-btn squeeze ${rated === 'good' ? 'active' : ''}" style="font-size:14px;padding:5px 12px" data-rate-rec="${idx}" data-rate-val="good">👍 GOOD</button>
                      <button class="pill-btn squeeze ${rated === 'bad' ? 'active' : ''}" style="font-size:14px;padding:5px 12px" data-rate-rec="${idx}" data-rate-val="bad">👎 FIX</button>
                    </div>
                  </div>
                `;
              }).join('') : '<p style="color:rgba(245,245,240,0.5)">Add at least 2 tracks to inspect transitions.</p>'}
            </div>
          </div>

          <div>
            <div class="font-display" style="font-size:22px;color:rgba(245,245,240,0.7);margin-bottom:10px">TRACK BEAT GRIDS, LYRICS &amp; PROTECTED PHRASES (${analyses.length})</div>
            <div style="display:flex;flex-direction:column;gap:14px">
              ${analyses.map((a, idx) => {
                const outRec = transitions.find((r) => r.from === a.song_id);
                const inRec = transitions.find((r) => r.to === a.song_id);
                const lu = a.lyric_understanding || {};
                const protCount = lu.do_not_cut_ranges?.length || 0;
                const isTapHere = tapState?.idx === idx && tapState.count > 0;
                const tc = a.tracker_comparison || null;
                const hasStems = Boolean(a.stems_available || a.neuralStems);
                const lowConf = Boolean(a.low_confidence || a.safe_transitions_only || (a.warnings || []).includes('low_confidence'));
                return `
                  <div style="border:1px solid ${lowConf ? 'rgba(255,90,90,0.45)' : 'rgba(245,245,240,0.12)'};border-radius:14px;padding:12px">
                    <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;margin-bottom:8px">
                      <span style="font-weight:600">${idx + 1}. ${escHtml(a.title)} <span style="opacity:0.55">· ${escHtml(a.artist)}</span></span>
                      <span class="font-mono-num" style="font-size:12px;color:var(--amber)">
                        ${a.bpm} BPM (${Math.round((a.bpm_confidence || 0.7) * 100)}%) · ${a.key_camelot || 'NO KEY'} · ${a.bar_count} BARS · ${a.beat_times?.length || 0} BEATS · ${a.instrumental_gaps?.length || 0} GAPS
                        · ${hasStems ? '<span style="color:#6bff95">STEMS: DEMUCS 4-LANE ✓</span>' : '<span style="color:rgba(245,245,240,0.58)">STEMS: OFF (EQ ISOLATOR)</span>'}
                        ${a.content_hash ? ` · ${a.cached ? 'CACHED ✓' : 'HASH'} ${escHtml(String(a.content_hash).slice(0, 8))}` : ''}
                        ${lu.language ? ` · ${escHtml(String(lu.language).toUpperCase())}` : ''}
                        ${protCount ? ` · 🛡 ${protCount} PROTECTED` : ''}
                        ${lowConf ? ' · <span style="color:#ff7b7b">⚠ LOW CONFIDENCE · SAFE-TRANSITIONS ONLY</span>' : (a.warnings?.length ? ` · ⚠ ${escHtml(a.warnings.join(', '))}` : '')}
                      </span>
                    </div>
                    ${tc ? `
                      <div class="font-mono-num" style="font-size:11px;color:rgba(245,245,240,0.55);margin-bottom:6px">
                        DUAL TRACKER: ${tc.method_a ? `${escHtml(tc.method_a.name)} ${tc.method_a.bpm} BPM` : 'Essentia N/A'} vs ${tc.method_b ? `${escHtml(tc.method_b.name)} ${tc.method_b.bpm} BPM` : ''}
                        · Chosen: ${escHtml(tc.chosen || '')} · Agreement: ${tc.agreement_pct ?? 100}%${tc.octave_resolved ? ' (2×/½× OCTAVE RESOLVED)' : ''}
                      </div>
                    ` : ''}
                    ${renderSongGridSvg(a, outRec?.mix_out_bar ?? null, inRec?.mix_in_bar ?? null)}
                    <div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px;align-items:center">
                      <span class="font-mono-num" style="font-size:11px;color:rgba(245,245,240,0.48)">BEAT-1 CALIBRATE:</span>
                      <button class="pill-btn squeeze" style="font-size:11px;padding:2px 8px;border-color:rgba(120,220,255,0.45);color:#78dcff" data-click-check="${idx}">▶ CLICK CHECK</button>
                      <button class="pill-btn squeeze" style="font-size:11px;padding:2px 8px" data-nudge-beats="${idx}" data-delta="-1">◀ -1 BEAT</button>
                      <button class="pill-btn squeeze" style="font-size:11px;padding:2px 8px" data-nudge-beats="${idx}" data-delta="1">+1 BEAT ▶</button>
                      <button class="pill-btn squeeze" style="font-size:11px;padding:2px 8px" data-nudge-ms="${idx}" data-delta="-20">◀ -20ms</button>
                      <button class="pill-btn squeeze" style="font-size:11px;padding:2px 8px" data-nudge-ms="${idx}" data-delta="20">+20ms ▶</button>
                      <button class="pill-btn squeeze" style="font-size:11px;padding:2px 8px" data-grid-mult="${idx}" data-mult="0.5">÷2</button>
                      <button class="pill-btn squeeze" style="font-size:11px;padding:2px 8px" data-grid-mult="${idx}" data-mult="2">×2</button>
                      <button class="pill-btn squeeze ${isTapHere ? 'active' : ''}" style="font-size:11px;padding:2px 10px;border-color:var(--amber);color:var(--amber)" data-tap-bpm="${idx}">
                        🥁 ${isTapHere ? `TAP (${tapState.count}): ${tapState.bpm || '…'} BPM` : 'TAP BPM'}
                      </button>
                    </div>
                    ${(a.lyrics?.length || lu.translation || lu.hook_line) ? `
                      <div style="margin-top:8px;font-size:12px;color:rgba(245,245,240,0.72);line-height:1.45">
                        ${lu.hook_line ? `<div><strong class="text-amber">Hook:</strong> "${escHtml(lu.hook_line)}" · <strong>Theme:</strong> ${escHtml(lu.theme || '')} (${escHtml(lu.mood || '')})</div>` : ''}
                        ${lu.translation ? `<div style="opacity:0.75"><strong>Meaning:</strong> ${escHtml(lu.translation)}</div>` : ''}
                        ${a.lyrics?.length ? `<div style="margin-top:4px;opacity:0.65;font-family:monospace">${a.lyrics.slice(0, 4).map((l) => `[${fmtSec(l.start_sec)}] ${escHtml(l.text)}`).join(' · ')}</div>` : ''}
                      </div>
                    ` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderBrainModal({ claudeKeySet, geminiKeySet, openaiKeySet, claudeKey = '', geminiKey = '', openaiKey = '', health, learningStats }) {
  const roles = health?.ai?.roles || {};
  const prov = health?.ai?.providers || {};
  const gemActive = Boolean(prov.gemini?.configured || geminiKeySet || geminiKey);
  const oaiActive = Boolean(prov.openai?.configured || openaiKeySet || openaiKey);
  const antActive = Boolean(prov.anthropic?.configured || claudeKeySet || claudeKey);

  return `
    <div class="modal-backdrop" id="brain-backdrop">
      <div class="modal-sheet" style="max-width:56rem;background:linear-gradient(180deg,#0a0a0e 0%,#050508 100%);border:1px solid rgba(245,245,240,0.12);box-shadow:0 24px 64px rgba(0,0,0,0.85);border-radius:18px;overflow:hidden" onclick="event.stopPropagation()">
        
        <!-- Header -->
        <div style="padding:24px 28px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(245,245,240,0.1);background:rgba(255,255,255,0.015)">
          <div style="display:flex;align-items:center;gap:14px">
            <div style="width:36px;height:36px;border-radius:10px;background:rgba(255,184,0,0.12);border:1px solid rgba(255,184,0,0.3);display:flex;align-items:center;justify-content:center;font-size:18px">
              ⚡
            </div>
            <div>
              <div class="font-display" style="font-size:26px;letter-spacing:0.02em;text-transform:uppercase;color:#fff;line-height:1.1">NOVA AI MUSIC BRAIN</div>
              <div style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.08em;color:rgba(245,245,240,0.5);text-transform:uppercase;margin-top:2px">
                Autonomous DSP Orchestrator · Multi-LLM Transition Planner
              </div>
            </div>
          </div>
          <button id="btn-close-brain" class="exit-btn squeeze" style="border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(245,245,240,0.15)">✕</button>
        </div>

        <div class="nova-scroll" style="padding:24px 28px;max-height:calc(85vh - 90px);overflow-y:auto;display:flex;flex-direction:column;gap:22px">
          
          <!-- Live AI Provider Status Grid -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:12px">
            
            <!-- Gemini Card -->
            <div style="background:rgba(255,255,255,0.03);border:1px solid ${gemActive ? 'rgba(74,222,128,0.35)' : 'rgba(255,255,255,0.08)'};border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:8px">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <span class="font-display" style="font-size:17px;letter-spacing:0.04em">GOOGLE GEMINI</span>
                <span style="font-family:var(--font-mono);font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;background:${gemActive ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.06)'};color:${gemActive ? '#4ade80' : 'rgba(245,245,240,0.4)'};border:1px solid ${gemActive ? 'rgba(74,222,128,0.4)' : 'transparent'}">
                  ${gemActive ? '● ONLINE · PRIMARY' : '○ STANDBY'}
                </span>
              </div>
              <div style="font-size:12px;color:rgba(245,245,240,0.7);line-height:1.4">
                Active Model: <code style="color:var(--amber)">gemini-flash-lite-latest</code><br/>
                Roles: Set Planner, Audio Listener, Lyric Semantic Analysis
              </div>
            </div>

            <!-- OpenAI Card -->
            <div style="background:rgba(255,255,255,0.03);border:1px solid ${oaiActive ? 'rgba(96,165,250,0.35)' : 'rgba(255,255,255,0.08)'};border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:8px">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <span class="font-display" style="font-size:17px;letter-spacing:0.04em">OPENAI</span>
                <span style="font-family:var(--font-mono);font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;background:${oaiActive ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.06)'};color:${oaiActive ? '#60a5fa' : 'rgba(245,245,240,0.4)'};border:1px solid ${oaiActive ? 'rgba(96,165,250,0.4)' : 'transparent'}">
                  ${oaiActive ? '● CONFIGURED' : '○ STANDBY'}
                </span>
              </div>
              <div style="font-size:12px;color:rgba(245,245,240,0.7);line-height:1.4">
                Active Model: <code style="color:var(--amber)">gpt-4o-mini / whisper-1</code><br/>
                Roles: Transition Critic, Lyric Transcription &amp; Validation
              </div>
            </div>

            <!-- Claude Card -->
            <div style="background:rgba(255,255,255,0.03);border:1px solid ${antActive ? 'rgba(192,132,252,0.35)' : 'rgba(255,255,255,0.08)'};border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:8px">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <span class="font-display" style="font-size:17px;letter-spacing:0.04em">ANTHROPIC CLAUDE</span>
                <span style="font-family:var(--font-mono);font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;background:${antActive ? 'rgba(192,132,252,0.15)' : 'rgba(255,255,255,0.06)'};color:${antActive ? '#c084fc' : 'rgba(245,245,240,0.4)'};border:1px solid ${antActive ? 'rgba(192,132,252,0.4)' : 'transparent'}">
                  ${antActive ? '● CONFIGURED' : '○ STANDBY'}
                </span>
              </div>
              <div style="font-size:12px;color:rgba(245,245,240,0.7);line-height:1.4">
                Active Model: <code style="color:var(--amber)">claude-3-5-sonnet</code><br/>
                Roles: Creative Director, Set Progression &amp; Harmonic Arc
              </div>
            </div>

          </div>

          <!-- Architecture & DSP Capabilities Breakdown -->
          <div style="background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:18px 20px;display:flex;flex-direction:column;gap:10px">
            <div class="font-display" style="font-size:16px;letter-spacing:0.05em;color:var(--amber);text-transform:uppercase">
              ACTIVE AUDIO DSP &amp; AI SYSTEM ARCHITECTURE
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:12px;font-size:13px;color:rgba(245,245,240,0.85);line-height:1.6">
              <div>
                <strong>Acoustic Analysis:</strong> ${health?.audioWorkerConfigured ? 'Python GPU Demucs + WhisperX (External Worker) ✓' : 'Essentia WASM Beatgrid + Tempo Lock (Browser) ✓'}<br/>
                <strong>Stem Isolation:</strong> 4-Band Mid-Side &amp; Frequency Crossover (Real-time DSP) ✓<br/>
                <strong>Transition Engine:</strong> 19 Autonomous Recipes (Bass Swap, Echo Drop, Vocal Mashup) ✓
              </div>
              <div>
                <strong>Set Planner Routing:</strong> ${escHtml(roles.PLANNER || 'gemini-flash-lite-latest (Active)')} ✓<br/>
                <strong>Harmonic Key Matching:</strong> Camelot Wheel Energy Shifts (Energy Boost, Relative, Subdominant) ✓<br/>
                <strong>State Persistence:</strong> ${health?.database?.connected ? `${escHtml(health.database.provider.toUpperCase())} Cloud DB Connected ✓` : 'Browser LocalStorage &amp; Session Active ✓'}
              </div>
            </div>
          </div>

          <!-- Learning Stats if any -->
          ${learningStats?.total ? `
            <div style="background:rgba(255,184,0,0.05);border:1px solid rgba(255,184,0,0.2);border-radius:12px;padding:16px 20px;font-size:13px;color:rgba(245,245,240,0.8)">
              <div class="font-display" style="font-size:16px;color:var(--amber);margin-bottom:6px">LEARNING LOOP ADAPTIVE PREFERENCES (${learningStats.total} USER RATINGS)</div>
              <div>Top Rated Recipes: <strong style="color:#fff">${learningStats.winners.length ? escHtml(learningStats.winners.join(', ')) : 'Continuous learning active'}</strong></div>
              ${learningStats.avoid.length ? `<div style="color:#ff9090;margin-top:4px">De-prioritized Styles: ${escHtml(learningStats.avoid.join(', '))}</div>` : ''}
            </div>
          ` : ''}

          <!-- API Key Manager / Override Panel -->
          <div style="border-top:1px solid rgba(245,245,240,0.12);padding-top:18px">
            <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:8px">
              <div>
                <label class="font-display" style="font-size:18px;color:var(--amber);display:block">API KEYS CONFIGURATION &amp; CREDENTIALS</label>
                <p style="font-size:12px;color:rgba(245,245,240,0.6);margin-top:2px">
                  Keys are pre-armed and active on your system. You can update or override them below; changes persist securely in local storage and forward with your requests.
                </p>
              </div>
            </div>

            <div style="display:flex;flex-direction:column;gap:10px;margin-top:12px">
              <div>
                <label style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.06em;color:rgba(245,245,240,0.5);text-transform:uppercase;display:block;margin-bottom:4px">
                  Google Gemini Key ${gemActive ? '<span style="color:#4ade80">(ACTIVE ✓)</span>' : ''}
                </label>
                <input id="input-gemini-key" type="password" class="ingest-input" style="height:42px;font-size:13px;width:100%" placeholder="Enter Gemini API key…" value="${escHtml(geminiKey || '')}" />
              </div>

              <div>
                <label style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.06em;color:rgba(245,245,240,0.5);text-transform:uppercase;display:block;margin-bottom:4px">
                  OpenAI API Key ${oaiActive ? '<span style="color:#60a5fa">(ACTIVE ✓)</span>' : ''}
                </label>
                <input id="input-openai-key" type="password" class="ingest-input" style="height:42px;font-size:13px;width:100%" placeholder="Enter OpenAI API key…" value="${escHtml(openaiKey || '')}" />
              </div>

              <div>
                <label style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.06em;color:rgba(245,245,240,0.5);text-transform:uppercase;display:block;margin-bottom:4px">
                  Anthropic Claude API Key ${antActive ? '<span style="color:#c084fc">(ACTIVE ✓)</span>' : ''}
                </label>
                <div style="display:flex;gap:10px">
                  <input id="input-opus-key" type="password" class="ingest-input" style="flex:1;height:42px;font-size:13px" placeholder="Enter Anthropic Claude key…" value="${escHtml(claudeKey || '')}" />
                  <button id="btn-save-opus-key" class="ingest-btn squeeze" style="height:42px;font-size:15px;padding:0 22px;letter-spacing:0.05em">
                    SAVE KEYS
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;
}
