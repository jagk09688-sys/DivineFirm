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
});
