def patch_chunk_3cq():
    path = 'public/naux/static/immutable/chunks/3cq6guoi7hqi2.js'
    with open(path, 'r', encoding='utf-8') as f:
        code = f.read()

    # 1. Patch onVisibility
    old_vis = 'onVisibility=()=>{this.keepLiveAudible();let e=this.liveDeck();e?.player&&(e.player.unMute?.(),e.player.setVolume?.(100),document.hidden&&e.player.playVideo?.())};'
    new_vis = 'onVisibility=()=>{if(this.paused)return;this.keepLiveAudible();let e=this.liveDeck();e?.player&&(e.player.unMute?.(),e.player.setVolume?.(100),document.hidden&&!this.paused&&e.player.playVideo?.())};'
    
    if old_vis in code:
        code = code.replace(old_vis, new_vis, 1)
        print("Patched onVisibility in 3cq6guoi7hqi2.js")
    else:
        print("Warning: old_vis not found!")

    # 2. Patch pause and resume
    old_pause = 'pause(){let e=this.liveDeck();if(!this.started||this.finished||this.paused||!e?.cue)return;if(this.crossfading||this.awaitingStart){this.pauseAfterFade=!0,this.emit();return}if("live"!==e.status||!e.player)return;e.player.pauseVideo(),this.paused=!0;let t=e.player.getCurrentTime();this.log(`PAUSE ${e.cue.song_id} at ${t.toFixed(1)}s`),this.event({type:"paused",cue:e.cue,at:t}),this.emit()}'
    new_pause = 'pause(){this.paused=!0;this.pauseAfterFade=!1;this.awaitingStart=null;if(this.fadeTimer){clearInterval(this.fadeTimer);this.fadeTimer=null}if(this.decks){Object.values(this.decks).forEach(d=>{try{d.player?.pauseVideo?.()}catch(_){}})}try{document.querySelectorAll("iframe").forEach(f=>{try{f.contentWindow?.postMessage(\'{"event":"command","func":"pauseVideo","args":""}\',"*")}catch(_){}})}catch(_){}try{let a=document.getElementById("audify-bg-anchor");a&&a.pause?.()}catch(_){}if("mediaSession" in navigator){try{navigator.mediaSession.playbackState="paused"}catch(_){}}let e=this.liveDeck(),t=e?.player?.getCurrentTime?.()??0;this.log(`PAUSE ${e?.cue?.song_id||"deck"} at ${t}s`);e?.cue&&this.event({type:"paused",cue:e.cue,at:t});this.emit()}'

    if old_pause in code:
        code = code.replace(old_pause, new_pause, 1)
        print("Patched pause() in 3cq6guoi7hqi2.js")
    else:
        print("Warning: old_pause not found!")

    old_resume = 'resume(){this.pauseAfterFade=!1;let e=this.liveDeck();if(!this.paused||!e?.player||!e.cue)return;this.paused=!1,e.player.playVideo();let t=e.player.getCurrentTime();this.log(`RESUME ${e.cue.song_id} at ${t.toFixed(1)}s`),this.event({type:"resumed",cue:e.cue,at:t}),this.emit(),this.pendingHandoff&&!this.awaitingStart&&this.requestHandoff(this.pendingHandoff)}'
    new_resume = 'resume(){this.paused=!1;this.pauseAfterFade=!1;let e=this.liveDeck();if(this.decks){Object.values(this.decks).forEach(d=>{if(d.id!==e?.id)try{d.player?.pauseVideo?.()}catch(_){}})}if(e?.player){try{e.player.unMute?.();e.player.setVolume?.(100);e.player.playVideo?.()}catch(_){}}try{document.querySelectorAll("iframe").forEach(f=>{if(e&&f.id&&f.id.includes(e.id)){try{f.contentWindow?.postMessage(\'{"event":"command","func":"playVideo","args":""}\',"*")}catch(_){}}})}catch(_){}try{let a=document.getElementById("audify-bg-anchor");a&&a.play?.().catch(()=>{})}catch(_){}if("mediaSession" in navigator){try{navigator.mediaSession.playbackState="playing"}catch(_){}}let t=e?.player?.getCurrentTime?.()??0;this.log(`RESUME ${e?.cue?.song_id||"deck"} at ${t}s`);e?.cue&&this.event({type:"resumed",cue:e.cue,at:t});this.emit();this.pendingHandoff&&!this.awaitingStart&&this.requestHandoff(this.pendingHandoff)}'

    if old_resume in code:
        code = code.replace(old_resume, new_resume, 1)
        print("Patched resume() in 3cq6guoi7hqi2.js")
    else:
        print("Warning: old_resume not found!")

    # 3. Remove "Plays through YouTube"
    old_pyt = 'children:["Plays through YouTube · ",(0,t.jsx)("a",{href:"/songs"'
    new_pyt = 'children:[(0,t.jsx)("a",{href:"/songs"'
    if old_pyt in code:
        code = code.replace(old_pyt, new_pyt, 1)
        print("Removed 'Plays through YouTube · ' from 3cq6guoi7hqi2.js")
    else:
        print("Warning: old_pyt not found!")

    with open(path, 'w', encoding='utf-8') as f:
        f.write(code)

