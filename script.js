function initializeSite() {
  const btn = document.querySelector('.menu-toggle');
  const header = document.querySelector('.site-header');
  const navLinks = document.querySelectorAll('.main-nav a');
  if(!btn || !header) return;
  btn.addEventListener('click', function(){
    const expanded = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', String(!expanded));
    this.setAttribute('aria-label', expanded ? 'Open menu' : 'Close menu');
    header.classList.toggle('nav-open');
  });
  navLinks.forEach(link=>{
    link.addEventListener('click', ()=>{
      header.classList.remove('nav-open');
      const mt = document.querySelector('.menu-toggle');
      if(mt) {
        mt.setAttribute('aria-expanded','false');
        mt.setAttribute('aria-label','Open menu');
      }
    })
  })

  // Header scroll effect
  const onScroll = () => {
    if(window.scrollY > 40) header.classList.add('scrolled'); else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, {passive:true});

  // Testimonials slider
  const slides = Array.from(document.querySelectorAll('.testimonial-card'));
  if(slides.length){
    let idx = 0;
    const show = i => {
      slides.forEach((s,si)=> s.classList.toggle('active', si===i));
    }
    show(0);
    const next = ()=>{ idx = (idx+1) % slides.length; show(idx); }
    const prev = ()=>{ idx = (idx-1+slides.length) % slides.length; show(idx); }
    let timer = setInterval(next, 5000);
    const controls = document.querySelector('.slider-controls');
    if(controls){
      controls.querySelector('.next').addEventListener('click', ()=>{ next(); clearInterval(timer); timer = setInterval(next,5000); });
      controls.querySelector('.prev').addEventListener('click', ()=>{ prev(); clearInterval(timer); timer = setInterval(next,5000); });
    }
  }

}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSite);
} else {
  initializeSite();
}
