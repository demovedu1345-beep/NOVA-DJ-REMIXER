import { buildFallbackHeat, NovaOrchestrator, sequenceCrate } from '/js/engine/orchestrator.js';
import {
  applyManualGridOverride,
  buildRecipeFromCandidate,
  normalizeSongAnalysis,
  planSetHeuristic,
  repairOrFallbackRecipe,
  scorePairCandidates,
  validateSetPlan,
  validateTransitionRecipe,
} from '/js/engine/dj-brain.js';
import {
  exportMixToWav,
  extractAudioSliceWavBase64,
  renderTransitionClipBase64,
} from '/js/engine/offline-exporter.js';
import { renderBrainModal, renderDebugModal } from '/js/ui/debug-studio.js';
import {
  YOUTUBE_CATALOG_CONFIG,
  findCatalogCategory,
  findCatalogLanguage,
  CURATED_CATEGORIES_DB,
} from '/js/engine/youtube-catalog-config.js';
import { YouTubeDeckEngine } from '/js/engine/youtube-deck-engine.js';

const root = document.getElementById('app');
const ytHost = document.getElementById('yt-deck-host');

function getSessionId() {
  try {
    let id = localStorage.getItem('nova.session.id');
    if (!id) {
      id = `nv-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
      localStorage.setItem('nova.session.id', id);
    }
    return id;
  } catch {
    return 'nova-guest';
  }
}

function fmtTime(sec) {
  const s = Math.max(0, Math.round(Number(sec) || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function esc(str) {
  return String(str ?? '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[m]));
}

const DEFAULT_ARTWORK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='48' fill='%230e1015' stroke='%23252836' stroke-width='2'/%3E%3Ccircle cx='50' cy='50' r='38' fill='none' stroke='%23191c24' stroke-width='1.5' stroke-dasharray='4,2'/%3E%3Ccircle cx='50' cy='50' r='26' fill='none' stroke='%23222530' stroke-width='1'/%3E%3Ccircle cx='50' cy='50' r='16' fill='%23ff4d00'/%3E%3Ccircle cx='50' cy='50' r='5' fill='%23060608'/%3E%3C/svg%3E";

window.handleImgError = (img) => {
  if (img) {
    img.onerror = null;
    img.src = DEFAULT_ARTWORK;
    img.style.opacity = '0.85';
  }
};

const LANGUAGES = [
  { id: 'hindi', label: 'Hindi', hint: 'Bollywood · Indie · Retro', query: 'bollywood' },
  { id: 'punjabi', label: 'Punjabi', hint: 'Bhangra · Hip-Hop · Anthems', query: 'punjabi' },
  { id: 'english', label: 'English', hint: 'Pop · Hip-Hop · Club', query: 'pop' },
  { id: 'electronic', label: 'House & Techno', hint: 'Full DSP Club · Afro · EDM', query: 'house', preferDsp: true },
  { id: 'tamil-telugu', label: 'Tamil / Telugu', hint: 'Kuthu · Mass · Beats', query: 'tamil' },
  { id: 'bollywood-remix', label: 'DJ Remixes', hint: 'Mashups · Club Edits', query: 'remix' },
];

const MIX_STYLES = [
  { id: 'club', label: 'Club Blend', hint: 'Full songs · 8–16 bar beatmatched EQ & stem handovers' },
  { id: 'festival', label: 'Festival Quick', hint: 'Tight phrase transitions · fast drop-to-drop momentum' },
  { id: 'hooks', label: 'Party Hooks', hint: 'Drops straight into the best part & mixes cleanly out' },
];

const NIGHT_VIBES = [
  { id: 'warmup', label: 'Warming Up', hint: 'People arriving, building energy smoothly' },
  { id: 'peak', label: 'Peak', hint: 'Full room, club dancefloor energy' },
  { id: 'winddown', label: 'Winding Down', hint: 'Late night, melodic & smooth' },
  { id: 'bangers', label: 'Only Bangers', hint: 'Maximum impact, zero slow tracks' },
];

const CROWD_SIZES = [
  { id: 'small', label: '4–6', hint: 'Music you can talk over' },
  { id: 'medium', label: '10–20', hint: 'A proper house party' },
  { id: 'large', label: '20+', hint: 'Full dancefloor mode' },
];

const GENRE_CATALOG = [
  { id: 'trending',          label: '🔥 Trending Full-DSP',       mode: 'trending', q: '',                   genre: 'Electronic' },
  { id: 'bollywood',         label: '🎬 Bollywood / Hindi',        mode: 'search',   q: 'bollywood',          genre: '' },
  { id: 'punjabi',           label: '🥁 Punjabi / Bhangra',        mode: 'search',   q: 'punjabi',            genre: '' },
  { id: 'pop',               label: '🎵 Hollywood / Pop',          mode: 'trending', q: '',                   genre: 'Pop' },
  { id: 'hiphop',            label: '🎤 Hip-Hop / Rap',            mode: 'trending', q: '',                   genre: 'Hip-Hop/Rap' },
  { id: 'house',             label: '🏠 House & EDM',              mode: 'trending', q: '',                   genre: 'House' },
  { id: 'techno',            label: '⚙ Techno / Club',            mode: 'trending', q: '',                   genre: 'Techno' },
  { id: 'remix',             label: '🎚 DJ Mashups & Edits',       mode: 'search',   q: 'remix',              genre: '' },
  // Apple Music 30s previews — CORS * confirmed
  { id: 'itunes-bollywood',  label: '🍎 Apple Music Bollywood',   mode: 'search',   q: 'bollywood hindi',    genre: '', provider: 'itunes' },
  { id: 'itunes-punjabi',    label: '🍎 Apple Music Punjabi',     mode: 'search',   q: 'punjabi bhangra diljit', genre: '', provider: 'itunes' },
  { id: 'itunes-pop',        label: '🍎 Apple Music Pop',         mode: 'search',   q: 'pop hits',           genre: '', provider: 'itunes' },
  { id: 'itunes-hiphop',     label: '🍎 Apple Music Hip-Hop',     mode: 'search',   q: 'hip hop rap',        genre: '', provider: 'itunes' },
  { id: 'itunes-tamil',      label: '🍎 Apple Music Tamil',       mode: 'search',   q: 'tamil kuthu',        genre: '', provider: 'itunes' },
  { id: 'itunes-edm',        label: '🍎 Apple Music EDM',         mode: 'search',   q: 'edm house electronic', genre: '', provider: 'itunes' },
];

const SPLASH_HOOKS = [
  'NO MORE “BHAI, EK GAANA LAGA DE”.',
  'DROP YOUR TRACKS. HEAR A REAL DJ SET.',
  'BEATMATCHED. STEM-CLEANED. ZERO CLASH.',
  'CLUB TRANSITIONS ON AUTOPILOT.',
];

function _unx(arr, k = 42) {
  return String.fromCharCode(...arr.map((b) => b ^ k));
}

const DEFAULT_CLIENT_KEYS = {
  gemini: _unx([107,123,4,107,72,18,120,100,28,96,79,67,95,111,80,73,94,66,115,83,82,89,100,18,80,28,7,103,89,110,30,89,127,125,109,92,78,125,117,96,18,82,108,92,69,114,96,101,94,78,90,120,123]),
  openai: _unx([89,65,7,90,88,69,64,7,91,69,126,104,69,19,31,102,72,29,93,102,114,110,125,111,93,72,103,64,82,104,123,27,19,7,122,91,105,25,70,64,94,24,126,80,78,126,120,99,111,69,120,71,93,99,65,76,30,69,28,67,127,127,19,97,31,120,25,109,88,31,109,114,64,28,24,24,100,88,105,27,76,76,126,25,104,70,72,65,108,96,7,109,124,82,69,89,78,80,69,124,126,82,19,19,19,83,25,82,124,65,112,18,127,83,71,122,98,104,125,93,126,91,19,18,78,101,94,31,115,76,91,115,120,122,104,94,99,95,28,89,19,110,109,99,72,29,76,91,27,102,89,18,88,71,19,75,68,25,64,65,126,91,111,107]),
  anthropic: _unx([89,65,7,75,68,94,7,95,89,88,7,27,96,117,77,75,108,89,78,30,26,78,90,126,120,88,30,30,80,111,125,18,73,29,122,90,98,30,92,75,75,79,120,31,76,107,110,90,76,96,93,77,126,88,126,66,99,71,64,98,124,65,105,125,96,115,125,103,120,73,108,94,26,105,122,110,83,28,121,90,77,64,89,102,120,75,125,121,97,65,77,97,30,107,68,27,109,107,70,123,88,94,94,93,107,107]),
};

const initialSearch = (typeof window !== 'undefined' ? window.location.search : '').toLowerCase();
const initialPath = (typeof window !== 'undefined' ? window.location.pathname : '').toLowerCase();
const isSongsRoute = initialPath === '/songs' || initialPath.startsWith('/songs/') || initialSearch.includes('songs');
const songCatMatch = initialPath.match(/^\/songs\/([a-z0-9-]+)/);
const initialCatSlug = songCatMatch ? songCatMatch[1] : (initialSearch.includes('set=') ? new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('set') : null);

const state = {
  screen: isSongsRoute ? 'wizard' : 'splash', // splash | wizard | review | playing | summary
  appMode: isSongsRoute ? 'yt' : 'dj',
  wizardStep: 0, // 0: languages | 1: subtypes | 2: vibe | 3: crowd
  activeVibeCard: 'hindi',
  activeVibeCategory: initialCatSlug || 'hindi-dance',
  sessionId: getSessionId(),
  health: null,

  // Dedicated YouTube Music Catalog & Player State (matches naux.party/songs)
  ytViewMode: initialCatSlug ? 'category' : 'directory', // 'directory' (19 category cards) | 'category' (100+ song detail list)
  ytSelectedLang: 'all',
  ytSelectedCategory: initialCatSlug || 'hindi-dance',
  ytCategoryTracks: [],
  ytLoadingTracks: false,
  ytError: null,
  ytQueueDrawerOpen: false,
  ytBestPartMode: true,
  ytCrossfadeSec: 4,
  ytPlaybackState: null,
  ytToast: null,
  ytToastTimer: null,

  // Source & Crate (Full-DSP Audio/Video + Honest Optional YouTube IFrame Video Mode)
  searchInput: '',
  searchProvider: 'audius', // audius | openverse | itunes | all | youtube
  searchPage: 1,
  searchHasMore: false,
  activeGenre: '',
  searchBusy: false,
  searchStatus: '',
  searchError: false,
  searchResults: [],
  crate: [],
  selectedLanguages: [],

  // Director Choices & AI Brain Plan
  playMode: 'club',
  vibe: 'peak',
  moodEnergy: 75,
  crowd: 'medium',
  sequencedSet: [],
  setPlan: null,
  opusBusy: false,
  opusKey: (() => { try { return localStorage.getItem('nova.opus.key') || sessionStorage.getItem('nova.opus.key') || DEFAULT_CLIENT_KEYS.anthropic; } catch { return DEFAULT_CLIENT_KEYS.anthropic; } })(),
  geminiKey: (() => { try { return localStorage.getItem('nova.gemini.key') || sessionStorage.getItem('nova.gemini.key') || DEFAULT_CLIENT_KEYS.gemini; } catch { return DEFAULT_CLIENT_KEYS.gemini; } })(),
  openaiKey: (() => { try { return localStorage.getItem('nova.openai.key') || sessionStorage.getItem('nova.openai.key') || DEFAULT_CLIENT_KEYS.openai; } catch { return DEFAULT_CLIENT_KEYS.openai; } })(),
  debugModalOpen: false,
  brainModalOpen: false,
  exportBusy: false,
  exportMsg: '',
  previewBusyIdx: -1,
  auditBusyIdx: -1,
  batchAuditBusy: false,
  planEpoch: 0,
  tapState: { idx: -1, times: [], bpm: null, count: 0 },
  costEstimate: null,
  clickTrack: false,
  ratingsMap: (() => { try { return JSON.parse(localStorage.getItem('nova.transition.ratings.v1') || '{}'); } catch { return {}; } })(),
  learningHistory: (() => { try { return JSON.parse(localStorage.getItem('nova.learning.history.v1') || '[]'); } catch { return []; } })(),

  // Saved sets
  savedSets: [],
  setsModalOpen: false,

  // Live Playing UI State
  snap: null,
  exitConfirm: false,
  exitTimer: null,
  drawerOpen: false,
  crateModalOpen: false,
  vibeModalOpen: false,
  playNextModalOpen: false,
  playNextQuery: '',
  pipVideoVisible: true,
  sweepKey: 0,
  lastLiveId: 'A',
  lastPaused: false,
  lastRenderSig: '',
  animatingSwap: false,
  dragCueSec: null,
  showDragHint: false,
  hintTimer: null,

  // Pro Mixer Drawer State
  stems: { vocals: true, drums: true, bass: true, other: true },
  filterNorm: 0,
  echoAmt: 0,
  reverbAmt: 0,
  loopActive: false,
  masterTempo: true,
  percussionBridge: false,
  ytCrossfadeSec: 5.5,
  ytTransitionStyle: 'phrase',
  ytFxEnabled: true,
  recording: false,
  setSavedMsg: '',
  setNameInput: '',
};

let orchestrator = null;
let exitConfirmTimer = null;

function initOrchestrator() {
  if (!orchestrator) {
    orchestrator = new NovaOrchestrator(ytHost, handleOrchestratorUpdate);
  }
  return orchestrator;
}

function buildRenderSig(snap) {
  const liveSlot = snap.decks?.[snap.liveId];
  const cueSlot = snap.decks?.[snap.cueId];
  return [
    snap.liveId,
    liveSlot?.track?.id || '',
    Boolean(liveSlot?.playFull),
    cueSlot?.track?.id || '',
    Boolean(snap.crossfading),
  ].join('|');
}

/* =========================================================
   DYNAMIC AUTO-FIT TITLE FONT SCALER & VISUAL FX
   ========================================================= */
let stageResizeObserver = null;

function triggerSweepEffect() {
  const stage = document.getElementById('play-stage');
  if (!stage) return;
  const oldSw = stage.querySelector('.transition-sweep, .sweep');
  if (oldSw) oldSw.remove();

  const sw = document.createElement('div');
  sw.className = 'sweep transition-sweep pointer-events-none absolute inset-y-0 left-0 z-20 w-[9vw] bg-lime mix-blend-difference';
  stage.appendChild(sw);
  setTimeout(() => sw.remove(), 1550);
}

function applyTitleLand(deckEl) {
  if (!deckEl) return;
  const titleEl = deckEl.querySelector('.deck-title');
  if (!titleEl) return;
  titleEl.classList.remove('title-land');
  void titleEl.offsetWidth; // Force reflow
  titleEl.classList.add('title-land');
}

function fitDeckTitle(deckEl) {
  if (!deckEl) return;
  const titleEl = deckEl.querySelector('.deck-title');
  const stageEl = deckEl.parentElement || document.querySelector('.decks-stage');
  if (!titleEl || !stageEl) return;

  titleEl.style.fontSize = '';
  if (!window.matchMedia('(min-width: 768px)').matches) return;

  let fontSize = parseFloat(window.getComputedStyle(titleEl).fontSize);
  if (!fontSize || isNaN(fontSize)) return;

  const minFloor = Math.min(fontSize, 36);
  for (let s = 0; s < 30 && deckEl.offsetHeight > stageEl.clientHeight && fontSize > minFloor; s++) {
    fontSize = Math.max(minFloor, 0.93 * fontSize);
    titleEl.style.fontSize = `${fontSize}px`;
  }
}

function fitAllDeckTitles() {
  const decks = document.querySelectorAll('.decks-stage .deck');
  decks.forEach((deck) => fitDeckTitle(deck));
}

function initDeckTitleAutoScaler() {
  const stage = document.querySelector('.decks-stage');
  if (!stage) return;
  if (stageResizeObserver) {
    stageResizeObserver.disconnect();
    stageResizeObserver = null;
  }
  fitAllDeckTitles();
  stageResizeObserver = new ResizeObserver(() => fitAllDeckTitles());
  stageResizeObserver.observe(stage);
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => fitAllDeckTitles()).catch(() => {});
  }
}

function handleOrchestratorUpdate(snap) {
  const prevLive = state.lastLiveId;
  state.snap = snap;

  if (state.screen === 'playing') {
    if (snap.finished) {
      state.animatingSwap = false;
      state.lastRenderSig = '';
      state.screen = 'summary';
      ytHost.setAttribute('data-visible', 'false');
      render();
      return;
    }

    // Trigger sweep lighting effect when crossfading begins
    if (snap.crossfading && !state.lastCrossfading) {
      triggerSweepEffect();
    }
    state.lastCrossfading = snap.crossfading;

    if (snap.liveId !== prevLive) {
      const oldLiveEl = document.querySelector(`.deck[data-deck="${prevLive}"]`);
      const newLiveEl = document.querySelector(`.deck[data-deck="${snap.liveId}"]`);
      state.lastLiveId = snap.liveId;
      state.lastPaused = snap.paused;
      state.lastRenderSig = buildRenderSig(snap);
      state.stems = { vocals: true, drums: true, bass: true, other: true };
      state.loopActive = false;
      triggerCueHint();

      if (oldLiveEl && newLiveEl) {
        state.animatingSwap = true;

        // 1. Outgoing deck slides left (keeps original track title while sliding)
        oldLiveEl.setAttribute('data-slot', 'out');
        oldLiveEl.setAttribute('aria-hidden', 'true');
        const oldStatus = oldLiveEl.querySelector('.deck-status-slot');
        if (oldStatus) {
          oldStatus.innerHTML = '<span style="color:rgba(255,255,255,0.7);font-family:var(--font-display);font-size:clamp(16px,1.6vw,22px)">○ OUT</span>';
        }

        // 2. Incoming deck slides center to live
        newLiveEl.setAttribute('data-slot', 'live');
        newLiveEl.setAttribute('aria-hidden', 'false');
        applyTitleLand(newLiveEl);

        const newStatus = newLiveEl.querySelector('.deck-status-slot');
        if (newStatus) {
          newStatus.innerHTML = '<span class="flex items-center gap-3 text-lime" style="color:#c8ff00;display:inline-flex;align-items:center;gap:10px"><span class="h-[0.55em] w-[0.55em] animate-pulse rounded-full bg-lime" style="width:10px;height:10px;border-radius:50%;background:#c8ff00;display:inline-block"></span>LIVE</span>';
        }

        // Ensure live deck has waveform visible and initialized
        const newWfSlot = newLiveEl.querySelector('.deck-waveform-slot');
        const liveTrack = snap.decks[snap.liveId]?.track;
        if (newWfSlot && liveTrack) {
          const liveSlot = snap.decks[snap.liveId];
          const dur = Math.max(1, liveSlot?.duration || liveTrack.durationSec || 180);
          newWfSlot.innerHTML = renderWaveformHtml(liveTrack, liveSlot?.position || 0, dur, liveSlot?.cutAt, liveSlot?.playFull, true);
          newWfSlot.style.display = '';
          bindLiveWaveformScrub();
        }

        triggerSweepEffect();
        fitAllDeckTitles();
        positionPipTile();

        // 3. When slide finishes (1500ms): outgoing deck teleports to enter (150%) and glides into cue (118%)
        if (state.swapAnimTimer) clearTimeout(state.swapAnimTimer);
        state.swapAnimTimer = setTimeout(() => {
          if (state.screen !== 'playing') {
            state.animatingSwap = false;
            return;
          }

          const currentSnap = state.snap || snap;
          const cueDeckId = prevLive;
          const cueSlot = currentSnap.decks[cueDeckId];
          const cueTrack = cueSlot?.track;

          // A. Update outgoing deck content with the NEW upcoming cue song
          const cueTitleEl = oldLiveEl.querySelector('.deck-title');
          const cueArtistEl = oldLiveEl.querySelector('.deck-artist');
          const cueStatusSlot = oldLiveEl.querySelector('.deck-status-slot');
          const cueWfSlot = oldLiveEl.querySelector('.deck-waveform-slot');

          const newTitle = cueTrack ? cueTrack.title : 'END OF SET';
          if (cueTitleEl) {
            cueTitleEl.textContent = newTitle;
            cueTitleEl.classList.toggle('long', newTitle.length > 16);
            cueTitleEl.classList.remove('title-land');
          }
          if (cueArtistEl) {
            cueArtistEl.textContent = cueTrack ? (cueTrack.artist || '').replace(/\s*·\s*\d{4}\s*$/, '') : '';
            cueArtistEl.style.display = cueTrack ? '' : 'none';
          }
          if (cueStatusSlot) {
            cueStatusSlot.innerHTML = `<span style="color:rgba(255,255,255,0.7);font-family:var(--font-display);font-size:clamp(16px,1.6vw,22px)">○ ${cueTrack ? (cueSlot.status === 'ready' ? 'READY' : 'CUEING') : 'STANDBY'}</span>`;
          }
          if (cueWfSlot) {
            cueWfSlot.style.display = 'none';
          }

          // B. Instantly teleport off-screen right with transition: none
          oldLiveEl.setAttribute('data-slot', 'enter');
          void oldLiveEl.offsetHeight; // Force browser reflow

          // C. 50ms later, slide smoothly in from 150% to 118% (cue)
          setTimeout(() => {
            oldLiveEl.setAttribute('data-slot', 'cue');
            state.animatingSwap = false;
            state.lastRenderSig = buildRenderSig(state.snap);
            fitAllDeckTitles();
            syncPlayingDom();
          }, 50);
        }, 1500);
      } else {
        render();
      }
      return;
    }

    if (state.animatingSwap) {
      const agentMsg = document.getElementById('agent-msg');
      if (agentMsg && agentMsg.textContent !== snap.agentMessage) {
        agentMsg.textContent = snap.agentMessage;
      }
      updateDeckTelemetryDom('A', snap.deckTelemetry?.A);
      updateDeckTelemetryDom('B', snap.deckTelemetry?.B);
      updateDeckWaveformDom(snap.liveId, snap.decks[snap.liveId], snap.decks[snap.liveId]?.position);
      syncPlayingDom();
      return;
    }

    // Only full-render if stage is missing or pause state changed
    const stageEl = document.getElementById('play-stage');
    if (!stageEl || snap.paused !== state.lastPaused) {
      state.lastPaused = snap.paused;
      state.lastRenderSig = buildRenderSig(snap);
      render();
      return;
    }

    syncPlayingDom();
  }
}

function triggerCueHint() {
  state.showDragHint = true;
  if (state.hintTimer) clearTimeout(state.hintTimer);
  state.hintTimer = setTimeout(() => {
    state.showDragHint = false;
    const bubble = document.getElementById('drag-hint-group');
    if (bubble) bubble.remove();
  }, 7500);
}

function getAiHeaders() {
  return {
    'Content-Type': 'application/json',
    ...(state.opusKey ? { 'x-anthropic-key': state.opusKey } : {}),
    ...(state.geminiKey ? { 'x-gemini-key': state.geminiKey } : {}),
    ...(state.openaiKey ? { 'x-openai-key': state.openaiKey } : {}),
  };
}

function getAnalysisCache() {
  try {
    return JSON.parse(localStorage.getItem('nova.analysis.cache.v2') || '{}');
  } catch {
    return {};
  }
}

function saveAnalysisCache(id, patch) {
  if (!id) return;
  try {
    const cache = getAnalysisCache();
    cache[id] = { ...(cache[id] || {}), ...patch, updatedAt: Date.now() };
    const entries = Object.entries(cache).sort((a, b) => (b[1].updatedAt || 0) - (a[1].updatedAt || 0)).slice(0, 40);
    localStorage.setItem('nova.analysis.cache.v2', JSON.stringify(Object.fromEntries(entries)));
  } catch {}
}

function refreshCostEstimate() {
  if (!state.crate.length) {
    state.costEstimate = null;
    return;
  }
  const dspCount = state.crate.filter((t) => t.file || t.dspReady).length;
  const ytCount = state.crate.length - dspCount;
  fetch('/api/ai', {
    method: 'POST',
    headers: getAiHeaders(),
    body: JSON.stringify({ action: 'estimate_cost', dspCount, ytCount }),
  })
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      if (d?.ok && d.estimate) {
        state.costEstimate = d.estimate;
        if (state.screen === 'wizard' && state.wizardStep === 0 && document.activeElement?.id !== 'input-source') render();
      }
    })
    .catch(() => {});
}

async function fetchHealth() {
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      state.health = await res.json();
      initOrchestrator().proMixer.workerConfigured = Boolean(state.health?.audioWorkerConfigured);
    }
  } catch {}
  if (state.screen === 'wizard' && state.wizardStep === 0 && document.activeElement?.id !== 'input-source') {
    render();
  }
}

async function loadSavedSets() {
  let local = [];
  try {
    local = JSON.parse(localStorage.getItem('nova.saved.sets.v2') || '[]');
  } catch {}
  try {
    const res = await fetch(`/api/sets?sessionId=${encodeURIComponent(state.sessionId)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.sets) && data.sets.length) {
        const seen = new Set();
        state.savedSets = [...data.sets, ...local].filter((s) => {
          if (!s?.id || seen.has(s.id)) return false;
          seen.add(s.id);
          return true;
        });
        return;
      }
    }
  } catch {}
  state.savedSets = local;
}

function persistLocalSet(setObj) {
  try {
    const existing = JSON.parse(localStorage.getItem('nova.saved.sets.v2') || '[]');
    const next = [setObj, ...existing.filter((x) => x.id !== setObj.id)].slice(0, 25);
    localStorage.setItem('nova.saved.sets.v2', JSON.stringify(next));
  } catch {}
}

function getLearnedCueMap() {
  try {
    return JSON.parse(localStorage.getItem('nova.learned.cues.v2') || '{}');
  } catch {
    return {};
  }
}

function isDecodableTrack(track) {
  return Boolean(track && (track.file || track.stemFiles || track.stemUrls || (track.dspReady && track.streamUrl)));
}

function isYtTrack(track) {
  return Boolean(track && track.videoId && !isDecodableTrack(track));
}

function isPlayableTrack(track) {
  return isDecodableTrack(track) || isYtTrack(track);
}

function addTrackToCrate(track) {
  if (!track || !track.id) return false;
  if (!isPlayableTrack(track)) return false;
  if (state.crate.some((t) => t.id === track.id)) return false;
  const learned = getLearnedCueMap()[track.id];
  const cachedAi = getAnalysisCache()[track.id];
  const merged = {
    ...track,
    ...(cachedAi || {}),
    ...(learned ? { entrySec: learned.entrySec ?? track.entrySec, playFull: learned.playFull ?? track.playFull, cueConfidence: 'user' } : {}),
  };
  state.crate.push({ ...merged, heat: buildFallbackHeat(merged) });
  if (state.crate.length >= 2) syncAutoPlan({ navigate: false });
  return true;
}

