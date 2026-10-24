# Loqelo — pre-launch website

A production-ready landing page for **Loqelo**, the platform that connects customers with
service providers for the home, garden and office. Built to launch the waiting list ahead of
the **February 2027** launch: one page, two sign-up forms, three languages, no build step.

> **Everything is static.** No framework, no database, no build pipeline. The folder
> `public/` is the website — upload it anywhere that serves files over HTTPS.

---

## Quick start

```bash
# any static server works; this one is a single dependency-free Node script
node tools/serve.mjs public 5500
# → http://127.0.0.1:5500
```

Or simply open `public/index.html` in a browser — although the language switcher and the
forms need an HTTP server to work (they use `fetch`).

Deploy: see **[docs/02-deployment.md](docs/02-deployment.md)**. Short version — drag
`public/` onto Netlify, or connect the repo with publish directory `public`.

---

## What is in the box

| Path | What it is |
| --- | --- |
| `public/` | **The website.** This is the only folder that gets deployed. |
| `public/index.html` | The landing page. All English copy lives directly in this file. |
| `public/privacy.html` | Privacy policy, cookie table and imprint (GDPR). |
| `public/404.html` | Friendly not-found page. |
| `public/assets/css/styles.css` | Design system + all layout. One file, organised by section. |
| `public/assets/js/config.js` | **Start here when configuring.** Launch date, languages, GA4 ID, form endpoint. |
| `public/assets/js/main.js` | UI behaviour (nav, tabs, countdown, FAQ, video, consent, reveal). |
| `public/assets/js/forms.js` | Waiting-list forms: validation, spam protection, submit, confirmation. |
| `public/assets/js/i18n.js` | Language detection, switching, country-name localisation. |
| `public/assets/js/analytics.js` | GA4 behind consent (Consent Mode v2). |
| `public/assets/js/i18n/*.json` | Translations. `pl.json` and `de.json` are live; `en.json` is the translator template. |
| `public/assets/img/screens/` | Optimised WebP exports of the Loqelo UI screens. |
| `public/assets/video/loqelo-promo.mp4` | The promotional film (1920×1080, 82 s). |
| `src/icons/` | The 60 source SVG icons. `public/assets/icons/sprite.svg` is built from them. |
| `src/brand/` | Brand masters moved out of the deploy folder (white logo, large mark). |
| `docs/` | User manual, deployment, forms, analytics, licences, handover checklist. |
| `netlify.toml` | Build settings, security headers and the 404 rule for Netlify. |

---

## The five things you will change most often

1. **Launch date / countdown** → `public/assets/js/config.js`, `launchDate`.
2. **Analytics** → put your GA4 measurement ID in `config.js` (`ga4: 'G-XXXXXXXXXX'`).
   Empty means no analytics at all and no cookies — the default is privacy-safe.
3. **Copy** → edit `public/index.html` directly (data attributes like `data-i18n="hero.sub"`
   are the translation keys; leave them in place).
4. **Another language** → copy `pl.json`, translate the values, add the language to `langs`
   in `config.js`. Nothing else to change.
5. **Form destination** → `config.js`: `formMode: 'netlify'` (default, zero config) or
   `'endpoint'` + `formEndpoint` for Formspree/Basin/your own API.

---

## Languages

| Language | Where the text lives |
| --- | --- |
| English (default) | Inside `index.html` — so the page is fully readable without JavaScript |
| Polish, German | `public/assets/js/i18n/pl.json`, `de.json` |

The language is chosen in this order: `?lang=pl` → a saved choice → the browser's
preferred languages → English. Country names inside the form are localised automatically
from ISO codes using the browser's `Intl.DisplayNames`, so they never need translating.

---

## Forms and contacts

Two separate forms — `waitlist-customers` and `waitlist-providers` — so customers and
providers never mix. Submissions include email, country, individual/business, the consent
record, language, page and UTM parameters. No PII is ever sent to analytics.

On Netlify, submissions appear under **Forms**, are filterable per form and export to CSV.
See [docs/03-forms-and-contacts.md](docs/03-forms-and-contacts.md) for the alternatives and
for the recommended way to send the actual launch emails.

---

## Accessibility & performance notes

- Semantic landmarks, skip link, visible focus states, `aria-*` on all interactive widgets,
  keyboard support for tabs, FAQ, language menu and the video dialog.
- `prefers-reduced-motion` disables every animation and reveal transition.
- Content is visible without JavaScript; scripts only add behaviour.
- Images are WebP, lazily loaded below the fold; the two fonts are preloaded variable files
  (350 KB total) and the video is only fetched when a visitor presses play.

## Browser support

Current Chrome, Edge, Firefox and Safari (desktop and mobile). The layout uses
`aspect-ratio`, `:has()`, container-free grid and CSS custom properties; older browsers get a
simpler but fully usable page.

---

## Licence

Site code and layout: delivered to Loqelo for this project.
Fonts: Outfit and DM Sans, SIL Open Font License 1.1 (licence files in `public/assets/fonts/`).
Photography: Pixabay Content License — see [docs/05-licences-and-costs.md](docs/05-licences-and-costs.md).
Logo, UI screens and the promotional film are Loqelo's own assets.
