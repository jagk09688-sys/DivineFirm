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

const SUPABASE_URL = 'https://bguzkzwispgvgcctwepc.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_xKW8U3VVo3iDGoaidI0hBQ_RTYK4H9M';
const WORK_BUCKET = 'work-photos';
const supabaseClient = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
  : null;

async function getWorkItems() {
  if (!supabaseClient) return [];
  const { data, error } = await supabaseClient.storage.from(WORK_BUCKET).list('', {
    limit: 100,
    sortBy: { column: 'created_at', order: 'desc' }
  });
  if (error) return [];

  const files = data.filter(file => file.name && file.name.includes('__before.'));
  return files.map(beforeFile => {
    const baseName = beforeFile.name.replace(/__before\.[^.]+$/, '');
    const afterFile = data.find(file => file.name.startsWith(`${baseName}__after.`));
    if (!afterFile) return null;
    const before = supabaseClient.storage.from(WORK_BUCKET).getPublicUrl(beforeFile.name).data.publicUrl;
    const after = supabaseClient.storage.from(WORK_BUCKET).getPublicUrl(afterFile.name).data.publicUrl;
    return { title: baseName.replace(/^[^_]+_/, '').replace(/-/g, ' '), before, after, beforeName: beforeFile.name, afterName: afterFile.name };
  }).filter(Boolean);
}

async function initializeWorkGallery() {
  const gallery = document.querySelector('#work-gallery');
  if (!gallery) return;

  const items = await getWorkItems();
  if (!items.length) {
    gallery.innerHTML = '<p class="work-empty">Our latest cleaning transformations will appear here soon.</p>';
    return;
  }

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

  const renderItems = async () => {
    const items = await getWorkItems();
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
    signInDirector(new FormData(login), loginStatus, showManager);
  });

  if (supabaseClient) {
    supabaseClient.auth.getSession().then(({ data }) => {
      if (data.session) showManager();
    });
  }

  uploadForm.addEventListener('submit', async event => {
    event.preventDefault();
    const beforeFile = document.querySelector('#before-photo').files[0];
    const afterFile = document.querySelector('#after-photo').files[0];
    if (!beforeFile || !afterFile) return;
    uploadStatus.textContent = 'Preparing photos...';
    const title = document.querySelector('#work-title').value.trim();
    const id = `${Date.now()}_${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
    const beforePath = `${id}__before.${getExtension(beforeFile)}`;
    const afterPath = `${id}__after.${getExtension(afterFile)}`;
    const beforeResult = await supabaseClient.storage.from(WORK_BUCKET).upload(beforePath, beforeFile, { upsert: false });
    const afterResult = await supabaseClient.storage.from(WORK_BUCKET).upload(afterPath, afterFile, { upsert: false });
    if (beforeResult.error || afterResult.error) {
      uploadStatus.textContent = beforeResult.error?.message || afterResult.error?.message || 'Upload failed.';
      return;
    }
      uploadForm.reset();
      uploadStatus.textContent = 'Published to the customer gallery.';
      await renderItems();
      await initializeWorkGallery();
  });

  itemsContainer.addEventListener('click', async event => {
    const button = event.target.closest('[data-remove-work]');
    if (!button) return;
    const items = await getWorkItems();
    const item = items[Number(button.dataset.removeWork)];
    if (item) await supabaseClient.storage.from(WORK_BUCKET).remove([item.beforeName, item.afterName]);
    await renderItems();
    await initializeWorkGallery();
  });

  signout.addEventListener('click', async () => {
    if (supabaseClient) await supabaseClient.auth.signOut();
    manager.hidden = true;
    loginPanel.hidden = false;
  });
}

async function signInDirector(formData, status, showManager) {
  if (!supabaseClient) {
    status.textContent = 'The photo service is unavailable.';
    return;
  }
  const { error } = await supabaseClient.auth.signInWithPassword({
    email: formData.get('director-email'),
    password: formData.get('director-password')
  });
  if (error) {
    status.textContent = error.message;
    return;
  }
  status.textContent = '';
  showManager();
}

function getExtension(file) {
  const extension = file.name.split('.').pop().toLowerCase();
  return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension) ? extension : 'jpg';
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSite);
} else {
  initializeSite();
}
