/**
 * Bistro Starter Kit — 404 page bootstrap.
 * ---------------------------------------------------------------------------
 * Keeps the brand, language and colour scheme continuous on a not-found page
 * without pulling in the storefront controller.
 * ---------------------------------------------------------------------------
 */
(function () {
    'use strict';

    var Bistro = window.Bistro;
    if (!Bistro) return;

    Bistro.UI.applyBrand();

    var lang = Bistro.State.get('lang') || Bistro.Config.locale.default;
    Bistro.I18N.setLanguage(lang);

    var theme =
        Bistro.State.get('theme') ||
        Bistro.UI.storedTheme() ||
        Bistro.Config.theme.default;
    Bistro.State.patch({ theme: theme }, { silent: true });
    Bistro.UI.applyTheme(theme);

    // Offer the switcher so a lost visitor can still read the page in Amharic.
    var select = document.getElementById('notfound-lang');
    if (select) {
        select.innerHTML = Bistro.I18N.languages()
            .map(function (locale) {
                return '<option value="' + locale.code + '">' + locale.native + '</option>';
            })
            .join('');
        select.value = lang;
        select.addEventListener('change', function () {
            Bistro.I18N.setLanguage(select.value);
        });
    }
})();
