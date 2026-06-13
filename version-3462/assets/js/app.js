(function () {
    var navToggle = document.querySelector('.nav-toggle');
    var mainNav = document.querySelector('.main-nav');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', function () {
            mainNav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var current = 0;

        var showSlide = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        };

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    var filterForm = document.querySelector('[data-filter-form]');
    var filterList = document.querySelector('[data-filter-list]');

    if (filterForm && filterList) {
        var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        var keywordInput = filterForm.querySelector('input[name="keyword"]');

        if (!keywordInput) {
            keywordInput = filterForm.querySelector('input[type="search"]');
        }

        if (keywordInput && initialQuery) {
            keywordInput.value = initialQuery;
        }

        var applyFilter = function () {
            var formData = new FormData(filterForm);
            var keyword = (formData.get('keyword') || formData.get('q') || '').toString().trim().toLowerCase();
            var type = (formData.get('type') || '').toString();
            var region = (formData.get('region') || '').toString();
            var year = (formData.get('year') || '').toString();

            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchType = !type || card.getAttribute('data-type') === type;
                var matchRegion = !region || card.getAttribute('data-region') === region;
                var matchYear = !year || card.getAttribute('data-year') === year;
                card.hidden = !(matchKeyword && matchType && matchRegion && matchYear);
            });
        };

        filterForm.addEventListener('input', applyFilter);
        filterForm.addEventListener('change', applyFilter);
        applyFilter();
    }

    var player = document.querySelector('[data-player]');

    if (player) {
        var source = player.querySelector('source');
        var url = source ? source.getAttribute('src') : '';

        if (url) {
            if (player.canPlayType('application/vnd.apple.mpegurl')) {
                player.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(url);
                hls.attachMedia(player);
            }
        }
    }
})();
