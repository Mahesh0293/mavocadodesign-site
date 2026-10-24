(()=>{'use strict';
const lightbox=document.querySelector('.lightbox'),full=lightbox?.querySelector('.cs-full-resolution');
if(full)document.querySelectorAll('[data-full-image]').forEach(trigger=>trigger.addEventListener('click',()=>{full.href=trigger.dataset.fullImage}));
// The source and project reference travel with the existing Formspree form.
document.querySelectorAll('.cs-enquiry-panel form').forEach(form=>{const service=form.elements.namedItem('service'),context=form.elements.namedItem('enquiry_context');if(context)context.value=service.selectedOptions[0]?.textContent||'';});
})();
