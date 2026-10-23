(()=>{
'use strict';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
// Count each metric only when it enters the viewport. Accessible labels retain the final values.
const counters=[...document.querySelectorAll('[data-count]')];
if(!reduced&&'IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;observer.unobserve(entry.target);const node=entry.target,target=Number(node.dataset.count),suffix=node.dataset.suffix||'',start=performance.now();function frame(now){const t=Math.min(1,(now-start)/1100),value=Math.round(target*(1-Math.pow(1-t,3)));node.textContent=value+suffix;if(t<1)requestAnimationFrame(frame)}requestAnimationFrame(frame)}),{threshold:.5});counters.filter(node=>!node.dataset.suffix.includes(':')).forEach(node=>observer.observe(node))}
// The review drafts form one continuous row, with a persistent pause control.
document.querySelectorAll('.client-section').forEach(section=>{const button=section.querySelector('.reviews-toggle'),track=section.querySelector('.review-track');button?.addEventListener('click',()=>{const paused=track.classList.toggle('is-paused');button.setAttribute('aria-pressed',String(paused));button.innerHTML=paused?'Play Reviews <span aria-hidden="true">▷</span>':'Pause Reviews <span aria-hidden="true">Ⅱ</span>'})});
// A native dialog supplies focus containment, Escape closing and background inertness.
const dialog=document.querySelector('.audit-dialog'),form=document.querySelector('#audit-form');let trigger;
function openAudit(el){trigger=el;dialog.showModal();document.body.classList.add('audit-open');if(!reduced)dialog.scrollTop=0;dialog.querySelector('input').focus({preventScroll:true})}
document.querySelectorAll('[data-audit-open]').forEach(el=>el.addEventListener('click',event=>{event.preventDefault();openAudit(el)}));
dialog.querySelector('.audit-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()});
dialog.addEventListener('close',()=>{document.body.classList.remove('audit-open');trigger?.focus({preventScroll:true})});
form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;const values=new FormData(form),clean=name=>String(values.get(name)||'').trim(),subject=`Free UX audit request — ${clean('company')}`,body=[`Name: ${clean('name')}`,`Email: ${clean('email')}`,`Company: ${clean('company')}`,`Website or app: ${clean('link')}`,'','What I’d like reviewed:',clean('review')].join('\n');try{sessionStorage.setItem('mavocado-revamp-enquiry',JSON.stringify({subject,body}));location.href='thank-you.html'}catch(_){form.querySelector('.form-status').textContent='Your browser could not save the request. Please email hello@mavocado.in.'}});
if(location.hash==='#free-ux-audit'||new URLSearchParams(location.search).get('service')==='audit')openAudit([...document.querySelectorAll('[data-audit-open]')].find(el=>el.getClientRects().length));
})();
