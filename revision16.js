(()=>{'use strict';
document.querySelectorAll('[data-lab-audit]').forEach(link=>link.addEventListener('click',()=>{const field=document.querySelector('#audit-form [name="source_content"]');if(field){field.value='Experience Lab';field.defaultValue='Experience Lab'}}));
})();
