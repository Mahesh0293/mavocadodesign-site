// Scroll is native. Only the elements follow a damped animation timeline.
const storySection=document.querySelector('.studio-story');
const storyLines=[...document.querySelectorAll('.story-line')];
const serviceSection=document.querySelector('.services-scroll');
const servicePanels=[...document.querySelectorAll('.service-panel')];
const twistSection=document.querySelector('.twist-section');
const twistSpiral=document.querySelector('.spiral');
const approachCards=[...document.querySelectorAll('.process-twist-card')];
const deckSection=document.querySelector('.project-deck');
const deckCards=[...document.querySelectorAll('.deck-card')];
const deckTabs=[...document.querySelectorAll('.deck-tab')];
const deckPeeks=[...document.querySelectorAll('.deck-peek')];let previousPeek=-1;
const satellites=[...document.querySelectorAll('.deck-satellites img')];
const finePointer=matchMedia('(hover:hover) and (pointer:fine)').matches;
const cursor=document.querySelector('.custom-cursor');
const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
let mobileStoryIndex=0;
const state={story:0,service:0,twist:0,deck:0};
const target={...state};let deckOverride=null,frameRequested=false,lastTime=0;
const pointer={x:-100,y:-100,sx:-100,sy:-100,visible:false};
function sectionProgress(section){const top=innerWidth<=700?76:88;return clamp((top-section.getBoundingClientRect().top)/Math.max(1,section.offsetHeight-(innerHeight-top)))}
function measureTimelines(){target.story=innerWidth<=700?mobileStoryIndex:Math.round(sectionProgress(storySection)*2);target.service=Math.round(sectionProgress(serviceSection)*(servicePanels.length-1));target.twist=sectionProgress(twistSection);target.deck=deckOverride===null?sectionProgress(deckSection)*5:deckOverride;requestFrame()}
function requestFrame(){if(!frameRequested&&!document.hidden){frameRequested=true;requestAnimationFrame(renderMotion)}}
function renderMotion(time){frameRequested=false;const dt=Math.min(100,time-(lastTime||time));lastTime=time;let unsettled=false;
 for(const key of Object.keys(state)){const diff=target[key]-state[key];state[key]+=reduced?diff:diff*(1-Math.exp(-Math.max(1,dt)/180));if(Math.abs(diff)>.0005)unsettled=true;else state[key]=target[key]}
 fitStoryHeading();const phase=state.story;storyLines.forEach((line,i)=>{const delta=i-phase;const angle=clamp(delta,-1,1)*90;line.style.transform=`rotateX(${angle}deg)`;line.style.opacity=String(clamp(1-Math.abs(delta)*1.25));line.style.visibility=Math.abs(delta)>1.05?'hidden':'visible';const active=reduced?i===0:i===Math.round(phase);line.classList.toggle('is-current',active);line.setAttribute('aria-hidden',String(!active))});
 if(!reduced&&innerWidth>700)servicePanels.forEach((panel,i)=>{const d=i-state.service;panel.style.transform=`translate3d(0,${d*110}%,0)`;panel.style.opacity=String(clamp(1-Math.abs(d)*.16));panel.inert=Math.round(state.service)!==i;panel.setAttribute('aria-hidden',String(panel.inert))});
 // A held curve creates a reading pause at the front of each approach.
 const raw=state.twist*7,step=Math.floor(raw),fraction=raw-step;
 const moving=clamp((fraction-.26)/.48);const eased=moving*moving*(3-2*moving);
 const approachPhase=2+step+eased;
 const compact=innerWidth<=700,radius=compact?Math.max(65,Math.min(135,(twistSpiral.clientWidth-140)/2)):250;
 approachCards.forEach((card,i)=>{const delta=i-approachPhase,absolute=Math.abs(delta);
 const visible=absolute<1.65,angle=delta*72*Math.PI/180;
 const x=Math.sin(angle)*radius,y=delta*(compact?100:115),z=Math.cos(angle)*65-65;
 const faceAngle=clamp(Math.atan2(Math.sin(angle),Math.abs(Math.cos(angle)))*180/Math.PI,-55,55);
 card.style.transform=`translate(-50%,-50%) translate3d(${x}px,${y}px,${z}px) rotateY(${faceAngle}deg)`;
 card.style.zIndex=String(100-Math.round(absolute*30));card.style.opacity=String(clamp(1-Math.max(0,absolute-1)*.55));card.style.visibility=visible?'visible':'hidden';
 card.setAttribute('aria-hidden',String(reduced?i<2||i>9:i!==Math.round(approachPhase)));card.style.pointerEvents=reduced||i===Math.round(approachPhase)?'auto':'none';
 });
 // A continuous, reversible handoff: the current card lifts and settles behind the next.
 const phaseDeck=clamp(state.deck,0,5),base=Math.min(4,Math.floor(phaseDeck)),blend=phaseDeck-base;
 const selected=clamp(Math.round(phaseDeck),0,5);
 if(selected!==previousPeek){deckPeeks.forEach((peek,i)=>{peek.hidden=selected+i+1>=deckCards.length});previousPeek=selected;}
 deckCards.forEach((card,i)=>{
  const d=i-phaseDeck;let y=0,z=0,scale=1,rotation=0,opacity=0,layer=5;
  if(i===base){const t=blend;y=-Math.sin(t*Math.PI)*100;z=-220*t;scale=1-.12*t;rotation=Math.sin(t*Math.PI)*14;opacity=1-clamp((t-.55)/.45);layer=t<.55?40:15;}
  if(i===base+1){const t=blend;y=-32*(1-t);z=-100*(1-t);scale=.94+.06*t;rotation=-5*(1-t);opacity=clamp(t/.3);layer=30;}
  if(phaseDeck===5&&i===5){y=0;z=0;scale=1;rotation=0;opacity=1;layer=40;}
  card.style.transform=`translate3d(0,${y}px,${z}px) rotateX(${rotation}deg) scale(${scale})`;
  card.style.opacity=String(opacity);card.style.visibility=opacity<.001?'hidden':'visible';card.style.zIndex=String(layer);
  card.style.pointerEvents=i===selected?'auto':'none';card.tabIndex=i===selected?0:-1;card.setAttribute('aria-hidden',String(i!==selected));
 });
 deckTabs.forEach((tab,i)=>tab.setAttribute('aria-pressed',String(i===selected)));satellites.forEach((el,i)=>el.style.transform=`translateY(${Math.sin(state.deck*1.15+i)*20}px) rotate(${(i-1.5)*3}deg)`);
 if(pointer.visible&&finePointer&&!reduced){pointer.sx+=(pointer.x-pointer.sx)*.38;pointer.sy+=(pointer.y-pointer.sy)*.38;cursor.style.transform=`translate3d(${pointer.sx-7}px,${pointer.sy-5}px,0)`;if(Math.abs(pointer.x-pointer.sx)+Math.abs(pointer.y-pointer.sy)>.1)unsettled=true}
 if(unsettled)requestFrame();
}
addEventListener('scroll',measureTimelines,{passive:true});addEventListener('wheel',()=>{deckOverride=null},{passive:true});addEventListener('touchmove',()=>{deckOverride=null},{passive:true});document.addEventListener('pointerdown',event=>{if(!event.target.closest('.deck-tab'))deckOverride=null});addEventListener('keydown',event=>{if(['PageDown','PageUp','ArrowDown','ArrowUp','Home','End',' '].includes(event.key)&&!event.target.closest('input,textarea,select')){deckOverride=null;measureTimelines()}});addEventListener('resize',measureTimelines);document.addEventListener('visibilitychange',()=>{lastTime=0;if(!document.hidden)requestFrame()});
deckTabs.forEach((tab,i)=>tab.addEventListener('click',()=>{deckOverride=null;const top=innerWidth<=700?76:88;const length=deckSection.offsetHeight-(innerHeight-top);window.scrollTo({top:scrollY+deckSection.getBoundingClientRect().top-top+length*i/5,behavior:reduced?'instant':'smooth'});target.deck=i;requestFrame()}));
if(finePointer&&!reduced){document.documentElement.classList.add('cursor-ready');document.addEventListener('pointermove',e=>{pointer.x=e.clientX;pointer.y=e.clientY;if(!pointer.visible){pointer.sx=e.clientX;pointer.sy=e.clientY}pointer.visible=true;const input=e.target.closest('input,textarea');cursor.style.opacity=input?'0':'1';cursor.classList.toggle('is-link',Boolean(e.target.closest('a,button,summary,select')));requestFrame()},{passive:true});document.documentElement.addEventListener('pointerleave',()=>{pointer.visible=false;cursor.style.opacity='0'});document.addEventListener('pointerdown',e=>{if(e.target.closest('button,a,summary,select'))cursor.classList.add('is-pressed')});document.addEventListener('pointerup',()=>cursor.classList.remove('is-pressed'));document.addEventListener('pointercancel',()=>cursor.classList.remove('is-pressed'))}
// Number pops: a short, airy burst of miniature number bubbles, then a spring return.
document.querySelectorAll('.metric-number').forEach(metric=>{let lastPop=0;const popNumbers=()=>{if(reduced||performance.now()-lastPop<850)return;lastPop=performance.now();metric.querySelector('span').animate([{transform:'translateY(0) rotateX(0)'},{transform:'translateY(-5px)',offset:.25},{transform:'translateY(1px)',offset:.7},{transform:'none'}],{duration:850,easing:'cubic-bezier(.2,.7,.25,1)'});const rect=metric.getBoundingClientRect();const chars=metric.textContent.replace(/[^0-9]/g,'')||'01';for(let i=0;i<19;i++){const particle=document.createElement('span');particle.className='number-particle '+(i%2?'particle-lime':'particle-blue');particle.setAttribute('aria-hidden','true');particle.textContent=chars[i%chars.length];particle.style.left=`${rect.left+rect.width*.5-10}px`;particle.style.top=`${rect.top+rect.height*.4-10}px`;document.body.appendChild(particle);const angle=(i/19)*Math.PI*2;const radius=35+Math.random()*54;const x=Math.cos(angle)*radius;const y=Math.sin(angle)*radius;const animation=particle.animate([{transform:'translate(0,0) scale(.4)',opacity:0},{transform:`translate(${x*.55}px,${y*.7-15}px) scale(1)`,opacity:.75,offset:.25},{transform:`translate(${x}px,${y+32}px) scale(.6)`,opacity:0}],{duration:1100+Math.random()*500,easing:'cubic-bezier(.16,.5,.32,1)',delay:i*9});animation.finished.then(()=>particle.remove()).catch(()=>particle.remove())}};metric.addEventListener('pointerenter',popNumbers);metric.addEventListener('focus',popNumbers);metric.addEventListener('click',()=>{if(!finePointer)popNumbers()});});
// Hero particles move like a soft patch of fabric around the pointer; no background loop.
const heroSection=document.querySelector('.hero'),heroCanvas=document.querySelector('.hero-dots'),ctx=heroCanvas.getContext('2d');let dots=[],heroRAF=0,heroWidth=0,heroHeight=0,heroActive=false,heroMouse={x:-500,y:-500},heroSettle=0;
function sizeHero(){const r=heroSection.getBoundingClientRect();heroWidth=r.width;heroHeight=r.height;const dpr=Math.min(devicePixelRatio||1,2);heroCanvas.width=r.width*dpr;heroCanvas.height=r.height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);dots=[];for(let y=10;y<heroHeight;y+=18)for(let x=10;x<heroWidth;x+=18)dots.push({x,y,px:x,py:y,alpha:0});if(!heroRAF&&!reduced)heroRAF=requestAnimationFrame(drawHero)}
function drawHero(){heroRAF=0;if(reduced)return;ctx.clearRect(0,0,heroWidth,heroHeight);let moving=false;for(const dot of dots){let dx=dot.x-heroMouse.x,dy=dot.y-heroMouse.y,dist=Math.hypot(dx,dy),force=heroActive?Math.max(0,1-dist/145):0;const tx=dot.x+(dx/(dist||1))*force*21,ty=dot.y+(dy/(dist||1))*force*21;dot.px+=(tx-dot.px)*.075;dot.py+=(ty-dot.py)*.075;dot.alpha+=((force*.5)-dot.alpha)*.065;if(dot.alpha>.005){ctx.fillStyle=`rgba(58,78,130,${dot.alpha})`;ctx.beginPath();ctx.arc(dot.px,dot.py,1.05,0,Math.PI*2);ctx.fill();moving=true}}if(heroActive||moving&&heroSettle++<160)heroRAF=requestAnimationFrame(drawHero)}
if(!reduced&&finePointer){heroSection.addEventListener('pointermove',e=>{const r=heroSection.getBoundingClientRect();heroMouse={x:e.clientX-r.left,y:e.clientY-r.top};heroActive=true;heroSettle=0;if(!heroRAF)heroRAF=requestAnimationFrame(drawHero)},{passive:true});heroSection.addEventListener('pointerleave',()=>{heroActive=false;heroSettle=0;if(!heroRAF)heroRAF=requestAnimationFrame(drawHero)});addEventListener('resize',sizeHero);sizeHero()}
measureTimelines();

