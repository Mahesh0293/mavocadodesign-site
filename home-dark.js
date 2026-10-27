(() => {
 'use strict';
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const header=document.querySelector('.site-header');
 const menu=document.querySelector('#mobile-menu'), menuButton=document.querySelector('.menu-button');
 function closeMenu(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.querySelector('span').textContent='+';}
 menuButton.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;menuButton.setAttribute('aria-expanded',String(open));menuButton.querySelector('span').textContent=open?'−':'+';});
 menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
 addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
 document.addEventListener('click',e=>{if(!menu.hidden&&!menu.contains(e.target)&&!menuButton.contains(e.target))closeMenu();});
 // A segmented textured ribbon bends continuously across the full hero width.
 const gallery=document.querySelector('.hero-gallery'),track=gallery.querySelector('.gallery-track');
 let galleryOffset=0,galleryWidth=0,hovered=false,dragging=false,dragStart=0,dragOffset=0,moved=false,visible=true,previous=0;
 let ribbon=null,curve=-.65,curveTarget=-.65,dragVelocity=0,lastPointerX=0;
 const cards=[...track.querySelectorAll('.gallery-card')].slice(0,6);
 function measureGallery(){galleryWidth=track.children[6].offsetLeft-track.children[0].offsetLeft;ribbon?.resize();}
 // Fit the complete bowed silhouette inside the frame, including pointer extremes.
 function fittedRibbonCurve(cardHeight,frameHeight){
  const remaining=Math.max(0,frameHeight*.5-18-cardHeight*.5);
  const limit=remaining/(cardHeight*1.945);
  return limit*Math.tanh(curve/.65);
 }
 function makeCanvasRibbon(){
  const canvas=document.createElement('canvas');canvas.className='ribbon-canvas';canvas.setAttribute('aria-hidden','true');const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return null;
  let ready=false,width=0,height=0,cardWidth=0,cardHeight=0,extent=1,lastDraw=0;
  const atlas=document.createElement('canvas');atlas.width=3072;atlas.height=352;const ac=atlas.getContext('2d');
  function resize(){const b=gallery.getBoundingClientRect();width=b.width;height=b.height;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingEnabled=true;cardWidth=Math.min(innerWidth<=700?205:width*.17,height*(innerWidth<=700?.75:.60),260);cardHeight=cardWidth/1.5+22;extent=width*1.04/cardWidth/6;}
  Promise.all(cards.map(a=>new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>resolve(null);im.src=a.querySelector('img').src;}))).then(images=>{if(images.some(im=>!im))return;images.forEach((im,i)=>{const x=i*512;ac.fillStyle=cards[i].classList.contains('lime')?'#b8f019':'#100ed8';ac.fillRect(x+5,0,502,352);const scale=Math.min(502/im.naturalWidth,352/im.naturalHeight),w=im.naturalWidth*scale,h=im.naturalHeight*scale;ac.drawImage(im,x+5+(502-w)/2,(352-h)/2,w,h);});ready=true;gallery.classList.add('has-ribbon');gallery.dataset.renderer='canvas2d';});
  gallery.prepend(canvas);resize();
  return {resize,draw(){const now=performance.now();if(!ready||now-lastDraw<14)return;lastDraw=now;ctx.clearRect(0,0,width,height);const bend=fittedRibbonCurve(cardHeight,height),stride=2,sourceWidth=stride/width*extent*atlas.width;for(let x=0;x<width;x+=stride){const nx=x/width*2-1,edge=Math.pow(Math.abs(nx),5),stretch=1+edge*Math.abs(bend)*1.65,centre=height/2+Math.sign(nx)*edge*bend*cardHeight*1.12,h=cardHeight*stretch;const uv=((x/width*extent+galleryOffset/Math.max(1,galleryWidth))%1+1)%1,sourceX=uv*atlas.width;ctx.drawImage(atlas,sourceX,0,Math.min(sourceWidth,atlas.width-sourceX),atlas.height,x,centre-h/2,stride+.6,h);}},hit(e){const b=canvas.getBoundingClientRect(),bend=fittedRibbonCurve(cardHeight,b.height),x=e.clientX-b.left,y=e.clientY-b.top,nx=x/b.width*2-1,edge=Math.pow(Math.abs(nx),5),centre=b.height/2+Math.sign(nx)*edge*bend*cardHeight*1.12,h=cardHeight*(1+edge*Math.abs(bend)*1.65);if(Math.abs(y-centre)>h/2)return null;const uv=((x/b.width*extent+galleryOffset/Math.max(1,galleryWidth))%1+1)%1;return cards[Math.floor(uv*6)]?.href;}};
 }

 function makeRibbon(){
  if(reduced.matches)return null;
  const canvas=document.createElement('canvas');canvas.className='ribbon-canvas';canvas.setAttribute('aria-hidden','true');
  const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false});if(!gl)return makeCanvasRibbon();
  const vertex=`attribute vec2 a_position;uniform vec2 u_view;uniform float u_height;uniform float u_curve;uniform float u_extent;uniform float u_offset;varying vec2 v_uv;
  void main(){float nx=(a_position.x*2.0-1.0)*1.04;float edge=pow(min(abs(nx),1.0),5.0);float stretch=1.0+edge*abs(u_curve)*1.65;float y=(a_position.y-.5)*u_height*stretch+sign(nx)*edge*u_curve*u_height*1.12;gl_Position=vec4(nx,-y/(u_view.y*.5),0.,1.);v_uv=vec2(a_position.x*u_extent+u_offset,a_position.y);}`;
  const fragment=`precision mediump float;uniform sampler2D u_image;varying vec2 v_uv;void main(){vec4 c=texture2D(u_image,vec2(fract(v_uv.x),v_uv.y));if(c.a<.05)discard;gl_FragColor=c;}`;
  function shader(type,source){const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error('Ribbon shader unavailable');return sh;}
  let program;
  try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))return makeCanvasRibbon();}catch{return makeCanvasRibbon();}
  gl.useProgram(program);
  const vertices=[];for(let i=0;i<240;i++){const x=i/240,n=(i+1)/240;vertices.push(x,0,n,0,x,1,x,1,n,0,n,1);}
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);const attr=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);
  const uniforms=Object.fromEntries(['view','height','curve','extent','offset','image'].map(n=>[n,gl.getUniformLocation(program,'u_'+n)]));
  const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  let ready=false,width=0,height=0,cardWidth=0,cardHeight=0,extent=1;
  function resize(){const b=gallery.getBoundingClientRect();width=b.width;height=b.height;const dpr=Math.min(devicePixelRatio||1,1.75);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);gl.viewport(0,0,canvas.width,canvas.height);cardWidth=Math.min(innerWidth<=700?205:width*.17,height*(innerWidth<=700?.75:.60),260);cardHeight=cardWidth/1.5+22;extent=width*1.04/cardWidth/6;}
  Promise.all(cards.map(a=>new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>resolve(null);im.src=a.querySelector('img').src;}))).then(images=>{
   if(images.some(im=>!im))return;
   const atlas=document.createElement('canvas');atlas.width=3072;atlas.height=352;const ctx=atlas.getContext('2d');
   images.forEach((im,i)=>{const x=i*512;ctx.fillStyle=cards[i].classList.contains('lime')?'#b8f019':'#100ed8';ctx.fillRect(x+5,0,502,352);const scale=Math.min(502/im.naturalWidth,352/im.naturalHeight);const w=im.naturalWidth*scale,h=im.naturalHeight*scale;ctx.drawImage(im,x+5+(502-w)/2,(352-h)/2,w,h);});
   gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,atlas);ready=true;gallery.classList.add('has-ribbon');
  });
  gallery.prepend(canvas);resize();
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();ready=false;gallery.classList.remove('has-ribbon');});
  return {resize,draw(){if(!ready)return;gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(program);gl.uniform2f(uniforms.view,width,height);gl.uniform1f(uniforms.height,cardHeight);gl.uniform1f(uniforms.curve,fittedRibbonCurve(cardHeight,height));gl.uniform1f(uniforms.extent,extent);gl.uniform1f(uniforms.offset,galleryOffset/Math.max(1,galleryWidth));gl.uniform1i(uniforms.image,0);gl.drawArrays(gl.TRIANGLES,0,vertices.length/2);},hit(e){const b=canvas.getBoundingClientRect(),bend=fittedRibbonCurve(cardHeight,b.height),x=e.clientX-b.left,y=e.clientY-b.top,nx=x/b.width*2-1,edge=Math.pow(Math.abs(nx),5),centre=b.height/2+Math.sign(nx)*edge*bend*cardHeight*1.12,h=cardHeight*(1+edge*Math.abs(bend)*1.65);if(Math.abs(y-centre)>h/2)return null;const uv=((x/b.width*extent+galleryOffset/Math.max(1,galleryWidth))%1+1)%1;return cards[Math.floor(uv*6)]?.href;}};
 }
 ribbon=makeRibbon();measureGallery();addEventListener('resize',measureGallery);document.fonts.ready.then(measureGallery);
 gallery.addEventListener('pointerenter',()=>hovered=true);gallery.addEventListener('pointerleave',()=>{hovered=false;curveTarget=-.65;});
 gallery.addEventListener('pointermove',e=>{const b=gallery.getBoundingClientRect();curveTarget=-.65+(e.clientY-b.top-b.height/2)/b.height*1.5+(e.clientX-b.left-b.width/2)/b.width*.6;});
 gallery.addEventListener('focusin',()=>hovered=true);gallery.addEventListener('focusout',()=>hovered=false);
 gallery.addEventListener('dragstart',e=>e.preventDefault());
 gallery.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;dragging=true;moved=false;dragStart=e.clientX;lastPointerX=e.clientX;dragOffset=galleryOffset;dragVelocity=0;});
 addEventListener('pointermove',e=>{if(!dragging)return;const distance=e.clientX-dragStart;if(Math.abs(distance)>6)moved=true;galleryOffset=dragOffset-distance;dragVelocity=(lastPointerX-e.clientX)*.45;lastPointerX=e.clientX;});
 addEventListener('pointerup',()=>dragging=false);addEventListener('pointercancel',()=>dragging=false);
 gallery.addEventListener('click',e=>{if(e.target.closest('button'))return;if(moved){e.preventDefault();moved=false;return;}if(e.target.matches('.ribbon-canvas')){const href=ribbon?.hit(e);if(href)location.href=href;}});
 gallery.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();galleryOffset+=e.key==='ArrowRight'?260:-260;}});
 document.addEventListener('visibilitychange',()=>visible=!document.hidden);
 new IntersectionObserver(entries=>{gallery.dataset.visible=String(entries[0].isIntersecting);},{rootMargin:'100px'}).observe(gallery);
 // Pinned process story follows native scroll with a damped progress value.
 const approach=document.querySelector('.approach-section'),stage=approach.querySelector('.approach-stage'),card=approach.querySelector('.approach-card');
 const stepText=[['We start with discovery. Your business, your audience and the problem worth solving.','INTRO CALL<br>RESEARCH & SCOPE<br>A CLEAR STARTING POINT'],['We connect the dots. Structure, prototypes and a visual language with a clear purpose.','USER FLOWS<br>DESIGN & PROTOTYPE<br>REVIEW TOGETHER'],['Ready for the world. We refine the details and stay close through design handoff.','DESIGN QA<br>DEVELOPER HANDOFF<br>LAUNCH SUPPORT']];
 let approachProgress=0,approachTarget=0,currentStep=-1,approachVisible=false;
 new IntersectionObserver(entries=>{approachVisible=entries[0].isIntersecting;},{rootMargin:'200px'}).observe(approach);
 const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
 function updateScroll(){header.classList.toggle('is-compact',scrollY>110);const box=approach.getBoundingClientRect();approachTarget=clamp(-box.top/Math.max(1,approach.offsetHeight-innerHeight),0,1);}
 addEventListener('scroll',updateScroll,{passive:true});addEventListener('resize',updateScroll);updateScroll();
 function processMotion(){
  approachProgress+=(approachTarget-approachProgress)*.065;
  const phase=clamp(approachProgress*3,0,2.9999),step=Math.floor(phase),local=phase-step;
  if(step!==currentStep){currentStep=step;card.querySelector('.approach-step').textContent=`0${step+1} / 03`;card.querySelector('.approach-card-copy').textContent=stepText[step][0];card.querySelector('.approach-card-tags').innerHTML=stepText[step][1];card.classList.toggle('is-lime',step===1);approach.querySelectorAll('[data-step-word]').forEach((word,i)=>word.classList.toggle('is-active',i===step));}
  const mobile=innerWidth<=700,travel=mobile?Math.max(0,Math.min(innerWidth*.24,(stage.clientWidth-card.offsetWidth)/2-30)):Math.min(innerWidth*.31,500);
  // The card moves within safe margins, leaving the active word visible.
  const x=travel*.9*Math.cos(approachProgress*Math.PI*2);
  const y=Math.sin(approachProgress*Math.PI*2)*(mobile?35:65);
  const rotation=Math.sin(approachProgress*Math.PI*2)*(mobile?3:6);
  card.style.transform=`translate3d(${x}px,${y}px,0) rotate(${rotation}deg)`;
  card.style.opacity='1';
 }
 function frame(time){
  const dt=previous?Math.min(time-previous,40):16;previous=time;
  if(visible){
   if(!reduced.matches&&gallery.dataset.visible!=='false'){
    if(!dragging)galleryOffset+=dt*.022;
    if(!dragging&&Math.abs(dragVelocity)>.01){galleryOffset+=dragVelocity;dragVelocity*=.94;}
    curve+=(curveTarget-curve)*.045;
   }
   if(galleryWidth){galleryOffset=((galleryOffset%galleryWidth)+galleryWidth)%galleryWidth;track.style.transform=`translate3d(${-galleryOffset}px,0,0)`;}
   if(gallery.dataset.visible!=='false')ribbon?.draw();
   if(!reduced.matches&&approachVisible)processMotion();
   if(voicesWidth){if(Math.abs(voicesImpulse)>.1){const delta=voicesImpulse*.07;voicesOffset+=delta;voicesImpulse-=delta;}if(!reduced.matches&&!voicesPaused&&!voicesHover&&!voicesDrag)voicesOffset-=dt*.022;voicesOffset=((voicesOffset%voicesWidth)+voicesWidth)%voicesWidth;voices.style.transform=`translate3d(${-voicesOffset}px,0,0)`;}
   if(stackDirty)updateStacks();
  }
  requestAnimationFrame(frame);
 }
 requestAnimationFrame(frame);
 // Floating previews follow the pointer while titles roll into italic on hover.
 document.querySelectorAll('.project-row').forEach(row=>{
  row.addEventListener('pointermove',e=>{if(reduced.matches||e.pointerType==='touch')return;const b=row.getBoundingClientRect();const x=clamp(e.clientX-b.left,160,b.width-160),y=clamp(e.clientY-b.top,85,b.height-85);row.style.setProperty('--preview-x',`${x}px`);row.style.setProperty('--preview-y',`${y}px`);});
 });
 // Tabs support arrows, Home/End, keyboard focus and screen readers.
 const tabs=[...document.querySelectorAll('.service-tabs [role=tab]')];
 function chooseTab(tab,focus=false){tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!active;});if(focus)tab.focus();}
 tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>chooseTab(tab));tab.addEventListener('keydown',e=>{let target;if(e.key==='ArrowRight')target=(i+1)%tabs.length;if(e.key==='ArrowLeft')target=(i-1+tabs.length)%tabs.length;if(e.key==='Home')target=0;if(e.key==='End')target=tabs.length-1;if(target!==undefined){e.preventDefault();chooseTab(tabs[target],true);}});});
 // Reviews loop gently from left to right; pause, arrows and touch remain available.
 const voices=document.querySelector('.voices-track'),voicesWindow=document.querySelector('.voices-window'),pauseVoices=document.querySelector('.voice-pause');
 let voicesWidth=0,voicesOffset=0,voicesPaused=false,voicesHover=false,voicesDrag=false,voiceDragX=0,voiceDragOffset=0,voicesImpulse=0;
 const originalVoices=[...voices.children];
 originalVoices.forEach(v=>{const copy=v.cloneNode(true);copy.setAttribute('aria-hidden','true');copy.querySelectorAll('a,button').forEach(a=>a.tabIndex=-1);voices.append(copy);});
 function measureVoices(){voicesWidth=voices.children[originalVoices.length].offsetLeft-voices.children[0].offsetLeft;if(!voicesOffset)voicesOffset=voicesWidth;}
 measureVoices();addEventListener('resize',measureVoices);document.fonts.ready.then(measureVoices);
 function moveVoice(direction){voicesImpulse+=direction*(originalVoices[0].getBoundingClientRect().width+36);}
 document.querySelector('.voice-next').addEventListener('click',()=>moveVoice(1));document.querySelector('.voice-prev').addEventListener('click',()=>moveVoice(-1));
 pauseVoices.addEventListener('click',()=>{voicesPaused=!voicesPaused;pauseVoices.textContent=voicesPaused?'▶':'Ⅱ';pauseVoices.setAttribute('aria-label',voicesPaused?'Play client reviews':'Pause client reviews');});
 voicesWindow.addEventListener('pointerenter',()=>voicesHover=true);voicesWindow.addEventListener('pointerleave',()=>voicesHover=false);voices.addEventListener('focus',()=>voicesHover=true);voices.addEventListener('blur',()=>voicesHover=false);
 voicesWindow.addEventListener('pointerdown',e=>{voicesDrag=true;voiceDragX=e.clientX;voiceDragOffset=voicesOffset;});
 addEventListener('pointermove',e=>{if(voicesDrag)voicesOffset=voiceDragOffset-(e.clientX-voiceDragX);});addEventListener('pointerup',()=>voicesDrag=false);addEventListener('pointercancel',()=>voicesDrag=false);
 voices.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();moveVoice(e.key==='ArrowRight'?1:-1);}});
 let stackDirty=true;
 const stackPanels=[...document.querySelectorAll('#services-panel,#industries-panel')];
 stackPanels.forEach(panel=>panel.querySelectorAll('.service-row').forEach((row,i)=>{row.style.setProperty('--stack-i',i);row.style.zIndex=String(i+1);}));
 function updateStacks(){stackDirty=false;if(reduced.matches)return;const panel=stackPanels.find(p=>!p.hidden);if(!panel)return;const rows=[...panel.querySelectorAll('.service-row')];rows.forEach((row,i)=>{const next=rows[i+1],card=row.querySelector('.service-stack-card');if(!next)return;const top=+getComputedStyle(row).top.replace('px',''),h=row.offsetHeight,nextTop=next.getBoundingClientRect().top;const p=clamp((top+h-nextTop)/Math.max(1,h),0,1);card.style.setProperty('--stack-scale',String(1-p*.055));card.style.setProperty('--stack-opacity',String(1-p*.35));card.style.setProperty('--stack-blur',`${p*.65}px`);});}
 addEventListener('scroll',()=>stackDirty=true,{passive:true});addEventListener('resize',()=>stackDirty=true);tabs.forEach(t=>t.addEventListener('click',()=>stackDirty=true));
 const proofObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){animateNumber(entry.target);proofObserver.unobserve(entry.target);}}),{threshold:.5});
 function animateNumber(el){if(reduced.matches)return;const target=el.dataset.target||el.textContent;el.dataset.target=target;el.setAttribute('aria-label',target);const m=target.match(/^(\d+)(.*)$/);if(!m)return;cancelAnimationFrame(el.countFrame||0);const end=+m[1],tail=m[2],start=performance.now();function tick(now){const t=Math.min(1,(now-start)/1800),ease=1-Math.pow(1-t,3);el.textContent=Math.round(end*ease)+tail;if(t<1)el.countFrame=requestAnimationFrame(tick);else el.textContent=target;}el.countFrame=requestAnimationFrame(tick);}
 document.querySelectorAll('.proof-strip strong').forEach(el=>{proofObserver.observe(el);let last=0;el.parentElement.addEventListener('pointerenter',()=>{if(performance.now()-last>2400){last=performance.now();animateNumber(el);}});});
 function updateIndiaTime(){document.querySelector('.india-time').textContent=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Kolkata'}).format(new Date());}updateIndiaTime();setInterval(updateIndiaTime,60000);
 // Native project and audit dialogs preserve the existing enquiry destination.
 document.querySelectorAll('dialog').forEach(dialog=>{
  let opener;
  const selector=dialog.classList.contains('project-dialog')?'.project-trigger':'.audit-trigger';
  document.querySelectorAll(selector).forEach(trigger=>trigger.addEventListener('click',e=>{e.preventDefault();closeMenu();opener=trigger;dialog.showModal();burst(trigger);}));
  dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>opener?.focus());
  dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close();});
  const form=dialog.querySelector('form'),status=form.querySelector('.form-status');
  form.addEventListener('submit',async e=>{e.preventDefault();if(!form.reportValidity())return;const button=form.querySelector('[type=submit]');button.disabled=true;status.textContent='Sending your enquiry…';try{const response=await fetch(form.action,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}});if(!response.ok)throw Error('Send failed');status.textContent='Thank you. Your enquiry has been sent to Mavocado.';form.reset();burst(button);}catch{status.textContent='Your enquiry could not be sent. Your details are still here. Try again or email hello@mavocado.in.';}finally{button.disabled=false;}});
 });
 function burst(target){if(reduced.matches)return;const b=target.getBoundingClientRect();for(let i=0;i<9;i++){const p=document.createElement('img');p.src='assets/footer-mark.svg';p.alt='';p.className='hover-logo-particle';Object.assign(p.style,{width:'24px',height:'24px',left:`${b.left+b.width/2}px`,top:`${b.top+b.height/2}px`});(target.closest('dialog')||document.body).append(p);const a=i/9*Math.PI*2;const anim=p.animate([{opacity:0,transform:'scale(.2)'},{opacity:1,offset:.2},{opacity:0,transform:`translate(${Math.cos(a)*85}px,${Math.sin(a)*85}px) rotate(40deg) scale(.5)`}],{duration:1000,easing:'cubic-bezier(.2,.7,.3,1)'});anim.finished.then(()=>p.remove());}}
 // Reveal supporting content once, without hiding links if JavaScript is absent.
 if(!reduced.matches){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target);}}),{threshold:.12});document.querySelectorAll('.about-content,.expertise-heading,.service-row,.industry-card,.faq-layout,.contact-banner h2').forEach(el=>{el.classList.add('reveal');observer.observe(el);});}
 const cursor=document.querySelector('.cursor-dot');
 if(!reduced.matches&&matchMedia('(hover:hover) and (pointer:fine)').matches){addEventListener('pointermove',e=>{if(e.target.closest('dialog')){cursor.style.display='none';return;}cursor.style.display='block';cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px';cursor.classList.toggle('over-link',!!e.target.closest('a,button,summary'));});document.addEventListener('pointerleave',()=>cursor.style.display='none');}
})();
