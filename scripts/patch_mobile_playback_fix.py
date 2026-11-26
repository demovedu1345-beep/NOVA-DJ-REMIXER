p = r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\public\naux\static\immutable\chunks\3cq6guoi7hqi2.js"

with open(p, "r", encoding="utf-8") as f:
    text = f.read()

target_load = 'load(e,t){let i=e.cue,s=e.player,n=i.youtube_ids[e.idIndex];this.clearTimer(e),e.status="loading",e.role=t,"preload"===t?(s.mute(),s.setVolume(0)):(s.unMute(),s.setVolume(100)),this.isMobile()&&"preload"===t?(s.cueVideoById?s.cueVideoById({videoId:n,startSeconds:this.startSecondsOf(i)}):s.loadVideoById({videoId:n,startSeconds:this.startSecondsOf(i)})):s.loadVideoById({videoId:n,startSeconds:this.startSecondsOf(i)}),this.arm(e,2e4,()=>{this.log(`Deck ${e.id} timed out loading ${i.title} [${n}]`),this.retryOrNext(e,"load",!1)}),this.emit(),"preload"===t&&this.isMobile()&&(()=>{let l=this.liveDeck();if(l?.player&&"live"===l.status&&!this.paused){try{l.player.unMute?.();l.player.setVolume?.(100);if(l.player.getPlayerState?.()===2){l.player.playVideo?.()}}catch(_){}}})()}'

replacement_load = 'load(e,t){let i=e.cue,s=e.player,n=i.youtube_ids[e.idIndex];this.clearTimer(e);if(this.isMobile()&&"preload"===t){e.status="ready";e.role=t;this.emit();return}e.status="loading";e.role=t;"preload"===t?(s.mute(),s.setVolume(0)):(s.unMute(),s.setVolume(100));s.loadVideoById({videoId:n,startSeconds:this.startSecondsOf(i)});this.arm(e,2e4,()=>{this.log(`Deck ${e.id} timed out loading ${i.title} [${n}]`),this.retryOrNext(e,"load",!1)});this.emit()}'

target_play_incoming = 'playIncoming(e){let t=e.player;this.isMobile()?(t.unMute(),t.setVolume(100)):(t.setVolume(30),t.unMute()),t.playVideo(),this.arm(e,6e3,()=>{if(!e.nudged){e.nudged=!0,this.log(`Deck ${e.id} slow to start; asking again.`),this.playIncoming(e);return}this.log(`Deck ${e.id} did not start in time.`),this.failIncoming(e,"start",!1)})}'

replacement_play_incoming = 'playIncoming(e){let t=e.player,i=e.cue,n=i?.youtube_ids?.[e.idIndex];if(this.isMobile()){t.unMute();t.setVolume(100);if(n){try{t.loadVideoById({videoId:n,startSeconds:this.startSecondsOf(i)})}catch(_){}}try{t.playVideo()}catch(_){}}else{t.setVolume(30);t.unMute();t.playVideo();}this.arm(e,6e3,()=>{if(!e.nudged){e.nudged=!0,this.log(`Deck ${e.id} slow to start; asking again.`),this.playIncoming(e);return}this.log(`Deck ${e.id} did not start in time.`),this.failIncoming(e,"start",!1)})}'

if target_load in text:
    print("Found target_load")
    text = text.replace(target_load, replacement_load)
else:
    print("ERROR: target_load NOT found!")

if target_play_incoming in text:
    print("Found target_play_incoming")
    text = text.replace(target_play_incoming, replacement_play_incoming)
else:
    print("ERROR: target_play_incoming NOT found!")

with open(p, "w", encoding="utf-8") as f:
    f.write(text)

print("Saved patch to 3cq6guoi7hqi2.js")
