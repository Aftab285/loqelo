# Forms and contacts

The brief asks for two audiences, a consent mechanism, CSV export, and the ability to
distinguish customers from providers. This is how that is implemented.

---

## Two forms, one page

| Form name | Audience | Visible when |
| --- | --- | --- |
| `waitlist-customers` | people who need services | the "I need services" tab |
| `waitlist-providers` | trades and service businesses | the "I provide services" tab |

Both live in the same card as two tabs, but they are two independent `<form>` elements with
their own `name`. That means the backend sees two separate lists, not one mixed export.

### Fields collected

| Field | Required | Notes |
| --- | --- | --- |
| `email` | yes | validated in the browser and by the backend |
| `country` | yes | ISO 3166-1 alpha-2 code (e.g. `PL`), 239 countries |
| `account_type` | optional | `individual` or `business` |
| `consent` | yes | must be ticked; stored as `yes` |
| `audience` | auto | `customer` or `provider` |
| `form-name` | auto | routes the submission to the right Netlify form |
| `language` | auto | interface language at the time (`en`, `pl`, `de`) |
| `page`, `source` | auto | `/` and `prelaunch-landing` |
| `submitted_at` | auto | ISO timestamp — the consent record |
| `referrer` | auto | where the visitor came from |
| `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` | auto | only if present in the URL |
| `bot-field` | hidden | honeypot; must stay empty |

No other data is collected. Nothing is stored in the visitor's browser beyond the language
choice and the cookie decision.

---

## Option A — Netlify Forms (default, free)

`public/assets/js/config.js`:

```js
formMode: 'netlify',
```

Nothing else to set up. Netlify detects both forms at deploy time from the
`data-netlify="true"` attribute.

**Where to find submissions:** Site → **Forms** → pick the form. Export with **Download
CSV**. The CSV is UTF-8 with a header row; the country column contains ISO codes, which
keeps the file clean and sorts predictably.

**Limits on the free plan:** 100 submissions per month per site, 10 MB per submission.
For a pre-launch waiting list this is usually plenty; if you expect more, the Pro plan or
Option B removes the cap. **Check the current limits before launch** — they change.

**Spam:** Netlify adds its own filtering on top of the honeypot and timing checks in
`forms.js`. Mark false positives in the Forms view.

---

## Option B — external endpoint (Formspree, Basin, your own API)

Use this if you deploy somewhere other than Netlify, or if you want the sign-ups to land
in a CRM/Sheets/Airtable directly.

```js
formMode: 'endpoint',
formEndpoint: 'https://formspree.io/f/xxxxxxxx',
```

The browser then POSTs JSON:

```json
{
  "form-name": "waitlist-providers",
  "audience": "provider",
  "email": "someone@example.com",
  "country": "PL",
  "account_type": "business",
  "consent": "yes",
  "language": "pl",
  "submitted_at": "2026-10-24T10:12:44.001Z",
  "page": "/",
  "source": "prelaunch-landing",
  "referrer": "https://…",
  "utm_source": "linkedin"
}
```

- **Formspree** (free: 50 submissions/month) — create two forms and use the same endpoint
  for both; the `audience` field distinguishes them. Or create two endpoints and swap the
  value by audience (requires a small code edit in `forms.js`).
- **Basin** — same idea, per-form endpoint.
- **Google Sheets** — a Google Apps Script web app deployed as "anyone" can receive the
  JSON and append a row. Remember: a spreadsheet is not a GDPR-grade system of record for
  consent; keep the timestamp column.
- **Your own API** — accept `POST` JSON and return any 2xx.

If the endpoint requires CORS, allow `https://loqelo.com` (and the Netlify preview domain
while testing). The CSP in `netlify.toml` / `_headers` already allows `https://formspree.io`
as a form action; add your own domain there if you use a different provider.

---

## Spam protection (all on by default)

| Layer | What it does |
| --- | --- |
| Honeypot | `bot-field` input is off-screen; bots fill it, humans never see it. Filled = silently discarded |
| Interaction check | a submit that arrives with no focus or typing in the form at all is treated as a bot |
| Timing | a submit within 2 s of page load with no interaction is discarded |
| Throttle | one submission per browser every 15 s |
| Validation | email format, country present, consent ticked |
| Provider filter | Netlify / Formspree apply their own spam scoring |

Optional extra: create a Cloudflare Turnstile site key and put it in `config.js`
(`turnstileSiteKey`), then add the widget to the form markup. The hook exists but is
deliberately not enabled, so the page ships with no third-party script.

---

## Handling consent properly

The consent checkbox is **unchecked by default**, sits in its own highlighted block, links to
the privacy policy, and is validated before submission. The stored record is `consent=yes`
plus the `submitted_at` timestamp and the `language` — together with this document that is
the evidence trail a supervisory authority would ask for.

Rules of thumb when you start emailing:

1. Only email people who ticked the box.
2. Every email needs a working one-click unsubscribe that takes effect immediately.
3. Honour deletion requests within 30 days — in practice: export the row, delete the
   submission in the form backend, and delete it from the email tool.
4. Do not import the list into an ad platform as a custom audience. The privacy policy
   promises you will not.

---

## Sending the actual launch emails

The website collects addresses; it does not send bulk email. Pick a tool that supports
double opt-in, unsubscribe links and CSV import — all of these have a free tier that covers
a few thousand contacts:

| Tool | Free tier (check current terms) | Notes |
| --- | --- | --- |
| Brevo (ex-Sendinblue) | ~300 emails/day | EU-based, generous free tier, good GDPR story |
| MailerLite | ~1,000 subscribers | simple, clean editor |
| Buttondown | ~100 subscribers | plain-text friendly, developer-oriented |
| Mailchimp | ~500 contacts | best known; free tier now quite limited |

Recommended flow: export the CSV from the form backend, import into the email tool, tag by
`audience` (customer/provider) and `country`, then send the launch announcement per country
as the markets open.

**Double opt-in:** even though consent was collected on the site, sending a confirmation
email before adding someone to the launch list is the safest interpretation of the GDPR.
Most of the tools above make this a one-click setting.

---

## Known limitation

There is no local database. If you delete a form in Netlify, its submissions go with it.
Export a CSV backup before changing your form setup.
