/**
 * SESMine — config.js
 * Centralised runtime configuration.
 * Sensitive keys are injected at build time via CI/CD — never hardcoded here.
 */

(function (global) {
  'use strict';

  /* ── 1. Environment detection ── */
  const hostname = window.location.hostname;

  const ENV =
    hostname === 'www.sesmine.com' || hostname === 'sesmine.com' ? 'production'  :
    hostname.includes('staging')                                  ? 'staging'     :
    hostname.includes('preview')                                  ? 'preview'     :
    'development';

  /* ── 2. API base URLs per environment ── */
  const API_BASES = {
    production:  'https://api.sesmine.com/v1',
    staging:     'https://api-staging.sesmine.com/v1',
    preview:     'https://api-preview.sesmine.com/v1',
    development: 'http://localhost:3000/v1',
  };

  /* ── 3. Feature flags ── */
  const FEATURE_FLAGS = {
    production: {
      aiPredictor:       true,
      esgDashboard:      true,
      equipmentDatabase: true,
      socialLogin:       true,
      maintenanceMode:   false,
      debugLogging:      false,
    },
    staging: {
      aiPredictor:       true,
      esgDashboard:      true,
      equipmentDatabase: true,
      socialLogin:       true,
      maintenanceMode:   false,
      debugLogging:      true,
    },
    development: {
      aiPredictor:       true,
      esgDashboard:      true,
      equipmentDatabase: true,
      socialLogin:       false,
      maintenanceMode:   false,
      debugLogging:      true,
    },
  };

  /* ── 4. Public configuration object ── */
  const CONFIG = {
    env:     ENV,
    version: '5.0.1',
    apiBase: API_BASES[ENV] || API_BASES.development,

    /* Site */
    site: {
      name:        'SESMine',
      url:         'https://www.sesmine.com',
      supportEmail:'hello@sesmine.com',
      phone:       '+61 8 9000 1234',
    },

    /* Auth */
    auth: {
      sessionTimeout:   8 * 60 * 60 * 1000,  // 8 hours in ms
      refreshThreshold: 15 * 60 * 1000,       // refresh 15 min before expiry
      loginRedirect:    '/dashboard/main-dashboard.html',
      logoutRedirect:   '/auth/login.html',
      adminRedirect:    '/admin/admin-dashboard.html',
    },

    /* API endpoints */
    endpoints: {
      /* Auth */
      login:          '/auth/login',
      logout:         '/auth/logout',
      signup:         '/auth/signup',
      refresh:        '/auth/refresh',
      me:             '/auth/me',
      oauthGoogle:    '/auth/oauth/google',
      oauthMicrosoft: '/auth/oauth/microsoft',

      /* Admin */
      adminLogin:     '/admin/auth/login',
      adminLogout:    '/admin/auth/logout',
      adminMe:        '/admin/me',
      adminUsers:     '/admin/users',
      adminHubReqs:   '/admin/hub-requests',
      adminContent:   '/admin/content',
      adminSessions:  '/admin/sessions/count',
      adminPricing:   '/admin/pricing',

      /* Dashboard */
      dashboardStats: '/dashboard/stats',
      esgData:        '/dashboard/esg',
      analyticsData:  '/dashboard/analytics',

      /* Hubs */
      hubAccess:      '/hubs/access',
      hubData:        '/hubs/:hubId/data',

      /* Products */
      aiPredict:      '/products/ai-predictor/predict',
      costCalc:       '/products/cost-calculator/calculate',
      equipment:      '/products/equipment',

      /* Public */
      commodityPrices:'/market/prices',
      news:           '/content/news',
      resources:      '/content/resources',
      contact:        '/contact',

      /* Analytics */
      analyticsEvent: '/analytics/events',
    },

    /* Pagination defaults */
    pagination: {
      defaultPageSize: 10,
      maxPageSize:     100,
    },

    /* Feature flags for current env */
    features: FEATURE_FLAGS[ENV] || FEATURE_FLAGS.development,

    /* Commodity tickers shown on platform */
    commodities: [
      { id: 'iron-ore',  name: 'Iron Ore',  unit: 'USD/t',   symbol: 'IO' },
      { id: 'copper',    name: 'Copper',    unit: 'USD/t',   symbol: 'CU' },
      { id: 'gold',      name: 'Gold',      unit: 'USD/oz',  symbol: 'AU' },
      { id: 'lithium',   name: 'Lithium',   unit: 'USD/t',   symbol: 'LI' },
      { id: 'coal',      name: 'Coal',      unit: 'USD/t',   symbol: 'CO' },
      { id: 'nickel',    name: 'Nickel',    unit: 'USD/t',   symbol: 'NI' },
    ],

    /* Hub definitions */
    hubs: [
      { id: 'economics',     name: 'Economics',     color: '#f5a623', path: '/hubs/economics-hub.html'     },
      { id: 'engineering',   name: 'Engineering',   color: '#6366f1', path: '/hubs/engineering-hub.html'   },
      { id: 'procurement',   name: 'Procurement',   color: '#14b8a6', path: '/hubs/procurement-hub.html'   },
      { id: 'safety',        name: 'Safety',        color: '#ef4444', path: '/hubs/safety-hub.html'        },
      { id: 'sustainability',name: 'Sustainability', color: '#2ecc71', path: '/hubs/sustainability-hub.html'},
      { id: 'innovation',    name: 'Innovation',    color: '#a855f7', path: '/hubs/innovation-hub.html'    },
    ],

    /* Debug */
    debug: FEATURE_FLAGS[ENV]?.debugLogging || false,
  };

  /* ── 5. Freeze to prevent mutation ── */
  Object.freeze(CONFIG.auth);
  Object.freeze(CONFIG.endpoints);
  Object.freeze(CONFIG.site);
  Object.freeze(CONFIG.features);

  /* ── 6. Expose globally ── */
  global.SESMINE_CONFIG = CONFIG;

  /* ── 7. Dev logging ── */
  if (CONFIG.debug) {
    console.log('[SESMine Config] Environment:', ENV);
    console.log('[SESMine Config] API Base:', CONFIG.apiBase);
    console.log('[SESMine Config] Version:', CONFIG.version);
    console.log('[SESMine Config] Features:', CONFIG.features);
  }

})(window);
