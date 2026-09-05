(function() {
    "use strict";

    const utils = {
        safeSelect(selector, isAll = false) {
            try {
                return isAll ? document.querySelectorAll(selector) : document.querySelector(selector);
            } catch (error) {
                console.warn(`Element selection failed: ${selector}`, error);
                return isAll ? [] : null;
            }
        },

        safeAddEventListener(element, event, handler, options) {
            if (element) {
                try {
                    element.addEventListener(event, handler, options || false);
                } catch (error) {
                    console.warn(`Failed to add event listener: ${event}`, error);
                }
            }
        },

        getLocalStorage(key, defaultValue) {
            try {
                const item = localStorage.getItem(key);
                if (item === null || item === undefined) return defaultValue;
                return JSON.parse(item);
            } catch (error) {
                console.warn('localStorage access failed:', error);
                return defaultValue;
            }
        },

        setLocalStorage(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (error) {
                console.warn('Failed to set localStorage:', error);
            }
        }
    };

    class BookApp {
        constructor() {
            this.initialized = false;
            this.favToastTimer = null;
            this.initializeElements();
        }

        initializeElements() {
            this.elements = {
                searchPanel: utils.safeSelect(".search-panel"),
                searchInput: utils.safeSelect("#search-input"),
                searchForm: utils.safeSelect(".search-form"),
                alertBox: utils.safeSelect("#customAlert"),
                noResults: utils.safeSelect("#no-results"),
                resetBtn: utils.safeSelect(".reset-btn"),
                booksShowcase: utils.safeSelect(".books-showcase.search-results") || utils.safeSelect(".search-panel .books-showcase"),
                books: utils.safeSelect(".search-panel .book-card, .books-showcase.search-results .book-card", true),
                bookmarks: utils.safeSelect(".bookmark", true),
                featuredButtons: utils.safeSelect(".featured-btn", true),
                favToast: utils.safeSelect("#favToast")
            };
            if (!this.elements.books || !this.elements.books.length) {
                this.elements.books = utils.safeSelect(".search-panel .book-card", true);
            }
        }

        searchBooks() {
            const { searchInput, books, noResults, resetBtn, booksShowcase } = this.elements;
            if (!searchInput || !books) return false;

            const query = searchInput.value.trim().toLowerCase();
            let found = false;

            if (query.length === 0) {
                this.showAlert();
                if (booksShowcase) booksShowcase.style.display = 'none';
                if (resetBtn) resetBtn.style.display = 'none';
                return false;
            }

            utils.setLocalStorage("lastSearch", query);

            if (booksShowcase) booksShowcase.style.display = '';

            books.forEach(book => {
                const titleEl = book.querySelector(".book-title");
                const authorEl = book.querySelector(".book-author");

                if (titleEl && authorEl) {
                    const title = titleEl.textContent.toLowerCase();
                    const author = authorEl.textContent.toLowerCase();
                    const match = title.includes(query) || author.includes(query);
                    book.style.display = match ? '' : 'none';
                    found = found || match;
                }
            });

            if (noResults) {
                noResults.style.display = found ? 'none' : 'block';
            }

            if (resetBtn) {
                resetBtn.style.display = 'inline-block';
            }

            return false;
        }

        resetSearch() {
            const { books, searchInput, noResults, resetBtn, booksShowcase } = this.elements;

            if (books) {
                books.forEach(book => {
                    book.style.display = '';
                });
            }

            if (searchInput) searchInput.value = "";
            if (noResults) noResults.style.display = 'none';
            if (resetBtn) resetBtn.style.display = 'none';
            if (booksShowcase) booksShowcase.style.display = 'none';

            utils.setLocalStorage("lastSearch", "");
        }

        showAlert() {
            const { alertBox } = this.elements;
            if (alertBox) {
                alertBox.style.display = 'block';
                setTimeout(() => {
                    if (alertBox.style.display === 'block') {
                        alertBox.style.display = 'none';
                    }
                }, 2000);
            }
        }

        toggleSearch() {
            const { searchPanel, searchInput, resetBtn, booksShowcase } = this.elements;
            if (!searchPanel) return;

            searchPanel.classList.toggle('active');

            if (searchPanel.classList.contains('active')) {
                if (booksShowcase) booksShowcase.style.display = 'none';
                if (resetBtn) resetBtn.style.display = 'none';

                const lastSearch = utils.getLocalStorage("lastSearch", "");
                if (searchInput) {
                    searchInput.value = lastSearch || "";
                    if (lastSearch) this.searchBooks();
                    searchInput.focus();
                }
            } else {
                this.resetSearch();
            }
        }

        setupBookmarks() {
            const { bookmarks } = this.elements;
            if (!bookmarks) return;

            bookmarks.forEach(bookmark => {
                if (!bookmark.getAttribute("role")) {
                    bookmark.setAttribute("role", "button");
                }
                if (!bookmark.hasAttribute("tabindex")) {
                    bookmark.setAttribute("tabindex", "0");
                }

                const go = () => {
                    const link = bookmark.getAttribute("data-link");
                    if (link) window.location.href = link;
                };

                utils.safeAddEventListener(bookmark, 'click', go);
                utils.safeAddEventListener(bookmark, 'keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        go();
                    }
                });
            });
        }

        setupFeaturedButtons() {
            const { featuredButtons } = this.elements;
            if (!featuredButtons) return;

            featuredButtons.forEach(button => {
                utils.safeAddEventListener(button, 'click', () => {
                    const page = button.getAttribute("data-page");
                    if (page) window.location.href = page;
                });
            });
        }

        updateDownloadCategoryCount() {
            const countEl = document.querySelector("[data-download-count]");
            if (!countEl || !window.MishkatBooks) return;
            window.MishkatBooks.updateDownloadCount(countEl);
        }

        setupEventListeners() {
            utils.safeAddEventListener(document, 'keydown', (e) => {
                const { searchPanel } = this.elements;
                if (e.key === 'Escape' && searchPanel && searchPanel.classList.contains('active')) {
                    this.toggleSearch();
                }
            });
        }

        showFavToast(message) {
            const { favToast } = this.elements;
            if (!favToast) return;
            favToast.textContent = message;
            favToast.classList.add('show');
            if (this.favToastTimer) clearTimeout(this.favToastTimer);
            this.favToastTimer = setTimeout(() => {
                favToast.classList.remove('show');
            }, 2000);
        }

        toggleFavorite(bookId) {
            const id = String(bookId || '').trim();
            if (!id) {
                this.showFavToast('تمت الإضافة إلى المفضلة');
                return;
            }
            let added = true;
            if (window.MishkatFavorites) {
                added = window.MishkatFavorites.toggle(id);
            } else {
                let favs = utils.getLocalStorage("zakbook-favorites", []);
                if (!Array.isArray(favs)) favs = [];
                const idx = favs.indexOf(id);
                if (idx >= 0) {
                    favs.splice(idx, 1);
                    added = false;
                } else {
                    favs.push(id);
                }
                utils.setLocalStorage("zakbook-favorites", favs);
            }
            this.syncFavoriteButtons();
            this.showFavToast(added ? 'تمت الإضافة إلى المفضلة' : 'تمت الإزالة من المفضلة');
        }

        syncFavoriteButtons() {
            const buttons = utils.safeSelect("[data-fav-id]", true);
            if (!buttons || !buttons.length) return;
            buttons.forEach(button => {
                const id = button.getAttribute("data-fav-id");
                if (!id) return;
                const isFav = window.MishkatFavorites
                    ? window.MishkatFavorites.isFav(id)
                    : (utils.getLocalStorage("zakbook-favorites", []) || []).indexOf(id) >= 0;
                button.textContent = isFav ? "إزالة من المفضلة" : "أضف للمفضلة";
            });
        }

        initialize() {
            if (this.initialized) return;
            this.initialized = true;

            const { booksShowcase, resetBtn } = this.elements;
            if (booksShowcase) booksShowcase.style.display = 'none';
            if (resetBtn) resetBtn.style.display = 'none';

            this.setupEventListeners();
            this.setupBookmarks();
            this.setupFeaturedButtons();
            this.updateDownloadCategoryCount();
            this.syncFavoriteButtons();
        }
    }

    let appInstance = null;
    function getApp() {
        if (!appInstance) appInstance = new BookApp();
        return appInstance;
    }

    window.toggleSearch = function() {
        getApp().toggleSearch();
    };

    window.searchBooks = function() {
        return getApp().searchBooks();
    };

    window.resetSearch = function() {
        getApp().resetSearch();
    };

    window.closeAlert = function() {
        const alertBox = document.getElementById('customAlert');
        if (alertBox) alertBox.style.display = 'none';
    };

    window.openCategoryMenu = function(bookId) {
        getApp().toggleFavorite(bookId);
    };

    function initApp() {
        getApp().initialize();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }
})();

