(function () {
    function initializePlayer(box) {
        var video = box.querySelector('video');
        var button = box.querySelector('.player-start');
        var status = box.querySelector('.player-status');
        var source = box.getAttribute('data-video-url');
        var initialized = false;
        var hlsInstance = null;

        function setStatus(text) {
            if (status) {
                status.textContent = text;
            }
        }

        function play() {
            if (!video || !source) {
                setStatus('播放源暂不可用');
                return;
            }

            if (!initialized) {
                initialized = true;
                setStatus('正在加载高清播放源');

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus('播放源加载完成');
                        video.play().catch(function () {
                            setStatus('点击视频画面继续播放');
                        });
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                        if (data && data.fatal && hlsInstance) {
                            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                                hlsInstance.startLoad();
                            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                                hlsInstance.recoverMediaError();
                            } else {
                                hlsInstance.destroy();
                                hlsInstance = null;
                                video.src = source;
                                setStatus('正在尝试原生播放');
                            }
                        }
                    });
                } else {
                    video.src = source;
                    setStatus('正在尝试原生播放');
                }
            }

            box.classList.add('playing');
            video.play().catch(function () {
                setStatus('点击视频画面继续播放');
            });
        }

        if (button) {
            button.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                box.classList.add('playing');
                setStatus('正在播放');
            });
            video.addEventListener('pause', function () {
                setStatus('已暂停');
            });
        }
    }

    document.querySelectorAll('[data-player]').forEach(initializePlayer);
})();
