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

  initializeWorkGallery();
  initializeDirectorWorkspace();

}

const WORK_STORAGE_KEY = 'divineFirmWorkGallery';
const DIRECTOR_ACCESS_CODE = 'DF-director-2026';

function getWorkItems() {
  try {
    return JSON.parse(localStorage.getItem(WORK_STORAGE_KEY) || '[]');
  } catch (error) {
    return [];
  }
}

function initializeWorkGallery() {
  const gallery = document.querySelector('#work-gallery');
  if (!gallery) return;

  const items = getWorkItems();
  if (!items.length) return;

  gallery.innerHTML = items.map(item => `
    <article class="work-card">
      <div class="work-images">
        <figure><img src="${item.before}" alt="Before: ${item.title}"><figcaption>Before</figcaption></figure>
        <figure><img src="${item.after}" alt="After: ${item.title}"><figcaption>After</figcaption></figure>
      </div>
      <h3>${item.title}</h3>
    </article>
  `).join('');
}

function initializeDirectorWorkspace() {
  const workspace = document.querySelector('#director-workspace');
  if (!workspace || new URLSearchParams(window.location.search).get('admin') !== '1') return;
  workspace.hidden = false;
  workspace.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const login = document.querySelector('#director-login-form');
  const manager = document.querySelector('#director-manager');
  const loginPanel = document.querySelector('#director-login');
  const loginStatus = document.querySelector('#director-login-status');
  const uploadForm = document.querySelector('#work-upload-form');
  const uploadStatus = document.querySelector('#work-upload-status');
  const itemsContainer = document.querySelector('#director-items');
  const signout = document.querySelector('#director-signout');
  if (!login || !manager || !loginPanel || !uploadForm || !itemsContainer || !signout) return;

  const renderItems = () => {
    const items = getWorkItems();
    itemsContainer.innerHTML = items.length
      ? items.map((item, index) => `<div class="director-item"><span>${item.title}</span><button type="button" data-remove-work="${index}">Remove</button></div>`).join('')
      : '<p class="muted">No work photos uploaded yet.</p>';
  };

  const showManager = () => {
    loginPanel.hidden = true;
    manager.hidden = false;
    renderItems();
  };

  login.addEventListener('submit', event => {
    event.preventDefault();
    const code = new FormData(login).get('director-code');
    if (code === DIRECTOR_ACCESS_CODE) {
      sessionStorage.setItem('divineFirmDirector', 'true');
      showManager();
      loginStatus.textContent = '';
    } else {
      loginStatus.textContent = 'That access code is not recognised.';
    }
  });

  if (sessionStorage.getItem('divineFirmDirector') === 'true') showManager();

  uploadForm.addEventListener('submit', async event => {
    event.preventDefault();
    const beforeFile = document.querySelector('#before-photo').files[0];
    const afterFile = document.querySelector('#after-photo').files[0];
    if (!beforeFile || !afterFile) return;
    uploadStatus.textContent = 'Preparing photos...';
    const [before, after] = await Promise.all([readImage(beforeFile), readImage(afterFile)]);
    const items = getWorkItems();
    items.unshift({
      title: document.querySelector('#work-title').value.trim(),
      before,
      after
    });
    try {
      localStorage.setItem(WORK_STORAGE_KEY, JSON.stringify(items));
      uploadForm.reset();
      uploadStatus.textContent = 'Added to this browser’s customer gallery.';
      renderItems();
      initializeWorkGallery();
    } catch (error) {
      uploadStatus.textContent = 'The photos are too large for browser storage. Resize them and try again.';
    }
  });

  itemsContainer.addEventListener('click', event => {
    const button = event.target.closest('[data-remove-work]');
    if (!button) return;
    const items = getWorkItems();
    items.splice(Number(button.dataset.removeWork), 1);
    localStorage.setItem(WORK_STORAGE_KEY, JSON.stringify(items));
    renderItems();
    initializeWorkGallery();
  });

  signout.addEventListener('click', () => {
    sessionStorage.removeItem('divineFirmDirector');
    manager.hidden = true;
    loginPanel.hidden = false;
  });
}

function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSite);
} else {
  initializeSite();
}
