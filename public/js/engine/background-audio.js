// =========================================================================
// Audify Mobile MediaSession, WakeLock & Visibility Playback Guardian
// Avoids competing parent-document audio loops that steal YouTube audio focus
// =========================================================================

(function initBackgroundAudio() {
  if (typeof window === 'undefined') return;
  if (window.__audify_bg_audio_initialized) return;
  window.__audify_bg_audio_initialized = true;

  let isUnlocked = false;
  let wakeLock = null;

  function getEngine() {
    return window.__nauxEngine || window.__novaOrchestrator || null;
  }

  // Unlock Audio Session Hook (no competing foreground <audio> element)
  async function unlockAudioSession() {
    if (isUnlocked) return;
    isUnlocked = true;
    requestWakeLock();
  }

  window.__audifyUnlockAudio = unlockAudioSession;

  ['touchstart', 'touchend', 'pointerdown', 'click', 'keydown'].forEach(evt => {
    window.addEventListener(evt, () => {
      if (!isUnlocked) unlockAudioSession();
    }, { capture: true, passive: true });
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
    if (!engine || engine.paused) return;

    const live = engine.liveDeck ? engine.liveDeck() : null;
    const player = live?.player;

    if (!document.hidden) {
      requestWakeLock();
    }
    if (player && !engine.paused) {
      try {
        if (!live?.awaitingUnmuteGesture) {
          player.unMute?.();
          player.setVolume?.(100);
        }
        player.playVideo?.();
      } catch (_) {}
    }
  });

  // Periodic metadata, lockscreen & playback watchdog
  setInterval(() => {
    syncMediaSessionMetadata();
    const engine = getEngine();
    if (engine && !engine.paused && engine.started && !engine.finished) {
      const live = engine.liveDeck ? engine.liveDeck() : null;
      if (live?.player && live.status === 'live' && !engine.crossfading && !engine.awaitingStart) {
        if (typeof live.player.getPlayerState === 'function' && live.player.getPlayerState() === 2) {
          try {
            if (!live.awaitingUnmuteGesture) {
              live.player.unMute?.();
              live.player.setVolume?.(100);
            }
            live.player.playVideo?.();
          } catch (_) {}
        }
      }
    }
  }, 1000);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupMediaSession);
  } else {
    setupMediaSession();
  }
})();
