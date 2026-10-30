(function () {
    var menu = document.querySelector('.navbar .menu-toggle');
    var links = document.getElementById('home-navigation');
    function closeMenu() {
        links.classList.remove('is-open');
        menu.setAttribute('aria-expanded', 'false');
    }
    menu.addEventListener('click', function () {
        var open = links.classList.toggle('is-open');
        menu.setAttribute('aria-expanded', String(open));
    });
    links.addEventListener('click', function (event) {
        if (event.target.closest('a')) closeMenu();
    });
    document.addEventListener('click', function (event) {
        if (!event.target.closest('.navbar')) closeMenu();
    });
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
            closeMenu();
            menu.focus();
        }
    });
    window.matchMedia('(min-width: 769px)').addEventListener('change', closeMenu);
})();
