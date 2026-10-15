/**
 * Bistro Starter Kit — demo seed data.
 * ---------------------------------------------------------------------------
 * Used by the `local` backend adapter to populate an empty browser store, and
 * by `Bistro.API.resetDemoData()`.
 *
 * In production these rows live in your CMS/Supabase tables (see
 * /supabase/schema.sql). Dish names are proper nouns and stay untranslated;
 * descriptions here are English source strings — a real deployment stores one
 * row per language (or a `translations` JSONB column) and reads them via
 * `Bistro.API.listMenu(lang)`.
 * ---------------------------------------------------------------------------
 */
(function (global) {
    'use strict';

    var Bistro = (global.Bistro = global.Bistro || {});

    /** Category keys map 1:1 onto the `cat.*` i18n keys. */
    var CATEGORIES = [
        { key: 'starters', image: 'assets/images/dish-starter.svg', order: 1 },
        { key: 'mains', image: 'assets/images/dish-main.svg', order: 2 },
        { key: 'desserts', image: 'assets/images/dish-dessert.svg', order: 3 },
        { key: 'drinks', image: 'assets/images/dish-drink.svg', order: 4 }
    ];

    /**
     * Dietary tag keys map 1:1 onto the `tag.*` i18n keys.
     * @type {Array<{key:string,icon:string,color:string}>}
     */
    var TAGS = [
        { key: 'vegetarian', icon: '🌱', color: 'emerald' },
        { key: 'vegan', icon: '🥬', color: 'lime' },
        { key: 'glutenFree', icon: '🌾', color: 'amber' },
        { key: 'spicy', icon: '🌶️', color: 'rose' }
    ];

    var MENU = [
        /* ---------------------------------- starters ------------------------- */
        {
            id: 'st-01',
            category: 'starters',
            name: 'Burrata & Heirloom Tomato',
            description:
                'Creamy Puglian burrata, sun-ripened heirloom tomatoes, basil oil and 12-year balsamic.',
            price: 14.5,
            tags: ['vegetarian', 'glutenFree'],
            image: 'assets/images/dish-starter.svg',
            available: true,
            featured: false,
            prepMinutes: 8,
            rating: 4.8,
            reviewCount: 126
        },
        {
            id: 'st-02',
            category: 'starters',
            name: 'Crispy Calamari',
            description: 'Semolina-dusted squid, preserved lemon aioli, Aleppo chilli.',
            price: 15.0,
            tags: ['spicy'],
            image: 'assets/images/dish-starter.svg',
            available: true,
            featured: false,
            prepMinutes: 11,
            rating: 4.6,
            reviewCount: 94
        },
        {
            id: 'st-03',
            category: 'starters',
            name: 'Roasted Beet Carpaccio',
            description: 'Candy beetroot, blood orange, toasted pistachio, sherry vinaigrette.',
            price: 12.0,
            tags: ['vegan', 'glutenFree'],
            image: 'assets/images/dish-starter.svg',
            available: true,
            featured: false,
            prepMinutes: 9,
            rating: 4.7,
            reviewCount: 61
        },
        {
            id: 'st-04',
            category: 'starters',
            name: 'Spiced Red Lentil Soup',
            description: 'Slow-simmered lentils, berbere, cumin butter, warm flatbread.',
            price: 9.5,
            tags: ['vegetarian', 'spicy'],
            image: 'assets/images/dish-starter.svg',
            available: true,
            featured: false,
            prepMinutes: 7,
            rating: 4.9,
            reviewCount: 203
        },

        /* ------------------------------------ mains -------------------------- */
        {
            id: 'mn-01',
            category: 'mains',
            name: 'Dry-Aged Ribeye 300g',
            description:
                '35-day dry-aged ribeye, bone-marrow butter, triple-cooked chips, watercress.',
            price: 38.0,
            tags: ['glutenFree'],
            image: 'assets/images/dish-main.svg',
            available: true,
            featured: true,
            prepMinutes: 24,
            rating: 4.9,
            reviewCount: 311
        },
        {
            id: 'mn-02',
            category: 'mains',
            name: 'Pan-Seared Sea Bass',
            description: 'Line-caught bass, shaved fennel, saffron beurre blanc, sea herbs.',
            price: 29.0,
            tags: ['glutenFree'],
            image: 'assets/images/dish-main.svg',
            available: true,
            featured: false,
            prepMinutes: 20,
            rating: 4.7,
            reviewCount: 142
        },
        {
            id: 'mn-03',
            category: 'mains',
            name: 'Doro Wat Tagine',
            description:
                'Free-range chicken braised in berbere and aged butter, soft egg, house injera.',
            price: 24.0,
            tags: ['spicy', 'glutenFree'],
            image: 'assets/images/dish-main.svg',
            available: true,
            featured: true,
            prepMinutes: 26,
            rating: 4.9,
            reviewCount: 268
        },
        {
            id: 'mn-04',
            category: 'mains',
            name: 'Wild Mushroom Risotto',
            description: 'Carnaroli rice, porcini and girolle, aged parmesan, truffle oil.',
            price: 22.0,
            tags: ['vegetarian', 'glutenFree'],
            image: 'assets/images/dish-main.svg',
            available: true,
            featured: false,
            prepMinutes: 22,
            rating: 4.8,
            reviewCount: 175
        },
        {
            id: 'mn-05',
            category: 'mains',
            name: 'Harissa Lamb Shank',
            description: 'Twelve-hour braised shank, rose harissa, apricot couscous, mint.',
            price: 32.0,
            tags: ['spicy'],
            image: 'assets/images/dish-main.svg',
            available: true,
            featured: false,
            prepMinutes: 25,
            rating: 4.8,
            reviewCount: 158
        },

        /* --------------------------------- desserts -------------------------- */
        {
            id: 'ds-01',
            category: 'desserts',
            name: 'Dark Chocolate Fondant',
            description: '70% Valrhona fondant, molten centre, salted vanilla ice cream.',
            price: 12.0,
            tags: ['vegetarian'],
            image: 'assets/images/dish-dessert.svg',
            available: true,
            featured: true,
            prepMinutes: 14,
            rating: 4.9,
            reviewCount: 289
        },
        {
            id: 'ds-02',
            category: 'desserts',
            name: 'Pistachio Baklava Cheesecake',
            description: 'Baked cheesecake, layered filo, pistachio, orange-blossom honey.',
            price: 11.0,
            tags: ['vegetarian'],
            image: 'assets/images/dish-dessert.svg',
            available: true,
            featured: false,
            prepMinutes: 10,
            rating: 4.7,
            reviewCount: 117
        },
        {
            id: 'ds-03',
            category: 'desserts',
            name: 'Mango Sorbet Trio',
            description: 'Alphonso mango, lime and mint sorbets, coconut tuile.',
            price: 9.0,
            tags: ['vegan', 'glutenFree'],
            image: 'assets/images/dish-dessert.svg',
            available: true,
            featured: false,
            prepMinutes: 6,
            rating: 4.6,
            reviewCount: 88
        },

        /* ----------------------------------- drinks -------------------------- */
        {
            id: 'dr-01',
            category: 'drinks',
            name: 'Yirgacheffe Pour Over',
            description: 'Single-origin Ethiopian beans, hand poured, notes of jasmine and citrus.',
            price: 6.5,
            tags: ['vegan', 'glutenFree'],
            image: 'assets/images/dish-drink.svg',
            available: true,
            featured: false,
            prepMinutes: 6,
            rating: 4.9,
            reviewCount: 231
        },
        {
            id: 'dr-02',
            category: 'drinks',
            name: 'Hibiscus Spritz',
            description: 'Cold-steeped hibiscus, citrus, sparkling water. Zero alcohol.',
            price: 8.0,
            tags: ['vegan', 'glutenFree'],
            image: 'assets/images/dish-drink.svg',
            available: true,
            featured: false,
            prepMinutes: 4,
            rating: 4.7,
            reviewCount: 96
        },
        {
            id: 'dr-03',
            category: 'drinks',
            name: 'Barrel-Aged Old Fashioned',
            description: 'Bourbon rested in oak, bitters, orange oil, single ice sphere.',
            price: 14.0,
            tags: [],
            image: 'assets/images/dish-drink.svg',
            available: true,
            featured: false,
            prepMinutes: 5,
            rating: 4.8,
            reviewCount: 143
        },
        {
            id: 'dr-04',
            category: 'drinks',
            name: 'Fresh Mint Lemonade',
            description: 'Pressed lemons, garden mint, lightly sparkling, served long.',
            price: 7.0,
            tags: ['vegan', 'glutenFree'],
            image: 'assets/images/dish-drink.svg',
            available: true,
            featured: false,
            prepMinutes: 4,
            rating: 4.6,
            reviewCount: 74
        }
    ];

    /** Guest testimonials for the reviews section. */
    var REVIEWS = [
        {
            id: 'rv-01',
            author: 'Amelia R.',
            role: 'Table 7 · Anniversary',
            rating: 5,
            text:
                'The Doro Wat was the best thing I have eaten all year. Service was warm without ever hovering.',
            date: '2026-08-14'
        },
        {
            id: 'rv-02',
            author: 'Tobias L.',
            role: 'Takeaway',
            rating: 5,
            text:
                'Ordered on my phone while walking over and it was boxed and ready the moment I arrived. Faultless.',
            date: '2026-08-02'
        },
        {
            id: 'rv-03',
            author: 'Hanna G.',
            role: 'Table 3 · Business lunch',
            rating: 4,
            text:
                'Beautiful room, generous portions and the risotto is genuinely restaurant-quality. Booking again.',
            date: '2026-07-26'
        },
        {
            id: 'rv-04',
            author: 'Marcus D.',
            role: 'Table 11 · Family of 6',
            rating: 5,
            text:
                'Six different mains, six happy people — including two fussy vegetarians. The QR ordering was a hit with the kids.',
            date: '2026-07-11'
        }
    ];

    /** Ambiance gallery tiles — pure CSS gradients, so nothing 404s offline. */
    var GALLERY = [
        { id: 'gl-01', caption: 'The dining room', gradient: 'linear-gradient(135deg,#f59e0b,#b45309)' },
        { id: 'gl-02', caption: 'Chef\u2019s counter', gradient: 'linear-gradient(135deg,#14b8a6,#0f766e)' },
        { id: 'gl-03', caption: 'Terrace at dusk', gradient: 'linear-gradient(135deg,#6366f1,#312e81)' },
        { id: 'gl-04', caption: 'Private cellar', gradient: 'linear-gradient(135deg,#be123c,#7f1d1d)' },
        { id: 'gl-05', caption: 'Open kitchen', gradient: 'linear-gradient(135deg,#f97316,#c2410c)' },
        { id: 'gl-06', caption: 'Sunday brunch', gradient: 'linear-gradient(135deg,#84cc16,#3f6212)' }
    ];

    Bistro.Seed = {
        categories: CATEGORIES,
        tags: TAGS,
        menu: MENU,
        reviews: REVIEWS,
        gallery: GALLERY,

        /** Deep copy so callers can never mutate this module. */
        clone: function (value) {
            return JSON.parse(JSON.stringify(value));
        }
    };
})(window);
