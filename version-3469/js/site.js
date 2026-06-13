(function () {
  var navButton = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-site-nav]');

  if (navButton && nav) {
    navButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupFilters(panel) {
    var root = panel.closest('section') || document;
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-filter-results] .movie-card'));
    var keywordInput = panel.querySelector('[data-filter-keyword]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var regionSelect = panel.querySelector('[data-filter-region]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var count = panel.querySelector('[data-filter-count]');

    function applyQueryFromUrl() {
      if (!keywordInput || !window.URLSearchParams) {
        return;
      }

      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');

      if (query) {
        keywordInput.value = query;
      }
    }

    function applyFilters() {
      var keyword = normalize(keywordInput && keywordInput.value);
      var year = normalize(yearSelect && yearSelect.value);
      var region = normalize(regionSelect && regionSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.textContent
        ].join(' '));
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesYear = !year || normalize(card.dataset.year) === year;
        var matchesRegion = !region || normalize(card.dataset.region) === region;
        var matchesType = !type || normalize(card.dataset.type) === type;
        var matched = matchesKeyword && matchesYear && matchesRegion && matchesType;

        card.style.display = matched ? '' : 'none';

        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible;
      }
    }

    [keywordInput, yearSelect, regionSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyQueryFromUrl();
    applyFilters();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]')).forEach(setupFilters);

  function setupPlayer(playerCard) {
    var video = playerCard.querySelector('video');
    var trigger = playerCard.querySelector('[data-play-trigger]');
    var status = playerCard.querySelector('[data-player-status]');
    var source = playerCard.getAttribute('data-video-url');
    var hlsInstance = null;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function loadAndPlay() {
      if (!video || !source) {
        setStatus('当前影片没有可用播放源。');
        return;
      }

      playerCard.classList.add('is-playing');

      if (window.Hls && window.Hls.isSupported()) {
        if (hlsInstance) {
          hlsInstance.destroy();
        }

        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源已加载，正在播放。');
          video.play().catch(function () {
            setStatus('播放源已加载，请再次点击播放器开始播放。');
          });
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (_event, data) {
          if (data && data.fatal) {
            setStatus('播放加载遇到问题，可刷新页面后重试。');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          setStatus('播放源已加载，正在播放。');
          video.play().catch(function () {
            setStatus('播放源已加载，请再次点击播放器开始播放。');
          });
        }, { once: true });
      } else {
        video.src = source;
        setStatus('浏览器不支持 HLS.js 时将尝试原生播放。');
        video.play().catch(function () {
          setStatus('当前浏览器可能不支持该播放源，请更换浏览器或网络环境。');
        });
      }
    }

    if (trigger) {
      trigger.addEventListener('click', loadAndPlay);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!video.src && !video.currentSrc) {
          loadAndPlay();
        }
      });
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
}());
