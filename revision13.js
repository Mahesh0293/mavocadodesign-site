(()=>{'use strict';
const confirmation=document.querySelector('#submission-confirmation');let returnFocus;
function closeConfirmation(){confirmation.close()}
confirmation.querySelector('.submission-close').addEventListener('click',closeConfirmation);
confirmation.querySelector('.submission-done').addEventListener('click',closeConfirmation);
confirmation.addEventListener('close',()=>{if(returnFocus?.isConnected&&!returnFocus.closest('dialog:not([open])'))returnFocus.focus({preventScroll:true})});
confirmation.addEventListener('click',event=>{if(event.target!==confirmation)return;const r=confirmation.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)confirmation.close()});
const busy=new WeakSet();
document.querySelectorAll('[data-direct-form]').forEach(form=>{
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(busy.has(form)||!form.reportValidity())return;
  const button=form.querySelector('button[type="submit"]'),title=button.querySelector('.button-title'),status=form.querySelector('.form-status'),original=title.textContent,audit=form.dataset.directForm==='audit';
  const payload=new FormData(form);payload.set('request_type',audit?'Free UX Audit':'Project Enquiry');payload.set('_subject',audit?'Mavocado — Free UX Audit Request':'Mavocado — Project Enquiry');payload.set('page_url',location.origin+location.pathname);
  const service=form.elements.namedItem('service');if(service)payload.set('service',service.selectedOptions[0]?.textContent||service.value);
  busy.add(form);button.disabled=true;form.setAttribute('aria-busy','true');title.textContent='Sending…';status.textContent='Sending your request…';status.dataset.state='sending';
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);
  try{
   const response=await fetch(form.action,{method:'POST',body:payload,headers:{Accept:'application/json'},signal:controller.signal});
   const data=await response.json().catch(()=>null);
   if(!response.ok||!data||data.ok===false||data.errors?.length){
    const fieldNames={name:'Name',email:'Email Address',company:'Company Name',link:'Website Or App Link',review:'What You’d Like Reviewed',details:'Project Details'};
    let message='We couldn’t submit your request. Your details are still here. Please try again, or email hello@mavocado.in.';
    if(response.status===429)message='Too many requests right now. Your details are saved in this form. Please try again later or email hello@mavocado.in.';
    else if(data?.errors?.length){const fields=data.errors.map(error=>fieldNames[error.field]).filter(Boolean);if(fields.length)message='Please check '+[...new Set(fields)].join(', ')+' and try again. Your other details are still here.'}
    throw new Error(message);
   }
   // Confirm only a real successful service response; no email draft or local success simulation.
   form.reset();status.textContent='Your request has been submitted.';status.dataset.state='success';
   confirmation.querySelector('#submission-title').textContent=audit?'Your Audit Request Is In.':'Your Project Starts Here.';
   confirmation.querySelector('#submission-copy').textContent=audit?'Thanks for sharing the details. We’ll review your audit request and reply to the email address you provided.':'Thanks for telling us about your project. We’ll review the details and reply to the email address you provided.';
   returnFocus=button;const parentDialog=form.closest('dialog');if(parentDialog?.open)parentDialog.close();
   requestAnimationFrame(()=>{if(!confirmation.open)confirmation.showModal()});
  }catch(error){status.dataset.state='error';status.textContent=error.name==='AbortError'?'We couldn’t confirm your submission in time. Your details are still here. Please try again or email hello@mavocado.in.':error instanceof TypeError?'Connection interrupted. Your details are still here. Please check your connection and try again.':error.message;status.focus({preventScroll:true});}
  finally{clearTimeout(timer);busy.delete(form);button.disabled=false;form.removeAttribute('aria-busy');title.textContent=original;}
 });
});
})();
