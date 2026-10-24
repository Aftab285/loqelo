/* =========================================================================
   Analytics — Google Analytics 4 with Consent Mode v2.
   Nothing loads, and no cookie is written, until the visitor accepts.
   Personal data is never sent: no email addresses, no country values.
   ========================================================================= */

const CFG = window.LOQELO || {};
const queue = [];
let loaded = false;

function dataLayer() {
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function () { window.dataLayer.push(arguments); };
  }
  return window.dataLayer;
}

export const analytics = {
  /** Queue a GA4 event. Safe to call at any time. */
  track(event, params = {}) {
    if (!CFG.ga4) {
      if (CFG.debug) console.info('[analytics:off]', event, params);
      return;
    }
    if (!loaded) {
      queue.push([event, params]);
      if (CFG.debug) console.info('[analytics:queued]', event, params);
      return;
    }
    if (CFG.debug) console.info('[analytics]', event, params);
    window.gtag('event', event, params);
  },

  /** Start GA4. Called only after the visitor grants analytics consent. */
  start() {
    if (loaded || !CFG.ga4) return;
    const dl = dataLayer();
    window.gtag('js', new Date());
    window.gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'granted'
    });
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(CFG.ga4);
    document.head.appendChild(s);

    window.gtag('config', CFG.ga4, {
      anonymize_ip: true,
      send_page_view: true,
      cookie_flags: 'SameSite=Lax;Secure'
    });
    loaded = true;
    queue.splice(0).forEach(([e, p]) => window.gtag('event', e, p));
    if (CFG.debug) console.info('[analytics] started', CFG.ga4, dl.length);
  },

  /** Withdraw consent: stop sending and clear GA cookies. */
  stop() {
    if (!loaded) return;
    window.gtag('consent', 'update', { analytics_storage: 'denied' });
    document.cookie.split(';').forEach((c) => {
      const name = c.split('=')[0].trim();
      if (name.startsWith('_ga') || name.startsWith('_gid')) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${location.hostname}`;
      }
    });
    loaded = false;
  }
};

/** Attach a page_view with the current language. */
export function trackPageView(lang) {
  analytics.track('page_view', { page_language: lang, page_location: location.href });
}
