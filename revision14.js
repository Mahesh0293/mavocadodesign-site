(()=>{'use strict';
const knownSources=new Set(['blog-clearer-website-brief','blog-useful-ux-audit','blog-forms-people-can-finish','blog-clearer-saas-dashboards','blog-when-to-build-design-system','blog-brand-beyond-the-logo','ebook-startup-ux-playbook','ebook-clearer-startup-websites','ebook-from-screens-to-systems','website-enquiry-ux','nothing-pay','pawmitra','backbar','dischargeready','forme','nox']);
const params=new URLSearchParams(location.search),source=params.get('source'),page=location.pathname.split('/').pop().replace('.html','');
document.querySelectorAll('[data-enquiry-form]').forEach(form=>{
 const sourceField=form.elements.namedItem('source_content');if(sourceField&&knownSources.has(source)){sourceField.value=source;sourceField.defaultValue=source}
 const service=form.elements.namedItem('service'),context=form.elements.namedItem('enquiry_context');function updateContext(){if(context){context.value=service.selectedOptions[0]?.textContent||'';context.defaultValue=context.value}}updateContext();service.addEventListener('change',updateContext);
});
document.querySelectorAll('[data-audit-source]').forEach(link=>link.addEventListener('click',()=>{const form=document.querySelector('#audit-form'),field=form?.elements.namedItem('source_content');if(field&&knownSources.has(link.dataset.auditSource)){field.value=link.dataset.auditSource;field.defaultValue=field.value}}));
// Carry attribution through a service or project, using known content identifiers only.
if(knownSources.has(page))document.querySelectorAll('.content-next a[href^="services.html"]').forEach(link=>{const url=new URL(link.href);url.searchParams.set('source',page);link.href='services.html'+url.search+url.hash});
if(knownSources.has(source))document.querySelectorAll('.contact-band a[href*="contact.html?"],.service-detail a[href*="contact.html?"]').forEach(link=>{const url=new URL(link.href);url.searchParams.set('source',source);if(knownSources.has(page))url.searchParams.set('project',page);link.href='contact.html'+url.search+url.hash});
})();
