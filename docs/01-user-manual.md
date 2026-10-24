# User manual

For whoever looks after the Loqelo launch site day to day. No technical knowledge needed
beyond editing a text file and dragging a folder.

---

## 1. Previewing the site on your computer

1. Install [Node.js](https://nodejs.org) (any current version).
2. Open a terminal in the project folder and run:

   ```
   node tools/serve.mjs public 5500
   ```

3. Open <http://127.0.0.1:5500> in your browser.

That local preview is only for you — the live site is deployed separately
(see [02-deployment.md](02-deployment.md)).

---

## 2. Changing text

All English copy is in **`public/index.html`**. Open it in any code editor (VS Code,
Notepad++, Sublime) and search for the sentence you want to change — the copy is plain text
inside the markup.

```html
<p class="hero-sub" data-i18n="hero.sub">One sentence is all it takes. …</p>
```

Change only the words **between** the tags. Leave everything inside `< >` alone, and leave
`data-i18n="…"` in place — that attribute is the key the Polish and German translations are
looked up by.

If you want a translator to update Polish or German, ask them to edit
`public/assets/js/i18n/pl.json` and `de.json`. The keys must stay identical; only the values
change.

### Copy that is not in index.html

| What | Where |
| --- | --- |
| Privacy policy text | `public/privacy.html` |
| Page title + search description | `<title>` and `<meta name="description">` at the top of `index.html` |
| Social sharing image | `public/assets/img/og/og-cover.jpg` (1200 × 630) |
| Launch date in the countdown | `public/assets/js/config.js` → `launchDate` |

---

## 3. Changing the launch date

1. Open `public/assets/js/config.js`.
2. Edit one line:

   ```js
   launchDate: '2027-02-01T00:00:00+01:00',
   ```

   The countdown ticks down to that exact moment. Keep the timezone offset (`+01:00` for
   Central European Time in winter).

3. The dates written in the copy ("February 2027", the roadmap) are normal text — search
   `index.html` for `2027` and update them by hand if the plan changes.

---

## 4. Replacing images

| Image | File | Recommended size |
| --- | --- | --- |
| Social sharing card | `public/assets/img/og/og-cover.jpg` | 1200 × 630, JPG under 300 KB |
| Customer card photo | `public/assets/img/people-customer.webp` | 900 × 600, WebP |
| Provider card photo | `public/assets/img/people-pro.webp` | 900 × 507, WebP |
| Film still (poster) | `public/assets/img/poster.webp` + `poster.jpg` | 1600 × 900 |
| Platform screens | `public/assets/img/screens/*.webp` | 1760 px wide, WebP |
| Favicon / app icon | `public/assets/img/favicon-32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` | square |

To convert a JPG or PNG to WebP, use <https://squoosh.app> (free, runs in the browser) and
keep the same file name. If you replace a platform screenshot, keep the width around
1760 px so the browser frames stay sharp.

**Alt text matters.** Every `<img>` has an `alt` attribute describing it for screen readers
and for when the image fails to load. Update it when you swap a picture.

### Fonts

The two fonts are self-hosted, variable-weight files, **subset** to the Latin and
Latin-Extended character sets that English, Polish and German need — that halved their size.
The full originals live in `src/fonts/`.

If you add a language with characters outside Latin-1 / Latin Extended-A (Greek, Cyrillic,
Vietnamese, Chinese…), the new glyphs will fall back to the visitor's system font. Either
re-subset the fonts from `src/fonts/`, or add a webfont for that script. The licences (SIL
OFL) allow both.

---

## 5. The waiting list: where do the sign-ups go?

Two forms, kept separate on purpose:

| Form name | Who it is for | Fields |
| --- | --- | --- |
| `waitlist-customers` | people who will hire providers | email, country, individual/business, consent |
| `waitlist-providers` | trades and service businesses | email, country, individual/business, consent |

On Netlify they land in **Site → Forms**, one tab per form. You can:

- read individual submissions,
- **export to CSV** (button at the top right of the form view),
- set up an email or Slack notification per form,
- mark submissions as spam.

Each submission also records the language used, the page it came from, the campaign
parameters of the link (if any), and the exact moment consent was given — that last one
matters if anyone ever asks you to prove consent.

Full details, including how to send the actual launch emails and how to switch to a
different form provider: [03-forms-and-contacts.md](03-forms-and-contacts.md).

---

## 6. Reading the numbers

Analytics is **off by default**. Once a GA4 measurement ID is added to
`config.js`, the site starts collecting after each visitor accepts the cookie banner.

The four questions from the brief map to GA4 like this:

| Question | Where to look |
| --- | --- |
| How many people visit? | Reports → Engagement → Overview (users, sessions) |
| Which countries? | Reports → User → Demographics details → Country |
| How many customer / provider sign-ups? | Reports → Engagement → Events → `waitlist_success`, split by the `audience` parameter |
| How effective are the forms? | Conversion rate = `waitlist_success` ÷ `waitlist_view` (set both up as key events) |

The full event reference is in [04-analytics.md](04-analytics.md).

---

## 7. Adding or changing a language

1. Open `public/assets/js/i18n/pl.json` and save a copy named after the new language
   (for example `es.json`).
2. Translate every value. Keep the keys, the HTML tags inside values (`<a>`, `<b>`,
   `<span>`), and the quoted characters exactly as they are.
3. Open `public/assets/js/config.js` and add the language:

   ```js
   langs: [
     { code: 'en', label: 'English', short: 'EN' },
     { code: 'pl', label: 'Polski',  short: 'PL' },
     { code: 'de', label: 'Deutsch', short: 'DE' },
     { code: 'es', label: 'Español', short: 'ES' }
   ],
   ```

That is all. The switcher, the saved preference, the automatic detection and the localised
country names all follow automatically.

`en.json` is not loaded by the site — English lives in `index.html`. It exists so a
translator has the complete list of keys with the approved English wording.

---

## 8. What not to touch

- **`assets/js/i18n/*.json` keys** — renaming a key silently drops that translation.
- **The `data-i18n` attributes** in `index.html` — same reason.
- **The hidden `form-name` inputs and the `name` attributes on the two forms** — Netlify
  routes submissions by those names. Changing them creates a new, empty form.
- **`netlify.toml`** — it sets the security headers and the 404 page. Edit only if you know
  what the directives do.

---

## 9. When something looks wrong

| Symptom | Likely cause |
| --- | --- |
| A section is blank | JavaScript failed to load — check the browser console, and confirm `assets/js/main.js` exists at that path |
| Text shows `data-i18n="…"` | The attribute was pasted into the visible text by mistake |
| The wrong language appears | The visitor's browser language was matched — they can switch with the selector in the header, or you can force one with `?lang=en` |
| Form says "Something went wrong" | The form endpoint is unreachable or the site is not deployed on Netlify while `formMode` is still `'netlify'` — see docs/03 |
| Countdown shows all zeros | `launchDate` is in the past |
| No analytics | Expected until you add a GA4 ID **and** a visitor accepts the banner |

Still stuck? The complete configuration surface is three files:
`config.js`, `index.html`, `styles.css`.
