# Deployment

The site is static. Deployment means copying `public/` to a web server. Below is the
recommended path (Netlify, because the forms work with zero configuration), then the
alternatives and what changes with each.

**Nothing on this list requires a paid plan for the traffic a pre-launch waiting list
generates.**

---

## Recommended: Netlify

### 1. Put the folder live

**Option A — drag and drop (fastest, fine for a first preview)**

1. Sign in at <https://app.netlify.com>.
2. Go to **Sites → Add new site → Deploy manually**.
3. Drag the `public` folder onto the drop zone.
4. You get a URL like `https://loqelo-preview.netlify.app`.

**Option B — connect a repository (recommended for the real launch)**

1. Push this project to GitHub/GitLab/Bitbucket.
2. In Netlify: **Add new site → Import an existing project**, pick the repository.
3. Settings Netlify reads from `netlify.toml` automatically:
   - **Publish directory:** `public`
   - **Build command:** *(none)*
4. Deploy.

### 2. Connect loqelo.com

1. Netlify → **Domain management → Add a domain** → `loqelo.com`.
2. At the domain registrar, point the DNS at Netlify:
   - `loqelo.com` → **CNAME** `apex-loadbalancer.netlify.com` (or an **A** record to
     Netlify's load balancer IP shown in the dashboard)
   - `www` → **CNAME** to your Netlify site name
3. Netlify issues the HTTPS certificate (Let's Encrypt) automatically once DNS resolves.
4. Turn on **Force HTTPS** and pick the primary domain (`loqelo.com` or `www.loqelo.com`).

> The `canonical`, Open Graph and sitemap URLs in the HTML already say `https://loqelo.com`.
> If you launch on a different domain, update those strings in `index.html` and
> `privacy.html`, plus `baseUrl` in `config.js` and the URLs in `public/sitemap.xml`.

### 3. Turn the forms on

Nothing to do. Both forms carry `data-netlify="true"` and a `name`, so Netlify detects them
on the first deploy. Visit the site, submit each form once yourself, then check
**Site → Forms**. Delete your two test submissions.

**Forms → Settings → Form notifications** lets you add an email or Slack alert per form.

### 4. Add analytics

See [04-analytics.md](04-analytics.md). Short version: paste the GA4 ID into
`public/assets/js/config.js`, commit, redeploy.

---

## Alternatives

### Vercel

1. Import the repository at <https://vercel.com/new>.
2. Framework preset: **Other**. Output directory: `public`. No build command.
3. Deploy and add the domain under **Settings → Domains**.

⚠️ **Vercel does not process Netlify Forms.** Choose one of:

- point `formMode` at an external endpoint (Formspree / Basin / your API) — see
  [03-forms-and-contacts.md](03-forms-and-contacts.md), or
- move the two form handlers to a Vercel serverless function that writes to Airtable,
  Google Sheets or Resend.

`netlify.toml` is ignored by Vercel; copy the header rules into `vercel.json` if you want
the same security headers (the equivalent block is included in `public/_headers`).

### Cloudflare Pages

1. **Workers & Pages → Create → Pages → Connect to Git.**
2. Build command: none. Build output directory: `public`.
3. `public/_headers` is picked up automatically by Cloudflare — the security and caching
   rules work unchanged.
4. Forms: Cloudflare has no built-in form backend. Use an external endpoint, or a Worker.

### Any shared host / cPanel / S3

Upload the contents of `public/` to the web root. Then:

- enable HTTPS (required by the CSP and by GA4),
- make `index.html` the directory index,
- configure the server to serve `404.html` for missing files,
- add the headers from `public/_headers` (Apache: `.htaccess` with `Header set …`).

Forms need an external endpoint in this setup (`formMode: 'endpoint'`).

### GitHub Pages

Works for a static preview, but you cannot serve custom headers (`_headers` is ignored),
`404.html` is supported, and forms need an external endpoint. Directory-level `.nojekyll`
may be required so the `_headers` file is not filtered.

---

## Environment checklist before going live

- [ ] `https://loqelo.com` resolves, redirects to one canonical host, and shows a padlock
- [ ] `https://loqelo.com/sitemap.xml` and `/robots.txt` load
- [ ] Both forms deliver a submission that appears in the form backend
- [ ] Submitting the forms sends **no** request to Google Analytics before consent
- [ ] `config.js` has the real GA4 ID (or is deliberately left empty)
- [ ] The privacy policy's `[Legal entity name]`, address and register number are filled in
- [ ] The countdown target matches the announced launch date
- [ ] Tested on an actual phone, not only in a responsive preview
- [ ] Google Search Console property created and the sitemap submitted
- [ ] Backups: keep the repository private and give the client access (see handover checklist)

---

## Rollback

Netlify keeps every deploy. **Deploys → pick a previous deploy → Publish deploy** restores
it in seconds. Do this rather than editing files on the live server.
