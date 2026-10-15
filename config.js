/**
 * Bistro Starter Kit — central client configuration.
 * ---------------------------------------------------------------------------
 * This is the single file you edit to re-brand and re-configure the kit for a
 * new client. Everything else in the codebase reads from `Bistro.Config`.
 *
 *   <script src="config.js"></script>
 *   Bistro.Config.brand.name        // => 'Bistro'
 *   Bistro.Config.get('order.taxRate', 0)
 *
 * SECURITY NOTE
 * Anything in this file ships to the browser and is public. Only publishable /
 * public keys belong here (Stripe *publishable* key, PayPal client id, Chapa
 * public key, Supabase *anon* key). Secret keys must live on a server.
 * ---------------------------------------------------------------------------
 */
(function (global) {
    'use strict';

    var CONFIG = {
        /* =====================================================================
         * 1. BRANDING — instant white-label
         * ===================================================================*/
        brand: {
            name: 'Bistro',
            legalName: 'Bistro Restaurant Group Ltd.',
            tagline: 'Modern dining, served beautifully.',
            /** Swap these two files to re-skin the kit. */
            logo: 'assets/images/logo.svg',
            favicon: 'assets/images/favicon.svg',
            heroImage: 'assets/images/hero.svg',
            description:
                'Seasonal plates, natural wine and a room built for long dinners.',
            supportEmail: 'hello@bistro.example',
            supportPhone: '+1 (555) 010-2030',
            addressLine1: '12 Market Street, Suite 400',
            addressLine2: 'Addis Ababa, Ethiopia',
            social: {
                instagram: 'https://instagram.com/',
                facebook: 'https://facebook.com/',
                x: 'https://x.com/'
            }
        },

        /* =====================================================================
         * 2. THEME
         * ===================================================================*/
        theme: {
            default: 'dark', // 'light' | 'dark'
            primary: '#f59e0b', // amber — drives Tailwind `brand` palette
            accent: '#14b8a6', // teal  — drives Tailwind `accent` palette
            allowUserToggle: true,
            storageKey: 'bistro.theme'
        },

        /* =====================================================================
         * 3. LOCALE / i18n
         * ===================================================================*/
        locale: {
            default: 'en',
            fallback: 'en',
            /**
             * Every code listed here must have a matching dictionary in /i18n.
             * `dir` is applied to <html dir="..."> on switch.
             */
            available: [
                { code: 'en', label: 'English', native: 'English', dir: 'ltr' },
                { code: 'am', label: 'Amharic', native: 'አማርኛ', dir: 'ltr' }
            ],
            allowUserSwitch: true,
            currency: { USD: { symbol: '$', decimals: 2 }, ETB: { symbol: 'Br', decimals: 2 } },
            currencyCode: 'USD'
        },

        /* =====================================================================
         * 4. FEATURE FLAGS — turn whole modules on/off per client
         * ===================================================================*/
        features: {
            menu: true,
            menuSearch: true,
            dietaryFilters: true,
            cart: true,
            orderTypes: true,
            reservations: true,
            reviews: true,
            gallery: true,
            about: true,
            qrTableOrdering: true,
            payments: true,
            admin: true,
            i18n: true,
            darkMode: true
        },

        /* =====================================================================
         * 5. ORDERING / TAX / FEES
         * ===================================================================*/
        order: {
            types: ['dine-in', 'takeaway', 'delivery'],
            /** Fractional rates. 0.15 === 15%. Change per client jurisdiction. */
            taxRate: 0.15,
            /** Applied to dine-in only, in most jurisdictions. */
            serviceChargeRate: 0.05,
            deliveryFee: 4.5,
            freeDeliveryThreshold: 60,
            minOrderForDelivery: 15,
            maxItemQty: 20,
            /** Pre-fills the table field on the QR deep-link flow. */
            defaultTable: ''
        },

        /* =====================================================================
         * 6. RESERVATIONS
         * ===================================================================*/
        reservations: {
            openTime: '11:00',
            closeTime: '22:30',
            slotMinutes: 30,
            minPartySize: 1,
            maxPartySize: 12,
            /** How many days into the future a guest may book. */
            advanceDays: 60,
            /** false => booking lands as `pending` and needs admin approval. */
            autoApprove: false,
            /** Party sizes at or above this are flagged for staff follow-up. */
            largePartyThreshold: 8
        },

        /* =====================================================================
         * 7. PAYMENTS
         * ===================================================================*/
        payments: {
            default: 'stripe',
            stripe: { enabled: true, publishableKey: '', mode: 'test' },
            paypal: { enabled: true, clientId: '', mode: 'sandbox' },
            chapa: { enabled: true, publicKey: '', mode: 'test' },
            /**
             * All three gateways require a server to create the payment session and
             * to verify the webhook. Point these at your own function/endpoint.
             * When `createCheckout` is empty the kit runs a simulated checkout so the
             * UI can be demoed with no backend.
             */
            endpoints: {
                createCheckout: '', // POST { gateway, order } -> { url }
                verifyPayment: '' //  POST { reference }       -> { paid: true }
            }
        },

        /* =====================================================================
         * 8. BACKEND / CMS PERSISTENCE
         * ===================================================================*/
        backend: {
            /** 'local' (browser storage, zero setup) | 'supabase' */
            provider: 'local',
            supabase: {
                url: '', // e.g. 'https://xxxxxxxx.supabase.co'
                anonKey: '', // public anon key — safe to ship, protected by RLS
                schema: 'public'
            },
            /**
             * Table names. Apply /supabase/schema.sql to create these matching
             * tables, columns and row-level-security policies.
             */
            tables: {
                menu: 'menu_items',
                orders: 'orders',
                reservations: 'reservations'
            },
            /**
             * The Supabase REST adapter listens by polling. Install supabase-js and
             * call `Bistro.API.attachRealtime()` for push-based updates.
             */
            pollIntervalMs: 8000,
            /** BroadcastChannel keeps index.html and admin.html in sync locally. */
            localRealtime: true
        },

        /* =====================================================================
         * 9. QR TABLE ORDERING
         * ===================================================================*/
        qr: {
            enabled: true,
            tableCount: 12,
            /** '' => derive from window.location. Set to force a canonical host. */
            baseUrl: '',
            param: 'table',
            size: 320
        },

        /* =====================================================================
         * 10. ADMIN DASHBOARD
         * ===================================================================*/
        admin: {
            enabled: true,
            /** DEMO ONLY. This is client-side and visible to anyone. Replace with
             *  Supabase Auth / a server session before going to production. */
            gateEnabled: true,
            demoPasscode: 'bistro-admin',
            sessionKey: 'bistro.admin.session',
            autoRefreshMs: 5000
        },

        /* =====================================================================
         * 11. DEMO DATA
         * ===================================================================*/
        demo: {
            /** Seeded into an empty local store on first load. */
            seedMenu: true,
            seedReviews: true,
            resetOnLoad: false
        },

        /* =====================================================================
         * 12. HELPERS (do not remove)
         * ===================================================================*/
        /**
         * Safe dotted-path lookup: `Config.get('order.taxRate', 0)`.
         */
        get: function (path, fallback) {
            var node = CONFIG;
            var parts = String(path).split('.');
            for (var i = 0; i < parts.length; i += 1) {
                if (node === null || typeof node !== 'object' || !(parts[i] in node)) {
                    return fallback;
                }
                node = node[parts[i]];
            }
            return node === undefined ? fallback : node;
        },

        /** True when the Supabase adapter has enough info to run. */
        isBackendConfigured: function () {
            var sb = CONFIG.backend.supabase;
            return Boolean(
                CONFIG.backend.provider === 'supabase' && sb.url && sb.anonKey
            );
        },

        /** Locale descriptor for a code, falling back to the default locale. */
        localeFor: function (code) {
            var list = CONFIG.locale.available;
            for (var i = 0; i < list.length; i += 1) {
                if (list[i].code === code) return list[i];
            }
            for (var j = 0; j < list.length; j += 1) {
                if (list[j].code === CONFIG.locale.default) return list[j];
            }
            return { code: code || 'en', label: code, native: code, dir: 'ltr' };
        }
    };

    global.Bistro = global.Bistro || {};
    global.Bistro.Config = CONFIG;
})(window);