def patch_background_audio():
    path = 'public/js/engine/background-audio.js'
    with open(path, 'r', encoding='utf-8') as f:
        code = f.read()

    # Update play action
    old_play = """      navigator.mediaSession.setActionHandler('play', () => {
        const engine = window.__nauxEngine;
        const deck = engine?.liveDeck?.();
        if (deck?.player?.playVideo) {
          deck.player.playVideo();
        }
        if (anchorAudio && anchorAudio.paused) {
          anchorAudio.play().catch(() => {});
        }
        navigator.mediaSession.playbackState = 'playing';
      });"""

    new_play = """      navigator.mediaSession.setActionHandler('play', () => {
        const engine = window.__nauxEngine;
        if (engine && typeof engine.resume === 'function') {
          engine.resume();
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
      });"""

    old_pause = """      navigator.mediaSession.setActionHandler('pause', () => {
        const engine = window.__nauxEngine;
        const deck = engine?.liveDeck?.();
        if (deck?.player?.pauseVideo) {
          deck.player.pauseVideo();
        }
        navigator.mediaSession.playbackState = 'paused';
      });"""

    new_pause = """      navigator.mediaSession.setActionHandler('pause', () => {
        const engine = window.__nauxEngine;
        if (engine && typeof engine.pause === 'function') {
          engine.pause();
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
      });"""

    code = code.replace(old_play, new_play, 1)
    code = code.replace(old_pause, new_pause, 1)

    # In visibility listener
    old_vis = """  document.addEventListener('visibilitychange', () => {
    const engine = window.__nauxEngine;
    if (!engine) return;

    const live = engine.liveDeck ? engine.liveDeck() : null;
    const player = live?.player;"""

    new_vis = """  document.addEventListener('visibilitychange', () => {
    const engine = window.__nauxEngine;
    if (!engine) return;
    if (engine.paused) {
      if (anchorAudio && !anchorAudio.paused) anchorAudio.pause();
      return;
    }

    const live = engine.liveDeck ? engine.liveDeck() : null;
    const player = live?.player;"""

    code = code.replace(old_vis, new_vis, 1)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(code)
    print("Patched background-audio.js")

def patch_app_js():
    path = 'public/js/ui/app.js'
    with open(path, 'r', encoding='utf-8') as f:
        code = f.read()

    # Remove Plays through YouTube ·
    old_yt = 'Plays through YouTube · <a id="link-party-lists"'
    new_yt = '<a id="link-party-lists"'
    if old_yt in code:
        code = code.replace(old_yt, new_yt)
        print("Removed Plays through YouTube from app.js")

    with open(path, 'w', encoding='utf-8') as f:
        f.write(code)

if __name__ == '__main__':
    patch_chunk_3cq()
    patch_background_audio()
    patch_app_js()
