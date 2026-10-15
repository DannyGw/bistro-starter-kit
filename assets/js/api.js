/**
 * Bistro Starter Kit — API hooks / backend adapter.
 * ---------------------------------------------------------------------------
 * One interface, two implementations:
 *
 *   local     → browser storage. Zero setup, perfect for demos and white-label
 *               previews. `index.html` and `admin.html` sync over
 *               BroadcastChannel, so the dashboard still feels live.
 *   supabase  → PostgREST over `fetch` (no SDK required). Apply
 *               /supabase/schema.sql, then set backend.provider + credentials
 *               in config.js. Add supabase-js and call
 *               `Bistro.API.attachRealtime()` to replace polling with push.
 *
 * Every method returns a Promise, so swapping the provider never changes a
 * caller.
 * ---------------------------------------------------------------------------
 */
(function (global) {
    'use strict';

    var Bistro = (global.Bistro = global.Bistro || {});
    var CONFIG = Bistro.Config;
    var State = Bistro.State;

    /* ==================================================================== *
     * Helpers
     * ==================================================================== */

    var ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
    var RESERVATION_STATUSES = ['pending', 'confirmed', 'cancelled'];

    /** Errors carry a `code` so the UI can translate them. */
    function ApiError(message, code, details) {
        var err = new Error(message);
        err.name = 'ApiError';
        err.code = code || 'api/unknown';
        err.details = details || null;
        return err;
    }

    function uid(prefix) {
        var rand = Math.random().toString(36).slice(2, 8);
        return (prefix || 'id') + '-' + Date.now().toString(36) + '-' + rand;
    }

    /** Human-facing order/booking reference, e.g. BIS-8F3K2Q. */
    function makeReference(prefix) {
        var alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        var out = '';
        for (var i = 0; i < 6; i += 1) {
            out += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        }
        return (prefix || 'BIS') + '-' + out;
    }

    function wait(ms) {
        return new Promise(function (resolve) {
            global.setTimeout(resolve, ms);
        });
    }

    function nowIso() {
        return new Date().toISOString();
    }

    function num(value, fallback) {
        var parsed = typeof value === 'number' ? value : parseFloat(value);
        return Number.isFinite(parsed) ? parsed : fallback || 0;
    }

    /** Language-aware field resolution: item.translations[lang] wins. */
    function localised(item, lang) {
        var out = Object.assign({}, item);
        var dict =
            item && item.translations && (item.translations[lang] || item.translations[CONFIG.locale.fallback]);
        if (dict) {
            if (dict.name) out.name = dict.name;
            if (dict.description) out.description = dict.description;
        }
        return out;
    }

    /* ==================================================================== *
     * Validation (shared by both adapters)
     * ==================================================================== */

    function assertOrder(order) {
        if (!order || !Array.isArray(order.items) || !order.items.length) {
            throw ApiError('An order needs at least one item.', 'order/empty');
        }
        var type = order.type || 'dine-in';
        if (CONFIG.order.types.indexOf(type) === -1) {
            throw ApiError('Unknown order type: ' + type, 'order/bad-type');
        }
        if (type === 'dine-in' && !String(order.tableNumber || '').trim()) {
            throw ApiError('A table number is required for dine-in orders.', 'order/table-required');
        }
        if (type === 'delivery' && !String((order.customer || {}).address || '').trim()) {
            throw ApiError('A delivery address is required.', 'order/address-required');
        }
        var name = String((order.customer || {}).name || '').trim();
        var phone = String((order.customer || {}).phone || '').trim();
        if (!name) throw ApiError('A name is required.', 'order/name-required');
        if (!phone) throw ApiError('A phone number is required.', 'order/phone-required');
    }

    function assertReservation(booking) {
        var name = String((booking || {}).name || '').trim();
        if (!name) throw ApiError('A name is required.', 'reservation/name-required');
        if (!String((booking || {}).phone || '').trim()) {
            throw ApiError('A phone number is required.', 'reservation/phone-required');
        }
        if (!String((booking || {}).date || '').trim()) {
            throw ApiError('A date is required.', 'reservation/date-required');
        }
        if (!String((booking || {}).time || '').trim()) {
            throw ApiError('A time is required.', 'reservation/time-required');
        }
        var guests = parseInt(booking.guests, 10);
        var min = CONFIG.get('reservations.minPartySize', 1);
        var max = CONFIG.get('reservations.maxPartySize', 12);
        if (!guests || guests < min || guests > max) {
            throw ApiError('Party size must be between ' + min + ' and ' + max + '.', 'reservation/guests');
        }
    }

    /* ==================================================================== *
     * Local adapter — browser storage + BroadcastChannel
     * ==================================================================== */

    var localAdapter = {
        mode: 'local',

        init: function () {
            var seeded = {};

            if (CONFIG.get('demo.resetOnLoad', false)) {
                State.reset({ silent: true });
            }

            if (!State.get('menu') || !State.get('menu').length) {
                if (CONFIG.get('demo.seedMenu', true)) seeded.menu = Bistro.Seed.clone(Bistro.Seed.menu);
            }
            if (!State.get('reviews') || !State.get('reviews').length) {
                if (CONFIG.get('demo.seedReviews', true)) seeded.reviews = Bistro.Seed.clone(Bistro.Seed.reviews);
            }
            if (Object.keys(seeded).length) State.patch(seeded);
            return Promise.resolve();
        },

        listMenu: function (options) {
            var opts = options || {};
            var rows = State.get('menu', []) || [];
            rows = rows.map(function (item) {
                return localised(item, opts.lang || State.get('lang') || CONFIG.locale.default);
            });
            if (!opts.includeUnavailable) {
                rows = rows.filter(function (item) {
                    return item.available !== false;
                });
            }
            return Promise.resolve(sortMenu(rows));
        },

        setMenuAvailability: function (id, available) {
            var rows = State.get('menu', []) || [];
            var found = null;
            var next = rows.map(function (item) {
                if (item.id !== id) return item;
                found = Object.assign({}, item, { available: Boolean(available), updatedAt: nowIso() });
                return found;
            });
            if (!found) throw ApiError('Menu item not found: ' + id, 'menu/not-found');
            State.patch({ menu: next });
            return Promise.resolve(found);
        },

        saveMenuItem: function (item) {
            var rows = State.get('menu', []) || [];
            var exists = rows.some(function (row) {
                return row.id === item.id;
            });
            var next = exists
                ? rows.map(function (row) {
                    return row.id === item.id ? Object.assign({}, row, item, { updatedAt: nowIso() }) : row;
                })
                : rows.concat([Object.assign({}, item, { id: item.id || uid('mn'), updatedAt: nowIso() })]);

            State.patch({ menu: next });
            return Promise.resolve(item);
        },

        createOrder: function (payload) {
            assertOrder(payload);
            var order = Object.assign({}, payload, {
                id: uid('ord'),
                reference: makeReference('BIS'),
                createdAt: nowIso(),
                status: 'pending',
                payment: payload.payment || { gateway: null, status: 'unpaid', reference: null }
            });
            State.patch({ orders: [order].concat(State.get('orders', [])), lastOrder: order });
            return Promise.resolve(order);
        },

        listOrders: function (options) {
            var opts = options || {};
            var rows = (State.get('orders', []) || []).slice();
            if (opts.statuses && opts.statuses.length) {
                rows = rows.filter(function (order) {
                    return opts.statuses.indexOf(order.status) !== -1;
                });
            }
            return Promise.resolve(rows);
        },

        updateOrderStatus: function (id, status) {
            if (ORDER_STATUSES.indexOf(status) === -1) {
                throw ApiError('Unknown order status: ' + status, 'order/bad-status');
            }
            var found = null;
            var next = (State.get('orders', []) || []).map(function (order) {
                if (order.id !== id) return order;
                found = Object.assign({}, order, { status: status, updatedAt: nowIso() });
                return found;
            });
            if (!found) throw ApiError('Order not found: ' + id, 'order/not-found');
            State.patch({ orders: next });
            return Promise.resolve(found);
        },

        createReservation: function (payload) {
            assertReservation(payload);
            var booking = Object.assign({}, payload, {
                id: uid('res'),
                reference: makeReference('TBL'),
                createdAt: nowIso(),
                guests: parseInt(payload.guests, 10),
                status: CONFIG.get('reservations.autoApprove', false) ? 'confirmed' : 'pending'
            });
            State.patch({
                reservations: [booking].concat(State.get('reservations', [])),
                lastReservation: booking
            });
            return Promise.resolve(booking);
        },

        listReservations: function (options) {
            var opts = options || {};
            var rows = (State.get('reservations', []) || []).slice();
            if (opts.todayOnly) {
                var today = new Date().toISOString().slice(0, 10);
                rows = rows.filter(function (booking) {
                    return booking.date === today;
                });
            }
            return Promise.resolve(rows);
        },

        updateReservationStatus: function (id, status) {
            if (RESERVATION_STATUSES.indexOf(status) === -1) {
                throw ApiError('Unknown reservation status: ' + status, 'reservation/bad-status');
            }
            var found = null;
            var next = (State.get('reservations', []) || []).map(function (booking) {
                if (booking.id !== id) return booking;
                found = Object.assign({}, booking, { status: status, updatedAt: nowIso() });
                return found;
            });
            if (!found) throw ApiError('Reservation not found: ' + id, 'reservation/not-found');
            State.patch({ reservations: next });
            return Promise.resolve(found);
        },

        subscribe: function (fn) {
            return State.subscribe(function (snapshot, meta) {
                fn(snapshot, meta);
            });
        },

        resetDemoData: function () {
            State.reset({ silent: true });
            State.patch({
                menu: Bistro.Seed.clone(Bistro.Seed.menu),
                reviews: Bistro.Seed.clone(Bistro.Seed.reviews),
                orders: [],
                reservations: []
            });
            return Promise.resolve();
        },

        attachRealtime: function () {
            // BroadcastChannel already provides push updates locally.
            return true;
        }
    };

    /* ==================================================================== *
     * Supabase adapter — PostgREST over fetch
     * ==================================================================== */

    function supabaseAdapter() {
        var sb = CONFIG.backend.supabase;
        var tables = CONFIG.backend.tables;
        var base = String(sb.url).replace(/\/+$/, '') + '/rest/v1';

        function headers(extra) {
            return Object.assign(
                {
                    apikey: sb.anonKey,
                    Authorization: 'Bearer ' + sb.anonKey,
                    'Content-Type': 'application/json'
                },
                extra || {}
            );
        }

        function request(table, options) {
            var opts = options || {};
            var url = base + '/' + table + (opts.query ? '?' + opts.query : '');
            var init = { method: opts.method || 'GET', headers: headers(opts.headers) };
            if (opts.body !== undefined) init.body = JSON.stringify(opts.body);

            return global.fetch(url, init).then(function (response) {
                if (!response.ok) {
                    return response.text().then(function (text) {
                        throw ApiError(
                            'Supabase ' + response.status + ' on ' + table + ': ' + text.slice(0, 300),
                            'backend/http-' + response.status
                        );
                    });
                }
                if (response.status === 204) return null;
                return response.text().then(function (text) {
                    return text ? JSON.parse(text) : null;
                });
            });
        }

        /* ---- row ⇄ model mapping (see /supabase/schema.sql) ---- */

        function menuFromRow(row) {
            return {
                id: row.id,
                category: row.category,
                name: row.name,
                description: row.description,
                price: num(row.price, 0),
                tags: row.tags || [],
                image: row.image,
                available: row.available !== false,
                featured: Boolean(row.featured),
                prepMinutes: row.prep_minutes || 0,
                rating: num(row.rating, 0),
                reviewCount: row.review_count || 0,
                sortOrder: row.sort_order || 0,
                translations: row.translations || null,
                updatedAt: row.updated_at
            };
        }

        function menuToRow(item) {
            return {
                id: item.id,
                category: item.category,
                name: item.name,
                description: item.description,
                price: item.price,
                tags: item.tags || [],
                image: item.image,
                available: item.available !== false,
                featured: Boolean(item.featured),
                prep_minutes: item.prepMinutes || 0,
                rating: item.rating || null,
                review_count: item.reviewCount || 0,
                sort_order: item.sortOrder || 0,
                translations: item.translations || null
            };
        }

        function orderFromRow(row) {
            return {
                id: row.id,
                reference: row.reference,
                createdAt: row.created_at,
                type: row.type,
                tableNumber: row.table_number,
                customer: row.customer || {},
                items: row.items || [],
                totals: row.totals || {},
                notes: row.notes || '',
                status: row.status,
                payment: row.payment || {}
            };
        }

        function orderToRow(order) {
            return {
                type: order.type,
                table_number: order.tableNumber || null,
                customer: order.customer || {},
                items: order.items || [],
                totals: order.totals || {},
                notes: order.notes || '',
                status: order.status || 'pending',
                payment: order.payment || {}
            };
        }

        function reservationFromRow(row) {
            return {
                id: row.id,
                reference: row.reference,
                createdAt: row.created_at,
                name: row.name,
                phone: row.phone,
                email: row.email,
                date: row.date,
                time: row.time,
                guests: row.guests,
                notes: row.notes || '',
                status: row.status
            };
        }

        function reservationToRow(booking) {
            return {
                name: booking.name,
                phone: booking.phone,
                email: booking.email || null,
                date: booking.date,
                time: booking.time,
                guests: parseInt(booking.guests, 10),
                notes: booking.notes || '',
                status: booking.status || 'pending'
            };
        }

        var pollTimer = null;
        var realtimeClient = null;

        function fetchAll() {
            return Promise.all([
                request(tables.menu, { query: 'select=*&order=sort_order.asc' }),
                request(tables.orders, { query: 'select=*&order=created_at.desc&limit=200' }),
                request(tables.reservations, { query: 'select=*&order=created_at.desc&limit=200' })
            ]).then(function (results) {
                var menu = (results[0] || []).map(menuFromRow);
                var orders = (results[1] || []).map(orderFromRow);
                var reservations = (results[2] || []).map(reservationFromRow);
                return { menu: menu, orders: orders, reservations: reservations };
            });
        }

        function refresh() {
            return fetchAll().then(function (data) {
                State.patch({
                    menu: data.menu,
                    orders: data.orders,
                    reservations: data.reservations,
                    ready: true,
                    error: null
                });
            });
        }

        return {
            mode: 'supabase',

            init: function () {
                return refresh().catch(function (err) {
                    State.patch({
                        ready: true,
                        error: { message: err.message, code: err.code || 'backend/init' }
                    });
                    throw err;
                });
            },

            listMenu: function (options) {
                var opts = options || {};
                return request(tables.menu, { query: 'select=*&order=sort_order.asc' }).then(function (rows) {
                    var menu = (rows || []).map(menuFromRow).map(function (item) {
                        return localised(item, opts.lang || State.get('lang') || CONFIG.locale.default);
                    });
                    if (!opts.includeUnavailable) {
                        menu = menu.filter(function (item) {
                            return item.available !== false;
                        });
                    }
                    return sortMenu(menu);
                });
            },

            setMenuAvailability: function (id, available) {
                return request(tables.menu, {
                    method: 'PATCH',
                    query: 'id=eq.' + encodeURIComponent(id),
                    headers: { Prefer: 'return=representation' },
                    body: { available: Boolean(available), updated_at: nowIso() }
                }).then(function (rows) {
                    var item = rows && rows[0] ? menuFromRow(rows[0]) : null;
                    if (item) {
                        State.patch({
                            menu: (State.get('menu', []) || []).map(function (row) {
                                return row.id === item.id ? item : row;
                            })
                        });
                    }
                    return item;
                });
            },

            saveMenuItem: function (item) {
                return request(tables.menu, {
                    method: 'POST',
                    query: 'on_conflict=id',
                    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
                    body: menuToRow(item)
                }).then(function (rows) {
                    return rows && rows[0] ? menuFromRow(rows[0]) : item;
                });
            },

            createOrder: function (payload) {
                assertOrder(payload);
                var row = orderToRow(Object.assign({}, payload, { status: 'pending' }));
                row.reference = makeReference('BIS');
                return request(tables.orders, {
                    method: 'POST',
                    headers: { Prefer: 'return=representation' },
                    body: row
                }).then(function (rows) {
                    var order = rows && rows[0] ? orderFromRow(rows[0]) : null;
                    if (order) State.patch({ lastOrder: order });
                    return order;
                });
            },

            listOrders: function (options) {
                var opts = options || {};
                var query = 'select=*&order=created_at.desc&limit=200';
                if (opts.statuses && opts.statuses.length) {
                    query += '&status=in.(' + opts.statuses.join(',') + ')';
                }
                return request(tables.orders, { query: query }).then(function (rows) {
                    return (rows || []).map(orderFromRow);
                });
            },

            updateOrderStatus: function (id, status) {
                if (ORDER_STATUSES.indexOf(status) === -1) {
                    throw ApiError('Unknown order status: ' + status, 'order/bad-status');
                }
                return request(tables.orders, {
                    method: 'PATCH',
                    query: 'id=eq.' + encodeURIComponent(id),
                    headers: { Prefer: 'return=representation' },
                    body: { status: status, updated_at: nowIso() }
                }).then(function (rows) {
                    var order = rows && rows[0] ? orderFromRow(rows[0]) : null;
                    if (order) {
                        State.patch({
                            orders: (State.get('orders', []) || []).map(function (row) {
                                return row.id === order.id ? order : row;
                            })
                        });
                    }
                    return order;
                });
            },

            createReservation: function (payload) {
                assertReservation(payload);
                var row = reservationToRow(
                    Object.assign({}, payload, {
                        status: CONFIG.get('reservations.autoApprove', false) ? 'confirmed' : 'pending'
                    })
                );
                row.reference = makeReference('TBL');
                return request(tables.reservations, {
                    method: 'POST',
                    headers: { Prefer: 'return=representation' },
                    body: row
                }).then(function (rows) {
                    var booking = rows && rows[0] ? reservationFromRow(rows[0]) : null;
                    if (booking) State.patch({ lastReservation: booking });
                    return booking;
                });
            },

            listReservations: function (options) {
                var opts = options || {};
                var query = 'select=*&order=created_at.desc&limit=200';
                if (opts.todayOnly) {
                    query += '&date=eq.' + new Date().toISOString().slice(0, 10);
                }
                return request(tables.reservations, { query: query }).then(function (rows) {
                    return (rows || []).map(reservationFromRow);
                });
            },

            updateReservationStatus: function (id, status) {
                if (RESERVATION_STATUSES.indexOf(status) === -1) {
                    throw ApiError('Unknown reservation status: ' + status, 'reservation/bad-status');
                }
                return request(tables.reservations, {
                    method: 'PATCH',
                    query: 'id=eq.' + encodeURIComponent(id),
                    headers: { Prefer: 'return=representation' },
                    body: { status: status, updated_at: nowIso() }
                }).then(function (rows) {
                    var booking = rows && rows[0] ? reservationFromRow(rows[0]) : null;
                    if (booking) {
                        State.patch({
                            reservations: (State.get('reservations', []) || []).map(function (row) {
                                return row.id === booking.id ? booking : row;
                            })
                        });
                    }
                    return booking;
                });
            },

            subscribe: function (fn) {
                if (pollTimer) global.clearInterval(pollTimer);
                pollTimer = global.setInterval(function () {
                    fetchAll()
                        .then(function (data) {
                            fn(data, { source: 'poll', changed: ['menu', 'orders', 'reservations'] });
                        })
                        .catch(function (err) {
                            console.warn('[Bistro.API] Poll failed.', err);
                        });
                }, CONFIG.get('backend.pollIntervalMs', 8000));
                return function () {
                    global.clearInterval(pollTimer);
                    pollTimer = null;
                };
            },

            resetDemoData: function () {
                // Destructive demo action — local mode only.
                return Promise.reject(
                    ApiError('Reset is disabled when a real backend is configured.', 'backend/reset-disabled')
                );
            },

            /**
             * Optional: upgrade polling to push updates using supabase-js.
             *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
             *   Bistro.API.attachRealtime();
             */
            attachRealtime: function () {
                if (!global.supabase || typeof global.supabase.createClient !== 'function') return false;
                try {
                    realtimeClient =
                        realtimeClient || global.supabase.createClient(sb.url, sb.anonKey, { schema: sb.schema });
                    ['orders', 'reservations', 'menu_items'].forEach(function (table) {
                        realtimeClient
                            .channel('bistro:' + table)
                            .on('postgres_changes', { event: '*', schema: sb.schema, table: table }, function () {
                                refresh().catch(function () { });
                            })
                            .subscribe();
                    });
                    return true;
                } catch (err) {
                    console.warn('[Bistro.API] Realtime unavailable, staying on polling.', err);
                    return false;
                }
            },

            /** Exposed so the admin page can force a refresh. */
            refresh: refresh
        };
    }

    /* ==================================================================== *
     * Shared sorting
     * ==================================================================== */

    function sortMenu(items) {
        var order = {};
        Bistro.Seed.categories.forEach(function (category, index) {
            order[category.key] = category.order || index;
        });
        return items.slice().sort(function (a, b) {
            var ca = order[a.category] === undefined ? 99 : order[a.category];
            var cb = order[b.category] === undefined ? 99 : order[b.category];
            if (ca !== cb) return ca - cb;
            return String(a.name).localeCompare(String(b.name));
        });
    }

    /* ==================================================================== *
     * Facade
     * ==================================================================== */

    var adapter = CONFIG.isBackendConfigured() ? supabaseAdapter() : localAdapter;

    Bistro.API = {
        ORDER_STATUSES: ORDER_STATUSES,
        RESERVATION_STATUSES: RESERVATION_STATUSES,
        mode: function () {
            return adapter.mode;
        },
        isRemote: function () {
            return adapter.mode === 'supabase';
        },
        init: function () {
            return adapter.init();
        },
        listMenu: function (options) {
            return adapter.listMenu(options);
        },
        setMenuAvailability: function (id, available) {
            return adapter.setMenuAvailability(id, available);
        },
        saveMenuItem: function (item) {
            return adapter.saveMenuItem(item);
        },
        createOrder: function (order) {
            return adapter.createOrder(order);
        },
        listOrders: function (options) {
            return adapter.listOrders(options);
        },
        updateOrderStatus: function (id, status) {
            return adapter.updateOrderStatus(id, status);
        },
        createReservation: function (booking) {
            return adapter.createReservation(booking);
        },
        listReservations: function (options) {
            return adapter.listReservations(options);
        },
        updateReservationStatus: function (id, status) {
            return adapter.updateReservationStatus(id, status);
        },
        subscribe: function (fn) {
            return adapter.subscribe(fn);
        },
        resetDemoData: function () {
            return adapter.resetDemoData();
        },
        attachRealtime: function () {
            return adapter.attachRealtime();
        },
        refresh: function () {
            return typeof adapter.refresh === 'function' ? adapter.refresh() : Promise.resolve();
        },

        /* Utilities other modules reuse. */
        uid: uid,
        makeReference: makeReference,
        ApiError: ApiError,
        wait: wait
    };
})(window);
