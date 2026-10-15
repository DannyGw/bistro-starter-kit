/**
 * i18n dictionary validator.
 * ---------------------------------------------------------------------------
 *   npm run check:i18n      (also run by CI on every push)
 *
 * Guards the failure mode that is invisible at runtime: a key present in one
 * dictionary but missing from another silently falls back to English, so the
 * page looks fine in the source language and half-translated in the other.
 *
 * Checks, in order:
 *   1. Key parity across every dictionary in config.js `locale.available`.
 *   2. No empty or whitespace-only values.
 *   3. `{placeholder}` parity per key — a translation that drops `{count}`
 *      renders a numberless sentence rather than failing loudly.
 *   4. Every plural base key supplies each CLDR category the locale needs,
 *      and the sample counts render as expected.
 * ---------------------------------------------------------------------------
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

/** CLDR tag per locale code, mirroring INTL_TAGS in assets/js/i18n.js. */
const INTL_TAGS = { en: 'en-US', am: 'am-ET' };

/** Count-bearing keys that must supply plural categories. */
const PLURAL_BASES = ['menu.results', 'cart.items', 'res.guestsOption'];

/** Counts sampled when proving the plural rules resolve. */
const SAMPLES = [0, 1, 2, 5];

/* -------------------------------------------------------------------------- */

/** Read the locale list straight from config.js so this check can never drift. */
function languages() {
    const file = path.join(ROOT, 'config.js');
    const sandbox = { window: {} };
    vm.createContext(sandbox);
    vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
    const available = sandbox.window.Bistro.Config.locale.available;
    const codes = available.map((locale) => locale.code);
    return { codes, fallback: sandbox.window.Bistro.Config.locale.fallback || codes[0] };
}

function flatten(value, prefix, out) {
    const result = out || {};
    Object.keys(value).forEach((key) => {
        const child = value[key];
        const full = prefix ? `${prefix}.${key}` : key;
        if (child && typeof child === 'object' && !Array.isArray(child)) flatten(child, full, result);
        else result[full] = child;
    });
    return result;
}

function load(code) {
    const file = path.join(ROOT, 'i18n', `${code}.js`);
    if (!fs.existsSync(file)) {
        throw new Error(`Missing dictionary i18n/${code}.js — config.js advertises it.`);
    }
    const sandbox = { window: {} };
    vm.createContext(sandbox);
    vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
    const dict = sandbox.window.BistroI18N && sandbox.window.BistroI18N[code];
    if (!dict) throw new Error(`i18n/${code}.js did not register window.BistroI18N['${code}'].`);
    return flatten(dict);
}

const tokens = (value) => (String(value).match(/\{(\w+)\}/g) || []).sort().join(',');

/* -------------------------------------------------------------------------- */

let failures = 0;
const fail = (message) => {
    console.log(`  FAIL  ${message}`);
    failures += 1;
};

const { codes, fallback } = languages();
console.log(`locales from config.js: ${codes.join(', ')} (fallback: ${fallback})\n`);

const dicts = {};
codes.forEach((code) => {
    dicts[code] = load(code);
});

const base = dicts[fallback];
const baseKeys = Object.keys(base).sort();
console.log(`${fallback}: ${baseKeys.length} keys (baseline)`);

codes
    .filter((code) => code !== fallback)
    .forEach((code) => {
        const dict = dicts[code];
        const keys = Object.keys(dict);
        const missing = baseKeys.filter((key) => !(key in dict));
        const extra = keys.filter((key) => !(key in base));
        const empty = keys.filter((key) => !String(dict[key]).trim());

        console.log(
            `${code}: ${keys.length} keys | missing ${missing.length} | extra ${extra.length} | empty ${empty.length}`
        );
        missing.forEach((key) => fail(`${code} is missing "${key}"`));
        extra.forEach((key) => fail(`${code} has "${key}" which ${fallback} does not`));
        empty.forEach((key) => fail(`${code}."${key}" is empty`));
    });

// 3. placeholder parity
baseKeys.forEach((key) => {
    codes.forEach((code) => {
        if (code === fallback || !(key in dicts[code])) return;
        if (tokens(base[key]) !== tokens(dicts[code][key])) {
            fail(`placeholder mismatch ${code}."${key}": ${tokens(base[key]) || 'none'} vs ${tokens(dicts[code][key]) || 'none'}`);
        }
    });
});

// 4. plural coverage
console.log('\nplural categories');
PLURAL_BASES.forEach((baseKey) => {
    codes.forEach((code) => {
        const rules = new Intl.PluralRules(INTL_TAGS[code] || code);
        const needed = new Set(SAMPLES.map((n) => rules.select(n)));
        const missing = [...needed].filter((category) => dicts[code][`${baseKey}_${category}`] === undefined);
        if (missing.length) {
            fail(`${code}."${baseKey}" lacks ${missing.map((c) => `${baseKey}_${c}`).join(', ')}`);
        }
        const rendered = SAMPLES.map((n) => {
            const template = dicts[code][`${baseKey}_${rules.select(n)}`] || dicts[code][`${baseKey}_other`];
            return `${n}→${String(template).replace(/\{count\}/g, n)}`;
        });
        console.log(`  ${code} ${baseKey}: ${rendered.join('  ')}`);
    });
});

console.log(
    failures === 0
        ? `\nPASS  ${codes.length} locales, ${baseKeys.length} keys, plurals + placeholders in sync`
        : `\nFAIL  ${failures} problem(s)`
);
process.exit(failures === 0 ? 0 : 1);
