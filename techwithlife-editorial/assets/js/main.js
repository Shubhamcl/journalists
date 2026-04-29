(function () {
    var menuToggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");

    if (menuToggle && nav) {
        menuToggle.addEventListener("click", function () {
            var isOpen = document.body.classList.toggle("nav-open");
            menuToggle.setAttribute("aria-expanded", String(isOpen));
        });
    }

    var progress = document.querySelector("[data-reading-progress]");

    if (progress) {
        var updateProgress = function () {
            var article = document.querySelector(".content-body");
            if (!article) {
                return;
            }

            var rect = article.getBoundingClientRect();
            var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
            var total = rect.height - viewportHeight;
            var read = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
            var percent = total <= 0 ? 100 : (read / total) * 100;
            progress.style.width = percent + "%";
        };

        updateProgress();
        window.addEventListener("scroll", updateProgress, { passive: true });
        window.addEventListener("resize", updateProgress);
    }

    document.querySelectorAll("[data-copy-url]").forEach(function (button) {
        button.addEventListener("click", function () {
            var url = button.getAttribute("data-copy-url");
            if (navigator.clipboard && url) {
                navigator.clipboard.writeText(url);
                button.textContent = "Copied";
                window.setTimeout(function () {
                    button.textContent = "Link";
                }, 1600);
            }
        });
    });
})();
