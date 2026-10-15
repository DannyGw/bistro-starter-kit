/**
 * Bistro Starter Kit — admin dashboard controller.
 * ---------------------------------------------------------------------------
 * Powers admin.html: live orders, booking approvals, menu availability toggles
 * and a small settings panel.
 *
 * The gate below trades a passcode for a session flag. It is a *demo* barrier
 * only — everything runs in the browser, so anyone can read the passcode in
 * config.js. Replace it with Supabase Auth (or your own server session) before
 * this page is reachable from the public internet.
 * ---------------------------------------------------------------------------
 */
(function (global) {
    'use strict';

    var Bistro = global.Bistro;
    var CONFIG = Bistro.Config;
    var State = Bistro.State;
    var API = Bistro.API;
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
    var TAB_IDS = ['orders', 'reservations', 'menu', 'settings'];
    var activeTab = 'orders';

    var IDS = [
        'admin-gate', 'gate-form', 'gate-passcode', 'gate-error', 'gate-submit', 'gate-hint',
        'admin-app', 'mode-badge', 'admin-lang', 'admin-theme-toggle', 'admin-refresh',
        'admin-logout', 'admin-tabs',
        'stat-orders', 'stat-revenue', 'stat-reservations', 'stat-pending',
        'panel-orders', 'orders-empty', 'panel-reservations', 'reservations-empty',
        'panel-menu', 'menu-admin-grid', 'menu-admin-empty',
        'panel-settings', 'settings-mode', 'settings-backend', 'settings-features', 'settings-reset'
    ];

    function cacheElements() {
        IDS.forEach(function (id) {
            dom[id] = document.getElementById(id);
        });
    }

    /* ==================================================================== *
     * Icons
     * ==================================================================== */

    var ICON_SLOTS = {
        'lock-icon': 'lock',
        'refresh-icon': 'refresh',
        'logout-icon': 'logout',
        'receipt-icon': 'receipt',
        'card-icon': 'card',
        'calendar-icon': 'calendar',
        'alert-icon': 'alert',
        'trash-icon': 'trash'
    };

    function injectIcons() {
        Object.keys(ICON_SLOTS).forEach(function (slot) {
            UI.$$('[data-' + slot + ']').forEach(function (node) {
                if (node.firstElementChild) return;
                node.innerHTML = UI.icon(ICON_SLOTS[slot], 'h-5 w-5');
            });
        });
    }

    /* ==================================================================== *
     * Gate
     * ==================================================================== */

    var SESSION_KEY = CONFIG.get('admin.sessionKey', 'bistro.admin.session');

    function hasSession() {
        try {
            return global.sessionStorage.getItem(SESSION_KEY) === 'granted';
        } catch (err) {
            return false;
        }
    }

    function grantSession() {
        try {
            global.sessionStorage.setItem(SESSION_KEY, 'granted');
        } catch (err) {
            /* sessionStorage blocked — the gate simply reappears on reload */
        }
    }

    function revokeSession() {
        try {
            global.sessionStorage.removeItem(SESSION_KEY);
        } catch (err) {
            /* ignore */
        }
    }

    function showApp() {
        if (dom['admin-gate']) dom['admin-gate'].classList.add('hidden');
        if (dom['admin-app']) dom['admin-app'].classList.remove('hidden');
        renderAll();
    }

    function showGate() {
        if (dom['admin-app']) dom['admin-app'].classList.add('hidden');
        if (dom['admin-gate']) dom['admin-gate'].classList.remove('hidden');
        if (dom['gate-passcode']) dom['gate-passcode'].focus();
    }

    function submitGate(event) {
        event.preventDefault();
        var entered = (dom['gate-passcode'].value || '').trim();

        if (entered === CONFIG.get('admin.demoPasscode', '')) {
            UI.overlay.closeAll();
            hide(dom['gate-error']);
            grantSession();
            showApp();
            return;
        }

        show(dom['gate-error']);
        if (dom['gate-passcode']) {
            dom['gate-passcode'].value = '';
            dom['gate-passcode'].focus();
        }
    }

    /* ==================================================================== *
     * Helpers
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

    var STATUS_TONES = {
        pending: 'bg-amber-400/15 text-amber-600 dark:text-amber-400',
        confirmed: 'bg-sky-400/15 text-sky-600 dark:text-sky-400',
        preparing: 'bg-indigo-400/15 text-indigo-600 dark:text-indigo-400',
        ready: 'bg-emerald-400/15 text-emerald-600 dark:text-emerald-400',
        completed: 'bg-slate-400/15 text-slate-600 dark:text-slate-300',
        cancelled: 'bg-rose-400/15 text-rose-600 dark:text-rose-400'
    };

    function statusPill(status) {
        var tone = STATUS_TONES[status] || STATUS_TONES.pending;
        return (
            '<span class="rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ' + tone + '">' +
            UI.escapeHtml(t('admin.status.' + status)) +
            '</span>'
        );
    }

    /** Next step in the kitchen workflow, or null when there is none. */
    function nextStatus(status) {
        var flow = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];
        var index = flow.indexOf(status);
        if (index === -1 || index === flow.length - 1) return null;
        return flow[index + 1];
    }

    function isToday(value) {
        return String(value || '').slice(0, 10) === new Date().toISOString().slice(0, 10);
    }

    /* ==================================================================== *
     * Tabs
     * ==================================================================== */

    function renderTabs() {
        if (!dom['admin-tabs']) return;
        var counts = {
            orders: (State.get('orders', []) || []).length,
            reservations: (State.get('reservations', []) || []).length,
            menu: (State.get('menu', []) || []).length,
            settings: null
        };

        dom['admin-tabs'].innerHTML = TAB_IDS.map(function (id) {
            var active = activeTab === id;
            var count = counts[id];
            return (
                '<button type="button" role="tab" aria-selected="' + active + '" data-tab="' + id + '" ' +
                'class="shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition ' +
                (active ? 'btn-brand shadow-lg shadow-brand/25' : 'glass hover:-translate-y-0.5') + '">' +
                UI.escapeHtml(t('admin.tabs.' + id)) +
                (count === null ? '' : ' <span class="opacity-60">' + count + '</span>') +
                '</button>'
            );
        }).join('');

        TAB_IDS.forEach(function (id) {
            toggle(dom['panel-' + id], activeTab === id, id === 'panel-settings' ? 'grid' : 'block');
        });
    }

    /* ==================================================================== *
     * Stats
     * ==================================================================== */

    function renderStats() {
        var orders = State.get('orders', []) || [];
        var reservations = State.get('reservations', []) || [];

        var live = orders.filter(function (order) {
            return order.status !== 'cancelled';
        });

        var revenue = live.reduce(function (sum, order) {
            return sum + ((order.totals && order.totals.total) || 0);
        }, 0);

        var pending =
            orders.filter(function (order) {
                return ['pending', 'confirmed', 'preparing'].indexOf(order.status) !== -1;
            }).length +
            reservations.filter(function (booking) {
                return booking.status === 'pending';
            }).length;

        if (dom['stat-orders']) dom['stat-orders'].textContent = String(orders.length);
        if (dom['stat-revenue']) dom['stat-revenue'].textContent = money(revenue);
        if (dom['stat-reservations']) dom['stat-reservations'].textContent = String(reservations.length);
        if (dom['stat-pending']) dom['stat-pending'].textContent = String(pending);
    }

    /* ==================================================================== *
     * Orders
     * ==================================================================== */

    function orderCard(order) {
        var totals = order.totals || {};
        var customer = order.customer || {};
        var payment = order.payment || {};
        var advance = nextStatus(order.status);

        var fulfilment = [];
        fulfilment.push(t('admin.table.type') + ': ' + t('orderType.' + (order.type === 'dine-in' ? 'dineIn' : order.type === 'takeaway' ? 'takeaway' : 'delivery')));
        if (order.type === 'dine-in' && order.tableNumber) {
            fulfilment.push(t('orderType.tableLabel') + ': ' + order.tableNumber);
        }
        if (order.type === 'delivery' && customer.address) {
            fulfilment.push(t('orderType.addressLabel') + ': ' + customer.address);
        }

        var lines = (order.items || [])
            .map(function (item) {
                return (
                    '<li class="flex items-baseline justify-between gap-3">' +
                    '<span><span class="font-semibold">' + item.qty + '×</span> ' + UI.escapeHtml(item.name) + '</span>' +
                    '<span class="shrink-0 opacity-70">' + UI.escapeHtml(money(item.price * item.qty)) + '</span>' +
                    '</li>'
                );
            })
            .join('');

        var actions = '';
        if (advance) {
            actions +=
                '<button type="button" data-advance="' + UI.attr(order.id) + '" ' +
                'class="btn-brand inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold">' +
                UI.icon('check', 'h-4 w-4') + UI.escapeHtml(t('admin.status.' + advance)) +
                '</button>';
        }
        if (['completed', 'cancelled'].indexOf(order.status) === -1) {
            actions +=
                '<button type="button" data-cancel-order="' + UI.attr(order.id) + '" ' +
                'class="inline-flex items-center gap-1.5 rounded-xl border border-rose-400/40 px-4 py-2 text-sm font-semibold text-rose-500 transition hover:bg-rose-500/10">' +
                UI.icon('close', 'h-4 w-4') + UI.escapeHtml(t('admin.action.cancel')) +
                '</button>';
        }

        var meta = [
            customer.name,
            customer.phone,
            customer.email
        ].filter(Boolean).join(' · ');

        return (
            '<article class="glass rounded-3xl p-5">' +
            '<div class="flex flex-wrap items-center gap-3">' +
            '<span class="btn-brand rounded-xl px-3 py-1.5 text-xs font-bold tracking-wide">' +
            UI.escapeHtml(order.reference || order.id) + '</span>' +
            statusPill(order.status) +
            '<span class="ms-auto text-xs opacity-60">' +
            UI.escapeHtml(I18N.formatDate(order.createdAt, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })) +
            (isToday(order.createdAt) ? ' · ' + UI.escapeHtml(t('common.openNow')) : '') +
            '</span>' +
            '</div>' +

            '<div class="mt-4 grid gap-5 md:grid-cols-[1.3fr_1fr]">' +
            '<div>' +
            '<p class="text-[11px] uppercase tracking-wider opacity-55" data-i18n="admin.table.details">' + UI.escapeHtml(t('admin.table.details')) + '</p>' +
            '<ul class="mt-2 space-y-1.5 text-sm">' + lines + '</ul>' +
            '</div>' +

            '<div class="space-y-1.5 text-sm">' +
            '<p class="text-[11px] uppercase tracking-wider opacity-55">' + UI.escapeHtml(t('admin.table.guest')) + '</p>' +
            '<p class="font-medium">' + UI.escapeHtml(meta || '—') + '</p>' +
            '<ul class="mt-2 space-y-1 opacity-75">' +
            fulfilment.map(function (row) {
                return '<li>' + UI.escapeHtml(row) + '</li>';
            }).join('') +
            (order.notes ? '<li>📝 ' + UI.escapeHtml(order.notes) + '</li>' : '') +
            (payment.gateway
                ? '<li>💳 ' + UI.escapeHtml((Bistro.Payments.descriptors[payment.gateway] || {}).label || payment.gateway) +
                (payment.simulated ? ' (' + UI.escapeHtml(t('footer.demo')) + ')' : '') + '</li>'
                : '') +
            '</ul>' +
            '<p class="mt-3 flex items-baseline justify-between border-t border-black/5 pt-3 dark:border-white/10">' +
            '<span class="opacity-60">' + UI.escapeHtml(t('admin.table.total')) + '</span>' +
            '<span class="display text-xl font-bold">' + UI.escapeHtml(money(totals.total || 0)) + '</span>' +
            '</p>' +
            '</div>' +
            '</div>' +

            (actions
                ? '<div class="mt-4 flex flex-wrap gap-2 border-t border-black/5 pt-4 dark:border-white/10">' + actions + '</div>'
                : '') +
            '</article>'
        );
    }

    function renderOrders() {
        if (!dom['panel-orders']) return;
        var orders = (State.get('orders', []) || []).slice();

        orders.sort(function (a, b) {
            return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
        });

        var open = orders.filter(function (order) {
            return ['completed', 'cancelled'].indexOf(order.status) === -1;
        });
        var done = orders.filter(function (order) {
            return ['completed', 'cancelled'].indexOf(order.status) !== -1;
        });

        var html = open.map(orderCard).join('');
        if (done.length) {
            html +=
                '<details class="glass rounded-3xl p-5">' +
                '<summary class="cursor-pointer text-sm font-semibold opacity-75">' +
                UI.escapeHtml(t('admin.status.completed')) + ' / ' + UI.escapeHtml(t('admin.status.cancelled')) +
                ' (' + done.length + ')</summary>' +
                '<div class="mt-4 space-y-4">' + done.map(orderCard).join('') + '</div>' +
                '</details>';
        }

        dom['panel-orders'].innerHTML = html;
        toggle(dom['orders-empty'], orders.length === 0);
    }

    /* ==================================================================== *
     * Reservations
     * ==================================================================== */

    function reservationCard(booking) {
        var actions = '';
        if (booking.status === 'pending') {
            actions +=
                '<button type="button" data-approve="' + UI.attr(booking.id) + '" ' +
                'class="btn-brand inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold">' +
                UI.icon('check', 'h-4 w-4') + UI.escapeHtml(t('admin.action.approve')) +
                '</button>' +
                '<button type="button" data-reject="' + UI.attr(booking.id) + '" ' +
                'class="inline-flex items-center gap-1.5 rounded-xl border border-rose-400/40 px-4 py-2 text-sm font-semibold text-rose-500 transition hover:bg-rose-500/10">' +
                UI.icon('close', 'h-4 w-4') + UI.escapeHtml(t('admin.action.reject')) +
                '</button>';
        } else if (booking.status === 'confirmed') {
            actions +=
                '<button type="button" data-reject="' + UI.attr(booking.id) + '" ' +
                'class="inline-flex items-center gap-1.5 rounded-xl border border-rose-400/40 px-4 py-2 text-sm font-semibold text-rose-500 transition hover:bg-rose-500/10">' +
                UI.icon('close', 'h-4 w-4') + UI.escapeHtml(t('admin.action.cancel')) +
                '</button>';
        }

        var large = booking.guests >= CONFIG.get('reservations.largePartyThreshold', 8);

        return (
            '<article class="glass rounded-3xl p-5">' +
            '<div class="flex flex-wrap items-center gap-3">' +
            '<span class="btn-brand rounded-xl px-3 py-1.5 text-xs font-bold tracking-wide">' +
            UI.escapeHtml(booking.reference || booking.id) + '</span>' +
            statusPill(booking.status) +
            (large
                ? '<span class="rounded-full bg-amber-400/15 px-2.5 py-1 text-[11px] font-bold uppercase text-amber-600 dark:text-amber-400">' +
                UI.escapeHtml(t('admin.largeParty')) + '</span>'
                : '') +
            '<span class="ms-auto text-xs opacity-60">' +
            UI.escapeHtml(I18N.formatDate(booking.date, { day: 'numeric', month: 'short', year: 'numeric' })) +
            ' · ' + UI.escapeHtml(booking.time) +
            '</span>' +
            '</div>' +

            '<div class="mt-4 grid gap-4 sm:grid-cols-3">' +
            '<div>' +
            '<p class="text-[11px] uppercase tracking-wider opacity-55">' + UI.escapeHtml(t('admin.table.guest')) + '</p>' +
            '<p class="mt-1 font-medium">' + UI.escapeHtml(booking.name) + '</p>' +
            '<p class="text-xs opacity-70">' + UI.escapeHtml(booking.phone || '') + '</p>' +
            (booking.email ? '<p class="text-xs opacity-70">' + UI.escapeHtml(booking.email) + '</p>' : '') +
            '</div>' +
            '<div>' +
            '<p class="text-[11px] uppercase tracking-wider opacity-55">' + UI.escapeHtml(t('res.guestsLabel')) + '</p>' +
            '<p class="mt-1 font-medium">' + UI.escapeHtml(I18N.plural('res.guestsOption', booking.guests)) + '</p>' +
            '</div>' +
            '<div>' +
            '<p class="text-[11px] uppercase tracking-wider opacity-55">' + UI.escapeHtml(t('res.notesLabel')) + '</p>' +
            '<p class="mt-1 text-sm opacity-80">' + UI.escapeHtml(booking.notes || '—') + '</p>' +
            '</div>' +
            '</div>' +

            (actions
                ? '<div class="mt-4 flex flex-wrap gap-2 border-t border-black/5 pt-4 dark:border-white/10">' + actions + '</div>'
                : '') +
            '</article>'
        );
    }

    function renderReservations() {
        if (!dom['panel-reservations']) return;
        var bookings = (State.get('reservations', []) || []).slice();

        bookings.sort(function (a, b) {
            var keyA = String(a.date) + String(a.time);
            var keyB = String(b.date) + String(b.time);
            return keyB.localeCompare(keyA);
        });

        dom['panel-reservations'].innerHTML = bookings.map(reservationCard).join('');
        toggle(dom['reservations-empty'], bookings.length === 0);
    }

    /* ==================================================================== *
     * Menu availability
     * ==================================================================== */

    function menuAdminCard(item) {
        var available = item.available !== false;
        return (
            '<article class="glass flex gap-3 rounded-2xl p-3">' +
            '<img src="' + UI.attr(item.image) + '" alt="" class="h-16 w-16 shrink-0 rounded-xl object-cover' +
            (available ? '' : ' grayscale') + '">' +
            '<div class="flex min-w-0 flex-1 flex-col">' +
            '<div class="flex items-start justify-between gap-2">' +
            '<p class="truncate text-sm font-semibold">' + UI.escapeHtml(item.name) + '</p>' +
            '<span class="shrink-0 text-sm font-bold">' + UI.escapeHtml(money(item.price)) + '</span>' +
            '</div>' +
            '<p class="mt-0.5 text-[11px] uppercase tracking-wider opacity-55">' +
            UI.escapeHtml(t('cat.' + item.category)) +
            ' · ' + UI.escapeHtml(t('menu.prep', { minutes: item.prepMinutes || 0 })) +
            '</p>' +
            '<div class="mt-auto flex items-center justify-between gap-2 pt-2">' +
            '<span class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ' +
            (available ? 'bg-emerald-400/15 text-emerald-600 dark:text-emerald-400' : 'bg-slate-400/15 opacity-70') + '">' +
            UI.escapeHtml(t(available ? 'common.active' : 'common.hidden')) + '</span>' +
            '<button type="button" data-toggle-item="' + UI.attr(item.id) + '" ' +
            'data-available="' + (available ? '0' : '1') + '" ' +
            'class="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ' +
            (available
                ? 'border border-black/10 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10'
                : 'btn-brand') + '">' +
            UI.icon(available ? 'eyeOff' : 'eye', 'h-3.5 w-3.5') +
            UI.escapeHtml(t(available ? 'admin.action.hide' : 'admin.action.show')) +
            '</button>' +
            '</div>' +
            '</div>' +
            '</article>'
        );
    }

    function renderMenuAdmin() {
        if (!dom['menu-admin-grid']) return;
        var items = (State.get('menu', []) || []).slice();

        // Group by category order, mirroring the storefront.
        var order = {};
        Bistro.Seed.categories.forEach(function (category, index) {
            order[category.key] = category.order || index;
        });
        items.sort(function (a, b) {
            var ca = order[a.category] === undefined ? 99 : order[a.category];
            var cb = order[b.category] === undefined ? 99 : order[b.category];
            if (ca !== cb) return ca - cb;
            return String(a.name).localeCompare(String(b.name));
        });

        dom['menu-admin-grid'].innerHTML = items.map(menuAdminCard).join('');
        toggle(dom['menu-admin-empty'], items.length === 0);
    }

    /* ==================================================================== *
     * Settings
     * ==================================================================== */

    function renderSettings() {
        if (dom['settings-mode']) {
            dom['settings-mode'].textContent = t(API.isRemote() ? 'admin.modeRemote' : 'admin.modeLocal');
        }
        if (dom['mode-badge']) {
            dom['mode-badge'].textContent = t(API.isRemote() ? 'admin.modeRemote' : 'admin.modeLocal');
        }
        if (dom['settings-backend']) {
            dom['settings-backend'].textContent = API.isRemote()
                ? String(CONFIG.get('backend.supabase.url', '')).replace(/^https?:\/\//, '')
                : 'localStorage';
        }
        if (dom['settings-features']) {
            dom['settings-features'].innerHTML = Object.keys(CONFIG.features)
                .filter(function (key) {
                    return CONFIG.features[key];
                })
                .map(function (key) {
                    return '<li class="glass rounded-full px-2.5 py-1 font-medium">' + UI.escapeHtml(key) + '</li>';
                })
                .join('');
        }
    }

    /* ==================================================================== *
     * Actions
     * ==================================================================== */

    function applyStatusUpdate(promise, successKey) {
        return promise
            .then(function () {
                UI.toast(t(successKey), { tone: 'success' });
            })
            .catch(function (err) {
                console.error('[Bistro:admin] Update failed.', err);
                UI.toast(t('common.error'), { tone: 'error' });
            });
    }

    function bindEvents() {
        if (dom['gate-form']) dom['gate-form'].addEventListener('submit', submitGate);

        if (dom['admin-logout']) {
            dom['admin-logout'].addEventListener('click', function () {
                revokeSession();
                showGate();
            });
        }

        if (dom['admin-refresh']) {
            dom['admin-refresh'].addEventListener('click', function () {
                API.refresh()
                    .then(function () {
                        renderAll();
                        UI.toast(t('admin.refreshDone'), { tone: 'info' });
                    })
                    .catch(function (err) {
                        console.error('[Bistro:admin] Refresh failed.', err);
                        UI.toast(t('common.error'), { tone: 'error' });
                    });
            });
        }

        if (dom['admin-theme-toggle']) {
            dom['admin-theme-toggle'].addEventListener('click', function () {
                UI.toggleTheme();
            });
        }

        if (dom['admin-tabs']) {
            UI.on(dom['admin-tabs'], 'click', '[data-tab]', function (event, button) {
                activeTab = button.getAttribute('data-tab');
                renderTabs();
            });
        }

        if (dom['panel-orders']) {
            UI.on(dom['panel-orders'], 'click', '[data-advance]', function (event, button) {
                var id = button.getAttribute('data-advance');
                var order = (State.get('orders', []) || []).filter(function (row) {
                    return row.id === id;
                })[0];
                if (!order) return;
                var next = nextStatus(order.status);
                if (!next) return;
                applyStatusUpdate(API.updateOrderStatus(id, next), 'admin.statusChanged');
            });

            UI.on(dom['panel-orders'], 'click', '[data-cancel-order]', function (event, button) {
                applyStatusUpdate(
                    API.updateOrderStatus(button.getAttribute('data-cancel-order'), 'cancelled'),
                    'admin.statusChanged'
                );
            });
        }

        if (dom['panel-reservations']) {
            UI.on(dom['panel-reservations'], 'click', '[data-approve]', function (event, button) {
                applyStatusUpdate(
                    API.updateReservationStatus(button.getAttribute('data-approve'), 'confirmed'),
                    'admin.statusChanged'
                );
            });

            UI.on(dom['panel-reservations'], 'click', '[data-reject]', function (event, button) {
                applyStatusUpdate(
                    API.updateReservationStatus(button.getAttribute('data-reject'), 'cancelled'),
                    'admin.statusChanged'
                );
            });
        }

        if (dom['menu-admin-grid']) {
            UI.on(dom['menu-admin-grid'], 'click', '[data-toggle-item]', function (event, button) {
                var id = button.getAttribute('data-toggle-item');
                var available = button.getAttribute('data-available') === '1';
                API.setMenuAvailability(id, available)
                    .then(function () {
                        UI.toast(t('admin.statusChanged'), { tone: 'success' });
                    })
                    .catch(function (err) {
                        console.error('[Bistro:admin] Availability update failed.', err);
                        UI.toast(t('common.error'), { tone: 'error' });
                    });
            });
        }

        if (dom['settings-reset']) {
            dom['settings-reset'].addEventListener('click', function () {
                if (!global.confirm(t('admin.action.resetConfirm'))) return;
                API.resetDemoData()
                    .then(function () {
                        renderAll();
                        UI.toast(t('admin.resetDone'), { tone: 'success' });
                    })
                    .catch(function (err) {
                        console.error('[Bistro:admin] Reset failed.', err);
                        UI.toast(t('common.error'), { tone: 'error' });
                    });
            });
        }

        // Live updates from the storefront (BroadcastChannel / storage / poll).
        State.subscribe(function (snapshot, meta) {
            if (!dom['admin-app'] || dom['admin-app'].classList.contains('hidden')) return;
            renderAll();
        });

        I18N.onLanguageChange(function () {
            if (!dom['admin-app'] || dom['admin-app'].classList.contains('hidden')) return;
            renderAll();
        });
    }

    /* ==================================================================== *
     * Boot
     * ==================================================================== */

    function buildLanguageSelect() {
        if (!dom['admin-lang']) return;
        dom['admin-lang'].innerHTML = I18N.languages()
            .map(function (language) {
                return (
                    '<option value="' + UI.attr(language.code) + '">' +
                    UI.escapeHtml(language.native) + '</option>'
                );
            })
            .join('');
        dom['admin-lang'].value = I18N.currentLanguage();
        dom['admin-lang'].addEventListener('change', function () {
            I18N.setLanguage(dom['admin-lang'].value);
        });
    }

    function renderAll() {
        renderTabs();
        renderStats();
        renderOrders();
        renderReservations();
        renderMenuAdmin();
        renderSettings();
    }

    function init() {
        cacheElements();
        UI.applyBrand();
        injectIcons();

        var theme = State.get('theme') || UI.storedTheme() || CONFIG.theme.default;
        State.patch({ theme: theme }, { silent: true });
        UI.applyTheme(theme);

        buildLanguageSelect();

        // Apply the staff member's saved language before the dashboard renders.
        I18N.setLanguage(State.get('lang') || CONFIG.locale.default);

        UI.overlay.bind(document);

        // Surface the demo passcode so a fresh clone is usable — this is a
        // starter kit, not a security boundary. Remove for real deployments.
        var gateEnabled = CONFIG.get('admin.gateEnabled', true) && CONFIG.get('admin.enabled', true);
        if (!gateEnabled) {
            if (dom['admin-gate']) dom['admin-gate'].classList.add('hidden');
            if (dom['admin-app']) dom['admin-app'].classList.remove('hidden');
        } else if (dom['gate-hint'] && CONFIG.get('admin.demoPasscode')) {
            dom['gate-hint'].textContent = t('admin.loginHint', { code: CONFIG.admin.demoPasscode });
            dom['gate-hint'].classList.remove('hidden');
        }

        bindEvents();

        API.init()
            .then(function () {
                if (gateEnabled && !hasSession()) showGate();
                else showApp();
            })
            .catch(function (err) {
                console.error('[Bistro:admin] Could not load data.', err);
                if (gateEnabled && !hasSession()) showGate();
                else showApp();
                UI.toast(t('common.error'), { tone: 'error' });
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window);
