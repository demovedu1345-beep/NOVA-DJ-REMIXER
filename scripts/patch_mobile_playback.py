import sys

path = 'public/naux/static/immutable/chunks/3cq6guoi7hqi2.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update load(e,t) to use cueVideoById on mobile preload and auto-recover liveDeck
old_load = 's.loadVideoById({videoId:n,startSeconds:this.startSecondsOf(i)}),this.arm(e,2e4,()=>{this.log(`Deck ${e.id} timed out loading ${i.title} [${n}]`),this.retryOrNext(e,"load",!1)}),this.emit(),"preload"===t&&this.isMobile()&&(()=>{let l=this.liveDeck();l?.player&&"live"===l.status&&(l.player.unMute?.(),l.player.setVolume?.(100))})()'
new_load = 'this.isMobile()&&"preload"===t?(s.cueVideoById?s.cueVideoById({videoId:n,startSeconds:this.startSecondsOf(i)}):s.loadVideoById({videoId:n,startSeconds:this.startSecondsOf(i)})):s.loadVideoById({videoId:n,startSeconds:this.startSecondsOf(i)}),this.arm(e,2e4,()=>{this.log(`Deck ${e.id} timed out loading ${i.title} [${n}]`),this.retryOrNext(e,"load",!1)}),this.emit(),"preload"===t&&this.isMobile()&&(()=>{let l=this.liveDeck();if(l?.player&&"live"===l.status&&!this.paused){try{l.player.unMute?.();l.player.setVolume?.(100);if(l.player.getPlayerState?.()===2){l.player.playVideo?.()}}catch(_){}}})()'

assert old_load in content, "old_load not found in 3cq6guoi7hqi2.js"
content = content.replace(old_load, new_load, 1)

# 2. Update onStateChange to handle cued state (5) and resume live player if paused on mobile
old_state = '"loading"===e.status&&"preload"===e.role?(this.clearTimer(e),e.player.pauseVideo(),e.player.seekTo(this.startSecondsOf(e.cue),!0),e.status="ready",this.isMobile()&&(()=>{let l=this.liveDeck();l?.player&&"live"===l.status&&(l.player.unMute?.(),l.player.setVolume?.(100))})(),this.log(`Deck ${e.id} cued: ${e.cue.title}`),this.emit(),this.pendingHandoff&&this.requestHandoff(this.pendingHandoff))'
new_state = '"loading"===e.status&&"preload"===e.role?(this.clearTimer(e),e.player.pauseVideo(),e.player.seekTo(this.startSecondsOf(e.cue),!0),e.status="ready",this.isMobile()&&(()=>{let l=this.liveDeck();if(l?.player&&"live"===l.status&&!this.paused){try{l.player.unMute?.();l.player.setVolume?.(100);if(l.player.getPlayerState?.()===2){l.player.playVideo?.()}}catch(_){}}})(),this.log(`Deck ${e.id} cued: ${e.cue.title}`),this.emit(),this.pendingHandoff&&this.requestHandoff(this.pendingHandoff)):5===t&&"loading"===e.status&&"preload"===e.role?(this.clearTimer(e),e.status="ready",this.log(`Deck ${e.id} cued (state 5): ${e.cue.title}`),this.emit(),this.pendingHandoff&&this.requestHandoff(this.pendingHandoff))'

assert old_state in content, "old_state not found in 3cq6guoi7hqi2.js"
content = content.replace(old_state, new_state, 1)

# 3. Update keepLiveAudible() to auto-recover if live player is paused while engine is active
old_keep = 'if(e&&t&&"function"==typeof t.getVolume){let i=t.isMuted?.()??!1,s=t.getVolume?.()??0;(i||s<100)&&(e.volumeFixed||this.log(`Volume fix on ${e.cue?.title}: was ${i?"muted":s}`),e.volumeFixed=!0,t.unMute?.(),t.setVolume?.(100))}'
new_keep = 'if(e&&t){if("function"==typeof t.getVolume){let i=t.isMuted?.()??!1,s=t.getVolume?.()??0;(i||s<100)&&(e.volumeFixed||this.log(`Volume fix on ${e.cue?.title}: was ${i?"muted":s}`),e.volumeFixed=!0,t.unMute?.(),t.setVolume?.(100))}if(!this.paused&&!this.crossfading&&!this.awaitingStart&&"live"===e.status&&"function"==typeof t.getPlayerState&&2===t.getPlayerState()){try{t.playVideo()}catch(_){}}}'

assert old_keep in content, "old_keep not found in 3cq6guoi7hqi2.js"
content = content.replace(old_keep, new_keep, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully patched mobile playback in 3cq6guoi7hqi2.js!")
