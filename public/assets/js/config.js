/* =========================================================================
   Loqelo — site configuration
   Everything you need to change lives in this one file.
   ========================================================================= */
window.LOQELO = {
  /* Canonical site URL, without a trailing slash. Used for share links. */
  siteUrl: 'https://loqelo.com',

  /* The moment the countdown runs to (ISO 8601, with timezone offset). */
  launchDate: '2027-02-01T00:00:00+01:00',

  /* ---- Languages ------------------------------------------------------
     `en` lives in the HTML itself (index.html). Every other language is a
     JSON file in assets/js/i18n/. To add a language: copy pl.json, translate
     the values, add the code here. Nothing else to change.              */
  defaultLang: 'en',
  langs: [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'pl', label: 'Polski',  short: 'PL' },
    { code: 'de', label: 'Deutsch', short: 'DE' }
  ],

  /* ---- Analytics ------------------------------------------------------
     Leave `ga4` empty and no analytics script loads at all — the site is
     then completely cookie-free. Add your GA4 measurement ID (G-XXXXXXXXXX)
     to switch it on. Analytics only ever starts after a visitor accepts.  */
  ga4: '',

  /* ---- Forms ----------------------------------------------------------
     'netlify'  → Netlify Forms. Zero configuration once deployed to Netlify.
                  Submissions appear under Forms, can be exported to CSV and
                  are separated per form (customers / providers).
     'endpoint' → POST JSON to `formEndpoint`. Works with Formspree, Basin,
                  your own API, a Google Apps Script web app, etc.
     Both modes keep the two audiences in separate lists.                 */
  formMode: 'netlify',
  formEndpoint: '',

  /* Optional Cloudflare Turnstile site key for extra spam protection. */
  turnstileSiteKey: '',

  /* Set to true to log analytics and form events to the console. */
  debug: false
};
