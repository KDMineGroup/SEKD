/**
 * SESMine — seo.js
 * SEO tracking utilities: scroll depth, engagement signals,
 * internal link tracking, and Core Web Vitals reporting.
 */

(function () {
  'use strict';

  /* ── 1. Configuration ── */
  const CONFIG = {
    scrollDepthThresholds: [25, 50, 75, 90, 100],
    engagementTimeThreshold: 30,   // seconds before "engaged" event
    analyticsEndpoint: '/api/analytics/events',
    debug: false,
  };

  const log = (...args) => CONFIG.debug && console.log('[SESMine SEO]', ...args);

  /* ── 2. Utility: send event ── */
  async function sendEvent(eventName, data = {}) {
    const payload = {
      event:     eventName,
      page:      window.location.pathname,
      referrer:  document.referrer || null,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      ...data,
    };
    log('Event:', payload);

    /* Use sendBeacon for non-blocking analytics */
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(CONFIG.analyticsEndpoint, blob);
    } else {
      /* Fallback: fire-and-forget fetch */
      fetch(CONFIG.analyticsEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  }

  /* ── 3. Session ID (anonymous, no PII) ── */
  function getSessionId() {
    let id = sessionStorage.getItem('ses_sid');
    if (!id) {
      id = 'ses_' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
      sessionStorage.setItem('ses_sid', id);
    }
    return id;
  }

  /* ── 4. Page View ── */
  function trackPageView() {
    sendEvent('page_view', {
      title:      document.title,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      viewport:   `${window.innerWidth}x${window.innerHeight}`,
      language:   navigator.language,
    });
  }

  /* ── 5. Scroll Depth ── */
  function initScrollDepth() {
    const reached = new Set();

    function checkDepth() {
      const scrollTop    = window.scrollY || document.documentElement.scrollTop;
      const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPct    = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 100;

      CONFIG.scrollDepthThresholds.forEach(threshold => {
        if (scrollPct >= threshold && !reached.has(threshold)) {
          reached.add(threshold);
          sendEvent('scroll_depth', { depth: threshold });
          log(`Scroll depth: ${threshold}%`);
        }
      });
    }

    /* Throttle scroll handler */
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => { checkDepth(); ticking = false; });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ── 6. Engagement Time ── */
  function initEngagementTime() {
    let startTime    = Date.now();
    let totalTime    = 0;
    let isActive     = true;
    let reported30s  = false;
    let reportedTimer;

    function tick() {
      if (isActive) {
        totalTime = Math.floor((Date.now() - startTime) / 1000);
        if (totalTime >= CONFIG.engagementTimeThreshold && !reported30s) {
          reported30s = true;
          sendEvent('engaged_user', { seconds: totalTime });
        }
      }
      reportedTimer = setTimeout(tick, 5000);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        isActive = false;
        clearTimeout(reportedTimer);
      } else {
        isActive = true;
        startTime = Date.now() - (totalTime * 1000);
        tick();
      }
    });

    /* Send time-on-page on unload */
    window.addEventListener('pagehide', () => {
      sendEvent('time_on_page', { seconds: totalTime });
    });

    tick();
  }

  /* ── 7. Outbound Link Tracking ── */
  function initLinkTracking() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href');
      const isExternal = link.hostname && link.hostname !== window.location.hostname;
      const isDownload = link.hasAttribute('download') || /\.(pdf|docx?|xlsx?|zip|csv)$/i.test(href);

      if (isExternal) {
        sendEvent('outbound_click', { destination: href, text: link.textContent.trim().slice(0, 80) });
      }

      if (isDownload) {
        sendEvent('file_download', { file: href, text: link.textContent.trim().slice(0, 80) });
      }
    });
  }

  /* ── 8. CTA Click Tracking ── */
  function initCTATracking() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cta]');
      if (!btn) return;
      sendEvent('cta_click', {
        cta:  btn.getAttribute('data-cta'),
        text: btn.textContent.trim().slice(0, 80),
      });
    });
  }

  /* ── 9. Core Web Vitals ── */
  function initWebVitals() {
    /* Largest Contentful Paint */
    if ('PerformanceObserver' in window) {
      try {
        new PerformanceObserver((list) => {
          const entries          = list.getEntries();
          const last = entries[entries.length - 1];
          sendEvent('web_vital_lcp', { value: Math.round(last.startTime), rating: last.startTime < 2500 ? 'good' : last.startTime < 4000 ? 'needs-improvement' : 'poor' });
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (_) {}

      /* First Input Delay */
      try {
        new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            const fid = entry.processingStart - entry.startTime;
            sendEvent('web_vital_fid', { value: Math.round(fid), rating: fid < 100 ? 'good' : fid < 300 ? 'needs-improvement' : 'poor' });
          });
        }).observe({ type: 'first-input', buffered: true });
      } catch (_) {}

      /* Cumulative Layout Shift */
      try {
        let clsValue = 0;
        new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            if (!entry.hadRecentInput) clsValue += entry.value;
          });
          sendEvent('web_vital_cls', { value: clsValue.toFixed(4), rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor' });
        }).observe({ type: 'layout-shift', buffered: true });
      } catch (_) {}

      /* Time to First Byte */
      try {
        const nav = performance.getEntriesByType('navigation')[0];
        if (nav) {
          const ttfb = Math.round(nav.responseStart - nav.requestStart);
          sendEvent('web_vital_ttfb', { value: ttfb, rating: ttfb < 800 ? 'good' : ttfb < 1800 ? 'needs-improvement' : 'poor' });
        }
      } catch (_) {}
    }
  }

  /* ── 10. Search query capture (internal search) ── */
  function initSearchTracking() {
    document.addEventListener('submit', (e) => {
      const form = e.target;
      const searchInput = form.querySelector('input[type="search"], input[name="q"], input[name="search"]');
      if (!searchInput) return;
      sendEvent('internal_search', { query: searchInput.value.trim().slice(0, 120) });
    });
  }

  /* ── 11. 404 Detection ── */
  function check404() {
    if (document.title.toLowerCase().includes('404') ||
        document.title.toLowerCase().includes('not found')) {
      sendEvent('page_not_found', { url: window.location.href });
    }
  }

  /* ── 12. Init ── */
  function init() {
    trackPageView();
    initScrollDepth();
    initEngagementTime();
    initLinkTracking();
    initCTATracking();
    initWebVitals();
    initSearchTracking();
    check404();
    log('SEO tracking initialised on', window.location.pathname);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ── 13. Public API ── */
  window.SESMineSEO = {
    track: sendEvent,
    getSessionId,
  };

})();

