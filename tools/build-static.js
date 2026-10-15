#!/usr/bin/env node
/**
 * Assemble `public/` — the deployable static bundle.
 * ---------------------------------------------------------------------------
 * Why this exists: Vercel expects a build *output directory* ("public" if it
 * exists, otherwise the repo root). Serving the repo root would also publish
 * node_modules, tools/, supabase/ and the CI config, and Vercel errors out with
 * "No Output Directory named public found" when it can't find one.
 *
 * So Vercel gets a clean bundle while GitHub Pages and Netlify keep serving the
 * repository root unchanged. The repository remains the single source of truth.
 *
 *   npm run build:static        # just assemble public/
 *   npm run vercel-build        # build CSS, then assemble (Vercel's default)
 * ---------------------------------------------------------------------------
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'public');

/** Runtime entry points served from the bundle root. */
const FILES = [
    'index.html',
    'admin.html',
    '404.html',
    'robots.txt',
    'config.js',
    'LICENSE',
    'README.md'
];

/** Runtime asset trees, copied recursively. */
const DIRS = ['assets', 'i18n'];

/**
 * Never publish build inputs or anything that only exists for development.
 * `assets/css/tailwind.src.css` is the Tailwind entry point — the compiled
 * tailwind.css is what the pages link.
 */
const SKIP = [
    /\.src\.css$/,
    /\.map$/,
    /(^|[\\/])\.DS_Store$/,
    /(^|[\\/])Thumbs\.db$/
];

function shouldSkip(relativePath) {
    return SKIP.some((pattern) => pattern.test(relativePath));
}

function copyDir(from, to, prefix) {
    fs.mkdirSync(to, { recursive: true });

    fs.readdirSync(from, { withFileTypes: true }).forEach((entry) => {
        const source = path.join(from, entry.name);
        const target = path.join(to, entry.name);
        const relative = path.posix.join(prefix, entry.name);

        if (shouldSkip(relative)) return;

        if (entry.isDirectory()) copyDir(source, target, relative);
        else fs.copyFileSync(source, target);
    });
}

function main() {
    if (!fs.existsSync(path.join(ROOT, 'assets', 'css', 'tailwind.css'))) {
        console.error('public/ build failed: assets/css/tailwind.css is missing. Run `npm run build:css` first.');
        process.exit(1);
    }

    fs.rmSync(OUT, { recursive: true, force: true });
    fs.mkdirSync(OUT, { recursive: true });

    const copied = [];

    FILES.forEach((file) => {
        const source = path.join(ROOT, file);
        if (!fs.existsSync(source)) {
            console.warn(`  skip  ${file} (not found)`);
            return;
        }
        fs.copyFileSync(source, path.join(OUT, file));
        copied.push(file);
    });

    DIRS.forEach((dir) => {
        const source = path.join(ROOT, dir);
        if (!fs.existsSync(source)) {
            console.warn(`  skip  ${dir}/ (not found)`);
            return;
        }
        copyDir(source, path.join(OUT, dir), dir);
        copied.push(`${dir}/`);
    });

    // .nojekyll is a GitHub Pages control file; harmless elsewhere but pointless
    // in the Vercel bundle, so it stays at the repo root only.
    const total = copied.length;
    console.log(`public/ assembled — ${total} top-level entries`);
    copied.forEach((entry) => console.log(`  ${entry}`));
    console.log('\nDeploy `public/`, or let Vercel run `npm run vercel-build` for you.');
}

main();
