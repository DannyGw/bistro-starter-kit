/**
 * Bistro Starter Kit — Spanish dictionary (es).
 * NOTE: machine-assisted translation. Have a native speaker review before
 * shipping to a real client, especially legal/payment wording.
 */
window.BistroI18N = window.BistroI18N || {};

window.BistroI18N.es = {
    meta: {
        title: 'Bistro — Cocina moderna, servida con estilo',
        description: 'Platos de temporada, vino natural y una sala pensada para cenas largas.'
    },

    nav: {
        home: 'Inicio',
        menu: 'Menú',
        reservations: 'Reservas',
        gallery: 'Ambiente',
        reviews: 'Opiniones',
        about: 'Nosotros',
        contact: 'Contacto',
        order: 'Pedir ahora',
        admin: 'Panel de personal',
        openMenu: 'Abrir navegación',
        closeMenu: 'Cerrar navegación'
    },

    hero: {
        badge: 'Abierto hoy · 11:00 – 22:30',
        title: 'Cocina moderna,',
        titleAccent: 'servida con estilo.',
        subtitle:
            'Platos de temporada, vino natural y una sala pensada para cenas largas. Pide en tu mesa o reserva con antelación y nosotros nos ocupamos del resto.',
        ctaPrimary: 'Ver el menú',
        ctaSecondary: 'Reservar mesa',
        statDishes: 'Platos de temporada',
        statRating: 'Valoración media',
        statTables: 'Mesas servidas hoy'
    },

    menu: {
        title: 'Nuestro menú',
        subtitle: 'Platos para compartir, principales generosos y postres que merecen quedarse.',
        searchPlaceholder: 'Buscar platos, ingredientes…',
        searchLabel: 'Buscar en el menú',
        filterLabel: 'Filtros dietéticos',
        all: 'Todo',
        sortLabel: 'Ordenar',
        sortPopular: 'Más populares',
        sortPriceLow: 'Precio: de menor a mayor',
        sortPriceHigh: 'Precio: de mayor a menor',
        sortName: 'Nombre (A–Z)',
        empty: 'Nada coincide con esos filtros.',
        emptyHint: 'Borra la búsqueda o quita un filtro dietético.',
        clearFilters: 'Borrar filtros',
        addToCart: 'Añadir',
        added: '{name} añadido a tu pedido',
        soldOut: 'Agotado',
        featured: 'Recomendación del chef',
        prep: '{minutes} min de preparación',
        ratingSummary: '{rating} · {count} opiniones',
        results: '{count} platos',
        loading: 'Cargando el menú…'
    },

    tag: {
        vegetarian: 'Vegetariano',
        vegan: 'Vegano',
        glutenFree: 'Sin gluten',
        spicy: 'Picante'
    },

    cat: {
        starters: 'Entrantes',
        mains: 'Principales',
        desserts: 'Postres',
        drinks: 'Bebidas'
    },

    cart: {
        title: 'Tu pedido',
        open: 'Abrir tu pedido',
        empty: 'Tu pedido está vacío',
        emptyHint: 'Añade algunos platos y aparecerán aquí.',
        browse: 'Ver el menú',
        subtotal: 'Subtotal',
        serviceCharge: 'Servicio (en sala)',
        delivery: 'Entrega',
        tax: 'Impuestos',
        total: 'Total',
        checkout: 'Ir al pago',
        clear: 'Vaciar',
        remove: 'Quitar {name}',
        decrease: 'Reducir la cantidad de {name}',
        increase: 'Aumentar la cantidad de {name}',
        items: '{count} artículos',
        free: 'gratis',
        freeDeliveryProgress: 'Te faltan {amount} para la entrega gratis',
        freeDeliveryReached: 'Entrega gratis desbloqueada',
        minDelivery: 'Mínimo {amount} para entrega'
    },

    orderType: {
        label: '¿Cómo lo prefieres?',
        dineIn: 'En sala',
        takeaway: 'Para llevar',
        delivery: 'A domicilio',
        tableLabel: 'Número de mesa',
        tablePlaceholder: 'p. ej. 7',
        addressLabel: 'Dirección de entrega',
        addressPlaceholder: 'Calle, edificio, piso',
        notesLabel: 'Notas para la cocina',
        notesPlaceholder: 'Alergias, sin cebolla, más servilletas…'
    },

    checkout: {
        title: 'Pago',
        subtitle: 'Confirmamos por teléfono en unos minutos.',
        nameLabel: 'Nombre completo',
        namePlaceholder: 'María García',
        phoneLabel: 'Teléfono',
        phonePlaceholder: '+34 600 123 456',
        emailLabel: 'Correo (opcional)',
        emailPlaceholder: 'maria@ejemplo.es',
        paymentLabel: 'Método de pago',
        placeOrder: 'Realizar pedido · {total}',
        processing: 'Procesando…',
        simulatedNotice:
            'Modo demo: no hay credenciales de pago en config.js, así que el pago es simulado.',
        successTitle: 'Pedido confirmado',
        successBody: '¡Gracias! Tu pedido está en cocina. Guarda tu referencia.',
        reference: 'Referencia',
        newOrder: 'Empezar un pedido nuevo',
        validation: {
            name: 'Introduce tu nombre.',
            phone: 'Introduce un número de teléfono.',
            table: 'Elige una mesa para el servicio en sala.',
            address: 'Introduce una dirección de entrega.',
            minDelivery: 'Tu pedido no llega al mínimo de entrega.',
            empty: 'Añade antes al menos un plato.'
        }
    },

    res: {
        title: 'Reservar mesa',
        subtitle: 'Dinos cuándo y te guardamos una mesa.',
        nameLabel: 'Nombre completo',
        namePlaceholder: 'María García',
        phoneLabel: 'Teléfono',
        phonePlaceholder: '+34 600 123 456',
        emailLabel: 'Correo (opcional)',
        dateLabel: 'Fecha',
        timeLabel: 'Hora',
        guestsLabel: 'Comensales',
        guestsOption: '{count} comensales',
        notesLabel: 'Peticiones especiales',
        notesPlaceholder: 'Cumpleaños, mesa junto a la ventana, trona…',
        submit: 'Solicitar reserva',
        submitting: 'Enviando solicitud…',
        successTitle: 'Mesa solicitada',
        successBody: 'Hemos recibido tu solicitud y te confirmaremos en breve.',
        reference: 'Referencia de reserva',
        pendingNotice: 'Nuestro equipo confirma cada reserva antes de darla por final.',
        policy: 'Las mesas se guardan 15 minutos después de la hora reservada.',
        validation: {
            name: 'Introduce tu nombre.',
            phone: 'Introduce un número de teléfono.',
            date: 'Elige una fecha futura válida.',
            time: 'Elige una hora.',
            guests: 'Elige el número de comensales.',
            timeWindow: 'Abrimos de {open} a {close}.'
        }
    },

    reviews: {
        title: 'Lo que dicen los clientes',
        subtitle: 'Opiniones sin editar de mesas recientes.',
        verified: 'Visita verificada'
    },

    gallery: {
        title: 'La sala',
        subtitle: 'Un vistazo antes de llegar.',
        caption: 'Vista {n}'
    },

    qr: {
        title: 'Pide desde tu mesa',
        subtitle: 'Escanea el código de tu mesa o genera uno para cualquier mesa.',
        tableLabel: 'Mesa',
        generate: 'Mostrar código',
        download: 'Descargar PNG',
        open: 'Abrir enlace',
        hint: 'Imprímelos y coloca uno en cada mesa: tus clientes escanean y piden al instante.',
        unavailable: 'Biblioteca QR no disponible sin conexión: el enlace de abajo sigue funcionando.',
        scanHint: 'Al escanear se abre este menú con la mesa {table} preseleccionada.'
    },

    about: {
        title: 'Sobre nosotros',
        body:
            'Cocinamos lo que el mercado nos da esa mañana. Todo se hace en casa, del pan a los sorbetes, y la carta de vinos tira a natural.'
    },

    contact: {
        title: 'Visítanos',
        hours: 'Horario',
        phone: 'Teléfono',
        email: 'Correo',
        address: 'Dirección',
        follow: 'Síguenos'
    },

    footer: {
        rights: 'Todos los derechos reservados.',
        builtWith: 'Creado con el Bistro Starter Kit.',
        admin: 'Panel de personal',
        demo: 'Datos de demostración: no se cobra nada.'
    },

    common: {
        loading: 'Cargando…',
        close: 'Cerrar',
        cancel: 'Cancelar',
        confirm: 'Confirmar',
        save: 'Guardar',
        saving: 'Guardando…',
        saved: 'Guardado',
        error: 'Algo ha ido mal. Inténtalo de nuevo.',
        retry: 'Reintentar',
        language: 'Idioma',
        theme: 'Cambiar tema',
        light: 'Claro',
        dark: 'Oscuro',
        active: 'Activo',
        hidden: 'Oculto',
        search: 'Buscar',
        optional: 'opcional',
        required: 'obligatorio',
        openNow: 'Abierto',
        closedNow: 'Cerrado',
        skipToContent: 'Ir al contenido'
    },

    admin: {
        title: 'Panel de personal',
        subtitle: 'Pedidos en directo, reservas y disponibilidad del menú.',
        loginTitle: 'Acceso del personal',
        loginSubtitle: 'Esto es una barrera de demostración: sustitúyela por autenticación real.',
        passcodeLabel: 'Código de acceso',
        passcodePlaceholder: '••••••••',
        login: 'Entrar',
        loginError: 'Ese código no es correcto.',
        loginHint: 'Código de demo: {code}',
        logout: 'Salir',
        mode: 'Origen de datos',
        modeLocal: 'Almacenamiento del navegador',
        modeRemote: 'Supabase',
        tabs: {
            orders: 'Pedidos',
            reservations: 'Reservas',
            menu: 'Menú',
            settings: 'Ajustes'
        },
        stats: {
            orders: 'Pedidos',
            revenue: 'Ingresos',
            reservations: 'Reservas',
            pending: 'Pendiente de acción'
        },
        empty: {
            orders: 'Todavía no hay pedidos. Crea uno desde la tienda.',
            reservations: 'Todavía no hay reservas.',
            menu: 'No se han encontrado platos.'
        },
        table: {
            reference: 'Referencia',
            placed: 'Realizado',
            type: 'Tipo',
            details: 'Detalles',
            total: 'Total',
            status: 'Estado',
            actions: 'Acciones',
            guest: 'Cliente',
            item: 'Plato',
            price: 'Precio',
            qty: 'Cant.',
            available: 'Disponibilidad',
            booking: 'Reserva'
        },
        status: {
            pending: 'Pendiente',
            confirmed: 'Confirmado',
            preparing: 'Preparando',
            ready: 'Listo',
            completed: 'Completado',
            cancelled: 'Cancelado'
        },
        action: {
            advance: 'Avanzar',
            complete: 'Completar',
            cancel: 'Cancelar',
            approve: 'Aprobar',
            reject: 'Rechazar',
            show: 'Mostrar',
            hide: 'Ocultar',
            reset: 'Restablecer datos de demo',
            resetConfirm: '¿Borrar todos los pedidos, reservas y cambios de menú locales?',
            refresh: 'Actualizar'
        },
        settings: {
            title: 'Ajustes',
            brand: 'Marca',
            config: 'Configuración',
            backend: 'Backend',
            features: 'Funciones activas',
            dangerZone: 'Zona peligrosa',
            resetHint: 'Borra el almacenamiento del navegador y recarga el menú de demo.',
            updated: 'Actualizado {when}'
        },
        resetDone: 'Datos de demo restablecidos.',
        statusChanged: 'Estado actualizado.',
        refreshDone: 'Actualizado.'
    }
};
