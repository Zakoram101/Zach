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
            '<svg class="icon-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 14.3A8.5 8.5 0 0 1 9.7 3 7.5 7.5 0 1 0 21 14.3z"></path></svg>' +
            '<svg class="icon-sun" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.2a1 1 0 0 1-1-1V1.5a1 1 0 1 1 2 0v1.7a1 1 0 0 1-1 1zm0 16.1a1 1 0 0 1 1 1v1.7a1 1 0 1 1-2 0v-1.7a1 1 0 0 1 1-1zm8.3-8.3h1.7a1 1 0 1 1 0 2h-1.7a1 1 0 1 1 0-2zM2.5 12a1 1 0 0 1 1-1h1.7a1 1 0 1 1 0 2H3.5a1 1 0 0 1-1-1zm15.4-6.1 1.2-1.2a1 1 0 0 1 1.4 1.4l-1.2 1.2a1 1 0 1 1-1.4-1.4zM4.7 17.9l-1.2 1.2a1 1 0 1 1-1.4-1.4l1.2-1.2a1 1 0 0 1 1.4 1.4zm14.6 0a1 1 0 0 1 0-1.4l1.2-1.2a1 1 0 1 1 1.4 1.4l-1.2 1.2a1 1 0 0 1-1.4 0zM4.7 6.1A1 1 0 0 1 6.1 4.7L4.9 3.5A1 1 0 0 1 3.5 4.9L4.7 6.1zM12 7.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5z"></path></svg>' +
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