document.addEventListener('DOMContentLoaded', function() {
    let touchPath = [];
    let tapCount = 0;
    let lastTapTime = 0;
    let circleDetected = false;

    const minPoints = 20;
    const circleThreshold = 0.8;
    const passiveOpts = { passive: true };

    document.addEventListener('touchstart', handleTouchStart, passiveOpts);
    document.addEventListener('touchmove', handleTouchMove, passiveOpts);
    document.addEventListener('touchend', handleTouchEnd, passiveOpts);
    document.addEventListener('click', handleTap);

    function handleTouchStart(e) {
        if (e.touches && e.touches.length === 2) {
            touchPath = [];
            circleDetected = false;
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            touchPath.push({
                x: (touch1.clientX + touch2.clientX) / 2,
                y: (touch1.clientY + touch2.clientY) / 2
            });
        }
    }

    function handleTouchMove(e) {
        if (e.touches && e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            touchPath.push({
                x: (touch1.clientX + touch2.clientX) / 2,
                y: (touch1.clientY + touch2.clientY) / 2
            });
        }
    }

    function handleTouchEnd() {
        if (touchPath.length >= minPoints && isCircle(touchPath)) {
            circleDetected = true;
            tapCount = 0;
        }
        touchPath = [];
    }

    function handleTap() {
        if (!circleDetected) return;

        const currentTime = Date.now();
        const tapDelay = 500;

        if (currentTime - lastTapTime > tapDelay) {
            tapCount = 0;
        }

        tapCount++;
        lastTapTime = currentTime;

        if (circleDetected && tapCount === 3) {
            circleDetected = false;
            tapCount = 0;
            window.location.href = 'admin-panel.html';
        }
    }

    function isCircle(points) {
        if (!points || points.length < minPoints) return false;

        let centerX = 0, centerY = 0;
        for (const p of points) {
            centerX += p.x;
            centerY += p.y;
        }
        centerX /= points.length;
        centerY /= points.length;

        let radius = 0;
        for (const p of points) {
            const dx = p.x - centerX;
            const dy = p.y - centerY;
            radius += Math.sqrt(dx * dx + dy * dy);
        }
        radius /= points.length;
        if (radius <= 0) return false;

        let variance = 0;
        for (const p of points) {
            const dx = p.x - centerX;
            const dy = p.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const diff = distance - radius;
            variance += diff * diff;
        }
        variance /= points.length;

        const circleScore = 1 - Math.sqrt(variance) / radius;
        const firstPoint = points[0];
        const lastPoint = points[points.length - 1];
        const dx = firstPoint.x - lastPoint.x;
        const dy = firstPoint.y - lastPoint.y;
        const closeToStart = Math.sqrt(dx * dx + dy * dy) < radius * 0.3;

        return circleScore > circleThreshold && closeToStart;
    }
});
