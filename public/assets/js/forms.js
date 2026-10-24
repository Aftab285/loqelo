/* =========================================================================
   Waiting-list forms.

   Two separate forms (customers / providers) so the two audiences never mix
   in your inbox or CRM. Works with Netlify Forms out of the box, or with any
   JSON endpoint (Formspree, Basin, your own API…). Includes honeypot,
   submission-time trap, throttling and optional Cloudflare Turnstile.
   ========================================================================= */

import { analytics } from './analytics.js';

const CFG = window.LOQELO || {};
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const MIN_FILL_MS = 2000;
const THROTTLE_MS = 15000;

const qs = (s, r = document) => r.querySelector(s);
const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

let lastSubmit = 0;

function setFieldError(input, invalid) {
  const field = input.closest('.field');
  if (field) field.classList.toggle('is-invalid', invalid);
  input.setAttribute('aria-invalid', invalid ? 'true' : 'false');
}

function setConsentError(checkbox, invalid) {
  const wrap = checkbox.closest('.consent');
  if (wrap) wrap.classList.toggle('is-invalid', invalid);
  checkbox.setAttribute('aria-invalid', invalid ? 'true' : 'false');
}

function showMessage(form, text) {
  const box = qs('.form-msg', form.parentElement) || qs('.form-msg', form);
  if (!box) return;
  if (!text) {
    box.classList.remove('is-error');
    box.textContent = '';
    return;
  }
  box.classList.add('is-error');
  box.innerHTML = '<svg aria-hidden="true"><use href="#ico-warn"></use></svg><span></span>';
  box.lastElementChild.textContent = text;
}

function validate(form) {
  const email = qs('input[name="email"]', form);
  const country = qs('select[name="country"]', form);
  const consent = qs('input[name="consent"]', form);
  const invalid = [];

  const emailOk = EMAIL_RE.test((email.value || '').trim());
  setFieldError(email, !emailOk);
  if (!emailOk) invalid.push(email);

  const countryOk = Boolean(country.value);
  setFieldError(country, !countryOk);
  if (!countryOk) invalid.push(country);

  const consentOk = consent.checked;
  setConsentError(consent, !consentOk);
  if (!consentOk) invalid.push(consent);

  if (invalid.length) invalid[0].focus();
  return invalid.length === 0;
}

function payload(form) {
  const data = new FormData(form);
  const out = {};
  data.forEach((v, k) => {
    if (k === 'bot-field') return;
    out[k] = typeof v === 'string' ? v.trim() : v;
  });
  out.submitted_at = new Date().toISOString();
  out.page_language = document.documentElement.lang || 'en';
  out.referrer = document.referrer || '';
  const params = new URLSearchParams(location.search);
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((k) => {
    if (params.get(k)) out[k] = params.get(k);
  });
  return out;
}

async function send(form, data) {
  const mode = CFG.formMode || 'netlify';

  if (mode === 'endpoint' && CFG.formEndpoint) {
    const res = await fetch(CFG.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return;
  }

  /* Netlify Forms: post the fields as a URL-encoded body to the site root. */
  const body = new URLSearchParams();
  Object.entries(data).forEach(([k, v]) => body.append(k, v));
  body.append('form-name', form.getAttribute('name'));
  const res = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
}

function showSuccess(form) {
  const card = form.closest('.wl-body') || form.parentElement;
  const success = qs('.wl-success', card);
  form.hidden = true;
  if (success) {
    success.classList.add('is-active');
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const heading = qs('h3', success);
    if (heading) heading.setAttribute('tabindex', '-1'), heading.focus({ preventScroll: true });
  }
}

function resetForm(form) {
  const card = form.closest('.wl-body') || form.parentElement;
  const success = qs('.wl-success', card);
  form.hidden = false;
  form.reset();
  form.dataset.t0 = String(Date.now());
  showMessage(form, '');
  qsa('.field', form).forEach((f) => f.classList.remove('is-invalid'));
  qsa('.consent', form).forEach((f) => f.classList.remove('is-invalid'));
  if (success) success.classList.remove('is-active');
  const email = qs('input[name="email"]', form);
  if (email) email.focus({ preventScroll: true });
}

function wire(form) {
  const audience = form.dataset.form === 'provider' ? 'provider' : 'customer';
  form.dataset.t0 = String(Date.now());

  /* start the "how long did a human take" clock at first interaction */
  const touch = () => { if (!form.dataset.t1) form.dataset.t1 = String(Date.now()); };
  form.addEventListener('focusin', touch, { once: true });
  form.addEventListener('input', touch, { once: true });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    showMessage(form, '');

    /* 1 — bot trap */
    const honey = qs('input[name="bot-field"]', form);
    if (honey && honey.value) {
      if (CFG.debug) console.warn('[form] honeypot triggered — ignored');
      return;
    }

    /* 2 — bots submit without ever focusing or typing in the form */
    const interacted = Boolean(form.dataset.t1);
    const started = Number(form.dataset.t1 || form.dataset.t0 || Date.now());
    if (!interacted && Date.now() - started < MIN_FILL_MS) {
      if (CFG.debug) console.warn('[form] submitted too fast and never touched — ignored');
      return;
    }

    /* 3 — throttle */
    if (Date.now() - lastSubmit < THROTTLE_MS) {
      showMessage(form, form.dataset.msgSlow || 'Please wait a moment before trying again.');
      return;
    }

    /* 4 — field validation */
    if (!validate(form)) {
      analytics.track('waitlist_error', { audience, reason: 'validation', page_language: document.documentElement.lang });
      return;
    }

    const btn = qs('button[type="submit"]', form);
    const data = payload(form);
    btn.classList.add('is-loading');
    btn.disabled = true;

    analytics.track('waitlist_submit', {
      audience,
      account_type: data.account_type || 'unspecified',
      page_language: document.documentElement.lang
    });

    try {
      await send(form, data);
      lastSubmit = Date.now();
      analytics.track('waitlist_success', { audience, page_language: document.documentElement.lang });
      showSuccess(form);
      /* keep the address out of analytics but allow other listeners to react */
      form.dispatchEvent(new CustomEvent('loqelo:submitted', { detail: { audience }, bubbles: true }));
    } catch (err) {
      console.error('[form] submit failed', err);
      analytics.track('waitlist_error', { audience, reason: 'network', page_language: document.documentElement.lang });
      showMessage(form, form.dataset.msgError || 'Something went wrong. Please try again, or email hello@loqelo.com.');
    } finally {
      btn.classList.remove('is-loading');
      btn.disabled = false;
    }
  });

  qsa('[data-reset-form]', form.closest('.wl-body') || document).forEach((b) => {
    b.addEventListener('click', () => resetForm(form));
  });
}

export function initForms() {
  qsa('form[data-form]').forEach(wire);
}

/** Switch the visible waiting-list tab (used by the audience CTAs). */
export function selectAudience(audience) {
  const isPro = audience === 'provider';
  const tab = document.getElementById(isPro ? 'wlTabPro' : 'wlTabCust');
  if (tab) tab.click();
}