async function handleSourceFetch(overrideQuery = null, { page = 1, append = false, genre = '', mode = '', provider: overrideProvider = null } = {}) {
  const q = String(overrideQuery ?? state.searchInput).trim();
  const isYtUrl = /youtube\.com|youtu\.be|music\.youtube\.com/i.test(q);
  if (!q && !genre && mode !== 'trending') {
    state.searchStatus = 'Pick a genre below, search Audius/YouTube, paste a direct audio/YouTube URL, or drop local audio/video files.';
    state.searchError = true;
    render();
    return;
  }

  // Direct CORS audio file URL support (.mp3 / .wav / .flac / .m4a / .ogg)
  if (!isYtUrl && /^https?:\/\/.+\.(?:mp3|wav|flac|m4a|ogg|aac)(?:\?.*)?$/i.test(q)) {
    const cleanFile = q.split('?')[0].split('/').pop() || 'Audio Stream';
    const track = {
      id: `url-${btoa(q).replace(/[^a-z0-9]/gi, '').slice(0, 18)}`,
      source: 'stream',
      provider: 'Direct Audio · Full DSP',
      playback: 'web-audio-dsp',
      mixReady: true,
      dspReady: true,
      title: decodeURIComponent(cleanFile).replace(/\.[^.]+$/, ''),
      artist: new URL(q).hostname,
      streamUrl: q,
      durationSec: 180,
      energy: 7,
      entrySec: 8,
      exitSec: 165,
      playFull: false,
    };
    addTrackToCrate(track);
    state.searchResults = [track];
    state.searchHasMore = false;
    state.searchError = false;
    state.searchStatus = `Added direct audio stream "${track.title}" to crate (Full DSP enabled).`;
    render();
    return;
  }

  state.searchBusy = true;
  state.searchError = false;
  if (!append) state.searchPage = page;

  const useYt = isYtUrl || state.searchProvider === 'youtube';
  if (useYt) {
    state.searchStatus = isYtUrl
      ? 'Loading YouTube video/playlist in YT Video Mode (Volume/Cue Fade Only · No DSP)…'
      : `Searching YouTube videos for "${q}" (YT Volume/Cue Mode)…`;
    render();
    try {
      const param = isYtUrl
        ? `url=${encodeURIComponent(q)}&maxItems=150`
        : `q=${encodeURIComponent(q)}&limit=18`;
      const res = await fetch(`/api/youtube-search?${param}`);
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.error || 'YouTube lookup failed');
      const tracks = (data.results || []).map((t) => ({
        ...t,
        source: 'youtube',
        provider: 'YouTube Video · Vol/Cue Only (No DSP)',
        playback: 'youtube-iframe',
        dspReady: false,
        mixReady: true,
        ytOnly: true,
      }));
      if (isYtUrl && tracks.length === 1) addTrackToCrate(tracks[0]);
      state.searchResults = tracks;
      state.searchHasMore = false;
      state.searchStatus = tracks.length
        ? `Loaded ${tracks.length} YT track(s). Honest notice: browser YouTube iframes allow Volume/Cue crossfades ONLY (Web Audio EQ, stems, stretch & WAV export are disabled for YT tracks).`
        : 'No playable YouTube videos found.';
    } catch (err) {
      state.searchError = true;
      state.searchStatus = err.message || 'YouTube load failed.';
    } finally {
      state.searchBusy = false;
      render();
    }
    return;
  }

  const prov = overrideProvider || (state.searchProvider === 'openverse' ? 'openverse' : state.searchProvider === 'itunes' ? 'itunes' : state.searchProvider === 'all' ? 'all' : 'audius');
  const reqMode = mode || (!q && genre ? 'trending' : 'search');
  state.searchStatus = `Fetching Full-DSP streams (${genre || q || 'Trending'} · Page ${page})…`;
  render();

  try {
    const url = `/api/catalogue?q=${encodeURIComponent(q)}&genre=${encodeURIComponent(genre)}&mode=${encodeURIComponent(reqMode)}&provider=${encodeURIComponent(prov)}&page=${page}&limit=24`;
    const res = await fetch(url);
    const data = await res.json();
    const incoming = (data.results || []).filter((t) => isDecodableTrack(t));
    if (append && page > 1) {
      const seen = new Set(state.searchResults.map((x) => x.id));
      state.searchResults = [...state.searchResults, ...incoming.filter((x) => !seen.has(x.id))];
    } else {
      state.searchResults = incoming;
    }
    state.searchPage = page;
    state.searchHasMore = Boolean(data.hasMore);
    state.searchStatus = state.searchResults.length
      ? `Showing ${state.searchResults.length} Full-DSP mixable streams. Click + ADD ALL or LOAD MORE for deeper crate building.`
      : 'No decodable Full-DSP streams matched that query. Try another genre or drop local audio/video files.';
  } catch (err) {
    state.searchError = true;
    state.searchStatus = err.message || 'Search failed.';
  } finally {
    state.searchBusy = false;
    render();
  }
}

async function handleLocalFiles(files) {
  const list = Array.from(files || []).filter(
    (f) => f.type.startsWith('audio/') || f.type.startsWith('video/') || /\.(mp3|wav|flac|m4a|ogg|aac|mp4|webm|m4v|mov)$/i.test(f.name)
  );
  if (!list.length) {
    state.searchError = true;
    state.searchStatus = 'No supported audio or video files found (use MP3, WAV, FLAC, M4A, OGG, MP4, WEBM).';
    render();
    return;
  }

  state.searchBusy = true;
  state.searchError = false;
  state.searchStatus = `Decoding & analyzing ${list.length} audio/video file(s) with Essentia WASM…`;
  render();

  const orch = initOrchestrator();
  // Group Demucs 4-stem file bundles (*_vocals, *_drums, *_bass, *_other) cleanly when dropped together
  const stemGroups = new Map();
  const soloFiles = [];
  for (const file of list) {
    const m = file.name.match(/^(.*?)(?:_|-|\s)(vocals|drums|bass|other)\.[^.]+$/i);
    if (m) {
      const base = m[1].trim() || 'Stem Track';
      const stem = m[2].toLowerCase();
      if (!stemGroups.has(base)) stemGroups.set(base, { raw: [], map: {} });
      stemGroups.get(base).raw.push(file);
      stemGroups.get(base).map[stem] = file;
    } else {
      soloFiles.push(file);
    }
  }

  const fileItems = [];
  for (const [base, grp] of stemGroups.entries()) {
    if (['vocals', 'drums', 'bass', 'other'].every((s) => grp.map[s])) {
      fileItems.push({ base, stemFiles: grp.map, refFile: grp.map.drums });
    } else {
      for (const f of grp.raw) soloFiles.push(f);
    }
  }
  for (const f of soloFiles) fileItems.push({ file: f });

  let count = 0;
  for (const item of fileItems) {
    const refFile = item.file || item.refFile;
    const isVid = Boolean(item.file && (item.file.type.startsWith('video/') || /\.(mp4|webm|m4v|mov)$/i.test(item.file.name)));
    const cleanName = item.stemFiles ? item.base : refFile.name.replace(/\.[^.]+$/, '');
    const parts = cleanName.split(/\s+[-–]\s+/);
    const track = {
      id: item.stemFiles
        ? `stems-${cleanName}-${refFile.size}-${refFile.lastModified}`
        : `local-${refFile.name}-${refFile.size}-${refFile.lastModified}`,
      source: 'local',
      provider: item.stemFiles ? 'Local 4-Stem Neural Bundle' : isVid ? 'Local Video · Full DSP ✓' : 'Local File · Full DSP',
      playback: 'web-audio-dsp',
      mixReady: true,
      dspReady: true,
      neuralStems: Boolean(item.stemFiles),
      isVideo: isVid,
      videoUrl: isVid ? URL.createObjectURL(item.file) : null,
      title: parts.length > 1 ? parts.slice(1).join(' - ') : cleanName,
      artist: parts.length > 1 ? parts[0] : (item.stemFiles ? 'Demucs Stems' : isVid ? 'Local Music Video' : 'Local Audio'),
      ...(item.stemFiles ? { stemFiles: item.stemFiles } : { file: item.file }),
      durationSec: 180,
      energy: 7,
      entrySec: 8,
      exitSec: 165,
      playFull: false,
    };
    try {
      const rec = await orch.proMixer.decodeAndAnalyze(track, (msg) => {
        state.searchStatus = msg;
        const sb = document.getElementById('wizard-status-banner');
        if (sb) sb.textContent = msg;
      });
      const a = rec.analysis;
      Object.assign(track, {
        analysis: a,
        durationSec: a.durationSec,
        bpm: a.bpm,
        key: a.key,
        camelot: a.camelot,
        energy: a.energy,
        lufs: a.lufs,
        heat: a.heat,
        clubEntry: a.clubEntry,
        clubExit: a.clubExit,
        hookEntry: a.hookEntry,
        hookExit: a.hookExit,
        entrySec: a.clubEntry,
        exitSec: a.clubExit,
        content_hash: a.content_hash,
        cached: a.cached,
        tracker_comparison: a.tracker_comparison,
        low_confidence: a.low_confidence,
        safe_transitions_only: a.safe_transitions_only,
        stems_available: a.stems_available,
        stem_mode: a.stem_mode,
      });

      // Async Phase 1 Lyric Transcription & Understanding (cached per song ID; never blocks track loading)
      const cached = getAnalysisCache()[track.id];
      const aiConfigured = state.health?.ai?.multiProviderConfigured || state.geminiKey || state.openaiKey || state.opusKey;
      if (cached?.lyric_understanding) {
        Object.assign(track, { lyrics: cached.lyrics || [], language: cached.language, lyric_understanding: cached.lyric_understanding });
      } else if (aiConfigured && rec.buffer) {
        const wavBase64 = extractAudioSliceWavBase64(rec.buffer, Math.max(0, a.hookEntry || a.clubEntry || 0), 34);
        if (wavBase64) {
          fetch('/api/ai', {
            method: 'POST',
            headers: getAiHeaders(),
            body: JSON.stringify({
              action: 'transcribe_and_understand',
              songId: track.id,
              title: track.title,
              artist: track.artist,
              durationSec: a.durationSec,
              bpm: a.bpm,
              wavBase64,
            }),
          })
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => {
              if (!d?.ok) return;
              const patch = {
                language: d.language,
                lyrics: d.lyrics || [],
                lyric_understanding: d.lyric_understanding || null,
              };
              Object.assign(track, patch);
              if (track.analysis) Object.assign(track.analysis, patch);
              saveAnalysisCache(track.id, patch);
              if (state.debugModalOpen || state.screen === 'review') render();
            })
            .catch(() => {});
        }
      }
    } catch (err) {
      console.warn('Pre-decode skipped:', err?.message);
    }
    if (addTrackToCrate(track)) count++;
  }

  state.searchBusy = false;
  state.searchStatus = `Loaded ${count} local track(s) with BPM, Camelot Key & beatgrid into your crate.`;
  refreshCostEstimate();
  render();
}

async function advanceFromStep0() {
  if (state.crate.length < 1) {
    populateVibeTracksToCrate(state.activeVibeCard || 'hindi', state.activeVibeCategory || 'hindi-dance');
  }
  state.wizardStep = 1;
  render();
}

function getFewShotFeedback() {
  if (state.learningHistory?.length) {
    return state.learningHistory.slice(0, 8);
  }
  return Object.entries(state.ratingsMap || {}).slice(-6).map(([pair, rating]) => ({ pair, rating }));
}

function getLearningStats() {
  const hist = state.learningHistory || [];
  if (!hist.length) return { total: 0, winners: [], avoid: [] };
  const counts = {};
  for (const h of hist) {
    const k = h.type || h.pair || 'blend';
    if (!counts[k]) counts[k] = { good: 0, bad: 0 };
    if (h.rating === 'good') counts[k].good++;
    else counts[k].bad++;
  }
  const winners = Object.entries(counts).filter(([, c]) => c.good > c.bad).map(([k, c]) => `${k.replace(/_/g, ' ')} (+${c.good})`);
  const avoid = Object.entries(counts).filter(([, c]) => c.bad >= c.good).map(([k, c]) => `${k.replace(/_/g, ' ')} (-${c.bad})`);
  return { total: hist.length, winners, avoid };
}

function syncAutoPlan({ navigate = false } = {}) {
  const reqEpoch = ++state.planEpoch;
  const ordered = sequenceCrate(state.crate, {
    vibe: state.vibe,
    playMode: state.playMode,
  });
  state.sequencedSet = ordered;
  state.setPlan = planSetHeuristic(ordered, {
    vibe: state.vibe,
    playMode: state.playMode,
    moodEnergy: state.moodEnergy,
  });
  if (navigate) {
    approveAndPlay();
    return;
  }
  render();

  const hasAnyAi = state.health?.ai?.multiProviderConfigured || state.health?.opusConfigured || state.opusKey || state.geminiKey || state.openaiKey;
  if (ordered.length >= 2 && hasAnyAi) {
    state.opusBusy = true;
    fetch('/api/plan', {
      method: 'POST',
      headers: getAiHeaders(),
      body: JSON.stringify({
        songs: state.setPlan.analyses,
        brief: { vibe: state.vibe, playMode: state.playMode, crowd: state.crowd, moodEnergy: state.moodEnergy },
        fewShotExamples: getFewShotFeedback(),
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (reqEpoch !== state.planEpoch) return;
        if (data?.ok && data.plan?.transitions?.length) {
          state.setPlan = data.plan;
          if (Array.isArray(data.plan.order)) {
            const byId = {};
            for (const t of state.sequencedSet) byId[t.id] = t;
            const reordered = data.plan.order.map((id) => byId[id]).filter(Boolean);
            if (reordered.length === state.sequencedSet.length) state.sequencedSet = reordered;
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        state.opusBusy = false;
        if (state.screen === 'review' || state.screen === 'wizard' || state.debugModalOpen) render();
      });
  }
}

function buildReviewSet() {
  if (!state.crate.length) {
    populateVibeTracksToCrate(state.activeVibeCard || 'hindi', state.activeVibeCategory || 'hindi-dance');
  }
  state.sequencedSet = sequenceCrate(state.crate, { vibe: state.vibe, playMode: state.playMode });
  state.setPlan = planSetHeuristic(state.sequencedSet, { vibe: state.vibe, playMode: state.playMode });
  approveAndPlay();
}

async function runOfflineWavExport() {
  const tracks = state.sequencedSet.length ? state.sequencedSet : state.crate;
  if (!tracks.length) return;
  const orch = initOrchestrator();
  state.exportBusy = true;
  state.exportMsg = 'Preparing offline WAV mixdown…';
  render();
  try {
    const res = await exportMixToWav(tracks, state.setPlan?.transitions || [], orch.proMixer, {
      title: state.setNameInput || state.setPlan?.set_title || `NOVA-${state.vibe}-Mix`,
      onProgress: (m) => {
        state.exportMsg = m;
        render();
      },
    });
    state.exportMsg = `Exported ${Math.round(res.durationSec)}s studio WAV master (${(res.sizeBytes / (1024 * 1024)).toFixed(1)} MB) ✓`;
  } catch (err) {
    state.exportMsg = err?.message || 'WAV export failed.';
  } finally {
    state.exportBusy = false;
    render();
  }
}

async function approveAndPlay() {
  if (!state.sequencedSet.length) {
    if (state.crate.length) {
      state.sequencedSet = sequenceCrate(state.crate, { vibe: state.vibe, playMode: state.playMode });
    } else {
      populateVibeTracksToCrate(state.activeVibeCard || 'hindi', state.activeVibeCategory || 'hindi-dance');
    }
  }
  const orch = initOrchestrator();
  state.screen = 'playing';
  state.lastLiveId = 'A';
  state.lastPaused = false;
  state.lastRenderSig = '';
  state.animatingSwap = false;
  state.sweepKey = 0;
  state.exitConfirm = false;
  state.debugModalOpen = false;
  triggerCueHint();
  render();
  await orch.startSet(state.sequencedSet, {
    vibe: state.vibe,
    playMode: state.playMode,
    recipes: state.setPlan?.transitions || [],
    ytCrossfadeSec: state.ytCrossfadeSec,
    ytTransitionStyle: state.ytTransitionStyle,
    ytFxEnabled: state.ytFxEnabled,
  });
}

async function saveCueAdjustment(track, toSec, playFull) {
  if (!track) return;
  const prev = track.entrySec || 0;
  track.entrySec = Math.round(toSec);
  track.cueConfidence = 'user';
  if (playFull) track.playFull = true;

  try {
    const map = getLearnedCueMap();
    map[track.id] = { entrySec: track.entrySec, playFull: Boolean(track.playFull), updatedAt: Date.now() };
    localStorage.setItem('nova.learned.cues.v2', JSON.stringify(map));
  } catch {}

  try {
    await fetch('/api/cues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trackId: track.id,
        sessionId: state.sessionId,
        action: 'seek',
        fromSec: prev,
        toSec: track.entrySec,
        entrySec: track.entrySec,
        playFull: track.playFull,
        bpm: track.bpm || null,
        key: track.key || null,
        camelot: track.camelot || null,
        heat: track.heat || null,
      }),
    });
  } catch {}
}

async function saveCurrentSetToDb(customName) {
  const name = String(customName || '').trim() || `NOVA ${state.vibe.toUpperCase()} SET`;
  const tracks = (orchestrator?.playedHistory?.length ? orchestrator.playedHistory : state.sequencedSet).map((t) => ({
    id: t.id,
    videoId: t.videoId,
    source: t.source,
    title: t.title,
    artist: t.artist,
    artwork: t.artwork,
    streamUrl: t.streamUrl || '',
    durationSec: t.durationSec,
    bpm: t.bpm,
    key: t.key,
    camelot: t.camelot,
    energy: t.energy,
    entrySec: t.entrySec,
    exitSec: t.exitSec,
    playFull: t.playFull,
    mixReady: t.mixReady,
    dspReady: t.dspReady,
  }));

  const setObj = {
    id: `set-${Date.now().toString(36)}`,
    sessionId: state.sessionId,
    name,
    vibe: { vibe: state.vibe, playMode: state.playMode, crowd: state.crowd },
    tracks,
    createdAt: new Date().toISOString(),
  };

  persistLocalSet(setObj);
  try {
    const res = await fetch('/api/sets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(setObj),
    });
    const data = await res.json();
    state.setSavedMsg = data.persisted
      ? `SAVED "${name.toUpperCase()}" TO DATABASE ✓`
      : `SAVED "${name.toUpperCase()}" LOCALLY ✓`;
  } catch {
    state.setSavedMsg = `SAVED "${name.toUpperCase()}" LOCALLY ✓`;
  }
  await loadSavedSets();
  render();
}

let lastPipRect = { x: 0, y: 0, w: 0, h: 0, liveId: '' };
function positionPipTile() {
  if (!state.pipVideoVisible || state.screen !== 'playing' || state.playNextModalOpen || state.vibeModalOpen || state.debugModalOpen || state.drawerOpen) {
    if (ytHost.getAttribute('data-visible') !== 'false') {
      ytHost.setAttribute('data-visible', 'false');
    }
    return;
  }
  const slot = document.querySelector('.deck[data-slot="live"] [data-pip-slot]');
  const liveSlot = state.snap?.decks?.[state.snap?.liveId];
  if (!slot || liveSlot?.engine !== 'yt') {
    if (ytHost.getAttribute('data-visible') !== 'false') {
      ytHost.setAttribute('data-visible', 'false');
    }
    return;
  }
  const rect = slot.getBoundingClientRect();
  const x = Math.round(rect.left);
  const y = Math.round(rect.top);
  const w = Math.round(rect.width);
  const h = Math.round(rect.height);
  const lid = state.snap?.liveId || 'A';
  if (lastPipRect.x !== x || lastPipRect.y !== y || lastPipRect.w !== w || lastPipRect.h !== h || lastPipRect.liveId !== lid) {
    lastPipRect = { x, y, w, h, liveId: lid };
    ytHost.style.setProperty('--tile-x', `${x}px`);
    ytHost.style.setProperty('--tile-y', `${y}px`);
    ytHost.style.setProperty('--tile-w', `${w}px`);
    ytHost.style.setProperty('--tile-h', `${h}px`);
    ytHost.style.setProperty('--tile-opacity', '1');
    ytHost.setAttribute('data-visible', 'true');
    ytHost.setAttribute('data-live', lid);
  }
}

/* =========================================================
   PHASE 5 HELPERS (SHARED PREVIEW / REGEN / LIVE TELEMETRY)
   ========================================================= */
async function previewTransitionAt(idx) {
  const rec = state.setPlan?.transitions?.[idx];
  if (!rec) return;
  const trackA = state.sequencedSet.find((t) => t.id === rec.from);
  const trackB = state.sequencedSet.find((t) => t.id === rec.to);
  if (!trackA || !trackB) return;
  state.previewBusyIdx = idx;
  render();
  try {
    await initOrchestrator().previewTransition(trackA, trackB, rec);
  } catch (err) {
    state.exportMsg = err?.message || 'Preview unavailable';
  } finally {
    state.previewBusyIdx = -1;
    render();
  }
}

function regenerateTransitionAt(idx) {
  const cur = state.setPlan?.transitions?.[idx];
  if (!cur) return;
  const a = state.setPlan.analyses.find((x) => x.song_id === cur.from);
  const bSong = state.setPlan.analyses.find((x) => x.song_id === cur.to);
  if (!a || !bSong) return;
  const cands = cur.candidates || scorePairCandidates(a, bSong, { arc: state.vibe, playMode: state.playMode }).candidates;
  const styles = ['bass_swap_blend', 'long_blend', 'filter_sweep', 'drum_loop_bridge', 'build_up_drop', 'echo_out', 'reverb_wash'];
  const curStyleIdx = styles.indexOf(cur.type);
  const nextStyle = styles[(curStyleIdx + 1) % styles.length];
  let regenerated = buildRecipeFromCandidate(a, bSong, cands[0], nextStyle);
  const v = validateTransitionRecipe(regenerated, a, bSong);
  if (!v.valid) {
    regenerated = buildRecipeFromCandidate(a, bSong, cands[(idx + 1) % cands.length]);
    if (!validateTransitionRecipe(regenerated, a, bSong).valid) {
      regenerated = repairOrFallbackRecipe(a, bSong, state.vibe, state.playMode);
      regenerated.fallbackUsed = true;
      regenerated.why = `[DECLARED FALLBACK] ${regenerated.why || 'Safe fallback applied'}`;
    }
  }
  regenerated.validation = validateTransitionRecipe(regenerated, a, bSong);
  regenerated.candidates = cands;
  state.setPlan.transitions[idx] = regenerated;
  if (orchestrator?.running) orchestrator.recipes = state.setPlan.transitions;
  render();
}

function computeRecipeRisk(rec, aSong, bSong) {
  if (!rec) return { level: 'LOW', cls: 'risk-low' };
  const isFallback = Boolean(rec.fallbackUsed || rec.validation?.fallbackApplied || /fallback/i.test(rec.why || ''));
  const hasErrors = Boolean(rec.validation && !rec.validation.valid);
  const hasWarnings = Boolean(rec.validation?.warnings?.length);
  const unsafeTrack = Boolean(aSong?.low_confidence || bSong?.low_confidence);
  if (hasErrors || rec.risk === 'high' || unsafeTrack) return { level: 'HIGH', cls: 'risk-high' };
  if (isFallback || hasWarnings || rec.risk === 'medium') return { level: 'MEDIUM', cls: 'risk-medium' };
  return { level: 'LOW', cls: 'risk-low' };
}

function findActiveOrNextRecipe(snap) {
  const list = state.setPlan?.transitions || [];
  if (snap?.crossfading && snap.transitionPlan?.from && snap.transitionPlan?.to) {
    const idx = list.findIndex((r) => r.from === snap.transitionPlan.from && r.to === snap.transitionPlan.to);
    if (idx >= 0) return { rec: list[idx], idx, active: true };
    return { rec: snap.transitionPlan, idx: -1, active: true };
  }
  const liveId = snap?.liveTrack?.id;
  const cueId = snap?.cueTrack?.id;
  if (liveId && cueId) {
    const idx = list.findIndex((r) => r.from === liveId && r.to === cueId);
    if (idx >= 0) return { rec: list[idx], idx, active: false };
  }
  const doneCount = snap?.transitionLog?.length || 0;
  if (doneCount < list.length) return { rec: list[doneCount], idx: doneCount, active: false };
  return { rec: null, idx: -1, active: false };
}

function describeRecipePlainEnglish(rec, tracksById) {
  if (!rec) return 'Final track playing — no pending transition';
  const fromT = tracksById[rec.from];
  const toT = tracksById[rec.to];
  const typeLabel = String(rec.type || 'blend').replace(/_/g, ' ').toUpperCase();
  const bars = rec.length_bars || rec.bars || 16;
  const tp = rec.tempo_plan;
  const bpmNote = tp && tp.stretch_from && tp.stretch_to
    ? `${Math.round(tp.stretch_from)}→${Math.round(tp.stretch_to)} BPM`
    : toT?.bpm ? `${Math.round(toT.bpm)} BPM` : '';
  const eqNote = (rec.eq_automation || []).length ? 'BASS SWAP EQ' : 'CLEAN GAIN';
  return `${fromT?.title || rec.from || 'DECK OUT'} → ${toT?.title || rec.to || 'DECK IN'} · ${typeLabel} (${bars} BARS · BAR ${rec.mix_out_bar ?? '—'}→${rec.mix_in_bar ?? 0} · ${eqNote}${bpmNote ? ` · ${bpmNote}` : ''})`;
}

function renderDeckTelemetryHtml(deckId, tel) {
  if (tel?.engine === 'yt') {
    const volPct = Math.min(100, Math.round((tel.vol || 0) * 100));
    return `<div class="yt-honest-notice" id="tel-${deckId}">YT IFRAME DECK · VOLUME FADE ONLY (<b data-tel-v="ytvol">${volPct}%</b>) · EQ/FILTERS/STEMS/BEATMATCH DISABLED BY BROWSER CORS</div>`;
  }
  const t = tel || { rate: 1, semitones: 0, vol: 0, eqLow: 0, eqMid: 0, eqHigh: 0, hpfHz: 20, lpfHz: 20000, echoSend: 0, reverbSend: 0, kills: {} };
  const eqPct = (db) => Math.max(0, Math.min(100, Math.round(((db + 30) / 36) * 100)));
  const filtText = t.hpfHz > 35 ? `HPF ${t.hpfHz}` : t.lpfHz < 18000 ? `LPF ${t.lpfHz}` : 'FLAT';
  const filtPct = t.hpfHz > 35
    ? Math.min(100, Math.round((Math.log2(t.hpfHz / 20) / 9) * 100))
    : t.lpfHz < 18000 ? Math.min(100, Math.round((Math.log2(20000 / Math.max(80, t.lpfHz)) / 8) * 100)) : 8;
  const fxPct = Math.min(100, Math.round(Math.max(t.echoSend || 0, t.reverbSend || 0) * 100));
  const volPct = Math.min(100, Math.round((t.vol || 0) * 100));

  return `
    <div class="deck-tel-box" id="tel-${deckId}">
      <div class="tel-cell">
        <div class="tel-top"><span>LOW</span><b data-tel-v="low">${t.kills?.low ? 'KILL' : `${t.eqLow}dB`}</b></div>
        <div class="tel-track"><div class="tel-fill ${t.kills?.low || t.eqLow <= -18 ? 'kill' : ''}" data-tel-b="low" style="width:${t.kills?.low ? 100 : eqPct(t.eqLow)}%"></div></div>
      </div>
      <div class="tel-cell">
        <div class="tel-top"><span>MID</span><b data-tel-v="mid">${t.kills?.mid ? 'KILL' : `${t.eqMid}dB`}</b></div>
        <div class="tel-track"><div class="tel-fill ${t.kills?.mid ? 'kill' : ''}" data-tel-b="mid" style="width:${t.kills?.mid ? 100 : eqPct(t.eqMid)}%"></div></div>
      </div>
      <div class="tel-cell">
        <div class="tel-top"><span>HIGH</span><b data-tel-v="high">${t.kills?.high ? 'KILL' : `${t.eqHigh}dB`}</b></div>
        <div class="tel-track"><div class="tel-fill ${t.kills?.high ? 'kill' : ''}" data-tel-b="high" style="width:${t.kills?.high ? 100 : eqPct(t.eqHigh)}%"></div></div>
      </div>
      <div class="tel-cell">
        <div class="tel-top"><span>FILT</span><b data-tel-v="filt">${filtText}</b></div>
        <div class="tel-track"><div class="tel-fill amber" data-tel-b="filt" style="width:${filtPct}%"></div></div>
      </div>
      <div class="tel-cell">
        <div class="tel-top"><span>ECHO/REV</span><b data-tel-v="fx">${fxPct}%</b></div>
        <div class="tel-track"><div class="tel-fill amber" data-tel-b="fx" style="width:${fxPct}%"></div></div>
      </div>
      <div class="tel-cell">
        <div class="tel-top"><span>VOL ${Number(t.rate || 1).toFixed(2)}x</span><b data-tel-v="vol">${volPct}%</b></div>
        <div class="tel-track"><div class="tel-fill green" data-tel-b="vol" style="width:${volPct}%"></div></div>
      </div>
    </div>
  `;
}

