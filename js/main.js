/**
 * SESMine — main.js
 * Global UI interactions, navigation, scroll reveal,
 * counter animations, commodity ticker, and utility functions.
 */

(function (global) {
  'use strict';

  const CFG = global.SESMINE_CONFIG || {};
  const log = (...a) => CFG.debug && console.log('[SESMine Main]', ...a);

  /* ══════════════════════════════════════════
     1. DOM Ready
  ══════════════════════════════════════════ */
  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  /* ══════════════════════════════════════════
     2. Navigation
  ══════════════════════════════════════════ */
  function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    /* Scroll shadow */
    const onScroll = () => {
      navbar.classList.toggle('navbar--scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* Active link */
    const path = window.location.pathname;
    navbar.querySelectorAll('.navbar__nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href && (path === href || path.endsWith(href))) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });

    /* Mobile menu toggle */
    const menuBtn  = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (menuBtn && mobileMenu) {
      menuBtn.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.toggle('open');
        menuBtn.setAttribute('aria-expanded', String(isOpen));
        menuBtn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });

      /* Close on outside click */
      document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target) && mobileMenu.classList.contains('open')) {
          mobileMenu.classList.remove('open');
          menuBtn.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      });

      /* Close on Escape */
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
          mobileMenu.classList.remove('open');
          menuBtn.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
          menuBtn.focus();
        }
      });
    }
  }

  /* ══════════════════════════════════════════
     3. Scroll Reveal (IntersectionObserver)
  ══════════════════════════════════════════ */
  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) {
      /* Fallback: show all immediately */
      document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
        el.classList.add('visible');
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
      observer.observe(el);
    });
  }

  /* ══════════════════════════════════════════
     4. Counter Animation
  ══════════════════════════════════════════ */
  function animateCounter(el, target, duration = 1800) {
    const isDecimal = String(target).includes('.');
    const decimals  = isDecimal ? String(target).split('.')[1].length : 0;
    const start     = performance.now();
    const startVal  = 0;

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      /* Ease out cubic */
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = startVal + (target - startVal) * eased;

      el.textContent = isDecimal
        ? current.toFixed(decimals)
        : Math.floor(current).toLocaleString('en-AU');

      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = isDecimal ? target.toFixed(decimals) : Number(target).toLocaleString('en-AU');
    }

    requestAnimationFrame(update);
  }

  function initCounters() {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el     = entry.target;
        const raw    = el.getAttribute('data-count');
        const target = parseFloat(raw.replace(/,/g, ''));
        if (!isNaN(target)) animateCounter(el, target);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));
  }

  /* ══════════════════════════════════════════
     5. Commodity Ticker
  ══════════════════════════════════════════ */
  async function initCommodityTicker() {
    const ticker = document.getElementById('commodityTicker');
    if (!ticker) return;

    async function fetchPrices() {
      try {
        const res = await fetch(
          (CFG.apiBase || '') + (CFG.endpoints?.commodityPrices || '/market/prices'),
          { credentials: 'include' }
        );
        if (!res.ok) return null;
        return await res.json();
      } catch (_) {
        return null;
      }
    }

    function renderTicker(prices) {
      if (!prices || !prices.length) return;
      ticker.innerHTML = prices.map(p => `
        <span class="ticker-item">
          <span class="ticker-item__name">${escHtml(p.name)}</span>
          <span class="ticker-item__price">${escHtml(p.price)}</span>
          <span class="ticker-item__change ${p.change >= 0 ? 'up' : 'down'}">
            ${p.change >= 0 ? '▲' : '▼'} ${Math.abs(p.change).toFixed(2)}%
          </span>
        </span>
      `).join('<span class="ticker-sep">·</span>');
    }

    const prices = await fetchPrices();
    if (prices) renderTicker(prices);

    /* Refresh every 60 seconds */
    setInterval(async () => {
      const fresh = await fetchPrices();
      if (fresh) renderTicker(fresh);
    }, 60_000);
  }

  /* ══════════════════════════════════════════
     6. Tabs Component
  ══════════════════════════════════════════ */
  function initTabs() {
    document.querySelectorAll('[data-tabs]').forEach(tabGroup => {
      const buttons = tabGroup.querySelectorAll('[data-tab-btn]');
      const panels  = tabGroup.querySelectorAll('[data-tab-panel]');

      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          const target = btn.getAttribute('data-tab-btn');

          buttons.forEach(b => {
            b.classList.toggle('active', b === btn);
            b.setAttribute('aria-selected', String(b === btn));
          });

          panels.forEach(p => {
            const isActive = p.getAttribute('data-tab-panel') === target;
            p.classList.toggle('active', isActive);
            p.hidden = !isActive;
          });
        });
      });

      /* Keyboard navigation */
      tabGroup.addEventListener('keydown', (e) => {
        const btns = [...buttons];
        const idx  = btns.indexOf(document.activeElement);
        if (idx === -1) return;

        if (e.key === 'ArrowRight') { e.preventDefault(); btns[(idx + 1) % btns.length].click(); btns[(idx + 1) % btns.length].focus(); }
        if (e.key === 'ArrowLeft')  { e.preventDefault(); btns[(idx - 1 + btns.length) % btns.length].click(); btns[(idx - 1 + btns.length) % btns.length].focus(); }
        if (e.key === 'Home')       { e.preventDefault(); btns[0].click(); btns[0].focus(); }
        if (e.key === 'End')        { e.preventDefault(); btns[btns.length - 1].click(); btns[btns.length - 1].focus(); }
      });
    });
  }

  /* ══════════════════════════════════════════
     7. Accordion Component
  ══════════════════════════════════════════ */
  function initAccordions() {
    document.querySelectorAll('[data-accordion]').forEach(accordion => {
      accordion.querySelectorAll('[data-accordion-trigger]').forEach(trigger => {
        trigger.addEventListener('click', () => {
          const item    = trigger.closest('[data-accordion-item]');
          const content = item?.querySelector('[data-accordion-content]');
          if (!item || !content) return;

          const isOpen = item.classList.contains('open');

          /* Close all others in same accordion */
          accordion.querySelectorAll('[data-accordion-item].open').forEach(openItem => {
            openItem.classList.remove('open');
            openItem.querySelector('[data-accordion-trigger]')?.setAttribute('aria-expanded', 'false');
            const c = openItem.querySelector('[data-accordion-content]');
            if (c) { c.style.maxHeight = '0'; c.hidden = true; }
          });

          if (!isOpen) {
            item.classList.add('open');
            trigger.setAttribute('aria-expanded', 'true');
            content.hidden = false;
            content.style.maxHeight = content.scrollHeight + 'px';
          }
        });
      });
    });
  }

  /* ══════════════════════════════════════════
     8. Toast Notification System
  ══════════════════════════════════════════ */
  function createToastContainer() {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'false');
      document.body.appendChild(container);
    }
    return container;
  }

  function showToast(message, type = 'info', duration = 4000) {
    const container = createToastContainer();
    const icons = {
      success: '✓',
      error:   '✕',
      warning: '⚠',
      info:    'ℹ',
    };

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.setAttribute('role', 'status');
    toast.innerHTML = `
      <span style="font-size:1rem;flex-shrink:0">${icons[type] || icons.info}</span>
      <span style="flex:1">${escHtml(message)}</span>
      <button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:inherit;padding:2px 4px;opacity:0.6;font-size:1rem" aria-label="Dismiss notification">×</button>
    `;

    container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => {
        toast.classList.add('removing');
        toast.addEventListener('animationend', () => toast.remove(), { once: true });
      }, duration);
    }

    return toast;
  }

  /* ══════════════════════════════════════════
     9. Smooth Scroll for anchor links
  ══════════════════════════════════════════ */
  function initSmoothScroll() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 80; /* navbar height */
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  }

  /* ══════════════════════════════════════════
     10. Maintenance Mode Check
  ══════════════════════════════════════════ */
  function checkMaintenanceMode() {
    if (CFG.features?.maintenanceMode) {
      const banner = document.createElement('div');
      banner.style.cssText = `
        position:fixed;top:0;left:0;right:0;z-index:9999;
        background:#f59e0b;color:#000;text-align:center;
        padding:10px 20px;font-size:0.875rem;font-weight:600;
      `;
      banner.textContent = '⚠ SESMine is currently undergoing scheduled maintenance. Some features may be unavailable.';
      document.body.prepend(banner);
    }
  }

  /* ══════════════════════════════════════════
     11. Utility: HTML escape
  ══════════════════════════════════════════ */
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ══════════════════════════════════════════
     12. Utility: Format numbers
  ══════════════════════════════════════════ */
  function formatNumber(n, decimals = 0) {
    return Number(n).toLocaleString('en-AU', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  function formatCurrency(n, currency = 'USD') {
    return new Intl.NumberFormat('en-AU', { style: 'currency', currency }).format(n);
  }

  function formatDate(d, options = {}) {
    return new Date(d).toLocaleDateString('en-AU', {
      day: 'numeric', month: 'short', year: 'numeric', ...options,
    });
  }

  /* ══════════════════════════════════════════
     13. Initialise everything
  ══════════════════════════════════════════ */
  onReady(() => {
    initNavbar();
    initScrollReveal();
    initCounters();
    initCommodityTicker();
    initTabs();
    initAccordions();
    initSmoothScroll();
    checkMaintenanceMode();
    log('Main module initialised');
  });

  /* ══════════════════════════════════════════
     14. Public API
  ══════════════════════════════════════════ */
  global.SESMine = {
    showToast,
    formatNumber,
    formatCurrency,
    formatDate,
    escHtml,
    animateCounter,
  };

})(window);
