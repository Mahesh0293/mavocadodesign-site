(()=>{
 'use strict';
 document.body.dataset.theme='dark';
 const sections=[...document.querySelectorAll('[data-service-section]')];
 const nav=[...document.querySelectorAll('[data-service-nav]')];
 const preview=document.querySelector('.service-index-preview');
 let active='';
 function activate(section){
  if(!section||active===section.id)return;active=section.id;
  nav.forEach(a=>{if(a.dataset.serviceNav===active)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current')});
  if(preview){const image=preview.querySelector('img');image.src=section.dataset.image;image.alt=section.querySelector('h2').textContent+' service illustration';preview.href=section.dataset.proof}
 }
 if(sections.length){
  activate(sections[0]);
  let pending=false;
  function sync(){let target=sections[0];for(const section of sections){if(section.getBoundingClientRect().top<innerHeight*.42)target=section}activate(target);pending=false}
  addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(sync)}},{passive:true});
  addEventListener('resize',sync,{passive:true});
  nav.forEach(a=>a.addEventListener('click',()=>activate(document.getElementById(a.dataset.serviceNav))));
  sync();
 }
 const params=new URLSearchParams(location.search);
 if(params.get('service')==='audit'){
  const heading=document.querySelector('.enquiry-panel h2');
  if(heading)heading.textContent='Let’s Take A Fresh Look.';
  const intro=document.querySelector('.enquiry-panel>p');
  if(intro)intro.textContent='Share your website or prototype link and the page or flow you would like us to review.';
  const details=document.querySelector('#details');if(details)details.placeholder='Paste your website or prototype link, then tell us what you want to improve.';
 }
})();
// Keep the transparent header legible over the two light sections.
(()=>{const header=document.querySelector('.site-header');const light=[...document.querySelectorAll('.services-white,.values-section')];let pending=false;function sync(){const y=header.getBoundingClientRect().top+header.getBoundingClientRect().height/2;header.classList.toggle('over-light',light.some(s=>{const r=s.getBoundingClientRect();return r.top<=y&&r.bottom>=y}));pending=false}addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(sync)}},{passive:true});addEventListener('resize',sync,{passive:true});sync()})();
