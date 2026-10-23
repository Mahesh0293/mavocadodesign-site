(()=>{'use strict';
const viewKey=s=>'mavocado-note-views:'+s;
const article=document.querySelector('[data-article]');
if(article){try{const slug=article.dataset.article,key='mavocado-note-seen:'+slug;if(!sessionStorage.getItem(key)){localStorage.setItem(viewKey(slug),String((Number(localStorage.getItem(viewKey(slug)))||0)+1));sessionStorage.setItem(key,'1')}}catch(_){}}
document.querySelectorAll('[data-blog-views]').forEach(node=>{let count=0;try{count=Number(localStorage.getItem(viewKey(node.dataset.blogViews)))||0}catch(_){}node.textContent=count+(count===1?' View':' Views');node.setAttribute('aria-label',count+(count===1?' view':' views')+' on this device')});
document.querySelectorAll('.footer-subscribe').forEach(form=>form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;const email=new FormData(form).get('email');try{sessionStorage.setItem('mavocado-revamp-enquiry',JSON.stringify({subject:'Subscribe to Mavocado Notes',body:'Please send me future Mavocado Notes blog updates.\n\nEmail: '+email+'\n\nI would like to receive your design articles by email.'}));location.href='thank-you.html'}catch(_){form.querySelector('p').textContent='Please email hello@mavocado.in to request blog updates.'}}));
const player=document.querySelector('[data-reader]');if(!player||!article)return;
const status=player.querySelector('.reader-status'),play=player.querySelector('.reader-play'),seek=player.querySelector('.reader-seek'),rate=player.querySelector('.reader-rate'),time=player.querySelector('.reader-time');
player.querySelector('.article-share').addEventListener('click',async()=>{const url=document.querySelector('link[rel=canonical]').href;try{if(navigator.share)await navigator.share({title:document.title,url});else{await navigator.clipboard.writeText(url);status.textContent='Article link copied.'}}catch(e){if(e.name!=='AbortError')status.textContent='Share this article: '+url}});
if(player.dataset.reader==='clearer-website-brief'){
 const audio=new Audio('assets/blog-audio/clearer-website-brief.mp3');audio.preload='metadata';audio.className='article-audio-source';audio.hidden=true;player.append(audio);
 const format=n=>Math.floor(n/60)+':'+String(Math.floor(n%60)).padStart(2,'0');
 const draw=()=>{const duration=Number.isFinite(audio.duration)?audio.duration:0;time.textContent=format(audio.currentTime)+' / '+format(duration);seek.value=duration?String(audio.currentTime/duration*100):'0';play.setAttribute('aria-label',audio.paused?'Play article narration':'Pause article narration');play.innerHTML=audio.paused?'<svg viewBox="0 0 24 24" fill="currentColor"><path d="m9 5 11 7-11 7Z"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 5v14M16 5v14"/></svg>'};
 play.addEventListener('click',async()=>{if(!audio.paused){audio.pause();status.textContent='Audio paused.'}else{try{await audio.play();status.textContent='Playing the audio edition.'}catch(_){status.textContent='Audio could not load. Please try again or download the article PDF.'}}draw()});
 ['loadedmetadata','timeupdate','ended','pause','play'].forEach(event=>audio.addEventListener(event,draw));
 audio.addEventListener('ended',()=>{status.textContent='You’ve reached the end of this article.'});
 audio.addEventListener('error',()=>{status.textContent='The audio edition could not load. You can read the article or download its PDF.'});
 seek.addEventListener('input',()=>{if(Number.isFinite(audio.duration))audio.currentTime=audio.duration*Number(seek.value)/100;draw()});
 rate.addEventListener('change',()=>{audio.playbackRate=Number(rate.value)});
 player.querySelectorAll('[data-skip]').forEach(button=>button.addEventListener('click',()=>{if(Number.isFinite(audio.duration))audio.currentTime=Math.max(0,Math.min(audio.duration,audio.currentTime+Number(button.dataset.skip)));draw()}));
 window.addEventListener('pagehide',()=>audio.pause());draw();return;
}
status.textContent='Uses your device’s English voice. Availability depends on your browser and installed voices.';
const synth=window.speechSynthesis;
if(!synth||!('SpeechSynthesisUtterance'in window)){play.disabled=true;status.textContent='Audio narration is unavailable in this browser. You can read the article or download its PDF.';return}
const full=document.querySelector('.article-header h1').textContent+'. '+article.innerText;
const total=Math.max(1,full.split(/\s+/).length/180*60);let position=0,playing=false,paused=false,utterance=null,generation=0,base=0,lastTick=0;
const format=n=>Math.floor(n/60)+':'+String(Math.floor(n%60)).padStart(2,'0');
const draw=()=>{seek.value=String(position/full.length*100);time.textContent=format(position/full.length*total)+' / '+format(total);play.setAttribute('aria-label',playing&&!paused?'Pause article narration':'Play article narration');play.innerHTML=playing&&!paused?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 5v14M16 5v14"/></svg>':'<svg viewBox="0 0 24 24" fill="currentColor"><path d="m9 5 11 7-11 7Z"/></svg>'};
function stop(){generation++;synth.cancel();playing=false;paused=false;utterance=null}
function start(){stop();if(position>=full.length-2)position=0;const mine=++generation;let offset=Math.floor(position);while(offset>0&&offset<full.length&&!/\s/.test(full[offset-1]))offset--;position=offset;base=offset;utterance=new SpeechSynthesisUtterance(full.slice(offset));utterance.lang='en-IN';utterance.rate=Number(rate.value);const voices=synth.getVoices();const voice=voices.find(v=>v.lang.toLowerCase()==='en-in')||voices.find(v=>v.lang.startsWith('en'));if(voice)utterance.voice=voice;utterance.onstart=()=>{if(mine!==generation)return;playing=true;lastTick=performance.now();status.textContent='Playing with your device’s voice. Duration is approximate.';draw()};utterance.onboundary=e=>{if(mine!==generation)return;position=base+e.charIndex;lastTick=performance.now();draw()};utterance.onend=()=>{if(mine!==generation)return;playing=false;position=full.length;status.textContent='You’ve reached the end of this article.';draw()};utterance.onerror=e=>{if(mine!==generation||e.error==='canceled'||e.error==='interrupted')return;playing=false;status.textContent='Your device could not start narration. Check that a speech voice is installed, or read and download the article below.';draw()};playing=true;paused=false;lastTick=performance.now();synth.speak(utterance);draw()}
play.addEventListener('click',()=>{if(playing&&!paused){synth.pause();paused=true;status.textContent='Narration paused.';draw()}else if(playing&&paused){synth.resume();paused=false;lastTick=performance.now();status.textContent='Narration resumed.';draw()}else start()});
function move(next){const resume=playing&&!paused;stop();position=Math.min(full.length,Math.max(0,next));if(resume)start();else{status.textContent='Position set to '+format(position/full.length*total)+'. Press play to listen.';draw()}}
seek.addEventListener('change',()=>move(full.length*Number(seek.value)/100));
player.querySelectorAll('[data-skip]').forEach(button=>button.addEventListener('click',()=>move(position+Number(button.dataset.skip)/total*full.length)));
rate.addEventListener('change',()=>{if(playing&&!paused)start();else{stop();status.textContent='Narration speed set to '+rate.value+'×. Press play to listen.';draw()}});
setInterval(()=>{if(playing&&!paused&&synth.speaking){const now=performance.now();position=Math.min(full.length-1,position+(now-lastTick)/1000/total*full.length*Number(rate.value));lastTick=now;draw()}},500);
window.addEventListener('pagehide',stop);draw();
})();
