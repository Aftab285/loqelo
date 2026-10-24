/* =========================================================================
   i18n — language switching, locale detection, country-name localisation.

   English is the source language and lives directly in index.html, so the
   page is fully readable without JavaScript and nothing flashes on load.
   Every other language is fetched from assets/js/i18n/<code>.json and
   applied by key.
   ========================================================================= */

const CFG = window.LOQELO || {};
const SUPPORTED = (CFG.langs || [{ code: 'en' }]).map((l) => l.code);
const STORAGE_KEY = 'loqelo.lang';
const BASE = document.documentElement.dataset.base || '';

let current = CFG.defaultLang || 'en';
let dict = null;
const originals = new Map();
const listeners = new Set();

const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/** Remember the English copy that ships in the HTML. */
function snapshot() {
  qsa('[data-i18n], [data-i18n-html], [data-i18n-ph], [data-i18n-aria]').forEach((el) => {
    if (originals.has(el)) return;
    originals.set(el, {
      html: el.innerHTML,
      ph: el.getAttribute('placeholder'),
      aria: el.getAttribute('aria-label')
    });
  });
}

function lookup(key) {
  if (!dict) return undefined;
  return key.split('.').reduce((acc, part) => (acc && acc[part] != null ? acc[part] : undefined), dict);
}

function applyValue(el, key, isHtml) {
  const translated = lookup(key);
  if (translated == null) {
    /* no translation: put the original English markup back exactly as shipped,
       including inline elements such as the required-field marker */
    const orig = originals.get(el);
    if (!orig) return;
    if (el.hasAttribute('data-i18n-ph')) el.setAttribute('placeholder', orig.ph || '');
    else if (el.hasAttribute('data-i18n-aria')) el.setAttribute('aria-label', orig.aria || '');
    else el.innerHTML = orig.html;
    return;
  }
  if (el.hasAttribute('data-i18n-ph')) el.setAttribute('placeholder', translated);
  else if (el.hasAttribute('data-i18n-aria')) el.setAttribute('aria-label', translated);
  else if (isHtml || el.hasAttribute('data-i18n-html')) el.innerHTML = translated;
  else el.textContent = translated;
}

function applyAll() {
  qsa('[data-i18n]').forEach((el) => applyValue(el, el.dataset.i18n, false));
  qsa('[data-i18n-html]').forEach((el) => applyValue(el, el.dataset.i18nHtml, true));
  qsa('[data-i18n-ph]').forEach((el) => applyValue(el, el.dataset.i18nPh, false));
  qsa('[data-i18n-aria]').forEach((el) => applyValue(el, el.dataset.i18nAria, false));

  /* document-level strings */
  const title = lookup('meta.title');
  if (title) document.title = title;
  const desc = lookup('meta.desc');
  if (desc) {
    const m = document.querySelector('meta[name="description"]');
    if (m) m.setAttribute('content', desc);
  }

  document.documentElement.lang = current;

  /* hidden form field so submissions record the language used */
  qsa('input[name="language"]').forEach((i) => { i.value = current; });
}

/** Country names follow the interface language, values stay ISO codes. */
function localiseCountries() {
  qsa('select[data-country-select]').forEach((sel) => {
    let dn;
    try {
      dn = new Intl.DisplayNames([current], { type: 'region' });
    } catch {
      return;
    }
    Array.from(sel.options).forEach((opt) => {
      if (!opt.value) return;
      const name = dn.of(opt.value);
      if (name && name !== opt.value) opt.textContent = name;
    });
    const first = sel.querySelector('option[value=""]');
    if (first) {
      const placeholder = lookup('f.countrySelect');
      if (placeholder) first.textContent = placeholder;
    }
  });
}

/** Best guess from ?lang=, a stored choice, then the browser's languages. */
export function detectLang() {
  const fromUrl = new URLSearchParams(location.search).get('lang');
  if (fromUrl && SUPPORTED.includes(fromUrl.toLowerCase())) return fromUrl.toLowerCase();

  /* A server or edge worker can pre-set this (e.g. from CF-IPCountry). */
  if (CFG.geoLang && SUPPORTED.includes(CFG.geoLang)) return CFG.geoLang;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) return stored;
  } catch { /* private mode */ }

  const candidates = navigator.languages && navigator.languages.length
    ? navigator.languages
    : [navigator.language || ''];
  for (const tag of candidates) {
    const base = String(tag).toLowerCase().split('-')[0];
    if (SUPPORTED.includes(base)) return base;
  }
  return CFG.defaultLang || 'en';
}

async function loadDict(lang) {
  if (lang === (CFG.defaultLang || 'en')) return null;
  try {
    const res = await fetch(`${BASE}assets/js/i18n/${lang}.json`, { cache: 'force-cache' });
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch (err) {
    console.warn('[i18n] could not load', lang, err);
    return null;
  }
}

export async function setLang(lang, { persist = true, announce = true } = {}) {
  if (!SUPPORTED.includes(lang)) lang = CFG.defaultLang || 'en';
  const next = await loadDict(lang);
  if (lang !== (CFG.defaultLang || 'en') && next === null) {
    /* dictionary missing — stay in English rather than break the page */
    lang = CFG.defaultLang || 'en';
    dict = null;
  } else {
    dict = next;
  }
  current = lang;
  applyAll();
  localiseCountries();
  document.querySelectorAll('[data-lang-option]').forEach((btn) => {
    btn.setAttribute('aria-checked', String(btn.dataset.langOption === lang));
  });
  const short = (CFG.langs || []).find((l) => l.code === lang);
  const badge = document.getElementById('langCurrent');
  if (badge && short) badge.textContent = short.short;

  if (persist) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* ignore */ }
  }
  if (announce) listeners.forEach((fn) => fn(lang));
  return lang;
}

export function getLang() { return current; }
export function isSupported(code) { return SUPPORTED.includes(code); }
export function onLangChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export async function initI18n() {
  snapshot();
  const lang = detectLang();
  await setLang(lang, { persist: false, announce: false });
  return lang;
}
