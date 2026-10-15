/**
 * Bistro Starter Kit — i18n runtime.
 * ---------------------------------------------------------------------------
 * Dictionaries live in /i18n/<code>.js and register themselves on
 * `window.BistroI18N`. This module resolves keys, interpolates variables,
 * applies translations to the DOM, and formats money/dates per locale.
 *
 * Markup contract (no build step, no framework):
 *   <h2 data-i18n="menu.title"></h2>              → textContent
 *   <input data-i18n-placeholder="menu.searchPlaceholder">
 *   <button data-i18n-aria-label="cart.open">
 *   <div data-i18n-title="..."></div>              → title attribute
 *   <p data-i18n-html="about.body"></p>            → innerHTML (trusted strings only)
 *
 * Re-apply after rendering dynamic markup: `Bistro.I18N.apply(container)`.
 * ---------------------------------------------------------------------------
 */
(function (global) {
    'use strict';

    var Bistro = (global.Bistro = global.Bistro || {});
    var CONFIG = Bistro.Config;
    var State = Bistro.State;

    var DICTS = global.BistroI18N || {};

    /** Maps a config locale code onto a CLDR tag for Intl formatting. */
    var INTL_TAGS = { en: 'en-US', fr: 'fr-FR', am: 'am-ET', es: 'es-ES' };

    var missing = {};

    /* ------------------------------------------------------------------ *
     * Lookup
     * ------------------------------------------------------------------ */

    function currentLanguage() {
        return State.get('lang') || CONFIG.locale.default;
    }

    function dictionary(lang) {
        return DICTS[lang] || DICTS[CONFIG.locale.fallback] || {};
    }

    /** Dotted-path read. Returns `undefined` when absent. */
    function resolve(lang, key) {
        var node = dictionary(lang);
        var parts = String(key).split('.');
        for (var i = 0; i < parts.length; i += 1) {
            if (node === null || typeof node !== 'object' || !(parts[i] in node)) return undefined;
            node = node[parts[i]];
        }
        return typeof node === 'string' ? node : undefined;
    }

    /**
     * Translate a key.
     * @param {string} key dotted key, e.g. 'cart.total'
     * @param {object} [vars] interpolation values for `{token}` placeholders
     * @param {string} [lang] override the active language
     */
    function t(key, vars, lang) {
        var active = lang || currentLanguage();
        var value = resolve(active, key);

        if (value === undefined && active !== CONFIG.locale.fallback) {
            value = resolve(CONFIG.locale.fallback, key);
        }

        if (value === undefined) {
            if (!missing[key]) {
                missing[key] = true;
                console.warn('[Bistro.I18N] Missing translation: ' + key);
            }
            return key;
        }

        if (!vars) return value;

        return value.replace(/\{(\w+)\}/g, function (match, token) {
            return Object.prototype.hasOwnProperty.call(vars, token) ? String(vars[token]) : match;
        });
    }

    /* ------------------------------------------------------------------ *
     * Formatting
     * ------------------------------------------------------------------ */

    function currencySettings(code) {
        var map = CONFIG.locale.currency || {};
        return map[code] || { symbol: code, decimals: 2 };
    }

    /** `formatMoney(12.5)` → "$12.50" (locale-aware separators). */
    function formatMoney(amount, code) {
        var currencyCode = code || CONFIG.locale.currencyCode || 'USD';
        var value = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
        var tag = INTL_TAGS[currentLanguage()] || INTL_TAGS.en;

        try {
            return new Intl.NumberFormat(tag, {
                style: 'currency',
                currency: currencyCode,
                minimumFractionDigits: currencySettings(currencyCode).decimals,
                maximumFractionDigits: currencySettings(currencyCode).decimals
            }).format(value);
        } catch (err) {
            // Unknown currency code for this runtime — degrade to symbol + number.
            var fallback = currencySettings(currencyCode);
            return fallback.symbol + value.toFixed(fallback.decimals);
        }
    }

    /** Dates stored as ISO strings come back in the guest's locale. */
    function formatDate(value, options) {
        var date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        var tag = INTL_TAGS[currentLanguage()] || INTL_TAGS.en;
        return new Intl.DateTimeFormat(
            tag,
            options || { day: 'numeric', month: 'short', year: 'numeric' }
        ).format(date);
    }

    function formatTime(value, options) {
        var date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) return String(value || '');
        var tag = INTL_TAGS[currentLanguage()] || INTL_TAGS.en;
        return new Intl.DateTimeFormat(
            tag,
            options || { hour: '2-digit', minute: '2-digit' }
        ).format(date);
    }

    /* ------------------------------------------------------------------ *
     * DOM application
     * ------------------------------------------------------------------ */

    function applyAttribute(root, selector, attribute, translate) {
        root.querySelectorAll(selector).forEach(function (node) {
            var key = node.getAttribute(attribute);
            if (!key) return;
            var value = translate(key);
            if (value === undefined) return;
            if (attribute === 'data-i18n-html') node.innerHTML = value;
            else if (attribute === 'data-i18n') node.textContent = value;
            else node.setAttribute(attribute.replace('data-i18n-', ''), value);
        });
    }

    /**
     * Translate everything inside `root` (defaults to <document>).
     * Safe to call repeatedly — it only writes when a key is present.
     */
    function apply(root) {
        var scope = root || document;
        var translate = function (key) {
            return resolve(currentLanguage(), key) !== undefined ? t(key) : undefined;
        };

        applyAttribute(scope, '[data-i18n]', 'data-i18n', translate);
        applyAttribute(scope, '[data-i18n-html]', 'data-i18n-html', translate);
        applyAttribute(scope, '[data-i18n-placeholder]', 'data-i18n-placeholder', translate);
        applyAttribute(scope, '[data-i18n-title]', 'data-i18n-title', translate);
        applyAttribute(scope, '[data-i18n-aria-label]', 'data-i18n-aria-label', translate);

        // <title> and <meta name="description">
        var titleKey = document.documentElement.getAttribute('data-title-key');
        if (titleKey) document.title = t(titleKey);
        var descNode = document.querySelector('meta[name="description"]');
        var descKey = document.documentElement.getAttribute('data-description-key');
        if (descNode && descKey) descNode.setAttribute('content', t(descKey));
    }

    /* ------------------------------------------------------------------ *
     * Switching
     * ------------------------------------------------------------------ */

    var listeners = [];

    /**
     * Change language and re-render the static DOM.
     * @param {string} code
     * @param {{silent?:boolean}} [options]
     */
    function setLanguage(code, options) {
        var opts = options || {};
        var descriptor = CONFIG.localeFor(code);
        var previous = currentLanguage();

        State.patch({ lang: descriptor.code });
        document.documentElement.setAttribute('lang', descriptor.code);
        document.documentElement.setAttribute('dir', descriptor.dir || 'ltr');

        apply();

        if (previous !== descriptor.code || opts.force) {
            listeners.forEach(function (fn) {
                try {
                    fn(descriptor.code, previous);
                } catch (err) {
                    console.error('[Bistro.I18N] Language listener threw.', err);
                }
            });
            document.dispatchEvent(
                new CustomEvent('bistro:language', { detail: { lang: descriptor.code, previous: previous } })
            );
        }
        return descriptor.code;
    }

    function onLanguageChange(fn) {
        if (typeof fn !== 'function') return function () { };
        listeners.push(fn);
        return function () {
            listeners = listeners.filter(function (item) {
                return item !== fn;
            });
        };
    }

    /** Locale descriptors for the switcher UI. */
    function languages() {
        return CONFIG.locale.available.slice();
    }

    Bistro.I18N = {
        t: t,
        apply: apply,
        setLanguage: setLanguage,
        onLanguageChange: onLanguageChange,
        languages: languages,
        currentLanguage: currentLanguage,
        dictionary: dictionary,
        formatMoney: formatMoney,
        formatDate: formatDate,
        formatTime: formatTime,
        intlTag: function () {
            return INTL_TAGS[currentLanguage()] || INTL_TAGS.en;
        }
    };
})(window);
