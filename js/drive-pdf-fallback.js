(function () {
    "use strict";

    var PROXY = "https://mishkat-drive-proxy.netlify.app/drive-pdf";
    var SIZE_LIMIT = 25 * 1024 * 1024;
    var PDFJS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    var PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    function fileIdFromIframe(iframe) {
        var src = iframe && iframe.getAttribute("src");
        if (!src) return "";
        var match = src.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
        return match ? match[1] : "";
    }

    function proxyUrl(id) {
        return PROXY + "?id=" + encodeURIComponent(id);
    }

    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            if (window.pdfjsLib) {
                resolve(window.pdfjsLib);
                return;
            }
            var script = document.createElement("script");
            script.src = src;
            script.onload = function () { resolve(window.pdfjsLib); };
            script.onerror = function () { reject(new Error("pdf.js failed to load")); };
            document.head.appendChild(script);
        });
    }

    async function fileTooLarge(id) {
        try {
            var response = await fetch(proxyUrl(id), {
                method: "GET",
                headers: { Range: "bytes=0-0" }
            });
            var range = response.headers.get("content-range") || "";
            var total = 0;
            var match = range.match(/\/(\d+)$/);
            if (match) total = parseInt(match[1], 10);
            else total = parseInt(response.headers.get("content-length") || "0", 10);
            return total >= SIZE_LIMIT;
        } catch (error) {
            return false;
        }
    }

    function mountPdfJs(iframe, id) {
        var container = iframe.parentElement;
        if (!container || container.getAttribute("data-pdfjs") === "1") return;
        container.setAttribute("data-pdfjs", "1");

        var holder = document.createElement("div");
        holder.className = "pdf-viewer";
        holder.setAttribute("title", "عرض الكتاب");
        holder.style.overflow = "auto";
        holder.style.width = "100%";
        holder.style.height = "100%";
        holder.style.border = "none";
        holder.style.background = "#ffffff";

        var loading = document.createElement("p");
        loading.textContent = "جاري فتح الكتاب…";
        loading.style.cssText = "text-align:center;padding:24px;margin:0;color:#333;font-family:Tajawal,sans-serif;";
        holder.appendChild(loading);

        iframe.style.display = "none";
        container.insertBefore(holder, iframe);

        loadScript(PDFJS_CDN).then(function (pdfjsLib) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
            return pdfjsLib.getDocument({
                url: proxyUrl(id),
                withCredentials: false,
                disableRange: false,
                disableStream: false,
                disableAutoFetch: true,
                rangeChunkSize: 65536
            }).promise;
        }).then(function (pdf) {
            if (loading.parentNode) loading.parentNode.removeChild(loading);
            var next = 1;
            var loadingMore = false;

            function renderPage(number) {
                return pdf.getPage(number).then(function (page) {
                    var base = page.getViewport({ scale: 1 });
                    var width = Math.max(holder.clientWidth - 16, 320);
                    var scale = Math.min(width / base.width, 1.6);
                    var viewport = page.getViewport({ scale: scale });
                    var canvas = document.createElement("canvas");
                    canvas.style.display = "block";
                    canvas.style.margin = "8px auto";
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    holder.appendChild(canvas);
                    return page.render({
                        canvasContext: canvas.getContext("2d"),
                        viewport: viewport
                    }).promise;
                });
            }

            function loadMore() {
                if (loadingMore || next > pdf.numPages) return;
                loadingMore = true;
                var batch = [];
                var i;
                for (i = 0; i < 2 && next <= pdf.numPages; i += 1, next += 1) {
                    batch.push(next);
                }
                var chain = Promise.resolve();
                batch.forEach(function (number) {
                    chain = chain.then(function () { return renderPage(number); });
                });
                chain.then(function () { loadingMore = false; }).catch(function () { loadingMore = false; });
            }

            loadMore();
            holder.addEventListener("scroll", function () {
                if (holder.scrollTop + holder.clientHeight > holder.scrollHeight - 480) {
                    loadMore();
                }
            });
        }).catch(function () {
            iframe.style.display = "";
            if (holder.parentNode) holder.parentNode.removeChild(holder);
            container.removeAttribute("data-pdfjs");
        });
    }

    function init() {
        var iframe = document.querySelector("iframe.pdf-viewer");
        if (!iframe) return;
        var id = fileIdFromIframe(iframe);
        if (!id) return;
        fileTooLarge(id).then(function (tooLarge) {
            if (tooLarge) mountPdfJs(iframe, id);
        });
        iframe.addEventListener("error", function () {
            mountPdfJs(iframe, id);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
