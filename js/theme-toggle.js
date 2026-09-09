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
            '<svg class="icon-moon" viewBox="0 0 24 24" aria-hidden="true"><path transform="rotate(-22 12 12)" d="M15.05 3.4A8.85 8.85 0 1 0 20.7 16.55 6.55 6.55 0 0 1 15.05 3.4z"></path></svg>' +
            '<svg class="icon-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.85"></circle><g><rect x="11.2" y="1.55" width="1.6" height="3.55" rx="0.8"></rect><rect x="11.2" y="1.55" width="1.6" height="3.55" rx="0.8" transform="rotate(45 12 12)"></rect><rect x="11.2" y="1.55" width="1.6" height="3.55" rx="0.8" transform="rotate(90 12 12)"></rect><rect x="11.2" y="1.55" width="1.6" height="3.55" rx="0.8" transform="rotate(135 12 12)"></rect><rect x="11.2" y="1.55" width="1.6" height="3.55" rx="0.8" transform="rotate(180 12 12)"></rect><rect x="11.2" y="1.55" width="1.6" height="3.55" rx="0.8" transform="rotate(225 12 12)"></rect><rect x="11.2" y="1.55" width="1.6" height="3.55" rx="0.8" transform="rotate(270 12 12)"></rect><rect x="11.2" y="1.55" width="1.6" height="3.55" rx="0.8" transform="rotate(315 12 12)"></rect></g></svg>' +
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
