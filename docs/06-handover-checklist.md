# Handover checklist

Everything that must be decided or filled in before the site is publicly announced.
Work top to bottom; each item is something a person has to do, not something the code does.

---

## 1. Before the first public deploy

| # | Item | Where | Owner |
| --- | --- | --- | --- |
| 1 | Fill in the controller's legal name, registered address and company/VAT number | `public/privacy.html` — sections **1. Who we are** and **13. Imprint**, both contain `[placeholders]` | Client |
| 2 | Have the privacy policy reviewed by whoever handles data protection | `public/privacy.html` | Client |
| 3 | Create the GA4 property and paste the measurement ID, or decide to ship without analytics | `public/assets/js/config.js` → `ga4` | Client / developer |
| 4 | Confirm the launch date (countdown + all "2027" copy) | `config.js` → `launchDate`; search `index.html` for `2027` | Client |
| 5 | Confirm the markets named on the page (currently the Netherlands, Poland, Germany) | `index.html` — `.chips` block in the launch section, and FAQ answer 2 | Client |
| 6 | Make sure `hello@loqelo.com` and `privacy@loqelo.com` exist and are monitored | mail provider | Client |
| 7 | Decide where the sign-ups should land (Netlify Forms or an external endpoint) | `config.js` → `formMode` | Client / developer |
| 8 | Deploy and submit both forms once; delete the test submissions | Netlify / form backend | Developer |
| 9 | Set up a form notification so a new sign-up actually reaches someone | Netlify → Forms → Settings → notifications | Developer |

## 2. Access to hand over

- [ ] Hosting account (Netlify team) with the client as **Owner**, developer as collaborator
- [ ] Repository access (GitHub/GitLab) — the client owns the origin repository
- [ ] Domain registrar access or a delegated DNS user
- [ ] GA4 property access (Administrator for the client, Editor for the developer)
- [ ] Search Console ownership of `loqelo.com`
- [ ] Email marketing tool account (if one is created for launch emails)
- [ ] This folder — `public/` is the deployable artefact and `src/` the asset sources; both
      are needed to keep working on the site

## 3. Quality checks (already passing in this build)

- [x] All internal links and asset references resolve
- [x] Every image has descriptive `alt` text
- [x] No horizontal overflow at 390, 834, 1440 and 1728 px
- [x] No JavaScript console errors on any page
- [x] Content and forms work with JavaScript disabled (forms post natively in Netlify mode)
- [x] Language switcher, saved preference and `?lang=` parameter all work
- [x] Consent gate: no request to Google before Accept
- [x] `prefers-reduced-motion` removes every animation
- [x] 404 page, `robots.txt`, `sitemap.xml`, canonical tags, Open Graph, JSON-LD present

## 4. Things the client should re-check on their own devices

- [ ] iPhone Safari and Android Chrome — real hardware, not a simulator
- [ ] A slow connection (Chrome DevTools → Network → Slow 4G): the hero screenshot should
      appear before the film is downloaded
- [ ] A 1366 × 768 laptop — the most common small desktop window
- [ ] Keyboard only: Tab through the header, the tabs, the form, the FAQ and the video modal
- [ ] Screen reader spot check (VoiceOver or NVDA) on the hero and the form

## 5. Known limitations, stated openly

1. **The legal text is a complete, usable draft, not legal advice.** It needs the
   company's details and a review.
2. **The privacy policy is English only.** Polish and German versions should be prepared if
   the site is marketed in those markets; section 13 (imprint) has requirements that differ
   per country.
3. **The waiting list is export-only.** There is no CRM integration out of the box; the CSV
   is the integration point. This matches the brief ("export data to CSV").
4. **The promo film is 19 MB.** It is only downloaded when a visitor presses play, so it does
   not affect page load, but on a slow connection the first frame takes a moment. A
   re-encode at ~6 MB or a version hosted on YouTube/Vimeo would remove that delay.
5. **The platform screenshots are static images.** They are not live demos. The captions
   say so ("Screens from the Loqelo UI kit. Final details may differ slightly").
6. **Logo files.** The header/footer use the supplied SVG, whose wordmark already includes
   the `.com`. If a lockup without `.com` is preferred, drop in a replacement SVG with the
   same `viewBox` and nothing else needs to change.

## 6. Optional next steps, in order of value

1. **Double opt-in** on the waiting list (a confirmation email before someone counts as
   subscribed) — the strongest GDPR position, and a filter for typos.
2. **A reusable confirmation email** branded like the site.
3. **More languages** if the campaign targets markets outside PL/DE — the structure is there.
4. **A second landing page per audience** (customers vs providers) with its own message and
   campaign link, if paid traffic for the two groups is bought separately.
5. **A live product demo** (recorded walkthrough or an interactive prototype) to replace the
   static screenshots.

---

## Sign-off

| | Name | Date |
| --- | --- | --- |
| Delivered by | | |
| Accepted by (client) | | |
| Legal text reviewed by | | |
| Analytics confirmed by | | |
