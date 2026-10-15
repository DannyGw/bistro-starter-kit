/**
 * Bistro Starter Kit — UI primitives.
 * ---------------------------------------------------------------------------
 * DOM helpers, an inline-SVG icon set, toasts, overlays, brand application and
 * the scroll-reveal observer. Deliberately framework-free.
 * ---------------------------------------------------------------------------
 */
(function (global) {
    'use strict';

    var Bistro = (global.Bistro = global.Bistro || {});
    var CONFIG = Bistro.Config;
    var I18N = null; // resolved lazily — i18n.js loads after this file is parsed

    function t(key, vars) {
        I18N = I18N || Bistro.I18N;
        return I18N ? I18N.t(key, vars) : key;
    }

    function money(amount) {
        I18N = I18N || Bistro.I18N;
        return I18N ? I18N.formatMoney(amount) : String(amount);
    }

    /* ------------------------------------------------------------------ *
     * DOM
     * ------------------------------------------------------------------ */

    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $$(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    /** Delegated listener: `on(root, 'click', '.add-btn', handler)`. */
    function on(root, type, selector, handler) {
        if (!root) return function () { };
        var listener = function (event) {
            var target = event.target.closest(selector);
            if (target && root.contains(target)) handler(event, target);
        };
        root.addEventListener(type, listener);
        return function () {
            root.removeEventListener(type, listener);
        };
    }

    function escapeHtml(value) {
        return String(value === undefined || value === null ? '' : value).replace(
            /[&<>"']/g,
            function (char) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
                }[char];
            }
        );
    }

    function debounce(fn, wait) {
        var timer = null;
        return function () {
            var args = arguments;
            var context = this;
            global.clearTimeout(timer);
            timer = global.setTimeout(function () {
                fn.apply(context, args);
            }, wait || 200);
        };
    }

    function attr(value) {
        return escapeHtml(value);
    }

    /* ------------------------------------------------------------------ *
     * Icons — 24x24, currentColor, stroke-based
     * ------------------------------------------------------------------ */

    var ICONS = {
        cart: '<circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/><path d="M2.5 3h2.2l2.3 11.2a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.55L21 7H6"/>',
        search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
        close: '<path d="M6 6l12 12M18 6L6 18"/>',
        sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7"/>',
        moon: '<path d="M20 14.2A8.4 8.4 0 0 1 9.8 4a8.6 8.6 0 1 0 10.2 10.2z"/>',
        menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
        plus: '<path d="M12 5v14M5 12h14"/>',
        minus: '<path d="M5 12h14"/>',
        trash: '<path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
        check: '<path d="M4.5 12.5 9.5 17.5 19.5 7"/>',
        calendar: '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/>',
        clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.2 2"/>',
        star: '<path d="m12 3.6 2.6 5.3 5.9.85-4.25 4.15 1 5.9L12 17l-5.25 2.75 1-5.9L3.5 9.75l5.9-.85z"/>',
        qr: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M14 14h3v3h-3zM20 14v2M14 20h7"/>',
        globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.4 3.8 5.5 3.8 9S14.5 18.6 12 21c-2.5-2.4-3.8-5.5-3.8-9S9.5 5.4 12 3z"/>',
        chevronDown: '<path d="m6 9.5 6 6 6-6"/>',
        arrowRight: '<path d="M4 12h15M13 6l6 6-6 6"/>',
        phone: '<path d="M6.5 3h3l1.6 4-2 1.4a12 12 0 0 0 5.5 5.5l1.4-2 4 1.6v3A2.5 2.5 0 0 1 17 19C10 18.4 5.6 14 5 7a2.5 2.5 0 0 1 1.5-4z"/>',
        mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/>',
        pin: '<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>',
        sliders: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2.2"/><circle cx="10" cy="17" r="2.2"/>',
        download: '<path d="M12 3v12M7.5 10.5 12 15l4.5-4.5M4 20h16"/>',
        external: '<path d="M14 4h6v6M20 4l-8.5 8.5M18 14v5a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 5 19V9a1.5 1.5 0 0 1 1.5-1.5H11"/>',
        refresh: '<path d="M20 11a8 8 0 1 0-2.4 5.6M20 5v6h-6"/>',
        receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
        lock: '<rect x="4.5" y="10" width="15" height="10.5" rx="2.5"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/>',
        logout: '<path d="M15 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8M17 8l4 4-4 4M21 12h-9"/>',
        alert: '<path d="M12 4l9 16H3z"/><path d="M12 10v4.5M12 17.4h.01"/>',
        info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
        card: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6 15h4"/>',
        wallet: '<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a2 2 0 0 1 2 2v1"/><rect x="3" y="8" width="18" height="11" rx="2.5"/><circle cx="16.5" cy="13.5" r="1.3"/>',
        mobile: '<rect x="6.5" y="2.5" width="11" height="19" rx="3"/><path d="M11 5.5h2M12 18.5h.01"/>',
        table: '<path d="M3 9h18M6 9v11M18 9v11M3 5.5h18v3.5H3z"/>',
        users: '<circle cx="9" cy="8" r="3.4"/><path d="M2.8 20a6.2 6.2 0 0 1 12.4 0M16.5 5.2a3.4 3.4 0 0 1 0 6.6M18 20h3.2a5.6 5.6 0 0 0-3.6-5.2"/>',
        sparkle: '<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/>',
        grid: '<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/>',
        eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3.2"/>',
        eyeOff: '<path d="M4 4l16 16M9.6 5.9A9.4 9.4 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.6 3.4M6.3 7.9A16.6 16.6 0 0 0 2.5 12S6 18.5 12 18.5c1 0 1.9-.2 2.7-.5"/>'
    };

    /**
     * Inline SVG icon.
     * @param {string} name key of `ICONS`
     * @param {string} [classes] Tailwind/CSS classes for the <svg>
     */
    function icon(name, classes) {
        var path = ICONS[name] || ICONS.info;
        return (
            '<svg class="' +
            (classes || 'h-5 w-5') +
            '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
            path +
            '</svg>'
        );
    }

    var STAR_PATH = 'm12 3.6 2.6 5.3 5.9.85-4.25 4.15 1 5.9L12 17l-5.25 2.75 1-5.9L3.5 9.75l5.9-.85z';
    /** Gradient ids must be unique per document — stars() can render many times. */
    var starSeq = 0;

    /** Filled star rating row. */
    function stars(rating, classes) {
        var value = Math.round((parseFloat(rating) || 0) * 2) / 2;
        var out = '';
        for (var i = 1; i <= 5; i += 1) {
            var filled = value >= i;
            var half = !filled && value >= i - 0.5;
            var gradientId = 'star-half-' + (starSeq += 1);
            out +=
                '<svg class="' +
                (classes || 'h-4 w-4') +
                '" viewBox="0 0 24 24" fill="' +
                (filled || half ? 'currentColor' : 'none') +
                '" stroke="currentColor" stroke-width="1.5" aria-hidden="true">' +
                (half
                    ? '<defs><linearGradient id="' +
                    gradientId +
                    '"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs>' +
                    '<path fill="url(#' +
                    gradientId +
                    ')" d="' +
                    STAR_PATH +
                    '"/>'
                    : '<path d="' + STAR_PATH + '"/>') +
                '</svg>';
        }
        return out;
    }

    /* ------------------------------------------------------------------ *
     * Toasts
     * ------------------------------------------------------------------ */

    function toastHost() {
        var host = document.getElementById('toast-host');
        if (host) return host;
        host = document.createElement('div');
        host.id = 'toast-host';
        host.className =
            'fixed bottom-5 left-1/2 z-[90] flex w-[min(92vw,26rem)] -translate-x-1/2 flex-col gap-2';
        host.setAttribute('role', 'status');
        host.setAttribute('aria-live', 'polite');
        document.body.appendChild(host);
        return host;
    }

    var TONE = {
        success: { ring: 'border-emerald-400/40', ic: 'check', color: 'text-emerald-500' },
        error: { ring: 'border-rose-400/40', ic: 'alert', color: 'text-rose-500' },
        info: { ring: 'border-sky-400/40', ic: 'info', color: 'text-sky-500' },
        warn: { ring: 'border-amber-400/40', ic: 'alert', color: 'text-amber-500' }
    };

    /**
     * Show a transient message.
     * @param {string} message already-translated text
     * @param {{tone?:'success'|'error'|'info'|'warn', timeout?:number}} [options]
     */
    function toast(message, options) {
        var opts = options || {};
        var tone = TONE[opts.tone] || TONE.info;
        var node = document.createElement('div');
        node.className =
            'toast glass-strong flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-xl ' +
            tone.ring;
        node.innerHTML =
            '<span class="' +
            tone.color +
            ' mt-0.5 shrink-0">' +
            icon(tone.ic, 'h-5 w-5') +
            '</span><p class="flex-1 leading-snug">' +
            escapeHtml(message) +
            '</p>' +
            '<button type="button" class="shrink-0 rounded-lg p-1 text-current opacity-60 transition hover:opacity-100" data-toast-close aria-label="' +
            attr(t('common.close')) +
            '">' +
            icon('close', 'h-4 w-4') +
            '</button>';

        var host = toastHost();
        host.appendChild(node);

        var remove = function () {
            node.style.opacity = '0';
            global.setTimeout(function () {
                node.remove();
            }, 180);
        };

        node.querySelector('[data-toast-close]').addEventListener('click', remove);
        global.setTimeout(remove, opts.timeout || 4200);
        return remove;
    }

    /* ------------------------------------------------------------------ *
     * Overlays (cart drawer, mobile nav, modals)
     * ------------------------------------------------------------------ */

    function open(id) {
        var node = document.getElementById(id);
        if (!node) return;
        node.classList.add('is-open');
        node.removeAttribute('aria-hidden');
        node.removeAttribute('inert');
        document.body.classList.add('is-locked');
        setExpanded(id, true);

        var scrim = document.getElementById(id + '-scrim');
        if (scrim) scrim.classList.add('is-open');

        var focusable = node.querySelector(
            'input:not([type=hidden]), select, textarea, button, [href], [tabindex]:not([tabindex="-1"])'
        );
        if (focusable) global.setTimeout(function () { focusable.focus({ preventScroll: true }); }, 120);
    }

    function close(id) {
        var node = document.getElementById(id);
        if (!node) return;
        node.classList.remove('is-open');
        node.setAttribute('aria-hidden', 'true');
        // `aria-hidden` alone leaves the contents tabbable, which strands keyboard
        // focus inside an invisible drawer. `inert` removes it from the tab order
        // and from the accessibility tree in one go.
        node.setAttribute('inert', '');
        setExpanded(id, false);

        var scrim = document.getElementById(id + '-scrim');
        if (scrim) scrim.classList.remove('is-open');

        if (!document.querySelector('.drawer.is-open')) document.body.classList.remove('is-locked');
    }

    /** Mirror an overlay's state onto whatever `[data-open="id"]` button opened it. */
    function setExpanded(id, expanded) {
        $$('[data-open="' + id + '"]').forEach(function (button) {
            button.setAttribute('aria-expanded', String(Boolean(expanded)));
        });
    }

    function closeAll() {
        $$('.drawer.is-open, .modal.is-open').forEach(function (node) {
            close(node.id);
        });
        document.body.classList.remove('is-locked');
    }

    /** Wire every `[data-close="targetId"]` element and every scrim. */
    function bindOverlays(root) {
        on(root || document, 'click', '[data-close]', function (event, trigger) {
            event.preventDefault();
            close(trigger.getAttribute('data-close'));
        });
        on(root || document, 'click', '[data-open]', function (event, trigger) {
            event.preventDefault();
            open(trigger.getAttribute('data-open'));
        });
        on(root || document, 'click', '[data-scrim]', function (event, trigger) {
            event.preventDefault();
            close(trigger.getAttribute('data-scrim'));
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') closeAll();
        });
    }

    /* ------------------------------------------------------------------ *
     * Button busy state
     * ------------------------------------------------------------------ */

    var SPINNER =
        '<svg class="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
        '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-opacity=".25" stroke-width="3"/>' +
        '<path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';

    /**
     * Toggle a submit button's loading state without losing its label.
     * @param {HTMLElement} button
     * @param {boolean} busy
     * @param {string} [busyLabel] already-translated
     */
    function setBusy(button, busy, busyLabel) {
        if (!button) return;
        if (busy) {
            button.dataset.label = button.innerHTML;
            button.innerHTML = SPINNER + '<span>' + escapeHtml(busyLabel || t('common.saving')) + '</span>';
            button.disabled = true;
            button.setAttribute('aria-busy', 'true');
        } else {
            if (button.dataset.label) button.innerHTML = button.dataset.label;
            button.disabled = false;
            button.removeAttribute('aria-busy');
        }
    }

    /* ------------------------------------------------------------------ *
     * Brand application
     * ------------------------------------------------------------------ */

    /** Push config.js branding into the document: tokens, logo, title, meta. */
    function applyBrand() {
        var brand = CONFIG.brand;
        var root = document.documentElement;

        root.style.setProperty('--brand', CONFIG.theme.primary);
        root.style.setProperty('--accent', CONFIG.theme.accent);

        // Colour-mix fallbacks for browsers without `color-mix()`.
        if (!global.CSS || !global.CSS.supports || !global.CSS.supports('color', 'color-mix(in srgb, red, blue)')) {
            root.style.setProperty('--brand-soft', hexToRgba(CONFIG.theme.primary, 0.18));
            root.style.setProperty('--accent-soft', hexToRgba(CONFIG.theme.accent, 0.18));
        }

        $$('[data-brand="name"]').forEach(function (node) {
            node.textContent = brand.name;
        });
        $$('[data-brand="tagline"]').forEach(function (node) {
            node.textContent = brand.tagline;
        });
        $$('[data-brand="description"]').forEach(function (node) {
            node.textContent = brand.description;
        });
        $$('[data-brand="logo"]').forEach(function (node) {
            node.setAttribute('src', brand.logo);
            node.setAttribute('alt', brand.name);
        });
        $$('[data-brand="email"]').forEach(function (node) {
            node.textContent = brand.supportEmail;
            if (node.tagName === 'A') node.setAttribute('href', 'mailto:' + brand.supportEmail);
        });
        $$('[data-brand="phone"]').forEach(function (node) {
            node.textContent = brand.supportPhone;
            if (node.tagName === 'A') node.setAttribute('href', 'tel:' + brand.supportPhone.replace(/[^+\d]/g, ''));
        });
        $$('[data-brand="address"]').forEach(function (node) {
            node.textContent = brand.addressLine1 + ', ' + brand.addressLine2;
        });
        Object.keys(brand.social || {}).forEach(function (network) {
            $$('[data-brand-social="' + network + '"]').forEach(function (node) {
                node.setAttribute('href', brand.social[network]);
            });
        });

        // Favicon
        var link = document.querySelector('link[rel="icon"]');
        if (link) link.setAttribute('href', brand.favicon);
    }

    function hexToRgba(hex, alpha) {
        var value = String(hex).replace('#', '');
        if (value.length === 3) value = value.split('').map(function (c) { return c + c; }).join('');
        var int = parseInt(value, 16);
        return 'rgba(' + ((int >> 16) & 255) + ',' + ((int >> 8) & 255) + ',' + (int & 255) + ',' + alpha + ')';
    }

    /* ------------------------------------------------------------------ *
     * Theme
     * ------------------------------------------------------------------ */

    function applyTheme(theme) {
        var value = theme || CONFIG.theme.default;
        document.documentElement.classList.toggle('dark', value === 'dark');
        try {
            global.localStorage.setItem(CONFIG.theme.storageKey, value);
        } catch (err) {
            /* storage unavailable — theme simply won't persist */
        }
        document.querySelectorAll('[data-theme-icon]').forEach(function (node) {
            node.innerHTML = icon(value === 'dark' ? 'sun' : 'moon', 'h-5 w-5');
        });
        document.querySelectorAll('[data-theme-label]').forEach(function (node) {
            node.textContent = t(value === 'dark' ? 'common.light' : 'common.dark');
        });
    }

    function storedTheme() {
        try {
            return global.localStorage.getItem(CONFIG.theme.storageKey);
        } catch (err) {
            return null;
        }
    }

    function toggleTheme() {
        var next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
        Bistro.State.patch({ theme: next });
        applyTheme(next);
        return next;
    }

    /* ------------------------------------------------------------------ *
     * Scroll reveal
     * ------------------------------------------------------------------ */

    /** One observer, reused: menus re-render on every keystroke. */
    var revealObserver = null;

    function reveal(selector, root) {
        var nodes = $$(selector || '.reveal', root);
        if (!global.IntersectionObserver) {
            nodes.forEach(function (node) {
                node.classList.add('is-visible');
            });
            return null;
        }

        if (!revealObserver) {
            revealObserver = new IntersectionObserver(
                function (entries) {
                    entries.forEach(function (entry) {
                        if (!entry.isIntersecting) return;
                        entry.target.classList.add('is-visible');
                        revealObserver.unobserve(entry.target);
                    });
                },
                { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
            );
        }

        nodes.forEach(function (node) {
            if (node.classList.contains('is-visible')) return;
            revealObserver.observe(node);
        });
        return revealObserver;
    }

    /** Smooth-scroll to a section id, honouring the sticky header height. */
    function scrollToId(id) {
        var node = document.getElementById(id);
        if (!node) return;
        var offset = (document.getElementById('site-header') || {}).offsetHeight || 0;
        var top = node.getBoundingClientRect().top + global.scrollY - offset - 12;
        global.scrollTo({ top: top, behavior: 'smooth' });
    }

    Bistro.UI = {
        $: $,
        $$: $$,
        on: on,
        escapeHtml: escapeHtml,
        attr: attr,
        debounce: debounce,
        icon: icon,
        icons: ICONS,
        stars: stars,
        toast: toast,
        overlay: { open: open, close: close, closeAll: closeAll, bind: bindOverlays },
        setBusy: setBusy,
        spinner: SPINNER,
        applyBrand: applyBrand,
        applyTheme: applyTheme,
        storedTheme: storedTheme,
        toggleTheme: toggleTheme,
        reveal: reveal,
        scrollToId: scrollToId,
        t: t,
        money: money
    };
})(window);
