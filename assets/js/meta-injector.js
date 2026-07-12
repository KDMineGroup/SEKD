/**
 * SESMine — meta-injector.js
 * Dynamically injects page-specific <meta> tags, <title>,
 * canonical URLs, and Open Graph data.
 *
 * Usage: include via <script src="/assets/js/meta-injector.js" defer></script>
 * Each page can set window.PAGE_META = { ... } before this script runs,
 * OR meta is resolved from the PAGE_META_MAP by pathname.
 */

(function () {
  'use strict';

  /* ── 1. Site-wide defaults ── */
  const SITE_DEFAULTS = {
    siteName:    'SESMine',
    titleSuffix: ' — SESMine Mining Intelligence Platform',
    baseUrl:     'https://www.sesmine.com',
    locale:      'en_AU',
    twitterHandle: '@sesmine',
    defaultImage:  '/assets/img/og-default.jpg',
    defaultDescription:
      'SESMine delivers AI-powered forecasting, real-time ESG reporting, ' +
      'and six specialist intelligence hubs for the global mining industry. ' +
      'Trusted by 1,200+ professionals at the world\'s leading mining companies.',
    themeColor: '#0b1220',
  };

  /* ── 2. Per-page meta map ── */
  const PAGE_META_MAP = {
    '/': {
      title: 'The Intelligence Platform Built for Mining',
      description: SITE_DEFAULTS.defaultDescription,
      keywords: 'mining intelligence, AI predictor, ESG dashboard, mining analytics, CAPEX modelling, mining software',
      ogType: 'website',
      image: '/assets/img/og-home.jpg',
    },
    '/index.html': {
      title: 'The Intelligence Platform Built for Mining',
      description: SITE_DEFAULTS.defaultDescription,
      keywords: 'mining intelligence, AI predictor, ESG dashboard, mining analytics',
      ogType: 'website',
      image: '/assets/img/og-home.jpg',
    },
    '/pricing.html': {
      title: 'Pricing — Transparent Plans for Every Team',
      description: 'Start free for 14 days. SESMine offers Free, Pro, and Enterprise plans with no hidden fees. Scale as your mining team grows.',
      keywords: 'SESMine pricing, mining software plans, mining intelligence cost',
      ogType: 'website',
    },
    '/news.html': {
      title: 'Mining Industry News & Market Updates',
      description: 'Stay ahead with real-time mining industry news, commodity price updates, ESG developments, and technology breakthroughs from SESMine.',
      keywords: 'mining news, iron ore price, mining industry updates, ESG mining',
      ogType: 'website',
    },
    '/resources.html': {
      title: 'Resources — Guides, Templates & Documentation',
      description: 'Access SESMine\'s library of mining industry resources including user guides, ESG templates, methodology papers, and technical documentation.',
      keywords: 'mining resources, ESG template, mining documentation, SESMine guide',
      ogType: 'website',
    },
    '/contact.html': {
      title: 'Contact SESMine — Get in Touch',
      description: 'Contact the SESMine team for sales enquiries, technical support, or partnership opportunities. Based in Perth, Western Australia.',
      keywords: 'contact SESMine, mining software support, SESMine sales',
      ogType: 'website',
    },
    '/hub-preview.html': {
      title: 'Hub Preview — Explore SESMine Intelligence Hubs',
      description: 'Preview SESMine\'s six specialist mining intelligence hubs: Economics, Engineering, Procurement, Safety, Sustainability, and Innovation.',
      keywords: 'mining hubs, SESMine hubs, mining intelligence preview',
      ogType: 'website',
    },
    '/hubs/economics-hub.html': {
      title: 'Economics Hub — Financial Intelligence for Mining',
      description: 'Access commodity pricing, financial modelling tools, CAPEX/OPEX analysis, and economic impact assessments for mining operations.',
      keywords: 'mining economics, commodity prices, CAPEX modelling, mining finance',
      ogType: 'website',
      image: '/assets/img/og-economics.jpg',
    },
    '/hubs/engineering-hub.html': {
      title: 'Engineering Hub — Technical Intelligence for Mining',
      description: 'Technical specifications, project management tools, structural data, and engineering analytics for mining professionals.',
      keywords: 'mining engineering, technical specifications, mining project management',
      ogType: 'website',
      image: '/assets/img/og-engineering.jpg',
    },
    '/hubs/procurement-hub.html': {
      title: 'Procurement Hub — Supply Chain & Vendor Intelligence',
      description: 'Streamline mining procurement with vendor databases, equipment sourcing tools, supply chain analytics, and contract management.',
      keywords: 'mining procurement, vendor database, mining supply chain, equipment sourcing',
      ogType: 'website',
      image: '/assets/img/og-procurement.jpg',
    },
    '/hubs/safety-hub.html': {
      title: 'Safety Hub — Health, Safety & Compliance Intelligence',
      description: 'Mining safety protocols, incident reporting, TRIFR tracking, and compliance documentation for safer mining operations.',
      keywords: 'mining safety, TRIFR, mining compliance, safety protocols, incident reporting',
      ogType: 'website',
      image: '/assets/img/og-safety.jpg',
    },
    '/hubs/sustainability-hub.html': {
      title: 'Sustainability Hub — ESG & Environmental Intelligence',
      description: 'Long-term environmental impact planning, carbon tracking, reclamation strategies, and ESG reporting for sustainable mining.',
      keywords: 'mining sustainability, ESG mining, carbon footprint mining, environmental compliance',
      ogType: 'website',
      image: '/assets/img/og-sustainability.jpg',
    },
    '/hubs/innovation-hub.html': {
      title: 'Innovation Hub — Emerging Technology in Mining',
      description: 'Explore automation, AI, robotics, and R&D trends transforming the global mining industry.',
      keywords: 'mining innovation, mining automation, mining AI, mining technology',
      ogType: 'website',
      image: '/assets/img/og-innovation.jpg',
    },
    '/products/ai-predictor.html': {
      title: 'AI Predictor — Machine Learning Forecasting for Mining',
      description: 'SESMine\'s AI Predictor delivers CAPEX forecasting with ±3.2% variance accuracy using machine learning trained on global mining datasets.',
      keywords: 'mining AI, CAPEX forecasting, machine learning mining, AI predictor',
      ogType: 'product',
      image: '/assets/img/og-ai-predictor.jpg',
    },
    '/products/cost-calculator.html': {
      title: 'Cost Calculator — CAPEX & OPEX Estimation Tool',
      description: 'Estimate operational expenses, capital expenditure, and project costs for mining operations with SESMine\'s intelligent cost calculator.',
      keywords: 'mining cost calculator, CAPEX calculator, OPEX mining, mining project costs',
      ogType: 'product',
    },
    '/products/equipment-database.html': {
      title: 'Equipment Database — 50,000+ Mining Equipment Records',
      description: 'Search and compare 50,000+ mining equipment records including technical specifications, pricing benchmarks, and supplier data.',
      keywords: 'mining equipment database, mining machinery, equipment specifications, mining suppliers',
      ogType: 'product',
    },
    '/dashboard/main-dashboard.html': {
      title: 'Dashboard — Your Mining Intelligence Overview',
      description: 'Your personalised SESMine dashboard: track hub activity, AI forecasts, ESG scores, and platform usage.',
      robots: 'noindex, nofollow',
    },
    '/dashboard/esg-dashboard.html': {
      title: 'ESG Dashboard — Environmental, Social & Governance Tracking',
      description: 'Monitor your mining operation\'s ESG performance in real time. Track carbon footprint, social impact scores, and governance transparency.',
      robots: 'noindex, nofollow',
    },
    '/dashboard/analytics.html': {
      title: 'Analytics — Deep-Dive Mining Data Reporting',
      description: 'Advanced analytics and data visualisation for mining market trends, operational efficiency, and platform usage insights.',
      robots: 'noindex, nofollow',
    },
    '/auth/login.html': {
      title: 'Sign In — SESMine',
      description: 'Sign in to your SESMine account to access mining intelligence hubs, AI tools, and ESG dashboards.',
      robots: 'noindex, nofollow',
    },
    '/auth/signup.html': {
      title: 'Create Account — SESMine',
      description: 'Join 1,200+ mining professionals on SESMine. Create your free account and get instant access to mining intelligence tools.',
      robots: 'noindex, nofollow',
    },
  };

  /* ── 3. Resolve meta for current page ── */
  function resolveMeta() {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    const pageMeta = (window.PAGE_META) || PAGE_META_MAP[path] || PAGE_META_MAP[path + '.html'] || {};
    return Object.assign({}, SITE_DEFAULTS, pageMeta);
  }

  /* ── 4. DOM helpers ── */
  function setMeta(name, content, isProperty = false) {
    if (!content) return;
    const attr = isProperty ? 'property' : 'name';
    let el = document.querySelector(`meta[${attr}="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function setLink(rel, href) {
    if (!href) return;
    let el = document.querySelector(`link[rel="${rel}"]`);
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', rel);
      document.head.appendChild(el);
    }
    el.setAttribute('href', href);
  }

  function setTitle(title, suffix) {
    document.title = title.includes('SESMine') ? title : title + suffix;
  }

  /* ── 5. Inject all meta tags ── */
  function injectMeta() {
    const meta = resolveMeta();
    const fullUrl = meta.baseUrl + window.location.pathname;
    const ogImage = meta.image
      ? (meta.image.startsWith('http') ? meta.image : meta.baseUrl + meta.image)
      : meta.baseUrl + meta.defaultImage;

    /* Title */
    setTitle(meta.title || document.title, meta.titleSuffix);

    /* Core meta */
    setMeta('description',  meta.description);
    setMeta('keywords',     meta.keywords);
    setMeta('author',       'SESMine');
    setMeta('robots',       meta.robots || 'index, follow');
    setMeta('theme-color',  meta.themeColor);

    /* Canonical */
    setLink('canonical', fullUrl);

    /* Open Graph */
    setMeta('og:type',        meta.ogType || 'website',       true);
    setMeta('og:title',       meta.title,                     true);
    setMeta('og:description', meta.description,               true);
    setMeta('og:url',         fullUrl,                        true);
    setMeta('og:site_name',   meta.siteName,                  true);
    setMeta('og:image',       ogImage,                        true);
    setMeta('og:image:width', '1200',                         true);
    setMeta('og:image:height','630',                          true);
    setMeta('og:locale',      meta.locale,                    true);

    /* Twitter Card */
    setMeta('twitter:card',        'summary_large_image');
    setMeta('twitter:site',        meta.twitterHandle);
    setMeta('twitter:title',       meta.title);
    setMeta('twitter:description', meta.description);
    setMeta('twitter:image',       ogImage);

    /* PWA / mobile */
    setMeta('mobile-web-app-capable',      'yes');
    setMeta('apple-mobile-web-app-capable','yes');
    setMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
    setMeta('apple-mobile-web-app-title',  meta.siteName);

    /* Preconnect hints for performance */
    ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'].forEach(origin => {
      let link = document.querySelector(`link[rel="preconnect"][href="${origin}"]`);
      if (!link) {
        link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = origin;
        if (origin.includes('gstatic')) link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    });
  }

  /* ── 6. Run on DOM ready ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectMeta);
  } else {
    injectMeta();
  }

  /* ── 7. Expose for SPA route changes ── */
  window.SESMineMetaInjector = {
    inject: injectMeta,
    setPageMeta: function(meta) {
      window.PAGE_META = meta;
      injectMeta();
    }
  };

})();
