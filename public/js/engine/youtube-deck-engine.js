let ytApiPromise = null;

export function loadYouTubeIframeApi(timeoutMs = 15000) {
  if (window.YT && typeof window.YT.Player === 'function') {
    return Promise.resolve(window.YT);
  }
  if (!ytApiPromise) {
    ytApiPromise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        ytApiPromise = null;
        reject(new Error('YouTube IFrame API timed out. Check network or script blockers.'));
      }, timeoutMs);

      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        clearTimeout(timer);
        prev?.();
        resolve(window.YT);
      };

      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = () => {
        clearTimeout(timer);
        ytApiPromise = null;
        reject(new Error('Failed to download YouTube IFrame API.'));
      };
      document.head.appendChild(script);
    });
  }
  return ytApiPromise;
}

export class YouTubeDeckEngine {
  constructor(hostEl, callbacks = {}) {
    this.host = hostEl;
    this.cb = callbacks;
    this.ready = false;
    this.decks = {
      A: { id: 'A', player: null, status: 'empty', track: null, timer: null, role: 'preload' },
      B: { id: 'B', player: null, status: 'empty', track: null, timer: null, role: 'preload' },
    };
    this.fadeTimer = null;
    this.readyResolvers = { A: null, B: null };
    this.cueWaiters = { A: [], B: [] };

    // Playlist & continuous playback state
    this.queue = [];
    this.queueIndex = 0;
    this.activeDeckId = 'A';
    this.isPlaying = false;
    this.shuffle = false;
    this.repeat = 'off'; // 'off' | 'all' | 'one'
    this.bestPart = true;
    this.crossfadeSec = 4;
    this.playbackTimer = null;
    this.isCrossfading = false;
    this.preloadingNext = false;
    this.lastPreloadedTrackId = null;
  }

  async init() {
    if (this.ready) return;
    const YT = await loadYouTubeIframeApi();
    await Promise.all([
      this.#createPlayer(YT, this.decks.A),
      this.#createPlayer(YT, this.decks.B),
    ]);
    this.ready = true;
  }

