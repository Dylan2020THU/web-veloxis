// Keep the hidden mobile background video off the network.
(function () {
    var video = document.querySelector('.hero-video');
    var desktop = window.matchMedia('(min-width: 769px)');
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    function updateVideo() {
        if (!desktop.matches || reducedMotion.matches || navigator.connection?.saveData) {
            video.pause();
            return;
        }
        var source = video.querySelector('source');
        if (!source.hasAttribute('src')) {
            source.src = source.dataset.src;
            video.load();
        }
        video.play().catch(function () {});
    }
    window.addEventListener('load', updateVideo, { once: true });
    desktop.addEventListener('change', updateVideo);
    reducedMotion.addEventListener('change', updateVideo);
})();
