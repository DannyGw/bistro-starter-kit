/**
 * Bistro Starter Kit — multi-gateway payment hooks.
 * ---------------------------------------------------------------------------
 * Stripe, PayPal and Chapa all need a server: creating a session requires a
 * secret key, and confirming payment requires webhook verification. This module
 * therefore does two things:
 *
 *   1. Describes which gateways the client can offer (`available()`).
 *   2. Calls YOUR endpoint (`Bistro.Config.payments.endpoints.createCheckout`)
 *      with the order, then hands the guest the redirect URL it returns.
 *
 * When `createCheckout` is empty — the default for a fresh clone — the module
 * runs a *simulated* checkout so the whole funnel is demoable offline. The
 * simulated result is marked `simulated: true` so nothing downstream can
 * mistake it for a real payment.
 *
 * Server-side sketch (Node/Deno edge function):
 *
 *   // Stripe
 *   const session = await stripe.checkout.sessions.create({
 *     mode: 'payment',
 *     line_items: order.items.map(i => ({
 *       price_data: { currency, product_data: { name: i.name },
 *         unit_amount: Math.round(i.price * 100) },
 *       quantity: i.qty
 *     })),
 *     success_url: `${origin}/index.html?paid=1&ref=${order.reference}`,
 *     cancel_url: `${origin}/index.html?paid=0`
 *   });
 *   return json({ url: session.url });
 *
 *   // PayPal — orders/v2 create then redirect to the approve link.
 *   // Chapa  — POST /v1/transaction/initialize → { checkout_url }.
 * ---------------------------------------------------------------------------
 */
(function (global) {
    'use strict';

    var Bistro = (global.Bistro = global.Bistro || {});
    var CONFIG = Bistro.Config;

    var DESCRIPTORS = {
        stripe: {
            id: 'stripe',
            label: 'Stripe',
            blurb: 'Card, Apple Pay, Google Pay',
            icon: 'card',
            currencies: ['USD', 'EUR', 'GBP', 'ETB']
        },
        paypal: {
            id: 'paypal',
            label: 'PayPal',
            blurb: 'PayPal balance or linked card',
            icon: 'wallet',
            currencies: ['USD', 'EUR', 'GBP']
        },
        chapa: {
            id: 'chapa',
            label: 'Chapa',
            blurb: 'Telebirr, CBE Birr, local cards',
            icon: 'mobile',
            currencies: ['ETB', 'USD']
        }
    };

    /** Gateway is offered only if enabled, and its public key is present or we
     *  are in simulated mode (no endpoints configured at all). */
    function available() {
        if (!CONFIG.get('features.payments', true)) return [];
        var currencyCode = CONFIG.locale.currencyCode;
        var simulated = !CONFIG.get('payments.endpoints.createCheckout', '');

        return Object.keys(DESCRIPTORS)
            .map(function (key) {
                var settings = CONFIG.get('payments.' + key, {}) || {};
                var descriptor = DESCRIPTORS[key];
                return Object.assign({}, descriptor, {
                    enabled: Boolean(settings.enabled),
                    mode: settings.mode,
                    simulated: simulated,
                    /** Key names differ per gateway; normalise for the UI. */
                    clientKey: settings.publishableKey || settings.clientId || settings.publicKey || '',
                    currencySupported: descriptor.currencies.indexOf(currencyCode) !== -1
                });
            })
            .filter(function (gateway) {
                if (!gateway.enabled) return false;
                if (gateway.currencySupported) return true;
                // Wrong currency for this gateway: only keep it if nothing else works.
                return !Object.keys(DESCRIPTORS).some(function (key) {
                    var other = CONFIG.get('payments.' + key, {}) || {};
                    return (
                        other.enabled && DESCRIPTORS[key].currencies.indexOf(currencyCode) !== -1
                    );
                });
            });
    }

    function defaultGateway() {
        var list = available();
        if (!list.length) return null;
        var preferred = CONFIG.get('payments.default', '');
        var match = list.filter(function (gateway) {
            return gateway.id === preferred;
        })[0];
        return (match || list[0]).id;
    }

    /**
     * Begin checkout for an order.
     * @param {{order:object, gateway:string}} params
     * @returns {Promise<{status:'paid'|'requires_action', reference:string,
     *                    url:string|null, simulated:boolean, gateway:string}>}
     */
    function checkout(params) {
        var order = params.order;
        var gatewayId = params.gateway || defaultGateway();
        var endpoint = CONFIG.get('payments.endpoints.createCheckout', '');
        var reference = order.reference || Bistro.API.makeReference('BIS');

        if (!gatewayId) {
            return Promise.reject(Bistro.API.ApiError('No payment gateway is enabled.', 'payment/no-gateway'));
        }

        /* ---- real integration path ---- */
        if (endpoint) {
            return global
                .fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ gateway: gatewayId, order: order, reference: reference })
                })
                .then(function (response) {
                    if (!response.ok) {
                        throw Bistro.API.ApiError(
                            'Payment provider returned ' + response.status,
                            'payment/http-' + response.status
                        );
                    }
                    return response.json();
                })
                .then(function (data) {
                    if (data && data.url) {
                        // Hand off to the gateway's hosted page.
                        return {
                            status: 'requires_action',
                            reference: data.reference || reference,
                            url: data.url,
                            simulated: false,
                            gateway: gatewayId
                        };
                    }
                    return {
                        status: data && data.paid ? 'paid' : 'pending',
                        reference: (data && data.reference) || reference,
                        url: null,
                        simulated: false,
                        gateway: gatewayId
                    };
                });
        }

        /* ---- simulated path (no backend configured) ---- */
        return Bistro.API.wait(900).then(function () {
            return {
                status: 'paid',
                reference: reference,
                url: null,
                simulated: true,
                gateway: gatewayId
            };
        });
    }

    /** Lazily inject a gateway SDK only when a live key exists. */
    function loadSdk(gatewayId) {
        var scripts = {
            stripe: 'https://js.stripe.com/v3/',
            paypal:
                'https://www.paypal.com/sdk/js?currency=' +
                (CONFIG.locale.currencyCode || 'USD') +
                '&client-id=' +
                encodeURIComponent(CONFIG.get('payments.paypal.clientId', '')),
            chapa: 'https://js.chapa.co/v1/chapa.js'
        };
        var src = scripts[gatewayId];
        if (!src) return Promise.reject(Bistro.API.ApiError('Unknown gateway: ' + gatewayId, 'payment/unknown'));
        if (!CONFIG.get('payments.' + gatewayId + '.enabled', false)) {
            return Promise.reject(Bistro.API.ApiError('Gateway disabled: ' + gatewayId, 'payment/disabled'));
        }

        return new Promise(function (resolve, reject) {
            var existing = document.querySelector('script[data-bistro-sdk="' + gatewayId + '"]');
            if (existing) return resolve(true);
            var script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.dataset.bistroSdk = gatewayId;
            script.onload = function () {
                resolve(true);
            };
            script.onerror = function () {
                reject(Bistro.API.ApiError('Could not load ' + gatewayId + ' SDK.', 'payment/sdk-load'));
            };
            document.head.appendChild(script);
        });
    }

    Bistro.Payments = {
        descriptors: DESCRIPTORS,
        available: available,
        defaultGateway: defaultGateway,
        checkout: checkout,
        loadSdk: loadSdk,
        isSimulated: function () {
            return !CONFIG.get('payments.endpoints.createCheckout', '');
        }
    };
})(window);
