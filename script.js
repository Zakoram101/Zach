(function() {
    "use strict";

    // Utility Functions
    const utils = {
        // Safe element selection
        safeSelect(selector, isAll = false) {
            try {
                return isAll ? document.querySelectorAll(selector) : document.querySelector(selector);
            } catch (error) {
                console.warn(`Element selection failed: ${selector}`, error);
                return null;
            }
        },

        // Safe event listener
        safeAddEventListener(element, event, handler, options = {}) {
            if (element) {
                try {
                    element.addEventListener(event, handler, options);
                } catch (error) {
                    console.warn(`Failed to add event listener: ${event}`, error);
                }
            }
        },

        // Safe localStorage wrapper
        getLocalStorage(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
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

    // Book App Class
    class BookApp {
        constructor() {
            this.initializeElements();
        }

        // Initialize all elements
        initializeElements() {
            this.elements = {
                searchPanel: utils.safeSelect(".search-panel"),
                searchInput: utils.safeSelect("#search-input"),
                searchForm: utils.safeSelect(".search-form"),
                alertBox: utils.safeSelect("#customAlert"),
                noResults: utils.safeSelect("#no-results"),
                resetBtn: utils.safeSelect(".reset-btn"),
                booksShowcase: utils.safeSelect(".books-showcase"),
                books: utils.safeSelect(".book-card", true),
                bookmarks: utils.safeSelect(".bookmark", true),
                featuredButtons: utils.safeSelect(".featured-btn", true)
            };
        }

        // Search functionality
        searchBooks() {
            const { searchInput, books, noResults, resetBtn, booksShowcase } = this.elements;
            if (!searchInput || !books) return false;

            const query = searchInput.value.trim().toLowerCase();
            let found = false;

            // Validate query
            if (query.length === 0) {
                this.showAlert();
                
                // Hide showcase and reset button initially
                if (booksShowcase) booksShowcase.style.display = 'none';
                if (resetBtn) resetBtn.style.display = 'none';
                
                return false;
            }

            // Store last search
            utils.setLocalStorage("lastSearch", query);

            // Show showcase when searching
            if (booksShowcase) booksShowcase.style.display = 'block';

            // Perform search
            books.forEach(book => {
                const titleEl = book.querySelector(".book-title");
                const authorEl = book.querySelector(".book-author");

                if (titleEl && authorEl) {
                    const title = titleEl.textContent.toLowerCase();
                    const author = authorEl.textContent.toLowerCase();

                    const match = title.includes(query) || author.includes(query);

                    book.style.display = match ? 'block' : 'none';
                    found = found || match;
                }
            });

            // Update no results display
            if (noResults) {
                noResults.style.display = found ? 'none' : 'block';
            }

            // Always show reset button when a search is performed
            if (resetBtn) {
                resetBtn.style.display = 'inline-block';
            }

            return false; // Prevent form submission
        }

        // Reset search functionality
        resetSearch() {
            const { books, searchInput, noResults, resetBtn, booksShowcase } = this.elements;
            
            if (books) {
                books.forEach(book => {
                    book.style.display = 'block';
                });
            }

            if (searchInput) searchInput.value = "";
            if (noResults) noResults.style.display = 'none';
            if (resetBtn) resetBtn.style.display = 'none';
            
            // Hide books showcase until search is initiated
            if (booksShowcase) booksShowcase.style.display = 'none';
            
            utils.setLocalStorage("lastSearch", "");
        }

        // Show alert for invalid search
        showAlert() {
            const { alertBox } = this.elements;
            if (alertBox) {
                alertBox.style.display = 'block';
                setTimeout(() => {
                    alertBox.style.display = 'none';
                }, 2000);
            }
        }

        // Toggle search panel
        toggleSearch() {
            const { searchPanel, searchInput, resetBtn, booksShowcase } = this.elements;
            if (!searchPanel) return;

            searchPanel.classList.toggle('active');
            
            if (searchPanel.classList.contains('active')) {
                // Hide books showcase and reset button when opening search
                if (booksShowcase) booksShowcase.style.display = 'none';
                if (resetBtn) resetBtn.style.display = 'none';

                // Restore last search
                const lastSearch = utils.getLocalStorage("lastSearch", "");
                if (searchInput) {
                    searchInput.value = lastSearch;
                    if (lastSearch) this.searchBooks();
                }
            } else {
                this.resetSearch();
            }
        }

        // Setup bookmarks navigation
        setupBookmarks() {
            const { bookmarks } = this.elements;
            if (bookmarks) {
                bookmarks.forEach(bookmark => {
                    utils.safeAddEventListener(bookmark, 'click', () => {
                        const link = bookmark.getAttribute("data-link");
                        if (link) {
                            window.location.href = link;
                        }
                    });
                });
            }
        }

        // Setup featured buttons navigation
        setupFeaturedButtons() {
            const { featuredButtons } = this.elements;
            if (featuredButtons) {
                featuredButtons.forEach(button => {
                    utils.safeAddEventListener(button, 'click', () => {
                        const page = button.getAttribute("data-page");
                        if (page) {
                            window.location.href = page;
                        }
                    });
                });
            }
        }

        // Setup event listeners
        setupEventListeners() {
            const { searchInput, searchForm, resetBtn } = this.elements;

            // Search input events
            if (searchInput) {
                utils.safeAddEventListener(searchInput, 'input', this.searchBooks.bind(this));
                utils.safeAddEventListener(searchInput, 'keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.searchBooks();
                    }
                });
            }

            // Prevent default form submission
            if (searchForm) {
                utils.safeAddEventListener(searchForm, 'submit', (e) => e.preventDefault());
            }

            // Reset button
            if (resetBtn) {
                utils.safeAddEventListener(resetBtn, 'click', this.resetSearch.bind(this));
            }

            // Escape key handler
            utils.safeAddEventListener(document, 'keydown', (e) => {
                const { searchPanel } = this.elements;
                if (e.key === 'Escape' && searchPanel && searchPanel.classList.contains('active')) {
                    this.toggleSearch();
                }
            });
        }

        // Main initialization method
        initialize() {
            // Hide books showcase initially
            const { booksShowcase, resetBtn } = this.elements;
            if (booksShowcase) booksShowcase.style.display = 'none';
            if (resetBtn) resetBtn.style.display = 'none';

            this.setupEventListeners();
            this.setupBookmarks();
            this.setupFeaturedButtons();
        }
    }

    // Global functions for HTML inline event handlers
    window.toggleSearch = function() {
        const bookApp = new BookApp();
        bookApp.toggleSearch();
    };

    window.searchBooks = function() {
        const bookApp = new BookApp();
        return bookApp.searchBooks();
    };

    window.resetSearch = function() {
        const bookApp = new BookApp();
        bookApp.resetSearch();
    };

    window.closeAlert = function() {
        const alertBox = document.getElementById('customAlert');
        if (alertBox) {
            alertBox.style.display = 'none';
        }
    };

    // Initialize app when DOM is ready
    function initApp() {
        const bookApp = new BookApp();
        bookApp.initialize();
    }

    // Ensure DOM is fully loaded before initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }
})();

// التحقق من تسجيل الدخول
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        // المستخدم غير مسجل، إعادة التوجيه إلى صفحة تسجيل الدخول
        window.location.href = "Pages/inde.html"; 
    }
});


document.getElementById("logout-btn").addEventListener("click", () => {
    firebase.auth().signOut().then(() => {
        window.location.href = "Pages/inde.html"; // إعادة التوجيه لصفحة تسجيل الدخول بعد الخروج
    }).catch((error) => {
        console.error("خطأ أثناء تسجيل الخروج:", error);
    });
});

