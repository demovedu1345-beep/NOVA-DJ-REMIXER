/**
 * Audify Advanced Music Discovery: Artist Explorer & Canonical Profiles
 *
 * Implements:
 * - Dedicated Artist Discovery Section (Hindi & English)
 * - 15 Mood & Genre Subcategories
 * - Canonical Artist Profiles with Bio, Country, Tags & Total Tracks
 * - Play All & Shuffle Integration with PlayerEngine (__startSetWithCues & __nauxEngine)
 * - Live Real-Time Search & Instant Filtering
 * - Strict adherence to Audify's Obsidian (#050507) & Lime (#D4FF00) Anton Design System
 */

(function () {
  'use strict';

  if (typeof window === 'undefined') return;

  // Global state
  let currentLang = 'hindi';
  let currentSubcategory = 'all';
  let currentSearchQuery = '';
  let activeArtistProfile = null;
  let cachedArtists = { hindi: [], english: [] };
  let cachedSubcategories = { hindi: [], english: [] };

  // -------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------
  function fmtSec(sec) {
    const s = Math.round(Number(sec) || 0);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${String(rem).padStart(2, '0')}`;
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // -------------------------------------------------------------
  // Data Fetching
  // -------------------------------------------------------------
  async function fetchArtists(lang, sub = 'all', query = '') {
    try {
      const url = `/api/artists?lang=${encodeURIComponent(lang)}&sub=${encodeURIComponent(sub)}&q=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      cachedArtists[lang] = data.artists || [];
      if (data.subcategories) cachedSubcategories[lang] = data.subcategories;
      return data;
    } catch (e) {
      console.warn('Failed to fetch artists:', e);
      return { artists: [], subcategories: [] };
    }
  }

  async function fetchArtistFull(artistId, lang) {
    try {
      const url = `/api/artists?id=${encodeURIComponent(artistId)}&lang=${encodeURIComponent(lang)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.artist || null;
    } catch (e) {
      console.warn('Failed to fetch artist profile:', e);
      return null;
    }
  }

  // -------------------------------------------------------------
  // Playback Integration (Play All & Shuffle)
  // -------------------------------------------------------------
  async function playArtistTracks(artistId, lang, shuffle = false, startTrackId = null) {
    try {
      // 1. Fetch official set cues from /api/set
      const res = await fetch('/api/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artist: artistId, lang, shuffle })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      let cues = data.cues || [];

      if (!cues.length) {
        alert('No playable tracks currently available for this artist.');
        return;
      }

      // If a specific track was clicked, place it at the front
      if (startTrackId) {
        const foundIdx = cues.findIndex(c => c.song_id === startTrackId || (c.youtube_ids && c.youtube_ids[0] === startTrackId));
        if (foundIdx > 0) {
          const selected = cues.splice(foundIdx, 1);
          cues.unshift(selected[0]);
        }
      }

      // Close explorer modal so user can see playback
      closeExplorer();

      // Launch high-frequency volume guard
      if (window.launchAudifyVolumeGuard) {
        window.launchAudifyVolumeGuard(3500, 50);
      }

      // Trigger RGB Aurora shockwave
      if (window.triggerAudifySongShockwave) {
        window.triggerAudifySongShockwave();
      }

      // Start in PlayerEngine
      if (typeof window.__startSetWithCues === 'function') {
        window.__startSetWithCues(cues);
      } else if (window.__nauxEngine && typeof window.__nauxEngine.start === 'function') {
        window.__nauxEngine.start(cues);
      } else {
        console.warn('PlayerEngine start method not found, cues ready:', cues.length);
      }
    } catch (err) {
      console.error('Error starting artist playback:', err);
      alert('Unable to load artist playlist. Please try again.');
    }
  }

  // -------------------------------------------------------------
  // UI Injection: Create the Modal & Drawer
  // -------------------------------------------------------------
  let explorerOverlay = null;

  function ensureExplorerDom() {
    if (document.getElementById('audify-artist-explorer')) {
      explorerOverlay = document.getElementById('audify-artist-explorer');
      return;
    }

    explorerOverlay = document.createElement('div');
    explorerOverlay.id = 'audify-artist-explorer';
    explorerOverlay.className = 'audify-artist-modal hidden';
    explorerOverlay.innerHTML = `
      <div class="audify-artist-backdrop"></div>
      <div class="audify-artist-sheet">
        <!-- Top Navigation Bar -->
        <div class="audify-artist-header">
          <div class="audify-artist-title-cluster">
            <span class="audify-artist-badge-pill">★ HITMAKERS</span>
            <h2 class="audify-artist-main-heading">ARTIST EXPLORER</h2>
          </div>

          <!-- Language Selector -->
          <div class="audify-artist-lang-toggle">
            <button class="audify-artist-lang-btn active" data-lang="hindi">HINDI</button>
            <button class="audify-artist-lang-btn" data-lang="english">ENGLISH</button>
          </div>

          <!-- Close Button -->
          <button class="audify-artist-close-btn" aria-label="Close Explorer">✕</button>
        </div>

        <!-- Dynamic Body: Browse View or Single Profile View -->
        <div id="audify-artist-content" class="audify-artist-body">
          <!-- Populated dynamically -->
        </div>
      </div>
    `;

    document.body.appendChild(explorerOverlay);

    // Event listeners
    explorerOverlay.querySelector('.audify-artist-backdrop').addEventListener('click', closeExplorer);
    explorerOverlay.querySelector('.audify-artist-close-btn').addEventListener('click', closeExplorer);

    const langBtns = explorerOverlay.querySelectorAll('.audify-artist-lang-btn');
    langBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        langBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentLang = btn.dataset.lang;
        currentSubcategory = 'all';
        currentSearchQuery = '';
        activeArtistProfile = null;
        renderBrowseView();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !explorerOverlay.classList.contains('hidden')) {
        if (activeArtistProfile) {
          activeArtistProfile = null;
          renderBrowseView();
        } else {
          closeExplorer();
        }
      }
    });
  }

  // -------------------------------------------------------------
  // Render: Artist Browse View
  // -------------------------------------------------------------
  async function renderBrowseView() {
    const container = document.getElementById('audify-artist-content');
    if (!container) return;

    container.innerHTML = `
      <div class="audify-artist-loading">
        <div class="audify-artist-spinner"></div>
        <span>Loading verified artist catalogues...</span>
      </div>
    `;

    const data = await fetchArtists(currentLang, currentSubcategory, currentSearchQuery);
    const artists = data.artists || [];
    const subcats = data.subcategories || [];

    let html = `
      <!-- Subcategory Tabs Bar -->
      <div class="audify-artist-subcats-bar">
        ${subcats.map(sub => `
          <button class="audify-artist-subcat-pill ${sub.id === currentSubcategory ? 'active' : ''}" data-sub="${sub.id}">
            ${escapeHtml(sub.label)}
          </button>
        `).join('')}
      </div>

      <!-- Search & Status Bar -->
      <div class="audify-artist-search-bar">
        <div class="audify-artist-input-wrap">
          <span class="audify-artist-search-icon">🔍</span>
          <input
            type="text"
            id="audify-artist-search-input"
            class="audify-artist-input"
            placeholder="Search artists, songs or vibes..."
            value="${escapeHtml(currentSearchQuery)}"
          />
          ${currentSearchQuery ? `<button id="audify-artist-clear-search" class="audify-artist-clear-btn">✕</button>` : ''}
        </div>
        <div class="audify-artist-count-badge">
          <span>${artists.length} ARTISTS READY</span>
        </div>
      </div>

      <!-- Artists Grid -->
      <div class="audify-artist-grid">
        ${artists.length === 0 ? `
          <div class="audify-artist-empty">
            <span class="text-4xl">🎵</span>
            <h3>No artists found</h3>
            <p>Try searching for a different mood, genre or artist name.</p>
          </div>
        ` : artists.map(a => `
          <div class="audify-artist-card" data-artist="${a.id}">
            <div class="audify-artist-avatar-wrap">
              <img src="${a.image}" alt="${escapeHtml(a.name)}" class="audify-artist-avatar" loading="lazy" />
              ${a.verified ? `<span class="audify-artist-check" title="Verified Artist">✓</span>` : ''}
            </div>

            <div class="audify-artist-info">
              <h4 class="audify-artist-name">${escapeHtml(a.name)}</h4>
              <span class="audify-artist-meta">${a.songsCount} SONGS · ${escapeHtml(a.country)}</span>

              <div class="audify-artist-tags">
                ${(a.subcategories || []).slice(0, 3).map(tag => `
                  <span class="audify-artist-tag">${escapeHtml(tag)}</span>
                `).join('')}
              </div>
            </div>

            <div class="audify-artist-card-actions">
              <button class="audify-artist-play-btn squeeze" data-artist="${a.id}" title="Play All Songs">
                ▶ PLAY ALL
              </button>
              <button class="audify-artist-view-btn squeeze" data-artist="${a.id}">
                PROFILE
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    container.innerHTML = html;

    // Attach subcategory click events
    container.querySelectorAll('.audify-artist-subcat-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        currentSubcategory = btn.dataset.sub;
        renderBrowseView();
      });
    });

    // Attach search input events
    const searchInput = document.getElementById('audify-artist-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearchQuery = e.target.value;
        // Debounce search
        clearTimeout(searchInput._timer);
        searchInput._timer = setTimeout(() => {
          renderBrowseView();
        }, 300);
      });
    }

    const clearBtn = document.getElementById('audify-artist-clear-search');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        currentSearchQuery = '';
        renderBrowseView();
      });
    }

    // Attach card actions
    container.querySelectorAll('.audify-artist-play-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        playArtistTracks(btn.dataset.artist, currentLang, false);
      });
    });

    container.querySelectorAll('.audify-artist-view-btn, .audify-artist-card').forEach(el => {
      el.addEventListener('click', () => {
        const artistId = el.dataset.artist;
        if (artistId) openArtistProfile(artistId);
      });
    });
  }

  // -------------------------------------------------------------
  // Render: Single Artist Profile View
  // -------------------------------------------------------------
  async function openArtistProfile(artistId) {
    const container = document.getElementById('audify-artist-content');
    if (!container) return;

    container.innerHTML = `
      <div class="audify-artist-loading">
        <div class="audify-artist-spinner"></div>
        <span>Loading full discography for ${escapeHtml(artistId)}...</span>
      </div>
    `;

    const artist = await fetchArtistFull(artistId, currentLang);
    if (!artist) {
      renderBrowseView();
      return;
    }

    activeArtistProfile = artist;
    const songs = artist.songs || [];
    const popular = songs.slice(0, 5);

    let html = `
      <div class="audify-profile-view">
        <!-- Back Navigation -->
        <button id="audify-profile-back" class="audify-profile-back-btn squeeze">
          ← BACK TO ARTISTS
        </button>

        <!-- Artist Hero Banner -->
        <div class="audify-profile-hero">
          <div class="audify-profile-avatar-wrap">
            <img src="${artist.image}" alt="${escapeHtml(artist.name)}" class="audify-profile-avatar" />
            ${artist.verified ? `<span class="audify-profile-verified-badge">✓ VERIFIED ARTIST</span>` : ''}
          </div>

          <div class="audify-profile-hero-details">
            <div class="audify-profile-tags">
              ${(artist.subcategories || []).map(t => `<span class="audify-profile-tag">${escapeHtml(t.toUpperCase())}</span>`).join('')}
            </div>

            <h1 class="audify-profile-name">${escapeHtml(artist.name)}</h1>
            <p class="audify-profile-bio">${escapeHtml(artist.bio)}</p>

            <div class="audify-profile-stats">
              <span><strong>${songs.length}</strong> Playable Songs</span>
              <span>•</span>
              <span><strong>${escapeHtml(artist.country)}</strong></span>
              <span>•</span>
              <span>Official YouTube Cues</span>
            </div>

            <!-- Master Action Buttons -->
            <div class="audify-profile-actions">
              <button id="audify-profile-play-all" class="audify-btn-primary squeeze">
                ▶ PLAY ALL (${songs.length})
              </button>
              <button id="audify-profile-shuffle" class="audify-btn-secondary squeeze">
                🔀 SHUFFLE
              </button>
            </div>
          </div>
        </div>

        <!-- Popular Songs Preview -->
        ${popular.length > 0 ? `
          <div class="audify-profile-section">
            <h3 class="audify-profile-section-title">TOP POPULAR HITS</h3>
            <div class="audify-profile-popular-grid">
              ${popular.map((s, idx) => {
                const entry = s.entrySec || 30;
                const exit = s.exitSec || (entry + 40);
                return `
                  <div class="audify-profile-track-card" data-vid="${s.videoId}" data-id="${s.id}">
                    <span class="audify-profile-track-num">0${idx + 1}</span>
                    <div class="audify-profile-track-info">
                      <span class="audify-profile-track-title">${escapeHtml(s.title)}</span>
                      <span class="audify-profile-track-artist">${escapeHtml(s.artist)} · ${s.year || '2024'}</span>
                    </div>
                    <span class="audify-profile-hook-badge">▶ ${fmtSec(entry)}–${fmtSec(exit)}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Complete Discography -->
        <div class="audify-profile-section">
          <div class="audify-profile-section-header">
            <h3 class="audify-profile-section-title">ALL AVAILABLE RECORDINGS (${songs.length})</h3>
            <span class="text-xs uppercase text-white/40 tracking-wider">Tap any song to play set from that track</span>
          </div>

          <div class="audify-profile-discography-list">
            ${songs.map((s, idx) => {
              const entry = s.entrySec || 30;
              const exit = s.exitSec || (entry + 40);
              return `
                <div class="audify-profile-song-row" data-vid="${s.videoId}" data-id="${s.id}">
                  <span class="audify-profile-row-idx">${idx + 1}</span>
                  <div class="audify-profile-row-info">
                    <span class="audify-profile-row-title">${escapeHtml(s.title)}</span>
                    <span class="audify-profile-row-credits">${escapeHtml(s.artist)} · ${s.year || '2024'}</span>
                  </div>
                  <span class="audify-profile-row-dur">${fmtSec(s.durationSec || 210)}</span>
                  <button class="audify-profile-row-play squeeze" data-id="${s.id}">▶ PLAY</button>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Attach profile event handlers
    document.getElementById('audify-profile-back')?.addEventListener('click', () => {
      activeArtistProfile = null;
      renderBrowseView();
    });

    document.getElementById('audify-profile-play-all')?.addEventListener('click', () => {
      playArtistTracks(artist.id, currentLang, false);
    });

    document.getElementById('audify-profile-shuffle')?.addEventListener('click', () => {
      playArtistTracks(artist.id, currentLang, true);
    });

    container.querySelectorAll('.audify-profile-track-card, .audify-profile-song-row').forEach(row => {
      row.addEventListener('click', () => {
        const trackId = row.dataset.id || row.dataset.vid;
        playArtistTracks(artist.id, currentLang, false, trackId);
      });
    });
  }

  // -------------------------------------------------------------
  // Public Window API
  // -------------------------------------------------------------
  function openExplorer(lang = 'hindi', subcategory = 'all') {
    ensureExplorerDom();
    currentLang = lang;
    currentSubcategory = subcategory;
    activeArtistProfile = null;

    // Sync language toggle pills
    const langBtns = explorerOverlay.querySelectorAll('.audify-artist-lang-btn');
    langBtns.forEach(b => {
      b.classList.toggle('active', b.dataset.lang === lang);
    });

    explorerOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    renderBrowseView();
  }

  function closeExplorer() {
    if (explorerOverlay) {
      explorerOverlay.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  window.openAudifyArtistExplorer = openExplorer;
  window.closeAudifyArtistExplorer = closeExplorer;
  window.openAudifyArtistProfile = (artistId, lang = 'hindi') => {
    openExplorer(lang);
    openArtistProfile(artistId);
  };
  window.playAudifyArtistAll = (artistId, lang = 'hindi', shuffle = false) => {
    playArtistTracks(artistId, lang, shuffle);
  };

  // -------------------------------------------------------------
  // Inject Header "ARTISTS" Navigation Pill
  // -------------------------------------------------------------
  function injectArtistHeaderNav() {
    if (document.getElementById('audify-artist-header-pill')) return;

    const navPill = document.createElement('button');
    navPill.id = 'audify-artist-header-pill';
    navPill.className = 'audify-pill-btn squeeze';
    navPill.innerHTML = `<span>🎤 ARTISTS</span>`;
    navPill.title = 'Browse Top Artists & Hitmakers';
    navPill.addEventListener('click', () => openExplorer(currentLang));

    const controlPills = document.getElementById('audify-control-pills-container');
    if (controlPills) {
      controlPills.prepend(navPill);
      return;
    }

    const header = document.querySelector('header, nav, main > .flex.justify-between, main > .relative.z-30.flex, main > .flex.items-center.justify-between');
    if (!header) return;

    const rightCluster = header.querySelector('.flex.items-center.gap-2, .flex.items-center.gap-3, .flex.items-center.gap-5');
    if (rightCluster) {
      rightCluster.prepend(navPill);
    } else {
      header.appendChild(navPill);
    }
  }

  // Check URL parameters on mount (?view=artists or ?artist=Arijit+Singh)
  function checkUrlOnLoad() {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'artists' || window.location.hash === '#artists') {
        const lang = params.get('lang') || 'hindi';
        openExplorer(lang);
      } else if (params.get('artist')) {
        const art = params.get('artist');
        const lang = params.get('lang') || 'hindi';
        window.openAudifyArtistProfile(art, lang);
      }
    } catch (_) {}
  }

  // Intercept Step 1 "Artists" button clicks if present
  function wireWizardArtistCardIntercept() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('button, [role="button"]');
      if (!target) return;
      const text = (target.textContent || '').trim();
      if (text.includes('Artists (All Singers)') || text === 'Artists') {
        // Detect current language from page or default
        const pageText = document.body.innerText || '';
        const detectedLang = pageText.includes('English') ? 'english' : 'hindi';
        openExplorer(detectedLang);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectArtistHeaderNav();
      checkUrlOnLoad();
      wireWizardArtistCardIntercept();
    });
  } else {
    injectArtistHeaderNav();
    checkUrlOnLoad();
    wireWizardArtistCardIntercept();
  }

  setInterval(injectArtistHeaderNav, 1500);

})();
