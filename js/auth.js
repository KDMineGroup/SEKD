/**
 * SESMine — auth.js
 * Client-side authentication utilities.
 * Security: All tokens are stored in httpOnly cookies (server-set).
 * This file NEVER reads or writes tokens — it only calls the API
 * and reacts to server responses.
 */

(function (global) {
  'use strict';

  const CFG = global.SESMINE_CONFIG || {};
  const API = CFG.apiBase || '/v1';
  const log = (...a) => CFG.debug && console.log('[SESMine Auth]', ...a);

  /* ── 1. Core fetch wrapper ── */
  async function apiFetch(endpoint, options = {}) {
    const url = API + endpoint;
    const defaults = {
      credentials: 'include',          // sends httpOnly session cookie
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
    };
    const config = Object.assign({}, defaults, options, {
      headers: Object.assign({}, defaults.headers, options.headers || {}),
    });

    const res = await fetch(url, config);

    /* Auto-handle 401 — redirect to login */
    if (res.status === 401) {
      log('Session expired — redirecting to login');
      redirectToLogin();
      return null;
    }

    return res;
  }

  /* ── 2. Session check ── */
  async function checkSession() {
    try {
      const res = await apiFetch(CFG.endpoints?.me || '/auth/me');
      if (!res || !res.ok) return null;
      const data = await res.json();
      log('Session valid:', data.email);
      return data;
    } catch (err) {
      log('Session check failed:', err.message);
      return null;
    }
  }

  /* ── 3. Auth guards ── */

  /**
   * requireAuth — redirect to login if no valid session.
   * Use on all protected user pages.
   */
  async function requireAuth() {
    const user = await checkSession();
    if (!user) {
      redirectToLogin();
      return null;
    }
    populateUserUI(user);
    scheduleRefresh();
    return user;
  }

  /**
   * requireAdminAuth — redirect to admin login if not admin.
   * Use on all /admin pages.
   */
  async function requireAdminAuth() {
    const user = await checkSession();
    if (!user) {
      window.location.href = '/admin/admin-login.html';
      return null;
    }
    if (!['admin', 'superadmin', 'moderator'].includes(user.role)) {
      log('Insufficient privileges — redirecting');
      window.location.href = '/admin/admin-login.html';
      return null;
    }
    scheduleRefresh();
    return user;
  }

  /**
   * requireGuest — redirect to dashboard if already logged in.
   * Use on login/signup pages.
   */
  async function requireGuest() {
    const user = await checkSession();
    if (user) {
      window.location.href = CFG.auth?.loginRedirect || '/dashboard/main-dashboard.html';
    }
  }

  /* ── 4. Redirect helpers ── */
  function redirectToLogin() {
    const current = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/auth/login.html?redirect=${current}`;
  }

  /* ── 5. Populate UI with user data ── */
  function populateUserUI(user) {
    /* Name elements */
    document.querySelectorAll('[data-user-name]').forEach(el => {
      el.textContent = user.name || user.email;
    });

    /* Email elements */
    document.querySelectorAll('[data-user-email]').forEach(el => {
      el.textContent = user.email;
    });

    /* Avatar initials */
    document.querySelectorAll('[data-user-avatar]').forEach(el => {
      const parts = (user.name || 'U').split(' ');
      el.textContent = parts.map(p => p[0]).join('').slice(0, 2).toUpperCase();
    });

    /* Plan badge */
    document.querySelectorAll('[data-user-plan]').forEach(el => {
      el.textContent = user.plan || 'Free';
    });

    /* Hub access — show/hide gated content */
    if (user.hubs && Array.isArray(user.hubs)) {
      document.querySelectorAll('[data-hub-required]').forEach(el => {
        const required = el.getAttribute('data-hub-required');
        if (!user.hubs.includes(required)) {
          el.setAttribute('aria-hidden', 'true');
          el.style.display = 'none';
        }
      });
    }

    log('UI populated for:', user.email);
  }

  /* ── 6. Token refresh ── */
  let refreshTimer = null;

  function scheduleRefresh() {
    if (refreshTimer) clearTimeout(refreshTimer);
    const threshold = CFG.auth?.refreshThreshold || 15 * 60 * 1000;
    const timeout   = CFG.auth?.sessionTimeout   || 8 * 60 * 60 * 1000;
    const delay     = timeout - threshold;

    refreshTimer = setTimeout(async () => {
      try {
        const res = await apiFetch(CFG.endpoints?.refresh || '/auth/refresh', { method: 'POST' });
        if (res && res.ok) {
          log('Session refreshed');
          scheduleRefresh();
        } else {
          log('Refresh failed — redirecting to login');
          redirectToLogin();
        }
      } catch (_) {
        redirectToLogin();
      }
    }, delay);
  }

  /* ── 7. Logout ── */
  async function logout() {
    try {
      if (refreshTimer) clearTimeout(refreshTimer);
      await apiFetch(CFG.endpoints?.logout || '/auth/logout', { method: 'POST' });
    } catch (_) {
      /* Proceed regardless */
    } finally {
      window.location.href = CFG.auth?.logoutRedirect || '/auth/login.html';
    }
  }

  async function adminLogout() {
    try {
      if (refreshTimer) clearTimeout(refreshTimer);
      await apiFetch(CFG.endpoints?.adminLogout || '/admin/auth/logout', { method: 'POST' });
    } catch (_) {}
    finally {
      window.location.href = '/admin/admin-login.html';
    }
  }

  /* ── 8. Hub access check ── */
  async function checkHubAccess(hubId) {
    try {
      const res = await apiFetch(`${CFG.endpoints?.hubAccess || '/hubs/access'}/${hubId}`);
      if (!res) return false;
      const data = await res.json();
      return data.hasAccess === true;
    } catch (_) {
      return false;
    }
  }

  /* ── 9. Visibility change — re-check session on tab focus ── */
  document.addEventListener('visibilitychange', async () => {
    if (!document.hidden) {
      const user = await checkSession();
      if (!user && !isPublicPage()) {
        log('Session lost on tab focus — redirecting');
        redirectToLogin();
      }
    }
  });

  /* ── 10. Public page detection ── */
  function isPublicPage() {
    const publicPaths = ['/', '/index.html', '/pricing.html', '/news.html',
      '/resources.html', '/contact.html', '/hub-preview.html',
      '/auth/login.html', '/auth/signup.html'];
    return publicPaths.some(p => window.location.pathname.endsWith(p));
  }

  /* ── 11. CSRF token helper ── */
  async function getCsrfToken() {
    try {
      const res = await apiFetch('/auth/csrf-token');
      if (!res || !res.ok) return null;
      const data = await res.json();
      return data.token || null;
    } catch (_) {
      return null;
    }
  }

  /* ── 12. Expose public API ── */
  global.SESMineAuth = {
    checkSession,
    requireAuth,
    requireAdminAuth,
    requireGuest,
    logout,
    adminLogout,
    checkHubAccess,
    getCsrfToken,
    populateUserUI,
  };

  /* ── 13. Legacy shims for inline onclick handlers ── */
  global.requireAdminAuth = requireAdminAuth;
  global.requireAuth      = requireAuth;
  global.handleLogout     = logout;

  log('Auth module loaded — env:', CFG.env);

})(window);
