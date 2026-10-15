#!/usr/bin/env node
/**
 * Local static server for the Bistro Starter Kit.
 * ---------------------------------------------------------------------------
 * Two jobs:
 *   1. Cross-platform `npm run serve` (no Python/Node version prerequisites).
 *   2. Mirror the *exact* security headers that vercel.json / netlify.toml send,
 *      so header and CSP changes can be verified locally instead of discovered
 *      in production.
 *
 *   node tools/serve.js [--port 8080]
 *
 * NOTE: the Content-Security-Policy below is duplicated in vercel.json and
 * netlify.toml — those are consumed by the hosts, not by this process, so there
 * is no way to share one constant. Change all three together.
 * ---------------------------------------------------------------------------
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const argPort = process.argv.indexOf('--port');
const PORT = Number(argPort !== -1 ? process.argv[argPort + 1] : process.env.PORT) || 8080;

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.sql': 'text/plain; charset=utf-8',
    '.map': 'application/json; charset=utf-8'
};

const CSP = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "img-src 'self' data:",
    "style-src 'self' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    // jsdelivr: qrcode. Stripe/PayPal/Chapa: loaded on demand by payments.js.
    "script-src 'self' https://cdn.jsdelivr.net https://js.stripe.com https://www.paypal.com https://js.chapa.co",
    "frame-src 'self' https://js.stripe.com https://www.paypal.com",
    "connect-src 'self' https://*.supabase.co"
].join('; ');

const SECURITY_HEADERS = {
    'Content-Security-Policy': CSP,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=()',
    // Assets are not content-hashed, so they must be revalidated rather than
    // cached immutably; hashing them would let this become max-age=31536000.
    'Cache-Control': 'public, max-age=0, must-revalidate'
};

function resolveSafe(urlPath) {
    const decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
    const relative = decoded.replace(/^\/+/, '');
    const target = path.resolve(ROOT, relative);
    // Never serve outside the project directory.
    return target.startsWith(ROOT) ? target : null;
}

function send(res, status, filePath) {
    const body = fs.readFileSync(filePath);
    res.writeHead(status, {
        ...SECURITY_HEADERS,
        'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
        'Content-Length': body.length
    });
    res.end(body);
}

const server = http.createServer((req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405, { ...SECURITY_HEADERS, Allow: 'GET, HEAD' });
        return res.end('Method Not Allowed');
    }

    let target = resolveSafe(req.url);

    if (target && fs.existsSync(target) && fs.statSync(target).isDirectory()) {
        target = path.join(target, 'index.html');
    }
    // Extensionless URLs, matching `cleanUrls` on Vercel.
    if (target && !fs.existsSync(target) && fs.existsSync(target + '.html')) {
        target += '.html';
    }

    if (!target || !fs.existsSync(target)) {
        console.log(`404 ${req.url}`);
        return send(res, 404, path.join(ROOT, '404.html'));
    }

    console.log(`200 ${req.url}`);
    send(res, 200, target);
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`Bistro Starter Kit → http://127.0.0.1:${PORT}/`);
    console.log(`  admin dashboard  → http://127.0.0.1:${PORT}/admin.html`);
    console.log('  serving with deployment security headers (incl. CSP)');
});
