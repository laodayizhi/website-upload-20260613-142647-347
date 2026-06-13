(function () {
  const mobileToggle = document.querySelector("[data-mobile-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  const heroSlides = Array.from(document.querySelectorAll(".hero-slide"));
  const heroDots = Array.from(document.querySelectorAll(".hero-dot"));
  let heroIndex = 0;
  let heroTimer = null;

  function showHeroSlide(index) {
    if (!heroSlides.length) {
      return;
    }
    heroIndex = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === heroIndex);
    });
    heroDots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === heroIndex);
    });
  }

  function startHeroTimer() {
    if (heroSlides.length < 2) {
      return;
    }
    heroTimer = window.setInterval(function () {
      showHeroSlide(heroIndex + 1);
    }, 5200);
  }

  heroDots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      window.clearInterval(heroTimer);
      showHeroSlide(index);
      startHeroTimer();
    });
  });

  showHeroSlide(0);
  startHeroTimer();

  const globalInput = document.getElementById("globalSearchInput");
  const globalPanel = document.getElementById("globalSearchPanel");
  const globalResults = document.getElementById("globalSearchResults");
  const globalClose = document.getElementById("globalSearchClose");

  function resultMarkup(item) {
    return [
      '<a class="compact-card no-rank" href="' + item.url + '">',
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span>',
      '<strong>' + escapeHtml(item.title) + '</strong>',
      '<em>' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ★ ' + escapeHtml(item.rating) + '</em>',
      '</span>',
      '</a>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function runGlobalSearch(term) {
    if (!globalPanel || !globalResults) {
      return;
    }
    const value = term.trim().toLowerCase();
    if (!value) {
      globalPanel.hidden = true;
      globalResults.innerHTML = "";
      return;
    }
    const items = Array.isArray(window.MOVIE_INDEX) ? window.MOVIE_INDEX : [];
    const matches = items.filter(function (item) {
      return [item.title, item.year, item.region, item.genre, item.oneLine].join(" ").toLowerCase().includes(value);
    }).slice(0, 36);
    globalResults.innerHTML = matches.length ? matches.map(resultMarkup).join("") : '<div class="empty-state is-visible">没有找到匹配影片</div>';
    globalPanel.hidden = false;
  }

  if (globalInput) {
    globalInput.addEventListener("input", function () {
      runGlobalSearch(globalInput.value);
    });
    globalInput.addEventListener("focus", function () {
      runGlobalSearch(globalInput.value);
    });
  }

  if (globalClose && globalPanel) {
    globalClose.addEventListener("click", function () {
      globalPanel.hidden = true;
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && globalPanel) {
      globalPanel.hidden = true;
    }
  });

  const filterPanels = Array.from(document.querySelectorAll("[data-filter-panel]"));

  filterPanels.forEach(function (panel) {
    const input = panel.querySelector("[data-filter-input]");
    const year = panel.querySelector("[data-filter-year]");
    const region = panel.querySelector("[data-filter-region]");
    const list = document.querySelector(panel.getAttribute("data-filter-panel"));
    const empty = document.querySelector(panel.getAttribute("data-empty-target"));
    if (!list) {
      return;
    }
    const cards = Array.from(list.querySelectorAll("[data-card]"));

    function applyFilter() {
      const q = input ? input.value.trim().toLowerCase() : "";
      const y = year ? year.value : "";
      const r = region ? region.value : "";
      let visible = 0;
      cards.forEach(function (card) {
        const text = [card.dataset.title, card.dataset.genre, card.dataset.region, card.dataset.year].join(" ").toLowerCase();
        const matchText = !q || text.includes(q);
        const matchYear = !y || card.dataset.year === y;
        const matchRegion = !r || card.dataset.region === r;
        const show = matchText && matchYear && matchRegion;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [input, year, region].forEach(function (node) {
      if (node) {
        node.addEventListener("input", applyFilter);
        node.addEventListener("change", applyFilter);
      }
    });
  });

  const players = Array.from(document.querySelectorAll("[data-player]"));

  function showPlayerMessage(player, message) {
    const box = player.querySelector("[data-player-message]");
    if (box) {
      box.textContent = message;
      box.classList.add("is-visible");
    }
  }

  function playVideo(video) {
    const attempt = video.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(function () {});
    }
  }

  function startPlayer(player) {
    const video = player.querySelector("video");
    const trigger = player.querySelector("[data-play]");
    const stream = trigger ? trigger.getAttribute("data-stream") : "";
    if (!video || !stream) {
      showPlayerMessage(player, "播放暂时不可用，请稍后再试");
      return;
    }
    player.classList.add("is-playing");
    video.controls = true;
    if (player.dataset.ready === "1") {
      playVideo(video);
      return;
    }
    player.dataset.ready = "1";
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      video.addEventListener("loadedmetadata", function () {
        playVideo(video);
      }, { once: true });
      video.addEventListener("error", function () {
        showPlayerMessage(player, "播放暂时不可用，请稍后再试");
      });
      video.load();
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      player.hlsPlayer = hls;
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        playVideo(video);
      });
      hls.on(window.Hls.Events.ERROR, function (eventName, data) {
        if (data && data.fatal) {
          showPlayerMessage(player, "播放暂时不可用，请稍后再试");
        }
      });
      return;
    }
    showPlayerMessage(player, "播放暂时不可用，请稍后再试");
  }

  players.forEach(function (player) {
    const playArea = player.querySelector("[data-play]");
    const video = player.querySelector("video");
    if (playArea) {
      playArea.addEventListener("click", function () {
        startPlayer(player);
      });
    }
    if (video) {
      video.addEventListener("click", function () {
        if (player.dataset.ready === "1") {
          if (video.paused) {
            playVideo(video);
          } else {
            video.pause();
          }
        } else {
          startPlayer(player);
        }
      });
    }
  });

  window.addEventListener("beforeunload", function () {
    players.forEach(function (player) {
      if (player.hlsPlayer && typeof player.hlsPlayer.destroy === "function") {
        player.hlsPlayer.destroy();
      }
    });
  });
})();
