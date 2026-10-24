/* =========================================================================
   Loqelo — interface behaviour
   Progressive enhancement only: every section is readable and every link
   works with JavaScript switched off.
   ========================================================================= */

import { analytics, trackPageView } from './analytics.js';
import { initI18n, setLang, onLangChange, getLang } from './i18n.js';
import { initForms, selectAudience } from './forms.js';

const CFG = window.LOQELO || {};
const qs = (s, r = document) => r.querySelector(s);
const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------ header */
function initHeader() {
  const header = qs('#header');
  if (!header) return;
  let last = -1;
  const onScroll = () => {
    const y = window.scrollY;
    if ((y > 12) !== (last > 12)) header.classList.toggle('is-stuck', y > 12);
    last = y;
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* -------------------------------------------------------------- mobile nav */
function initMobileNav() {
  const burger = qs('#burger');
  const menu = qs('#mobileMenu');
  if (!burger || !menu) return;

  const setOpen = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      burger.firstElementChild.style.transform = 'translateY(3.4px) rotate(45deg)';
      burger.lastElementChild.style.transform = 'translateY(-3.4px) rotate(-45deg)';
    } else {
      burger.firstElementChild.style.transform = '';
      burger.lastElementChild.style.transform = '';
    }
  };

  burger.addEventListener('click', () => setOpen(menu.hidden));
  qsa('a', menu).forEach((a) => a.addEventListener('click', () => setOpen(false)));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setOpen(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 1080 && !menu.hidden) setOpen(false); });
}

/* --------------------------------------------------------------- language */
function buildLangMenu() {
  const menu = qs('#langMenu');
  const wrap = qs('#lang');
  const btn = qs('#langBtn');
  if (!menu || !wrap || !btn) return;

  menu.innerHTML = '';
  (CFG.langs || []).forEach((l) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'menuitemradio');
    b.setAttribute('aria-checked', 'false');
    b.dataset.langOption = l.code;
    b.innerHTML = `<span>${l.label}</span><span class="lang-code">${l.short}</span>`;
    b.addEventListener('click', async () => {
      if (l.code !== getLang()) {
        await setLang(l.code);
        analytics.track('language_change', { language: l.code });
      }
      wrap.dataset.open = 'false';
      btn.setAttribute('aria-expanded', 'false');
    });
    menu.appendChild(b);
  });

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = wrap.dataset.open !== 'true';
    wrap.dataset.open = String(open);
    btn.setAttribute('aria-expanded', String(open));
    if (open) menu.firstElementChild?.focus();
  });
  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) {
      wrap.dataset.open = 'false';
      btn.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && wrap.dataset.open === 'true') {
      wrap.dataset.open = 'false';
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    }
  });
}

/* --------------------------------------------------------------- tabs */
function initTabs(tablist, { onChange } = {}) {
  if (!tablist) return;
  const tabs = qsa('[role="tab"]', tablist);
  if (!tabs.length) return;
  const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls'))).filter(Boolean);
  panels.forEach((p) => { p.hidden = false; });

  const activate = (index, focus = false) => {
    tabs.forEach((t, i) => {
      const on = i === index;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) {
        panel.classList.toggle('is-active', on);
        panel.hidden = false;
      }
    });
    if (focus) tabs[index].focus();
    if (onChange) onChange(index, tabs[index]);
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activate(i));
    tab.addEventListener('keydown', (e) => {
      const k = e.key;
      let next = i;
      if (k === 'ArrowRight' || k === 'ArrowDown') next = (i + 1) % tabs.length;
      else if (k === 'ArrowLeft' || k === 'ArrowUp') next = (i - 1 + tabs.length) % tabs.length;
      else if (k === 'Home') next = 0;
      else if (k === 'End') next = tabs.length - 1;
      else return;
      e.preventDefault();
      activate(next, true);
    });
  });
  activate(Math.max(0, tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true')));
}

/* --------------------------------------------------------------- countdown */
function initCountdown() {
  const root = qs('#countdown');
  if (!root) return;
  const target = new Date(CFG.launchDate || '2027-02-01T00:00:00+01:00').getTime();
  const cells = {
    d: qs('[data-cd="d"]', root),
    h: qs('[data-cd="h"]', root),
    m: qs('[data-cd="m"]', root),
    s: qs('[data-cd="s"]', root)
  };
  const pad = (n, len = 2) => String(n).padStart(len, '0');

  const tick = () => {
    const diff = Math.max(0, target - Date.now());
    const sec = Math.floor(diff / 1000);
    if (cells.d) cells.d.textContent = pad(Math.floor(sec / 86400), 2);
    if (cells.h) cells.h.textContent = pad(Math.floor((sec % 86400) / 3600));
    if (cells.m) cells.m.textContent = pad(Math.floor((sec % 3600) / 60));
    if (cells.s) cells.s.textContent = pad(sec % 60);
  };
  tick();
  setInterval(tick, 1000);
}

/* --------------------------------------------------------------- faq */
function initFaq() {
  qsa('.faq-item').forEach((item) => {
    const btn = qs('.faq-q', item);
    if (!btn) return;
    btn.addEventListener('click', () => {
      const open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
      if (open) analytics.track('faq_open', { question_index: qsa('.faq-item').indexOf(item) + 1 });
    });
  });
}

/* --------------------------------------------------------------- reveal */
function initReveal() {
  const nodes = qsa('.reveal');
  if (!nodes.length) return;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    nodes.forEach((n) => n.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  nodes.forEach((n) => io.observe(n));
}

/* --------------------------------------------------------------- marquee */
function initMarquee() {
  const track = qs('#marqueeTrack');
  if (!track) return;
  const group = Array.from(track.children);
  if (!group.length) return;

  const build = () => {
    const groupWidth = group.reduce((w, n) => w + n.getBoundingClientRect().width + 12, 0);
    const need = Math.max(1, Math.ceil((window.innerWidth * 1.15) / Math.max(groupWidth, 1)));
    track.innerHTML = '';
    for (let i = 0; i < need; i++) group.forEach((n) => track.appendChild(n.cloneNode(true)));
    /* duplicate the block so translateX(-50%) loops seamlessly */
    Array.from(track.children).forEach((n) => track.appendChild(n.cloneNode(true)));
    track.style.animationDuration = `${Math.max(26, need * 18)}s`;
  };
  build();
  let t;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(build, 250); });
}

