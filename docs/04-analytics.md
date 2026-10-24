# Analytics

GA4, behind consent, measuring exactly the four questions in the brief — and nothing that
identifies a person.

---

## Turning it on

1. Create a GA4 property at <https://analytics.google.com> (Admin → Create property).
2. Copy the **Measurement ID** — it looks like `G-ABC123XYZ`.
3. Open `public/assets/js/config.js` and set:

   ```js
   ga4: 'G-ABC123XYZ',
   ```

4. Redeploy. Done.

**While `ga4` is empty the site loads no analytics script, sets no cookie and sends no
network request to Google.** That is the default, and it is a valid permanent choice if you
only need the waiting list.

---

## Consent, precisely

- Before a visitor chooses, nothing is loaded. Events are only queued in memory.
- **Accept** → `gtag.js` is injected, Consent Mode v2 is set to `analytics_storage:
  granted`, `ad_storage` / `ad_user_data` / `ad_personalization` stay **denied** forever
  (no ads, no remarketing), and the queued events are flushed.
- **Decline** → nothing loads, the queued events are dropped.
- The decision is stored in `localStorage` under `loqelo.consent`. Visitors can change it
  from **Cookie settings** in the footer, which also deletes any `_ga*` cookies.

This is why the site is cookie-free until someone opts in, and why the privacy policy can
state that plainly.

---

## Event reference

| Event | Fires when | Parameters | Use it for |
| --- | --- | --- | --- |
| `page_view` | page load, and again on language switch | `page_language`, `page_location` | traffic volume per language |
| `cta_click` | any primary button is clicked | `target` (anchor), `label` | which CTA converts |
| `screens_tab` | a platform screenshot tab is opened | `tab_index` | which part of the product interests visitors |
| `video_play` | the promo film is opened | – | film engagement |
| `faq_open` | an FAQ row is expanded | `question_index` | objections people have |
| `waitlist_submit` | a valid form is sent, before the response | `audience`, `account_type`, `page_language` | intent |
| `waitlist_success` | the backend accepted the submission | `audience`, `page_language` | **the conversion** |
| `waitlist_error` | validation failed or the request failed | `audience`, `reason` (`validation` \| `network`), `page_language` | form friction |
| `language_change` | the visitor switches language | `language` | which languages to invest in |
| `consent_choice` | Accept or Decline is pressed | `choice` | how many people refuse analytics |
| `contact_click` | a `mailto:` link is clicked | `target` | direct contact demand |

### What is deliberately **not** sent

- No email addresses, ever.
- No form field values — not even the country the visitor selected.
- No user IDs, no advertising signals, no IP-based profiling beyond Google's standard
  anonymised geo.

Country statistics come from GA4's own `Country` dimension (derived from an anonymised IP
by Google), not from the form. That keeps the promise in the privacy policy literally true
and keeps the analytics property free of personal data.

---

## Marking the conversion

In GA4: **Admin → Events → Create event** (or **Key events** in newer UIs):

1. Mark `waitlist_success` as a **key event** (conversion).
2. Optional: create an audience or a comparison for `audience = provider` to track the
   supply side separately from the demand side — the brief asks for both numbers.

Then in **Explore → Free form**, put `audience` as the breakdown to get the
"customer vs provider sign-ups" figure directly.

### Funnel you can build immediately

```
page_view  →  waitlist_submit  →  waitlist_success
```

with `waitlist_error` broken out by `reason` as the diagnostic. Form effectiveness =
`waitlist_success / page_view` (or / `cta_click` for the tighter funnel).

---

## Other traffic sources

- **Search Console** — verify `loqelo.com`, submit `sitemap.xml`. The page ships with
  `Organization`, `WebSite` and `FAQPage` structured data, so FAQ results are possible.
- **Campaign links** — the forms capture `utm_*` values, so you can attribute sign-ups to a
  specific campaign even without analytics consent.
- **Netlify Analytics** (paid add-on) — server-side page counts, no cookies at all. A useful
  fallback figure if many visitors decline the banner.

---

## If you switch to a cookieless tool

Plausible, Fathom or Umami can replace GA4 with a single script tag and no consent banner
requirement under most EU interpretations. To do that: replace the `analytics.start()`
implementation in `assets/js/analytics.js` with your provider's snippet and keep the
`analytics.track()` calls as they are — the event names do not need to change. If you do
this, update the privacy policy's cookie table and the consent banner text accordingly.
