(()=>{
 'use strict';
 const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 document.querySelectorAll('.timeline-shell').forEach(shell=>{
  const tabs=[...shell.querySelectorAll('[role=tab]')];
  const sync=()=>{const index=Math.max(0,tabs.findIndex(t=>t.getAttribute('aria-selected')==='true'));shell.style.setProperty('--timeline-progress',`${(index+1)/tabs.length*100}%`)};
  new MutationObserver(sync).observe(shell.querySelector('.timeline-tabs'),{subtree:true,attributes:true,attributeFilter:['aria-selected']});sync();
 });
 // The footer is shared; give every time display the same live IST value.
 const clock=()=>document.querySelectorAll('.india-time').forEach(e=>e.textContent=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Kolkata'}).format(new Date()));clock();setInterval(clock,60000);
 const counters=[...document.querySelectorAll('[data-view-count]')];
 const update=counts=>counters.forEach(e=>{const n=counts[e.dataset.viewCount];if(Number.isSafeInteger(n)&&n>=0)e.querySelector('span').textContent=`${new Intl.NumberFormat('en').format(n)} ${n===1?'view':'views'}`});
 const viewsApi=window.MAVOCADO_VIEWS_API??'/api/views';
 if(!viewsApi)counters.forEach(e=>e.hidden=true);
 if(counters.length&&viewsApi)fetch(viewsApi,{headers:{Accept:'application/json'}}).then(r=>r.ok?r.json():Promise.reject()).then(update).catch(()=>counters.forEach(e=>{e.title='View totals are temporarily unavailable'}));
 const resource=document.body.dataset.resourceId;
 if(resource&&viewsApi){
  // Count a resource once per tab session. No personal data is sent or stored.
  let counted=false;try{counted=sessionStorage.getItem('mavocado-view:'+resource)==='1'}catch{}
  if(!counted)fetch(viewsApi.replace(/\/$/,'')+'/'+encodeURIComponent(resource),{method:'POST',headers:{Accept:'application/json'}}).then(r=>{if(!r.ok)throw Error();try{sessionStorage.setItem('mavocado-view:'+resource,'1')}catch{}}).catch(()=>{});
 }
})();
