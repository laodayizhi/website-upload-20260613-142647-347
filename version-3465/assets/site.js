(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initSearchForms() {
        selectAll('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var value = input ? input.value.trim() : '';
                if (value) {
                    window.location.href = './search.html?q=' + encodeURIComponent(value);
                }
            });
        });
    }

    function initHero() {
        var slides = selectAll('.hero-slide');
        var dots = selectAll('.hero-dot');
        if (!slides.length || !dots.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(dotIndex);
                start();
            });
        });
        show(0);
        start();
    }

    function initCatalogFilter() {
        selectAll('[data-local-search]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
            });
        });
        selectAll('[data-catalog-filter]').forEach(function (input) {
            var targetSelector = input.getAttribute('data-catalog-filter');
            var cards = selectAll(targetSelector || '.movie-card');
            input.addEventListener('input', function () {
                var keyword = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var text = card.getAttribute('data-filter') || card.textContent.toLowerCase();
                    card.classList.toggle('hidden-by-filter', keyword && text.indexOf(keyword) === -1);
                });
            });
        });
    }

    function movieCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '' +
            '<article class="movie-card">' +
                '<a class="movie-poster" href="./' + escapeHtml(movie.href) + '" aria-label="观看' + escapeHtml(movie.title) + '">' +
                    '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="movie-badge">' + escapeHtml(movie.type) + '</span>' +
                    '<span class="movie-play">▶</span>' +
                '</a>' +
                '<div class="movie-card-body">' +
                    '<h3><a href="./' + escapeHtml(movie.href) + '">' + escapeHtml(movie.title) + '</a></h3>' +
                    '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                    '<div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
                    '<div class="movie-tags">' + tags + '</div>' +
                '</div>' +
            '</article>';
    }

    function initSearchPage() {
        var results = document.querySelector('[data-search-results]');
        var input = document.querySelector('[data-search-input]');
        if (!results || !input || !window.movieIndex) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        input.value = initial;

        function render() {
            var keyword = input.value.trim().toLowerCase();
            var list = window.movieIndex.filter(function (movie) {
                var haystack = [movie.title, movie.region, movie.type, movie.genre, movie.oneLine, (movie.tags || []).join(' ')].join(' ').toLowerCase();
                return !keyword || haystack.indexOf(keyword) !== -1;
            }).slice(0, 120);
            if (!list.length) {
                results.innerHTML = '<div class="content-card"><h2>未找到相关影片</h2><p>可以更换片名、地区、类型或标签继续搜索。</p></div>';
                return;
            }
            results.innerHTML = list.map(movieCard).join('');
        }

        input.addEventListener('input', render);
        var form = input.closest('form');
        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                render();
            });
        }
        render();
    }

    function initPlayer() {
        var video = document.getElementById('movie-player');
        if (!video) {
            return;
        }
        var overlay = document.querySelector('[data-player-overlay]');
        var url = video.getAttribute('data-play-url');
        var prepared = false;
        var hlsInstance = null;

        function prepare() {
            if (prepared || !url) {
                return;
            }
            prepared = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
            } else {
                video.src = url;
            }
        }

        function start() {
            prepare();
            video.controls = true;
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var playAttempt = video.play();
            if (playAttempt && typeof playAttempt.catch === 'function') {
                playAttempt.catch(function () {
                    video.controls = true;
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', start);
        }
        selectAll('a[href="#movie-player"]').forEach(function (link) {
            link.addEventListener('click', function (event) {
                event.preventDefault();
                video.scrollIntoView({ behavior: 'smooth', block: 'center' });
                start();
            });
        });
        video.addEventListener('click', function () {
            if (!prepared) {
                start();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initSearchForms();
        initHero();
        initCatalogFilter();
        initSearchPage();
        initPlayer();
    });
}());