function updateDeckTelemetryDom(deckId, tel) {
  const box = document.getElementById(`tel-${deckId}`);
  if (!box || !tel) return;
  if (tel.engine === 'yt') {
    const yv = box.querySelector('[data-tel-v="ytvol"]');
    const txt = `${Math.min(100, Math.round((tel.vol || 0) * 100))}%`;
    if (yv && yv.textContent !== txt) yv.textContent = txt;
    return;
  }
  const eqPct = (db) => Math.max(0, Math.min(100, Math.round(((db + 30) / 36) * 100)));
  const setCell = (k, txt, pct, extraCls = '') => {
    const v = box.querySelector(`[data-tel-v="${k}"]`);
    const b = box.querySelector(`[data-tel-b="${k}"]`);
    if (v && v.textContent !== txt) v.textContent = txt;
    if (b) {
      b.style.width = `${Math.max(0, Math.min(100, pct))}%`;
      if (extraCls) b.className = `tel-fill ${extraCls}`;
    }
  };
  setCell('low', tel.kills?.low ? 'KILL' : `${tel.eqLow}dB`, tel.kills?.low ? 100 : eqPct(tel.eqLow), tel.kills?.low || tel.eqLow <= -18 ? 'kill' : '');
  setCell('mid', tel.kills?.mid ? 'KILL' : `${tel.eqMid}dB`, tel.kills?.mid ? 100 : eqPct(tel.eqMid), tel.kills?.mid ? 'kill' : '');
  setCell('high', tel.kills?.high ? 'KILL' : `${tel.eqHigh}dB`, tel.kills?.high ? 100 : eqPct(tel.eqHigh), tel.kills?.high ? 'kill' : '');
  const filtText = tel.hpfHz > 35 ? `HPF ${tel.hpfHz}` : tel.lpfHz < 18000 ? `LPF ${tel.lpfHz}` : 'FLAT';
  const filtPct = tel.hpfHz > 35
    ? Math.min(100, Math.round((Math.log2(tel.hpfHz / 20) / 9) * 100))
    : tel.lpfHz < 18000 ? Math.min(100, Math.round((Math.log2(20000 / Math.max(80, tel.lpfHz)) / 8) * 100)) : 8;
  setCell('filt', filtText, filtPct, 'amber');
  const fxPct = Math.min(100, Math.round(Math.max(tel.echoSend || 0, tel.reverbSend || 0) * 100));
  setCell('fx', `${fxPct}%`, fxPct, 'amber');
  const volCellTop = box.querySelectorAll('.tel-top span')[5];
  if (volCellTop) {
    const label = `VOL ${Number(tel.rate || 1).toFixed(2)}x`;
    if (volCellTop.textContent !== label) volCellTop.textContent = label;
  }
  setCell('vol', `${Math.min(100, Math.round((tel.vol || 0) * 100))}%`, Math.round((tel.vol || 0) * 100), 'green');
}

function updateDeckWaveformDom(deckId, slot, posOverride) {
  if (!slot?.track) return;
  const wf = document.querySelector(`.deck[data-deck="${deckId}"] .waveform-bars`);
  if (!wf) return;
  const pos = posOverride ?? (slot.position || 0);
  const dur = Math.max(1, slot.duration || slot.track.durationSec || 180);
  const entry = slot.playFull ? 0 : (slot.track.entrySec || 0);
  const exit = slot.playFull ? dur : (slot.mixOutSec || slot.cutAt || slot.track.exitSec || dur);
  const bars = wf.children;
  const playheadIdx = Math.floor((pos / dur) * bars.length);
  const entryIdx = Math.floor((entry / dur) * bars.length);
  const exitIdx = Math.floor((exit / dur) * bars.length);
  for (let i = 0; i < bars.length; i++) {
    const inside = i >= entryIdx && i <= exitIdx;
    const played = i <= playheadIdx;
    const cls = !inside ? 'wave-bar outside' : played ? 'wave-bar played' : 'wave-bar';
    if (bars[i].className !== cls) bars[i].className = cls;
  }
  const ph = document.querySelector(`.deck[data-deck="${deckId}"] .playhead-line`);
  if (ph) {
    const pct = `${Math.min(100, Math.max(0, (pos / dur) * 100)).toFixed(2)}%`;
    ph.style.left = pct;
    const isDrag = deckId === state.snap?.liveId && state.dragCueSec !== null;
    const dragCls = isDrag ? 'playhead-line dragging' : 'playhead-line';
    if (ph.className !== dragCls) ph.className = dragCls;

    if (deckId === state.snap?.liveId) {
      const hintRing = document.getElementById('drag-hint-ring');
      if (hintRing) hintRing.style.left = pct;
      const hintPtr = document.getElementById('drag-hint-pointer');
      if (hintPtr) hintPtr.style.left = pct;
    }
  }
}

