# Licences and running costs

The brief asks for an explicit answer to: *does this require paid licences or
subscriptions?* Short answer: **no, not to launch.** Everything below is free at the
expected volume, with the paid upgrade only relevant if the waiting list takes off.

---

## Assets shipped with the site

| Asset | Source | Licence | Cost |
| --- | --- | --- | --- |
| Loqelo logo (SVG, PNG), icon | Supplied by Loqelo | Loqelo's own | – |
| UI screens (`assets/img/screens/*.webp`) | Exported from the supplied Loqelo UI kit | Loqelo's own | – |
| Promotional film (`assets/video/loqelo-promo.mp4`) | Supplied by Loqelo | Loqelo's own | – |
| Outfit (variable font) | Google Fonts, by Rodrigo Fuenzalida | **SIL Open Font License 1.1** — commercial use, self-hosting, embedding and subsetting allowed | free |
| DM Sans (variable font) | Google Fonts, by Colophon Foundry / Jonny Pinhorn | **SIL Open Font License 1.1** | free |
| Photos: `people-customer.webp`, `people-pro.webp` | Pixabay, used in the supplied UI design | **Pixabay Content License** — commercial use, no attribution required | free |
| Icon set (`assets/icons/sprite.svg`) | Supplied with the Loqelo UI kit | Loqelo's own | free |

The OFL licence texts are shipped next to the fonts in `public/assets/fonts/` (`Outfit-OFL.txt`,
`DMSans-OFL.txt`). The OFL requires them to travel with the font files, so **do not delete
them**. Both files are subset to Latin + Latin Extended-A (which covers Polish and German);
the unmodified originals are kept in `src/fonts/`. Subsetting is explicitly permitted by the
OFL. The photo provenance list is `public/assets/img/PHOTO-LICENCES.txt`.

Nothing in the site uses an icon font, a paid stock library, a page builder or a licensed
theme. There is no per-seat software to buy.

---

## Hosting

| Option | Free tier | What it covers | When you would pay |
| --- | --- | --- | --- |
| **Netlify** | 100 GB bandwidth/month, 300 build minutes, **100 form submissions/month**, free HTTPS | the whole site including forms | ~$19/month Pro if form volume passes 100/month or you need password protection |
| Vercel | 100 GB bandwidth | site only — no form backend | $20/month Pro; forms need an external service anyway |
| Cloudflare Pages | unlimited requests, unlimited bandwidth | site only; `_headers` supported | free tier is genuinely generous; forms need an external service |
| Any shared host the client already owns | — | static files | existing cost |

For a pre-launch waiting list, the Netlify free tier is normally enough. The one number to
watch is **100 form submissions per month** — if the campaign is successful that is the
first limit you will hit, and it is the only realistic reason to upgrade.

---

## Services you may choose to add

| Service | Free | Paid trigger |
| --- | --- | --- |
| GA4 | unlimited, free | – |
| Google Search Console | free | – |
| Formspree (if not using Netlify Forms) | 50 submissions/month | ~$8–10/month for more |
| Brevo / MailerLite (launch emails) | ~300 emails/day / ~1,000 contacts | scales with list size |
| Cloudflare Turnstile (spam) | free | – |
| Domain `loqelo.com` | – | already owned by the client (annual registrar fee) |
| TLS certificate | free (Let's Encrypt via the host) | – |

---

## Domain and email

The brief says Loqelo provides the domain, hosting and email accounts. The site assumes:

- `https://loqelo.com` serves the site,
- `hello@loqelo.com` and `privacy@loqelo.com` exist and are monitored (both are linked from
  the page — the privacy address is the GDPR contact),
- `www.loqelo.com` redirects to the canonical host.

If you prefer a different canonical host, update the `canonical`, `og:url`, `og:image`
and `twitter:image` values in `index.html` and `privacy.html`, the `baseUrl` in
`config.js`, and `public/sitemap.xml`.

---

## What is *not* included

Being explicit, so nothing is discovered late:

- **No CMS.** Copy is edited in the HTML file. A CMS (Sanity, Decap, Storyblok) can be added
  later, but for one landing page it would add a dependency and a monthly cost for very
  little benefit. The page is deliberately structured in clearly labelled sections so an
  editor can find the text quickly.
- **No bulk-email sending.** The site collects the list; a separate tool sends the launch
  emails (see docs/03).
- **No payment processing, no user accounts, no provider directory.** The pre-launch site
  explains the product and captures interest; the platform itself is the product.
- **No translation service.** Polish and German are included; further languages cost
  translation time, not licence fees.

---

## Third-party code

There is none in the page itself — no jQuery, no Bootstrap, no analytics bootstrapped by a
plugin. The only external request ever made is to `googletagmanager.com`, and only after a
visitor accepts analytics. This is why the page is fast and why the consent story is simple
to explain.
