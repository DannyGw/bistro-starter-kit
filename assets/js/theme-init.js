/**
 * Bistro Starter Kit — pre-paint theme bootstrap.
 * ---------------------------------------------------------------------------
 * Loaded synchronously in <head> by every page, before any stylesheet paints,
 * so the correct colour scheme is applied on the first frame (no white flash).
 *
 * Lives in its own file rather than an inline <script> for two reasons:
 *   1. A strict Content-Security-Policy without `script-src 'unsafe-inline'`
 *      would block an inline block.
 *   2. It is the one script that must never be deferred.
 * ---------------------------------------------------------------------------
 */
(function () {
    'use strict';

    var DARK_FALLBACK = true; // config.js has not parsed yet on the very first run

    // Marks the document as script-enabled. CSS uses this to gate effects that
    // would otherwise leave content invisible when JavaScript never runs.
    document.documentElement.classList.add('js');

    try {
        var stored = window.localStorage.getItem('bistro.theme');
        var theme =
            stored ||
            (window.Bistro && window.Bistro.Config ? window.Bistro.Config.theme.default : null);

        document.documentElement.classList.toggle('dark', theme ? theme === 'dark' : DARK_FALLBACK);
    } catch (err) {
        // Private mode / blocked storage: fall back to the kit's default scheme.
        document.documentElement.classList.toggle('dark', DARK_FALLBACK);
    }
})();
