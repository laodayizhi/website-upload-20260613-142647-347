
(function () {
  function byId(id) {
    return document.getElementById(id);
  }

  function qsa(root, selector) {
    return Array.from(root.querySelectorAll(selector));
  }

  function initHeroCarousel(root) {
    const slides = qsa(root, '.hero-slide');
    const dots = qsa(root, '.hero-dot');
    if (!slides.length) return;

    let index = 0;
    let timer = null;

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((slide, sIdx) => {
        slide.classList.toggle('is-active', sIdx === index);
      });
      dots.forEach((dot, dIdx) => {
        dot.classList.toggle('is-active', dIdx === index);
        dot.setAttribute('aria-pressed', dIdx === index ? 'true' : 'false');
      });
    }

    function start() {
      stop();
      timer = window.setInterval(() => show(index + 1), 5500);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        show(i);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);

    show(0);
    start();
  }

  function normalizeText(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[·•，,\/|:：\-—_()（）【】\[\]]/g, ' ');
  }

  function initSearchRoot(root) {
    const input = root.querySelector('[data-search-input]');
    const sort = root.querySelector('[data-sort-select]');
    const cards = qsa(root, '[data-card]');
    const counter = root.querySelector('[data-result-count]');
    if (!cards.length || !input) return;

    const original = cards.map(card => ({
      el: card,
      title: normalizeText(card.dataset.title),
      region: normalizeText(card.dataset.region),
      type: normalizeText(card.dataset.type),
      genre: normalizeText(card.dataset.genre),
      tags: normalizeText(card.dataset.tags),
      year: parseInt(card.dataset.year || '0', 10),
      score: parseInt(card.dataset.score || '0', 10)
    }));

    function apply() {
      const term = normalizeText(input.value.trim());
      const mode = sort ? sort.value : 'score';

      original.forEach(item => {
        const hay = [item.title, item.region, item.type, item.genre, item.tags, String(item.year)].join(' ');
        const match = !term || hay.includes(term);
        item.el.style.display = match ? '' : 'none';
      });

      const visible = original.filter(item => item.el.style.display !== 'none');
      if (sort) {
        const parent = cards[0].parentNode;
        const sorted = visible.slice().sort((a, b) => {
          if (mode === 'year') return b.year - a.year || b.score - a.score;
          if (mode === 'title') return a.title.localeCompare(b.title, 'zh-Hans-CN');
          return b.score - a.score || b.year - a.year;
        });
        sorted.forEach(item => parent.appendChild(item.el));
      }

      if (counter) {
        counter.textContent = visible.length;
      }
    }

    input.addEventListener('input', apply);
    if (sort) sort.addEventListener('change', apply);
    apply();
  }

  function initPlayer(root) {
    const video = root.querySelector('video');
    const playBtn = root.querySelector('[data-play-button]');
    const source = root.dataset.videoSrc || '';
    const hlsSource = root.dataset.hlsSrc || '';
    if (!video || !playBtn) return;

    let hlsInstance = null;

    function canPlayNativeHls() {
      return video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL');
    }

    function setSource() {
      if (hlsSource && (window.Hls || canPlayNativeHls())) {
        if (window.Hls && window.Hls.isSupported()) {
          if (hlsInstance) {
            hlsInstance.destroy();
          }
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(hlsSource);
          hlsInstance.attachMedia(video);
          return;
        }
        if (canPlayNativeHls()) {
          video.src = hlsSource;
          return;
        }
      }

      if (source) {
        video.src = source;
      }
    }

    playBtn.addEventListener('click', async () => {
      setSource();
      try {
        await video.play();
      } catch (err) {
        console.warn('Video play failed', err);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    qsa(document, '[data-hero-carousel]').forEach(initHeroCarousel);
    qsa(document, '[data-search-root]').forEach(initSearchRoot);
    qsa(document, '[data-player]').forEach(initPlayer);
  });
})();
