(function () {
    "use strict";

    var PROXY = "https://mishkat-drive-proxy.netlify.app/drive-pdf";
    var SIZE_LIMIT = 25 * 1024 * 1024;
    var PDFJS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    var PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    var MIN_ZOOM = 0.6;
    var MAX_ZOOM = 3;
    var CSS_PAD = 16;

    function fileIdFromIframe(iframe) {
        var src = iframe && iframe.getAttribute("src");
        if (!src) return "";
        var match = src.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
        return match ? match[1] : "";
    }

    function proxyUrl(id) {
        return PROXY + "?id=" + encodeURIComponent(id);
    }

    function outputScale() {
        var dpr = window.devicePixelRatio || 1;
        if (dpr < 1) dpr = 1;
        if (dpr < 1.25) return 2;
        if (dpr > 3) return 3;
        return dpr;
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
        holder.style.webkitOverflowScrolling = "touch";
        holder.style.touchAction = "pan-y pinch-zoom";

        var toolbar = document.createElement("div");
        toolbar.setAttribute("dir", "ltr");
        toolbar.style.cssText = "position:sticky;top:0;z-index:3;display:flex;align-items:center;justify-content:center;gap:10px;padding:6px 8px;background:rgba(255,255,255,0.94);font-family:Tajawal,sans-serif;font-size:14px;color:#333;";

        function makeZoomBtn(label, title) {
            var btn = document.createElement("button");
            btn.type = "button";
            btn.textContent = label;
            btn.title = title;
            btn.style.cssText = "width:32px;height:32px;border:0;border-radius:8px;background:#007bff;color:#fff;font-size:18px;line-height:1;cursor:pointer;";
            return btn;
        }

        var zoomOutBtn = makeZoomBtn("−", "تصغير");
        var zoomLabel = document.createElement("span");
        zoomLabel.style.cssText = "min-width:52px;text-align:center;font-weight:700;";
        var zoomInBtn = makeZoomBtn("+", "تكبير");
        toolbar.appendChild(zoomOutBtn);
        toolbar.appendChild(zoomLabel);
        toolbar.appendChild(zoomInBtn);

        var pagesWrap = document.createElement("div");
        pagesWrap.style.cssText = "padding:0 0 12px;";

        var loading = document.createElement("p");
        loading.textContent = "جاري فتح الكتاب…";
        loading.style.cssText = "text-align:center;padding:24px;margin:0;color:#333;font-family:Tajawal,sans-serif;";

        holder.appendChild(toolbar);
        holder.appendChild(pagesWrap);
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

            var userZoom = 1;
            var next = 1;
            var loadingMore = false;
            var slots = [];
            var rerenderTimer = 0;
            var pinchStart = 0;
            var pinchZoom = 1;

            function clampZoom(value) {
                if (value < MIN_ZOOM) return MIN_ZOOM;
                if (value > MAX_ZOOM) return MAX_ZOOM;
                return Math.round(value * 100) / 100;
            }

            function updateZoomLabel() {
                zoomLabel.textContent = Math.round(userZoom * 100) + "%";
            }

            function cssScaleFor(page) {
                var base = page.getViewport({ scale: 1 });
                var width = Math.max(holder.clientWidth - CSS_PAD, 280);
                return (width / base.width) * userZoom;
            }

            function paintSlot(slot) {
                if (!slot || !slot.page) return Promise.resolve();
                if (slot.task) {
                    try { slot.task.cancel(); } catch (error) {}
                    slot.task = null;
                }

                var page = slot.page;
                var canvas = slot.canvas;
                var cssScale = cssScaleFor(page);
                var viewport = page.getViewport({ scale: cssScale });
                var scale = outputScale();
                var cssWidth = Math.floor(viewport.width);
                var cssHeight = Math.floor(viewport.height);

                canvas.width = Math.floor(cssWidth * scale);
                canvas.height = Math.floor(cssHeight * scale);
                canvas.style.width = cssWidth + "px";
                canvas.style.height = cssHeight + "px";
                canvas.style.display = "block";
                canvas.style.margin = "8px auto";
                canvas.style.background = "#ffffff";
                canvas.dataset.outputScale = String(scale);

                var ctx = canvas.getContext("2d", { alpha: false });
                if (!ctx) return Promise.resolve();
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.imageSmoothingEnabled = true;
                if (ctx.imageSmoothingQuality) ctx.imageSmoothingQuality = "high";

                var transform = scale !== 1 ? [scale, 0, 0, scale, 0, 0] : null;
                var task = page.render({
                    canvasContext: ctx,
                    viewport: viewport,
                    transform: transform,
                    intent: "display",
                    annotationMode: 0
                });
                slot.task = task;
                return task.promise.then(function () {
                    if (slot.task === task) slot.task = null;
                }).catch(function (error) {
                    if (slot.task === task) slot.task = null;
                    if (error && error.name === "RenderingCancelledException") return;
                    throw error;
                });
            }

            function renderPage(number) {
                return pdf.getPage(number).then(function (page) {
                    var canvas = document.createElement("canvas");
                    var slot = { number: number, page: page, canvas: canvas, task: null };
                    slots.push(slot);
                    pagesWrap.appendChild(canvas);
                    return paintSlot(slot);
                });
            }

            function rerenderAll() {
                var ratio = holder.scrollHeight
                    ? holder.scrollTop / holder.scrollHeight
                    : 0;
                var chain = Promise.resolve();
                slots.forEach(function (slot) {
                    chain = chain.then(function () { return paintSlot(slot); });
                });
                return chain.then(function () {
                    holder.scrollTop = ratio * holder.scrollHeight;
                }).catch(function () {});
            }

            function scheduleRerender() {
                if (rerenderTimer) clearTimeout(rerenderTimer);
                rerenderTimer = setTimeout(function () {
                    rerenderTimer = 0;
                    rerenderAll();
                }, 140);
            }

            function setZoom(nextZoom, rerender) {
                userZoom = clampZoom(nextZoom);
                updateZoomLabel();
                zoomOutBtn.disabled = userZoom <= MIN_ZOOM;
                zoomInBtn.disabled = userZoom >= MAX_ZOOM;
                if (rerender) scheduleRerender();
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

            setZoom(1, false);
            loadMore();

            holder.addEventListener("scroll", function () {
                if (holder.scrollTop + holder.clientHeight > holder.scrollHeight - 480) {
                    loadMore();
                }
            });

            zoomInBtn.addEventListener("click", function () {
                setZoom(userZoom + 0.25, true);
            });
            zoomOutBtn.addEventListener("click", function () {
                setZoom(userZoom - 0.25, true);
            });

            holder.addEventListener("wheel", function (event) {
                if (!(event.ctrlKey || event.metaKey)) return;
                event.preventDefault();
                var delta = event.deltaY > 0 ? -0.15 : 0.15;
                setZoom(userZoom + delta, true);
            }, { passive: false });

            holder.addEventListener("touchstart", function (event) {
                if (event.touches.length !== 2) return;
                var a = event.touches[0];
                var b = event.touches[1];
                pinchStart = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
                pinchZoom = userZoom;
            }, { passive: true });

            holder.addEventListener("touchmove", function (event) {
                if (event.touches.length !== 2 || !pinchStart) return;
                var a = event.touches[0];
                var b = event.touches[1];
                var dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
                setZoom(pinchZoom * (dist / pinchStart), false);
            }, { passive: true });

            holder.addEventListener("touchend", function (event) {
                if (event.touches.length < 2 && pinchStart) {
                    pinchStart = 0;
                    scheduleRerender();
                }
            });

            var resizeTimer = 0;
            function onResize() {
                if (resizeTimer) clearTimeout(resizeTimer);
                resizeTimer = setTimeout(function () {
                    resizeTimer = 0;
                    rerenderAll();
                }, 180);
            }
            window.addEventListener("resize", onResize);
            if (window.visualViewport) {
                window.visualViewport.addEventListener("resize", onResize);
            }
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
