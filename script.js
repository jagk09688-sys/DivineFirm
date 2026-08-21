document.addEventListener('DOMContentLoaded', function(){
  const btn = document.querySelector('.menu-toggle');
  const header = document.querySelector('.site-header');
  const navLinks = document.querySelectorAll('.main-nav a');
  if(!btn || !header) return;
  btn.addEventListener('click', function(){
    const expanded = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', String(!expanded));
    header.classList.toggle('nav-open');
  });
  navLinks.forEach(link=>{
    link.addEventListener('click', ()=>{
      header.classList.remove('nav-open');
      const mt = document.querySelector('.menu-toggle');
      if(mt) mt.setAttribute('aria-expanded','false');
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

  // Mobile quick action show/hide
  const quick = document.createElement('div');
  quick.className = 'quick-action';
  quick.innerHTML = '<a href="#contact">Get a Free Quote</a><small>Call +61 410 093 694</small>';
  document.body.appendChild(quick);
  const mqShow = ()=>{ if(window.innerWidth < 480) quick.style.display='flex'; else quick.style.display='none'; }
  mqShow(); window.addEventListener('resize', mqShow);

  // Theme toggle (light / dark)
  const themeToggle = document.getElementById('theme-toggle');
  const rootEl = document.documentElement;
  const stored = localStorage.getItem('df-theme');
  if(stored === 'dark') rootEl.classList.add('theme-dark');
  const updateToggle = ()=>{ if(rootEl.classList.contains('theme-dark')) themeToggle.textContent='☀️'; else themeToggle.textContent='🌙'; }
  if(themeToggle){
    updateToggle();
    themeToggle.addEventListener('click', ()=>{
      rootEl.classList.toggle('theme-dark');
      const nowDark = rootEl.classList.contains('theme-dark');
      localStorage.setItem('df-theme', nowDark ? 'dark' : 'light');
      updateToggle();
    })
  }
});
