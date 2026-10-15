/**
 * Bistro Starter Kit — cart logic.
 * ---------------------------------------------------------------------------
 * Pure-ish: every mutation writes through `Bistro.State`, so the cart survives
 * reloads and is visible to `admin.html` for abandoned-cart style analytics.
 *
 * Money rules live here and nowhere else — the totals shown in the drawer, in
 * the checkout modal and on the admin receipt all come from `Cart.totals()`.
 * ---------------------------------------------------------------------------
 */
(function (global) {
    'use strict';

    var Bistro = (global.Bistro = global.Bistro || {});
    var CONFIG = Bistro.Config;
    var State = Bistro.State;

    function round(value) {
        return Math.round((value + Number.EPSILON) * 100) / 100;
    }

    function currency() {
        return CONFIG.locale.currencyCode || 'USD';
    }

    function items() {
        return State.get('cart', []) || [];
    }

    function write(next) {
        State.patch({ cart: next });
        return next;
    }

    /** Quantity capped by config; returns the clamped value. */
    function clampQty(qty) {
        var max = CONFIG.get('order.maxItemQty', 20);
        var value = parseInt(qty, 10);
        if (!Number.isFinite(value)) return 1;
        if (value < 0) return 0;
        return Math.min(value, max);
    }

    /**
     * Add a menu item (or bump its quantity).
     * @param {object} menuItem a row from `Bistro.API.listMenu()`
     * @param {number} [qty=1]
     */
    function add(menuItem, qty) {
        if (!menuItem || !menuItem.id) return items();
        var amount = clampQty(qty || 1);
        var current = items();
        var existing = null;

        var next = current.map(function (line) {
            if (line.id !== menuItem.id) return line;
            existing = line;
            return Object.assign({}, line, { qty: clampQty(line.qty + amount) });
        });

        if (!existing) {
            next = next.concat([
                {
                    id: menuItem.id,
                    name: menuItem.name,
                    price: menuItem.price,
                    image: menuItem.image,
                    category: menuItem.category,
                    tags: menuItem.tags || [],
                    qty: amount
                }
            ]);
        }

        return write(next);
    }

    function setQty(id, qty) {
        var amount = clampQty(qty);
        var next = items()
            .map(function (line) {
                return line.id === id ? Object.assign({}, line, { qty: amount }) : line;
            })
            .filter(function (line) {
                return line.qty > 0;
            });
        return write(next);
    }

    function remove(id) {
        return write(
            items().filter(function (line) {
                return line.id !== id;
            })
        );
    }

    function clear() {
        return write([]);
    }

    function count() {
        return items().reduce(function (sum, line) {
            return sum + line.qty;
        }, 0);
    }

    function subtotal() {
        return round(
            items().reduce(function (sum, line) {
                return sum + line.price * line.qty;
            }, 0)
        );
    }

    /* ------------------------------------------------------------------ *
     * Order type / fulfilment
     * ------------------------------------------------------------------ */

    function orderType() {
        return State.get('orderType', 'dine-in');
    }

    function setOrderType(type) {
        if (CONFIG.order.types.indexOf(type) === -1) return orderType();
        State.patch({ orderType: type });
        return type;
    }

    function isValidDelivery() {
        return subtotal() >= CONFIG.get('order.minOrderForDelivery', 0);
    }

    /**
     * Every monetary value the UI needs, in one place.
     * Service charge applies to dine-in; delivery fee to delivery (free above
     * `order.freeDeliveryThreshold`); tax is charged on the post-fee subtotal.
     */
    /**
     * The subset of `totals()` worth persisting with an order.
     * `totals()` also carries UI-only helpers (free-delivery progress, and the
     * thresholds behind it) which have no business in the database row or in the
     * receipt the admin page renders.
     */
    function orderTotals() {
        var all = totals();
        return {
            currency: all.currency,
            itemCount: all.itemCount,
            subtotal: all.subtotal,
            serviceCharge: all.serviceCharge,
            delivery: all.delivery,
            tax: all.tax,
            taxRate: all.taxRate,
            total: all.total
        };
    }

    function totals() {
        var sub = subtotal();
        var type = orderType();
        var taxRate = CONFIG.get('order.taxRate', 0);

        var serviceCharge = type === 'dine-in' ? round(sub * CONFIG.get('order.serviceChargeRate', 0)) : 0;

        var delivery = 0;
        if (type === 'delivery') {
            var threshold = CONFIG.get('order.freeDeliveryThreshold', Infinity);
            delivery = sub >= threshold ? 0 : round(CONFIG.get('order.deliveryFee', 0));
        }

        var taxable = round(sub + serviceCharge + delivery);
        var tax = round(taxable * taxRate);
        var total = round(taxable + tax);

        return {
            currency: currency(),
            itemCount: count(),
            subtotal: sub,
            serviceCharge: serviceCharge,
            delivery: delivery,
            tax: tax,
            taxRate: taxRate,
            total: total,
            freeDeliveryThreshold: CONFIG.get('order.freeDeliveryThreshold', 0),
            minOrderForDelivery: CONFIG.get('order.minOrderForDelivery', 0),
            /** Progress towards free delivery — drives the drawer progress bar. */
            deliveryProgress:
                type === 'delivery'
                    ? Math.min(1, sub / (CONFIG.get('order.freeDeliveryThreshold', 0) || 1))
                    : 0
        };
    }

    /**
     * Client-side gate run before the checkout call. Returns i18n keys, not
     * prose, so the UI stays translatable.
     * @returns {{ok:boolean, errors:string[]}}
     */
    function validate(customer) {
        var errors = [];
        var type = orderType();
        var guest = customer || {};

        if (!items().length) errors.push('cart.empty');
        if (!String(guest.name || '').trim()) errors.push('checkout.validation.name');
        if (!String(guest.phone || '').trim()) errors.push('checkout.validation.phone');

        if (type === 'dine-in' && !String(State.get('tableNumber', '')).trim()) {
            errors.push('checkout.validation.table');
        }
        if (type === 'delivery') {
            if (!String(State.get('deliveryAddress', '')).trim()) {
                errors.push('checkout.validation.address');
            }
            if (!isValidDelivery()) errors.push('checkout.validation.minDelivery');
        }

        return { ok: errors.length === 0, errors: errors };
    }

    /** Snapshot for `Bistro.API.createOrder()`. */
    function toOrder(customer, payment) {
        return {
            type: orderType(),
            tableNumber: State.get('tableNumber', ''),
            customer: Object.assign({}, customer, {
                address: State.get('deliveryAddress', '')
            }),
            items: items().map(function (line) {
                return {
                    id: line.id,
                    name: line.name,
                    price: line.price,
                    qty: line.qty,
                    tags: line.tags || []
                };
            }),
            totals: orderTotals(),
            notes: State.get('orderNotes', ''),
            payment: payment || null
        };
    }

    Bistro.Cart = {
        items: items,
        count: count,
        add: add,
        setQty: setQty,
        remove: remove,
        clear: clear,
        subtotal: subtotal,
        totals: totals,
        orderType: orderType,
        setOrderType: setOrderType,
        setTable: function (table) {
            State.patch({ tableNumber: String(table || '') });
        },
        setAddress: function (address) {
            State.patch({ deliveryAddress: String(address || '') });
        },
        setNotes: function (notes) {
            State.patch({ orderNotes: String(notes || '') });
        },
        isValidDelivery: isValidDelivery,
        validate: validate,
        toOrder: toOrder
    };
})(window);