  #createPlayer(YT, deck) {
    return new Promise((resolve, reject) => {
      const slot = document.createElement('div');
      slot.id = `nova-yt-deck-${deck.id}`;
      this.host.appendChild(slot);

      const timeout = setTimeout(() => reject(new Error(`YT Deck ${deck.id} init timeout`)), 15000);
      deck.player = new YT.Player(slot, {
        width: '320',
        height: '180',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            clearTimeout(timeout);
            resolve();
          },
          onStateChange: (ev) => this.#onStateChange(deck, ev.data),
          onError: (ev) => this.#onError(deck, ev.data),
        },
      });
    });
  }

  #resolveCueWaiters(deckId, ok) {
    const waiters = this.cueWaiters[deckId];
    if (!waiters?.length) return;
    this.cueWaiters[deckId] = [];
    for (const fn of waiters) fn(ok);
  }

  #onStateChange(deck, stateCode) {
    if (!deck.track) return;
    // 1 = PLAYING, 0 = ENDED
    if (stateCode === 1) {
      // Whenever a track starts playing (stateCode === 1), immediately restore volume to 100% and unmute
      if (deck.role === 'live' || this.activeDeckId === deck.id) {
        try {
          deck.player.unMute?.();
          deck.player.setVolume?.(100);
        } catch {}
      }
      try {
        const realDur = deck.player.getDuration?.();
        if (realDur && realDur > 10 && (!deck.track.durationSec || Math.abs(deck.track.durationSec - realDur) > 8)) {
          deck.track.durationSec = Math.round(realDur);
        }
      } catch {}

      if (deck.status === 'loading' && deck.role === 'preload') {
        clearTimeout(deck.timer);
        try {
          deck.player.pauseVideo();
          const startAt = deck.track.playFull ? 0 : (deck.track.entrySec || 0);
          deck.player.seekTo(startAt, true);
        } catch {}
        deck.status = 'ready';
        this.#resolveCueWaiters(deck.id, true);
        this.cb.onDeckReady?.(deck.id, deck.track);
      } else if (deck.status === 'loading' && deck.role === 'live') {
        clearTimeout(deck.timer);
        try {
          deck.player.unMute?.();
          deck.player.setVolume?.(100);
        } catch {}
        deck.status = 'live';
        this.#resolveCueWaiters(deck.id, true);
        this.cb.onDeckLive?.(deck.id, deck.track);
      } else if (deck.status === 'waiting-fade') {
        clearTimeout(deck.timer);
        try {
          deck.player.unMute?.();
          deck.player.setVolume?.(100);
        } catch {}
        deck.status = 'live';
        deck.role = 'live';
        this.readyResolvers[deck.id]?.(true);
        this.readyResolvers[deck.id] = null;
      }
    } else if (stateCode === 0 && deck.role === 'live' && deck.status === 'live') {
      this.cb.onTrackEnded?.(deck.id, deck.track);
    }
  }

  #onError(deck, code) {
    clearTimeout(deck.timer);
    this.#resolveCueWaiters(deck.id, false);
    if (this.readyResolvers[deck.id]) {
      this.readyResolvers[deck.id](false);
      this.readyResolvers[deck.id] = null;
    }
    const unplayableCodes = [100, 101, 150, 'timeout'];
    const isUnplayable = unplayableCodes.includes(code);
    this.cb.onDeckError?.(deck.id, deck.track, code);
    if (isUnplayable && deck.track) {
      this.cb.onAutoSkipped?.(deck.track, code);
      if (this.queue.length > 0 && deck.id === this.activeDeckId && this.isPlaying) {
        setTimeout(() => this.nextTrack(true), 200);
      }
    }
  }

  async ensureTrackVideoId(track) {
    if (!track) return null;
    if (track.videoId) return track.videoId;
    if (!this.resolvedVideoIds) this.resolvedVideoIds = new Map();
    const cacheKey = track.id || track.title;
    if (this.resolvedVideoIds.has(cacheKey)) {
      track.videoId = this.resolvedVideoIds.get(cacheKey);
      return track.videoId;
    }
    try {
      const cleanArtist = (track.artist || '').replace(/\s*·\s*\d{4}\s*$/, '').trim();
      const q = `${track.title} ${cleanArtist} official audio`;
      const res = await fetch(`/api/youtube-search?q=${encodeURIComponent(q)}&max=1`);
      if (res.ok) {
        const data = await res.json();
        if (data.results?.[0]?.videoId) {
          track.videoId = data.results[0].videoId;
          if (!track.artwork) track.artwork = data.results[0].artwork || `https://i.ytimg.com/vi/${track.videoId}/hqdefault.jpg`;
          this.resolvedVideoIds.set(cacheKey, track.videoId);
          return track.videoId;
        }
      }
    } catch {}
    track.videoId = 'BddP6PYo2gs';
    return track.videoId;
  }

  async load(deckId, track, role = 'preload', playMode = 'club') {
    const deck = this.decks[deckId];
    if (!deck?.player || !track) return;
    clearTimeout(deck.timer);
    this.#resolveCueWaiters(deckId, false);
    deck.track = track;
    deck.role = role;
    deck.status = 'loading';

    await this.ensureTrackVideoId(track);

    const startSec = track.playFull ? 0 : Math.max(0, Number(track.entrySec ?? 0));

    try {
      if (role === 'preload') {
        deck.player.mute();
        deck.player.setVolume(0);
      } else {
        deck.player.unMute();
        deck.player.setVolume(100);
      }
      deck.player.loadVideoById({ videoId: track.videoId, startSeconds: startSec });
      if (role === 'live') {
        deck.player.playVideo();
      }
    } catch {}

    deck.timer = setTimeout(() => {
      if (deck.status === 'loading') {
        this.#resolveCueWaiters(deckId, false);
        this.cb.onDeckError?.(deckId, track, 'timeout');
      }
    }, 18000);
  }

  waitForReady(deckId, timeoutMs = 5500) {
    const deck = this.decks[deckId];
    if (!deck) return Promise.resolve(false);
    if (deck.status === 'ready' || deck.status === 'live') return Promise.resolve(true);
    if (deck.status === 'empty') return Promise.resolve(false);
    return new Promise((resolve) => {
      let done = false;
      const timer = setTimeout(() => {
        if (done) return;
        done = true;
        resolve(deck.status === 'ready' || deck.status === 'live');
      }, timeoutMs);
      this.cueWaiters[deckId].push((ok) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        resolve(ok);
      });
    });
  }

  async playPreloaded(deckId) {
    const deck = this.decks[deckId];
    if (!deck?.player) return false;
    return new Promise((resolve) => {
      deck.status = 'waiting-fade';
      let settled = false;
      const finish = (ok) => {
        if (settled) return;
        settled = true;
        clearTimeout(retryTimer);
        clearTimeout(deck.timer);
        this.readyResolvers[deckId] = null;
        resolve(ok);
      };

      this.readyResolvers[deckId] = finish;
      try {
        deck.player.setVolume(0);
        deck.player.unMute();
        deck.player.playVideo();
      } catch {}

      // Fallback if strict autoplay policy blocks unmuted play() outside user gesture:
      // start muted (always allowed), then unmute inside #onStateChange(1) at 0% volume!
      const retryTimer = setTimeout(() => {
        if (settled || deck.status !== 'waiting-fade') return;
        try {
          deck.player.mute();
          deck.player.setVolume(0);
          deck.player.playVideo();
        } catch {}
      }, 1800);

      deck.timer = setTimeout(() => finish(false), 5200);
    });
  }

  crossfade(outDeckId, inDeckId, durationMs = 5000, style = 'phrase') {
    return new Promise((resolve) => {
      const outDeck = this.decks[outDeckId];
      const inDeck = this.decks[inDeckId];
      if (this.fadeTimer) clearInterval(this.fadeTimer);

      const start = performance.now();
      this.fadeTimer = setInterval(() => {
        const p = Math.min(1, (performance.now() - start) / durationMs);
        // High-power Serato-grade Constant Loudness Equal-Power Curve
        // Both decks stay at ~92% volume at midpoint so volume NEVER dips
        const pIn = Math.pow(Math.sin((p * Math.PI) / 2), 0.28);
        const pOut = Math.pow(Math.cos((p * Math.PI) / 2), 0.28);
        let volIn = Math.round(Math.min(100, Math.max(25, 100 * pIn)));
        let volOut = Math.round(Math.min(100, Math.max(0, 100 * pOut)));

        if (style === 'sweep_cut') {
          // Riser builds incoming fast, hard cut outgoing at 70%
          volIn = p < 0.65 ? Math.round(60 + 40 * (p / 0.65)) : 100;
          volOut = p < 0.65 ? Math.round(100 - 15 * (p / 0.65)) : Math.round(Math.max(0, 85 * (1 - (p - 0.65) / 0.35)));
        } else if (style === 'echo_drop' || style === 'drum_roll') {
          // Outgoing stays loud until sudden drop at 60%, incoming slams in at 100%
          volIn = p < 0.5 ? Math.round(70 + 30 * (p / 0.5)) : 100;
          volOut = p < 0.5 ? 100 : Math.round(Math.max(0, 100 * (1 - (p - 0.5) / 0.5)));
        }

        try {
          if (inDeck?.player) inDeck.player.setVolume(Math.round(Math.max(0, Math.min(100, volIn))));
          if (outDeck?.player && outDeck.track) outDeck.player.setVolume(Math.round(Math.max(0, Math.min(100, volOut))));
        } catch {}

        if (p >= 1) {
          clearInterval(this.fadeTimer);
          this.fadeTimer = null;
          if (outDeck?.player) {
            try {
              outDeck.player.pauseVideo();
              outDeck.player.mute();
            } catch {}
            outDeck.status = 'empty';
            outDeck.track = null;
          }
          if (inDeck?.player) {
            try {
              inDeck.player.unMute();
              inDeck.player.setVolume(100);
            } catch {}
            inDeck.status = 'live';
            inDeck.role = 'live';
          }
          resolve();
        }
      }, 40);
    });
  }

  fadeOutDeck(deckId, durationMs = 2500) {
    return new Promise((resolve) => {
      const deck = this.decks[deckId];
      if (!deck?.player) return resolve();
      const start = performance.now();
      const t = setInterval(() => {
        const p = Math.min(1, (performance.now() - start) / durationMs);
        try {
          deck.player.setVolume(Math.round(100 * Math.cos((p * Math.PI) / 2)));
        } catch {}
        if (p >= 1) {
          clearInterval(t);
          try {
            deck.player.pauseVideo();
            deck.player.mute();
          } catch {}
          deck.status = 'empty';
          deck.track = null;
          resolve();
        }
      }, 40);
    });
  }

  pause(deckId) {
    try { this.decks[deckId]?.player?.pauseVideo(); } catch {}
  }

  resume(deckId) {
    try {
      const p = this.decks[deckId]?.player;
      p?.unMute();
      p?.setVolume(100);
      p?.playVideo();
    } catch {}
  }

  seek(deckId, sec) {
    try { this.decks[deckId]?.player?.seekTo(sec, true); } catch {}
  }

  setVolume(deckId, vol01) {
    try {
      const p = this.decks[deckId]?.player;
      if (!p) return;
      if (vol01 <= 0.01) p.mute();
      else {
        p.unMute();
        p.setVolume(Math.round(Math.max(0, Math.min(100, vol01 * 100))));
      }
    } catch {}
  }

  getPosition(deckId) {
    const d = this.decks[deckId];
    if (!d?.player || d.status !== 'live') return null;
    try {
      return {
        seconds: d.player.getCurrentTime() || 0,
        duration: d.player.getDuration() || d.track?.durationSec || 0,
      };
    } catch {
      return null;
    }
  }

  stopAll() {
    this.#stopPlaybackLoop();
    this.isPlaying = false;
    this.isCrossfading = false;
    this.preloadingNext = false;
    this.lastPreloadedTrackId = null;
    if (this.fadeTimer) clearInterval(this.fadeTimer);
    for (const id of ['A', 'B']) {
      clearTimeout(this.decks[id].timer);
      this.#resolveCueWaiters(id, false);
      try {
        this.decks[id].player?.pauseVideo();
        this.decks[id].player?.mute();
      } catch {}
      this.decks[id].status = 'empty';
      this.decks[id].track = null;
    }
    this.cb.onPlaybackStateChange?.(this.getPlaybackState());
  }

  // ==========================================
  // PLAYLIST, QUEUE & BEST-PART PLAYBACK ENGINE
  // ==========================================

  setQueue(tracks = [], { startIndex = 0, autoPlay = true, bestPart = true, crossfadeSec = 4 } = {}) {
    this.queue = Array.isArray(tracks) ? [...tracks] : [];
    this.queueIndex = Math.max(0, Math.min(Math.max(0, this.queue.length - 1), startIndex));
    this.bestPart = Boolean(bestPart);
    this.crossfadeSec = Math.max(0, Math.min(8, Number(crossfadeSec) || 0));
    this.preloadingNext = false;
    this.lastPreloadedTrackId = null;

    if (autoPlay && this.queue.length > 0) {
      this.playTrackAtIndex(this.queueIndex);
    }
    this.cb.onPlaybackStateChange?.(this.getPlaybackState());
  }

  getCurrentTrack() {
    return this.queue[this.queueIndex] || this.decks[this.activeDeckId]?.track || null;
  }

  getPlaybackState() {
    const liveDeck = this.decks[this.activeDeckId];
    let currentTime = 0;
    let duration = 0;
    try {
      currentTime = liveDeck?.player?.getCurrentTime?.() || 0;
      duration = liveDeck?.player?.getDuration?.() || liveDeck?.track?.durationSec || 0;
    } catch {}

    return {
      currentTrack: this.getCurrentTrack(),
      activeDeckId: this.activeDeckId,
      isPlaying: this.isPlaying,
      currentTime,
      duration,
      queue: [...this.queue],
      queueIndex: this.queueIndex,
      shuffle: this.shuffle,
      repeat: this.repeat,
      bestPart: this.bestPart,
      crossfadeSec: this.crossfadeSec,
      isCrossfading: this.isCrossfading,
    };
  }

  async playTrackAtIndex(index, immediate = false) {
    if (!this.queue.length || index < 0 || index >= this.queue.length) return false;
    this.queueIndex = index;
    const track = this.queue[this.queueIndex];
    if (!track) return false;

    await this.ensureTrackVideoId(track);
    if (!track.videoId) track.videoId = 'BddP6PYo2gs';

    await this.init();

    const currentDeckId = this.activeDeckId;
    const targetDeckId = (immediate || !this.isPlaying) ? currentDeckId : (currentDeckId === 'A' ? 'B' : 'A');

    const startSec = this.bestPart
      ? Number(track.hookStartSec ?? (track.entrySec ?? Math.round((track.durationSec || 180) * 0.25)))
      : 0;

    this.load(targetDeckId, { ...track, entrySec: startSec, playFull: !this.bestPart }, 'live');
    this.activeDeckId = targetDeckId;
    this.isPlaying = true;
    this.preloadingNext = false;
    this.lastPreloadedTrackId = null;
    this.isCrossfading = false;

    if (targetDeckId !== currentDeckId && this.decks[currentDeckId].status === 'live') {
      try {
        this.decks[currentDeckId].player?.pauseVideo();
        this.decks[currentDeckId].player?.mute();
        this.decks[currentDeckId].status = 'empty';
      } catch {}
    }

    this.#startPlaybackLoop();
    this.cb.onTrackChange?.(track, this.queueIndex);
    this.cb.onPlaybackStateChange?.(this.getPlaybackState());
    return true;
  }

  togglePlayPause() {
    const deck = this.decks[this.activeDeckId];
    if (this.isPlaying) {
      this.pause(this.activeDeckId);
      this.isPlaying = false;
      this.#stopPlaybackLoop();
    } else {
      if (!deck?.track && this.queue.length > 0) {
        return this.playTrackAtIndex(this.queueIndex);
      }
      this.resume(this.activeDeckId);
      this.isPlaying = true;
      this.#startPlaybackLoop();
    }
    this.cb.onPlaybackStateChange?.(this.getPlaybackState());
    return this.isPlaying;
  }

  nextTrack(autoSkipped = false) {
    if (!this.queue.length) return;
    const nextIdx = this.#getNextIndex();
    if (nextIdx >= 0) {
      this.playTrackAtIndex(nextIdx);
    } else {
      this.stopAll();
    }
  }

  prevTrack() {
    if (!this.queue.length) return;
    const deck = this.decks[this.activeDeckId];
    let curTime = 0;
    try { curTime = deck?.player?.getCurrentTime?.() || 0; } catch {}
    const startSec = this.bestPart
      ? Number(deck?.track?.hookStartSec ?? Math.round((deck?.track?.durationSec || 180) * 0.25))
      : 0;

    if (curTime > startSec + 3) {
      this.seekTo(startSec);
      return;
    }

    const prevIdx = this.queueIndex > 0 ? this.queueIndex - 1 : (this.repeat === 'all' ? this.queue.length - 1 : 0);
    this.playTrackAtIndex(prevIdx);
  }

  seekTo(seconds) {
    const sec = Math.max(0, Number(seconds) || 0);
    this.seek(this.activeDeckId, sec);
    this.cb.onPlaybackStateChange?.(this.getPlaybackState());
  }

  setCrossfadeSec(seconds) {
    this.crossfadeSec = Math.max(0, Math.min(8, Number(seconds) || 0));
    this.cb.onPlaybackStateChange?.(this.getPlaybackState());
  }

  setBestPartMode(enabled) {
    this.bestPart = Boolean(enabled);
    const track = this.getCurrentTrack();
    if (this.isPlaying && track) {
      const liveDeck = this.decks[this.activeDeckId];
      if (liveDeck?.player) {
        try {
          const cur = liveDeck.player.getCurrentTime?.() || 0;
          const hookStart = Number(track.hookStartSec ?? Math.round((track.durationSec || 180) * 0.25));
          if (this.bestPart && cur < hookStart) {
            liveDeck.player.seekTo(hookStart, true);
          }
        } catch {}
      }
    }
    this.cb.onPlaybackStateChange?.(this.getPlaybackState());
  }

  toggleShuffle() {
    this.shuffle = !this.shuffle;
    this.cb.onPlaybackStateChange?.(this.getPlaybackState());
    return this.shuffle;
  }

  toggleRepeat() {
    const modes = ['off', 'all', 'one'];
    const idx = modes.indexOf(this.repeat);
    this.repeat = modes[(idx + 1) % modes.length];
    this.cb.onPlaybackStateChange?.(this.getPlaybackState());
    return this.repeat;
  }

  addToQueue(track) {
    if (!track) return;
    this.queue.push(track);
    this.cb.onPlaybackStateChange?.(this.getPlaybackState());
    if (!track.videoId) {
      this.ensureTrackVideoId(track).catch(() => {});
    }
  }

  removeFromQueue(index) {
    if (index < 0 || index >= this.queue.length) return;
    const isCurrent = (index === this.queueIndex);
    this.queue.splice(index, 1);
    if (isCurrent) {
      if (this.queue.length === 0) {
        this.stopAll();
      } else {
        this.queueIndex = Math.min(this.queueIndex, this.queue.length - 1);
        this.playTrackAtIndex(this.queueIndex);
      }
    } else if (index < this.queueIndex) {
      this.queueIndex = Math.max(0, this.queueIndex - 1);
    }
    this.cb.onPlaybackStateChange?.(this.getPlaybackState());
  }

  reorderQueue(fromIdx, toIdx) {
    if (fromIdx < 0 || fromIdx >= this.queue.length || toIdx < 0 || toIdx >= this.queue.length) return;
    const currentTrack = this.queue[this.queueIndex];
    const [moved] = this.queue.splice(fromIdx, 1);
    this.queue.splice(toIdx, 0, moved);
    if (currentTrack) {
      this.queueIndex = this.queue.findIndex(t => t.id === currentTrack.id);
    }
    this.cb.onPlaybackStateChange?.(this.getPlaybackState());
  }

  #getNextIndex() {
    if (!this.queue.length) return -1;
    if (this.repeat === 'one') return this.queueIndex;
    if (this.shuffle && this.queue.length > 1) {
      let rand = Math.floor(Math.random() * this.queue.length);
      if (rand === this.queueIndex) rand = (rand + 1) % this.queue.length;
      return rand;
    }
    if (this.queueIndex + 1 < this.queue.length) return this.queueIndex + 1;
    if (this.repeat === 'all') return 0;
    return -1;
  }

  #getNextTrack() {
    const idx = this.#getNextIndex();
    return idx >= 0 ? this.queue[idx] : null;
  }

  #startPlaybackLoop() {
    if (this.playbackTimer) clearInterval(this.playbackTimer);
    this.playbackTimer = setInterval(() => this.#onPlaybackTick(), 200);
  }

  #stopPlaybackLoop() {
    if (this.playbackTimer) {
      clearInterval(this.playbackTimer);
      this.playbackTimer = null;
    }
  }

  async #onPlaybackTick() {
    if (!this.isPlaying || this.isCrossfading) return;
    const liveDeck = this.decks[this.activeDeckId];
    if (!liveDeck?.player || liveDeck.status !== 'live') return;

    let curTime = 0;
    let dur = 0;
    try {
      curTime = liveDeck.player.getCurrentTime?.() || 0;
      dur = liveDeck.player.getDuration?.() || liveDeck.track?.durationSec || 0;
    } catch {
      return;
    }

    const track = liveDeck.track;
    if (!track) return;

    this.cb.onTimeUpdate?.(curTime, dur, track);

    let targetEnd = dur || track.durationSec || 180;
    if (this.bestPart) {
      const hookStart = Number(track.hookStartSec ?? (track.entrySec ?? Math.round((dur || 180) * 0.25)));
      const hookDur = Number(track.hookDurationSec ?? 35);
      const hookEnd = Number(track.hookEndSec ?? (hookStart + hookDur));
      targetEnd = Math.min(dur > 15 ? dur : hookEnd, hookEnd);
    }

    const timeLeft = targetEnd - curTime;

    const preloadThreshold = Math.max(3.5, this.crossfadeSec + 3);
    if (timeLeft <= preloadThreshold && !this.preloadingNext) {
      const nextTrack = this.#getNextTrack();
      if (nextTrack && this.lastPreloadedTrackId !== nextTrack.id) {
        this.preloadingNext = true;
        this.lastPreloadedTrackId = nextTrack.id;
        const otherDeckId = this.activeDeckId === 'A' ? 'B' : 'A';
        const nextStart = this.bestPart
          ? Number(nextTrack.hookStartSec ?? Math.round((nextTrack.durationSec || 180) * 0.25))
          : 0;
        this.load(otherDeckId, { ...nextTrack, entrySec: nextStart, playFull: !this.bestPart }, 'preload');
      }
    }

    if (timeLeft <= Math.max(0.3, this.crossfadeSec)) {
      await this.#triggerAutoTransition();
    }
  }

  async #triggerAutoTransition() {
    if (this.isCrossfading) return;
    this.isCrossfading = true;

    const fromDeckId = this.activeDeckId;
    const toDeckId = fromDeckId === 'A' ? 'B' : 'A';
    const nextIdx = this.#getNextIndex();

    if (nextIdx < 0) {
      await this.fadeOutDeck(fromDeckId, Math.max(1000, this.crossfadeSec * 1000));
      this.isPlaying = false;
      this.isCrossfading = false;
      this.#stopPlaybackLoop();
      this.cb.onPlaybackStateChange?.(this.getPlaybackState());
      return;
    }

    const nextTrack = this.queue[nextIdx];
    this.queueIndex = nextIdx;

    if (this.decks[toDeckId].track?.id !== nextTrack.id || this.decks[toDeckId].status !== 'ready') {
      const nextStart = this.bestPart
        ? Number(nextTrack.hookStartSec ?? Math.round((nextTrack.durationSec || 180) * 0.25))
        : 0;
      this.load(toDeckId, { ...nextTrack, entrySec: nextStart, playFull: !this.bestPart }, 'preload');
      await this.waitForReady(toDeckId, 3500);
    }

    await this.playPreloaded(toDeckId);

    if (this.crossfadeSec <= 0.1) {
      try {
        this.decks[fromDeckId].player?.pauseVideo();
        this.decks[fromDeckId].player?.mute();
      } catch {}
      this.decks[fromDeckId].status = 'empty';
      this.decks[toDeckId].status = 'live';
      this.decks[toDeckId].role = 'live';
      try {
        this.decks[toDeckId].player?.unMute();
        this.decks[toDeckId].player?.setVolume(100);
      } catch {}
    } else {
      await this.crossfade(fromDeckId, toDeckId, this.crossfadeSec * 1000, 'phrase');
    }

    this.activeDeckId = toDeckId;
    this.isCrossfading = false;
    this.preloadingNext = false;
    this.lastPreloadedTrackId = null;

    this.cb.onTrackChange?.(nextTrack, this.queueIndex);
    this.cb.onPlaybackStateChange?.(this.getPlaybackState());
  }
}