/* --------------------------------------------------------------- video */
function initVideo() {
  const trigger = qs('#playFilm');
  const modal = qs('#modal');
  const video = qs('#promoVideo');
  const closeBtn = qs('#modalClose');
  if (!trigger || !modal || !video) return;

  let lastFocus = null;

  const open = () => {
    lastFocus = document.activeElement;
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
    closeBtn?.focus();
    const p = video.play();
    if (p && p.catch) p.catch(() => { /* autoplay blocked — user can press play */ });
    analytics.track('video_play');
  };

  const close = () => {
    modal.classList.remove('is-open');
    video.pause();
    video.currentTime = 0;
    document.body.style.overflow = '';
    setTimeout(() => { modal.hidden = true; }, 320);
    if (lastFocus) lastFocus.focus();
  };

  trigger.addEventListener('click', open);
  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
  });
  closeBtn?.addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
  });
}

/* --------------------------------------------------------------- consent */
function initConsent() {
  const bar = qs('#cookie');
  if (!bar) return;
  const KEY = 'loqelo.consent';
  const read = () => {
    try { return localStorage.getItem(KEY); } catch { return null; }
  };
  const write = (v) => {
    try { localStorage.setItem(KEY, v); } catch { /* ignore */ }
  };

  const stored = read();
  if (stored === 'granted') analytics.start();
  if (!stored) {
    setTimeout(() => {
      bar.hidden = false;
      requestAnimationFrame(() => bar.classList.add('is-visible'));
    }, 1400);
  }

  const choose = (value) => {
    write(value);
    bar.classList.remove('is-visible');
    setTimeout(() => { bar.hidden = true; }, 450);
    if (value === 'granted') analytics.start();
    else analytics.stop();
    analytics.track('consent_choice', { choice: value });
  };

  qsa('[data-consent]', bar).forEach((b) => {
    b.addEventListener('click', () => choose(b.dataset.consent));
  });

  /* footer "Cookie settings" re-opens the bar */
  qsa('a[href="privacy.html#cookies"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      bar.hidden = false;
      requestAnimationFrame(() => bar.classList.add('is-visible'));
    });
  });
}

/* --------------------------------------------------------------- misc */
function initMisc() {
  const toTop = qs('#toTop');
  if (toTop) {
    const onScroll = () => toTop.classList.toggle('is-visible', window.scrollY > 900);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  }

  const year = qs('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* audience CTAs preselect the right waiting-list tab */
  qsa('[data-audience]').forEach((a) => {
    a.addEventListener('click', () => selectAudience(a.dataset.audience));
  });

  /* outbound / CTA tracking */
  qsa('a[href^="mailto:"]').forEach((a) => {
    a.addEventListener('click', () => analytics.track('contact_click', { target: a.getAttribute('href') }));
  });
  qsa('a.btn[href^="#"]').forEach((a) => {
    a.addEventListener('click', () => {
      analytics.track('cta_click', { target: a.getAttribute('href'), label: (a.textContent || '').trim().slice(0, 60) });
    });
  });
}

/* --------------------------------------------------------------- boot */
async function boot() {
  initHeader();
  initMobileNav();
  buildLangMenu();
  initCountdown();
  initFaq();
  initVideo();
  initMisc();
  initConsent();

  const lang = await initI18n();
  initTabs(qs('.tabs'), { onChange: (i) => analytics.track('screens_tab', { tab_index: i + 1 }) });
  initTabs(qs('.wl-tabs'));
  initForms();
  initReveal();
  initMarquee();

  onLangChange((code) => {
    /* keep the success/failure copy in the visitor's language */
    document.querySelectorAll('form[data-form]').forEach((f) => {
      f.dataset.msgError = '';
    });
    analytics.track('page_view', { page_language: code, page_location: location.href });
  });

  trackPageView(lang);
  document.documentElement.classList.add('is-ready');
  if (CFG.debug) console.info('[loqelo] ready', { lang, formMode: CFG.formMode, ga4: CFG.ga4 || 'off' });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
