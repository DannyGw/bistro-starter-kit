/**
 * Bistro Starter Kit — core state management.
 * ---------------------------------------------------------------------------
 * A tiny observable store: no framework, no build step.
 *
 *   Bistro.State.subscribe(function (state, meta) { ... });
 *   Bistro.State.patch({ lang: 'am' });
 *   Bistro.State.get().cart;
 *
 * Design notes
 *  - State is persisted to localStorage under a versioned key, so a schema
 *    change is a key bump rather than a migration.
 *  - `index.html` and `admin.html` stay in sync through BroadcastChannel
 *    (falling back to the `storage` event), which is what makes the "live"
 *    admin dashboard feel real without a backend.
 *  - Subscribers receive a `meta` object describing where the change came
 *    from, which lets the admin page ignore its own echo.
 * ---------------------------------------------------------------------------
 */
(function (global) {
    'use strict';

    var Bistro = (global.Bistro = global.Bistro || {});
    var CONFIG = Bistro.Config;

    /** Bump the suffix when the persisted shape changes. */
    var STORAGE_KEY = 'bistro.starter.state.v1';
    var CHANNEL_NAME = 'bistro.starter.sync.v1';

    var DEFAULTS = {
        /* --- session / UI ------------------------------------------------- */
        lang: null, // null => follow config.locale.default
        theme: null, // null => follow config.theme.default
        navOpen: false,
        cartOpen: false,

        /* --- ordering ----------------------------------------------------- */
        cart: [],
        orderType: 'dine-in', // 'dine-in' | 'takeaway' | 'delivery'
        tableNumber: '',
        deliveryAddress: '',
        orderNotes: '',

        /* --- data mirrored from the backend ------------------------------- */
        menu: null, // null => not loaded yet
        orders: [],
        reservations: [],
        reviews: [],
        settings: {},

        /* --- the guest's most recent action, for the confirmation screens -- */
        lastOrder: null,
        lastReservation: null,

        /* --- runtime (never persisted) ----------------------------------- */
        ready: false,
        loading: false,
        error: null
    };

    /** Transient keys excluded from localStorage. */
    var TRANSIENT = { ready: true, loading: true, error: true, navOpen: true, cartOpen: true };

    var state = clone(DEFAULTS);
    var subscribers = [];
    var channel = null;
    var writing = false;

    /* ------------------------------------------------------------------ *
     * Persistence
     * ------------------------------------------------------------------ */

    function clone(value) {
        return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
    }

    function storage() {
        try {
            var probe = '__bistro_probe__';
            global.localStorage.setItem(probe, '1');
            global.localStorage.removeItem(probe);
            return global.localStorage;
        } catch (err) {
            // Safari private mode, disabled cookies, sandboxed iframe…
            return null;
        }
    }

    function load() {
        var store = storage();
        if (!store) return clone(DEFAULTS);

        try {
            var raw = store.getItem(STORAGE_KEY);
            if (!raw) return clone(DEFAULTS);
            var parsed = JSON.parse(raw);
            return Object.assign(clone(DEFAULTS), parsed);
        } catch (err) {
            console.warn('[Bistro.State] Discarding unreadable persisted state.', err);
            return clone(DEFAULTS);
        }
    }

    function persist() {
        var store = storage();
        if (!store) return;

        var payload = {};
        Object.keys(state).forEach(function (key) {
            if (!TRANSIENT[key]) payload[key] = state[key];
        });

        try {
            writing = true;
            store.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch (err) {
            console.warn('[Bistro.State] Could not persist state (quota?).', err);
        } finally {
            writing = false;
        }
    }

    /* ------------------------------------------------------------------ *
     * Cross-tab / cross-page sync
     * ------------------------------------------------------------------ */

    function initChannel() {
        if (!CONFIG.get('backend.localRealtime', true)) return;

        if ('BroadcastChannel' in global) {
            try {
                channel = new global.BroadcastChannel(CHANNEL_NAME);
                channel.addEventListener('message', function (event) {
                    if (!event.data || event.data.origin === origin()) return;
                    adopt(event.data.state, 'channel');
                });
                return;
            } catch (err) {
                channel = null;
            }
        }
    }

    function broadcast() {
        if (!channel) return;
        var payload = {};
        Object.keys(state).forEach(function (key) {
            if (!TRANSIENT[key]) payload[key] = state[key];
        });
        try {
            channel.postMessage({ origin: origin(), state: payload });
        } catch (err) {
            /* Non-fatal: the storage event still covers other tabs. */
        }
    }

    /** Unique per page load, so a tab can recognise (and ignore) its own echo. */
    var originId = Math.random().toString(36).slice(2);
    function origin() {
        return originId;
    }

    function adopt(next, source) {
        state = Object.assign(clone(DEFAULTS), next, {
            ready: state.ready,
            loading: state.loading,
            error: state.error
        });
        notify(source);
    }

    /* ------------------------------------------------------------------ *
     * Notification
     * ------------------------------------------------------------------ */

    function notify(source, changed) {
        var snapshot = get();
        subscribers.slice().forEach(function (fn) {
            try {
                fn(snapshot, { source: source || 'local', changed: changed || [] });
            } catch (err) {
                console.error('[Bistro.State] Subscriber threw.', err);
            }
        });
    }

    /* ------------------------------------------------------------------ *
     * Public API
     * ------------------------------------------------------------------ */

    function get(path, fallback) {
        if (!path) return clone(state);
        var node = state;
        var parts = String(path).split('.');
        for (var i = 0; i < parts.length; i += 1) {
            if (node === null || typeof node !== 'object' || !(parts[i] in node)) {
                return fallback;
            }
            node = node[parts[i]];
        }
        return node === undefined ? fallback : node;
    }

    /**
     * Shallow-merge a patch into the store.
     * @param {object} patch
     * @param {{persist?:boolean, silent?:boolean}} [options]
     */
    function patch(patchObj, options) {
        var opts = options || {};
        if (!patchObj) return get();

        var changed = [];
        Object.keys(patchObj).forEach(function (key) {
            if (!shallowEqual(state[key], patchObj[key])) changed.push(key);
            state[key] = patchObj[key];
        });

        if (!changed.length) return get();
        if (opts.persist !== false) persist();
        if (opts.silent !== true) {
            broadcast();
            notify('local', changed);
        }
        return get();
    }

    /** Subscribe to every store change. Returns an unsubscribe function. */
    function subscribe(fn) {
        if (typeof fn !== 'function') return function () { };
        subscribers.push(fn);
        return function unsubscribe() {
            subscribers = subscribers.filter(function (item) {
                return item !== fn;
            });
        };
    }

    /** Wipe everything back to factory defaults (admin "reset demo data"). */
    function reset(options) {
        var opts = options || {};
        state = clone(DEFAULTS);
        var store = storage();
        if (store) store.removeItem(STORAGE_KEY);
        if (opts.silent !== true) {
            broadcast();
            notify('local', ['*']);
        }
        return get();
    }

    function shallowEqual(a, b) {
        if (a === b) return true;
        if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;
        if (Array.isArray(a) !== Array.isArray(b)) return false;
        if (Array.isArray(a)) return a.length === b.length;
        return false;
    }

    /* ------------------------------------------------------------------ *
     * Boot
     * ------------------------------------------------------------------ */

    state = load();
    initChannel();

    // Another tab wrote to localStorage (BroadcastChannel unsupported/blocked).
    global.addEventListener('storage', function (event) {
        if (event.key !== STORAGE_KEY || writing) return;
        adopt(load(), 'storage');
    });

    var State = {
        KEY: STORAGE_KEY,
        DEFAULTS: DEFAULTS,
        get: get,
        patch: patch,
        subscribe: subscribe,
        reset: reset,
        /** Exposed for tests and for the admin page's own bookkeeping. */
        origin: origin
    };

    Bistro.State = State;
})(window);
