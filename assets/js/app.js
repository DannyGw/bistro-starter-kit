/**
 * Bistro Starter Kit — storefront controller.
 * ---------------------------------------------------------------------------
 * Wires index.html to the modules: renders the menu, drives the cart drawer and
 * checkout funnel, handles reservations, the gallery, reviews and the QR table
 * ordering panel.
 *
 * Conventions
 *  - All user-facing strings go through `t()`; nothing is hard-coded in markup.
 *  - Rendering is idempotent: `render()` can be called as often as we like, and
 *    a single State subscription decides what needs re-drawing.
 * ---------------------------------------------------------------------------
 */
(function (global) {
    'use strict';

    var Bistro = global.Bistro;
    var CONFIG = Bistro.Config;
    var State = Bistro.State;
    var API = Bistro.API;
    var Cart = Bistro.Cart;
    var UI = Bistro.UI;
    var I18N = Bistro.I18N;

    function t(key, vars) {
        return I18N.t(key, vars);
    }

    function money(value) {
        return I18N.formatMoney(value);
    }

    /* ==================================================================== *
     * Element cache
     * ==================================================================== */

    var dom = {};

    var IDS = [
        'site-header', 'lang-select', 'lang-select-mobile', 'theme-toggle', 'cart-count',
        'nav-toggle', 'mobile-nav', 'main', 'hero-flash',
        'menu-tabs', 'menu-search', 'menu-filters', 'menu-sort', 'menu-results', 'menu-grid',
        'menu-empty', 'menu-clear-filters',
        'gallery-grid', 'reviews-grid', 'year',
        'reservation-form', 'res-name', 'res-phone', 'res-email', 'res-date', 'res-time',
        'res-guests', 'res-notes', 'res-error', 'res-submit', 'res-success', 'res-reference', 'res-again',
        'qr-table', 'qr-generate', 'qr-download', 'qr-note', 'qr-link', 'qr-image', 'qr-placeholder',
        'cart-drawer', 'cart-clear', 'cart-items', 'cart-empty', 'cart-footer', 'order-type-group',
        'table-field-row', 'order-table', 'address-field-row', 'order-address',
        'delivery-progress', 'delivery-progress-text', 'order-notes',
        'cart-subtotal', 'cart-service-row', 'cart-service', 'cart-delivery-row', 'cart-delivery',
        'cart-tax', 'cart-total', 'cart-checkout',
        'checkout-modal', 'checkout-body', 'checkout-form', 'co-name', 'co-phone', 'co-email',
        'payment-options', 'checkout-simulated-note', 'checkout-error', 'checkout-submit',
        'checkout-success', 'checkout-reference', 'checkout-gateway'
    ];

    function cacheElements() {
        IDS.forEach(function (id) {
            dom[id] = document.getElementById(id);
        });
    }

    /* ==================================================================== *
     * Small DOM helpers
     * ==================================================================== */

    function show(node, displayClass) {
        if (!node) return;
        node.classList.remove('hidden');
        if (displayClass) node.classList.add(displayClass);
    }

    function hide(node, displayClass) {
        if (!node) return;
        node.classList.add('hidden');
        if (displayClass) node.classList.remove(displayClass);
    }

    function toggle(node, visible, displayClass) {
        if (visible) show(node, displayClass);
        else hide(node, displayClass);
    }

    /** Don't fight the guest: only write into an input they aren't typing in. */
    function setValue(input, value) {
        if (!input || document.activeElement === input) return;
        if (input.value !== value) input.value = value;
    }

    /* Inline icons declared in markup as empty slots. */
    var ICON_SLOTS = {
        'cart-icon': 'cart',
        'nav-icon': 'menu',
        'close-icon': 'close',
        'search-icon': 'search',
        'arrow-icon': 'arrowRight',
        'calendar-icon': 'calendar',
        'check-icon': 'check',
        'info-icon': 'info',
        'clock-icon': 'clock',
        'phone-icon': 'phone',
        'mail-icon': 'mail',
        'pin-icon': 'pin',
        'qr-icon': 'qr',
        'download-icon': 'download',
        'lang-icon': 'globe'
    };

    function injectIcons(root) {
        Object.keys(ICON_SLOTS).forEach(function (slot) {
            UI.$$('[data-' + slot + ']', root || document).forEach(function (node) {
                if (node.firstElementChild) return; // don't thrash on re-render
                node.innerHTML = UI.icon(ICON_SLOTS[slot], 'h-5 w-5');
            });
        });
    }

    /* ==================================================================== *
     * Menu
     * ==================================================================== */

    var menuCache = [];
    var view = { category: 'all', query: '', tags: [], sort: 'popular' };

    function categories() {
        return Bistro.Seed.categories;
    }

    function renderTabs() {
        if (!dom['menu-tabs']) return;
        var tabs = [{ key: 'all', label: t('menu.all') }].concat(
            categories().map(function (category) {
                return { key: category.key, label: t('cat.' + category.key) };
            })
        );

        dom['menu-tabs'].innerHTML = tabs
            .map(function (tab) {
                var active = view.category === tab.key;
                return (
                    '<button type="button" role="tab" aria-selected="' + active + '" data-category="' +
                    tab.key + '" class="shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition ' +
                    (active
                        ? 'btn-brand shadow-lg shadow-brand/25'
                        : 'glass hover:-translate-y-0.5') +
                    '">' + UI.escapeHtml(tab.label) + '</button>'
                );
            })
            .join('');
    }

    function renderFilters() {
        if (!dom['menu-filters']) return;
        dom['menu-filters'].innerHTML = Bistro.Seed.tags
            .map(function (tag) {
                var active = view.tags.indexOf(tag.key) !== -1;
                return (
                    '<button type="button" data-tag="' + tag.key + '" aria-pressed="' + active +
                    '" class="shrink-0 rounded-xl px-3 py-2 text-xs font-semibold transition ' +
                    (active ? 'btn-brand shadow-lg shadow-brand/25' : 'glass hover:-translate-y-0.5') +
                    '"><span aria-hidden="true">' + tag.icon + '</span> ' +
                    UI.escapeHtml(t('tag.' + tag.key)) + '</button>'
                );
            })
            .join('');
    }

    function visibleMenu() {
        var rows = menuCache.slice();

        if (view.category !== 'all') {
            rows = rows.filter(function (item) {
                return item.category === view.category;
            });
        }

        if (view.tags.length) {
            rows = rows.filter(function (item) {
                var tags = item.tags || [];
                return view.tags.every(function (tag) {
                    return tags.indexOf(tag) !== -1;
                });
            });
        }

        if (view.query) {
            var needle = view.query.toLowerCase();
            rows = rows.filter(function (item) {
                return (
                    (item.name + ' ' + (item.description || '') + ' ' + (item.tags || []).join(' '))
                        .toLowerCase()
                        .indexOf(needle) !== -1
                );
            });
        }

        var collator = { sensitivity: 'base' };
        return rows.sort(function (a, b) {
            switch (view.sort) {
                case 'price-asc':
                    return a.price - b.price;
                case 'price-desc':
                    return b.price - a.price;
                case 'name':
                    return String(a.name).localeCompare(String(b.name), undefined, collator);
                default:
                    // "Most popular": chef's picks first, then rating weighted by volume.
                    if (Boolean(b.featured) !== Boolean(a.featured)) return b.featured ? 1 : -1;
                    var scoreA = (a.rating || 0) * Math.log10((a.reviewCount || 0) + 10);
                    var scoreB = (b.rating || 0) * Math.log10((b.reviewCount || 0) + 10);
                    return scoreB - scoreA;
            }
        });
    }

    function tagBadges(item) {
        return (item.tags || [])
            .map(function (key) {
                var meta = Bistro.Seed.tags.filter(function (tag) {
                    return tag.key === key;
                })[0];
                if (!meta) return '';
                return (
                    '<span class="glass-strong inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold" ' +
                    'title="' + UI.attr(t('tag.' + key)) + '">' +
                    '<span aria-hidden="true">' + meta.icon + '</span>' +
                    '<span class="hidden sm:inline">' + UI.escapeHtml(t('tag.' + key)) + '</span>' +
                    '<span class="sr-only sm:hidden">' + UI.escapeHtml(t('tag.' + key)) + '</span>' +
                    '</span>'
                );
            })
            .join('');
    }

    function menuCard(item) {
        var soldOut = item.available === false;
        var ratingLine =
            '<span class="text-brand flex items-center gap-0.5">' + UI.stars(item.rating, 'h-3.5 w-3.5') + '</span>' +
            '<span>' + UI.escapeHtml(t('menu.ratingSummary', { rating: item.rating || '—', count: item.reviewCount || 0 })) + '</span>';

        return (
            '<article class="glass card-hover reveal group relative flex flex-col overflow-hidden rounded-3xl' +
            (soldOut ? ' opacity-60' : '') + '">' +
            '<div class="relative aspect-[4/3] overflow-hidden">' +
            '<img src="' + UI.attr(item.image) + '" alt="" loading="lazy" decoding="async" ' +
            'class="h-full w-full object-cover transition duration-700 group-hover:scale-105' +
            (soldOut ? ' grayscale' : '') + '">' +
            '<div class="absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-1.5 p-3">' +
            '<div class="flex flex-wrap gap-1.5">' + tagBadges(item) + '</div>' +
            (item.featured
                ? '<span class="btn-brand inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">' +
                UI.icon('sparkle', 'h-3 w-3') + UI.escapeHtml(t('menu.featured')) + '</span>'
                : '') +
            '</div>' +
            (soldOut
                ? '<div class="absolute inset-0 grid place-items-center bg-black/45">' +
                '<span class="glass-strong rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wide">' +
                UI.escapeHtml(t('menu.soldOut')) + '</span></div>'
                : '') +
            '</div>' +

            '<div class="flex flex-1 flex-col p-5">' +
            '<div class="flex items-start justify-between gap-3">' +
            '<h3 class="text-lg font-semibold leading-snug">' + UI.escapeHtml(item.name) + '</h3>' +
            '<span class="display shrink-0 text-lg font-bold">' + UI.escapeHtml(money(item.price)) + '</span>' +
            '</div>' +

            '<p class="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] opacity-70">' +
            ratingLine +
            '</p>' +

            '<p class="mt-3 line-clamp-2 text-sm leading-relaxed opacity-70">' +
            UI.escapeHtml(item.description || '') + '</p>' +

            '<div class="mt-auto flex items-center justify-between gap-3 pt-5">' +
            '<span class="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider opacity-55">' +
            UI.icon('clock', 'h-3.5 w-3.5') +
            UI.escapeHtml(t('menu.prep', { minutes: item.prepMinutes || 0 })) +
            '</span>' +
            '<button type="button" data-add="' + UI.attr(item.id) + '"' + (soldOut ? ' disabled' : '') +
            ' class="btn-brand inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold' +
            (soldOut ? ' cursor-not-allowed' : '') + '">' +
            UI.icon(soldOut ? 'close' : 'plus', 'h-4 w-4') +
            UI.escapeHtml(t(soldOut ? 'menu.soldOut' : 'menu.addToCart')) +
            '</button>' +
            '</div>' +
            '</div>' +
            '</article>'
        );
    }

    function renderMenu() {
        if (!dom['menu-grid']) return;

        var rows = visibleMenu();
        dom['menu-grid'].innerHTML = rows.map(menuCard).join('');
        toggle(dom['menu-empty'], rows.length === 0, 'flex');
        dom['menu-grid'].classList.toggle('hidden', rows.length === 0);

        if (dom['menu-results']) {
            var sellable = rows.filter(function (item) {
                return item.available !== false;
            }).length;
            dom['menu-results'].textContent = rows.length
                ? t('menu.results', { count: sellable })
                : '';
        }
        UI.reveal('#menu-grid .reveal');
    }

    /* ==================================================================== *
     * Cart
     * ==================================================================== */

    function renderOrderTypes() {
        var active = Cart.orderType();
        UI.$$('[data-order-type]', dom['order-type-group']).forEach(function (button) {
            var isActive = button.getAttribute('data-order-type') === active;
            button.classList.toggle('btn-brand', isActive);
            button.classList.toggle('shadow-lg', isActive);
            button.classList.toggle('shadow-brand/25', isActive);
            button.classList.toggle('opacity-70', !isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });
    }

    function cartLine(line) {
        return (
            '<div class="glass mb-2.5 flex gap-3 rounded-2xl p-2.5">' +
            '<img src="' + UI.attr(line.image) + '" alt="" class="h-[68px] w-[68px] shrink-0 rounded-xl object-cover">' +
            '<div class="flex min-w-0 flex-1 flex-col">' +
            '<div class="flex items-start justify-between gap-2">' +
            '<p class="truncate text-sm font-semibold">' + UI.escapeHtml(line.name) + '</p>' +
            '<button type="button" data-remove="' + UI.attr(line.id) + '" ' +
            'data-i18n-aria-label="cart.remove" aria-label="' + UI.attr(t('cart.remove', { name: line.name })) + '" ' +
            'class="shrink-0 rounded-lg p-1 opacity-50 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10">' +
            UI.icon('trash', 'h-4 w-4') +
            '</button>' +
            '</div>' +
            '<p class="mt-0.5 text-xs opacity-60">' + UI.escapeHtml(money(line.price)) + '</p>' +
            '<div class="mt-auto flex items-center justify-between gap-2 pt-2">' +
            '<div class="flex items-center gap-1 rounded-xl bg-black/5 p-0.5 dark:bg-white/10">' +
            '<button type="button" data-dec="' + UI.attr(line.id) + '" aria-label="' +
            UI.attr(t('cart.decrease', { name: line.name })) + '" ' +
            'class="grid h-7 w-7 place-items-center rounded-lg transition hover:bg-black/10 dark:hover:bg-white/15">' +
            UI.icon('minus', 'h-3.5 w-3.5') +
            '</button>' +
            '<span class="min-w-6 text-center text-sm font-bold">' + line.qty + '</span>' +
            '<button type="button" data-inc="' + UI.attr(line.id) + '" aria-label="' +
            UI.attr(t('cart.increase', { name: line.name })) + '" ' +
            'class="grid h-7 w-7 place-items-center rounded-lg transition hover:bg-black/10 dark:hover:bg-white/15">' +
            UI.icon('plus', 'h-3.5 w-3.5') +
            '</button>' +
            '</div>' +
            '<span class="text-sm font-bold">' + UI.escapeHtml(money(line.price * line.qty)) + '</span>' +
            '</div>' +
            '</div>' +
            '</div>'
        );
    }

    function renderCart() {
        var items = Cart.items();
        var totals = Cart.totals();
        var type = Cart.orderType();
        var empty = items.length === 0;

        if (dom['cart-items']) {
            dom['cart-items'].innerHTML = items.map(cartLine).join('');
        }

        toggle(dom['cart-empty'], empty, 'flex');
        toggle(dom['cart-footer'], !empty);
        toggle(dom['cart-items'], !empty);

        if (dom['cart-count']) dom['cart-count'].textContent = String(totals.itemCount);

        /* --- money ------------------------------------------------------- */
        if (dom['cart-subtotal']) dom['cart-subtotal'].textContent = money(totals.subtotal);
        if (dom['cart-service']) dom['cart-service'].textContent = money(totals.serviceCharge);
        toggle(dom['cart-service-row'], totals.serviceCharge > 0, 'flex');
        if (dom['cart-delivery']) {
            dom['cart-delivery'].textContent = totals.delivery > 0 ? money(totals.delivery) : t('cart.free');
        }
        toggle(dom['cart-delivery-row'], type === 'delivery', 'flex');
        if (dom['cart-tax']) dom['cart-tax'].textContent = money(totals.tax);
        if (dom['cart-total']) dom['cart-total'].textContent = money(totals.total);

        if (dom['cart-checkout']) {
            var label = dom['cart-checkout'].querySelector('[data-i18n="cart.checkout"]');
            if (label) label.textContent = t('cart.checkout');
            dom['cart-checkout'].disabled = empty;
        }

        /* --- fulfilment -------------------------------------------------- */
        renderOrderTypes();

        var dineIn = type === 'dine-in';
        toggle(dom['table-field-row'], dineIn);
        toggle(dom['address-field-row'], type === 'delivery', 'block');

        setValue(dom['order-table'], State.get('tableNumber', ''));
        setValue(dom['order-address'], State.get('deliveryAddress', ''));
        setValue(dom['order-notes'], State.get('orderNotes', ''));

        /* --- delivery progress ------------------------------------------- */
        if (type === 'delivery' && dom['delivery-progress-text']) {
            var threshold = totals.freeDeliveryThreshold;
            var remaining = Math.max(0, threshold - totals.subtotal);
            if (dom['delivery-progress']) {
                dom['delivery-progress'].style.width = Math.round(totals.deliveryProgress * 100) + '%';
            }
            dom['delivery-progress-text'].textContent = remaining
                ? t('cart.freeDeliveryProgress', { amount: money(remaining) })
                : t('cart.freeDeliveryReached');
        }

        /* --- checkout button label --------------------------------------- */
        var placeOrder = dom['checkout-submit'] && dom['checkout-submit'].querySelector('[data-i18n]');
        if (placeOrder) placeOrder.textContent = t('checkout.placeOrder', { total: money(totals.total) });
    }

    /* ==================================================================== *
     * Checkout
     * ==================================================================== */

    function renderPaymentOptions() {
        if (!dom['payment-options']) return;
        var gateways = Bistro.Payments.available();
        var selected = Bistro.Payments.defaultGateway();

        dom['payment-options'].innerHTML = gateways
            .map(function (gateway) {
                var checked = gateway.id === selected;
                return (
                    '<label class="glass flex cursor-pointer items-center gap-3 rounded-2xl px-3.5 py-3 transition has-[:checked]:border-brand">' +
                    '<input type="radio" name="gateway" value="' + UI.attr(gateway.id) + '"' +
                    (checked ? ' checked' : '') + ' class="h-4 w-4 accent-[var(--brand)]">' +
                    '<span class="text-brand">' + UI.icon(gateway.icon, 'h-5 w-5') + '</span>' +
                    '<span class="flex-1">' +
                    '<span class="block text-sm font-semibold">' + UI.escapeHtml(gateway.label) + '</span>' +
                    '<span class="block text-[11px] opacity-65">' + UI.escapeHtml(gateway.blurb) + '</span>' +
                    '</span>' +
                    (gateway.simulated
                        ? '<span class="rounded-lg bg-amber-400/15 px-2 py-1 text-[10px] font-bold uppercase text-amber-500">' +
                        UI.escapeHtml(t('common.optional')) + '</span>'
                        : '') +
                    '</label>'
                );
            })
            .join('');

        toggle(dom['checkout-simulated-note'], Bistro.Payments.isSimulated());
        if (!gateways.length && dom['payment-options']) {
            dom['payment-options'].innerHTML =
                '<p class="text-sm opacity-70">' + UI.escapeHtml(t('common.error')) + '</p>';
        }
    }

    function openCheckout() {
        if (!Cart.items().length) {
            UI.toast(t('cart.empty'), { tone: 'warn' });
            return;
        }
        renderPaymentOptions();
        hide(dom['checkout-error']);
        dom['checkout-error'].textContent = '';
        show(dom['checkout-body']);
        hide(dom['checkout-success'], 'flex');
        dom['checkout-form'].reset();
        UI.overlay.close('cart-drawer');
        UI.overlay.open('checkout-modal');
        renderCart();
    }

    function paintCheckoutError(keys) {
        if (!keys.length) {
            hide(dom['checkout-error']);
            return;
        }
        dom['checkout-error'].textContent = keys.map(function (key) {
            return t(key);
        }).join(' ');
        show(dom['checkout-error']);
    }

    /** Map an ApiError code onto a translated message. */
    var ERROR_MESSAGES = {
        'order/empty': 'checkout.validation.empty',
        'order/name-required': 'checkout.validation.name',
        'order/phone-required': 'checkout.validation.phone',
        'order/table-required': 'checkout.validation.table',
        'order/address-required': 'checkout.validation.address',
        'reservation/name-required': 'res.validation.name',
        'reservation/phone-required': 'res.validation.phone',
        'reservation/date-required': 'res.validation.date',
        'reservation/time-required': 'res.validation.time',
        'reservation/guests': 'res.validation.guests'
    };

    function messageForError(err) {
        if (err && err.code && ERROR_MESSAGES[err.code]) return t(ERROR_MESSAGES[err.code]);
        return t('common.error');
    }

    function submitCheckout(event) {
        event.preventDefault();

        var customer = {
            name: dom['co-name'].value.trim(),
            phone: dom['co-phone'].value.trim(),
            email: dom['co-email'].value.trim()
        };

        // Mirror the fulfilment inputs the guest already filled in the drawer.
        Cart.setTable(dom['order-table'] ? dom['order-table'].value : State.get('tableNumber'));
        Cart.setAddress(dom['order-address'] ? dom['order-address'].value : State.get('deliveryAddress'));
        Cart.setNotes(dom['order-notes'] ? dom['order-notes'].value : State.get('orderNotes'));

        var check = Cart.validate(customer);
        if (!check.ok) {
            paintCheckoutError(check.errors);
            return;
        }
        paintCheckoutError([]);

        var gatewayInput = dom['payment-options'].querySelector('input[name="gateway"]:checked');
        var gateway = gatewayInput ? gatewayInput.value : Bistro.Payments.defaultGateway();
        var order = Cart.toOrder(customer);

        UI.setBusy(dom['checkout-submit'], true, t('checkout.processing'));

        Bistro.Payments.checkout({ order: order, gateway: gateway })
            .then(function (payment) {
                if (payment.status === 'requires_action' && payment.url) {
                    // Hand off to the gateway's hosted checkout page.
                    global.location.href = payment.url;
                    return null;
                }
                return API.createOrder(
                    Object.assign(order, {
                        reference: payment.reference,
                        payment: {
                            gateway: payment.gateway,
                            status: payment.status,
                            reference: payment.reference,
                            simulated: payment.simulated
                        }
                    })
                );
            })
            .then(function (saved) {
                if (!saved) return;
                Cart.clear();
                hide(dom['checkout-body']);
                show(dom['checkout-success'], 'flex');
                dom['checkout-reference'].textContent = saved.reference;
                dom['checkout-gateway'].textContent = [
                    saved.payment && saved.payment.gateway
                        ? (Bistro.Payments.descriptors[saved.payment.gateway] || {}).label
                        : '',
                    saved.payment && saved.payment.simulated ? t('checkout.simulatedNotice') : ''
                ]
                    .filter(Boolean)
                    .join(' · ');
                UI.toast(t('checkout.successTitle'), { tone: 'success' });
                renderStats();
            })
            .catch(function (err) {
                console.error('[Bistro] Checkout failed.', err);
                dom['checkout-error'].textContent = messageForError(err);
                show(dom['checkout-error']);
            })
            .then(function () {
                UI.setBusy(dom['checkout-submit'], false);
            });
    }

    /* ==================================================================== *
     * Reservations
     * ==================================================================== */

    function isoDate(date) {
        return date.toISOString().slice(0, 10);
    }

    function buildReservationOptions() {
        var settings = CONFIG.reservations;

        // Date window
        var today = new Date();
        var last = new Date();
        last.setDate(last.getDate() + (settings.advanceDays || 60));
        if (dom['res-date']) {
            dom['res-date'].min = isoDate(today);
            dom['res-date'].max = isoDate(last);
            if (!dom['res-date'].value) dom['res-date'].value = isoDate(today);
        }

        // Time slots
        if (dom['res-time']) {
            var slots = [];
            var cursor = toMinutes(settings.openTime);
            var close = toMinutes(settings.closeTime);
            var step = settings.slotMinutes || 30;
            for (; cursor <= close; cursor += step) slots.push(fromMinutes(cursor));
            dom['res-time'].innerHTML = slots
                .map(function (slot) {
                    return '<option value="' + slot + '">' + slot + '</option>';
                })
                .join('');
            dom['res-time'].value = slots.indexOf('19:00') !== -1 ? '19:00' : slots[0];
        }

        // Party sizes
        if (dom['res-guests']) {
            var options = [];
            for (var count = settings.minPartySize || 1; count <= (settings.maxPartySize || 12); count += 1) {
                options.push(
                    '<option value="' + count + '"' + (count === 2 ? ' selected' : '') + '>' +
                    UI.escapeHtml(t('res.guestsOption', { count: count })) +
                    '</option>'
                );
            }
            dom['res-guests'].innerHTML = options.join('');
        }
    }

    function toMinutes(value) {
        var parts = String(value || '00:00').split(':');
        return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }

    function fromMinutes(total) {
        var hours = Math.floor(total / 60);
        var minutes = total % 60;
        return (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
    }

    function submitReservation(event) {
        event.preventDefault();

        var booking = {
            name: dom['res-name'].value.trim(),
            phone: dom['res-phone'].value.trim(),
            email: dom['res-email'].value.trim(),
            date: dom['res-date'].value,
            time: dom['res-time'].value,
            guests: parseInt(dom['res-guests'].value, 10),
            notes: dom['res-notes'].value.trim()
        };

        var errors = [];
        if (!booking.name) errors.push(t('res.validation.name'));
        if (!booking.phone) errors.push(t('res.validation.phone'));
        var chosen = new Date(booking.date + 'T' + booking.time + ':00');
        if (Number.isNaN(chosen.getTime()) || chosen.getTime() < Date.now() - 60 * 1000) {
            errors.push(t('res.validation.date'));
        } else {
            var openMin = toMinutes(CONFIG.reservations.openTime);
            var closeMin = toMinutes(CONFIG.reservations.closeTime);
            var minutes = toMinutes(booking.time);
            if (minutes < openMin || minutes > closeMin) {
                errors.push(
                    t('res.validation.timeWindow', {
                        open: CONFIG.reservations.openTime,
                        close: CONFIG.reservations.closeTime
                    })
                );
            }
        }

        if (errors.length) {
            dom['res-error'].textContent = errors.join(' ');
            show(dom['res-error']);
            return;
        }
        hide(dom['res-error']);

        UI.setBusy(dom['res-submit'], true, t('res.submitting'));

        API.createReservation(booking)
            .then(function (saved) {
                hide(dom['reservation-form']);
                show(dom['res-success'], 'flex');
                dom['res-reference'].textContent = saved.reference;
                UI.toast(t('res.successTitle'), { tone: 'success' });
                renderStats();
            })
            .catch(function (err) {
                console.error('[Bistro] Reservation failed.', err);
                dom['res-error'].textContent = messageForError(err);
                show(dom['res-error']);
            })
            .then(function () {
                UI.setBusy(dom['res-submit'], false);
            });
    }

    /* ==================================================================== *
     * Gallery + reviews
     * ==================================================================== */

    function renderGallery() {
        if (!dom['gallery-grid']) return;
        dom['gallery-grid'].innerHTML = Bistro.Seed.gallery
            .map(function (tile, index) {
                return (
                    '<figure class="card-hover group relative overflow-hidden rounded-3xl" ' +
                    'style="background:' + UI.attr(tile.gradient) + '">' +
                    '<div class="aspect-[4/3] w-full"></div>' +
                    '<figcaption class="glass-strong absolute inset-x-3 bottom-3 rounded-2xl px-3.5 py-2.5 text-xs font-semibold">' +
                    UI.escapeHtml(tile.caption) +
                    '<span class="ms-1 opacity-50">' + UI.escapeHtml(t('gallery.caption', { n: index + 1 })) + '</span>' +
                    '</figcaption>' +
                    '</figure>'
                );
            })
            .join('');
    }

    function renderReviews() {
        if (!dom['reviews-grid']) return;
        var reviews = State.get('reviews', []) || Bistro.Seed.reviews;
        dom['reviews-grid'].innerHTML = reviews
            .map(function (review) {
                return (
                    '<article class="glass card-hover flex flex-col rounded-3xl p-5">' +
                    '<div class="text-brand flex items-center gap-0.5">' + UI.stars(review.rating, 'h-4 w-4') + '</div>' +
                    '<p class="mt-3 flex-1 text-sm leading-relaxed opacity-80">“' +
                    UI.escapeHtml(review.text) + '”</p>' +
                    '<footer class="mt-4 flex items-center gap-3 border-t border-black/5 pt-4 dark:border-white/10">' +
                    '<span class="btn-brand grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold">' +
                    UI.escapeHtml(String(review.author || '?').charAt(0)) + '</span>' +
                    '<span class="min-w-0">' +
                    '<span class="block truncate text-sm font-semibold">' + UI.escapeHtml(review.author) + '</span>' +
                    '<span class="block truncate text-[11px] opacity-60">' +
                    UI.escapeHtml(review.role || t('reviews.verified')) + '</span>' +
                    '</span>' +
                    '<time class="ms-auto shrink-0 text-[11px] opacity-50" datetime="' + UI.attr(review.date) + '">' +
                    UI.escapeHtml(I18N.formatDate(review.date, { month: 'short', year: 'numeric' })) +
                    '</time>' +
                    '</footer>' +
                    '</article>'
                );
            })
            .join('');
    }

    /* ==================================================================== *
     * QR table ordering
     * ==================================================================== */

    function buildQrOptions() {
        if (!dom['qr-table']) return;
        var count = CONFIG.get('qr.tableCount', 12);
        var options = [];
        for (var table = 1; table <= count; table += 1) {
            options.push('<option value="' + table + '">' + table + '</option>');
        }
        dom['qr-table'].innerHTML = options.join('');
    }

    function renderQrNote(text) {
        if (!dom['qr-note']) return;
        dom['qr-note'].textContent = text || '';
        toggle(dom['qr-note'], Boolean(text), 'block');
    }

    function generateQr() {
        var table = dom['qr-table'].value;
        var url = Bistro.QR.tableUrl(table);

        renderQrNote(t('qr.scanHint', { table: table }));

        return Bistro.QR.toDataUrl(url, { size: CONFIG.get('qr.size', 320) }).then(function (result) {
            dom['qr-image'].src = result.dataUrl;
            show(dom['qr-image']);
            hide(dom['qr-placeholder']);
            show(dom['qr-download'], 'inline-flex');

            if (dom['qr-link']) {
                dom['qr-link'].href = url;
                dom['qr-link'].textContent = url;
                show(dom['qr-link'], 'block');
            }

            if (result.fallback) UI.toast(t('qr.unavailable'), { tone: 'warn' });
            return result;
        });
    }

    function downloadQr() {
        var source = dom['qr-image'] && dom['qr-image'].src;
        if (!source) return;
        var link = document.createElement('a');
        link.href = source;
        link.download = 'bistro-table-' + dom['qr-table'].value + '.png';
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    /* ==================================================================== *
     * Hero stats
     * ==================================================================== */

    function renderStats() {
        var available = menuCache.filter(function (item) {
            return item.available !== false;
        });

        var avg = available.length
            ? available.reduce(function (sum, item) {
                return sum + (item.rating || 0);
            }, 0) / available.length
            : 0;

        var today = isoDate(new Date());
        var tables = {};
        (State.get('reservations', []) || []).forEach(function (booking) {
            if (booking.date === today) tables[booking.reference || booking.id] = true;
        });
        (State.get('orders', []) || []).forEach(function (order) {
            if (String(order.createdAt || '').slice(0, 10) === today) tables[order.id] = true;
        });

        var nodes = {
            dishes: String(available.length),
            rating: avg ? avg.toFixed(1) : '—',
            tables: String(Object.keys(tables).length)
        };

        Object.keys(nodes).forEach(function (key) {
            var node = UI.$('[data-stat="' + key + '"]');
            if (node) node.textContent = nodes[key];
        });
    }

    /* ==================================================================== *
     * Events
     * ==================================================================== */

    function bindEvents() {
        /* --- menu -------------------------------------------------------- */
        UI.on(dom['menu-tabs'], 'click', '[data-category]', function (event, button) {
            view.category = button.getAttribute('data-category');
            renderTabs();
            renderMenu();
        });

        UI.on(dom['menu-filters'], 'click', '[data-tag]', function (event, button) {
            var tag = button.getAttribute('data-tag');
            var index = view.tags.indexOf(tag);
            if (index === -1) view.tags.push(tag);
            else view.tags.splice(index, 1);
            renderFilters();
            renderMenu();
        });

        if (dom['menu-search']) {
            dom['menu-search'].addEventListener(
                'input',
                UI.debounce(function () {
                    view.query = dom['menu-search'].value.trim();
                    renderMenu();
                }, 180)
            );
        }

        if (dom['menu-sort']) {
            dom['menu-sort'].addEventListener('change', function () {
                view.sort = dom['menu-sort'].value;
                renderMenu();
            });
        }

        if (dom['menu-clear-filters']) {
            dom['menu-clear-filters'].addEventListener('click', function () {
                view = { category: 'all', query: '', tags: [], sort: view.sort };
                if (dom['menu-search']) dom['menu-search'].value = '';
                renderTabs();
                renderFilters();
                renderMenu();
            });
        }

        UI.on(dom['menu-grid'], 'click', '[data-add]', function (event, button) {
            var id = button.getAttribute('data-add');
            var item = menuCache.filter(function (row) {
                return row.id === id;
            })[0];
            if (!item) return;

            var before = Cart.count();
            Cart.add(item, 1);
            if (Cart.count() !== before) {
                UI.toast(t('menu.added', { name: item.name }), { tone: 'success' });
            }
            button.classList.add('animate-pop');
            global.setTimeout(function () {
                button.classList.remove('animate-pop');
            }, 320);
        });

        /* --- cart -------------------------------------------------------- */
        UI.on(dom['cart-items'], 'click', '[data-inc],[data-dec],[data-remove]', function (event, button) {
            var id =
                button.getAttribute('data-inc') ||
                button.getAttribute('data-dec') ||
                button.getAttribute('data-remove');

            var line = Cart.items().filter(function (row) {
                return row.id === id;
            })[0];
            if (!line) return;

            if (button.hasAttribute('data-remove')) Cart.remove(id);
            else if (button.hasAttribute('data-inc')) Cart.setQty(id, line.qty + 1);
            else Cart.setQty(id, line.qty - 1);
        });

        if (dom['cart-clear']) {
            dom['cart-clear'].addEventListener('click', function () {
                Cart.clear();
                UI.toast(t('cart.empty'), { tone: 'info' });
            });
        }

        UI.on(dom['order-type-group'], 'click', '[data-order-type]', function (event, button) {
            Cart.setOrderType(button.getAttribute('data-order-type'));
        });

        ['order-table', 'order-address', 'order-notes'].forEach(function (id) {
            if (!dom[id]) return;
            dom[id].addEventListener('change', function () {
                if (id === 'order-table') Cart.setTable(dom[id].value);
                else if (id === 'order-address') Cart.setAddress(dom[id].value);
                else Cart.setNotes(dom[id].value);
            });
        });

        if (dom['cart-checkout']) dom['cart-checkout'].addEventListener('click', openCheckout);
        if (dom['checkout-form']) dom['checkout-form'].addEventListener('submit', submitCheckout);

        /* --- reservations ------------------------------------------------ */
        if (dom['reservation-form']) dom['reservation-form'].addEventListener('submit', submitReservation);
        if (dom['res-again']) {
            dom['res-again'].addEventListener('click', function () {
                dom['reservation-form'].reset();
                buildReservationOptions();
                hide(dom['res-success'], 'flex');
                show(dom['reservation-form']);
            });
        }

        /* --- QR ---------------------------------------------------------- */
        if (dom['qr-generate']) {
            dom['qr-generate'].addEventListener('click', function () {
                generateQr().catch(function (err) {
                    console.error('[Bistro] QR generation failed.', err);
                    UI.toast(t('common.error'), { tone: 'error' });
                });
            });
        }
        if (dom['qr-download']) dom['qr-download'].addEventListener('click', downloadQr);

        /* --- chrome ------------------------------------------------------ */
        if (dom['theme-toggle']) {
            dom['theme-toggle'].addEventListener('click', function () {
                UI.toggleTheme();
            });
        }
    }

    /* ==================================================================== *
     * Boot
     * ==================================================================== */

    function applyThemeFromState() {
        var theme = State.get('theme') || UI.storedTheme() || CONFIG.theme.default;
        State.patch({ theme: theme }, { silent: true });
        UI.applyTheme(theme);
    }

    function buildLanguageSelectors() {
        var options = I18N.languages()
            .map(function (language) {
                return (
                    '<option value="' + UI.attr(language.code) + '">' +
                    UI.escapeHtml(language.native) +
                    '</option>'
                );
            })
            .join('');

        [dom['lang-select'], dom['lang-select-mobile']].forEach(function (select) {
            if (!select) return;
            select.innerHTML = options;
            select.value = I18N.currentLanguage();
            select.addEventListener('change', function () {
                I18N.setLanguage(select.value);
            });
        });
    }

    function syncLanguageSelectors() {
        var code = I18N.currentLanguage();
        [dom['lang-select'], dom['lang-select-mobile']].forEach(function (select) {
            if (select && select.value !== code) select.value = code;
        });
    }

    /** Deep link support: /index.html?table=7 */
    function applyTableDeepLink() {
        var table = Bistro.QR.tableFromUrl();
        if (!table) return;
        Cart.setTable(table);
        if (dom['qr-table']) dom['qr-table'].value = table;
        if (dom['order-table']) dom['order-table'].value = table;
        UI.toast(t('qr.scanHint', { table: table }), { tone: 'info', timeout: 6000 });
    }

    function renderAll() {
        renderTabs();
        renderFilters();
        renderMenu();
        renderCart();
        renderGallery();
        renderReviews();
        renderStats();
        syncLanguageSelectors();
    }

    function subscribeToState() {
        State.subscribe(function (snapshot, meta) {
            var changed = meta.changed || [];

            if (changed.indexOf('menu') !== -1) {
                menuCache = snapshot.menu || [];
                renderMenu();
                renderStats();
            }
            if (changed.indexOf('reviews') !== -1) renderReviews();
            if (changed.indexOf('orders') !== -1 || changed.indexOf('reservations') !== -1) renderStats();

            var cartKeys = ['cart', 'orderType', 'tableNumber', 'deliveryAddress', 'orderNotes'];
            if (cartKeys.some(function (key) { return changed.indexOf(key) !== -1; })) renderCart();
        });
    }

    function init() {
        cacheElements();
        UI.applyBrand();
        injectIcons();
        applyThemeFromState();
        buildLanguageSelectors();
        UI.overlay.bind(document);

        if (dom['year']) dom['year'].textContent = String(new Date().getFullYear());

        buildQrOptions();
        buildReservationOptions();
        bindEvents();
        subscribeToState();

        API.init()
            .then(function () {
                menuCache = State.get('menu', []) || [];
                return API.listMenu({ includeUnavailable: true });
            })
            .then(function (rows) {
                menuCache = rows;
                renderAll();
                applyTableDeepLink();
                UI.reveal('.reveal');
            })
            .catch(function (err) {
                console.error('[Bistro] Could not load data.', err);
                UI.toast(t('common.error'), { tone: 'error' });
                renderAll();
            });

        I18N.onLanguageChange(function () {
            renderAll();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window);