// The enquiry uses the same fields and Formspree destination as the live site.
const enquiryForm=document.querySelector('#footer-enquiry-form');
enquiryForm.addEventListener('submit',async event=>{event.preventDefault();if(!enquiryForm.reportValidity())return;const submit=enquiryForm.querySelector('[type=submit]'),status=enquiryForm.querySelector('.form-status');submit.disabled=true;status.textContent='Sending your project enquiry…';try{const response=await fetch(enquiryForm.action,{method:'POST',body:new FormData(enquiryForm),headers:{Accept:'application/json'}});if(!response.ok)throw new Error('Submission failed');status.textContent='Thank you. Your project enquiry has been sent to Mavocado.';enquiryForm.reset()}catch{status.textContent='Your enquiry could not be sent. Please try again or email hello@mavocado.in.'}finally{submit.disabled=false}});

// Natural heading height prevents spare lines becoming blank space on small screens.
function fitStoryHeading(){const stage=document.querySelector('.story-stage');const height=Math.max(...storyLines.map(line=>line.scrollHeight));if(stage.style.height!==`${height}px`){stage.style.height=`${height}px`;stage.style.setProperty('--cube-depth',`${height/2}px`)}}
addEventListener('resize',fitStoryHeading);document.fonts.ready.then(fitStoryHeading);fitStoryHeading();
let storyInterval=null;new IntersectionObserver(entries=>{const visible=entries[0].isIntersecting;if(visible&&innerWidth<=700&&!reduced&&!storyInterval){storyInterval=setInterval(()=>{mobileStoryIndex=(mobileStoryIndex+1)%3;target.story=mobileStoryIndex;requestFrame()},4800)}else if(!visible&&storyInterval){clearInterval(storyInterval);storyInterval=null}},{threshold:.2}).observe(storySection);
document.querySelectorAll('.faq-item').forEach(item=>item.addEventListener('toggle',()=>{if(item.open)document.querySelectorAll('.faq-item').forEach(other=>{if(other!==item)other.open=false})}));

function mobileServiceFlow(){if(innerWidth<=700){servicePanels.forEach(panel=>{panel.inert=false;panel.setAttribute('aria-hidden','false');panel.style.transform='none';panel.style.opacity='1'})}else measureTimelines()}
addEventListener('resize',mobileServiceFlow);mobileServiceFlow();
if(reduced){document.querySelectorAll('.showcase-video').forEach(video=>{video.autoplay=false;video.pause()})}
