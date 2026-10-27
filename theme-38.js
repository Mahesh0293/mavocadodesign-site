(() => {
 const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
 document.querySelectorAll('.timeline-shell').forEach(shell=>{
  const tabs=[...shell.querySelectorAll('[role=tab]')],panels=[...shell.querySelectorAll('[role=tabpanel]')];
  function select(i,focus=false){tabs.forEach((t,j)=>{t.setAttribute('aria-selected',String(i===j));t.tabIndex=i===j?0:-1;panels[j].hidden=i!==j});if(focus)tabs[i].focus();}
  tabs.forEach((t,i)=>{t.addEventListener('click',()=>select(i));t.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(i+1)%tabs.length;if(e.key==='ArrowLeft')next=(i-1+tabs.length)%tabs.length;if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;if(next!==undefined){e.preventDefault();select(next,true)}})});
  if(!reduce){new IntersectionObserver((es,o)=>{if(es.some(e=>e.isIntersecting)){shell.classList.add('timeline-visible');o.disconnect()}},{threshold:.25}).observe(shell)}
 });
 if(!document.body.classList.contains('dark-inner'))return;
 const header=document.querySelector('.site-header');const compact=()=>header.classList.toggle('is-compact',scrollY>80);addEventListener('scroll',compact,{passive:true});compact();
 const time=()=>document.querySelectorAll('.india-time').forEach(e=>e.textContent=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Kolkata'}).format(new Date()));time();setInterval(time,60000);
 document.querySelectorAll('a.audit-trigger').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));
 const groups=[...document.querySelectorAll('.service-tabs')];
 groups.forEach(group=>{const tabs=[...group.querySelectorAll('[role=tab]')];function choose(i,focus=false){tabs.forEach((t,j)=>{t.setAttribute('aria-selected',String(i===j));t.tabIndex=i===j?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=i!==j});if(focus)tabs[i].focus();updateStacks()};tabs.forEach((t,i)=>{t.addEventListener('click',()=>choose(i));t.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();choose((i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length,true)}})})});
 const rows=[...document.querySelectorAll('.service-row')];rows.forEach((row,i)=>{row.style.setProperty('--stack-i',i%6);row.style.zIndex=String(i%6+1)});
 let scheduled=false;function updateStacks(){scheduled=false;if(reduce)return;document.querySelectorAll('[role=tabpanel]:not([hidden])').forEach(panel=>{const items=[...panel.querySelectorAll('.service-row')];items.forEach((row,i)=>{if(!items[i+1])return;const top=+getComputedStyle(row).top.replace('px',''),h=row.offsetHeight,p=Math.max(0,Math.min(1,(top+h-items[i+1].getBoundingClientRect().top)/Math.max(1,h))),card=row.querySelector('.service-stack-card');card.style.setProperty('--stack-scale',1-p*.055);card.style.setProperty('--stack-opacity',1-p*.35);card.style.setProperty('--stack-blur',p*.65+'px')})})}addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateStacks)}},{passive:true});addEventListener('resize',updateStacks);
 if(!reduce){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');io.unobserve(e.target)}}),{threshold:.08});document.querySelectorAll('.business-grid article,.portfolio-card,.article-card,.studio-origin,.value-grid article,.cs-section-head').forEach(el=>{el.classList.add('reveal38');io.observe(el)});}
})();
