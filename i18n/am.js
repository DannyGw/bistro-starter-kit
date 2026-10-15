/**
 * Bistro Starter Kit — Amharic dictionary (am / አማርኛ).
 * NOTE: machine-assisted translation. Have a native Amharic speaker review the
 * hospitality and payment wording before shipping to a real client.
 */
window.BistroI18N = window.BistroI18N || {};

window.BistroI18N.am = {
    meta: {
        title: 'ቢስትሮ — ዘመናዊ ምግብ፣ በውበት የቀረበ',
        description: 'የወቅቱ ምግቦች፣ ተፈጥሯዊ ወይን እና ለረጅም እራት የተዘጋጀ አዳራሽ።'
    },

    nav: {
        home: 'መነሻ',
        menu: 'ምናሌ',
        reservations: 'ቦታ ማስያዝ',
        gallery: 'ገጽታ',
        reviews: 'ግምገማዎች',
        about: 'ስለ እኛ',
        contact: 'አግኙን',
        order: 'አሁን ያዙ',
        admin: 'የሰራተኞች ፓነል',
        openMenu: 'ማውጫ ክፈት',
        closeMenu: 'ማውጫ ዝጋ'
    },

    hero: {
        badge: 'ዛሬ ክፍት ነን · 11:00 – 22:30',
        title: 'ዘመናዊ ምግብ፣',
        titleAccent: 'በውበት የቀረበ።',
        subtitle:
            'የወቅቱ ምግቦች፣ ተፈጥሯዊ ወይን እና ለረጅም እራት የተዘጋጀ አዳራሽ። በጠረጴዛዎ ላይ ትዕዛዝ ያስገቡ፣ ወይም አስቀድመው ቦታ ያስይዙ።',
        ctaPrimary: 'ምናሌውን ይመልከቱ',
        ctaSecondary: 'ጠረጴዛ ያስይዙ',
        statDishes: 'የወቅት ምግቦች',
        statRating: 'አማካይ ደረጃ',
        statTables: 'ዛሬ የተገለገሉ ጠረጴዛዎች'
    },

    menu: {
        title: 'ምናሌያችን',
        subtitle: 'ለመጋራት የሚሆኑ ትንንሽ ምግቦች፣ የተረካቡ ዋና ምግቦች እና ለመቆየት የሚገቡ ጣፋጮች።',
        searchPlaceholder: 'ምግብ ወይም ንጥረ ነገር ይፈልጉ…',
        searchLabel: 'ምናሌውን ይፈልጉ',
        filterLabel: 'የምግብ ማጣሪያዎች',
        all: 'ሁሉም',
        sortLabel: 'ደርድር',
        sortPopular: 'በጣም ተወዳጅ',
        sortPriceLow: 'ዋጋ፦ ከዝቅተኛ ወደ ከፍተኛ',
        sortPriceHigh: 'ዋጋ፦ ከከፍተኛ ወደ ዝቅተኛ',
        sortName: 'ስም (ሀ–ዘ)',
        empty: 'ከእነዚህ ማጣሪያዎች ጋር የሚስማማ ምንም የለም።',
        emptyHint: 'ፍለጋውን ያጽዱ ወይም አንድ ማጣሪያ ያንሱ።',
        clearFilters: 'ማጣሪያዎችን አጽዳ',
        addToCart: 'ጨምር',
        added: '{name} ወደ ትዕዛዝዎ ተጨምሯል',
        soldOut: 'አልቋል',
        featured: 'የሼፉ ምርጫ',
        prep: '{minutes} ደቂቃ ዝግጅት',
        ratingSummary: '{rating} · {count} ግምገማዎች',
        results: '{count} ምግቦች',
        loading: 'ምናሌው በመጫን ላይ…'
    },

    tag: {
        vegetarian: 'ቬጀቴሪያን',
        vegan: 'ቪጋን',
        glutenFree: 'ግሉተን አልባ',
        spicy: 'ቅመማ ቅመም'
    },

    cat: {
        starters: 'መጀመሪያዎች',
        mains: 'ዋና ምግቦች',
        desserts: 'ጣፋጮች',
        drinks: 'መጠጦች'
    },

    cart: {
        title: 'የእርስዎ ትዕዛዝ',
        open: 'ትዕዛዝዎን ይክፈቱ',
        empty: 'ትዕዛዝዎ ባዶ ነው',
        emptyHint: 'ጥቂት ምግቦችን ይጨምሩ፤ እዚህ ይታያሉ።',
        browse: 'ምናሌውን ይመልከቱ',
        subtotal: 'ንዑስ ድምር',
        serviceCharge: 'አገልግሎት (በቦታው)',
        delivery: 'ማድረስ',
        tax: 'ታክስ',
        total: 'ጠቅላላ',
        checkout: 'ወደ ክፍያ ይሂዱ',
        clear: 'አጽዳ',
        remove: '{name} አስወግድ',
        decrease: 'የ{name} ብዛት ቀንስ',
        increase: 'የ{name} ብዛት ጨምር',
        items: '{count} ዕቃዎች',
        free: 'ነፃ',
        freeDeliveryProgress: 'ለነፃ ማድረስ {amount} ቀርቷል',
        freeDeliveryReached: 'ነፃ ማድረስ ተከፍቷል',
        minDelivery: 'ለማድረስ ቢያንስ {amount}'
    },

    orderType: {
        label: 'እንዴት እንዲቀርብልዎ ይፈልጋሉ?',
        dineIn: 'በቦታው',
        takeaway: 'ይዘው ይሂዱ',
        delivery: 'ማድረስ',
        tableLabel: 'የጠረጴዛ ቁጥር',
        tablePlaceholder: 'ምሳሌ 7',
        addressLabel: 'የማድረሻ አድራሻ',
        addressPlaceholder: 'መንገድ፣ ሕንፃ፣ ክፍል',
        notesLabel: 'ለኩሽናው ማስታወሻ',
        notesPlaceholder: 'አለርጂ፣ ሽንኩርት የለም፣ ተጨማሪ ናፕኪን…'
    },

    checkout: {
        title: 'ክፍያ',
        subtitle: 'በጥቂት ደቂቃዎች ውስጥ በስልክ እናረጋግጣለን።',
        nameLabel: 'ሙሉ ስም',
        namePlaceholder: 'ጃን ዶው',
        phoneLabel: 'ስልክ',
        phonePlaceholder: '+251 91 234 5678',
        emailLabel: 'ኢሜይል (አማራጭ)',
        emailPlaceholder: 'jane@example.com',
        paymentLabel: 'የክፍያ ዘዴ',
        placeOrder: 'ትዕዛዝ ያስገቡ · {total}',
        processing: 'በሂደት ላይ…',
        simulatedNotice:
            'የማሳያ ሁኔታ፦ በconfig.js ውስጥ የክፍያ ቁልፍ አልተዘጋጀም፤ ስለዚህ ክፍያው ምሳሌያዊ ነው።',
        successTitle: 'ትዕዛዝ ተረጋግጧል',
        successBody: 'አመሰግናለሁ! ትዕዛዝዎ ወደ ኩሽና ተልኳል። ማጣቀሻውን ይያዙ።',
        reference: 'ማጣቀሻ',
        newOrder: 'አዲስ ትዕዛዝ ይጀምሩ',
        validation: {
            name: 'እባክዎ ስምዎን ያስገቡ።',
            phone: 'እባክዎ የስልክ ቁጥር ያስገቡ።',
            table: 'ለቦታው አገልግሎት እባክዎ ጠረጴዛ ይምረጡ።',
            address: 'እባክዎ የማድረሻ አድራሻ ያስገቡ።',
            minDelivery: 'ትዕዛዝዎ ከማድረስ ዝቅተኛ ገደብ በታች ነው።',
            empty: 'መጀመሪያ ቢያንስ አንድ ምግብ ይጨምሩ።'
        }
    },

    res: {
        title: 'ጠረጴዛ ያስይዙ',
        subtitle: 'መቼ እንደሚፈልጉ ይንገሩን፤ ጠረጴዛ እናዘጋጅልዎታለን።',
        nameLabel: 'ሙሉ ስም',
        namePlaceholder: 'ጃን ዶው',
        phoneLabel: 'ስልክ',
        phonePlaceholder: '+251 91 234 5678',
        emailLabel: 'ኢሜይል (አማራጭ)',
        dateLabel: 'ቀን',
        timeLabel: 'ሰዓት',
        guestsLabel: 'እንግዶች',
        guestsOption: '{count} እንግዶች',
        notesLabel: 'ልዩ ጥያቄዎች',
        notesPlaceholder: 'የልደት ቀን፣ ከመስኮት አጠገብ፣ የልጅ ወንበር…',
        submit: 'ቦታ ይጠይቁ',
        submitting: 'ጥያቄ በመላክ ላይ…',
        successTitle: 'ጠረጴዛ ተጠይቋል',
        successBody: 'ጥያቄዎን ተቀብለናል፤ በቅርቡ እናረጋግጣለን።',
        reference: 'የቦታ ማስያዣ ማጣቀሻ',
        pendingNotice: 'እያንዳንዱ ቦታ ማስያዝ በቡድናችን ከተረጋገጠ በኋላ ነው የሚጠናቀቀው።',
        policy: 'ጠረጴዛዎች ከተያዘው ሰዓት በኋላ ለ15 ደቂቃ ይያዛሉ።',
        validation: {
            name: 'እባክዎ ስምዎን ያስገቡ።',
            phone: 'እባክዎ የስልክ ቁጥር ያስገቡ።',
            date: 'እባክዎ የወደፊት ቀን ይምረጡ።',
            time: 'እባክዎ ሰዓት ይምረጡ።',
            guests: 'እባክዎ የእንግዶች ቁጥር ይምረጡ።',
            timeWindow: 'ከ{open} እስከ {close} ክፍት ነን።'
        }
    },

    reviews: {
        title: 'እንግዶች ምን ይላሉ',
        subtitle: 'ከቅርብ ጊዜ ጠረጴዛዎች ያልተቀየሩ ግምገማዎች።',
        verified: 'የተረጋገጠ ጉብኝት'
    },

    gallery: {
        title: 'አዳራሹ',
        subtitle: 'ከመምጣትዎ በፊት አፋጣኝ እይታ።',
        caption: 'እይታ {n}'
    },

    qr: {
        title: 'ከጠረጴዛዎ ላይ ያዙ',
        subtitle: 'በጠረጴዛዎ ላይ ያለውን ኮድ ይቃኙ፣ ወይም ለማንኛውም ጠረጴዛ አዲስ ይፍጠሩ።',
        tableLabel: 'ጠረጴዛ',
        generate: 'ኮድ አሳይ',
        download: 'PNG አውርድ',
        open: 'አገናኝ ክፈት',
        hint: 'እነዚህን አትመው በእያንዳንዱ ጠረጴዛ ላይ ያስቀምጡ — እንግዶች ይቃኛሉ፣ ወዲያውኑ ያዛሉ።',
        unavailable: 'የQR ቤተ-መጽሐፍት ከመስመር ውጭ አይገኝም — ከታች ያለው አገናኝ አሁንም ይሰራል።',
        scanHint: 'መቃኘት ይህን ምናሌ ከጠረጴዛ {table} ጋር ይከፍታል።'
    },

    about: {
        title: 'ስለ እኛ',
        body:
            'የገበያው ጠዋት የሰጠንን ነገር ነው የምናበስለው። ሁሉም በቤት ውስጥ ይሰራል — ከዳቦ እስከ ሶርቤት — የወይን ዝርዝሩም ተፈጥሯዊ ነው።'
    },

    contact: {
        title: 'ይጎብኙን',
        hours: 'የሥራ ሰዓት',
        phone: 'ስልክ',
        email: 'ኢሜይል',
        address: 'አድራሻ',
        follow: 'ይከተሉን'
    },

    footer: {
        rights: 'መብቱ በሕግ የተጠበቀ ነው።',
        builtWith: 'በቢስትሮ ስታርተር ኪት የተሰራ።',
        admin: 'የሰራተኞች ፓነል',
        demo: 'የማሳያ መረጃ — ምንም አይከፈልም።'
    },

    common: {
        loading: 'በመጫን ላይ…',
        close: 'ዝጋ',
        cancel: 'ተው',
        confirm: 'አረጋግጥ',
        save: 'አስቀምጥ',
        saving: 'በማስቀመጥ ላይ…',
        saved: 'ተቀምጧል',
        error: 'የተሳሳተ ነገር ተከስቷል። እባክዎ እንደገና ይሞክሩ።',
        retry: 'እንደገና ሞክር',
        language: 'ቋንቋ',
        theme: 'ገጽታ ቀይር',
        light: 'ብርሃን',
        dark: 'ጨለማ',
        active: 'ንቁ',
        hidden: 'ተደብቋል',
        search: 'ፈልግ',
        optional: 'አማራጭ',
        required: 'ግዴታ',
        openNow: 'አሁን ክፍት',
        closedNow: 'ተዘግቷል',
        skipToContent: 'ወደ ዋና ይዘት ዝለል'
    },

    admin: {
        title: 'የሰራተኞች ፓነል',
        subtitle: 'የቀጥታ ትዕዛዞች፣ ቦታ ማስያዣዎች እና የምናሌ አቅርቦት።',
        loginTitle: 'የሰራተኛ መግቢያ',
        loginSubtitle: 'ይህ የማሳያ መግቢያ ነው — ከመጀመሩ በፊት በእውነተኛ ማረጋገጫ ይተኩት።',
        passcodeLabel: 'የመግቢያ ኮድ',
        passcodePlaceholder: '••••••••',
        login: 'ግባ',
        loginError: 'ኮዱ ትክክል አይደለም።',
        loginHint: 'የማሳያ ኮድ፦ {code}',
        logout: 'ውጣ',
        mode: 'የመረጃ ምንጭ',
        modeLocal: 'የአሳሽ ማከማቻ',
        modeRemote: 'Supabase',
        tabs: {
            orders: 'ትዕዛዞች',
            reservations: 'ቦታ ማስያዣዎች',
            menu: 'ምናሌ',
            settings: 'ቅንብሮች'
        },
        stats: {
            orders: 'ትዕዛዞች',
            revenue: 'ገቢ',
            reservations: 'ቦታ ማስያዣዎች',
            pending: 'በመጠበቅ ላይ'
        },
        empty: {
            orders: 'እስካሁን ትዕዛዝ የለም። ከመደብሩ አንዱን ያስገቡ።',
            reservations: 'እስካሁን ቦታ ማስያዣ የለም።',
            menu: 'ምንም የምናሌ ዕቃ አልተገኘም።'
        },
        table: {
            reference: 'ማጣቀሻ',
            placed: 'የተላከበት',
            type: 'ዓይነት',
            details: 'ዝርዝር',
            total: 'ጠቅላላ',
            status: 'ሁኔታ',
            actions: 'እርምጃዎች',
            guest: 'እንግዳ',
            item: 'ዕቃ',
            price: 'ዋጋ',
            qty: 'ብዛት',
            available: 'አቅርቦት',
            booking: 'ቦታ ማስያዣ'
        },
        status: {
            pending: 'በመጠበቅ',
            confirmed: 'ተረጋግጧል',
            preparing: 'በዝግጅት ላይ',
            ready: 'ዝግጁ',
            completed: 'ተጠናቅቋል',
            cancelled: 'ተሰርዟል'
        },
        action: {
            advance: 'ቀጥል',
            complete: 'አጠናቅ',
            cancel: 'ሰርዝ',
            approve: 'አጽድቅ',
            reject: 'አትቀበል',
            show: 'አሳይ',
            hide: 'ደብቅ',
            reset: 'የማሳያ መረጃ አጽዳ',
            resetConfirm: 'ሁሉንም የአካባቢ ትዕዛዞች፣ ቦታ ማስያዣዎች እና የምናሌ ለውጦች ይሰረዙ?',
            refresh: 'አድስ'
        },
        settings: {
            title: 'ቅንብሮች',
            brand: 'ብራንድ',
            config: 'ማዋቀሪያ',
            backend: 'ባክኤንድ',
            features: 'የነቁ ባህሪያት',
            dangerZone: 'አደገኛ ክፍል',
            resetHint: 'የአሳሹን ማከማቻ ያጸዳል እና የማሳያ ምናሌውን እንደገና ይጭናል።',
            updated: 'የተሻሻለው {when}'
        },
        resetDone: 'የማሳያ መረጃ ተጸድቷል።',
        statusChanged: 'ሁኔታው ተሻሽሏል።',
        refreshDone: 'ተደስቷል።'
    }
};
