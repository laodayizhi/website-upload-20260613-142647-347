
(function () {
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const $ = (selector, root = document) => root.querySelector(selector);

  function initNav() {
    const toggle = $('[data-nav-toggle]');
    const panel = $('[data-nav-panel]');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', () => panel.classList.toggle('is-open'));
  }

  function initHeroSlider() {
    const root = $('[data-hero-slider]');
    if (!root) return;
    const slides = $$('[data-hero-slide]', root);
    const dots = $$('[data-hero-dot]', root);
    const prev = $('[data-hero-prev]', root);
    const next = $('[data-hero-next]', root);
    let index = slides.findIndex(slide => slide.classList.contains('is-active'));
    if (index < 0) index = 0;
    let timer = null;
    const show = (nextIndex) => {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    };
    const start = () => { stop(); timer = window.setInterval(() => show(index + 1), 5500); };
    const stop = () => { if (timer) window.clearInterval(timer); timer = null; };
    prev && prev.addEventListener('click', () => { show(index - 1); start(); });
    next && next.addEventListener('click', () => { show(index + 1); start(); });
    dots.forEach((dot, i) => dot.addEventListener('click', () => { show(i); start(); }));
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(index);
    start();
  }

  function initFilters() {
    const inputs = $$('[data-filter-input]');
    inputs.forEach(input => {
      const targetSelector = input.getAttribute('data-filter-target');
      const target = targetSelector ? document.querySelector(targetSelector) : null;
      if (!target) return;
      const cards = $$('[data-card]', target);
      const apply = () => {
        const term = input.value.trim().toLowerCase();
        cards.forEach(card => {
          const text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
          card.hidden = term ? !text.includes(term) : false;
        });
      };
      input.addEventListener('input', apply);
      input.addEventListener('change', apply);
      apply();
    });
  }

  function initPlayer() {
    $$('[data-video-player]').forEach(wrapper => {
      const video = $('video', wrapper);
      const overlay = $('[data-player-toggle]', wrapper);
      if (!video || !overlay) return;
      const sync = () => overlay.textContent = video.paused ? '▶ 点击播放' : '❚❚ 暂停播放';
      overlay.addEventListener('click', () => {
        if (video.paused) video.play().catch(() => {});
        else video.pause();
        sync();
      });
      video.addEventListener('play', sync);
      video.addEventListener('pause', sync);
      sync();
    });
  }

  function initBackTop() {
    const btn = $('[data-back-top]');
    if (!btn) return;
    const onScroll = () => btn.classList.toggle('is-show', window.scrollY > 600);
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initHeroSlider();
    initFilters();
    initPlayer();
    initBackTop();
  });
})();
