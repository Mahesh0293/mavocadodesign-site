(() => {
 const images=[...document.querySelectorAll('.service-panel>img,.catalog-art>img')];
 if (!images.length || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
 if (!('IntersectionObserver' in window)) {images.forEach(image=>image.classList.add('is-orbit-visible'));return;}
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('is-orbit-visible',entry.isIntersecting)),{threshold:.05});
 images.forEach(image=>observer.observe(image));
})();
