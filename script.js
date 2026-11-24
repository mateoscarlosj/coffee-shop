const nav = document.getElementById('nav');
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');

const setMenu = (open) => {
  links.classList.toggle('open', open);
  toggle.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
};
toggle.addEventListener('click', () => setMenu(!links.classList.contains('open')));
links.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

const progress = document.getElementById('progress');
const toTop = document.getElementById('toTop');
const parallax = [...document.querySelectorAll('.hero-img, .band-img')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const onScroll = () => {
  const y = window.scrollY;
  nav.classList.toggle('scrolled', y > 60);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  toTop.classList.toggle('show', y > 700);

  if (reduceMotion) return;
  parallax.forEach((img) => {
    const box = img.parentElement.getBoundingClientRect();
    if (box.bottom < 0 || box.top > window.innerHeight) return;
    // Distance of the section's center from the viewport's center, clamped to the spare image margin
    const offset = (box.top + box.height / 2 - window.innerHeight / 2) * -0.12;
    const limit = box.height * 0.07;
    img.style.setProperty('--py', `${Math.max(-limit, Math.min(limit, offset))}px`);
  });
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Scroll reveal, staggered among siblings
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
    el.style.transitionDelay = `${(siblings.indexOf(el) % 4) * 100}ms`;
    el.classList.add('in');
    io.unobserve(el);
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// Animated counters
const countIO = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / 1600, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    countIO.unobserve(el);
  });
}, { threshold: 0.6 });
document.querySelectorAll('[data-count]').forEach((el) => countIO.observe(el));

// Menu filter
const tabs = document.querySelectorAll('.tab');
const cards = document.querySelectorAll('#menuGrid .card');
tabs.forEach((tab) => tab.addEventListener('click', () => {
  tabs.forEach((t) => t.classList.remove('active'));
  tab.classList.add('active');
  const f = tab.dataset.filter;
  cards.forEach((card) => {
    const show = f === 'all' || card.dataset.cat === f;
    card.classList.toggle('hide', !show);
    if (show) {
      card.classList.remove('in');
      requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add('in')));
    }
  });
}));

// Demo form: no backend yet
document.getElementById('contactForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  document.getElementById('formNote').textContent = 'Thank you. We received your message.';
  e.target.reset();
});

// Highlight the current category in the menu page's sticky nav
const catLinks = document.querySelectorAll('.cat-nav a');
if (catLinks.length) {
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      catLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
      const active = document.querySelector('.cat-nav a.active');
      active?.scrollIntoView({ inline: 'center', block: 'nearest' });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  document.querySelectorAll('.menu-cat').forEach((s) => spy.observe(s));
}

document.getElementById('year').textContent = new Date().getFullYear();

// Image lightbox (gallery, menu cards, about, menu page)
const mosaicImgs = document.querySelectorAll('.mosaic img, .thumb img, .img-wrap img, .menu-cat-img img');
if (mosaicImgs.length) {
  const box = document.createElement('div');
  box.className = 'lightbox';
  box.innerHTML = '<img alt="">';
  document.body.appendChild(box);
  const big = box.querySelector('img');
  const close = () => box.classList.remove('open');
  mosaicImgs.forEach((img) => img.addEventListener('click', () => {
    big.src = img.src.replace(/w=\d+/, 'w=1600');
    big.alt = img.alt;
    box.classList.add('open');
  }));
  box.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}
