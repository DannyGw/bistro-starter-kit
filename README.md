# 🍽️ Bistro Starter Kit

> A modular, high-performance, white-label web application built for restaurants, cafes, and fine dining establishments. Designed with full production-ready features, instant re-branding, and rapid multi-client deployment.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![Stack](https://img.shields.io/badge/stack-HTML5%20%7C%20TailwindCSS%20%7C%20JavaScript%20%7C%20Supabase-orange)

---

## ✨ Core Features

- **🎨 Modern Luxury UI/UX**: Responsive glassmorphism design with seamless light/dark aesthetic and mobile-first drawer navigation.
- **📖 Dynamic Menu & Filtering**: Categorized menu sections (*Starters, Mains, Desserts, Drinks*) with real-time text search and dietary tags (*Vegetarian, Vegan, Gluten-Free*).
- **🛒 Customizable Ordering System**: Slide-out cart drawer supporting **Dine-In**, **Takeaway**, and **Delivery** options with instant price/tax calculations.
- **📅 Interactive Table Reservation**: Real-time reservation booking form with date/time pickers, guest counters, special request notes, and booking confirmation modals.
- **⭐ Reviews & Ambiance Gallery**: Built-in showcase for restaurant interiors and guest testimonials.
- **📊 Integrated Admin Dashboard**: Manage live incoming orders, approve or cancel table reservations, and toggle menu stock statuses in real time.
- **💳 Multi-Gateway Payment System**: Built-in support for global and regional checkout processors including **Stripe**, **PayPal**, and **Chapa**.
- **🔌 Backend & CMS Persistence**: Connected via Supabase / Firebase for live synchronization of menus, orders, and reservations across devices.
- **🌐 Multi-Language Support (i18n)**: Out-of-the-box language switcher supporting English and Amharic.
- **📱 QR Code Table Ordering**: Generate and utilize table-specific QR codes for frictionless, direct-to-table dine-in ordering.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Modern Vanilla ES6+ JavaScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend / Database**: Supabase / Firebase / Headless CMS
- **Payments**: Stripe, PayPal, Chapa SDKs
- **Deployment**: Compatible with Vercel, Netlify, or any static/serverless web host.

---

## 📁 Repository Structure

```text
├── index.html            # Main single-page application entry point
├── config.js             # Client configuration, branding, and feature flags
├── admin.html            # Real-time restaurant management dashboard
├── i18n/                 # Translation dictionary files (en, am)
├── assets/
│   ├── css/              # Custom styling extensions
│   ├── js/               # Core state management, cart logic, and API hooks
│   └── images/           # Default assets & client branding placeholders
└── README.md             # Project documentation
```
