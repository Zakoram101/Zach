(function () {
    "use strict";

    var STORAGE_KEY = "mishkat-theme";
    var DARK = "dark";
    var LIGHT = "light";

    function safeGet() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (err) {
            return null;
        }
    }

    function safeSet(value) {
        try {
            localStorage.setItem(STORAGE_KEY, value);
        } catch (err) {}
    }

    function currentTheme() {
        var stored = safeGet();
        if (stored === DARK || stored === LIGHT) return stored;
        return document.documentElement.classList.contains("theme-dark") ? DARK : LIGHT;
    }

    function applyTheme(theme, persist) {
        var isDark = theme === DARK;
        document.documentElement.classList.toggle("theme-dark", isDark);
        if (document.body) {
            document.body.classList.toggle("theme-dark", isDark);
        }
        if (persist !== false) safeSet(isDark ? DARK : LIGHT);
        syncButtons(isDark);
    }

    function syncButtons(isDark) {
        var buttons = document.querySelectorAll("[data-theme-toggle]");
        for (var i = 0; i < buttons.length; i += 1) {
            var btn = buttons[i];
            btn.setAttribute("aria-pressed", isDark ? "true" : "false");
            btn.setAttribute("aria-label", isDark ? "التبديل إلى الوضع النهاري" : "التبديل إلى الوضع الليلي");
            btn.title = isDark ? "الوضع النهاري" : "الوضع الليلي";
        }
    }

    function buttonHtml() {
        return (
            '<button type="button" class="theme-toggle" data-theme-toggle aria-pressed="false" aria-label="التبديل إلى الوضع الليلي" title="الوضع الليلي">' +
            '<svg class="icon-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 13.2A8.8 8.8 0 1 1 10.8 3.2 6.8 6.8 0 1 0 20.8 13.2z"></path></svg>' +
            '<svg class="icon-sun" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6zM12 2a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1zm0 16a1 1 0 0 1-1 1v2a1 1 0 1 1 2 0v-2a1 1 0 0 1-1-1zM4.2 4.2a1 1 0 0 1 1.4 0l1.4 1.4a1 1 0 0 1-1.4 1.4L4.2 5.6a1 1 0 0 1 0-1.4zm14 14a1 1 0 0 1 0 1.4l-1.4 1.4a1 1 0 0 1-1.4-1.4l1.4-1.4a1 1 0 0 1 1.4 0zM2 12a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1zm16 0a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2h-2a1 1 0 0 1-1-1zM5.6 18.4a1 1 0 0 1 0-1.4l1.4-1.4a1 1 0 1 1 1.4 1.4l-1.4 1.4a1 1 0 0 1-1.4 0zm12.8-12.8a1 1 0 0 1 0 1.4l-1.4 1.4a1 1 0 0 1-1.4-1.4l1.4-1.4a1 1 0 0 1 1.4 0z"></path></svg>' +
            "</button>"
        );
    }

    function makeButton() {
        var wrap = document.createElement("span");
        wrap.innerHTML = buttonHtml();
        return wrap.firstChild;
    }

    function placeButton() {
        if (document.querySelector("[data-theme-toggle]")) {
            syncButtons(currentTheme() === DARK);
            return;
        }

        var btn = makeButton();
        var topBar = document.querySelector(".top-bar");
        if (topBar) {
            var homeLink = topBar.querySelector("a");
            if (homeLink && homeLink.parentNode === topBar) {
                topBar.insertBefore(btn, homeLink.nextSibling);
            } else {
                topBar.appendChild(btn);
            }
            return;
        }

        var bookmarks = document.querySelector(".nav-bookmark");
        if (bookmarks) {
            bookmarks.insertBefore(btn, bookmarks.firstChild);
            return;
        }

        var navigation = document.querySelector(".navigation");
        if (navigation) {
            navigation.style.position = navigation.style.position || "relative";
            btn.style.position = "absolute";
            btn.style.top = "12px";
            btn.style.left = "12px";
            navigation.insertBefore(btn, navigation.firstChild);
            return;
        }

        var header = document.querySelector("header");
        if (header) {
            header.style.position = header.style.position || "relative";
            btn.style.position = "absolute";
            btn.style.top = "16px";
            btn.style.left = "16px";
            header.appendChild(btn);
            return;
        }

        btn.classList.add("theme-toggle--floating");
        btn.style.position = "fixed";
        btn.style.top = "14px";
        btn.style.left = "14px";
        btn.style.zIndex = "1000";
        document.body.appendChild(btn);
    }

    applyTheme(currentTheme(), false);

    function onReady() {
        placeButton();
        syncButtons(currentTheme() === DARK);
        document.addEventListener("click", function (event) {
            var target = event.target;
            if (!target || !target.closest) return;
            var btn = target.closest("[data-theme-toggle]");
            if (!btn) return;
            event.preventDefault();
            applyTheme(currentTheme() === DARK ? LIGHT : DARK);
        });
        window.addEventListener("storage", function (event) {
            if (event.key !== STORAGE_KEY) return;
            if (event.newValue === DARK || event.newValue === LIGHT) {
                applyTheme(event.newValue, false);
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", onReady);
    } else {
        onReady();
    }
})();
