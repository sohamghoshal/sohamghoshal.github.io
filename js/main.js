/* =============================================
   NAVIGATION — active state & mobile toggle
   ============================================= */
(function () {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a').forEach(link => {
    const href = link.getAttribute('href');
    // Handle album pages (inside albums/) — mark Photography as active
    const inAlbums = window.location.pathname.includes('/albums/');
    if (inAlbums && (href === '../index.html' || href === 'index.html')) {
      link.classList.add('active');
    } else if (!inAlbums && path === href) {
      link.classList.add('active');
    } else if (path === '' && href === 'index.html') {
      link.classList.add('active');
    }
  });

  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      const isOpen = nav.classList.contains('open');
      toggle.setAttribute('aria-expanded', isOpen);
      const bars = toggle.querySelectorAll('span');
      if (isOpen) {
        bars[0].style.transform = 'translateY(6px) rotate(45deg)';
        bars[1].style.opacity = '0';
        bars[2].style.transform = 'translateY(-6px) rotate(-45deg)';
      } else {
        bars[0].style.transform = '';
        bars[1].style.opacity = '';
        bars[2].style.transform = '';
      }
    });

    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        const bars = toggle.querySelectorAll('span');
        bars.forEach(b => { b.style.transform = ''; b.style.opacity = ''; });
      });
    });
  }
})();

/* =============================================
   BACK TO TOP
   ============================================= */
document.querySelectorAll('.back-to-top').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

/* =============================================
   LIGHTBOX — album detail pages & music page
   ============================================= */
(function () {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const lbImg    = lightbox.querySelector('.lb-img');
  const lbClose  = lightbox.querySelector('.lightbox-close');
  const lbPrev   = lightbox.querySelector('.lb-prev');
  const lbNext   = lightbox.querySelector('.lb-next');
  const lbCount  = lightbox.querySelector('.lb-counter');

  // Collect all clickable photo items on the page (album or music)
  const items = Array.from(
    document.querySelectorAll('.album-photo-item, .music-photo-item')
  );
  if (!items.length) return;

  const srcs = items.map(item => item.querySelector('img').src);
  let current = 0;

  function open(index) {
    current = index;
    lbImg.src = srcs[current];
    if (lbCount) lbCount.textContent = `${current + 1} / ${srcs.length}`;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function go(delta) {
    current = (current + delta + srcs.length) % srcs.length;
    lbImg.src = srcs[current];
    if (lbCount) lbCount.textContent = `${current + 1} / ${srcs.length}`;
  }

  items.forEach((item, i) => item.addEventListener('click', () => open(i)));

  if (lbClose) lbClose.addEventListener('click', close);
  if (lbPrev)  lbPrev.addEventListener('click',  () => go(-1));
  if (lbNext)  lbNext.addEventListener('click',  () => go(+1));

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  go(-1);
    if (e.key === 'ArrowRight') go(+1);
  });
})();

/* =============================================
   CONTACT FORM — basic front-end handling
   ============================================= */
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const success = document.getElementById('form-success');
    if (success) {
      form.style.display = 'none';
      success.style.display = 'block';
    }
  });
})();
