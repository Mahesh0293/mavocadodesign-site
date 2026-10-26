(() => {
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 function burst(link,brand=false){
  if(reduced.matches)return;
  const source=brand?null:link.querySelector('.social-icon');
  if(!brand&&!source)return;
  const box=(brand?link.querySelector('img'):source).getBoundingClientRect();
  const cx=box.left+box.width/2,cy=brand?box.bottom:box.top+box.height/2;
  for(let i=0;i<9;i++){
   const p=brand?document.createElement('img'):source.cloneNode(true);
   if(brand){p.src='assets/footer-mark.svg';p.alt='';}
   p.removeAttribute('id');p.setAttribute('aria-hidden','true');p.classList.add('hover-logo-particle');
   const size=brand?32:20;p.style.width=`${size}px`;p.style.height=`${size}px`;p.style.left=`${cx-size/2}px`;p.style.top=`${cy-size/2}px`;p.style.color=i%2?'#b8f019':(brand?'#080ed2':'#ffffff');
   document.body.append(p);
   const angle=brand?(.12+i/8*.76)*Math.PI:(i/9)*Math.PI*2,reach=brand?64+(i%3)*12:42+(i%3)*13,x=Math.cos(angle)*reach,y=Math.sin(angle)*reach;
   const animation=p.animate([{transform:'translate(0,0) scale(.25)',opacity:0},{transform:`translate(${x*.4}px,${y*.4}px) scale(.9)`,opacity:.95,offset:.3},{transform:`translate(${x}px,${y+14}px) rotate(${i%2?22:-22}deg) scale(.5)`,opacity:0}],{duration:brand?1350:1050,delay:i*18,easing:'cubic-bezier(.18,.6,.25,1)'});
   animation.finished.then(()=>p.remove(),()=>p.remove());
  }
 }
 document.querySelectorAll('.footer-social-grid>a,header>a.brand').forEach(link=>{
  let last=-1500;const play=()=>{if(performance.now()-last<1200)return;last=performance.now();burst(link,link.matches('.brand'));};
  link.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')play();});
  if(link.matches('.brand'))link.addEventListener('pointermove',event=>{if(event.pointerType!=='touch')play();});
  link.addEventListener('focus',()=>{if(link.matches(':focus-visible'))play();});
 });
 document.querySelectorAll('header nav[aria-label="Main navigation"]>a,#mobile-menu>a').forEach(link=>{
  const label=link.textContent.trim();link.setAttribute('aria-label',label);
  const window=document.createElement('span');window.className='nav-roll-window';window.setAttribute('aria-hidden','true');
  const strip=document.createElement('span');strip.className='nav-roll-strip';
  for(let i=0;i<3;i++){const word=document.createElement('span');word.textContent=label;strip.append(word);}
  window.append(strip);link.replaceChildren(window);
 });
})();
