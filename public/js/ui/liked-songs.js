// ============================================================================
// Audify Official Google Sign-In (GIS + OAuth 2.0) + Per-User Liked Songs UI
// React-Safe Portal Architecture (never mutates React-owned DOM nodes)
// ============================================================================

(function initAudifyLikes() {
  if (typeof window === 'undefined') return;
  if (window.__audify_likes_initialized) return;
  window.__audify_likes_initialized = true;

  const SESSION_KEY = 'audify.guestSessionId';
  const LIKES_PREFIX = 'audify.liked.';

  let state = {
    user: null,
    accounts: [],
    oauthConfigured: false,
    googleClientId: null,
    gisInitialized: false,
    likes: [],
    currentSong: null,
    modalOpen: false,
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
    }, 3400);
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

  async function handleGisCredential(response) {
    if (!response?.credential) return;
    try {
      const res = await fetch('/api/me', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'google_credential', credential: response.credential }),
      });
      if (res.ok) {
        const d = await res.json();
        if (d.user) {
          state.user = d.user;
          state.accounts = Array.isArray(d.accounts) ? d.accounts : [d.user];
          await syncGuestLikesToAccount();
          await loadLikesForActiveUser();
          refreshUI();
          showToast(`Signed in with Google as ${d.user.name || d.user.email}`);
        }
      }
    } catch {
      showToast('Google Sign-In could not complete');
    }
  }

  function initGoogleIdentityServices() {
    if (!state.googleClientId || state.gisInitialized) return;
    if (!window.google?.accounts?.id) return;
    try {
      window.google.accounts.id.initialize({
        client_id: state.googleClientId,
        callback: handleGisCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      state.gisInitialized = true;
    } catch {}
  }

  function renderGisButton() {
    const slot = document.getElementById('audify-gis-btn-slot');
    if (!slot || !state.googleClientId || !window.google?.accounts?.id) return;
    initGoogleIdentityServices();
    if (slot.dataset.rendered === '1') return;
    slot.innerHTML = '';
    try {
      window.google.accounts.id.renderButton(slot, {
        theme: 'filled_black',
        size: 'large',
        shape: 'pill',
        text: 'continue_with',
        logo_alignment: 'left',
      });
      slot.dataset.rendered = '1';
    } catch {}
  }

  async function loadUserAndLikes() {
    try {
      const meRes = await fetch('/api/me', { cache: 'no-store' });
      if (meRes.ok) {
        const me = await meRes.json();
        state.user = me.user || null;
        state.accounts = Array.isArray(me.accounts) ? me.accounts : [];
        state.oauthConfigured = Boolean(me.oauthConfigured);
        state.googleClientId = me.googleClientId || null;
      }
    } catch {}

    initGoogleIdentityServices();
    await syncGuestLikesToAccount();
    await loadLikesForActiveUser();

    try {
      const u = new URL(window.location.href);
      const authStatus = u.searchParams.get('auth');
      if (authStatus) {
        u.searchParams.delete('auth');
        history.replaceState(history.state, '', u.pathname + u.search + u.hash);
        if (authStatus === 'ok' && state.user) {
          showToast(`Signed in as ${state.user.name || state.user.email}`);
        } else if (authStatus === 'unconfigured') {
          openModal();
        } else if (authStatus === 'error') {
          showToast('Google Sign-In was cancelled — guest mode remains active');
        }
      }
    } catch {}

    refreshUI();
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

  function startGoogleSignIn() {
    if (state.oauthConfigured) {
      window.location.href = '/api/auth/google';
      return;
    }
    if (state.googleClientId && window.google?.accounts?.id) {
      initGoogleIdentityServices();
      window.google.accounts.id.prompt();
      return;
    }
    openModal();
    showToast('Google OAuth Client ID is required on the server to open Google Account Picker');
  }

  async function switchAccount(accountId) {
    try {
      const res = await fetch('/api/me', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'switch_account', id: accountId }),
      });
      if (res.ok) {
        const d = await res.json();
        if (d.user) {
          state.user = d.user;
          state.accounts = Array.isArray(d.accounts) ? d.accounts : state.accounts;
          await loadLikesForActiveUser();
          refreshUI();
          showToast(`Switched to ${d.user.name || d.user.email}`);
        }
      }
    } catch {}
  }

  async function removeAccount(accountId) {
    try {
      const res = await fetch('/api/me', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'remove_account', id: accountId }),
      });
      if (res.ok) {
        const d = await res.json();
        state.user = d.user || null;
        state.accounts = Array.isArray(d.accounts) ? d.accounts : [];
        await loadLikesForActiveUser();
        refreshUI();
      }
    } catch {}
  }

  async function googleSignOut() {
    try {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
      }
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        const d = await res.json().catch(() => ({}));
        if (Array.isArray(d.accounts)) state.accounts = d.accounts;
      }
    } catch {}
    state.user = null;
    await loadLikesForActiveUser();
    refreshUI();
    showToast('Signed out (Guest mode active)');
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

  const GOOGLE_SVG = `<svg viewBox="0 0 48 48" width="16" height="16" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>`;

  function renderAccountSection() {
    const otherAccounts = state.accounts.filter((a) => !state.user || a.id !== state.user.id);
    const savedHtml = otherAccounts.length > 0
      ? `<div class="audify-account-switcher">
           <div class="audify-account-switcher-label">SWITCH GOOGLE ACCOUNT</div>
           ${otherAccounts.map((acc) => `
             <div class="audify-account-row">
               ${acc.picture ? `<img src="${esc(acc.picture)}" alt="" class="audify-liked-avatar-sm" />` : `<span class="audify-liked-initial-sm">${esc((acc.name || acc.email || 'U').slice(0, 1).toUpperCase())}</span>`}
               <div class="audify-liked-user-meta">
                 <span class="audify-liked-user-name">${esc(acc.name)}</span>
                 <span class="audify-liked-user-email">${esc(acc.email)}</span>
               </div>
               <button type="button" class="audify-liked-btn-ghost" data-switch-id="${esc(acc.id)}">CONTINUE</button>
               <button type="button" class="audify-liked-btn-remove" data-remove-acc-id="${esc(acc.id)}" title="Remove account">✕</button>
             </div>
           `).join('')}
         </div>`
      : '';

    const googleButtonHtml = state.googleClientId
      ? `<div id="audify-gis-btn-slot"></div>`
      : `<button type="button" class="audify-liked-btn-google" data-action="google-oauth">
           ${GOOGLE_SVG}
           <span>CONTINUE WITH GOOGLE</span>
         </button>`;

    if (state.user) {
      return `
        <div class="audify-liked-user">
          ${state.user.picture ? `<img src="${esc(state.user.picture)}" alt="" class="audify-liked-avatar" />` : `<span class="audify-liked-initial">${esc((state.user.name || state.user.email || 'U').slice(0, 1).toUpperCase())}</span>`}
          <div class="audify-liked-user-meta">
            <span class="audify-liked-user-name">${esc(state.user.name || 'Google User')} <span class="audify-active-badge">ACTIVE</span></span>
            <span class="audify-liked-user-email">${esc(state.user.email || '')}</span>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
            <button type="button" class="audify-liked-btn-google" data-action="google-oauth">${GOOGLE_SVG}<span>+ USE ANOTHER ACCOUNT</span></button>
            <button type="button" class="audify-liked-btn-ghost" data-action="signout">SIGN OUT</button>
          </div>
          ${savedHtml}
        </div>`;
    }

    return `
      <div class="audify-liked-user">
        <div class="audify-liked-user-meta">
          <span class="audify-liked-user-name">GUEST MODE (GOOGLE SIGN-IN OPTIONAL)</span>
          <span class="audify-liked-user-email">${state.oauthConfigured || state.googleClientId ? 'Choose your Google account to sync your Liked Songs' : 'Add GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET in Vercel to enable Google Account Chooser'}</span>
        </div>
        ${googleButtonHtml}
        ${savedHtml}
      </div>`;
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
        ${renderAccountSection()}
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
        else if (action === 'google-oauth') startGoogleSignIn();
        else if (action === 'signout') googleSignOut();
        else if (action === 'play-all') playLikedList();
        else if (btn.dataset.switchId) switchAccount(btn.dataset.switchId);
        else if (btn.dataset.removeAccId) removeAccount(btn.dataset.removeAccId);
        else if (btn.dataset.playId) playLikedList(btn.dataset.playId);
        else if (btn.dataset.removeId) removeLikedById(btn.dataset.removeId);
      });
      document.body.appendChild(modal);
    }

    renderGisButton();
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
    signIn: startGoogleSignIn,
    switchAccount,
    toggleLike: toggleLikeTrack,
    playLiked: playLikedList,
    getLikes: () => state.likes,
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

  setInterval(refreshUI, 500);
})();
