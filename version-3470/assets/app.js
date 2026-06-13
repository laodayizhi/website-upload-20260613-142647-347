(function () {
    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function nextSlide() {
            showSlide(current + 1);
        }

        function startHero() {
            window.clearInterval(timer);
            timer = window.setInterval(nextSlide, 5200);
        }

        var prevButton = hero.querySelector('[data-hero-prev]');
        var nextButton = hero.querySelector('[data-hero-next]');

        if (prevButton) {
            prevButton.addEventListener('click', function () {
                showSlide(current - 1);
                startHero();
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', function () {
                showSlide(current + 1);
                startHero();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startHero();
            });
        });

        showSlide(0);
        startHero();
    }

    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-nav]');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('menu-open');
        });
    }

    document.querySelectorAll('[data-card-filter]').forEach(function (panel) {
        var input = panel.querySelector('[data-filter-input]');
        var grid = document.querySelector('[data-filter-grid]');
        var buttons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-year]'));
        var activeYear = 'all';

        function applyFilter() {
            if (!grid) {
                return;
            }
            var keyword = input ? input.value.trim().toLowerCase() : '';
            Array.prototype.slice.call(grid.querySelectorAll('.movie-card')).forEach(function (card) {
                var text = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-year') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-genre') || '',
                    card.getAttribute('data-tags') || ''
                ].join(' ').toLowerCase();
                var yearMatch = activeYear === 'all' || card.getAttribute('data-year') === activeYear;
                var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
                card.classList.toggle('is-filtered-out', !(yearMatch && keywordMatch));
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeYear = button.getAttribute('data-filter-year') || 'all';
                buttons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                applyFilter();
            });
        });
    });

    document.querySelectorAll('.video-player').forEach(function (video) {
        var src = video.getAttribute('data-play');
        var frame = video.closest('.player-frame');
        var overlay = frame ? frame.querySelector('.player-overlay') : null;
        var ready = false;
        var hls = null;

        function loadVideo() {
            if (ready || !src) {
                return;
            }
            ready = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    if (video.getAttribute('data-autoplay') === '1') {
                        video.play().catch(function () {});
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else {
                video.src = src;
            }
        }

        function playVideo() {
            video.setAttribute('data-autoplay', '1');
            loadVideo();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            video.play().catch(function () {});
        }

        if (overlay) {
            overlay.addEventListener('click', playVideo);
        }

        video.addEventListener('click', function () {
            if (!ready) {
                playVideo();
            }
        });

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });

        video.addEventListener('pause', function () {
            if (overlay && video.currentTime === 0) {
                overlay.classList.remove('is-hidden');
            }
        });
    });

    var searchPage = document.querySelector('[data-search-page]');

    if (searchPage && window.VideoSearchData) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        var input = searchPage.querySelector('[data-search-input]');
        var resultBox = searchPage.querySelector('[data-search-results]');
        var state = searchPage.querySelector('[data-search-state]');

        if (input) {
            input.value = query;
            input.addEventListener('input', function () {
                renderSearch(input.value);
            });
        }

        function cardTemplate(item) {
            var tags = Array.isArray(item.tags) ? item.tags.join(' ') : '';
            return [
                '<article class="movie-card" data-title="' + escapeHtml(item.title) + '" data-year="' + escapeHtml(item.year) + '" data-region="' + escapeHtml(item.region) + '" data-genre="' + escapeHtml(item.genre) + '" data-tags="' + escapeHtml(tags) + '">',
                '    <a class="poster-link" href="' + escapeHtml(item.url) + '" aria-label="观看' + escapeHtml(item.title) + '">',
                '        <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
                '        <span class="poster-shade"></span>',
                '        <span class="poster-play">▶</span>',
                '        <span class="poster-badge">' + escapeHtml(item.type) + '</span>',
                '    </a>',
                '    <div class="movie-info">',
                '        <h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>',
                '        <p class="movie-meta">' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.genre) + '</p>',
                '        <p class="movie-one-line">' + escapeHtml(item.oneLine) + '</p>',
                '    </div>',
                '</article>'
            ].join('');
        }

        function renderSearch(value) {
            var keyword = String(value || '').trim().toLowerCase();
            if (!keyword) {
                resultBox.innerHTML = '';
                state.textContent = '请输入关键词开始查找影片。';
                return;
            }
            var results = window.VideoSearchData.filter(function (item) {
                var text = [
                    item.title,
                    item.year,
                    item.region,
                    item.type,
                    item.genre,
                    Array.isArray(item.tags) ? item.tags.join(' ') : '',
                    item.oneLine
                ].join(' ').toLowerCase();
                return text.indexOf(keyword) !== -1;
            }).slice(0, 120);
            resultBox.innerHTML = results.map(cardTemplate).join('');
            state.textContent = results.length ? '已找到相关影片，点击卡片进入详情。' : '没有找到匹配影片，请更换关键词。';
        }

        renderSearch(query);
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
})();
