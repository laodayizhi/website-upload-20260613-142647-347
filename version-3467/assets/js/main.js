(function () {
    var navToggle = document.querySelector('.nav-toggle');
    var mainNav = document.querySelector('.main-nav');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', function () {
            var expanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', String(!expanded));
            mainNav.classList.toggle('open');
        });
    }

    document.querySelectorAll('img.cover-image, .hero-bg img, .hero-poster img, .detail-poster img, .detail-backdrop img, .category-tile img, .category-cover img').forEach(function (img) {
        img.addEventListener('error', function () {
            img.classList.add('image-hidden');
        }, { once: true });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function activate(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            if (timer || slides.length < 2) {
                return;
            }
            timer = window.setInterval(function () {
                activate(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                activate(index);
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
                start();
            });
        });

        start();
    }

    var input = document.querySelector('[data-filter-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));
    var rankLinks = Array.prototype.slice.call(document.querySelectorAll('.searchable-list li'));
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get('q') || '';

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function filter(value) {
        var query = normalize(value);
        cards.forEach(function (card) {
            var haystack = normalize(card.textContent + ' ' + Array.prototype.map.call(card.attributes, function (attr) {
                return attr.value;
            }).join(' '));
            card.classList.toggle('is-hidden', query && haystack.indexOf(query) === -1);
        });
        rankLinks.forEach(function (item) {
            var haystack = normalize(item.textContent);
            item.classList.toggle('is-hidden', query && haystack.indexOf(query) === -1);
        });
    }

    if (input) {
        if (queryValue) {
            input.value = queryValue;
            filter(queryValue);
        }
        input.addEventListener('input', function () {
            filter(input.value);
        });
    }

    document.querySelectorAll('[data-filter-value]').forEach(function (button) {
        button.addEventListener('click', function () {
            var value = button.getAttribute('data-filter-value') || '';
            if (input) {
                input.value = value;
            }
            filter(value);
        });
    });

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            if (cards.length || rankLinks.length) {
                event.preventDefault();
                var field = form.querySelector('[data-filter-input]');
                filter(field ? field.value : '');
            }
        });
    });
})();