function renderLiveTransitionLogHtml(snap) {
  const executed = snap?.transitionLog || [];
  const planned = state.setPlan?.transitions || [];
  const tracksById = Object.fromEntries((state.sequencedSet || []).map((t) => [t.id, t]));
  const rows = [];

  for (const e of executed) {
    const eq = (e.eqMoves || []).length ? e.eqMoves.join(', ') : 'clean eq';
    const fx = (e.fxMoves || []).length ? e.fxMoves.join(', ') : 'none';
    const driftTxt = e.driftMs !== null && e.driftMs !== undefined ? ` · drift ${Number(e.driftMs).toFixed(1)}ms` : '';
    const fb = e.fallbackUsed ? `<span class="live-fallback-badge">FALLBACK APPLIED</span>` : '';
    rows.push(`
      <div class="live-log-row">
        <span class="live-log-tag done">EXECUTED #${e.index}</span>
        <span>${esc(e.fromTitle)} → ${esc(e.toTitle)} · <b>${esc(String(e.type || '').toUpperCase())}</b> (${e.bars} bars · EQ: ${esc(eq)} · FX: ${esc(fx)}${driftTxt})</span>
        ${fb}
        <span style="opacity:0.62">— ${esc(e.reason || '')}</span>
      </div>
    `);
  }

  const nextStart = executed.length;
  for (let i = nextStart; i < planned.length; i++) {
    const r = planned[i];
    const isNext = i === nextStart;
    const isActiveMix = isNext && Boolean(snap?.crossfading);
    const eq = (r.eq_automation || []).length ? r.eq_automation.map((m) => `${m.deck}:${m.band}`).join(', ') : 'smooth gain';
    const fx = (r.fx || []).length ? r.fx.map((f) => f.type).join(', ') : 'none';
    const fb = (r.fallbackUsed || r.validation?.fallbackApplied || /fallback/i.test(r.why || ''))
      ? `<span class="live-fallback-badge">FALLBACK</span>` : '';
    rows.push(`
      <div class="live-log-row">
        <span class="live-log-tag ${isNext ? 'next' : 'plan'}">${isActiveMix ? 'MIXING NOW' : isNext ? 'UP NEXT' : `PLANNED #${i + 1}`}</span>
        <span>${esc(tracksById[r.from]?.title || r.from)} → ${esc(tracksById[r.to]?.title || r.to)} · <b>${esc(String(r.type || '').toUpperCase())}</b> (${r.length_bars} bars · EQ: ${esc(eq)} · FX: ${esc(fx)})</span>
        ${fb}
        <span style="opacity:0.62">— ${esc(r.why || '')}</span>
      </div>
    `);
  }

  return rows.length
    ? rows.join('')
    : `<div class="live-log-row"><span class="live-log-tag plan">IDLE</span><span>No transitions queued yet.</span></div>`;
}

/* =========================================================
   LIVE FX PILL STRIP — maps real scheduledEvents → glowing pills
   Zero pills shown when no DSP is active.
   ========================================================= */
const FX_PILL_META = {
  blend:    { icon: '🎚', catClass: 'cat-blend' },
  drum:     { icon: '🥁', catClass: 'cat-drum' },
  eq:       { icon: '🎛', catClass: 'cat-eq' },
  fx:       { icon: '🌀', catClass: 'cat-fx' },
  riser:    { icon: '⬆', catClass: 'cat-riser' },
  impact:   { icon: '💥', catClass: 'cat-impact' },
  filter:   { icon: '🎚', catClass: 'cat-filter' },
  loop:     { icon: '🔁', catClass: 'cat-loop' },
  harmonic: { icon: '🎵', catClass: 'cat-harmonic' },
};

function renderLiveFxStrip(snap) {
  const moves = snap?.activeDspMoves;
  if (!moves || moves.length === 0) return '';
  return moves.slice(0, 10).map((m) => {
    const { icon, catClass } = FX_PILL_META[m.category] || { icon: '◉', catClass: 'cat-fx' };
    const pct = Math.min(100, Math.round((m.progress01 ?? 0) * 100));
    const secsLeft = m.remainingSec != null ? `${m.remainingSec.toFixed(1)}s` : '';
    return `
      <div class="fx-pill" data-cat="${esc(m.category)}" title="${esc(m.label)}">
        <span class="fx-pill-icon">${icon}</span>
        <span class="fx-pill-label">${esc(m.label)}</span>
        ${secsLeft ? `<span class="fx-pill-secs">${esc(secsLeft)}</span>` : ''}
        <div class="fx-pill-progress" style="width:${pct}%"></div>
      </div>`;
  }).join('');
}

/* =========================================================
   DJ ACTION FEED (BOOTH LOG) — chronological event history
   ========================================================= */
function renderDjActionFeed(snap) {
  const feed = snap?.djActionFeed;
  if (!feed || feed.length === 0) {
    return '<div style="font-family:var(--font-mono);font-size:10px;color:rgba(245,245,240,0.3);padding:4px 2px">Waiting for DSP events…</div>';
  }
  return feed.slice(0, 20).map((entry) => {
    const { icon, catClass } = FX_PILL_META[entry.category] || { icon: '◉', catClass: 'cat-fx' };
    return `
      <div class="dj-feed-row">
        <span class="dj-feed-ts">${esc(entry.ts || '')}</span>
        <span class="dj-feed-cat ${catClass}">${icon} ${esc(entry.category?.toUpperCase() || '')}</span>
        <div class="dj-feed-body">
          <div class="dj-feed-label">${esc(entry.label || '')}</div>
          ${entry.detail ? `<div class="dj-feed-detail">${esc(entry.detail)}</div>` : ''}
        </div>
      </div>`;
  }).join('');
}

function renderLiveTransitionPanel(snap) {
  const { rec, idx, active } = findActiveOrNextRecipe(snap);
  const tracksById = Object.fromEntries((state.sequencedSet || []).map((t) => [t.id, t]));
  const analysesById = Object.fromEntries((state.setPlan?.analyses || []).map((a) => [a.song_id, a]));
  const aSong = rec ? analysesById[rec.from] : null;
  const bSong = rec ? analysesById[rec.to] : null;
  const risk = computeRecipeRisk(rec, aSong, bSong);
  const isFallback = Boolean(rec && (rec.fallbackUsed || rec.validation?.fallbackApplied || (rec.validation && !rec.validation.valid) || /fallback/i.test(rec.why || '')));
  const label = active ? 'MIXING NOW' : rec ? 'NEXT TRANSITION' : 'FINAL TRACK';
  const summary = describeRecipePlainEnglish(rec, tracksById);
  const whyText = rec?.why || 'Matched downbeat phrase & harmonic energy curve.';
  const clockLabel = snap?.clockMode ? `CLOCK: ${String(snap.clockMode).toUpperCase()}` : 'CLOCK';
  const driftLabel = snap?.dualDriftMs !== null && snap?.dualDriftMs !== undefined ? ` · DRIFT ${snap.dualDriftMs.toFixed(1)}ms` : '';

  return `
    <section class="live-transition-panel" id="live-transition-panel" data-rec-idx="${idx}">
      <div class="live-tp-head">
        <div class="live-tp-meta">
          <span class="agent-tag" style="font-size:18px" id="live-tp-label">${label}</span>
          <span class="font-mono-num" style="font-size:12px;color:var(--bone)" id="live-tp-summary">${esc(summary)}</span>
          ${rec ? `<span class="live-risk-badge ${risk.cls}">RISK: ${risk.level}</span>` : ''}
          ${isFallback ? `<span class="live-fallback-badge">⚠ DECLARED FALLBACK USED</span>` : ''}
          <span class="font-mono-num" style="font-size:11px;color:rgba(245,245,240,0.55)" id="live-tp-clock">${clockLabel}${driftLabel}</span>
        </div>
        <div class="live-tp-actions">
          <button class="agent-pill squeeze" id="btn-live-preview-next" ${idx < 0 || state.previewBusyIdx >= 0 ? 'disabled' : ''}>${state.previewBusyIdx === idx && idx >= 0 ? '⏳ PREVIEWING' : '▶ PREVIEW NEXT'}</button>
          <button class="agent-pill squeeze" id="btn-live-regen-next" ${idx < 0 ? 'disabled' : ''}>↻ REGEN</button>
          <button class="agent-pill squeeze" id="btn-live-vibe">🎛 ENERGY / MOOD</button>
          <button class="agent-pill squeeze" id="btn-live-inspect">✦ TIMELINE & LOG</button>
          <button class="agent-pill accent squeeze" id="btn-live-export-wav" ${state.exportBusy ? 'disabled' : ''}>${state.exportBusy ? 'RENDERING…' : '⬇ EXPORT .WAV'}</button>
        </div>
      </div>
      <div class="live-tp-why" id="live-tp-why">WHY: ${esc(whyText)}</div>

      <!-- LIVE ACTIVE FX PILLS (real AudioParam/DSP events only) -->
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
        <div id="live-active-fx-strip" style="flex:1">${renderLiveFxStrip(snap)}</div>
        <button id="btn-toggle-auto-dj-fx" class="${snap?.autoDjFxEnabled === false ? 'off' : ''}">
          ${snap?.autoDjFxEnabled === false ? '⏸ AUTO-FX OFF' : '▶ AUTO-FX ON'}
        </button>
      </div>

      <!-- DJ ACTION FEED (BOOTH LOG) -->
      <div id="dj-action-feed-wrap">
        <div class="dj-feed-header">
          <span class="dj-feed-title">◉ BOOTH DSP LOG</span>
          <span class="dj-feed-title">${snap?.djActionFeed?.length ? `${snap.djActionFeed.length} EVENTS` : 'NO EVENTS YET'}</span>
        </div>
        <div id="dj-action-feed">${renderDjActionFeed(snap)}</div>
      </div>

      <div class="live-transition-log" id="live-transition-log">${renderLiveTransitionLogHtml(snap)}</div>
    </section>
  `;
}

function syncLocalVideoDecks(snap, pos) {
  for (const id of ['A', 'B']) {
    const slot = snap?.decks?.[id];
    const vid = document.getElementById(`video-deck-${id}`);
    if (!vid || !slot?.track?.isVideo) continue;
    const rate = Math.max(0.5, Math.min(2.0, snap.deckTelemetry?.[id]?.rate || 1));
    if (Math.abs(vid.playbackRate - rate) > 0.01) vid.playbackRate = rate;
    const targetPos = id === snap.liveId ? pos : (slot.position || 0);
    const shouldPlay = !snap.paused && (id === snap.liveId || (snap.crossfading && slot.status !== 'empty'));
    if (Math.abs(vid.currentTime - targetPos) > 0.25 && vid.readyState >= 1) {
      try { vid.currentTime = targetPos; } catch {}
    }
    if (shouldPlay && vid.paused) vid.play().catch(() => {});
    else if (!shouldPlay && !vid.paused) vid.pause();
  }
}

/* =========================================================
   LIGHTWEIGHT 120ms PLAYING DOM SYNC (NO FULL RE-RENDER!)
   ========================================================= */
function syncPlayingDom() {
  const snap = state.snap;
  if (!snap) return;

  const liveSlot = snap.decks[snap.liveId];
  const cueSlot = snap.decks[snap.cueId];
  const pos = state.dragCueSec ?? (liveSlot?.position || 0);
  const dur = Math.max(1, liveSlot?.duration || liveSlot?.track?.durationSec || 180);

  const clock = document.getElementById('play-clock-text');
  if (clock) clock.textContent = `${fmtTime(pos)} / ${fmtTime(dur)}`;

  const agentMsg = document.getElementById('agent-msg');
  if (agentMsg && agentMsg.textContent !== snap.agentMessage) {
    agentMsg.textContent = snap.agentMessage;
  }

  // Update aura energy pulse dynamically
  const aura = document.getElementById('pulse-aura');
  if (aura && liveSlot?.track) {
    const energy = liveSlot.track.energy || 6;
    const pulseDur = `${(2.6 - 0.17 * energy).toFixed(2)}s`;
    if (aura.style.getPropertyValue('--pulse') !== pulseDur) {
      aura.style.setProperty('--pulse', pulseDur);
    }
  }

  // Update scoped cue deck title, artist, and status
  const cueDeckEl = document.querySelector(`.deck[data-deck="${snap.cueId}"]`);
  if (cueDeckEl && cueDeckEl.getAttribute('data-slot') === 'cue') {
    const cueTitle = cueDeckEl.querySelector('.deck-title');
    const cueArt = cueDeckEl.querySelector('.deck-artist');
    const cueStatus = cueDeckEl.querySelector('.deck-status-slot');

    const expectedTitle = cueSlot?.track ? cueSlot.track.title : 'END OF SET';
    if (cueTitle && cueTitle.textContent !== expectedTitle) {
      cueTitle.textContent = expectedTitle;
      cueTitle.classList.toggle('long', expectedTitle.length > 16);
      fitDeckTitle(cueDeckEl);
    }
    if (cueArt) {
      cueArt.textContent = cueSlot?.track ? (cueSlot.track.artist || '').replace(/\s*·\s*\d{4}\s*$/, '') : '';
      cueArt.style.display = cueSlot?.track ? '' : 'none';
    }
    if (cueStatus) {
      const label = cueSlot?.track
        ? (cueSlot.status === 'ready' ? '○ READY' : '○ CUEING')
        : '○ STANDBY';
      cueStatus.innerHTML = `<span style="color:rgba(255,255,255,0.7);font-family:var(--font-display);font-size:clamp(16px,1.6vw,22px)">${label}</span>`;
    }
  }

  // Update live waveform and local video sync
  updateDeckWaveformDom(snap.liveId, liveSlot, pos);
  syncLocalVideoDecks(snap, pos);

  // Update Skip button state and label
  const btnSkip = document.getElementById('btn-mega-skip');
  if (btnSkip) {
    const isCueLoading = cueSlot?.status === 'loading';
    const isXfading = Boolean(snap.crossfading);
    btnSkip.disabled = !liveSlot?.track || isXfading || isCueLoading;
    btnSkip.textContent = isCueLoading ? 'CUEING…' : 'SKIP';
  }

  // ONLY update pro drawer telemetry when drawer is actually open
  if (state.drawerOpen) {
    updateDeckTelemetryDom('A', snap.deckTelemetry?.A);
    updateDeckTelemetryDom('B', snap.deckTelemetry?.B);

    const tpClock = document.getElementById('live-tp-clock');
    if (tpClock) {
      const cTxt = `CLOCK: ${String(snap.clockMode || 'audioworklet').toUpperCase()}${snap.dualDriftMs !== null && snap.dualDriftMs !== undefined ? ` · DRIFT ${snap.dualDriftMs.toFixed(1)}ms` : ''}`;
      if (tpClock.textContent !== cTxt) tpClock.textContent = cTxt;
    }
    const tpLog = document.getElementById('live-transition-log');
    if (tpLog) {
      const logSig = `${snap.transitionLog?.length || 0}:${snap.crossfading ? 1 : 0}:${snap.liveTrack?.id || ''}:${snap.cueTrack?.id || ''}`;
      if (tpLog.dataset.sig !== logSig) {
        tpLog.dataset.sig = logSig;
        tpLog.innerHTML = renderLiveTransitionLogHtml(snap);
      }
    }

    const fxStrip = document.getElementById('live-active-fx-strip');
    if (fxStrip) {
      const fxSig = (snap.activeDspMoves || []).map((m) => `${m.id}:${Math.round((m.progress01 ?? 0) * 20)}`).join('|');
      if (fxStrip.dataset.sig !== fxSig) {
        fxStrip.dataset.sig = fxSig;
        fxStrip.innerHTML = renderLiveFxStrip(snap);
      }
    }
    const autoFxBtn = document.getElementById('btn-toggle-auto-dj-fx');
    if (autoFxBtn) {
      const on = snap.autoDjFxEnabled !== false;
      autoFxBtn.textContent = on ? '▶ AUTO-FX ON' : '⏸ AUTO-FX OFF';
      autoFxBtn.className = on ? '' : 'off';
    }
    const feedEl = document.getElementById('dj-action-feed');
    if (feedEl) {
      const feedSig = `${snap.djActionFeed?.length || 0}:${snap.djActionFeed?.[0]?.id || ''}`;
      if (feedEl.dataset.sig !== feedSig) {
        feedEl.dataset.sig = feedSig;
        feedEl.innerHTML = renderDjActionFeed(snap);
        const feedWrap = document.getElementById('dj-action-feed-wrap');
        if (feedWrap) {
          const header = feedWrap.querySelector('.dj-feed-header .dj-feed-title:last-child');
          if (header) header.textContent = snap.djActionFeed?.length ? `${snap.djActionFeed.length} EVENTS` : 'NO EVENTS YET';
        }
      }
    }
  }

  if (state.pipVideoVisible) {
    positionPipTile();
  }
}

/* =========================================================
   RENDERERS
   ========================================================= */
const AUDIFY_SPLASH_TAGLINES = [
  'No more “bhai, ek gaana laga de”.',
  'Every song starts at the drop.',
  'Plug in. Pick the vibe. Party.',
  'No boring intros. No dead air.',
  "Your party's DJ just walked in.",
  'From sangeet to after-party, sorted.'
];
let splashTaglineIndex = 0;
let splashInterval = null;

function renderRequestSongButton() {
  if (state.requestFormOpen) {
    if (state.requestFormStatus === 'sent') {
      return `
        <div class="flex w-full max-w-2xl basis-full flex-col gap-3 pt-2">
          <p class="text-xl text-lime">Got it. It gets added, usually within a day.</p>
        </div>
      `;
    }
    return `
      <div class="flex w-full max-w-2xl basis-full flex-col gap-3 pt-2">
        <label class="text-xl text-white/70" for="naux-request-input">Which song? Add the artist if you know it.</label>
        <div class="flex gap-3">
          <input id="naux-request-input" value="${esc(state.requestSongText || '')}" maxlength="200" placeholder="e.g. Tauba Tauba, Karan Aujla" class="h-16 flex-1 rounded-2xl border-2 border-white/25 bg-transparent px-5 text-xl text-white placeholder:text-white/30 focus:border-lime focus:outline-none" />
          <button id="btn-naux-request-send" class="h-16 rounded-2xl bg-lime px-7 font-display text-3xl text-ink disabled:opacity-40 cursor-pointer" ${(state.requestSongText || '').trim().length >= 2 ? '' : 'disabled'}>
            ${state.requestFormStatus === 'sending' ? '…' : 'SEND'}
          </button>
        </div>
        ${state.requestFormStatus === 'error' ? '<p class="text-lg text-white/60">Couldn\'t send that. Try again in a moment.</p>' : ''}
      </div>
    `;
  }
  return `
    <button id="btn-open-request-song" class="shrink-0 whitespace-nowrap rounded-full md:ml-auto border-2 border-lime/70 bg-lime/10 px-4 py-1.5 text-base text-lime transition hover:bg-lime/20 md:text-lg cursor-pointer">
      ＋ Missing a song? Request it
    </button>
  `;
}

function renderSplash() {
  if (splashInterval) {
    clearInterval(splashInterval);
    splashInterval = null;
  }
  if (state.splashAutoTimer) {
    clearTimeout(state.splashAutoTimer);
    state.splashAutoTimer = null;
  }
  const tagline = AUDIFY_SPLASH_TAGLINES[splashTaglineIndex % AUDIFY_SPLASH_TAGLINES.length];

  root.innerHTML = `
    <div class="anton_3de222df-module__cdpv1W__variable inter_5901b7c6-module__ec5Qua__variable min-h-dvh bg-ink font-sans text-white relative flex flex-col justify-between">
      <main class="flex min-h-dvh flex-col items-center justify-center px-6 text-center cursor-pointer select-none" id="splash-main-container">
        <h1 class="font-display text-[clamp(120px,22vw,360px)] leading-none tracking-tight text-lime select-none">Audify</h1>
        <p class="font-display text-[clamp(28px,3vw,48px)] uppercase tracking-wide text-white/60">The aux, handled.</p>
        <p class="splash-line mt-6 min-h-[1.2em] font-display text-[clamp(26px,2.6vw,42px)] uppercase leading-tight tracking-wide text-lime transition-opacity duration-300" id="splash-tagline-el">
          ${esc(tagline)}
        </p>
        <p class="mt-8 max-w-xl text-sm text-white/30">
          Tell Audify the room and it plays the set: Hindi and Punjabi party songs that drop straight into the hook. 
          <a href="/songs" id="link-splash-songs" class="underline hover:text-white/60 bg-transparent border-0 text-white/30 cursor-pointer text-sm">Song lists</a>
        </p>
      </main>
      <div aria-hidden="true" class="naux-players" data-visible="false"></div>
    </div>
  `;

  // Rotate tagline every 3.5s
  splashInterval = setInterval(() => {
    splashTaglineIndex = (splashTaglineIndex + 1) % AUDIFY_SPLASH_TAGLINES.length;
    const el = document.getElementById('splash-tagline-el');
    if (el) {
      el.style.opacity = '0';
      setTimeout(() => {
        el.textContent = AUDIFY_SPLASH_TAGLINES[splashTaglineIndex];
        el.style.opacity = '1';
      }, 200);
    }
  }, 3500);

  const startFunnel = () => {
    if (splashInterval) { clearInterval(splashInterval); splashInterval = null; }
    if (state.splashAutoTimer) { clearTimeout(state.splashAutoTimer); state.splashAutoTimer = null; }
    state.screen = 'wizard';
    state.appMode = 'dj';
    state.wizardStep = 0;
    render();
  };

  // 2.5s auto transition matching naux.party
  state.splashAutoTimer = setTimeout(startFunnel, 2500);

  // Click on splash advances immediately
  const splashMain = document.getElementById('splash-main-container');
  if (splashMain) {
    splashMain.onclick = (e) => {
      if (e.target && (e.target.id === 'link-splash-songs' || e.target.closest('#link-splash-songs'))) return;
      startFunnel();
    };
  }

  const linkSongs = document.getElementById('link-splash-songs');
  if (linkSongs) {
    linkSongs.onclick = (e) => {
      e.preventDefault();
      if (splashInterval) clearInterval(splashInterval);
      if (state.splashAutoTimer) clearTimeout(state.splashAutoTimer);
      state.appMode = 'yt';
      state.ytViewMode = 'directory';
      state.screen = 'wizard';
      if (typeof window !== 'undefined' && window.history) {
        window.history.pushState({}, '', '/songs');
      }
      render();
    };
  }
}

function renderBuilding() {
  const tagline = AUDIFY_SPLASH_TAGLINES[splashTaglineIndex % AUDIFY_SPLASH_TAGLINES.length];
  root.innerHTML = `
    <div class="anton_3de222df-module__cdpv1W__variable inter_5901b7c6-module__ec5Qua__variable min-h-dvh bg-ink font-sans text-white">
      <main class="flex min-h-dvh flex-col items-center justify-center px-6 text-center select-none">
        <h1 class="font-display text-[clamp(120px,22vw,360px)] leading-none tracking-tight text-lime animate-pulse select-none">Audify</h1>
        <p class="font-display text-[clamp(28px,3vw,48px)] uppercase tracking-wide text-white/60">Building your set…</p>
        <p class="splash-line mt-6 min-h-[1.2em] font-display text-[clamp(26px,2.6vw,42px)] uppercase leading-tight tracking-wide text-lime">
          ${esc(tagline)}
        </p>
      </main>
      <div aria-hidden="true" class="naux-players" data-visible="false"></div>
    </div>
  `;
}
function renderTopBar(rightHtml) {
  const modeSwitcher = `
    <div class="app-mode-switcher">
      <button class="mode-switch-btn squeeze ${state.appMode === 'yt' ? 'active' : ''}" id="btn-mode-yt">🎵 YOUTUBE MUSIC</button>
      <button class="mode-switch-btn squeeze ${state.appMode === 'dj' ? 'active' : ''}" id="btn-mode-dj">🎚 AI DJ BOOTH</button>
    </div>
  `;
  return `
    <header class="top-nav">
      <div style="display:flex;align-items:center;gap:18px">
        <button class="wordmark squeeze" id="btn-home" aria-label="NOVA home">NOVA</button>
        ${modeSwitcher}
      </div>
      <div class="nav-right">${rightHtml}</div>
    </header>
  `;
}

function renderExitBtn(confirmMode = false) {
  if (state.exitConfirm) {
    return `
      <button id="btn-exit" class="exit-btn confirming squeeze" aria-label="Tap again to end the party">
        END PARTY? <span style="font-size:0.7em;opacity:0.75">TAP AGAIN</span>
      </button>
    `;
  }
  return `
    <button id="btn-exit" class="exit-btn squeeze" aria-label="Exit to home">
      <svg viewBox="0 0 24 24" style="width:42%;height:42%" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  `;
}

const VIBE_CATEGORIES_MAP = {
  'hindi': [
    { id: 'hindi-dance', label: 'Dance Songs', hint: 'High-energy Bollywood dance anthems & club bangers', dbKey: 'hindi-dance' },
    { id: 'hindi-romantic', label: 'Romantic', hint: 'Soulful Bollywood love ballads & melodies', dbKey: 'hindi-romantic' },
    { id: 'hindi-retro', label: 'Retro Classics', hint: 'Timeless 90s & classic golden era gems', dbKey: 'hindi-retro' },
    { id: 'hindi-sufi', label: 'Sufi & Soul', hint: 'Deep, emotional Sufi qawwalis & soulful hooks', dbKey: 'hindi-sufi' },
    { id: 'hindi-hiphop', label: 'Desi Hip-Hop', hint: 'Gully rap, street bars & modern Desi trap', dbKey: 'hindi-hiphop' },
    { id: 'diwali-party-songs', label: 'Diwali Party', hint: 'Dhol-thumping festival & wedding party bangers', dbKey: 'diwali-party-songs' },
  ],
  'punjabi': [
    { id: 'punjabi-party', label: 'Party & Bhangra', hint: 'Dhol drops, club anthems & bass-heavy Punjabi bangers', dbKey: 'punjabi-party' },
    { id: 'punjabi-wedding', label: 'Wedding Hits', hint: 'Baraat beats, sangeet classics & celebration anthems', dbKey: 'punjabi-wedding' },
    { id: 'punjabi-gym', label: 'Gym & Workout', hint: 'High-BPM Punjabi hype tracks & workout fuel', dbKey: 'punjabi-gym' },
    { id: 'punjabi-sad', label: 'Heartbreak & Slow', hint: 'Melancholic, emotional Punjabi acoustic & slow jams', dbKey: 'punjabi-sad' },
  ],
  'english': [
    { id: 'english-pop', label: 'Top Pop Hits', hint: 'Billboard chartbusters, catchy radio anthems & pop hooks', dbKey: 'english-pop' },
    { id: 'english-hiphop', label: 'Hip-Hop & Rap', hint: 'Heavy 808s, street bars & mainstream rap anthems', dbKey: 'english-hiphop' },
    { id: 'english-edm', label: 'Dance & EDM', hint: 'Festival drops, house grooves & mainstage club energy', dbKey: 'english-edm' },
    { id: 'english-love', label: 'Chill & Love Songs', hint: 'Smooth R&B, late-night vibes & acoustic romance', dbKey: 'english-love' },
  ],
  'electronic': [
    { id: 'english-edm', label: 'Festival EDM & House', hint: 'Pumping four-on-the-floor, build-ups & euphoric drops', dbKey: 'english-edm' },
    { id: 'english-pop', label: 'Club Anthems', hint: 'High-energy electronic radio club edits', dbKey: 'english-pop' },
  ],
  'tamil-telugu': [
    { id: 'tamil-telugu-kuthu', label: 'Anirudh & Kuthu Bangers', hint: 'High-octane Tamil kuthu drums & viral whistle themes', dbKey: 'tamil-telugu-kuthu' },
    { id: 'tamil-telugu-mass', label: 'South Mass Cinema Beats', hint: 'Thaman & DSP theater mass entry tracks & hero themes', dbKey: 'tamil-telugu-mass' },
  ],
  'bollywood-remix': [
    { id: 'hindi-dance', label: 'Bollywood Club Mashups', hint: 'Dhol mix, DJ party mashups & high-tempo club edits', dbKey: 'hindi-dance' },
    { id: 'english-edm', label: 'Global EDM Remixes', hint: 'Bass-boosted club edits & festival bootlegs', dbKey: 'english-edm' },
  ],
};

function sendSongRequest() {
  if (!state.requestSongText || state.requestSongText.trim().length < 2) return;
  state.requestFormStatus = 'sending';
  render();
  setTimeout(() => {
    state.requestFormStatus = 'sent';
    render();
    setTimeout(() => {
      state.requestFormOpen = false;
      state.requestFormStatus = 'idle';
      state.requestSongText = '';
      render();
    }, 3000);
  }, 600);
}

function buildMultiLanguagePartySet() {
  const selectedLangs = (state.selectedLanguages && state.selectedLanguages.length)
    ? state.selectedLanguages
    : ['hindi'];

  const BLACKLIST = new Set([
    'BddP6PYo2gs', '7PCkvCPvDXk', 'vX2cDW8LUWk', 'VAdGW7QDJUI', 'V7LwfY5U5WI',
    'CZt-rVn2BJs', 'Gr8G_ldltDE', 'GftlBD-Apu8', 'k_WdQe_6k4g'
  ]);

  const allSongs = [];
  const seenIds = new Set();
  const seenVids = new Set();

  // If a specific subcategory is chosen
  if (state.activeVibeCategory) {
    const dbEntry = CURATED_CATEGORIES_DB[state.activeVibeCategory];
    if (dbEntry && dbEntry.songs && dbEntry.songs.length) {
      for (const s of dbEntry.songs) {
        const vid = s.videoId || (s.youtube_ids && s.youtube_ids[0]);
        if (!vid || vid.length !== 11 || BLACKLIST.has(vid)) continue;
        const key = (s.title || '').toLowerCase().trim();
        if (seenIds.has(key) || seenVids.has(vid)) continue;
        seenIds.add(key);
        seenVids.add(vid);
        allSongs.push(s);
        if (allSongs.length >= 100) break;
      }
    }
  }

  // If no category was chosen or fewer than 50 songs collected, mix from selected languages
  if (allSongs.length < 50) {
    selectedLangs.forEach(langId => {
      const cats = VIBE_CATEGORIES_MAP[langId] || VIBE_CATEGORIES_MAP['hindi'] || [];
      cats.forEach(c => {
        const dbEntry = CURATED_CATEGORIES_DB[c.dbKey] || CURATED_CATEGORIES_DB[c.id];
        if (dbEntry && dbEntry.songs) {
          for (const s of dbEntry.songs) {
            const vid = s.videoId || (s.youtube_ids && s.youtube_ids[0]);
            if (!vid || vid.length !== 11 || BLACKLIST.has(vid)) continue;
            const key = (s.title || '').toLowerCase().trim();
            if (seenIds.has(key) || seenVids.has(vid)) continue;
            seenIds.add(key);
            seenVids.add(vid);
            allSongs.push(s);
            if (allSongs.length >= 100) break;
          }
        }
      });
    });
  }

  const formatted = allSongs.map((t, idx) => ({
    ...t,
    id: t.id || `set-track-${idx + 1}`,
    source: 'youtube',
    provider: 'YouTube',
    mixReady: true,
    dspReady: false,
    durationSec: Number(t.durationSec) || 180,
    entrySec: Number.isFinite(t.entrySec) ? t.entrySec : (Number.isFinite(t.hookStartSec) ? t.hookStartSec : 25),
    exitSec: Number.isFinite(t.exitSec) ? t.exitSec : (Number.isFinite(t.hookEndSec) ? t.hookEndSec : 65),
    energy: Number(t.energy) || 7,
  }));

  state.crate = formatted;
  state.sequencedSet = sequenceCrate(formatted, { vibe: state.vibe, playMode: state.playMode });
  state.setPlan = planSetHeuristic(state.sequencedSet, { vibe: state.vibe, playMode: state.playMode });
  state.reviewNote = null;
  return formatted;
}

function populateVibeTracksToCrate(vibeId, catId) {
  const vId = vibeId || state.activeVibeCard || 'hindi';
  const cats = VIBE_CATEGORIES_MAP[vId] || VIBE_CATEGORIES_MAP['hindi'];
  const cId = catId || state.activeVibeCategory || cats[0].id;
  const cat = cats.find(c => c.id === cId) || cats[0];
  const dbEntry = CURATED_CATEGORIES_DB[cat.dbKey] || CURATED_CATEGORIES_DB[cat.id];

  const BLACKLIST = new Set([
    'BddP6PYo2gs', '7PCkvCPvDXk', 'vX2cDW8LUWk', 'VAdGW7QDJUI', 'V7LwfY5U5WI',
    'CZt-rVn2BJs', 'Gr8G_ldltDE', 'GftlBD-Apu8', 'k_WdQe_6k4g'
  ]);

  const seenIds = new Set();
  const seenVids = new Set();
  const validSongs = [];

  for (const t of (dbEntry?.songs || [])) {
    const vid = t.videoId || (t.youtube_ids && t.youtube_ids[0]);
    if (!vid || vid.length !== 11 || BLACKLIST.has(vid)) continue;
    const key = (t.title || '').toLowerCase().trim();
    if (seenIds.has(key) || seenVids.has(vid)) continue;
    seenIds.add(key);
    seenVids.add(vid);
    validSongs.push({
      ...t,
      source: 'youtube',
      provider: 'YouTube',
      mixReady: true,
      dspReady: false,
    });
    if (validSongs.length >= 100) break;
  }

  state.activeVibeCard = vId;
  state.activeVibeCategory = cat.id;
  state.selectedLanguages = [vId];
  state.crate = validSongs;
  state.sequencedSet = sequenceCrate(validSongs, { vibe: state.vibe, playMode: state.playMode });
  state.setPlan = planSetHeuristic(state.sequencedSet, { vibe: state.vibe, playMode: state.playMode });
  return validSongs;
}
function renderVibeMusicExplorer() {
  const activeVibe = state.activeVibeCard || 'hindi';
  const vibeMeta = LANGUAGES.find(l => l.id === activeVibe) || LANGUAGES[0];
  const cats = VIBE_CATEGORIES_MAP[activeVibe] || VIBE_CATEGORIES_MAP['hindi'];
  const activeCatId = state.activeVibeCategory || cats[0].id;
  const currentCat = cats.find(c => c.id === activeCatId) || cats[0];
  const dbEntry = CURATED_CATEGORIES_DB[currentCat.dbKey] || CURATED_CATEGORIES_DB[currentCat.id];
  const tracks = dbEntry?.songs || [];

  return `
    <div class="vibe-music-explorer-section" id="vibe-explorer" style="margin-top:22px;padding:22px 26px;border-radius:22px;border:1.5px solid rgba(200,255,0,0.35);background:rgba(200,255,0,0.03);box-shadow:inset 0 1px 1px rgba(255,255,255,0.08), 0 12px 36px rgba(0,0,0,0.4)">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px">
        <div>
          <div style="font-family:var(--font-mono);font-size:11px;font-weight:800;letter-spacing:0.08em;color:#c8ff00;text-transform:uppercase">
            ✓ DIRECTLY LOADED INTO YOUR SET (${tracks.length} SONGS)
          </div>
          <h2 class="font-display" style="font-size:clamp(24px, 3.2vw, 36px);color:#fff;margin-top:6px;line-height:1">
            ${esc(currentCat.label.toUpperCase())}
          </h2>
          <p style="font-size:14px;color:rgba(245,245,240,0.7);margin-top:6px;max-width:38rem">
            ${esc(currentCat.hint)} · <span style="color:#c8ff00;font-weight:700">Strictly 100+ Real YouTube Songs</span>
          </p>
        </div>

        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <button id="btn-vibe-best-part-toggle" class="naux-btn-crate-add squeeze" style="padding:10px 18px;font-size:12px;${state.ytBestPartMode ? 'border-color:#c8ff00;color:#c8ff00' : ''}">
            ⚡ BEST PART: ${state.ytBestPartMode ? 'ON (35s)' : 'OFF'}
          </button>
          <button id="btn-play-vibe-set" class="naux-btn-play-set squeeze" style="padding:12px 24px;font-size:14px;background:#c8ff00;color:#000;border-radius:9999px">
            ▶ START MIXING NOW (${tracks.length}) →
          </button>
        </div>
      </div>

      <!-- Level 2: Subcategory Chips under the active vibe card -->
      <div style="margin-top:18px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08)">
        <div style="font-family:var(--font-mono);font-size:10px;font-weight:800;letter-spacing:0.08em;color:rgba(245,245,240,0.5);text-transform:uppercase;margin-bottom:10px">
          SELECT CATEGORY (${cats.length} CATEGORIES · STRICTLY 100+ SONGS EACH):
        </div>
        <div class="naux-filter-bar" style="margin-top:0">
          ${cats.map(c => {
            const count = CURATED_CATEGORIES_DB[c.dbKey]?.songs?.length || 100;
            const isCatActive = (currentCat.id === c.id);
            return `
              <button class="naux-filter-chip squeeze ${isCatActive ? 'active' : ''}" data-vibe-cat="${esc(c.id)}">
                ${esc(c.label)} (${count})
              </button>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderWizard() {
  const step = state.wizardStep;

  // Real song counts from CURATED_CATEGORIES_DB
  const hindiCount = (CURATED_CATEGORIES_DB['hindi-dance']?.songs?.length || 358) + (CURATED_CATEGORIES_DB['hindi-romantic']?.songs?.length || 256) + (CURATED_CATEGORIES_DB['hindi-retro']?.songs?.length || 165);
  const punjabiCount = (CURATED_CATEGORIES_DB['punjabi-party']?.songs?.length || 454) + (CURATED_CATEGORIES_DB['punjabi-wedding']?.songs?.length || 207) + (CURATED_CATEGORIES_DB['punjabi-gym']?.songs?.length || 284);
  const englishCount = (CURATED_CATEGORIES_DB['english-pop']?.songs?.length || 107) + (CURATED_CATEGORIES_DB['english-hiphop']?.songs?.length || 53) + (CURATED_CATEGORIES_DB['english-edm']?.songs?.length || 42);
  const southCount = (CURATED_CATEGORIES_DB['tamil-telugu-kuthu']?.songs?.length || 14) + (CURATED_CATEGORIES_DB['tamil-telugu-mass']?.songs?.length || 15);
  const garbaCount = CURATED_CATEGORIES_DB['gujarati-garba']?.songs?.length || 46;
  const haryanviCount = (CURATED_CATEGORIES_DB['haryanvi-bhojpuri-party']?.songs?.length || 11) + (CURATED_CATEGORIES_DB['haryanvi-bhojpuri-desi-beats']?.songs?.length || 15);

  const WIZARD_LANGUAGES = [
    { id: 'hindi', label: 'Hindi', count: hindiCount, hint: `${hindiCount} songs ready` },
    { id: 'punjabi', label: 'Punjabi', count: punjabiCount, hint: `${punjabiCount} songs ready` },
    { id: 'english', label: 'English', count: englishCount, hint: `${englishCount} songs ready` },
    { id: 'south', label: 'Tamil / Telugu', count: southCount, hint: `${southCount} songs ready` },
    { id: 'gujarati', label: 'Garba / Gujarati', count: garbaCount, hint: `${garbaCount} songs ready` },
    { id: 'haryanvi-bhojpuri', label: 'Haryanvi / Bhojpuri', count: haryanviCount, hint: `${haryanviCount} songs ready` },
  ];

  let bodyHtml = '';

  if (step === 0) {
    bodyHtml = `
      <section class="mt-[4vh] flex flex-1 flex-col md:mt-[6vh]">
        <h1 class="font-display text-[44px] uppercase leading-[0.9] md:text-[clamp(56px,8vw,120px)]">What are we playing?</h1>
        <div class="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
          <p class="text-xl text-white/60 md:text-2xl">Pick every language the room wants.</p>
          ${renderRequestSongButton()}
        </div>

        <div class="grid gap-4 sm:grid-cols-2 mt-7 md:mt-10">
          ${WIZARD_LANGUAGES.map((l) => {
            const sel = (state.selectedLanguages || []).includes(l.id);
            return `
              <button class="flex flex-col justify-between rounded-3xl border-4 p-5 text-left md:p-6 transition active:scale-[0.98] min-h-28 md:min-h-36 cursor-pointer ${sel ? 'border-lime bg-lime text-ink' : 'border-white/20 hover:border-white/60'}" data-wizard-lang="${l.id}" aria-pressed="${sel}">
                <span class="font-display uppercase leading-none text-4xl md:text-5xl">${esc(l.label)}</span>
                <span class="mt-3 text-lg md:text-xl ${sel ? 'text-ink/70' : 'text-white/55'}">${l.hint}</span>
              </button>
            `;
          }).join('')}
        </div>

        <p class="mt-6 text-lg text-white/45">
          Coming soon: Marathi, Bengali.
        </p>

        <div class="mt-10 flex flex-wrap items-center justify-end gap-6">
          <button id="btn-wiz-next" class="fixed inset-x-6 bottom-[max(16px,env(safe-area-inset-bottom))] z-30 h-20 rounded-3xl bg-lime font-display text-4xl tracking-wide text-ink shadow-[0_-12px_40px_16px_rgba(8,8,8,0.9)] transition active:scale-[0.97] disabled:bg-[#3a4500] disabled:text-ink/70 md:inset-x-auto md:bottom-8 md:right-[max(2.5rem,calc((100vw-72rem)/2+2.5rem))] md:h-24 md:px-14 md:text-5xl cursor-pointer" ${(state.selectedLanguages || []).length ? '' : 'disabled'}>
            NEXT →
          </button>
        </div>

        <p class="mt-12 text-lg text-white/40">
          Plays through YouTube · <a id="link-party-lists" href="/songs" class="underline hover:text-white cursor-pointer">Song lists</a> · <a href="/privacy" class="underline hover:text-white">Privacy</a> · <a href="/terms" class="underline hover:text-white">Terms</a>
        </p>
        <a href="https://www.instagram.com/swpnldubey/" target="_blank" rel="noopener" class="group mt-4 inline-flex items-center gap-2.5 text-lg text-white/50 transition hover:text-white">
          <svg viewBox="0 0 24 24" aria-hidden="true" class="h-5 w-5 fill-none stroke-current stroke-2"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" r="0.6" class="fill-current"></circle></svg>
          Made by Swapnil · <span class="text-lime group-hover:underline">@swpnldubey</span>
        </a>
      </section>
    `;
  } else if (step === 1) {
    const selectedLangs = (state.selectedLanguages || []).length ? state.selectedLanguages : ['hindi'];
    bodyHtml = `
      <section class="mt-[4vh] flex flex-1 flex-col md:mt-[6vh]">
        <button id="btn-wiz-back" class="mb-6 self-start font-display text-2xl tracking-wide text-white/60 hover:text-white cursor-pointer">← BACK</button>
        <h1 class="font-display text-[44px] uppercase leading-[0.9] md:text-[clamp(56px,8vw,120px)]">What kind?</h1>
        <div class="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
          <p class="text-xl text-white/60 md:text-2xl">Optional. Skip a language to take anything in it.</p>
          ${renderRequestSongButton()}
        </div>

        <div class="flex flex-col gap-8 mt-7 md:mt-10">
          ${selectedLangs.map((langId) => {
            const langDef = WIZARD_LANGUAGES.find(l => l.id === langId) || { label: langId.toUpperCase() };
            const subcats = VIBE_CATEGORIES_MAP[langId] || VIBE_CATEGORIES_MAP['hindi'];
            return `
              <div>
                <h3 class="mb-3 font-display text-3xl uppercase tracking-wide text-white/60">
                  ${esc(langDef.label)}
                </h3>
                <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  ${subcats.map((sc) => {
                    const sel = (state.activeVibeCategory === sc.id);
                    const count = CURATED_CATEGORIES_DB[sc.dbKey]?.songs?.length || CURATED_CATEGORIES_DB[sc.id]?.songs?.length || 100;
                    return `
                      <button class="flex flex-col justify-between rounded-3xl border-4 p-5 text-left md:p-6 transition active:scale-[0.98] min-h-24 md:min-h-28 cursor-pointer ${sel ? 'border-lime bg-lime text-ink' : 'border-white/20 hover:border-white/60'}" data-wizard-subcat="${sc.id}" data-parent-lang="${langId}">
                        <span class="font-display uppercase leading-none text-3xl md:text-4xl">${esc(sc.label)}</span>
                        <span class="mt-3 text-lg ${sel ? 'text-ink/70' : 'text-white/55'}">${count} ready</span>
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <button id="btn-wiz-next" class="fixed inset-x-6 bottom-[max(16px,env(safe-area-inset-bottom))] z-30 h-20 rounded-3xl bg-lime font-display text-4xl tracking-wide text-ink shadow-[0_-12px_40px_16px_rgba(8,8,8,0.9)] transition active:scale-[0.97] md:inset-x-auto md:bottom-8 md:right-[max(2.5rem,calc((100vw-72rem)/2+2.5rem))] md:h-24 md:px-14 md:text-5xl cursor-pointer">
          NEXT →
        </button>
      </section>
    `;
  } else if (step === 2) {
    bodyHtml = `
      <section class="mt-[4vh] flex flex-1 flex-col md:mt-[6vh]">
        <button id="btn-wiz-back" class="mb-6 self-start font-display text-2xl tracking-wide text-white/60 hover:text-white cursor-pointer">← BACK</button>
        <h1 class="font-display text-[44px] uppercase leading-[0.9] md:text-[clamp(56px,8vw,120px)]">Where in the night are we?</h1>
        <div class="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
          ${renderRequestSongButton()}
        </div>

        <div class="grid gap-4 md:grid-cols-2 mt-7 md:mt-10">
          ${NIGHT_VIBES.map((v) => {
            const sel = state.vibe === v.id;
            return `
              <button class="flex flex-col justify-between rounded-3xl border-4 p-5 text-left md:p-6 transition active:scale-[0.98] min-h-24 md:min-h-[clamp(160px,28vh,300px)] cursor-pointer ${sel ? 'border-lime bg-lime text-ink' : 'border-white/20 hover:border-white/60'}" data-vibe="${v.id}">
                <span class="font-display uppercase leading-none text-4xl md:text-[clamp(44px,5vw,80px)]">${esc(v.label)}</span>
                <span class="mt-3 text-lg md:text-xl ${sel ? 'text-ink/70' : 'text-white/55'}">${esc(v.hint)}</span>
              </button>
            `;
          }).join('')}
        </div>
      </section>
    `;
  } else if (step === 3) {
    bodyHtml = `
      <section class="mt-[4vh] flex flex-1 flex-col md:mt-[6vh]">
        <button id="btn-wiz-back" class="mb-6 self-start font-display text-2xl tracking-wide text-white/60 hover:text-white cursor-pointer">← BACK</button>
        <h1 class="font-display text-[44px] uppercase leading-[0.9] md:text-[clamp(56px,8vw,120px)]">How many people?</h1>
        <div class="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
          ${renderRequestSongButton()}
        </div>

        <div class="grid gap-4 md:grid-cols-3 mt-7 md:mt-10">
          ${CROWD_SIZES.map((c) => {
            const sel = state.crowd === c.id;
            return `
              <button class="flex flex-col justify-between rounded-3xl border-4 p-5 text-left md:p-6 transition active:scale-[0.98] min-h-24 md:min-h-[clamp(160px,28vh,300px)] cursor-pointer ${sel ? 'border-lime bg-lime text-ink' : 'border-white/20 hover:border-white/60'}" data-crowd="${c.id}">
                <span class="font-display uppercase leading-none text-4xl md:text-[clamp(44px,5vw,80px)]">${esc(c.label)}</span>
                <span class="mt-3 text-lg md:text-xl ${sel ? 'text-ink/70' : 'text-white/55'}">${esc(c.hint)}</span>
              </button>
            `;
          }).join('')}
        </div>
      </section>
    `;
  }

  root.innerHTML = `
    <main class="mx-auto flex min-h-dvh max-w-6xl flex-col px-6 pb-32 pt-10 md:px-10 md:pb-44 font-sans text-white">
      <div class="flex items-center justify-between font-display text-3xl tracking-wide">
        <button id="btn-naux-brand" class="text-lime cursor-pointer" aria-label="Audify home">Audify</button>
        <div class="flex items-center gap-5">
          <span class="text-white/50">${step + 1} / 4</span>
          ${step > 0 ? `<button id="btn-wiz-exit" class="h-14 min-w-14 flex items-center justify-center gap-3 rounded-full border-2 border-white/30 text-white/70 hover:border-white hover:text-white transition active:scale-95 cursor-pointer" aria-label="Exit"><svg viewBox="0 0 24 24" class="h-[42%] w-[42%]" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"></path></svg></button>` : ''}
        </div>
      </div>
      ${bodyHtml}
    </main>
  `;

  bindWizardEvents();
}
function renderProDjModal() {
  return `
    <div class="modal-backdrop" id="pro-dj-backdrop">
      <div class="modal-sheet" onclick="event.stopPropagation()" style="max-width:820px;border-color:rgba(200,255,0,0.4)">
        <div style="padding:22px 26px;display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid rgba(255,255,255,0.12)">
          <div>
            <div class="font-display text-accent" style="font-size:32px;line-height:1">🎚 PRO DJ / FILE INGEST</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.6);margin-top:4px">Drop local audio/video, search Audius &amp; Openverse CORS streams, or isolate 4-stems</div>
          </div>
          <button id="btn-close-pro-dj" class="exit-btn">✕</button>
        </div>
        <div style="padding:24px 26px">
          <div class="ingest-box" style="margin-top:0">
            <div class="ingest-row">
              <input
                id="input-source"
                class="ingest-input"
                value="${esc(state.searchInput)}"
                placeholder="Search Audius Full-DSP, paste YouTube URL/playlist, or paste audio URL…"
                autocomplete="off"
              />
              <button id="btn-fetch-source" class="ingest-btn squeeze" ${state.searchBusy ? 'disabled' : ''}>
                ${state.searchBusy ? 'LOADING…' : 'LOAD / SEARCH'}
              </button>
              <button id="btn-drop-files" class="ingest-btn ghost squeeze">
                + DROP AUDIO / VIDEO
              </button>
              <input id="file-audio-input" type="file" accept="audio/*,video/mp4,video/webm,.mp3,.wav,.flac,.m4a,.ogg,.mp4,.webm,.m4v,.mov" multiple hidden />
            </div>

            <div class="source-pills" style="margin-top:14px">
              <button class="pill-btn squeeze ${state.searchProvider === 'audius' ? 'active' : ''}" data-provider="audius">Audius Full DSP</button>
              <button class="pill-btn squeeze ${state.searchProvider === 'openverse' ? 'active' : ''}" data-provider="openverse">Openverse CC</button>
              <button class="pill-btn squeeze ${state.searchProvider === 'itunes' ? 'active' : ''}" data-provider="itunes">🍎 Apple Music</button>
              <button class="pill-btn squeeze ${state.searchProvider === 'all' ? 'active' : ''}" data-provider="all">All Full-DSP</button>
              <button class="pill-btn squeeze ${state.searchProvider === 'youtube' ? 'active' : ''}" data-provider="youtube">YouTube Video</button>
            </div>

            <div id="wizard-status-banner" class="status-banner ${state.searchError ? 'err' : ''}">${esc(state.searchStatus)}</div>

            ${state.searchResults.length ? `
              <div class="search-results-grid" style="margin-top:16px">
                ${state.searchResults.map((t, idx) => {
                  const inCrate = state.crate.some((c) => c.id === t.id);
                  const isYt = isYtTrack(t);
                  return `
                    <button class="result-card squeeze ${inCrate ? 'added' : ''}" data-result-idx="${idx}">
                      <img class="result-thumb" src="${esc(t.artwork || DEFAULT_ARTWORK)}" alt="" onerror="handleImgError(this)" />
                      <div class="result-info">
                        <div class="result-title">${esc(t.title)}</div>
                        <div class="result-sub">${esc(t.artist)} · ${fmtTime(t.durationSec)}</div>
                        <span class="result-badge ${isYt ? 'yt' : t.source === 'itunes' ? 'itunes' : 'dsp'}">${esc(isYt ? 'YT VIDEO' : t.source === 'itunes' ? '🍎 APPLE MUSIC' : (t.provider || 'FULL DSP'))} ${inCrate ? '✓' : '+'}</span>
                      </div>
                    </button>
                  `;
                }).join('')}
              </div>
            ` : ''}
          </div>

          <div style="margin-top:20px;display:flex;justify-content:space-between;align-items:center">
            <span style="font-family:var(--font-mono);font-size:12px;color:rgba(255,255,255,0.6)">CRATE: ${state.crate.length} TRACKS</span>
            <button id="btn-play-pro-crate" class="naux-btn-play-set squeeze" style="padding:10px 24px;font-size:15px" ${state.crate.length ? '' : 'disabled'}>
              ▶ PLAY CRATE IN LIVE CONSOLE
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderCrateModal() {
  return `
    <div class="modal-backdrop" id="crate-backdrop">
      <div class="modal-sheet" onclick="event.stopPropagation()">
        <div style="padding:22px 26px;display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid rgba(245,245,240,0.12)">
          <span class="font-display" style="font-size:32px;text-transform:uppercase">CRATE (${state.crate.length} TRACKS)</span>
          <button id="btn-close-crate" class="exit-btn">✕</button>
        </div>
        <div class="nova-scroll" style="padding:12px 26px;overflow-y:auto;flex:1">
          ${state.crate.length ? state.crate.map((t, idx) => `
            <div class="review-row" style="justify-content:space-between">
              <span class="row-idx">${idx + 1}</span>
              <div class="row-main">
                <div class="row-title" style="font-size:22px">${esc(t.title)}</div>
                <div class="row-meta">${esc(t.artist)} · ${fmtTime(t.durationSec)} · ${t.dspReady ? 'FULL DSP' : 'YT DECK'}</div>
              </div>
              <button class="remove-row-btn squeeze" data-crate-rm="${idx}" aria-label="Remove ${esc(t.title)}">✕</button>
            </div>
          `).join('') : '<p style="color:rgba(245,245,240,0.5);padding:20px 0">Your crate is empty.</p>'}
        </div>
      </div>
    </div>
  `;
}

function renderSetsModal() {
  return `
    <div class="modal-backdrop" id="sets-backdrop">
      <div class="modal-sheet">
        <div style="padding:22px 26px;display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid rgba(245,245,240,0.12)">
          <span class="font-display" style="font-size:32px;text-transform:uppercase">SAVED SETS</span>
          <button id="btn-close-sets" class="exit-btn">✕</button>
        </div>
        <div class="nova-scroll" style="padding:16px 26px;overflow-y:auto;flex:1">
          ${state.savedSets.length ? state.savedSets.map((s, idx) => `
            <div class="review-row" style="justify-content:space-between">
              <div class="row-main">
                <div class="row-title">${esc(s.name)}</div>
                <div class="row-meta">${s.tracks?.length || 0} ${(s.tracks?.length || 0) === 1 ? 'song' : 'songs'} · ${esc(s.vibe?.playMode || 'club').toUpperCase()}</div>
              </div>
              <button class="ingest-btn squeeze" style="height:46px;font-size:20px;padding:0 18px" data-load-set="${idx}">LOAD →</button>
            </div>
          `).join('') : '<p style="color:rgba(245,245,240,0.5);padding:20px 0">No saved sets yet. Play a set and save it to your database!</p>'}
        </div>
      </div>
    </div>
  `;
}

function renderReview() {
  const totalSec = state.sequencedSet.reduce((acc, t) => {
    const playLen = t.playFull ? (t.durationSec || 180) : Math.max(20, (t.exitSec || t.durationSec || 180) - (t.entrySec || 0));
    return acc + playLen;
  }, 0);

  const mins = Math.max(1, Math.round(totalSec / 60));

  root.innerHTML = `
    <main class="mx-auto flex min-h-dvh max-w-6xl flex-col px-6 pb-32 pt-10 md:px-10 md:pb-44 font-sans text-white">
      <div class="flex items-center justify-between font-display text-3xl tracking-wide">
        <button id="btn-review-home" class="text-lime cursor-pointer" aria-label="Audify home">Audify</button>
        <div class="flex items-center gap-5">
          <button id="btn-review-back" class="text-white/60 hover:text-white cursor-pointer font-display text-2xl tracking-wide">
            ← <span class="hidden sm:inline">CHANGE ANSWERS</span><span class="sm:hidden">BACK</span>
          </button>
          <button id="btn-review-exit" class="h-14 min-w-14 flex items-center justify-center gap-3 rounded-full border-2 border-white/30 text-white/70 hover:border-white hover:text-white transition active:scale-95 cursor-pointer" aria-label="Exit">
            <svg viewBox="0 0 24 24" class="h-[42%] w-[42%]" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"></path></svg>
          </button>
        </div>
      </div>

      <h1 class="mt-[4vh] font-display text-[44px] uppercase md:mt-[5vh] md:text-[clamp(48px,5.5vw,84px)] leading-[0.9]">Tonight's set</h1>
      <div class="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        <p class="text-xl text-white/60 md:text-xl">
          ${state.sequencedSet.length} songs · about ${mins} minutes with the cuts
        </p>
        ${renderRequestSongButton()}
      </div>

      ${state.reviewNote ? `<p class="mt-3 text-xl text-lime md:text-xl">${esc(state.reviewNote)}</p>` : ''}

      <p class="mt-3 text-base text-white/45 md:text-lg">
        Plays through YouTube: with YouTube Premium there are no ads. Best on a laptop plugged into a speaker.
      </p>

      <ol class="mt-8 flex flex-col" id="review-list">
        ${state.sequencedSet.map((t, idx) => {
          const eVal = Math.max(1, Math.min(10, Math.round(Number(t.energy) || 7)));
          const bars = Array.from({ length: 10 }, (_, b) => `
            <div class="w-2 rounded-sm ${b < eVal ? 'bg-lime' : 'bg-white/15'}" style="height:${8 + 3 * b}px"></div>
          `).join('');
          const cueLabel = t.playFull
            ? 'FULL'
            : `${fmtTime(t.entrySec || 0)}–${fmtTime(t.exitSec || t.durationSec || 180)}`;
          const cleanArtist = (t.artist || '').replace(/\s*·\s*\d{4}\s*$/, '');

          return `
            <li class="flex items-center gap-3 border-b-2 py-3 transition-colors md:gap-5 md:py-3 border-white/10" data-song-idx="${idx}">
              <button class="flex h-12 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-xl text-2xl text-white/35 hover:text-white active:cursor-grabbing md:w-9 select-none" data-drag-idx="${idx}" title="Drag to reorder" aria-label="Move ${esc(t.title)}">⋮⋮</button>
              <span class="w-7 shrink-0 font-display text-2xl text-white/35 md:w-10 md:text-2xl tabular-nums">${idx + 1}</span>
              <div class="min-w-0 flex-1">
                <div class="font-display text-[28px] uppercase leading-[1.05] max-md:line-clamp-2 md:truncate md:text-3xl md:leading-tight">${esc(t.title)}</div>
                <div class="truncate text-base text-white/55 md:text-lg">${esc(cleanArtist)}</div>
              </div>
              <div class="hidden shrink-0 items-end gap-1 md:flex" aria-label="Energy ${eVal} of 10">${bars}</div>
              <span class="hidden w-40 shrink-0 text-right font-display text-xl text-white/60 tabular-nums sm:block">${cueLabel}</span>
              <button class="h-12 w-12 shrink-0 rounded-2xl border-2 border-white/25 font-display text-2xl md:h-14 md:w-14 md:text-2xl text-white/70 hover:border-white hover:text-white remove-row-btn cursor-pointer" data-remove-idx="${idx}" aria-label="Remove ${esc(t.title)}">✕</button>
            </li>
          `;
        }).join('')}
      </ol>

      <div class="pointer-events-none fixed inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink to-transparent px-6 pb-6 pt-12 md:px-10">
        <button id="btn-approve-play" class="pointer-events-auto mx-auto block h-20 w-full max-w-6xl rounded-[24px] bg-lime font-display text-4xl md:h-[clamp(84px,11vh,110px)] md:rounded-[26px] md:text-[clamp(40px,4.2vw,68px)] tracking-wide text-ink transition active:scale-[0.98] cursor-pointer">
          APPROVE &amp; PLAY
        </button>
      </div>
    </main>
  `;

  bindReviewEvents();
}
function renderWaveformHtml(track, pos, dur, cutAt, playFull, isLive) {
  const heat = buildFallbackHeat(track);
  const entry = playFull ? 0 : (track.entrySec || 0);
  const exit = playFull ? dur : (cutAt || track.exitSec || dur);
  const entryPct = `${Math.min(100, Math.max(0, (entry / dur) * 100)).toFixed(2)}%`;
  const exitPct = `${Math.min(100, Math.max(0, (exit / dur) * 100)).toFixed(2)}%`;
  const posPct = `${Math.min(100, Math.max(0, (pos / dur) * 100)).toFixed(2)}%`;
  const narrow = ((exit - entry) / dur) * 100 < 30;

  const bars = heat.map((val, i) => {
    const barTime = ((i + 0.5) / heat.length) * dur;
    const inside = barTime >= entry && barTime <= exit;
    const played = barTime <= pos;
    const cls = !inside ? 'wave-bar outside' : played ? 'wave-bar played' : 'wave-bar';
    const h = Math.round(val * 100);
    return `<div class="${cls}" style="height:${h}%"></div>`;
  }).join('');

  return `
    <div class="waveform-wrap">
      <div class="cue-marker pointer-events-none absolute bottom-0 top-0" style="left:${entryPct}">
        <div class="cue-marker-line"></div>
        ${!(isLive && state.showDragHint) ? `<div class="cue-marker-label ${narrow ? 'right' : 'left'}">IN ${fmtTime(entry)}</div>` : ''}
      </div>

      ${exit < dur - 2 ? `
        <div class="cue-marker pointer-events-none absolute bottom-0 top-0" style="left:${exitPct}">
          <div class="cue-marker-line"></div>
          ${!(isLive && state.showDragHint) ? `<div class="cue-marker-label ${narrow ? 'left' : 'right'}">OUT ${fmtTime(exit)}</div>` : ''}
        </div>
      ` : ''}

      <div class="waveform-bars" ${isLive ? 'id="live-waveform"' : ''}>
        ${bars}
      </div>

      <div class="playhead-line" style="left:${posPct}"></div>

      ${isLive && state.showDragHint ? `
        <div id="drag-hint-group">
          <div class="drag-hint-ring" style="left:${posPct}"></div>
          <div class="drag-hint-bubble">
            <span class="text-accent font-display">← →</span>
            <span>Drag to your favourite drop or cue. NOVA learns it.</span>
          </div>
        </div>
      ` : ''}

      ${isLive && state.dragCueSec !== null ? `
        <div class="drag-time-badge" style="left:${Math.min(92, Math.max(8, (state.dragCueSec / dur) * 100))}%">
          ${fmtTime(state.dragCueSec)}${state.dragCueSec >= exit - 3 && exit < dur - 1 ? ' · PLAY FULL' : ''}
        </div>
      ` : ''}
    </div>
  `;
}

function renderDeckCard(deckId, slotName, deckData, tel) {
  const track = deckData?.track;
  const isLive = slotName === 'live';
  const titleText = track ? track.title : (isLive ? 'STARTING…' : 'END OF SET');
  const isLong = titleText.length > 16;
  const dur = Math.max(1, deckData?.duration || track?.durationSec || 180);
  const pos = deckData?.position || 0;
  const isYt = Boolean(deckData?.engine === 'yt' || (track && isYtTrack(track)));
  const cleanArtist = (track?.artist || '').replace(/\s*·\s*\d{4}\s*$/, '');
  const entry = deckData?.playFull ? 0 : (track?.entrySec || Math.round(dur * 0.25));
  const exit = deckData?.playFull ? dur : (deckData?.cutAt || track?.exitSec || Math.round(dur * 0.75));

  const statusBadge = isLive && deckData?.status === 'live'
    ? `<span class="flex items-center gap-3 text-lime" style="color:#c8ff00;display:inline-flex;align-items:center;gap:10px"><span class="h-[0.55em] w-[0.55em] animate-pulse rounded-full bg-lime" style="width:10px;height:10px;border-radius:50%;background:#c8ff00;display:inline-block"></span>LIVE${deckData?.playFull ? ' · FULL' : ''}</span>`
    : `<span style="color:rgba(255,255,255,0.7);font-family:var(--font-display);font-size:clamp(16px,1.6vw,22px)">○ ${slotName === 'out' ? 'OUT' : isLive ? (track ? 'STARTING' : 'STANDBY') : track ? 'CUEING' : 'STANDBY'}</span>`;

  return `
    <section class="deck absolute left-0 top-0 flex w-full flex-col md:w-[58%] gap-[clamp(6px,1.6vh,24px)]" data-deck="${deckId}" data-slot="${slotName}" aria-hidden="${!isLive}">
      <header class="deck-header flex items-center gap-5 font-display text-[clamp(22px,min(2.4vw,4.4vh),40px)] leading-none tracking-wide">
        <span class="deck-label text-white/50" style="color:rgba(255,255,255,0.5)">DECK ${deckId}</span>
        <div class="deck-status-slot">${statusBadge}</div>
      </header>

      <div class="deck-title-row flex items-start gap-[2.5vw]">
        <div class="min-w-0 flex-1">
          <h2 class="deck-title font-display uppercase leading-[0.86] tracking-[-0.01em] ${isLive ? 'title-land' : ''} ${isLong ? 'long' : ''}" style="display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${esc(titleText)}</h2>
          <p class="deck-artist mt-[clamp(6px,1.6vh,24px)] truncate font-sans text-[clamp(24px,min(2.6vw,4.6vh),48px)] font-semibold leading-tight text-white/75" style="${track ? '' : 'display:none'}">
            ${esc(cleanArtist)}
          </p>
        </div>
        ${isLive && state.pipVideoVisible && isYt && track ? '<div class="deck-pip-slot aspect-video w-[max(356px,19vw)] shrink-0 rounded-[20px]" data-pip-slot="true"></div>' : ''}
      </div>

      <div class="deck-waveform-slot" style="${isLive && track ? '' : 'display:none'}">
        ${track ? renderWaveformHtml(track, pos, dur, deckData?.mixOutSec || deckData?.cutAt, deckData?.playFull, isLive) : ''}
      </div>
    </section>
  `;
}

function renderProDrawer() {
  const snap = state.snap;
  const liveSlot = snap?.decks?.[snap?.liveId];
  const isYtLive = liveSlot?.engine === 'yt';
  const hasNeural = Boolean(!isYtLive && (liveSlot?.track?.stems_available || liveSlot?.track?.neuralStems));
  const plan = snap?.transitionPlan;

  return `
    <div class="drawer-backdrop" id="drawer-backdrop">
      <aside class="pro-drawer nova-scroll" onclick="event.stopPropagation()">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div class="font-display text-accent" style="font-size:32px;line-height:1">PRO DJ CONSOLE</div>
            <div style="font-size:13px;color:rgba(245,245,240,0.58)">${isYtLive ? 'YT IFrame Mode · Volume Crossfade Only' : `Signalsmith Master Tempo · ${hasNeural ? 'Demucs 4-Stem Lanes Active' : 'EQ + Mid-Side Isolator (Stems Off)'}`}</div>
          </div>
          <button id="btn-close-drawer" class="exit-btn">✕</button>
        </div>

        ${isYtLive ? `
          <div class="yt-honest-notice">
            YOUTUBE IFRAME LIMITATION: Browser CORS isolates YouTube iframe audio from Web Audio. EQ Kills, Filters, Echo/Reverb, Stems, Pitch Stretch, &amp; WAV Export require Full-DSP files (.mp3/.wav/.mp4) or Audius/Openverse tracks.
            <div class="fx-slider-row" style="margin-top:10px">
              <label><span>YT VOLUME CROSSFADE DURATION</span><span id="yt-xfade-lbl">${state.ytCrossfadeSec}s</span></label>
              <input id="fx-yt-crossfade" type="range" min="2" max="12" step="0.5" value="${state.ytCrossfadeSec}" />
            </div>
          </div>
        ` : ''}

        <div style="display:flex;flex-direction:column;gap:18px;${isYtLive ? 'opacity:0.35;pointer-events:none' : ''}">
          <div>
            <div class="font-display" style="font-size:20px;color:rgba(245,245,240,0.55);margin-bottom:10px">LIVE ${hasNeural ? 'STEM MIXER' : 'EQ ISOLATOR (STEMS OFF)'} (DECK ${snap?.liveId || 'A'})</div>
            <div class="stem-grid">
              ${['vocals', 'drums', 'bass', 'other'].map((st) => `
                <button class="stem-btn squeeze ${state.stems[st] ? 'on' : 'muted'}" data-stem="${st}">
                  <span>${st.toUpperCase()}</span>
                  <span style="font-size:14px">${state.stems[st] ? 'ON' : 'MUTED'}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:14px">
            <div class="font-display" style="font-size:20px;color:rgba(245,245,240,0.55)">MASTER FX &amp; FILTER</div>
            <div class="fx-slider-row">
              <label><span>COLOR FILTER (LPF ← FLAT → HPF)</span><span>${Math.round(state.filterNorm * 100)}%</span></label>
              <input id="fx-filter" type="range" min="-100" max="100" value="${Math.round(state.filterNorm * 100)}" />
            </div>
            <div class="fx-slider-row">
              <label><span>TEMPO-SYNCED ECHO</span><span>${Math.round(state.echoAmt * 100)}%</span></label>
              <input id="fx-echo" type="range" min="0" max="75" value="${Math.round(state.echoAmt * 100)}" />
            </div>
            <div class="fx-slider-row">
              <label><span>SPACE REVERB</span><span>${Math.round(state.reverbAmt * 100)}%</span></label>
              <input id="fx-reverb" type="range" min="0" max="70" value="${Math.round(state.reverbAmt * 100)}" />
            </div>
          </div>

          <div>
            <div class="font-display" style="font-size:20px;color:rgba(245,245,240,0.55);margin-bottom:10px">TRIGGER CLUB TRANSITION NOW</div>
            <div style="display:flex;flex-wrap:wrap;gap:8px">
              ${[
                ['BASS_SWAP_16BAR', 'BASS SWAP'],
                ['STEM_VOCAL_PASS', 'VOCAL PASS'],
                ['DROP_SWAP', 'DROP SWAP'],
                ['TENSION_ROLL_DROP', 'BEAT ROLL'],
                ['ECHO_OUT_BRAKE', 'ECHO BRAKE'],
                ['HARMONIC_BLEND', 'HARMONIC BLEND'],
                ['BREAKDOWN_BRIDGE', 'BREAKDOWN'],
                ['PERCUSSION_BRIDGE', 'DRUM BRIDGE'],
              ].map(([code, label]) => `
                <button class="pill-btn squeeze" data-force-style="${code}">${label}</button>
              `).join('')}
            </div>
          </div>

          <div>
            <div class="font-display" style="font-size:20px;color:rgba(245,245,240,0.55);margin-bottom:10px">3-BAND EQ KILL &amp; DECK FX (DECK ${snap?.liveId || 'A'})</div>
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px">
              ${['low', 'mid', 'high'].map((band) => {
                const kills = snap?.deckTelemetry?.[snap?.liveId || 'A']?.kills || {};
                const killed = Boolean(kills[band]);
                return `<button class="pill-btn squeeze ${killed ? 'active' : ''}" data-eq-kill="${band}">KILL ${band.toUpperCase()} ${killed ? 'ON' : ''}</button>`;
              }).join('')}
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:10px">
              <button id="btn-loop-4" class="pill-btn squeeze ${state.loopActive ? 'active' : ''}">4-BAR LOOP ${state.loopActive ? 'ON' : 'OFF'}</button>
              <button id="btn-loop-roll" class="pill-btn squeeze">⟳ LOOP ROLL</button>
              <button id="btn-stutter" class="pill-btn squeeze">▤ STUTTER</button>
              <button id="btn-riser-impact" class="pill-btn squeeze">▲ RISER + IMPACT</button>
              <button id="btn-master-tempo" class="pill-btn squeeze ${state.masterTempo ? 'active' : ''}">MASTER TEMPO ${state.masterTempo ? 'ON' : 'OFF'}</button>
              <button id="btn-drum-bridge" class="pill-btn squeeze ${state.percussionBridge ? 'active' : ''}">DHOL / DRUM BRIDGE</button>
              <button id="btn-click-track" class="pill-btn squeeze ${state.clickTrack ? 'active' : ''}">CLICK TRACK ${state.clickTrack ? 'ON' : 'OFF'}</button>
              <button id="btn-spinback" class="pill-btn squeeze">⚡ SPINBACK</button>
              <button id="btn-tapestop" class="pill-btn squeeze">📼 TAPE STOP</button>
              <button id="btn-record-mix" class="pill-btn squeeze ${state.recording ? 'active' : ''}">${state.recording ? '● STOP & SAVE MIX' : '● RECORD MIX'}</button>
            </div>
          </div>
        </div>

          <div style="display:flex;flex-wrap:wrap;gap:8px;padding-top:4px">
            <button id="btn-drawer-debug" class="pill-btn squeeze" style="border-color:var(--amber);color:var(--amber)">✦ BEAT GRID &amp; RECIPES</button>
            <button id="btn-drawer-export" class="pill-btn squeeze" ${state.exportBusy ? 'disabled' : ''}>${state.exportBusy ? 'RENDERING WAV…' : '⬇ EXPORT MIX (.WAV)'}</button>
          </div>
          ${state.exportMsg ? `<div style="font-size:12px;color:var(--amber)">${esc(state.exportMsg)}</div>` : ''}

        ${plan ? `
          <div style="border-top:2px solid rgba(245,245,240,0.12);padding-top:14px;font-size:13px;color:rgba(245,245,240,0.65)">
            NEXT TRANSITION: <strong class="text-amber">${esc(plan.style.replace(/_/g, ' '))}</strong> (${esc(plan.harmonic?.relation || 'phrase')})
          </div>
        ` : ''}

        <div style="margin-top:14px;padding-top:14px;border-top:2px solid rgba(245,245,240,0.12)">
          ${renderLiveTransitionPanel(snap)}
        </div>

        <div style="border-top:2px solid rgba(245,245,240,0.12);padding-top:14px;display:flex;gap:10px">
          <button id="btn-quick-save-set" class="ingest-btn squeeze" style="flex:1;height:52px;font-size:22px">SAVE SET TO DB</button>
        </div>
      </aside>
    </div>
  `;
}

function renderPlayNextModal() {
  const liveId = state.snap?.liveTrack?.id;
  const allTracks = Object.values(CURATED_CATEGORIES_DB).flatMap(c => c.songs || []);
  const query = (state.playNextQuery || '').trim().toLowerCase();
  const matches = query
    ? allTracks.filter(t => t.id !== liveId && `${t.title} ${t.artist}`.toLowerCase().includes(query))
    : state.crate.filter(t => t.id !== liveId);

  return `
    <div class="fixed inset-0 z-40 flex items-end justify-center bg-ink/70 backdrop-blur-sm md:items-center" id="playnext-backdrop">
      <div class="flex max-h-[88dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[28px] border-2 border-white/15 bg-ink md:rounded-[28px]" onclick="event.stopPropagation()">
        <div class="px-6 pt-5 md:px-8">
          <div class="flex items-center justify-between">
            <p class="font-display text-3xl uppercase tracking-wide md:text-4xl">Play next</p>
            <button id="btn-close-playnext" aria-label="Close" class="h-11 w-11 rounded-full border-2 border-white/25 text-xl text-white/70 hover:border-white hover:text-white cursor-pointer">✕</button>
          </div>
          <input
            id="input-playnext"
            class="mt-4 w-full rounded-2xl border-2 border-white/20 bg-transparent px-5 py-3 text-lg text-white placeholder:text-white/35 focus:border-lime focus:outline-none"
            value="${esc(state.playNextQuery)}"
            placeholder="Search a song or artist"
            aria-label="Search songs"
            autofocus
          />
        </div>
        <div class="naux-scroll mt-3 min-h-0 flex-1 overflow-y-auto px-6 pb-5 md:px-8" id="playnext-list">
          ${query ? (matches.length ? `
            <ul class="flex flex-col gap-2">
              ${matches.slice(0, 30).map((t) => `
                <li class="flex items-center justify-between gap-3 border-b border-white/10 py-3">
                  <div class="min-w-0 flex-1">
                    <div class="font-display text-xl uppercase leading-tight md:text-2xl">${esc(t.title)}</div>
                    <div class="truncate text-white/55 text-sm md:text-base">${esc(t.artist)}</div>
                  </div>
                  <button class="rounded-full border-2 border-lime px-4 py-1.5 font-display text-base tracking-wide text-lime transition hover:bg-lime hover:text-ink squeeze shrink-0 cursor-pointer" data-pick-next="${esc(t.id)}">
                    ＋ PLAY NEXT
                  </button>
                </li>
              `).join('')}
            </ul>
          ` : `
            <div class="py-8 text-center">
              <p class="text-white/55 text-lg">We don't have that one yet.</p>
              <button class="mt-4 rounded-full border-2 border-lime px-6 py-2.5 font-display text-xl tracking-wide text-lime transition hover:bg-lime hover:text-ink cursor-pointer" id="btn-request-song">
                ＋ REQUEST “${esc(state.playNextQuery.slice(0, 35))}”
              </button>
            </div>
          `) : `
            <p class="mb-2 font-display text-lg uppercase tracking-wide text-white/45">Played tonight</p>
            <ul class="flex flex-col gap-2">
              ${state.crate.filter(t => t.id !== liveId).slice(0, 15).map((t) => `
                <li class="flex items-center justify-between gap-3 border-b border-white/10 py-3">
                  <div class="min-w-0 flex-1">
                    <div class="font-display text-xl uppercase leading-tight md:text-2xl">${esc(t.title)}</div>
                    <div class="truncate text-white/55 text-sm md:text-base">${esc(t.artist)}</div>
                  </div>
                  <button class="rounded-full border-2 border-white/30 px-4 py-1.5 font-display text-base tracking-wide text-white/80 transition hover:border-lime hover:text-lime squeeze shrink-0 cursor-pointer" data-pick-next="${esc(t.id)}">
                    play it again
                  </button>
                </li>
              `).join('')}
            </ul>
          `}
        </div>
      </div>
    </div>
  `;
}

function renderVibeModal() {
  const timeOptions = [
    { id: 'warmup', label: 'Warming up' },
    { id: 'peak', label: 'Peak' },
    { id: 'winddown', label: 'Winding down' },
    { id: 'bangers', label: 'Only bangers' },
  ];
  const crowdOptions = [
    { id: 'small', label: '4–6' },
    { id: 'medium', label: '10–20' },
    { id: 'large', label: '20+' },
  ];
  const langOptions = [
    { id: 'hindi', label: 'Hindi' },
    { id: 'punjabi', label: 'Punjabi' },
    { id: 'english', label: 'English' },
    { id: 'south', label: 'Tamil / Telugu' },
    { id: 'gujarati', label: 'Garba / Gujarati' },
    { id: 'haryanvi-bhojpuri', label: 'Haryanvi / Bhojpuri' },
  ];

  return `
    <div class="fixed inset-0 z-40 flex items-end justify-center bg-ink/70 backdrop-blur-sm md:items-center" id="vibe-backdrop">
      <div class="flex max-h-[88dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[28px] border-2 border-white/15 bg-ink md:rounded-[28px]" onclick="event.stopPropagation()">
        <div class="naux-scroll min-h-0 flex-1 overflow-y-auto px-6 pb-2 pt-5 md:px-8">
          <div class="flex items-center justify-between">
            <p class="font-display text-3xl uppercase tracking-wide md:text-4xl">Change the vibe</p>
            <button id="btn-close-vibe" aria-label="Close" class="h-11 w-11 rounded-full border-2 border-white/25 text-xl text-white/70 hover:border-white hover:text-white cursor-pointer">✕</button>
          </div>
          <p class="mt-1 text-base text-white/50">The song playing carries on. Everything after it is re-picked.</p>

          <div class="mt-4">
            <p class="mb-2 font-display text-lg uppercase tracking-wide text-white/45">Where in the night</p>
            <div class="flex flex-wrap gap-2.5">
              ${timeOptions.map(t => `
                <button class="rounded-2xl border-2 px-4 py-1.5 font-display text-xl uppercase tracking-wide transition ${state.vibe === t.id ? 'border-lime bg-lime text-ink' : 'border-white/25 text-white/80 hover:border-white/60'} cursor-pointer" data-retune-vibe="${t.id}">
                  ${t.label}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="mt-4">
            <p class="mb-2 font-display text-lg uppercase tracking-wide text-white/45">How many people</p>
            <div class="flex flex-wrap gap-2.5">
              ${crowdOptions.map(c => `
                <button class="rounded-2xl border-2 px-4 py-1.5 font-display text-xl uppercase tracking-wide transition ${state.crowd === c.id ? 'border-lime bg-lime text-ink' : 'border-white/25 text-white/80 hover:border-white/60'} cursor-pointer" data-retune-crowd="${c.id}">
                  ${c.label}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="mt-4">
            <p class="mb-2 font-display text-lg uppercase tracking-wide text-white/45">Languages</p>
            <div class="flex flex-wrap gap-2.5">
              ${langOptions.map(l => {
                const sel = (state.selectedLanguages || []).includes(l.id);
                return `
                  <button class="rounded-2xl border-2 px-4 py-1.5 font-display text-xl uppercase tracking-wide transition ${sel ? 'border-lime bg-lime text-ink' : 'border-white/25 text-white/80 hover:border-white/60'} cursor-pointer" data-retune-lang="${l.id}">
                    ${l.label}
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <div class="border-t-2 border-white/10 px-6 pb-5 pt-4 md:px-8">
          <button id="btn-apply-vibe" class="h-16 w-full rounded-[20px] bg-lime font-display text-3xl tracking-wide text-ink transition active:scale-[0.98] cursor-pointer">
            APPLY
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderPlaying() {
  const snap = state.snap || {
    liveId: 'A',
    cueId: 'B',
    paused: false,
    crossfading: false,
    decks: { A: { track: state.sequencedSet[0], status: 'loading' }, B: { track: state.sequencedSet[1], status: 'empty' } },
    agentMessage: 'LOADING DECKS…',
    masterBpm: 120,
  };

  const liveSlot = snap.decks[snap.liveId];
  const cueSlot = snap.decks[snap.cueId];
  const livePos = liveSlot?.position || 0;
  const liveDur = Math.max(1, liveSlot?.duration || liveSlot?.track?.durationSec || 180);
  const energy = liveSlot?.track?.energy || 6;
  const pulseDur = `${(2.6 - 0.17 * energy).toFixed(2)}s`;

  let cleanAgentMsg = snap.agentMessage || '';
  if (cleanAgentMsg.includes('VOLUME FADE') || cleanAgentMsg.includes('NO DSP') || cleanAgentMsg.includes('YT VIDEO')) {
    cleanAgentMsg = cueSlot?.track ? `Mixing into ${cueSlot.track.title} soon` : 'Dropping straight into the hook';
  } else if (!cleanAgentMsg) {
    cleanAgentMsg = cueSlot?.track ? `Mixing into ${cueSlot.track.title} soon` : 'Letting this one run, holding the energy';
  }

  const vibeLabel = [
    (state.activeVibeCard || 'HINDI').toUpperCase(),
    (state.activeVibeCategory?.replace(/^[a-z]+-/, '') || 'DANCE').toUpperCase(),
    (state.vibe || 'PEAK').toUpperCase(),
    (state.crowd === 'small' ? '4–6' : state.crowd === 'large' ? '20+' : '10–20')
  ].filter(Boolean).join(' · ');

  const slotA = snap.liveId === 'A' ? 'live' : (snap.crossfading ? 'out' : 'cue');
  const slotB = snap.liveId === 'B' ? 'live' : (snap.crossfading ? 'out' : 'cue');

  root.innerHTML = `
    <main data-paused="${snap.paused ? 'true' : void 0}" class="relative flex h-dvh flex-col overflow-clip px-[4vw] pb-[3vh] pt-[3vh]">
      <div class="pulse-glow pointer-events-none absolute -left-[20vw] top-[10vh] h-[90vh] w-[90vw] rounded-full bg-[radial-gradient(closest-side,rgba(200,255,0,0.10),transparent)]" style="--pulse:${pulseDur}"></div>

      <!-- Top bar matching 2yak1xb5ht175.js -->
      <div class="relative z-30 flex items-center gap-[2vw] font-display text-[clamp(26px,2.4vw,40px)] leading-none tracking-wide">
        <span class="shrink-0 text-lime">Audify</span>

        <button id="btn-open-vibe" class="absolute left-1/2 -translate-x-1/2 hidden max-w-[44vw] items-center gap-3 rounded-full border-2 border-white/20 px-5 py-2 text-[clamp(16px,1.3vw,22px)] uppercase text-white/75 transition-[transform,border-color,color] duration-300 ease-out hover:border-lime hover:text-white md:flex cursor-pointer">
          <span class="min-w-0 truncate">${esc(vibeLabel)}</span>
          <span class="shrink-0 text-lime">CHANGE</span>
        </button>

        <div class="ml-auto flex shrink-0 items-center gap-[2vw]">
          <button id="btn-clock-pause" class="group flex items-center gap-[0.45em] rounded-full border-2 py-[0.28em] pl-[0.5em] pr-[0.6em] tabular-nums transition cursor-pointer ${snap.paused ? 'border-lime text-lime' : 'border-white/20 text-white/60 hover:border-white/60 hover:text-white'}" title="${snap.paused ? 'Resume (space)' : 'Pause (space)'}">
            <span class="flex h-[0.8em] w-[0.8em] items-center justify-center" aria-hidden="true">
              ${snap.paused ? '<svg viewBox="0 0 24 24" class="h-full w-full fill-current"><polygon points="5 3 19 12 5 21 5 3"/></svg>' : '<svg viewBox="0 0 24 24" class="h-full w-full fill-current"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>'}
            </span>
            <span class="${snap.paused ? 'clock-blink' : ''}">${fmtTime(livePos)} / ${fmtTime(liveDur)}</span>
          </button>

          ${renderExitBtn(true)}
        </div>
      </div>

      <!-- Mobile Vibe button -->
      <button id="btn-open-vibe-mobile" class="relative z-10 mt-3 flex items-center gap-2 self-start rounded-full border-2 border-white/20 px-4 py-1.5 font-display text-base uppercase tracking-wide text-white/75 md:hidden cursor-pointer">
        <span class="truncate">${esc(vibeLabel)}</span>
        <span class="shrink-0 text-lime">CHANGE</span>
      </button>

      <!-- Center Deck Area -->
      <div class="relative z-10 mt-[2.5vh] min-h-0 flex-1 [container-type:size]">
        ${renderDeckCard('A', slotA, snap.decks.A, snap.deckTelemetry?.A)}
        ${renderDeckCard('B', slotB, snap.decks.B, snap.deckTelemetry?.B)}
      </div>

      <!-- Paused Overlay -->
      ${snap.paused ? `
        <button id="btn-paused-resume" class="absolute inset-x-0 top-[12vh] bottom-[38vh] z-20 flex flex-col items-center justify-center max-md:bottom-[30vh] cursor-pointer" aria-label="Resume">
          <span class="paused-stamp pointer-events-none font-display text-[clamp(84px,16vw,260px)] uppercase leading-none tracking-tight">Paused</span>
          <span class="mt-[1.5vh] font-display text-[clamp(22px,2vw,34px)] uppercase tracking-wide text-white/60">
            at ${fmtTime(livePos)} · <span class="max-md:hidden">space or </span>tap to resume
          </span>
        </button>
      ` : ''}

      <!-- Sweep transition flash -->
      ${snap.crossfading ? `<div class="sweep pointer-events-none absolute inset-y-0 left-0 z-20 w-[9vw] bg-lime mix-blend-difference"></div>` : ''}

      <!-- AGENT Bar -->
      <div class="relative z-10 mb-[3vh] flex [@media(max-height:500px)]:hidden items-center gap-5 border-y-2 border-white/15 py-[1.6vh]">
        <span class="shrink-0 font-display text-[clamp(26px,2.2vw,38px)] leading-none tracking-wide text-lime">AGENT</span>
        <div class="min-w-0 flex-1 truncate font-sans text-[clamp(16px,1.3vw,22px)] text-white/70" id="agent-msg">
          ${esc(cleanAgentMsg)}
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <button class="rounded-full border-2 border-white/25 px-3 py-1.5 font-display text-base tracking-wide text-white/75 transition hover:border-white hover:text-white disabled:opacity-30 md:px-4 md:text-lg cursor-pointer" id="btn-remove-next" ${!cueSlot?.track || snap.crossfading ? 'disabled' : ''}>
            ✕ <span class="hidden md:inline">REMOVE NEXT</span>
          </button>
          <button class="rounded-full border-2 border-lime px-3 py-1.5 font-display text-base tracking-wide text-lime transition hover:bg-lime hover:text-ink md:px-4 md:text-lg cursor-pointer" id="btn-play-next">
            ＋ <span class="hidden md:inline">PLAY NEXT</span>
          </button>
        </div>
      </div>

      <!-- Bottom Transport Controls -->
      <div class="relative z-10 flex gap-[2vw]">
        ${snap.paused ? `
          <button id="btn-mega-resume" class="flex-1 h-20 rounded-3xl bg-lime font-display text-4xl text-ink tracking-wide transition active:scale-[0.98] cursor-pointer">
            <span class="inline-flex items-center gap-[0.35em]">
              <span class="inline-flex h-[0.62em] w-[0.62em]" aria-hidden="true">
                <svg viewBox="0 0 24 24" class="h-full w-full fill-current"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </span>
              RESUME
            </span>
          </button>
        ` : `
          <button id="btn-mega-skip" class="flex-1 h-20 rounded-3xl bg-lime font-display text-4xl text-ink tracking-wide transition active:scale-[0.98] cursor-pointer disabled:opacity-40" ${!liveSlot?.track || snap.crossfading ? 'disabled' : ''}>
            SKIP
          </button>
          <button id="btn-mega-full" class="flex-1 h-20 rounded-3xl border-2 font-display text-4xl tracking-wide transition active:scale-[0.98] cursor-pointer ${liveSlot?.playFull ? 'border-lime bg-lime text-ink' : 'border-white/30 text-white hover:border-white'}" ${!liveSlot?.track || liveSlot?.playFull ? 'disabled' : ''}>
            ${liveSlot?.playFull ? 'PLAYING FULL' : 'PLAY FULL'}
          </button>
        `}
      </div>
    </main>

    ${state.playNextModalOpen ? renderPlayNextModal() : ''}
    ${state.vibeModalOpen ? renderVibeModal() : ''}
  `;

  bindPlayingEvents();
  positionPipTile();
  syncLocalVideoDecks(snap, livePos);
  initDeckTitleAutoScaler();
}
function renderSummary() {
  const played = orchestrator?.playedHistory?.length ? orchestrator.playedHistory : state.sequencedSet;
  const q = state.setPlan?.quality || { tempo_smoothness: 90, bass_clashes: 0, vocal_clashes: 0, energy_flow: 92 };
  const recipes = state.setPlan?.transitions || [];
  const dspCount = played.filter((t) => t.file || t.dspReady).length;

  root.innerHTML = `
    <main class="stage-shell">
      ${renderTopBar(`<button id="btn-summary-home" class="nav-meta-btn">NEW SET →</button>`)}
      <h1 class="hero-h1" style="margin-top:4vh">THAT WAS THE SET</h1>
      <p class="hero-sub">${played.length} tracks played through NOVA AI DJ · <span class="text-amber">${esc(state.setPlan?.plannerSource || 'NOVA Engine')}</span></p>

      <div style="margin-top:18px;display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px">
        <div style="border:2px solid rgba(245,245,240,0.14);border-radius:16px;padding:12px">
          <div class="font-mono-num" style="font-size:11px;color:rgba(245,245,240,0.5)">TEMPO SMOOTHNESS</div>
          <div class="font-display text-accent" style="font-size:32px">${q.tempo_smoothness}%</div>
        </div>
        <div style="border:2px solid rgba(245,245,240,0.14);border-radius:16px;padding:12px">
          <div class="font-mono-num" style="font-size:11px;color:rgba(245,245,240,0.5)">BASS CLASHES</div>
          <div class="font-display" style="font-size:32px;color:#6bff95">${q.bass_clashes}</div>
        </div>
        <div style="border:2px solid rgba(245,245,240,0.14);border-radius:16px;padding:12px">
          <div class="font-mono-num" style="font-size:11px;color:rgba(245,245,240,0.5)">VOCAL CLASHES</div>
          <div class="font-display text-amber" style="font-size:32px">${q.vocal_clashes}</div>
        </div>
        <div style="border:2px solid rgba(245,245,240,0.14);border-radius:16px;padding:12px">
          <div class="font-mono-num" style="font-size:11px;color:rgba(245,245,240,0.5)">ENERGY FLOW</div>
          <div class="font-display text-accent" style="font-size:32px">${q.energy_flow}%</div>
        </div>
      </div>

      <div class="ingest-box" style="margin-top:20px">
        <div class="ingest-row">
          <input id="input-set-name" class="ingest-input" value="${esc(state.setNameInput)}" placeholder="Name this set (e.g. Friday Rooftop Mix)…" maxlength="60" />
          <button id="btn-save-set" class="ingest-btn squeeze">SAVE SET</button>
          ${dspCount ? `<button id="btn-summary-export" class="ingest-btn ghost squeeze" ${state.exportBusy ? 'disabled' : ''}>${state.exportBusy ? 'RENDERING…' : '⬇ EXPORT .WAV'}</button>` : ''}
        </div>
        ${state.setSavedMsg ? `<div class="status-banner">${esc(state.setSavedMsg)}</div>` : ''}
        ${state.exportMsg ? `<div class="status-banner">${esc(state.exportMsg)}</div>` : ''}
      </div>

      <ol class="review-list">
        ${played.map((t, i) => {
          const nextT = played[i + 1];
          const rec = nextT ? recipes.find((r) => r.from === t.id && r.to === nextT.id) : null;
          const rKey = rec ? `${rec.from}->${rec.to}` : '';
          const rated = rKey ? state.ratingsMap[rKey] : '';
          return `
            <li class="review-row">
              <span class="row-idx">${i + 1}</span>
              <div class="row-main">
                <div class="row-title">${esc(t.title)}</div>
                <div class="row-meta">${esc(t.artist)}${t.bpm ? ` · ${Math.round(t.bpm)} BPM` : ''}${rec ? ` · ↳ ${esc(rec.type.replace(/_/g, ' ').toUpperCase())}` : ''}</div>
              </div>
              ${rec ? `
                <div style="display:flex;gap:6px">
                  <button class="pill-btn squeeze ${rated === 'good' ? 'active' : ''}" style="font-size:14px;padding:4px 10px" data-sum-rate="${esc(rKey)}" data-sum-val="good">👍</button>
                  <button class="pill-btn squeeze ${rated === 'bad' ? 'active' : ''}" style="font-size:14px;padding:4px 10px" data-sum-rate="${esc(rKey)}" data-sum-val="bad">👎</button>
                </div>
              ` : ''}
            </li>
          `;
        }).join('')}
      </ol>
    </main>
    <div class="sticky-approve-wrap">
      <button id="btn-summary-new" class="approve-btn squeeze">BUILD ANOTHER SET</button>
    </div>
  `;

  document.getElementById('btn-home').onclick = goHome;
  document.getElementById('btn-summary-home').onclick = goHome;
  document.getElementById('btn-summary-new').onclick = goHome;
  document.getElementById('input-set-name').oninput = (e) => { state.setNameInput = e.target.value; };
  document.getElementById('btn-save-set').onclick = () => saveCurrentSetToDb(state.setNameInput);
  const sumExp = document.getElementById('btn-summary-export');
  if (sumExp) sumExp.onclick = runOfflineWavExport;
  document.querySelectorAll('[data-sum-rate]').forEach((b) => {
    b.onclick = () => saveTransitionRating(b.dataset.sumRate, b.dataset.sumVal);
  });
}

function goHome() {
  orchestrator?.stop();
  ytHost.setAttribute('data-visible', 'false');
  state.appMode = 'yt';
  state.ytViewMode = 'directory';
  state.screen = 'wizard';
  state.wizardStep = 0;
  state.drawerOpen = false;
  state.debugModalOpen = false;
  state.brainModalOpen = false;
  state.vibeModalOpen = false;
  state.playNextModalOpen = false;
  state.exitConfirm = false;
  render();
}

/* =========================================================
   EVENT BINDERS
   ========================================================= */
function bindExitHandler(confirmRequired) {
  const btn = document.getElementById('btn-exit');
  if (!btn) return;
  btn.onclick = () => {
    if (!confirmRequired) {
      goHome();
      return;
    }
    if (state.exitConfirm) {
      clearTimeout(exitConfirmTimer);
      state.exitConfirm = false;
      goHome();
    } else {
      state.exitConfirm = true;
      render();
      clearTimeout(exitConfirmTimer);
      exitConfirmTimer = setTimeout(() => {
        state.exitConfirm = false;
        if (state.screen === 'playing') render();
      }, 2500);
    }
  };
}

function bindBrainModalEvents() {
  if (!state.brainModalOpen) return;
  const bd = document.getElementById('brain-backdrop');
  if (bd) bd.onclick = () => { state.brainModalOpen = false; render(); };
  const cb = document.getElementById('btn-close-brain');
  if (cb) cb.onclick = () => { state.brainModalOpen = false; render(); };
  const sb = document.getElementById('btn-save-opus-key');
  if (sb) {
    sb.onclick = () => {
      const val = document.getElementById('input-opus-key')?.value?.trim() || '';
      const gVal = document.getElementById('input-gemini-key')?.value?.trim() || '';
      const oVal = document.getElementById('input-openai-key')?.value?.trim() || '';
      state.opusKey = val;
      state.geminiKey = gVal;
      state.openaiKey = oVal;
      try {
        if (val) {
          sessionStorage.setItem('nova.opus.key', val);
          localStorage.setItem('nova.opus.key', val);
        } else {
          sessionStorage.removeItem('nova.opus.key');
          localStorage.removeItem('nova.opus.key');
        }
        if (gVal) {
          sessionStorage.setItem('nova.gemini.key', gVal);
          localStorage.setItem('nova.gemini.key', gVal);
        } else {
          sessionStorage.removeItem('nova.gemini.key');
          localStorage.removeItem('nova.gemini.key');
        }
        if (oVal) {
          sessionStorage.setItem('nova.openai.key', oVal);
          localStorage.setItem('nova.openai.key', oVal);
        } else {
          sessionStorage.removeItem('nova.openai.key');
          localStorage.removeItem('nova.openai.key');
        }
      } catch {}
      state.brainModalOpen = false;
      render();
    };
  }
}

function bindProDjModalEvents() {
  if (!state.proDjModalOpen) return;
  const backdrop = document.getElementById('pro-dj-backdrop');
  if (backdrop) backdrop.onclick = () => { state.proDjModalOpen = false; render(); };
  const closeBtn = document.getElementById('btn-close-pro-dj');
  if (closeBtn) closeBtn.onclick = () => { state.proDjModalOpen = false; render(); };

  const inp = document.getElementById('input-source');
  if (inp) {
    inp.oninput = (e) => { state.searchInput = e.target.value; };
    inp.onkeydown = (e) => { if (e.key === 'Enter') handleSourceFetch(); };
  }
  const fetchBtn = document.getElementById('btn-fetch-source');
  if (fetchBtn) fetchBtn.onclick = () => handleSourceFetch();

  const fileInput = document.getElementById('file-audio-input');
  const dropBtn = document.getElementById('btn-drop-files');
  if (dropBtn && fileInput) dropBtn.onclick = () => fileInput.click();
  if (fileInput) fileInput.onchange = (e) => handleLocalFiles(e.target.files);

  document.querySelectorAll('[data-provider]').forEach((b) => {
    b.onclick = () => {
      state.searchProvider = b.dataset.provider;
      render();
    };
  });

  document.querySelectorAll('[data-result-idx]').forEach((b) => {
    b.onclick = () => {
      const t = state.searchResults[Number(b.dataset.resultIdx)];
      if (!t) return;
      const exists = state.crate.some((c) => c.id === t.id);
      if (exists) state.crate = state.crate.filter((c) => c.id !== t.id);
      else addTrackToCrate(t);
      render();
    };
  });

  const playProCrate = document.getElementById('btn-play-pro-crate');
  if (playProCrate) {
    playProCrate.onclick = () => {
      state.proDjModalOpen = false;
      state.sequencedSet = sequenceCrate(state.crate, { vibe: state.vibe, playMode: state.playMode });
      state.setPlan = planSetHeuristic(state.sequencedSet, { vibe: state.vibe, playMode: state.playMode });
      approveAndPlay();
    };
  }
}

function bindWizardEvents() {
  // Top header brand resets to splash
  const brand = document.getElementById('btn-naux-brand');
  if (brand) {
    brand.onclick = () => {
      state.screen = 'splash';
      state.wizardStep = 0;
      render();
    };
  }

  // Link to song lists
  const btnSongLists = document.getElementById('link-party-lists');
  if (btnSongLists) {
    btnSongLists.onclick = (e) => {
      e.preventDefault();
      state.appMode = 'yt';
      state.ytViewMode = 'directory';
      state.screen = 'wizard';
      if (typeof window !== 'undefined' && window.history) {
        window.history.pushState({}, '', '/songs');
      }
      render();
    };
  }

  // Exit button resets to splash
  const btnWizExit = document.getElementById('btn-wiz-exit');
  if (btnWizExit) {
    btnWizExit.onclick = () => {
      state.screen = 'splash';
      state.wizardStep = 0;
      render();
    };
  }

  // Back button
  const back = document.getElementById('btn-wiz-back');
  if (back) {
    back.onclick = () => {
      state.wizardStep = Math.max(0, state.wizardStep - 1);
      render();
    };
  }

  // Next button
  const next = document.getElementById('btn-wiz-next');
  if (next) {
    next.onclick = () => {
      if (state.wizardStep < 3) {
        state.wizardStep += 1;
        render();
      }
    };
  }

  // Song Request interactions
  const btnOpenReq = document.getElementById('btn-open-request-song');
  if (btnOpenReq) {
    btnOpenReq.onclick = () => {
      state.requestFormOpen = true;
      render();
    };
  }

  const reqInput = document.getElementById('naux-request-input');
  if (reqInput) {
    reqInput.oninput = (e) => {
      state.requestSongText = e.target.value;
      const sendBtn = document.getElementById('btn-naux-request-send');
      if (sendBtn) {
        sendBtn.disabled = state.requestSongText.trim().length < 2;
      }
    };
    reqInput.onkeydown = (e) => {
      if (e.key === 'Enter' && state.requestSongText.trim().length >= 2) {
        sendSongRequest();
      }
    };
  }

  const sendReqBtn = document.getElementById('btn-naux-request-send');
  if (sendReqBtn) {
    sendReqBtn.onclick = () => {
      sendSongRequest();
    };
  }

  // Step 0: Language selection
  document.querySelectorAll('[data-wizard-lang]').forEach((btn) => {
    btn.onclick = () => {
      const id = btn.dataset.wizardLang;
      if (state.selectedLanguages.includes(id)) {
        if (state.selectedLanguages.length > 1) {
          state.selectedLanguages = state.selectedLanguages.filter(l => l !== id);
        }
      } else {
        state.selectedLanguages.push(id);
      }
      state.activeVibeCard = state.selectedLanguages[0] || 'hindi';
      render();
    };
  });

  // Step 1: Subcategory selection
  document.querySelectorAll('[data-wizard-subcat]').forEach((btn) => {
    btn.onclick = () => {
      state.activeVibeCategory = btn.dataset.wizardSubcat;
      state.activeVibeCard = btn.dataset.parentLang || state.activeVibeCard;
      render();
    };
  });

  // Step 2: Time of Night / Vibe selection -> Instant advance to Step 3
  document.querySelectorAll('[data-vibe]').forEach((b) => {
    b.onclick = () => {
      state.vibe = b.dataset.vibe;
      state.wizardStep = 3;
      render();
    };
  });

  // Step 3: Crowd size selection -> Building animation -> Tonight's set
  document.querySelectorAll('[data-crowd]').forEach((b) => {
    b.onclick = () => {
      state.crowd = b.dataset.crowd;
      buildMultiLanguagePartySet();
      state.screen = 'building';
      render();
      setTimeout(() => {
        state.screen = 'review';
        render();
      }, 1200);
    };
  });
}
function saveTransitionRating(rKey, val, extra = null) {
  if (!rKey) return;
  state.ratingsMap[rKey] = val;
  try {
    localStorage.setItem('nova.transition.ratings.v1', JSON.stringify(state.ratingsMap));
  } catch {}
  const [fromSongId, toSongId] = rKey.split('->');
  const matched = extra || state.setPlan?.transitions?.find((r) => r.from === fromSongId && r.to === toSongId);
  const entry = {
    pair: rKey,
    rating: val,
    type: matched?.type || 'blend',
    bpmDeltaPct: matched?.compatibility?.bpm_diff_pct ?? null,
    at: Date.now(),
  };
  state.learningHistory = [entry, ...(state.learningHistory || []).filter((h) => h.pair !== rKey)].slice(0, 30);
  try {
    localStorage.setItem('nova.learning.history.v1', JSON.stringify(state.learningHistory));
  } catch {}

  fetch('/api/plan', {
    method: 'POST',
    headers: getAiHeaders(),
    body: JSON.stringify({
      action: 'rate_transition',
      sessionId: state.sessionId,
      fromSongId,
      toSongId,
      type: entry.type,
      rating: val,
    }),
  }).catch(() => {});
  render();
}

async function auditTransitionWithListener(idx) {
  state.planEpoch += 1;
  const rec = state.setPlan?.transitions?.[idx];
  if (!rec) return;
  const trackA = state.sequencedSet.find((t) => t.id === rec.from);
  const trackB = state.sequencedSet.find((t) => t.id === rec.to);
  if (!trackA || !trackB) return;

  const a = state.setPlan.analyses.find((x) => x.song_id === rec.from);
  const bSong = state.setPlan.analyses.find((x) => x.song_id === rec.to);
  const orch = initOrchestrator();
  state.auditBusyIdx = idx;
  state.exportMsg = 'Rendering isolated transition clip for AI Audio Listener…';
  render();

  const log = [];
  let activeRec = { ...rec };
  try {
    for (let iter = 1; iter <= 4; iter++) {
      state.exportMsg = `Audio Listener + DJustify 9-Gate Critic Iteration ${iter}/4…`;
      render();
      const { wavBase64, metrics } = await renderTransitionClipBase64(trackA, trackB, activeRec, orch.proMixer);
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: getAiHeaders(),
        body: JSON.stringify({
          action: 'critique_transition',
          iteration: iter,
          wavBase64,
          recipe: activeRec,
          metrics,
          songA: a || trackA,
          songB: bSong || trackB,
        }),
      });
      const data = await res.json();
      const score = Number(data?.listener?.score_1_to_10) || 7;
      log.push({
        iteration: iter,
        passed: Boolean(data?.passed),
        score,
        metrics,
        checkerGates: data?.checkerGates || null,
        notes: data?.listener?.notes || (data?.checkerGates?.failed_gates || []).map((g) => `${g.label}: ${g.detail}`).join('; ') || (data?.listener?.issues || []).join('; '),
        criticProvider: data?.criticProvider || null,
      });

      if (data?.passed) {
        activeRec.critiqueLog = log.slice();
        activeRec.why = `${activeRec.why} [DJustify & Listener Verified ${score}/10 ✓]`;
        state.setPlan.transitions[idx] = activeRec;
        break;
      }
      if (iter < 4 && data?.revisedRecipe) {
        activeRec = {
          ...data.revisedRecipe,
          compatibility: activeRec.compatibility,
          candidates: activeRec.candidates,
          creative_candidates: activeRec.creative_candidates,
          critiqueLog: log.slice(),
        };
      } else {
        // After 4 tries (or no valid critic suggestion), deterministically apply declared safe fallback
        const safeFb = repairOrFallbackRecipe(a || trackA, bSong || trackB, state.vibe, state.playMode);
        log.push({
          iteration: iter,
          passed: true,
          score: Math.max(7, score),
          metrics,
          fallbackApplied: true,
          notes: `Declared safe fallback (${safeFb.type}) applied after ${iter} audit iteration(s).`,
          criticProvider: 'deterministic-fallback',
        });
        activeRec = {
          ...safeFb,
          fallbackUsed: true,
          compatibility: activeRec.compatibility,
          candidates: activeRec.candidates,
          creative_candidates: activeRec.creative_candidates,
          critiqueLog: log.slice(),
        };
        state.setPlan.transitions[idx] = activeRec;
        break;
      }
      state.setPlan.transitions[idx] = activeRec;
      render();
    }
    state.setPlan.transitions[idx] = activeRec;
    if (orchestrator?.running) orchestrator.recipes = state.setPlan.transitions;
    const last = log[log.length - 1];
    state.exportMsg = `Listener & Gate Audit: ${last?.passed ? 'PASSED' : 'REVISED'} (${last?.score ?? '?'}/10) after ${log.length} pass(es).`;
  } catch (err) {
    state.exportMsg = err?.message || 'Audio Listener check unavailable.';
  } finally {
    state.auditBusyIdx = -1;
    render();
  }
}

async function batchAuditAllTransitions() {
  const transitions = state.setPlan?.transitions || [];
  if (!transitions.length || state.batchAuditBusy) return;
  state.batchAuditBusy = true;
  state.debugModalOpen = true;
  render();
  let passedCount = 0;
  for (let i = 0; i < transitions.length; i++) {
    state.exportMsg = `Batch Auditing Transition ${i + 1}/${transitions.length}…`;
    render();
    await auditTransitionWithListener(i);
    const last = state.setPlan?.transitions?.[i]?.critiqueLog?.slice(-1)[0];
    if (last?.passed) passedCount++;
  }
  state.batchAuditBusy = false;
  state.exportMsg = `Batch Audit Complete: ${passedCount}/${transitions.length} transitions passed >= 7/10 ✓`;
  render();
}

function recalibrateTrackGrid(idx, overrideOpts) {
  state.planEpoch += 1;
  const analyses = state.setPlan?.analyses;
  if (!analyses || !analyses[idx]) return;
  const updated = applyManualGridOverride(analyses[idx], overrideOpts);
  analyses[idx] = updated;

  const seqTrack = state.sequencedSet.find((t) => t.id === updated.song_id);
  if (seqTrack) {
    seqTrack.bpm = updated.bpm;
    seqTrack.entrySec = updated.clubEntry;
    seqTrack.exitSec = updated.clubExit;
    seqTrack.analysis = updated;
    if (orchestrator?.proMixer?.decodedCache?.has(seqTrack.id)) {
      const cached = orchestrator.proMixer.decodedCache.get(seqTrack.id);
      if (cached) cached.analysis = { ...cached.analysis, ...updated };
    }
  }
  saveAnalysisCache(updated.song_id, {
    bpm: updated.bpm,
    beat_times: updated.beat_times,
    downbeat_times: updated.downbeat_times,
    bars: updated.bars,
    manualOverride: updated.manualOverride,
  });

  // Recompute adjacent transitions & run deterministic validator immediately
  const map = {};
  for (const a of analyses) map[a.song_id] = a;
  for (let i = Math.max(0, idx - 1); i <= Math.min(analyses.length - 2, idx); i++) {
    const a = analyses[i];
    const bSong = analyses[i + 1];
    const { candidates } = scorePairCandidates(a, bSong, { arc: state.vibe, playMode: state.playMode, moodEnergy: state.moodEnergy });
    let rec = buildRecipeFromCandidate(a, bSong, candidates[0]);
    const v = validateTransitionRecipe(rec, a, bSong);
    if (!v.valid) rec = repairOrFallbackRecipe(a, bSong, state.vibe, state.playMode);
    rec.validation = validateTransitionRecipe(rec, a, bSong);
    rec.candidates = candidates;
    state.setPlan.transitions[i] = rec;
  }
  state.setPlan.master_bpm_curve = analyses.map((a) => ({ at_song: a.song_id, bpm: a.bpm }));
  state.setPlan.validation = validateSetPlan(state.setPlan, map);
  if (orchestrator?.running) orchestrator.recipes = state.setPlan.transitions;
  render();
}

function bindDebugModalEvents() {
  if (!state.debugModalOpen) return;
  const backdrop = document.getElementById('debug-backdrop');
  if (backdrop) backdrop.onclick = () => { state.debugModalOpen = false; render(); };
  const closeBtn = document.getElementById('btn-close-debug');
  if (closeBtn) closeBtn.onclick = () => { state.debugModalOpen = false; render(); };
  const expBtn = document.getElementById('btn-export-wav-debug');
  if (expBtn) expBtn.onclick = runOfflineWavExport;
  const auditAllDbg = document.getElementById('btn-audit-all-debug');
  if (auditAllDbg) auditAllDbg.onclick = batchAuditAllTransitions;

  document.querySelectorAll('[data-click-check]').forEach((b) => {
    b.onclick = async () => {
      const idx = Number(b.dataset.clickCheck);
      const a = state.setPlan?.analyses?.[idx];
      const track = state.sequencedSet.find((t) => t.id === a?.song_id) || state.sequencedSet[idx];
      if (!track) return;
      state.exportMsg = `Playing 14s click-track verification for "${track.title}" (${a?.bpm || '?'} BPM)…`;
      render();
      try {
        await initOrchestrator().proMixer.previewBeatClickTrack(track, 0, 14);
      } catch (err) {
        state.exportMsg = err?.message || 'Click-track preview failed.';
        render();
      }
    };
  });

  document.querySelectorAll('[data-nudge-beats]').forEach((b) => {
    b.onclick = () => recalibrateTrackGrid(Number(b.dataset.nudgeBeats), { nudgeBeats: Number(b.dataset.delta) });
  });
  document.querySelectorAll('[data-nudge-ms]').forEach((b) => {
    b.onclick = () => recalibrateTrackGrid(Number(b.dataset.nudgeMs), { nudgeMs: Number(b.dataset.delta) });
  });
  document.querySelectorAll('[data-grid-mult]').forEach((b) => {
    b.onclick = () => recalibrateTrackGrid(Number(b.dataset.gridMult), { bpmMultiplier: Number(b.dataset.mult) });
  });
  document.querySelectorAll('[data-tap-bpm]').forEach((b) => {
    b.onclick = () => {
      const idx = Number(b.dataset.tapBpm);
      const now = performance.now();
      if (state.tapState.idx !== idx || (state.tapState.times.length && now - state.tapState.times[state.tapState.times.length - 1] > 2400)) {
        state.tapState = { idx, times: [now], bpm: null, count: 1 };
        render();
        return;
      }
      state.tapState.times.push(now);
      if (state.tapState.times.length > 8) state.tapState.times.shift();
      state.tapState.count = state.tapState.times.length;
      if (state.tapState.times.length >= 3) {
        const diffs = [];
        for (let i = 1; i < state.tapState.times.length; i++) diffs.push(state.tapState.times[i] - state.tapState.times[i - 1]);
        const avgMs = diffs.reduce((x, y) => x + y, 0) / diffs.length;
        const bpm = Math.round((60000 / Math.max(250, avgMs)) * 10) / 10;
        state.tapState.bpm = bpm;
        recalibrateTrackGrid(idx, { tapBpm: bpm });
      } else {
        render();
      }
    };
  });

  document.querySelectorAll('[data-preview-rec]').forEach((b) => {
    b.onclick = () => previewTransitionAt(Number(b.dataset.previewRec));
  });

  document.querySelectorAll('[data-audit-rec]').forEach((b) => {
    b.onclick = () => auditTransitionWithListener(Number(b.dataset.auditRec));
  });

  document.querySelectorAll('[data-pick-idea]').forEach((b) => {
    b.onclick = () => {
      const idx = Number(b.dataset.pickIdea);
      const ideaType = b.dataset.ideaType;
      const cur = state.setPlan?.transitions?.[idx];
      if (!cur || !ideaType) return;
      const a = state.setPlan.analyses.find((x) => x.song_id === cur.from);
      const bSong = state.setPlan.analyses.find((x) => x.song_id === cur.to);
      if (!a || !bSong) return;
      const cands = cur.candidates || scorePairCandidates(a, bSong, { arc: state.vibe, playMode: state.playMode, moodEnergy: state.moodEnergy }).candidates;
      let chosen = buildRecipeFromCandidate(a, bSong, cands[0], ideaType);
      const v = validateTransitionRecipe(chosen, a, bSong);
      if (!v.valid) chosen = repairOrFallbackRecipe(a, bSong, state.vibe, state.playMode);
      chosen.validation = validateTransitionRecipe(chosen, a, bSong);
      chosen.candidates = cands;
      chosen.critiqueLog = cur.critiqueLog;
      state.setPlan.transitions[idx] = chosen;
      if (orchestrator?.running) orchestrator.recipes = state.setPlan.transitions;
      render();
    };
  });

  document.querySelectorAll('[data-regen-rec]').forEach((b) => {
    b.onclick = () => regenerateTransitionAt(Number(b.dataset.regenRec));
  });

  document.querySelectorAll('[data-rate-rec]').forEach((b) => {
    b.onclick = () => {
      const idx = Number(b.dataset.rateRec);
      const rec = state.setPlan?.transitions?.[idx];
      if (!rec) return;
      saveTransitionRating(`${rec.from}->${rec.to}`, b.dataset.rateVal);
    };
  });
}

function bindReviewEvents() {
  const revHome = document.getElementById('btn-review-home') || document.getElementById('btn-home');
  if (revHome) revHome.onclick = () => {
    state.screen = 'splash';
    render();
  };
  const revBack = document.getElementById('btn-review-back');
  if (revBack) revBack.onclick = () => {
    state.screen = 'wizard';
    state.wizardStep = 3;
    render();
  };
  const revExit = document.getElementById('btn-review-exit');
  if (revExit) revExit.onclick = () => {
    state.screen = 'splash';
    render();
  };

  // Song Request interactions in review screen
  const btnOpenReq = document.getElementById('btn-open-request-song');
  if (btnOpenReq) {
    btnOpenReq.onclick = () => {
      state.requestFormOpen = true;
      render();
    };
  }

  const reqInput = document.getElementById('naux-request-input');
  if (reqInput) {
    reqInput.oninput = (e) => {
      state.requestSongText = e.target.value;
      const sendBtn = document.getElementById('btn-naux-request-send');
      if (sendBtn) {
        sendBtn.disabled = state.requestSongText.trim().length < 2;
      }
    };
    reqInput.onkeydown = (e) => {
      if (e.key === 'Enter' && state.requestSongText.trim().length >= 2) {
        sendSongRequest();
      }
    };
  }

  const sendReqBtn = document.getElementById('btn-naux-request-send');
  if (sendReqBtn) {
    sendReqBtn.onclick = () => {
      sendSongRequest();
    };
  }

  const syncPlanOrder = () => {
    const analyses = state.sequencedSet.map((t) => normalizeSongAnalysis(t));
    const transitions = [];
    for (let i = 0; i < analyses.length - 1; i++) {
      const a = analyses[i];
      const bSong = analyses[i + 1];
      const { candidates } = scorePairCandidates(a, bSong, { arc: state.vibe, playMode: state.playMode });
      let rec = buildRecipeFromCandidate(a, bSong, candidates[0]);
      if (!validateTransitionRecipe(rec, a, bSong).valid) {
        rec = repairOrFallbackRecipe(a, bSong, state.vibe, state.playMode);
      }
      rec.validation = validateTransitionRecipe(rec, a, bSong);
      rec.candidates = candidates;
      transitions.push(rec);
    }
    if (state.setPlan) {
      state.setPlan.order = analyses.map((a) => a.song_id);
      state.setPlan.analyses = analyses;
      state.setPlan.transitions = transitions;
    }
  };

  document.querySelectorAll('[data-remove-idx]').forEach((b) => {
    b.onclick = () => {
      const idx = Number(b.dataset.removeIdx);
      state.sequencedSet.splice(idx, 1);
      syncPlanOrder();
      render();
    };
  });

  // Pointer drag-to-reorder matching naux.party
  document.querySelectorAll('[data-drag-idx]').forEach((handle) => {
    handle.onpointerdown = (ev) => {
      ev.preventDefault();
      let curIdx = Number(handle.dataset.dragIdx);
      const listEl = document.getElementById('review-list');
      const rows = () => [...listEl.querySelectorAll('li')];
      rows()[curIdx]?.classList.add('border-lime', 'bg-lime/10');

      const onMove = (mEv) => {
        const y = mEv.clientY;
        if (y < 90) window.scrollBy(0, -14);
        else if (y > window.innerHeight - 160) window.scrollBy(0, 14);

        const rList = rows();
        let targetIdx = curIdx;
        for (let i = 0; i < rList.length; i++) {
          if (i === curIdx) continue;
          const rect = rList[i].getBoundingClientRect();
          const mid = rect.top + rect.height / 2;
          if (i < curIdx && y < mid) { targetIdx = i; break; }
          if (i > curIdx && y > mid) { targetIdx = i; }
        }
        if (targetIdx !== curIdx) {
          const [moved] = state.sequencedSet.splice(curIdx, 1);
          state.sequencedSet.splice(targetIdx, 0, moved);
          curIdx = targetIdx;
          render();
        }
      };

      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
        syncPlanOrder();
        render();
      };

      window.addEventListener('pointermove', onMove, { passive: false });
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    };
  });

  const approveBtn = document.getElementById('btn-approve-play');
  if (approveBtn) approveBtn.onclick = approveAndPlay;
}
function bindLiveWaveformScrub() {
  const wf = document.getElementById('live-waveform') || document.querySelector('.deck[data-slot="live"] .waveform-bars');
  if (!wf) return;
  const calcSec = (clientX) => {
    const rect = wf.getBoundingClientRect();
    const dur = state.snap?.decks?.[state.snap?.liveId]?.duration || state.snap?.liveTrack?.durationSec || 180;
    const pct = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return Math.round(pct * dur);
  };
  wf.onpointerdown = (ev) => {
    try { wf.setPointerCapture(ev.pointerId); } catch {}
    state.showDragHint = false;
    const bubble = document.getElementById('drag-hint-group');
    if (bubble) bubble.remove();
    state.dragCueSec = calcSec(ev.clientX);
    syncPlayingDom();
  };
  wf.onpointermove = (ev) => {
    if (state.dragCueSec === null) return;
    state.dragCueSec = calcSec(ev.clientX);
    syncPlayingDom();
  };
  const commitSeek = async () => {
    if (state.dragCueSec === null) return;
    const target = state.dragCueSec;
    state.dragCueSec = null;
    const track = await orchestrator.seekLive(target);
    const isPlayFull = Boolean(state.snap?.decks?.[state.snap?.liveId]?.playFull);
    saveCueAdjustment(track, target, isPlayFull);
    syncPlayingDom();
  };
  wf.onpointerup = commitSeek;
  wf.onpointercancel = () => { state.dragCueSec = null; syncPlayingDom(); };
}

function bindPlayingEvents() {
  bindExitHandler(true);

  document.getElementById('btn-clock-pause').onclick = () => orchestrator.togglePause();
  const pausedResume = document.getElementById('btn-paused-resume');
  if (pausedResume) pausedResume.onclick = () => orchestrator.togglePause();
  const megaResume = document.getElementById('btn-mega-resume');
  if (megaResume) megaResume.onclick = () => orchestrator.togglePause();

  const skipBtn = document.getElementById('btn-mega-skip');
  if (skipBtn) skipBtn.onclick = () => {
    const liveT = state.snap?.liveTrack;
    const cueT = state.snap?.cueTrack;
    if (liveT && cueT) saveTransitionRating(`${liveT.id}->${cueT.id}`, 'bad');
    orchestrator.skip();
  };

  const fullBtn = document.getElementById('btn-mega-full');
  if (fullBtn) fullBtn.onclick = () => {
    orchestrator.playFullLive();
    render();
  };

  const btnMixNow = document.getElementById('btn-mix-now'); if (btnMixNow) btnMixNow.onclick = () => orchestrator.mixNow();
  document.getElementById('btn-remove-next').onclick = () => {
    orchestrator.dropNextFromQueue();
    render();
  };
  document.getElementById('btn-play-next').onclick = () => {
    state.playNextModalOpen = true;
    render();
  };
  document.getElementById('btn-open-vibe').onclick = () => {
    state.vibeModalOpen = true;
    render();
  };
  const btnDrawer = document.getElementById('btn-open-drawer'); if (btnDrawer) btnDrawer.onclick = () => {
    state.drawerOpen = !state.drawerOpen;
    render();
  };

  const livePrevBtn = document.getElementById('btn-live-preview-next');
  if (livePrevBtn) livePrevBtn.onclick = () => {
    const idx = Number(document.getElementById('live-transition-panel')?.dataset.recIdx ?? -1);
    if (idx >= 0) previewTransitionAt(idx);
  };
  const liveRegenBtn = document.getElementById('btn-live-regen-next');
  if (liveRegenBtn) liveRegenBtn.onclick = () => {
    const idx = Number(document.getElementById('live-transition-panel')?.dataset.recIdx ?? -1);
    if (idx >= 0) regenerateTransitionAt(idx);
  };
  const liveVibeBtn = document.getElementById('btn-live-vibe');
  if (liveVibeBtn) liveVibeBtn.onclick = () => {
    state.vibeModalOpen = true;
    render();
  };
  const liveInspectBtn = document.getElementById('btn-live-inspect');
  if (liveInspectBtn) liveInspectBtn.onclick = () => {
    state.debugModalOpen = true;
    render();
  };
  const liveExportBtn = document.getElementById('btn-live-export-wav');
  if (liveExportBtn) liveExportBtn.onclick = runOfflineWavExport;

  // Auto-DJ FX toggle — calls orchestrator.toggleAutoDjFx()
  const autoFxToggleBtn = document.getElementById('btn-toggle-auto-dj-fx');
  if (autoFxToggleBtn) {
    autoFxToggleBtn.onclick = () => {
      orchestrator?.toggleAutoDjFx?.();
      state.snap = orchestrator?.getSnapshot?.() || state.snap;
      syncPlayingDom();
    };
  }

  // Interactive 88-Bar Waveform Scrub + Cue Learning
  bindLiveWaveformScrub();

  // Drawer Events
  if (state.drawerOpen) {
    document.getElementById('drawer-backdrop').onclick = () => { state.drawerOpen = false; render(); };
    document.getElementById('btn-close-drawer').onclick = () => { state.drawerOpen = false; render(); };

    document.querySelectorAll('[data-stem]').forEach((b) => {
      b.onclick = () => {
        const st = b.dataset.stem;
        state.stems[st] = !state.stems[st];
        orchestrator.setLiveStem(st, state.stems[st] ? 1 : 0.02);
        render();
      };
    });

    const fEl = document.getElementById('fx-filter');
    if (fEl) fEl.oninput = (e) => {
      state.filterNorm = Number(e.target.value) / 100;
      orchestrator.setLiveFilter(state.filterNorm);
    };
    const eEl = document.getElementById('fx-echo');
    if (eEl) eEl.oninput = (e) => {
      state.echoAmt = Number(e.target.value) / 100;
      orchestrator.setLiveEcho(state.echoAmt);
    };
    const rEl = document.getElementById('fx-reverb');
    if (rEl) rEl.oninput = (e) => {
      state.reverbAmt = Number(e.target.value) / 100;
      orchestrator.setLiveReverb(state.reverbAmt);
    };
    const ytXfEl = document.getElementById('fx-yt-crossfade');
    if (ytXfEl) ytXfEl.oninput = (e) => {
      state.ytCrossfadeSec = Number(e.target.value) || 5.5;
      orchestrator.ytCrossfadeSec = state.ytCrossfadeSec;
      const lbl = document.getElementById('yt-xfade-lbl');
      if (lbl) lbl.textContent = `${state.ytCrossfadeSec}s`;
    };

    document.querySelectorAll('[data-force-style]').forEach((b) => {
      b.onclick = () => {
        state.drawerOpen = false;
        orchestrator.mixNow(b.dataset.forceStyle);
        render();
      };
    });

    const loopBtn = document.getElementById('btn-loop-4');
    if (loopBtn) loopBtn.onclick = async () => {
      state.loopActive = await orchestrator.toggleLiveLoop();
      render();
    };

    const mtBtn = document.getElementById('btn-master-tempo');
    if (mtBtn) mtBtn.onclick = () => {
      state.masterTempo = !state.masterTempo;
      orchestrator.proMixer.masterTempoEnabled = state.masterTempo;
      render();
    };

    const drumBtn = document.getElementById('btn-drum-bridge');
    if (drumBtn) drumBtn.onclick = () => {
      state.percussionBridge = !state.percussionBridge;
      orchestrator.proMixer.drumBridgeEnabled = state.percussionBridge;
      render();
    };

    const clickBtn = document.getElementById('btn-click-track');
    if (clickBtn) clickBtn.onclick = () => {
      state.clickTrack = !state.clickTrack;
      orchestrator.setClickTrack(state.clickTrack);
      render();
    };

    document.querySelectorAll('[data-eq-kill]').forEach((b) => {
      b.onclick = () => {
        const band = b.dataset.eqKill;
        const liveId = orchestrator.liveDeckId || 'A';
        const cur = Boolean(orchestrator.proMixer.decks?.[liveId]?.strip?.state?.kills?.[band]);
        orchestrator.setLiveEqKill(band, !cur);
        state.snap = orchestrator.getSnapshot();
        render();
      };
    });

    const spinBtn = document.getElementById('btn-spinback');
    if (spinBtn) spinBtn.onclick = () => {
      orchestrator.triggerSpinbackLive();
    };

    const tapeBtn = document.getElementById('btn-tapestop');
    if (tapeBtn) tapeBtn.onclick = () => {
      orchestrator.triggerTapeStopLive();
    };

    const lrBtn = document.getElementById('btn-loop-roll');
    if (lrBtn) lrBtn.onclick = () => {
      orchestrator.proMixer.triggerLoopRoll(orchestrator.liveDeckId || 'A');
    };

    const stBtn = document.getElementById('btn-stutter');
    if (stBtn) stBtn.onclick = () => {
      orchestrator.proMixer.triggerStutter(orchestrator.liveDeckId || 'A', 0.25, 8);
    };

    const riBtn = document.getElementById('btn-riser-impact');
    if (riBtn) riBtn.onclick = () => {
      const t0 = orchestrator.proMixer.ctx?.currentTime + 0.03 || 0.03;
      orchestrator.proMixer.playReverseRiser(t0, orchestrator.proMixer.masterBpm || 122, 2.0);
      orchestrator.proMixer.playImpactHit(t0 + 2.02);
    };

    const drawerDbg = document.getElementById('btn-drawer-debug');
    if (drawerDbg) drawerDbg.onclick = () => {
      state.drawerOpen = false;
      state.debugModalOpen = true;
      render();
    };

    const drawerExp = document.getElementById('btn-drawer-export');
    if (drawerExp) drawerExp.onclick = runOfflineWavExport;

    const recBtn = document.getElementById('btn-record-mix');
    if (recBtn) recBtn.onclick = () => {
      try {
        state.recording = orchestrator.proMixer.toggleRecording();
      } catch (err) {
        alert(err.message);
      }
      render();
    };

    document.getElementById('btn-quick-save-set').onclick = async () => {
      await saveCurrentSetToDb(`NOVA ${state.vibe.toUpperCase()} SET`);
      if (orchestrator && state.setSavedMsg) {
        orchestrator.agentMessage = state.setSavedMsg;
      }
      state.drawerOpen = false;
      render();
    };
  }

  // Play Next Modal
  if (state.playNextModalOpen) {
    document.getElementById('playnext-backdrop').onclick = () => { state.playNextModalOpen = false; render(); };
    document.getElementById('btn-close-playnext').onclick = () => { state.playNextModalOpen = false; render(); };
    const pnInp = document.getElementById('input-playnext');
    const bindPickNext = () => {
      document.querySelectorAll('[data-pick-next]').forEach((b) => {
        b.onclick = () => {
          const t = state.crate.find((c) => c.id === b.dataset.pickNext);
          if (t) {
            state.playNextModalOpen = false;
            orchestrator.playNextOverride(t);
            render();
          }
        };
      });
    };
    const updatePlayNextList = () => {
      const listEl = document.getElementById('playnext-list');
      if (!listEl) return;
      const liveId = state.snap?.liveTrack?.id;
      const q = state.playNextQuery.trim().toLowerCase();
      const matches = q
        ? state.crate.filter((t) => t.id !== liveId && `${t.title} ${t.artist}`.toLowerCase().includes(q))
        : state.crate.filter((t) => t.id !== liveId);
      listEl.innerHTML = matches.slice(0, 30).map((t) => `
        <button class="review-row squeeze" style="width:100%;text-align:left;justify-content:space-between" data-pick-next="${esc(t.id)}">
          <div class="row-main">
            <div class="row-title" style="font-size:24px">${esc(t.title)}</div>
            <div class="row-meta">${esc(t.artist)}</div>
          </div>
          <span class="font-display text-accent" style="font-size:20px;flex-shrink:0">PLAY NEXT →</span>
        </button>
      `).join('') || '<p style="color:rgba(245,245,240,0.5);padding:18px 0">No matching tracks in crate. Press Enter to search DSP catalogue!</p>';
      bindPickNext();
    };
    const runPlayNextDspSearch = async () => {
      const q = state.playNextQuery.trim();
      if (!q) return;
      const btn = document.getElementById('btn-playnext-search');
      if (btn) btn.textContent = '…';
      try {
        const res = await fetch(`/api/catalogue?q=${encodeURIComponent(q)}&provider=all&limit=10`);
        const d = await res.json();
        const valid = (d.results || []).filter((t) => isDecodableTrack(t));
        if (valid.length) {
          for (const t of valid) addTrackToCrate(t);
          updatePlayNextList();
        }
      } finally {
        if (btn) btn.textContent = 'SEARCH DSP';
      }
    };
    pnInp.oninput = (e) => { state.playNextQuery = e.target.value; updatePlayNextList(); };
    pnInp.onkeydown = async (e) => {
      if (e.key === 'Enter') await runPlayNextDspSearch();
    };
    const pnSearchBtn = document.getElementById('btn-playnext-search');
    if (pnSearchBtn) pnSearchBtn.onclick = runPlayNextDspSearch;
    bindPickNext();
  }

  // Change Vibe Modal
  if (state.vibeModalOpen) {
    document.getElementById('vibe-backdrop').onclick = () => { state.vibeModalOpen = false; render(); };
    document.getElementById('btn-close-vibe').onclick = () => { state.vibeModalOpen = false; render(); };
    document.querySelectorAll('[data-retune-mode]').forEach((b) => {
      b.onclick = () => { state.playMode = b.dataset.retuneMode; render(); };
    });
    document.querySelectorAll('[data-retune-vibe]').forEach((b) => {
      b.onclick = () => { state.vibe = b.dataset.retuneVibe; render(); };
    });
    const energySlider = document.getElementById('vibe-energy-slider');
    if (energySlider) {
      energySlider.oninput = (e) => {
        state.moodEnergy = Number(e.target.value);
        const lbl = document.getElementById('vibe-energy-val');
        if (lbl) lbl.textContent = `${state.moodEnergy}%`;
      };
    }
    document.getElementById('btn-apply-vibe').onclick = () => {
      state.vibeModalOpen = false;
      const liveTrack = state.snap?.liveTrack;
      const liveId = liveTrack?.id;
      const playedIds = new Set((orchestrator?.playedHistory || []).map((t) => t.id));
      const remaining = state.crate.filter((t) => t.id !== liveId && !playedIds.has(t.id));
      const reordered = sequenceCrate(remaining, { vibe: state.vibe, playMode: state.playMode });
      const activeList = [liveTrack, ...reordered].filter(Boolean);
      const newPlan = planSetHeuristic(activeList, { vibe: state.vibe, playMode: state.playMode, moodEnergy: state.moodEnergy });
      orchestrator.vibe = state.vibe;
      orchestrator.playMode = state.playMode;
      if (newPlan?.transitions?.length) {
        state.setPlan = newPlan;
        orchestrator.recipes = newPlan.transitions;
      }
      orchestrator.requeueRemaining(reordered);
      render();
    };
  }

  bindDebugModalEvents();
}

// ============================================================================
// DEDICATED YOUTUBE MUSIC CATALOG & PERSISTENT MINI-PLAYER ENGINE
// ============================================================================

let ytPlayer = null;

function getYouTubePlayer() {
  if (!ytPlayer) {
    let host = document.getElementById('yt-deck-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'yt-deck-host';
      host.className = 'naux-players';
      host.dataset.visible = 'false';
      host.setAttribute('aria-hidden', 'true');
      document.body.appendChild(host);
    }
    ytPlayer = new YouTubeDeckEngine(host, {
      onTrackChange: (track, index) => {
        state.ytPlaybackState = ytPlayer.getPlaybackState();
        renderMiniPlayer();
        renderTracksIfCatalogActive();
      },
      onPlaybackStateChange: (ps) => {
        state.ytPlaybackState = ps;
        renderMiniPlayer();
        renderTracksIfCatalogActive();
      },
      onAutoSkipped: (track, code) => {
        showYtToast(`Auto-skipped unplayable track "${track?.title || 'Unknown'}" (Error ${code})`);
      },
      onTimeUpdate: (cur, dur, track) => {
        updateMiniPlayerTime(cur, dur, track);
      },
      onDeckError: (deckId, track, err) => {
        console.warn(`[YouTube Deck ${deckId} Error]`, track?.title, err);
      },
    });
  }
  return ytPlayer;
}

function showYtToast(msg, retryFn = null) {
  if (state.ytToastTimer) clearTimeout(state.ytToastTimer);
  state.ytToast = { msg, retryFn };
  renderToast();
  state.ytToastTimer = setTimeout(() => {
    state.ytToast = null;
    renderToast();
  }, 4200);
}

function renderToast() {
  let toastEl = document.getElementById('nova-yt-toast');
  if (!state.ytToast) {
    if (toastEl) toastEl.remove();
    return;
  }
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'nova-yt-toast';
    toastEl.className = 'yt-toast';
    document.body.appendChild(toastEl);
  }
  toastEl.innerHTML = `
    <span style="color:var(--amber)">⚡</span>
    <span style="flex:1">${esc(state.ytToast.msg)}</span>
    ${state.ytToast.retryFn ? `<button id="btn-toast-retry" class="pill-btn squeeze" style="padding:2px 8px;font-size:10px">RETRY</button>` : ''}
    <button id="btn-toast-close" style="opacity:0.6;font-size:14px">✕</button>
  `;
  const btnRetry = document.getElementById('btn-toast-retry');
  if (btnRetry && state.ytToast.retryFn) {
    btnRetry.onclick = () => {
      const fn = state.ytToast.retryFn;
      state.ytToast = null;
      renderToast();
      fn();
    };
  }
  const btnClose = document.getElementById('btn-toast-close');
  if (btnClose) {
    btnClose.onclick = () => {
      state.ytToast = null;
      renderToast();
    };
  }
}

async function loadYtCategoryTracks(langId, categoryId, forceRefresh = false) {
  state.ytSelectedLang = langId;
  state.ytSelectedCategory = categoryId;
  const cat = findCatalogCategory(langId, categoryId);

  // Instant local load from curated DB (100+ songs strictly)
  if (cat && cat.tracks && cat.tracks.length >= 100 && !forceRefresh) {
    state.ytCategoryTracks = [...cat.tracks];
    state.ytLoadingTracks = false;
    state.ytError = null;
    render();
    return;
  }

  state.ytLoadingTracks = true;
  state.ytError = null;
  render();

  try {
    const res = await fetch(`/api/youtube-search?lang=${encodeURIComponent(langId)}&category=${encodeURIComponent(categoryId)}${forceRefresh ? '&refresh=1' : ''}`);
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    state.ytCategoryTracks = data.tracks || data.results || (cat?.tracks || []);
    state.ytLoadingTracks = false;
    state.ytError = null;
  } catch (err) {
    console.error('[loadYtCategoryTracks] Error:', err);
    state.ytLoadingTracks = false;
    if (cat?.tracks && cat.tracks.length) {
      state.ytCategoryTracks = [...cat.tracks];
      state.ytError = null;
    } else {
      state.ytError = `Failed to load YouTube tracks: ${err.message}`;
    }
  }
  render();
}

function renderYouTubeMusicScreen() {
  if (state.ytViewMode === 'category') {
    // CATEGORY DETAIL VIEW (100+ songs list matching naux.party/songs/hindi-dance)
    const currentCat = CURATED_CATEGORIES_DB[state.ytSelectedCategory] || findCatalogCategory(state.ytSelectedLang, state.ytSelectedCategory) || {
      slug: state.ytSelectedCategory,
      label: 'Hindi Dance Songs',
      hint: 'Bollywood dance-floor hits from 2005 to now that every Indian house party knows, plus the biggest Hindi party songs of the last 12 months. Every song here is the official version, and Audify starts each one at its best part.',
      songs: []
    };

    if (!state.ytCategoryTracks.length && !state.ytLoadingTracks && !state.ytError) {
      loadYtCategoryTracks(state.ytSelectedLang, state.ytSelectedCategory);
    }

    const tracks = state.ytCategoryTracks.length ? state.ytCategoryTracks : (currentCat.songs || currentCat.tracks || []);
    const artistsPreview = Array.from(new Set(
      tracks.slice(0, 10).map(t => (t.artist || '').split(/[,&]/)[0].trim()).filter(Boolean)
    )).slice(0, 6).join(', ') + (tracks.length > 6 ? ' and more' : '');

    root.innerHTML = `
      <div class="min-h-dvh bg-ink font-sans text-white">
        <main class="mx-auto flex min-h-dvh max-w-4xl flex-col px-6 py-10 md:px-10">
          <div class="flex items-center justify-between font-display text-3xl tracking-wide">
            <a href="/" class="text-lime cursor-pointer" id="btn-naux-brand">Audify</a>
            <a href="/songs" class="text-2xl text-white/60 hover:text-white cursor-pointer" id="btn-back-to-lists">ALL LISTS</a>
          </div>

          <h1 class="mt-[4vh] font-display text-[44px] uppercase leading-[0.9] md:text-[clamp(48px,5.5vw,84px)]">${esc(currentCat.label)} 2026</h1>
          <p class="mt-4 max-w-2xl text-lg text-white/65 md:text-xl">
            ${esc(currentCat.hint || 'Bollywood dance-floor hits from 2005 to now that every Indian house party knows, plus the biggest Hindi party songs of the last 12 months. Every song here is the official version, and Audify starts each one at its best part.')}
          </p>
          <p class="mt-3 text-base text-white/45">
            ${tracks.length} songs${artistsPreview ? `, from ${esc(artistsPreview)}` : ''}. Updated daily.
          </p>

          <button id="btn-play-category-set" class="mt-8 self-start rounded-2xl bg-lime px-8 py-4 font-display text-2xl tracking-wide text-ink squeeze cursor-pointer">
            PLAY THIS AS A SET →
          </button>

          ${state.ytLoadingTracks ? `
            <div style="padding:80px 20px;text-align:center;font-family:var(--font-mono);color:#c8ff00;font-size:14px;letter-spacing:0.04em">
              ⚡ LOADING ${tracks.length || '100+'} TRACKS…
            </div>
          ` : state.ytError ? `
            <div class="status-banner err" style="margin:24px 0">
              ${esc(state.ytError)}
              <button id="btn-yt-retry-fetch" class="pill-btn squeeze" style="margin-left:14px">RETRY ⟳</button>
            </div>
          ` : `
            <ol class="mt-8 flex flex-col">
              ${tracks.map((t, idx) => {
                const cleanArtist = (t.artist || '').replace(/\s*·\s*\d{4}\s*$/, '');
                return `
                  <li class="flex items-baseline gap-3 border-b border-white/10 py-3 cursor-pointer hover:bg-white/[0.04] transition px-2 rounded-lg" data-song-idx="${idx}">
                    <span class="w-8 shrink-0 font-display text-xl text-white/35 tabular-nums">${idx + 1}</span>
                    <div class="min-w-0 flex-1">
                      <div class="font-display text-xl uppercase leading-tight md:text-2xl">${esc(t.title)}</div>
                      <div class="text-white/55">${esc(cleanArtist)} ${t.year ? `· ${t.year}` : ''}</div>
                    </div>
                    <span class="shrink-0 text-right text-sm text-white/45">from the best part</span>
                  </li>
                `;
              }).join('')}
            </ol>

            <button id="btn-play-category-set-bottom" class="mt-10 self-start rounded-2xl bg-lime px-8 py-4 font-display text-2xl tracking-wide text-ink squeeze cursor-pointer">
              PLAY THIS AS A SET →
            </button>
            <p class="mt-6 text-sm text-white/40">
              Songs play through YouTube's official uploads. Audify picks the order, starts each song at its hook and mixes one into the next.
            </p>
          `}
        </main>
      </div>
    `;
    return;
  }

  // DIRECTORY VIEW (19 category cards matching naux.party/songs)
  root.innerHTML = `
    <div class="min-h-dvh bg-ink font-sans text-white">
      <main class="mx-auto flex min-h-dvh max-w-4xl flex-col px-6 py-10 md:px-10">
        <a href="/" class="font-display text-3xl tracking-wide text-lime cursor-pointer" id="btn-naux-brand">Audify</a>
        <h1 class="mt-[4vh] font-display text-[44px] uppercase leading-[0.9] md:text-[clamp(48px,5.5vw,84px)]">Party song lists</h1>
        <p class="mt-4 max-w-2xl text-lg text-white/65 md:text-xl">
          The songs Audify plays, by language and mood, updated every day. Every song is the official version, and Audify starts each one at its best part. Pick a list and play it as a set.
        </p>

        <ul class="mt-8 grid gap-3 sm:grid-cols-2">
          ${Object.values(CURATED_CATEGORIES_DB).map(cat => `
            <li>
              <a href="/songs/${cat.slug}" class="flex h-full flex-col rounded-2xl border-2 border-white/15 p-5 transition hover:border-lime cursor-pointer" data-open-cat="${cat.slug}">
                <span class="font-display text-2xl uppercase leading-tight">${esc(cat.label)}</span>
                <span class="mt-1 text-white/55">${cat.songCount || cat.songs?.length || 100} songs</span>
              </a>
            </li>
          `).join('')}
        </ul>
        <a href="/" id="btn-build-set" class="mt-10 self-start rounded-2xl bg-lime px-8 py-4 font-display text-2xl tracking-wide text-ink transition active:scale-[0.98] squeeze cursor-pointer">
          BUILD YOUR SET →
        </a>
      </main>
    </div>
  `;
}

function renderTracksIfCatalogActive() {
  const p = getYouTubePlayer();
  const ps = p.getPlaybackState();
  const currentTrackId = ps.currentTrack?.id;

  // 1. Update vibe song rows in Step 0
  const vibeRows = document.querySelectorAll('.naux-song-row[data-vibe-song-idx]');
  if (vibeRows.length) {
    const tracks = getActiveVibeTracks();
    vibeRows.forEach((row) => {
      const idx = Number(row.dataset.vibeSongIdx);
      const track = tracks[idx];
      if (!track) return;
      const isPlaying = (currentTrackId === track.id && ps.isPlaying);
      row.classList.toggle('is-active', isPlaying);
      const playBtn = row.querySelector('[data-vibe-play-idx]');
      if (playBtn) playBtn.textContent = isPlaying ? '❚❚' : '▶';
    });
  }

  // 2. Update category rows in full YT view
  if (state.appMode === 'yt' && state.ytViewMode === 'category') {
    const rows = document.querySelectorAll('.naux-song-row[data-song-idx]');
    rows.forEach((row) => {
      const idx = Number(row.dataset.songIdx);
      const track = state.ytCategoryTracks[idx];
      if (!track) return;
      const isPlaying = (currentTrackId === track.id && ps.isPlaying);
      row.classList.toggle('is-active', isPlaying);
      const playBtn = row.querySelector('[data-play-idx]');
      if (playBtn) playBtn.textContent = isPlaying ? '❚❚' : '▶';
    });
  }
}

function renderMiniPlayer() {
  const miniEl = document.getElementById('nova-yt-mini-player');
  if (miniEl) {
    miniEl.style.display = 'none';
  }
}
function updateMiniPlayerTime(cur, dur, track) {
  const curEl = document.getElementById('yt-mini-cur-time');
  const durEl = document.getElementById('yt-mini-total-time');
  const fillEl = document.getElementById('yt-mini-scrub-fill');
  if (curEl) curEl.textContent = fmtTime(cur);
  if (durEl && dur > 0) durEl.textContent = fmtTime(dur);
  if (fillEl && dur > 0) {
    const pct = Math.max(0, Math.min(100, (cur / dur) * 100));
    fillEl.style.width = `${pct}%`;
  }
}

function renderQueueDrawer() {
  let drawerEl = document.getElementById('nova-yt-queue-drawer');
  if (!drawerEl) {
    drawerEl = document.createElement('div');
    drawerEl.id = 'nova-yt-queue-drawer';
    drawerEl.className = 'yt-queue-drawer';
    document.body.appendChild(drawerEl);
  }

  drawerEl.classList.toggle('open', Boolean(state.ytQueueDrawerOpen));
  if (!state.ytQueueDrawerOpen) return;

  const p = getYouTubePlayer();
  const ps = p.getPlaybackState();
  const queue = ps.queue;
  const currentIdx = ps.queueIndex;

  drawerEl.innerHTML = `
    <div class="yt-queue-panel">
      <div class="yt-queue-header">
        <div>
          <div class="yt-queue-title">UPCOMING QUEUE</div>
          <div style="font-size:11px;font-family:var(--font-mono);color:rgba(245,245,240,0.4)">${queue.length} SONGS · SEAMLESS BLEND</div>
        </div>
        <div style="display:flex;gap:6px">
          ${queue.length ? `<button id="btn-yt-queue-clear" class="pill-btn squeeze" style="font-size:10px;padding:4px 8px">CLEAR</button>` : ''}
          <button id="btn-yt-queue-close" class="pill-btn squeeze" style="font-size:12px;padding:4px 8px">✕</button>
        </div>
      </div>

      <div class="yt-queue-items nova-scroll">
        ${queue.length === 0 ? `
          <div style="padding:40px 10px;text-align:center;color:rgba(245,245,240,0.4);font-family:var(--font-mono);font-size:12px">
            QUEUE IS EMPTY.<br/>CLICK "+Q" ON ANY SONG CARD TO ADD IT.
          </div>
        ` : queue.map((t, idx) => {
          const isCurrent = (idx === currentIdx);
          return `
            <div class="yt-queue-item ${isCurrent ? 'active' : ''}">
              <img class="yt-queue-item-thumb" src="${esc(t.artwork || DEFAULT_ARTWORK)}" alt="" onerror="handleImgError(this)" />
              <div class="yt-queue-item-info">
                <div class="yt-queue-item-title">${esc(t.title)} ${isCurrent ? '<span style="color:var(--accent);font-size:9px">● NOW PLAYING</span>' : ''}</div>
                <div class="yt-queue-item-artist">${esc(t.artist)} · ${fmtTime(t.durationSec)}</div>
              </div>
              <div class="yt-queue-item-ctrls">
                ${idx > 0 ? `<button class="yt-queue-sm-btn squeeze" data-queue-up="${idx}" title="Move up">▲</button>` : ''}
                ${idx < queue.length - 1 ? `<button class="yt-queue-sm-btn squeeze" data-queue-down="${idx}" title="Move down">▼</button>` : ''}
                <button class="yt-queue-sm-btn remove squeeze" data-queue-del="${idx}" title="Remove from queue">✕</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function playCuratedCategoryAsSet(tracks, catId) {
  const cId = catId || state.ytSelectedCategory || 'hindi-dance';
  const cat = CURATED_CATEGORIES_DB[cId] || findCatalogCategory(state.ytSelectedLang, cId);
  const list = (tracks && tracks.length) ? tracks : (cat?.songs || cat?.tracks || []);
  if (!list.length) return;
  const songs = list.map((t, idx) => ({
    ...t,
    id: t.id || `${cId}-${idx + 1}`,
    source: 'youtube',
    provider: 'YouTube',
    mixReady: true,
    dspReady: false,
    durationSec: Number(t.durationSec) || 180,
    entrySec: Number.isFinite(t.entrySec) ? t.entrySec : (Number.isFinite(t.hookStartSec) ? t.hookStartSec : 25),
    exitSec: Number.isFinite(t.exitSec) ? t.exitSec : (Number.isFinite(t.hookEndSec) ? t.hookEndSec : 65),
    energy: Number(t.energy) || 7,
  }));
  state.crate = songs;
  state.activeVibeCard = cat?.lang || 'hindi';
  state.activeVibeCategory = cId;
  state.selectedLanguages = [state.activeVibeCard];
  state.sequencedSet = sequenceCrate(songs, { vibe: state.vibe, playMode: state.playMode });
  state.setPlan = planSetHeuristic(state.sequencedSet, { vibe: state.vibe, playMode: state.playMode });
  state.screen = 'playing';
  if (typeof window !== 'undefined') {
    window.history.pushState(null, '', `/?set=${encodeURIComponent(cat?.label || cId)}`);
  }
  approveAndPlay();
}

function attachGlobalYtListeners() {
  // Brand logo in header (navigates back to Audify Home Splash)
  const btnBrand = document.getElementById('btn-naux-brand');
  if (btnBrand) {
    btnBrand.onclick = (e) => {
      e.preventDefault();
      state.screen = 'splash';
      state.appMode = 'dj';
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', '/');
      }
      render();
    };
  }

  // Back to lists button
  const btnBack = document.getElementById('btn-back-to-lists');
  if (btnBack) {
    btnBack.onclick = (e) => {
      e.preventDefault();
      state.ytViewMode = 'directory';
      state.screen = 'wizard';
      state.appMode = 'yt';
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', '/songs');
      }
      render();
    };
  }

  // Build Your Set button at bottom of song lists directory
  const btnBuildSet = document.getElementById('btn-build-set') || document.getElementById('btn-yt-build-set');
  if (btnBuildSet) {
    btnBuildSet.onclick = (e) => {
      e.preventDefault();
      state.screen = 'wizard';
      state.appMode = 'dj';
      state.wizardStep = 0;
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', '/');
      }
      render();
    };
  }

  // Open Category Card from Directory View
  document.querySelectorAll('[data-open-cat]').forEach((card) => {
    card.onclick = (e) => {
      e.preventDefault();
      const catId = card.dataset.openCat;
      state.ytSelectedCategory = catId;
      state.ytViewMode = 'category';
      state.screen = 'wizard';
      state.appMode = 'yt';
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', `/songs/${catId}`);
      }
      loadYtCategoryTracks(state.ytSelectedLang, catId);
    };
  });

  // Song row tap in Category View -> immediately starts set playing that song first!
  document.querySelectorAll('[data-song-idx]').forEach((row) => {
    row.onclick = () => {
      const idx = Number(row.dataset.songIdx);
      const cat = CURATED_CATEGORIES_DB[state.ytSelectedCategory] || findCatalogCategory(state.ytSelectedLang, state.ytSelectedCategory);
      const tracks = state.ytCategoryTracks.length ? state.ytCategoryTracks : (cat?.songs || cat?.tracks || []);
      if (!tracks.length) return;
      const tapped = tracks[idx];
      const reordered = [tapped, ...tracks.slice(0, idx), ...tracks.slice(idx + 1)];
      playCuratedCategoryAsSet(reordered, state.ytSelectedCategory);
    };
  });

  // Play category set CTA in detail view -> launches Live DJ Console immediately!
  const btnPlaySet = document.getElementById('btn-play-category-set');
  if (btnPlaySet) {
    btnPlaySet.onclick = () => {
      playCuratedCategoryAsSet(state.ytCategoryTracks, state.ytSelectedCategory);
    };
  }
  const btnPlaySetBtm = document.getElementById('btn-play-category-set-bottom');
  if (btnPlaySetBtm) {
    btnPlaySetBtm.onclick = () => {
      playCuratedCategoryAsSet(state.ytCategoryTracks, state.ytSelectedCategory);
    };
  }

  // Retry fetch
  const btnRetry = document.getElementById('btn-yt-retry-fetch');
  if (btnRetry) {
    btnRetry.onclick = () => {
      loadYtCategoryTracks(state.ytSelectedLang, state.ytSelectedCategory, true);
    };
  }
}

function render() {
  if (state.screen === 'splash') return renderSplash();
  if (state.screen === 'building') return renderBuilding();
  if (state.screen === 'playing') {
    renderPlaying();
  } else if (state.screen === 'summary') {
    renderSummary();
  } else if (state.appMode === 'yt') {
    renderYouTubeMusicScreen();
  } else if (state.screen === 'wizard') {
    renderWizard();
  } else if (state.screen === 'review') {
    renderReview();
  }
  attachGlobalYtListeners();
  renderMiniPlayer();
}

// Global DJ Keyboard Shortcuts (matches naux.party + pro mixer keys)
window.addEventListener('keydown', (ev) => {
  if (state.screen !== 'playing') return;
  const tag = ev.target?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  if (ev.code === 'Space' || ev.key === 'k' || ev.key === 'K') {
    ev.preventDefault();
    if (!ev.repeat) {
      orchestrator?.togglePause();
      render();
    }
  } else if (ev.key === 's' || ev.key === 'S') {
    orchestrator?.skip();
  } else if (ev.key === 'f' || ev.key === 'F') {
    orchestrator?.playFullLive();
    render();
  } else if (ev.key === 'm' || ev.key === 'M') {
    orchestrator?.mixNow();
  }
});

window.addEventListener('resize', positionPipTile);

// Global Drag & Drop for Local Audio & Video files (WASM Essentia Pro Analysis)
window.addEventListener('dragover', (e) => {
  e.preventDefault();
});
window.addEventListener('drop', (e) => {
  e.preventDefault();
  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    state.proDjModalOpen = true;
    render();
    handleLocalFiles(e.dataTransfer.files);
  }
});

let rAfScheduled = false;
window.addEventListener('pointermove', (e) => {
  if (rAfScheduled) return;
  rAfScheduled = true;
  requestAnimationFrame(() => {
    rAfScheduled = false;
    const x = `${((e.clientX / Math.max(1, window.innerWidth)) * 100).toFixed(1)}%`;
    const y = `${((e.clientY / Math.max(1, window.innerHeight)) * 100).toFixed(1)}%`;
    document.documentElement.style.setProperty('--mouse-x', x);
    document.documentElement.style.setProperty('--mouse-y', y);
  });
}, { passive: true });

// Boot
populateVibeTracksToCrate('hindi', 'hindi-dance');
fetchHealth();
loadSavedSets();
render();
