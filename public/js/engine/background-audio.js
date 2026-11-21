// =========================================================================
// Audify Mobile Background Audio, MediaSession & WakeLock Engine
// Enables continuous background playback when phone screen is locked or tab minimized
// =========================================================================

(function initBackgroundAudio() {
  if (typeof window === 'undefined') return;
  if (window.__audify_bg_audio_initialized) return;
  window.__audify_bg_audio_initialized = true;

  // 1. Silent 1-second 44.1kHz 16-bit PCM WAV Data URI
  const SILENT_WAV_URI = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

  let anchorAudio = null;
  let audioCtx = null;
  let isUnlocked = false;
  let wakeLock = null;

  function getEngine() {
    return window.__nauxEngine || window.__novaOrchestrator || null;
  }

  function createAnchorAudio() {
    if (anchorAudio) return anchorAudio;
    anchorAudio = document.createElement('audio');
    anchorAudio.id = 'audify-bg-anchor';
    anchorAudio.src = SILENT_WAV_URI;
    anchorAudio.loop = true;
    anchorAudio.autoplay = false;
    anchorAudio.playsInline = true;
    anchorAudio.setAttribute('playsinline', '');
    anchorAudio.setAttribute('webkit-playsinline', '');
    // Crucial: volume must be > 0 so iOS / Android doesn't suspend it as muted media
    anchorAudio.volume = 0.001;
    anchorAudio.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0.001;pointer-events:none;bottom:-999px;';
    const parent = document.body || document.documentElement;
    if (parent) {
      parent.appendChild(anchorAudio);
    }
    return anchorAudio;
  }

  // 2. Unlock Audio Session on First Touch/Click
  async function unlockAudioSession() {
    if (isUnlocked) return;
    try {
      const a = createAnchorAudio();
      await a.play();
      isUnlocked = true;

      // Also unlock Web Audio Context for iOS CoreAudio keepalive
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }
        // Create an inaudible buffer source loop
        const buffer = audioCtx.createBuffer(1, 22050, 22050);
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        const gain = audioCtx.createGain();
        gain.gain.value = 0.0001; // Inaudible
        source.connect(gain);
        gain.connect(audioCtx.destination);
        source.start(0);
      }
      console.log('[Audify Mobile Audio] Background session successfully primed & unlocked');
    } catch (e) {
      // Will retry on next interaction
    }
  }

  window.__audifyUnlockAudio = unlockAudioSession;

  ['touchstart', 'touchend', 'pointerdown', 'click', 'keydown'].forEach(evt => {
    window.addEventListener(evt, () => {
      if (!isUnlocked) unlockAudioSession();
    }, { passive: true });
  });

  // 3. Screen WakeLock API
  async function requestWakeLock() {
    if ('wakeLock' in navigator && !wakeLock) {
      try {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => {
          wakeLock = null;
        });
      } catch (err) {
        // Ignored if power-saver active
      }
    }
  }

  // 4. MediaSession API Integration (Lockscreen Controls & Metadata)
  function setupMediaSession() {
    if (!('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler('play', () => {
        const engine = getEngine();
        if (engine && typeof engine.resume === 'function') {
          engine.resume();
        } else if (engine && typeof engine.togglePause === 'function' && engine.paused) {
          engine.togglePause();
        } else {
          const deck = engine?.liveDeck?.();
          if (deck?.player?.playVideo) {
            deck.player.playVideo();
          }
        }
        if (anchorAudio && anchorAudio.paused) {
          anchorAudio.play().catch(() => {});
        }
        navigator.mediaSession.playbackState = 'playing';
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        const engine = getEngine();
        if (engine && typeof engine.pause === 'function') {
          engine.pause();
        } else if (engine && typeof engine.togglePause === 'function' && !engine.paused) {
          engine.togglePause();
        } else {
          const deck = engine?.liveDeck?.();
          if (deck?.player?.pauseVideo) {
            deck.player.pauseVideo();
          }
        }
        if (anchorAudio && !anchorAudio.paused) {
          anchorAudio.pause();
        }
        navigator.mediaSession.playbackState = 'paused';
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        const engine = getEngine();
        if (engine && typeof engine.skip === 'function') {
          engine.skip();
        } else {
          const skipBtn = document.querySelector('button[aria-label*="skip" i], button[aria-label*="next" i], button:has(svg[data-icon="forward"])');
          if (skipBtn) skipBtn.click();
        }
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        const engine = getEngine();
        if (engine && typeof engine.seekLive === 'function') {
          engine.seekLive(0);
        } else {
          const deck = engine?.liveDeck?.();
          if (deck?.player?.seekTo) {
            deck.player.seekTo(0, true);
          }
        }
      });

      navigator.mediaSession.setActionHandler('seekto', (details) => {
        const engine = getEngine();
        const seekTime = details.seekTime;
        if (seekTime !== undefined && seekTime !== null) {
          if (engine && typeof engine.seekLive === 'function') {
            engine.seekLive(seekTime);
          } else {
            const deck = engine?.liveDeck?.();
            if (deck?.player?.seekTo) {
              deck.player.seekTo(seekTime, true);
            }
          }
        }
      });
    } catch (e) {
      console.warn('[Audify MediaSession] Handlers registration note:', e);
    }
  }

  let lastTrackId = null;

  function syncMediaSessionMetadata() {
    if (!('mediaSession' in navigator)) return;
    const engine = getEngine();
    if (!engine) return;

    const live = engine.liveDeck ? engine.liveDeck() : null;
    const cue = live?.cue || live?.track;
    if (!cue) return;

    const trackId = cue.song_id || cue.id || cue.title;
    if (trackId === lastTrackId) return;
    lastTrackId = trackId;

    const title = cue.title || 'Audify AI Set';
    const artist = cue.artist || 'Audify Resident DJ';
    const ytId = (cue.youtube_ids && cue.youtube_ids[0]) || cue.videoId || '';
    const artwork = ytId
      ? [
          { src: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`, sizes: '480x360', type: 'image/jpeg' },
          { src: `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`, sizes: '1280x720', type: 'image/jpeg' }
        ]
      : [{ src: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' }];

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: title,
        artist: artist,
        album: 'Audify Non-Stop AI Mix',
        artwork: artwork
      });
      navigator.mediaSession.playbackState = 'playing';
      requestWakeLock();
    } catch (e) {
      // Ignore
    }
  }

  // 5. Visibility Change Guardian (Mobile Screen Off / App Switch)
  document.addEventListener('visibilitychange', () => {
    const engine = getEngine();
    if (!engine) return;
    if (engine.paused) {
      if (anchorAudio && !anchorAudio.paused) anchorAudio.pause();
      return;
    }

    const live = engine.liveDeck ? engine.liveDeck() : null;
    const player = live?.player;

    if (document.hidden) {
      // Screen locked or tab backgrounded: keep audio anchor pumping
      if (anchorAudio && anchorAudio.paused && isUnlocked) {
        anchorAudio.play().catch(() => {});
      }
      if (player && !engine.paused) {
        try {
          player.unMute?.();
          player.setVolume?.(100);
          player.playVideo?.();
        } catch (_) {}
      }
    } else {
      // Returning to foreground: re-affirm high volume and wake lock
      requestWakeLock();
      if (player && !engine.paused) {
        try {
          player.unMute?.();
          player.setVolume?.(100);
          player.playVideo?.();
        } catch (_) {}
      }
    }
  });

  // Periodic metadata and lockscreen sync
  setInterval(() => {
    syncMediaSessionMetadata();
  }, 1500);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      createAnchorAudio();
      setupMediaSession();
    });
  } else {
    createAnchorAudio();
    setupMediaSession();
  }
})();
