(function () {
    "use strict";

    var hideStyle = document.createElement("style");
    hideStyle.setAttribute("data-hide-drive", "1");
    hideStyle.textContent = "iframe.pdf-viewer{display:none!important;visibility:hidden!important;width:0!important;height:0!important;position:absolute!important;left:-9999px!important;}";
    (document.head || document.documentElement).appendChild(hideStyle);

    var PROXY = "https://mishkat-drive-proxy.netlify.app/drive-pdf";
    var PDFJS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    var PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    var MIN_ZOOM = 0.6;
    var MAX_ZOOM = 3;
    var CSS_PAD = 16;

    function fileIdFromIframe(iframe) {
        if (!iframe) return "";
        var dataId = iframe.getAttribute("data-drive-id") || iframe.getAttribute("data-file-id");
        if (dataId) return dataId;
        var src = iframe.getAttribute("src") || iframe.getAttribute("data-src") || "";
        var match = src.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
        return match ? match[1] : "";
    }

    function hideDriveIframe(iframe) {
        if (!iframe) return;
        iframe.style.display = "none";
        iframe.setAttribute("hidden", "hidden");
        iframe.setAttribute("aria-hidden", "true");
        iframe.removeAttribute("src");
        try { iframe.src = "about:blank"; } catch (e) {}
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

    function clamp(value, min, max) {
        if (value < min) return min;
        if (value > max) return max;
        return value;
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

    function mountPdfJs(iframe, id) {
        var container = iframe.parentElement;
        if (!container || container.getAttribute("data-pdfjs") === "1") return;
        container.setAttribute("data-pdfjs", "1");

        var holder = document.createElement("div");
        holder.className = "pdf-viewer";
        holder.setAttribute("title", "عرض الكتاب");
        holder.setAttribute("dir", "ltr");
        holder.style.overflow = "auto";
        holder.style.overflowX = "auto";
        holder.style.overflowY = "auto";
        holder.style.width = "100%";
        holder.style.height = "100%";
        holder.style.border = "none";
        holder.style.background = "#ffffff";
        holder.style.webkitOverflowScrolling = "touch";
        holder.style.touchAction = "pan-x pan-y";
        holder.style.overscrollBehavior = "contain";

        var pagesWrap = document.createElement("div");
        pagesWrap.setAttribute("dir", "ltr");
        pagesWrap.style.cssText = "box-sizing:border-box;min-width:100%;width:max-content;max-width:none;";

        var loading = document.createElement("p");
        loading.textContent = "جاري فتح الكتاب…";
        loading.style.cssText = "text-align:center;padding:24px;margin:0;color:#333;font-family:Tajawal,sans-serif;";

        holder.appendChild(pagesWrap);
        holder.appendChild(loading);

        hideDriveIframe(iframe);
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
            var panLastX = 0;
            var panLastY = 0;
            var panning = false;

            function cssScaleFor(page) {
                var base = page.getViewport({ scale: 1 });
                var width = Math.max(holder.clientWidth - CSS_PAD, 280);
                return (width / base.width) * userZoom;
            }

            function maxScrollLeft() {
                return Math.max(0, holder.scrollWidth - holder.clientWidth);
            }

            function maxScrollTop() {
                return Math.max(0, holder.scrollHeight - holder.clientHeight);
            }

            function setScroll(left, top) {
                holder.scrollLeft = clamp(left, 0, maxScrollLeft());
                holder.scrollTop = clamp(top, 0, maxScrollTop());
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
                canvas.style.maxWidth = "none";
                canvas.style.background = "#ffffff";
                canvas.dataset.outputScale = String(scale);

                if (cssWidth <= holder.clientWidth) {
                    canvas.style.margin = "8px auto";
                } else {
                    canvas.style.margin = "8px 0";
                }

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

            function snapshotView() {
                return {
                    x: holder.scrollWidth ? (holder.scrollLeft + holder.clientWidth / 2) / holder.scrollWidth : 0.5,
                    y: holder.scrollHeight ? (holder.scrollTop + holder.clientHeight / 2) / holder.scrollHeight : 0
                };
            }

            function restoreView(snap) {
                var left = snap.x * holder.scrollWidth - holder.clientWidth / 2;
                var top = snap.y * holder.scrollHeight - holder.clientHeight / 2;
                setScroll(left, top);
            }

            function rerenderAll() {
                var snap = snapshotView();
                var chain = Promise.resolve();
                slots.forEach(function (slot) {
                    chain = chain.then(function () { return paintSlot(slot); });
                });
                return chain.then(function () {
                    restoreView(snap);
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
                userZoom = clamp(Math.round(nextZoom * 100) / 100, MIN_ZOOM, MAX_ZOOM);
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

            loadMore();

            holder.addEventListener("scroll", function () {
                if (holder.scrollTop + holder.clientHeight > holder.scrollHeight - 480) {
                    loadMore();
                }
            }, { passive: true });

            holder.addEventListener("wheel", function (event) {
                if (!(event.ctrlKey || event.metaKey)) return;
                event.preventDefault();
                var delta = event.deltaY > 0 ? -0.15 : 0.15;
                setZoom(userZoom + delta, true);
            }, { passive: false });

            holder.addEventListener("touchstart", function (event) {
                if (event.touches.length === 1) {
                    panning = maxScrollLeft() > 0;
                    panLastX = event.touches[0].clientX;
                    panLastY = event.touches[0].clientY;
                    pinchStart = 0;
                    return;
                }
                if (event.touches.length === 2) {
                    panning = false;
                    var a = event.touches[0];
                    var b = event.touches[1];
                    pinchStart = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
                    pinchZoom = userZoom;
                    panLastX = (a.clientX + b.clientX) / 2;
                    panLastY = (a.clientY + b.clientY) / 2;
                }
            }, { passive: true });

            holder.addEventListener("touchmove", function (event) {
                if (event.touches.length === 1 && panning) {
                    event.preventDefault();
                    var touch = event.touches[0];
                    setScroll(
                        holder.scrollLeft - (touch.clientX - panLastX),
                        holder.scrollTop - (touch.clientY - panLastY)
                    );
                    panLastX = touch.clientX;
                    panLastY = touch.clientY;
                    return;
                }
                if (event.touches.length === 2 && pinchStart) {
                    event.preventDefault();
                    var a = event.touches[0];
                    var b = event.touches[1];
                    var dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
                    var midX = (a.clientX + b.clientX) / 2;
                    var midY = (a.clientY + b.clientY) / 2;
                    setScroll(
                        holder.scrollLeft - (midX - panLastX),
                        holder.scrollTop - (midY - panLastY)
                    );
                    panLastX = midX;
                    panLastY = midY;
                    setZoom(pinchZoom * (dist / pinchStart), false);
                }
            }, { passive: false });

            holder.addEventListener("touchend", function (event) {
                if (event.touches.length === 0) panning = false;
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
            hideDriveIframe(iframe);
            loading.textContent = "تعذر فتح الكتاب";
            if (!loading.parentNode) holder.appendChild(loading);
        });
    }

    function init() {
        var iframe = document.querySelector("iframe.pdf-viewer");
        if (!iframe) return;
        var id = fileIdFromIframe(iframe);
        hideDriveIframe(iframe);
        if (!id) return;
        mountPdfJs(iframe, id);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
