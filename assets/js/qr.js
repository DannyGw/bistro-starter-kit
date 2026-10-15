/**
 * Bistro Starter Kit — QR code table ordering.
 * ---------------------------------------------------------------------------
 * Each table gets a deep link:  <origin>/index.html?table=7
 * Opening it pre-selects the table and jumps straight to the menu, so a guest
 * scans and orders without hunting for a table number.
 *
 * Rendering uses the `qrcode` package from a CDN when it is available. If the
 * CDN is unreachable — offline dev, locked-down network — we fall back to an
 * inline SVG card that still prints the URL, plus a copy/open button in the UI.
 * To go fully offline, `npm i qrcode` and self-host one file.
 * ---------------------------------------------------------------------------
 */
(function (global) {
    'use strict';

    var Bistro = (global.Bistro = global.Bistro || {});
    var CONFIG = Bistro.Config;

    var CDN = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
    var loading = null;

    /** Load the QR library once, resolving to true/false rather than rejecting. */
    function ensureLibrary() {
        if (global.QRCode && typeof global.QRCode.toDataURL === 'function') return Promise.resolve(true);
        if (loading) return loading;

        loading = new Promise(function (resolve) {
            var script = document.createElement('script');
            script.src = CDN;
            script.async = true;
            script.onload = function () {
                resolve(Boolean(global.QRCode));
            };
            script.onerror = function () {
                console.warn('[Bistro.QR] QR library unavailable — using the fallback renderer.');
                resolve(false);
            };
            document.head.appendChild(script);
        });

        return loading;
    }

    function baseUrl() {
        var configured = CONFIG.get('qr.baseUrl', '');
        if (configured) return String(configured).replace(/\/+$/, '');
        if (global.location && global.location.origin && global.location.origin !== 'null') {
            return global.location.origin + global.location.pathname.replace(/[^/]*$/, '');
        }
        return '';
    }

    /** Deep link for a table number. */
    function tableUrl(table) {
        var param = CONFIG.get('qr.param', 'table');
        var root = baseUrl();
        var joiner = root.indexOf('?') === -1 ? '?' : '&';
        return root + joiner + param + '=' + encodeURIComponent(table);
    }

    /** Table number from the current URL, e.g. ?table=7 → '7'. */
    function tableFromUrl(search) {
        try {
            var query = search === undefined ? global.location.search : search;
            var value = new URLSearchParams(query).get(CONFIG.get('qr.param', 'table'));
            if (!value) return '';
            // Only accept sane table identifiers.
            return /^[A-Za-z0-9-]{1,8}$/.test(value) ? value : '';
        } catch (err) {
            return '';
        }
    }

    /** Fallback card, returned as an SVG data URI so it drops into <img> as-is. */
    function fallbackDataUri(text, size) {
        var escaped = String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        var svg =
            '<svg xmlns="http://www.w3.org/2000/svg" width="' +
            size +
            '" height="' +
            size +
            '" viewBox="0 0 300 300">' +
            '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0" stop-color="#f59e0b"/><stop offset="1" stop-color="#14b8a6"/>' +
            '</linearGradient></defs>' +
            '<rect width="300" height="300" rx="24" fill="#0b0b0f"/>' +
            '<rect x="18" y="18" width="264" height="264" rx="18" fill="none" stroke="url(#g)" stroke-width="4" stroke-dasharray="10 8"/>' +
            '<rect x="118" y="96" width="64" height="64" rx="10" fill="url(#g)"/>' +
            '<text x="150" y="196" text-anchor="middle" fill="#f5f5fa" font-family="Inter,Arial,sans-serif" font-size="15">QR library offline</text>' +
            '<text x="150" y="222" text-anchor="middle" fill="#a8a8b6" font-family="Inter,Arial,sans-serif" font-size="12">' +
            escaped.slice(0, 42) +
            '</text></svg>';
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }

    /**
     * Render `text` as a QR PNG data URI.
     * @param {string} text
     * @param {{size?:number, margin?:number, dark?:string, light?:string}} [options]
     * @returns {Promise<{dataUrl:string, fallback:boolean}>}
     */
    function toDataUrl(text, options) {
        var opts = options || {};
        var size = opts.size || CONFIG.get('qr.size', 320);

        return ensureLibrary().then(function (ready) {
            if (!ready) return { dataUrl: fallbackDataUri(text, size), fallback: true };

            return global.QRCode.toDataURL(text, {
                width: size,
                margin: opts.margin === undefined ? 1 : opts.margin,
                errorCorrectionLevel: 'M',
                color: {
                    dark: opts.dark || '#0b0b0f',
                    light: opts.light || '#ffffff'
                }
            }).then(function (dataUrl) {
                return { dataUrl: dataUrl, fallback: false };
            });
        });
    }

    Bistro.QR = {
        CDN: CDN,
        ensureLibrary: ensureLibrary,
        baseUrl: baseUrl,
        tableUrl: tableUrl,
        tableFromUrl: tableFromUrl,
        toDataUrl: toDataUrl,
        fallbackDataUri: fallbackDataUri
    };
})(window);
