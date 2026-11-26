// ============================================================================
// Audify Official Google Sign-In & Account Chooser + Per-Account Liked Songs
// React-Safe Portal Architecture (attached to document.body, zero DOM conflicts)
// ============================================================================

(function initAudifyLikes() {
  if (typeof window === 'undefined') return;
  if (window.__audify_likes_initialized) return;
  window.__audify_likes_initialized = true;

  const SESSION_KEY = 'audify.guestSessionId';
  const LIKES_PREFIX = 'audify.liked.';
  const ACCOUNTS_CACHE_KEY = 'audify.google_accounts_cache';

  const GOOGLE_SVG = `<svg class="audify-google-logo" viewBox="0 0 48 48" width="32" height="32" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>`;

  const PERSON_PLUS_SVG = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;

  const CHECK_SVG = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;

  const AVATAR_COLORS = ['#1a73e8', '#e37400', '#0f9d58', '#a142f4', '#d93025', '#0097a7'];

  let state = {
    user: null,
    accounts: [],
    selectedAccountId: null,
    oauthConfigured: false,
    googleClientId: null,
    likes: [],
    currentSong: null,
    modalOpen: false,
    chooserOpen: false,
    addingAccount: false,
    lastSig: '',
  };

  function getGuestSessionId() {
    try {
      let sid = localStorage.getItem(SESSION_KEY);
      if (!sid) {
        sid = 'g_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
        localStorage.setItem(SESSION_KEY, sid);
      }
      return sid;
    } catch {
      return 'anon';
    }
  }

  function getCachedAccounts() {
    try {
      const raw = localStorage.getItem(ACCOUNTS_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch {}
    return [
      {
        id: 'google_user_default',
        name: 'Vedant Sharma',
        email: 'vedant.sharma@gmail.com',
        picture: null,
        provider: 'google',
      },
      {
        id: 'google_user_aux',
        name: 'Audify Host',
        email: 'audify.dj.host@gmail.com',
        picture: null,
        provider: 'google',
      },
    ];
  }

  function saveCachedAccounts(accounts) {
    try {
      if (Array.isArray(accounts) && accounts.length) {
        localStorage.setItem(ACCOUNTS_CACHE_KEY, JSON.stringify(accounts.slice(0, 8)));
      }
    } catch {}
  }

  function storageKey(user) {
    return LIKES_PREFIX + (user?.id ? `google_${user.id}` : 'guest');
  }

  function readLocalLikes(user) {
    try {
      const raw = localStorage.getItem(storageKey(user));
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writeLocalLikes(user, likes) {
    try {
      localStorage.setItem(storageKey(user), JSON.stringify((likes || []).slice(0, 300)));
    } catch {}
  }

  function songKeyOf(track) {
    if (!track) return '';
    return String(track.song_id || track.id || (Array.isArray(track.youtube_ids) && track.youtube_ids[0]) || track.videoId || '').trim();
  }

  function isTrackLiked(track) {
    const key = songKeyOf(track);
    if (!key) return false;
    const yt = Array.isArray(track.youtube_ids) && track.youtube_ids[0] ? String(track.youtube_ids[0]) : String(track.videoId || '');
    return state.likes.some((t) => {
      const tk = songKeyOf(t);
      const tyt = Array.isArray(t.youtube_ids) && t.youtube_ids[0] ? String(t.youtube_ids[0]) : '';
      return tk === key || (yt && tyt && yt === tyt);
    });
  }

  function getLiveCue() {
    try {
      const deck = window.__nauxEngine?.liveDeck?.();
      if (deck?.cue) return deck.cue;
    } catch {}
    return state.currentSong;
  }

  function isSplashScreen() {
    try {
      return Boolean(document.querySelector('.splash-line'));
    } catch {
      return false;
    }
  }

  function isPlayerActive() {
    try {
      return Boolean(window.__nauxEngine?.started && !window.__nauxEngine?.finished && document.querySelector('.deck[data-slot="live"]'));
    } catch {
      return false;
    }
  }

  function showToast(msg) {
    let el = document.getElementById('audify-likes-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'audify-likes-toast';
      el.className = 'audify-likes-toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(el._t);
    el._t = setTimeout(() => {
      el.classList.remove('is-visible');
    }, 3200);
  }

  async function syncGuestLikesToAccount() {
    const guestLikes = readLocalLikes(null);
    if (!state.user || !guestLikes.length) return;
    const sid = getGuestSessionId();
    try {
      const syncRes = await fetch(`/api/likes?sessionId=${encodeURIComponent(sid)}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'sync', tracks: guestLikes }),
      });
      if (syncRes.ok) {
        const d = await syncRes.json();
        if (Array.isArray(d.likes)) {
          state.likes = d.likes;
          writeLocalLikes(state.user, d.likes);
          try { localStorage.removeItem(storageKey(null)); } catch {}
        }
      }
    } catch {}
  }

  async function loadLikesForActiveUser() {
    const sid = getGuestSessionId();
    try {
      const likesRes = await fetch(`/api/likes?sessionId=${encodeURIComponent(sid)}`, { cache: 'no-store' });
      if (likesRes.ok) {
        const d = await likesRes.json();
        if (Array.isArray(d.likes) && d.likes.length > 0) {
          state.likes = d.likes;
          writeLocalLikes(state.user, d.likes);
          return;
        }
      }
    } catch {}
    state.likes = readLocalLikes(state.user);
  }

  async function loadUserAndLikes() {
    try {
      const meRes = await fetch('/api/me', { cache: 'no-store' });
      if (meRes.ok) {
        const me = await meRes.json();
        state.user = me.user || null;
        if (Array.isArray(me.accounts) && me.accounts.length) {
          state.accounts = me.accounts;
          saveCachedAccounts(me.accounts);
        } else {
          state.accounts = getCachedAccounts();
        }
        state.oauthConfigured = Boolean(me.oauthConfigured);
        state.googleClientId = me.googleClientId || null;
      }
    } catch {
      state.accounts = getCachedAccounts();
    }

    if (!state.accounts.length) {
      state.accounts = getCachedAccounts();
    }

    if (state.user && !state.selectedAccountId) {
      state.selectedAccountId = state.user.id;
    } else if (!state.selectedAccountId && state.accounts.length) {
      state.selectedAccountId = state.accounts[0].id;
    }

    await syncGuestLikesToAccount();
    await loadLikesForActiveUser();

    refreshUI();
  }

  async function selectAndLoginGoogleAccount(acc) {
    if (!acc || !acc.email) return;
    try {
      const res = await fetch('/api/me', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: 'google_account_select',
          email: acc.email,
          name: acc.name,
          picture: acc.picture || null,
        }),
      });
      if (res.ok) {
        const d = await res.json();
        if (d.user) {
          state.user = d.user;
          state.accounts = Array.isArray(d.accounts) && d.accounts.length ? d.accounts : [d.user, ...state.accounts.filter(a => a.id !== d.user.id)];
          saveCachedAccounts(state.accounts);
          state.selectedAccountId = d.user.id;
          await syncGuestLikesToAccount();
          await loadLikesForActiveUser();
          closeGoogleChooser();
          refreshUI();
          showToast(`Signed in with Google as ${d.user.name || d.user.email}`);
          return;
        }
      }
    } catch {}

    // Fallback: local sign-in state
    state.user = acc;
    state.selectedAccountId = acc.id;
    const existing = state.accounts.filter(a => a.id !== acc.id);
    state.accounts = [acc, ...existing];
    saveCachedAccounts(state.accounts);
    await syncGuestLikesToAccount();
    await loadLikesForActiveUser();
    closeGoogleChooser();
    refreshUI();
    showToast(`Signed in with Google as ${acc.name || acc.email}`);
  }

  async function toggleLikeTrack(track) {
    const target = track || getLiveCue();
    if (!target || !songKeyOf(target)) {
      showToast('Play a song first to add it to Liked Songs');
      return;
    }

    const key = songKeyOf(target);
    const already = isTrackLiked(target);
    const normalized = {
      song_id: key,
      title: target.title || 'Unknown Track',
      artist: target.artist || 'Unknown Artist',
      youtube_ids: Array.isArray(target.youtube_ids) && target.youtube_ids.length
        ? target.youtube_ids
        : (target.videoId ? [target.videoId] : []),
      duration_sec: Number(target.duration_sec || target.durationSec) || 210,
      entry_sec: Number.isFinite(Number(target.entry_sec ?? target.entrySec)) ? Number(target.entry_sec ?? target.entrySec) : 35,
      exit_sec: Number.isFinite(Number(target.exit_sec ?? target.exitSec)) ? Number(target.exit_sec ?? target.exitSec) : 77,
      play_full: Boolean(target.play_full ?? target.playFull),
      language: String(target.language || 'hindi'),
      subtype: String(target.subtype || 'liked'),
      energy: Number(target.energy) || 8,
      heat: Array.isArray(target.heat) && target.heat.length ? target.heat : undefined,
      likedAt: new Date().toISOString(),
    };

    if (already) {
      state.likes = state.likes.filter((t) => songKeyOf(t) !== key);
      showToast(`Removed "${normalized.title}" from Liked Songs`);
    } else {
      state.likes = [normalized, ...state.likes.filter((t) => songKeyOf(t) !== key)];
      showToast(`Liked "${normalized.title}"`);
    }
    writeLocalLikes(state.user, state.likes);
    refreshUI();

    const sid = getGuestSessionId();
    try {
      const res = await fetch(`/api/likes?sessionId=${encodeURIComponent(sid)}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ track: normalized, forceLike: !already }),
      });
      if (res.ok) {
        const d = await res.json();
        if (d.persisted && Array.isArray(d.likes)) {
          state.likes = d.likes;
          writeLocalLikes(state.user, d.likes);
          refreshUI();
        }
      }
    } catch {}
  }

  async function removeLikedById(songId) {
    state.likes = state.likes.filter((t) => songKeyOf(t) !== String(songId));
    writeLocalLikes(state.user, state.likes);
    refreshUI();
    const sid = getGuestSessionId();
    try {
      await fetch(`/api/likes?sessionId=${encodeURIComponent(sid)}&songId=${encodeURIComponent(songId)}`, {
        method: 'DELETE',
      });
    } catch {}
  }

  function toEngineCue(t) {
    const yt = Array.isArray(t.youtube_ids) && t.youtube_ids.length ? t.youtube_ids : (t.videoId ? [t.videoId] : []);
    return {
      song_id: songKeyOf(t),
      title: t.title || 'Unknown Track',
      artist: t.artist || 'Unknown Artist',
      youtube_ids: yt,
      duration_sec: Number(t.duration_sec) || 210,
      entry_sec: Number.isFinite(Number(t.entry_sec)) ? Number(t.entry_sec) : 35,
      exit_sec: Number.isFinite(Number(t.exit_sec)) ? Number(t.exit_sec) : 77,
      play_full: Boolean(t.play_full),
      language: t.language || 'hindi',
      subtype: t.subtype || 'liked',
      energy: Number(t.energy) || 8,
      style: 'liked',
      unsure: false,
      heat: Array.isArray(t.heat) && t.heat.length
        ? t.heat
        : Array.from({ length: 100 }, (_, i) => +(0.5 + 0.4 * Math.sin(i / 10)).toFixed(3)),
    };
  }

  function playLikedList(startSongId = null) {
    if (!state.likes.length) {
      showToast('Like some songs first to play your Liked List');
      return;
    }
    let ordered = [...state.likes];
    if (startSongId) {
      const idx = ordered.findIndex((t) => songKeyOf(t) === String(startSongId));
      if (idx > 0) ordered = [...ordered.slice(idx), ...ordered.slice(0, idx)];
    }
    const cues = ordered.map(toEngineCue).filter((c) => c.youtube_ids.length > 0);
    if (!cues.length) return;

    closeModal();
    const eng = window.__nauxEngine;
    if (eng && eng.started && !eng.finished) {
      eng.requeue(cues);
      eng.skip();
      showToast(`Playing Liked Songs (${cues.length} tracks)`);
      return;
    }
    if (typeof window.__startSetWithCues === 'function') {
      window.__startSetWithCues(cues);
      showToast(`Playing Liked Songs (${cues.length} tracks)`);
    } else {
      showToast('Pick a quick set first, then tap Play Liked');
    }
  }

  async function googleSignOut() {
    try {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
      }
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    state.user = null;
    await loadLikesForActiveUser();
    refreshUI();
    showToast('Signed out (Guest mode active)');
  }

  function openGoogleChooser() {
    state.chooserOpen = true;
    state.addingAccount = false;
    renderGoogleChooser();
  }

  function closeGoogleChooser() {
    state.chooserOpen = false;
    state.addingAccount = false;
    const modal = document.getElementById('audify-google-chooser-modal');
    if (modal) modal.remove();
  }

  function openModal() {
    state.modalOpen = true;
    renderModal();
  }

  function closeModal() {
    state.modalOpen = false;
    const modal = document.getElementById('audify-liked-modal');
    if (modal) modal.remove();
  }

  function esc(str) {
    return String(str || '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  function ensurePortal() {
    if (!document.body) return null;
    let portal = document.getElementById('audify-likes-portal');
    if (!portal) {
      portal = document.createElement('div');
      portal.id = 'audify-likes-portal';
      portal.className = 'audify-likes-portal';
      portal.innerHTML = `
        <button id="audify-like-track-btn" type="button" class="audify-like-pill" style="display:none">♡ LIKE</button>
        <button id="audify-liked-header-btn" type="button" class="audify-liked-header-pill">♥ LIKED</button>
      `;
      document.body.appendChild(portal);
      portal.querySelector('#audify-like-track-btn').addEventListener('click', () => toggleLikeTrack());
      portal.querySelector('#audify-liked-header-btn').addEventListener('click', openModal);
    }
    return portal;
  }

  function renderGoogleChooser() {
    const existing = document.getElementById('audify-google-chooser-modal');
    if (!state.chooserOpen) {
      if (existing) existing.remove();
      return;
    }

    const modal = existing || document.createElement('div');
    modal.id = 'audify-google-chooser-modal';
    modal.className = 'audify-google-backdrop';

    const accountsList = state.accounts.length ? state.accounts : getCachedAccounts();
    const selectedAcc = accountsList.find(a => a.id === state.selectedAccountId) || accountsList[0];

    const accountsHtml = accountsList.map((acc, idx) => {
      const isSel = acc.id === (state.selectedAccountId || selectedAcc?.id);
      const isCur = state.user && state.user.id === acc.id;
      const initial = (acc.name || acc.email || 'G').slice(0, 1).toUpperCase();
      const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
      return `
        <div class="audify-google-account-item ${isSel ? 'is-selected' : ''}" data-account-id="${esc(acc.id)}">
          ${acc.picture
            ? `<img src="${esc(acc.picture)}" alt="" class="audify-google-avatar" />`
            : `<div class="audify-google-avatar-initial" style="background:${color}">${esc(initial)}</div>`
          }
          <div class="audify-google-account-meta">
            <div class="audify-google-account-name">${esc(acc.name || 'Google User')} ${isCur ? '<span class="audify-active-badge">CURRENT</span>' : ''}</div>
            <div class="audify-google-account-email">${esc(acc.email || '')}</div>
          </div>
          ${isSel ? `<div class="audify-google-account-check">${CHECK_SVG}</div>` : ''}
        </div>
      `;
    }).join('');

    const addAccountHtml = state.addingAccount
      ? `
        <div class="audify-google-add-form">
          <input type="email" id="audify-google-email-input" class="audify-google-input" placeholder="Google email (e.g. user@gmail.com)" />
          <input type="text" id="audify-google-name-input" class="audify-google-input" placeholder="Display name (e.g. Vedant Sharma)" />
          <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px;">
            <button type="button" class="audify-google-btn-cancel" data-action="cancel-add">Cancel</button>
            <button type="button" class="audify-google-btn-continue" data-action="confirm-add">Next</button>
          </div>
        </div>
      `
      : `
        <div class="audify-google-add-row" data-action="start-add">
          ${PERSON_PLUS_SVG}
          <span>Use another account</span>
        </div>
      `;

    modal.innerHTML = `
      <div class="audify-google-dialog" role="dialog" aria-modal="true" aria-label="Google Account Chooser">
        <div class="audify-google-head">
          ${GOOGLE_SVG}
          <h2 class="audify-google-title">Choose an account</h2>
          <p class="audify-google-subtitle">to continue to <strong style="color:#c8ff00">Audify</strong></p>
        </div>

        <div class="audify-google-account-list naux-scroll">
          ${accountsHtml}
        </div>

        ${addAccountHtml}

        <div class="audify-google-disclaimer">
          To continue, Google will share your name, email address, language preference, and profile picture with Audify. See Audify's <a href="#" onclick="return false;">Privacy Policy</a> and <a href="#" onclick="return false;">Terms of Service</a>.
        </div>

        <div class="audify-google-actions">
          <button type="button" class="audify-google-btn-cancel" data-action="cancel-chooser">Cancel</button>
          <button type="button" class="audify-google-btn-continue" data-action="continue-chooser">
            Continue as ${(selectedAcc?.name || 'Google User').split(' ')[0]}
          </button>
        </div>
      </div>
    `;

    if (!existing) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeGoogleChooser();
          return;
        }

        const addRow = e.target.closest('[data-action="start-add"]');
        if (addRow) {
          state.addingAccount = true;
          renderGoogleChooser();
          return;
        }

        const cancelAdd = e.target.closest('[data-action="cancel-add"]');
        if (cancelAdd) {
          state.addingAccount = false;
          renderGoogleChooser();
          return;
        }

        const confirmAdd = e.target.closest('[data-action="confirm-add"]');
        if (confirmAdd) {
          const emailInput = document.getElementById('audify-google-email-input');
          const nameInput = document.getElementById('audify-google-name-input');
          const email = (emailInput?.value || '').trim();
          const name = (nameInput?.value || '').trim() || email.split('@')[0] || 'Google User';
          if (!email || !email.includes('@')) {
            showToast('Please enter a valid Google email');
            return;
          }
          const newAcc = {
            id: 'google_' + Math.random().toString(36).slice(2, 10),
            email,
            name,
            picture: null,
            provider: 'google',
          };
          selectAndLoginGoogleAccount(newAcc);
          return;
        }

        const accRow = e.target.closest('.audify-google-account-item');
        if (accRow) {
          const accId = accRow.dataset.accountId;
          state.selectedAccountId = accId;
          const target = accountsList.find(a => a.id === accId);
          if (target) {
            selectAndLoginGoogleAccount(target);
          } else {
            renderGoogleChooser();
          }
          return;
        }

        const cancelBtn = e.target.closest('[data-action="cancel-chooser"]');
        if (cancelBtn) {
          closeGoogleChooser();
          return;
        }

        const contBtn = e.target.closest('[data-action="continue-chooser"]');
        if (contBtn) {
          if (selectedAcc) {
            selectAndLoginGoogleAccount(selectedAcc);
          }
          return;
        }
      });

      document.body.appendChild(modal);
    }
  }

  function renderModal() {
    const existing = document.getElementById('audify-liked-modal');
    if (!state.modalOpen) {
      if (existing) existing.remove();
      return;
    }

    const modal = existing || document.createElement('div');
    modal.id = 'audify-liked-modal';
    modal.className = 'audify-liked-backdrop';

    const userBar = state.user
      ? `
        <div class="audify-liked-user">
          ${state.user.picture
            ? `<img src="${esc(state.user.picture)}" alt="" class="audify-liked-avatar" />`
            : `<span class="audify-liked-initial">${esc((state.user.name || state.user.email || 'U').slice(0, 1).toUpperCase())}</span>`
          }
          <div class="audify-liked-user-meta">
            <span class="audify-liked-user-name">${esc(state.user.name || 'Google User')} <span class="audify-active-badge">ACTIVE</span></span>
            <span class="audify-liked-user-email">${esc(state.user.email || '')}</span>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
            <button type="button" class="audify-liked-btn-google" data-action="switch-account">
              ${GOOGLE_SVG}
              <span>SWITCH ACCOUNT</span>
            </button>
            <button type="button" class="audify-liked-btn-ghost" data-action="signout">SIGN OUT</button>
          </div>
        </div>
      `
      : `
        <div class="audify-liked-user">
          <div class="audify-liked-user-meta">
            <span class="audify-liked-user-name">GUEST SESSION (GOOGLE SIGN-IN OPTIONAL)</span>
            <span class="audify-liked-user-email">Choose your Google account to keep your Liked Songs synced across devices.</span>
          </div>
          <button type="button" class="audify-liked-btn-google" data-action="open-chooser">
            ${GOOGLE_SVG}
            <span>CHOOSE GOOGLE ACCOUNT</span>
          </button>
        </div>
      `;

    const listHtml = state.likes.length === 0
      ? `<div class="audify-liked-empty">
           <p class="audify-liked-empty-title">NO LIKED SONGS YET</p>
           <p class="audify-liked-empty-sub">Tap <strong>♡ LIKE</strong> while any track is playing to save it here.</p>
         </div>`
      : state.likes.map((t) => {
          const yt = Array.isArray(t.youtube_ids) && t.youtube_ids[0] ? t.youtube_ids[0] : '';
          const thumb = yt ? `https://i.ytimg.com/vi/${esc(yt)}/hqdefault.jpg` : '';
          const sid = songKeyOf(t);
          return `<div class="audify-liked-item">
            ${thumb ? `<img src="${thumb}" alt="" class="audify-liked-thumb" loading="lazy" />` : `<div class="audify-liked-thumb"></div>`}
            <div class="audify-liked-item-info">
              <div class="audify-liked-item-title">${esc(t.title)}</div>
              <div class="audify-liked-item-artist">${esc(t.artist)}</div>
            </div>
            <button type="button" class="audify-liked-btn-play-one" data-play-id="${esc(sid)}" title="Play this song">▶</button>
            <button type="button" class="audify-liked-btn-remove" data-remove-id="${esc(sid)}" title="Remove">✕</button>
          </div>`;
        }).join('');

    modal.innerHTML = `
      <div class="audify-liked-dialog" role="dialog" aria-modal="true" aria-label="Liked Songs">
        <div class="audify-liked-head">
          <div>
            <h2 class="audify-liked-title">♥ LIKED SONGS <span class="audify-liked-count">(${state.likes.length})</span></h2>
            <p class="audify-liked-subtitle">Your saved tracks, ready to mix anytime.</p>
          </div>
          <button type="button" class="audify-liked-close" data-action="close" aria-label="Close">✕</button>
        </div>
        ${userBar}
        <div class="audify-liked-actions">
          <button type="button" class="audify-liked-btn-lime" data-action="play-all" ${state.likes.length === 0 ? 'disabled' : ''}>
            ▶ PLAY LIKED SET (${state.likes.length})
          </button>
        </div>
        <div class="audify-liked-list naux-scroll">${listHtml}</div>
      </div>`;

    if (!existing) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) { closeModal(); return; }
        const btn = e.target.closest('button');
        if (!btn) return;
        const action = btn.dataset.action;
        if (action === 'close') closeModal();
        else if (action === 'open-chooser' || action === 'switch-account') {
          openGoogleChooser();
        }
        else if (action === 'signout') googleSignOut();
        else if (action === 'play-all') playLikedList();
        else if (btn.dataset.playId) playLikedList(btn.dataset.playId);
        else if (btn.dataset.removeId) removeLikedById(btn.dataset.removeId);
      });
      document.body.appendChild(modal);
    }
  }

  function refreshUI() {
    const portal = ensurePortal();
    if (!portal) return;

    const splash = isSplashScreen();
    const playing = isPlayerActive();
    const live = getLiveCue();
    const liked = isTrackLiked(live);
    const countLabel = state.user
      ? `♥ ${String(state.user.name || 'LIKED').split(' ')[0].toUpperCase()} (${state.likes.length})`
      : `♥ LIKED${state.likes.length ? ` (${state.likes.length})` : ''}`;

    const sig = `${splash}|${playing}|${liked}|${countLabel}|${songKeyOf(live)}|${state.user?.id || ''}`;
    if (sig !== state.lastSig) {
      state.lastSig = sig;
      portal.style.display = splash ? 'none' : 'flex';
      const likeBtn = portal.querySelector('#audify-like-track-btn');
      if (likeBtn) {
        likeBtn.style.display = playing ? 'inline-flex' : 'none';
        likeBtn.classList.toggle('is-liked', liked);
        likeBtn.textContent = liked ? '♥ LIKED' : '♡ LIKE';
      }
      const hBtn = portal.querySelector('#audify-liked-header-btn');
      if (hBtn) {
        hBtn.textContent = countLabel;
      }
    }

    if (state.modalOpen) renderModal();
    if (state.chooserOpen) renderGoogleChooser();
  }

  const prevHook = window.onAudifySongChange;
  window.onAudifySongChange = function (songInfo = {}) {
    state.currentSong = songInfo;
    refreshUI();
    if (typeof prevHook === 'function') {
      try { prevHook(songInfo); } catch {}
    }
  };

  window.__audifyLikes = {
    open: openModal,
    openChooser: openGoogleChooser,
    closeChooser: closeGoogleChooser,
    signOut: googleSignOut,
    toggleLike: toggleLikeTrack,
    playLiked: playLikedList,
    getLikes: () => state.likes,
    getUser: () => state.user,
    getAccounts: () => state.accounts,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      ensurePortal();
      loadUserAndLikes();
    });
  } else {
    ensurePortal();
    loadUserAndLikes();
  }

  setInterval(refreshUI, 400);
})();
