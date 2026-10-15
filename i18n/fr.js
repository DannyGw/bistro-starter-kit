/**
 * Bistro Starter Kit — French dictionary (fr).
 * NOTE: machine-assisted translation. Have a native speaker review before
 * shipping to a real client, especially legal/payment wording.
 */
window.BistroI18N = window.BistroI18N || {};

window.BistroI18N.fr = {
    meta: {
        title: 'Bistro — Une table moderne, joliment servie',
        description: 'Assiettes de saison, vins nature et une salle pensée pour les longs dîners.'
    },

    nav: {
        home: 'Accueil',
        menu: 'Carte',
        reservations: 'Réservations',
        gallery: 'Ambiance',
        reviews: 'Avis',
        about: 'À propos',
        contact: 'Contact',
        order: 'Commander',
        admin: 'Tableau de bord',
        openMenu: 'Ouvrir la navigation',
        closeMenu: 'Fermer la navigation'
    },

    hero: {
        badge: 'Ouvert aujourd’hui · 11h00 – 22h30',
        title: 'Une table moderne,',
        titleAccent: 'joliment servie.',
        subtitle:
            'Des assiettes de saison, des vins nature et une salle pensée pour les longs dîners. Commandez à votre table, ou réservez et laissez-nous faire le reste.',
        ctaPrimary: 'Découvrir la carte',
        ctaSecondary: 'Réserver une table',
        statDishes: 'Plats de saison',
        statRating: 'Note moyenne',
        statTables: 'Tables servies aujourd’hui'
    },

    menu: {
        title: 'Notre carte',
        subtitle: 'Petites assiettes à partager, plats généreux et desserts qui méritent qu’on s’attarde.',
        searchPlaceholder: 'Rechercher un plat, un ingrédient…',
        searchLabel: 'Rechercher dans la carte',
        filterLabel: 'Filtres alimentaires',
        all: 'Tout',
        sortLabel: 'Trier',
        sortPopular: 'Les plus populaires',
        sortPriceLow: 'Prix croissant',
        sortPriceHigh: 'Prix décroissant',
        sortName: 'Nom (A–Z)',
        empty: 'Aucun plat ne correspond à ces filtres.',
        emptyHint: 'Effacez la recherche ou retirez un filtre alimentaire.',
        clearFilters: 'Effacer les filtres',
        addToCart: 'Ajouter',
        added: '{name} ajouté à votre commande',
        soldOut: 'Épuisé',
        featured: 'Choix du chef',
        prep: '{minutes} min de préparation',
        ratingSummary: '{rating} · {count} avis',
        results: '{count} plats',
        loading: 'Chargement de la carte…'
    },

    tag: {
        vegetarian: 'Végétarien',
        vegan: 'Végan',
        glutenFree: 'Sans gluten',
        spicy: 'Épicé'
    },

    cat: {
        starters: 'Entrées',
        mains: 'Plats',
        desserts: 'Desserts',
        drinks: 'Boissons'
    },

    cart: {
        title: 'Votre commande',
        open: 'Ouvrir votre commande',
        empty: 'Votre commande est vide',
        emptyHint: 'Ajoutez quelques plats, ils apparaîtront ici.',
        browse: 'Parcourir la carte',
        subtotal: 'Sous-total',
        serviceCharge: 'Service (sur place)',
        delivery: 'Livraison',
        tax: 'TVA',
        total: 'Total',
        checkout: 'Passer au paiement',
        clear: 'Vider',
        remove: 'Retirer {name}',
        decrease: 'Diminuer la quantité de {name}',
        increase: 'Augmenter la quantité de {name}',
        items: '{count} articles',
        free: 'offerte',
        freeDeliveryProgress: 'Encore {amount} pour la livraison offerte',
        freeDeliveryReached: 'Livraison offerte débloquée',
        minDelivery: 'Minimum {amount} pour la livraison'
    },

    orderType: {
        label: 'Comment souhaitez-vous être servi ?',
        dineIn: 'Sur place',
        takeaway: 'À emporter',
        delivery: 'Livraison',
        tableLabel: 'Numéro de table',
        tablePlaceholder: 'ex. 7',
        addressLabel: 'Adresse de livraison',
        addressPlaceholder: 'Rue, immeuble, appartement',
        notesLabel: 'Notes pour la cuisine',
        notesPlaceholder: 'Allergies, sans oignons, serviettes en plus…'
    },

    checkout: {
        title: 'Paiement',
        subtitle: 'Nous confirmons par téléphone dans quelques minutes.',
        nameLabel: 'Nom complet',
        namePlaceholder: 'Jeanne Dupont',
        phoneLabel: 'Téléphone',
        phonePlaceholder: '+33 6 12 34 56 78',
        emailLabel: 'E-mail (facultatif)',
        emailPlaceholder: 'jeanne@exemple.fr',
        paymentLabel: 'Moyen de paiement',
        placeOrder: 'Commander · {total}',
        processing: 'Traitement…',
        simulatedNotice:
            'Mode démo : aucune clé de paiement n’est renseignée dans config.js, le paiement est donc simulé.',
        successTitle: 'Commande confirmée',
        successBody: 'Merci ! Votre commande est en cuisine. Conservez votre référence.',
        reference: 'Référence',
        newOrder: 'Nouvelle commande',
        validation: {
            name: 'Veuillez saisir votre nom.',
            phone: 'Veuillez saisir un numéro de téléphone.',
            table: 'Veuillez choisir une table pour le service sur place.',
            address: 'Veuillez saisir une adresse de livraison.',
            minDelivery: 'Votre commande est sous le minimum de livraison.',
            empty: 'Ajoutez d’abord au moins un plat.'
        }
    },

    res: {
        title: 'Réserver une table',
        subtitle: 'Dites-nous quand, nous vous gardons une table.',
        nameLabel: 'Nom complet',
        namePlaceholder: 'Jeanne Dupont',
        phoneLabel: 'Téléphone',
        phonePlaceholder: '+33 6 12 34 56 78',
        emailLabel: 'E-mail (facultatif)',
        dateLabel: 'Date',
        timeLabel: 'Heure',
        guestsLabel: 'Convives',
        guestsOption: '{count} convives',
        notesLabel: 'Demandes particulières',
        notesPlaceholder: 'Anniversaire, table près de la fenêtre, chaise haute…',
        submit: 'Demander la réservation',
        submitting: 'Envoi de la demande…',
        successTitle: 'Table demandée',
        successBody: 'Nous avons bien reçu votre demande, une confirmation suivra.',
        reference: 'Référence de réservation',
        pendingNotice: 'Chaque réservation est confirmée par notre équipe.',
        policy: 'Les tables sont conservées 15 minutes après l’heure réservée.',
        validation: {
            name: 'Veuillez saisir votre nom.',
            phone: 'Veuillez saisir un numéro de téléphone.',
            date: 'Veuillez choisir une date future valide.',
            time: 'Veuillez choisir une heure.',
            guests: 'Veuillez choisir un nombre de convives.',
            timeWindow: 'Nous sommes ouverts de {open} à {close}.'
        }
    },

    reviews: {
        title: 'Ce que disent nos clients',
        subtitle: 'Avis non modérés de tables récentes.',
        verified: 'Visite vérifiée'
    },

    gallery: {
        title: 'La salle',
        subtitle: 'Un aperçu avant votre arrivée.',
        caption: 'Vue {n}'
    },

    qr: {
        title: 'Commandez depuis votre table',
        subtitle: 'Scannez le code de votre table, ou générez-en un pour n’importe quelle table.',
        tableLabel: 'Table',
        generate: 'Afficher le code',
        download: 'Télécharger le PNG',
        open: 'Ouvrir le lien',
        hint: 'Imprimez-les et posez-en un sur chaque table : vos clients scannent et commandent.',
        unavailable: 'Bibliothèque QR indisponible hors ligne — le lien ci-dessous fonctionne toujours.',
        scanHint: 'Le scan ouvre cette carte avec la table {table} présélectionnée.'
    },

    about: {
        title: 'À propos',
        body:
            'Nous cuisinons ce que le marché nous offre le matin. Tout est fait maison — du pain aux sorbets — et la carte des vins est résolument nature.'
    },

    contact: {
        title: 'Nous rendre visite',
        hours: 'Horaires',
        phone: 'Téléphone',
        email: 'E-mail',
        address: 'Adresse',
        follow: 'Suivez-nous'
    },

    footer: {
        rights: 'Tous droits réservés.',
        builtWith: 'Réalisé avec le Bistro Starter Kit.',
        admin: 'Tableau de bord',
        demo: 'Données de démonstration — aucun paiement réel.'
    },

    common: {
        loading: 'Chargement…',
        close: 'Fermer',
        cancel: 'Annuler',
        confirm: 'Confirmer',
        save: 'Enregistrer',
        saving: 'Enregistrement…',
        saved: 'Enregistré',
        error: 'Une erreur est survenue. Veuillez réessayer.',
        retry: 'Réessayer',
        language: 'Langue',
        theme: 'Changer de thème',
        light: 'Clair',
        dark: 'Sombre',
        active: 'Actif',
        hidden: 'Masqué',
        search: 'Rechercher',
        optional: 'facultatif',
        required: 'obligatoire',
        openNow: 'Ouvert',
        closedNow: 'Fermé',
        skipToContent: 'Aller au contenu'
    },

    admin: {
        title: 'Tableau de bord',
        subtitle: 'Commandes en direct, réservations et disponibilité de la carte.',
        loginTitle: 'Connexion du personnel',
        loginSubtitle: 'Ceci est une barrière de démonstration — remplacez-la par une authentification réelle.',
        passcodeLabel: 'Code d’accès',
        passcodePlaceholder: '••••••••',
        login: 'Se connecter',
        loginError: 'Ce code n’est pas correct.',
        loginHint: 'Code de démo : {code}',
        logout: 'Se déconnecter',
        mode: 'Source de données',
        modeLocal: 'Stockage du navigateur',
        modeRemote: 'Supabase',
        tabs: {
            orders: 'Commandes',
            reservations: 'Réservations',
            menu: 'Carte',
            settings: 'Réglages'
        },
        stats: {
            orders: 'Commandes',
            revenue: 'Chiffre d’affaires',
            reservations: 'Réservations',
            pending: 'En attente'
        },
        empty: {
            orders: 'Aucune commande. Passez-en une depuis la boutique.',
            reservations: 'Aucune réservation pour le moment.',
            menu: 'Aucun plat trouvé.'
        },
        table: {
            reference: 'Référence',
            placed: 'Passée',
            type: 'Type',
            details: 'Détails',
            total: 'Total',
            status: 'Statut',
            actions: 'Actions',
            guest: 'Client',
            item: 'Plat',
            price: 'Prix',
            qty: 'Qté',
            available: 'Disponibilité',
            booking: 'Réservation'
        },
        status: {
            pending: 'En attente',
            confirmed: 'Confirmée',
            preparing: 'En préparation',
            ready: 'Prête',
            completed: 'Terminée',
            cancelled: 'Annulée'
        },
        action: {
            advance: 'Avancer',
            complete: 'Terminer',
            cancel: 'Annuler',
            approve: 'Approuver',
            reject: 'Refuser',
            show: 'Afficher',
            hide: 'Masquer',
            reset: 'Réinitialiser les données de démo',
            resetConfirm: 'Supprimer toutes les commandes, réservations et modifications locales de la carte ?',
            refresh: 'Actualiser'
        },
        settings: {
            title: 'Réglages',
            brand: 'Marque',
            config: 'Configuration',
            backend: 'Backend',
            features: 'Fonctions activées',
            dangerZone: 'Zone sensible',
            resetHint: 'Efface le stockage du navigateur et réinjecte la carte de démonstration.',
            updated: 'Mis à jour {when}'
        },
        resetDone: 'Données de démo réinitialisées.',
        statusChanged: 'Statut mis à jour.',
        refreshDone: 'Actualisé.'
    }
};
