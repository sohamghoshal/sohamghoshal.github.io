/* =============================================
   NAVIGATION — active state & mobile toggle
   ============================================= */
(function () {
  const path = window.location.pathname.split('/').pop() || 'index.html';

  // Inner-page top nav (header nav) and homepage sidebar nav both get the
  // active class when their href matches the current page.
  document.querySelectorAll('nav a, .sidebar-nav a').forEach(link => {
    const href = link.getAttribute('href');
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
   HOMEPAGE — wheel → horizontal, arrow-key nav
   ============================================= */
(function () {
  const gallery = document.getElementById('home-gallery');
  if (!gallery) return;

  // Only intercept horizontal translation on coarse/pointer devices with a
  // vertical wheel. Leave trackpads with native horizontal intent alone.
  let isScrolling = false;

  gallery.addEventListener('wheel', (e) => {
    // If the user is already scrolling horizontally (trackpad swipe), let it through
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

    // Translate vertical wheel into horizontal scroll
    e.preventDefault();
    gallery.scrollLeft += e.deltaY;
  }, { passive: false });

  // Arrow-key navigation (only on homepage, only when no lightbox is open)
  document.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (lightbox && lightbox.classList.contains('active')) return;

    const slides = gallery.querySelectorAll('.slide');
    if (!slides.length) return;

    const slideW = slides[0].getBoundingClientRect().width;

    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      e.preventDefault();
      gallery.scrollBy({ left: slideW, behavior: 'smooth' });
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      gallery.scrollBy({ left: -slideW, behavior: 'smooth' });
    } else if (e.key === 'Home') {
      e.preventDefault();
      gallery.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (e.key === 'End') {
      e.preventDefault();
      gallery.scrollTo({ left: gallery.scrollWidth, behavior: 'smooth' });
    }
  });

  // Touch swipe is native via scroll-snap-type; no extra code needed.

  // Hide scroll hint once the user has scrolled a bit
  const hint = document.querySelector('.scroll-hint');
  if (hint) {
    gallery.addEventListener('scroll', () => {
      if (gallery.scrollLeft > 50) {
        hint.style.opacity = '0';
        hint.style.transition = 'opacity 0.4s ease';
      } else {
        hint.style.opacity = '';
      }
    }, { passive: true });
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
   CONTACT FORM — Formspree AJAX submission
   ============================================= */
(function () {
  const form      = document.getElementById('contact-form');
  if (!form) return;

  const submitBtn = document.getElementById('submit-btn');
  const errorMsg  = document.getElementById('form-error');
  const successEl = document.getElementById('form-success');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
    }
    if (errorMsg) errorMsg.hidden = true;

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        form.hidden = true;
        if (successEl) successEl.hidden = false;
      } else {
        throw new Error('server error');
      }
    } catch (_) {
      if (errorMsg) errorMsg.hidden = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send message →';
      }
    }
  });
})();
