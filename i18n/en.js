/**
 * Bistro Starter Kit — English dictionary (source of truth).
 * ---------------------------------------------------------------------------
 * Add a key here first, then mirror it into fr.js / am.js / es.js.
 * Missing keys fall back to this file, then to the raw key (with a console
 * warning in development).
 * ---------------------------------------------------------------------------
 */
window.BistroI18N = window.BistroI18N || {};

window.BistroI18N.en = {
    meta: {
        title: 'Bistro — Modern dining, served beautifully',
        description: 'Seasonal plates, natural wine and a room built for long dinners.'
    },

    nav: {
        home: 'Home',
        menu: 'Menu',
        reservations: 'Reservations',
        gallery: 'Ambiance',
        reviews: 'Reviews',
        about: 'About',
        contact: 'Contact',
        order: 'Order now',
        admin: 'Staff dashboard',
        openMenu: 'Open navigation',
        closeMenu: 'Close navigation'
    },

    hero: {
        badge: 'Open today · 11:00 – 22:30',
        title: 'Modern dining,',
        titleAccent: 'served beautifully.',
        subtitle:
            'Seasonal plates, natural wine and a room built for long dinners. Order straight to your table, or book ahead and let us handle the rest.',
        ctaPrimary: 'Explore the menu',
        ctaSecondary: 'Book a table',
        statDishes: 'Seasonal dishes',
        statRating: 'Average rating',
        statTables: 'Tables served today'
    },

    menu: {
        title: 'Our menu',
        subtitle: 'Small plates to share, generous mains, and puddings worth staying for.',
        searchPlaceholder: 'Search dishes, ingredients…',
        searchLabel: 'Search the menu',
        filterLabel: 'Dietary filters',
        all: 'All',
        sortLabel: 'Sort',
        sortPopular: 'Most popular',
        sortPriceLow: 'Price: low to high',
        sortPriceHigh: 'Price: high to low',
        sortName: 'Name (A–Z)',
        empty: 'Nothing matches those filters.',
        emptyHint: 'Try clearing the search box or removing a dietary filter.',
        clearFilters: 'Clear filters',
        addToCart: 'Add',
        added: '{name} added to your order',
        soldOut: 'Sold out',
        featured: 'Chef’s pick',
        prep: '{minutes} min prep',
        ratingSummary: '{rating} · {count} reviews',
        results: '{count} dishes',
        loading: 'Loading the menu…'
    },

    tag: {
        vegetarian: 'Vegetarian',
        vegan: 'Vegan',
        glutenFree: 'Gluten-free',
        spicy: 'Spicy'
    },

    cat: {
        starters: 'Starters',
        mains: 'Mains',
        desserts: 'Desserts',
        drinks: 'Drinks'
    },

    cart: {
        title: 'Your order',
        open: 'Open your order',
        empty: 'Your order is empty',
        emptyHint: 'Add a few dishes and they will show up here.',
        browse: 'Browse the menu',
        subtotal: 'Subtotal',
        serviceCharge: 'Service (dine-in)',
        delivery: 'Delivery',
        tax: 'Tax',
        total: 'Total',
        checkout: 'Go to checkout',
        clear: 'Clear',
        remove: 'Remove {name}',
        decrease: 'Decrease quantity of {name}',
        increase: 'Increase quantity of {name}',
        items: '{count} items',
        free: 'free',
        freeDeliveryProgress: 'Spend {amount} more for free delivery',
        freeDeliveryReached: 'Free delivery unlocked',
        minDelivery: 'Minimum {amount} for delivery'
    },

    orderType: {
        label: 'How would you like it?',
        dineIn: 'Dine in',
        takeaway: 'Takeaway',
        delivery: 'Delivery',
        tableLabel: 'Table number',
        tablePlaceholder: 'e.g. 7',
        addressLabel: 'Delivery address',
        addressPlaceholder: 'Street, building, apartment',
        notesLabel: 'Notes for the kitchen',
        notesPlaceholder: 'Allergies, no onions, extra napkins…'
    },

    checkout: {
        title: 'Checkout',
        subtitle: 'We will confirm by phone within a few minutes.',
        nameLabel: 'Full name',
        namePlaceholder: 'Jane Doe',
        phoneLabel: 'Phone',
        phonePlaceholder: '+1 555 010 2030',
        emailLabel: 'Email (optional)',
        emailPlaceholder: 'jane@example.com',
        paymentLabel: 'Payment method',
        placeOrder: 'Place order · {total}',
        processing: 'Processing…',
        simulatedNotice:
            'Demo mode: no gateway credentials are configured in config.js, so this payment is simulated.',
        successTitle: 'Order confirmed',
        successBody: 'Thank you! Your order is with the kitchen. Keep your reference handy.',
        reference: 'Reference',
        newOrder: 'Start a new order',
        validation: {
            name: 'Please enter your name.',
            phone: 'Please enter a phone number.',
            table: 'Please choose a table for dine-in.',
            address: 'Please enter a delivery address.',
            minDelivery: 'Your order is below the delivery minimum.',
            empty: 'Add at least one dish first.'
        }
    },

    res: {
        title: 'Book a table',
        subtitle: 'Tell us when, and we will hold a table for you.',
        nameLabel: 'Full name',
        namePlaceholder: 'Jane Doe',
        phoneLabel: 'Phone',
        phonePlaceholder: '+1 555 010 2030',
        emailLabel: 'Email (optional)',
        dateLabel: 'Date',
        timeLabel: 'Time',
        guestsLabel: 'Guests',
        guestsOption: '{count} guests',
        notesLabel: 'Special requests',
        notesPlaceholder: 'Birthday, window table, high chair…',
        submit: 'Request booking',
        submitting: 'Sending request…',
        successTitle: 'Table requested',
        successBody: 'We have your request and will confirm shortly.',
        reference: 'Booking reference',
        pendingNotice: 'Our team confirms every booking before it is final.',
        policy: 'Tables are held for 15 minutes past the booking time.',
        validation: {
            name: 'Please enter your name.',
            phone: 'Please enter a phone number.',
            date: 'Please choose a valid future date.',
            time: 'Please choose a time.',
            guests: 'Please choose a party size.',
            timeWindow: 'We are open {open} – {close}.'
        }
    },

    reviews: {
        title: 'What guests say',
        subtitle: 'Unedited reviews from recent tables.',
        verified: 'Verified visit'
    },

    gallery: {
        title: 'The room',
        subtitle: 'A quick look around before you arrive.',
        caption: 'View {n}'
    },

    qr: {
        title: 'Order from your table',
        subtitle: 'Scan the code on your table, or generate one for any table in the room.',
        tableLabel: 'Table',
        generate: 'Show code',
        download: 'Download PNG',
        open: 'Open link',
        hint: 'Print these and drop one on each table — guests scan and order instantly.',
        unavailable: 'QR library unavailable offline — the link below still works.',
        scanHint: 'Scanning opens this menu with table {table} pre-selected.'
    },

    about: {
        title: 'About us',
        body:
            'We cook whatever the market gives us that morning. Everything is made in-house — from the bread to the sorbets — and the wine list leans natural.'
    },

    contact: {
        title: 'Visit us',
        hours: 'Opening hours',
        phone: 'Phone',
        email: 'Email',
        address: 'Address',
        follow: 'Follow us'
    },

    footer: {
        rights: 'All rights reserved.',
        builtWith: 'Built with the Bistro Starter Kit.',
        admin: 'Staff dashboard',
        demo: 'Demo data — nothing is charged.'
    },

    common: {
        loading: 'Loading…',
        close: 'Close',
        cancel: 'Cancel',
        confirm: 'Confirm',
        save: 'Save',
        saving: 'Saving…',
        saved: 'Saved',
        error: 'Something went wrong. Please try again.',
        retry: 'Retry',
        language: 'Language',
        theme: 'Switch theme',
        light: 'Light',
        dark: 'Dark',
        active: 'Active',
        hidden: 'Hidden',
        search: 'Search',
        optional: 'optional',
        required: 'required',
        openNow: 'Open now',
        closedNow: 'Closed',
        skipToContent: 'Skip to content'
    },

    admin: {
        title: 'Staff dashboard',
        subtitle: 'Live orders, bookings and menu availability.',
        loginTitle: 'Staff sign-in',
        loginSubtitle: 'This is a demo gate — replace it with real auth before launch.',
        passcodeLabel: 'Passcode',
        passcodePlaceholder: '••••••••',
        login: 'Sign in',
        loginError: 'That passcode is not right.',
        loginHint: 'Demo passcode: {code}',
        logout: 'Sign out',
        mode: 'Data source',
        modeLocal: 'Browser storage',
        modeRemote: 'Supabase',
        tabs: {
            orders: 'Orders',
            reservations: 'Bookings',
            menu: 'Menu',
            settings: 'Settings'
        },
        stats: {
            orders: 'Orders',
            revenue: 'Revenue',
            reservations: 'Bookings',
            pending: 'Awaiting action'
        },
        empty: {
            orders: 'No orders yet. Place one from the storefront.',
            reservations: 'No bookings yet.',
            menu: 'No menu items found.'
        },
        table: {
            reference: 'Reference',
            placed: 'Placed',
            type: 'Type',
            details: 'Details',
            total: 'Total',
            status: 'Status',
            actions: 'Actions',
            guest: 'Guest',
            item: 'Item',
            price: 'Price',
            qty: 'Qty',
            available: 'Availability',
            booking: 'Booking'
        },
        status: {
            pending: 'Pending',
            confirmed: 'Confirmed',
            preparing: 'Preparing',
            ready: 'Ready',
            completed: 'Completed',
            cancelled: 'Cancelled'
        },
        action: {
            advance: 'Advance',
            complete: 'Complete',
            cancel: 'Cancel',
            approve: 'Approve',
            reject: 'Reject',
            show: 'Show',
            hide: 'Hide',
            reset: 'Reset demo data',
            resetConfirm: 'Delete all local orders, bookings and menu edits?',
            refresh: 'Refresh'
        },
        settings: {
            title: 'Settings',
            brand: 'Brand',
            config: 'Configuration',
            backend: 'Backend',
            features: 'Enabled features',
            dangerZone: 'Danger zone',
            resetHint: 'Wipes browser storage and re-seeds the demo menu.',
            updated: 'Updated {when}'
        },
        resetDone: 'Demo data reset.',
        statusChanged: 'Status updated.',
        refreshDone: 'Refreshed.'
    }
};
