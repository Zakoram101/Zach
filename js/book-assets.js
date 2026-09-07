(function (root) {
    "use strict";

    var BOOK_EXT = /\.(pdf|zip|epub)$/i;
    var CACHE_KEY = "mishkat-book-assets";
    var CACHE_MS = 60 * 1000;

    function repoFromLocation() {
        var host = (root.location.hostname || "").toLowerCase();
        if (host.endsWith(".github.io")) {
            var owner = host.slice(0, -".github.io".length);
            var parts = (root.location.pathname || "").split("/").filter(Boolean);
            return { owner: owner, repo: parts[0] || owner };
        }
        return { owner: "Zakoram101", repo: "Zach" };
    }

    function isBookFile(item) {
        var name = item && (item.name || item);
        if (item && item.type && item.type !== "file") return false;
        return BOOK_EXT.test(name || "");
    }

    function normalize(items) {
        if (!Array.isArray(items)) return [];
        return items.filter(isBookFile).map(function (item) {
            return { name: typeof item === "string" ? item : item.name };
        });
    }

    function readCache() {
        try {
            var raw = root.sessionStorage.getItem(CACHE_KEY);
            if (!raw) return null;
            var parsed = JSON.parse(raw);
            if (!parsed || !Array.isArray(parsed.files)) return null;
            if (Date.now() - parsed.at > CACHE_MS) return null;
            return parsed.files;
        } catch (error) {
            return null;
        }
    }

    function writeCache(files) {
        try {
            root.sessionStorage.setItem(CACHE_KEY, JSON.stringify({
                at: Date.now(),
                files: files
            }));
        } catch (error) {}
    }

    function localListUrl() {
        var script = root.document && root.document.querySelector('script[src*="book-assets.js"]');
        if (script && script.src) {
            return script.src.replace(/book-assets\.js(\?.*)?$/, "book-list.json");
        }
        return "js/book-list.json";
    }

    function fetchJson(url) {
        return fetch(url, { headers: { Accept: "application/json" } }).then(function (res) {
            if (!res.ok) throw new Error("list failed");
            return res.json();
        });
    }

    function fetchFromGitHub() {
        var repo = repoFromLocation();
        var url = "https://api.github.com/repos/" +
            encodeURIComponent(repo.owner) + "/" +
            encodeURIComponent(repo.repo) + "/contents/Book";
        return fetch(url)
            .then(function (res) {
                if (!res.ok) throw new Error("github list failed");
                return res.json();
            })
            .then(normalize);
    }

    function fetchFromLocalIndex() {
        return fetchJson(localListUrl()).then(normalize);
    }

    function mergeFiles(a, b) {
        var seen = {};
        var out = [];
        function add(list) {
            (list || []).forEach(function (item) {
                var name = item && item.name;
                if (!name || seen[name]) return;
                seen[name] = true;
                out.push({ name: name });
            });
        }
        add(a);
        add(b);
        return out;
    }

    function listBookFiles() {
        var cached = readCache();
        if (cached && cached.length) return Promise.resolve(cached);

        return fetchFromLocalIndex().catch(function () { return []; }).then(function (local) {
            return fetchFromGitHub().then(function (remote) {
                var files = mergeFiles(local, remote);
                if (files.length) writeCache(files);
                return files;
            }).catch(function () {
                if (local.length) writeCache(local);
                return local;
            });
        });
    }

    function updateDownloadCount(el) {
        if (!el) return Promise.resolve();
        return listBookFiles().then(function (files) {
            el.textContent = String(files.length);
            return files.length;
        }).catch(function () {
            return null;
        });
    }

    root.MishkatBooks = {
        listBookFiles: listBookFiles,
        updateDownloadCount: updateDownloadCount
    };
})(window);
