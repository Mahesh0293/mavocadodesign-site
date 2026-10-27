(()=>{
 'use strict';
 // Hover previews, persistent touch selections and standard keyboard tab navigation.
 document.querySelectorAll('.journey40').forEach(shell=>{
  const tabs=[...shell.querySelectorAll('[role=tab]')],panels=[...shell.querySelectorAll('[role=tabpanel]')];let active=0;
  function select(i,focus=false){active=i;shell.style.setProperty('--active-week',i);tabs.forEach((tab,j)=>{tab.setAttribute('aria-selected',String(i===j));tab.tabIndex=i===j?0:-1;panels[j].hidden=i!==j});if(focus)tabs[i].focus()}
  tabs.forEach((tab,i)=>{tab.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')select(i)});tab.addEventListener('focus',()=>select(i));tab.addEventListener('click',()=>select(i));tab.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(active+1)%tabs.length;if(e.key==='ArrowLeft')next=(active+tabs.length-1)%tabs.length;if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;if(next!==undefined){e.preventDefault();select(next,true)}})});select(0);
 });
 function updateClocks(){
  const now=new Date(),ist=new Date(now.getTime()+330*60000),h=ist.getUTCHours(),m=ist.getUTCMinutes(),s=ist.getUTCSeconds();
  document.querySelectorAll('.footer-clock').forEach(clock=>{
   clock.querySelector('.clock-hour').style.transform=`rotate(${(h%12)*30+m*.5+s/120}deg)`;
   clock.querySelector('.clock-minute').style.transform=`rotate(${m*6+s*.1}deg)`;
   clock.querySelector('.clock-second').style.transform=`rotate(${s*6}deg)`;
   clock.setAttribute('aria-label',`India time ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')} IST`);
  });
 }
 updateClocks();setInterval(updateClocks,1000);
})();
