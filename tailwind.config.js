/**
 * Tailwind build configuration.
 * ---------------------------------------------------------------------------
 * The site ships a *prebuilt* assets/css/tailwind.css so it can be deployed to
 * any static host with no build step. Rebuild it after changing markup, classes
 * or this file:
 *
 *   npm run build:css        # one-off, minified
 *   npm run watch:css        # during development
 *
 * `brand` and `accent` resolve to CSS custom properties, which assets/js/ui.js
 * sets from config.js at runtime. That keeps the "re-skin by editing config.js"
 * promise intact without coupling this build to the browser config.
 *
 * `content` must include the JS, because app.js and admin.js build class names
 * inside template strings — a HTML-only scan silently drops those utilities.
 * ---------------------------------------------------------------------------
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: ['./index.html', './admin.html', './404.html', './assets/js/**/*.js'],
    theme: {
        extend: {
            colors: {
                brand: 'var(--brand)',
                accent: 'var(--accent)'
            },
            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
                display: ['"Playfair Display"', 'Georgia', 'Times New Roman', 'serif']
            },
            maxWidth: { shell: '1200px' },
            zIndex: { 60: '60', 70: '70', 80: '80', 90: '90' }
        }
    },
    plugins: []
};
