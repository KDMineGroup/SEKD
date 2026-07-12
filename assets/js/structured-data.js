/**
 * SESMine — structured-data.js
 * Injects page-specific JSON-LD schema markup for rich search results.
 * Schemas: Organization, WebSite, SoftwareApplication,
 *          BreadcrumbList, FAQPage, Product, Article.
 */

(function () {
  'use strict';

  /* ── 1. Inject a JSON-LD script block ── */
  function injectSchema(schema) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema, null, 0);
    document.head.appendChild(script);
  }

  /* ── 2. Global schemas (every page) ── */
  function injectGlobalSchemas() {
    /* Organization */
    injectSchema({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': 'https://www.sesmine.com/#organization',
      name: 'SESMine',
      url: 'https://www.sesmine.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.sesmine.com/assets/img/logo.png',
        width: 200,
        height: 60,
      },
      description:
        'SESMine is the world\'s most advanced mining intelligence platform, ' +
        'delivering AI-powered insights across economics, engineering, safety, ' +
        'sustainability, procurement and innovation.',
      email: 'hello@sesmine.com',
      telephone: '+61-8-9000-1234',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Perth',
        addressRegion: 'WA',
        addressCountry: 'AU',
      },
      foundingDate: '2023',
      numberOfEmployees: { '@type': 'QuantitativeValue', value: 50 },
      sameAs: [
        'https://linkedin.com/company/sesmine',
        'https://twitter.com/sesmine',
        'https://youtube.com/@sesmine',
        'https://github.com/sesmine',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'hello@sesmine.com',
        availableLanguage: 'English',
      },
    });

    /* WebSite with SearchAction */
    injectSchema({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': 'https://www.sesmine.com/#website',
      url: 'https://www.sesmine.com',
      name: 'SESMine',
      description: 'Mining Intelligence Platform',
      publisher: { '@id': 'https://www.sesmine.com/#organization' },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://www.sesmine.com/resources.html?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    });
  }

  /* ── 3. Page-specific schemas ── */
  const path = window.location.pathname;

  /* ── Homepage ── */
  function injectHomeSchema() {
    injectSchema({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': 'https://www.sesmine.com/#webpage',
      url: 'https://www.sesmine.com',
      name: 'SESMine — The Intelligence Platform Built for Mining',
      isPartOf: { '@id': 'https://www.sesmine.com/#website' },
      about: { '@id': 'https://www.sesmine.com/#organization' },
      description:
        'Six specialist intelligence hubs. AI-powered forecasting. ' +
        'Real-time ESG reporting. Trusted by 1,200+ professionals.',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.sesmine.com' }],
      },
    });

    /* SoftwareApplication — platform overview */
    injectSchema({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SESMine Mining Intelligence Platform',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web Browser',
      url: 'https://www.sesmine.com',
      description:
        'AI-powered mining intelligence platform with six specialist hubs, ' +
        'ESG dashboard, AI Predictor, Cost Calculator, and Equipment Database.',
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: '0',
        highPrice: '149',
        priceCurrency: 'USD',
        offerCount: 3,
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '312',
        bestRating: '5',
        worstRating: '1',
      },
      featureList: [
        'AI-powered CAPEX forecasting',
        'Real-time ESG reporting',
        'Six specialist mining intelligence hubs',
        'Equipment database with 50,000+ records',
        'Live commodity pricing',
        'Role-based access control',
      ],
    });
  }

  /* ── Pricing page ── */
  function injectPricingSchema() {
    injectSchema({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'SESMine Pricing — Transparent Plans for Every Team',
      url: 'https://www.sesmine.com/pricing.html',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home',    item: 'https://www.sesmine.com' },
          { '@type': 'ListItem', position: 2, name: 'Pricing', item: 'https://www.sesmine.com/pricing.html' },
        ],
      },
    });

    /* FAQ for pricing page */
    injectSchema({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is there a free trial?',
          acceptedAnswer: { '@type': 'Answer', text: 'Yes. SESMine offers a 14-day free trial with no credit card required. You get full access to all Pro features during the trial.' },
        },
        {
          '@type': 'Question',
          name: 'What is included in the Enterprise plan?',
          acceptedAnswer: { '@type': 'Answer', text: 'Enterprise includes unlimited hub access, dedicated account management, custom integrations, SSO, and priority support with a 99.9% uptime SLA.' },
        },
        {
          '@type': 'Question',
          name: 'Can I cancel anytime?',
          acceptedAnswer: { '@type': 'Answer', text: 'Yes. All SESMine plans can be cancelled at any time with no cancellation fees. Your access continues until the end of your billing period.' },
        },
        {
          '@type': 'Question',
          name: 'Is SESMine SOC 2 certified?',
          acceptedAnswer: { '@type': 'Answer', text: 'Yes. SESMine is SOC 2 Type II certified and ISO 27001 compliant, ensuring enterprise-grade security for your mining data.' },
        },
      ],
    });
  }

  /* ── Product pages ── */
  function injectProductSchema(name, description, url, features) {
    injectSchema({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name,
      description,
      url,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web Browser',
      isPartOf: {
        '@type': 'SoftwareApplication',
        name: 'SESMine Mining Intelligence Platform',
        url: 'https://www.sesmine.com',
      },
      featureList: features,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: 'Included with Pro and Enterprise plans',
      },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home',     item: 'https://www.sesmine.com' },
          { '@type': 'ListItem', position: 2, name: 'Products', item: 'https://www.sesmine.com/products/' },
          { '@type': 'ListItem', position: 3, name,             item: url },
        ],
      },
    });
  }

  /* ── Hub pages ── */
  function injectHubSchema(hubName, description, url) {
    injectSchema({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: `${hubName} — SESMine`,
      description,
      url,
      isPartOf: { '@id': 'https://www.sesmine.com/#website' },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.sesmine.com' },
          { '@type': 'ListItem', position: 2, name: 'Hubs', item: 'https://www.sesmine.com/hub-preview.html' },
          { '@type': 'ListItem', position: 3, name: hubName, item: url },
        ],
      },
    });
  }

  /* ── News article ── */
  function injectArticleSchema(title, description, datePublished, author) {
    injectSchema({
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: title || document.title,
      description: description || '',
      datePublished: datePublished || new Date().toISOString(),
      dateModified: datePublished || new Date().toISOString(),
      author: {
        '@type': 'Organization',
        name: author || 'SESMine Editorial Team',
        url: 'https://www.sesmine.com',
      },
      publisher: {
        '@type': 'Organization',
        name: 'SESMine',
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.sesmine.com/assets/img/logo.png',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': window.location.href,
      },
      image: {
        '@type': 'ImageObject',
        url: 'https://www.sesmine.com/assets/img/og-news.jpg',
        width: 1200,
        height: 630,
      },
    });
  }

  /* ── 4. Route dispatcher ── */
  function dispatchSchema() {
    injectGlobalSchemas();

    if (path === '/' || path.endsWith('index.html')) {
      injectHomeSchema();

    } else if (path.endsWith('pricing.html')) {
      injectPricingSchema();

    } else if (path.endsWith('news.html')) {
      injectArticleSchema(
        document.querySelector('h1')?.textContent,
        document.querySelector('meta[name="description"]')?.content,
        document.querySelector('time')?.getAttribute('datetime'),
        'SESMine Editorial Team'
      );

    } else if (path.includes('/products/ai-predictor')) {
      injectProductSchema(
        'SESMine AI Predictor',
        'Machine learning forecasting for mining CAPEX, market shifts, and operational outcomes.',
        'https://www.sesmine.com/products/ai-predictor.html',
        ['CAPEX variance forecasting ±3.2%', 'Market price prediction', 'Equipment failure forecasting', 'Geological outcome modelling']
      );

    } else if (path.includes('/products/cost-calculator')) {
      injectProductSchema(
        'SESMine Cost Calculator',
        'Estimate CAPEX, OPEX, and total project costs for mining operations.',
        'https://www.sesmine.com/products/cost-calculator.html',
        ['CAPEX estimation', 'OPEX modelling', 'Project cost breakdown', 'Scenario comparison']
      );

    } else if (path.includes('/products/equipment-database')) {
      injectProductSchema(
        'SESMine Equipment Database',
        'Search 50,000+ mining equipment records with technical specs and pricing benchmarks.',
        'https://www.sesmine.com/products/equipment-database.html',
        ['50,000+ equipment records', 'Technical specifications', 'Supplier data', 'Price benchmarking']
      );

    } else if (path.includes('/hubs/economics')) {
      injectHubSchema('Economics Hub', 'Financial modelling, commodity pricing, and economic impact tools for mining.', 'https://www.sesmine.com/hubs/economics-hub.html');

    } else if (path.includes('/hubs/engineering')) {
      injectHubSchema('Engineering Hub', 'Technical specifications, project management, and structural data for mining engineers.', 'https://www.sesmine.com/hubs/engineering-hub.html');

    } else if (path.includes('/hubs/procurement')) {
      injectHubSchema('Procurement Hub', 'Supply chain management, vendor databases, and equipment sourcing for mining procurement.', 'https://www.sesmine.com/hubs/procurement-hub.html');

    } else if (path.includes('/hubs/safety')) {
      injectHubSchema('Safety Hub', 'Health and safety protocols, TRIFR tracking, and compliance documentation for mining.', 'https://www.sesmine.com/hubs/safety-hub.html');

    } else if (path.includes('/hubs/sustainability')) {
      injectHubSchema('Sustainability Hub', 'ESG reporting, carbon tracking, and environmental impact planning for sustainable mining.', 'https://www.sesmine.com/hubs/sustainability-hub.html');

    } else if (path.includes('/hubs/innovation')) {
      injectHubSchema('Innovation Hub', 'Emerging technologies, automation trends, and R&D intelligence for mining innovation.', 'https://www.sesmine.com/hubs/innovation-hub.html');
    }
  }

  /* ── 5. Run ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', dispatchSchema);
  } else {
    dispatchSchema();
  }

  /* ── 6. Public API for dynamic pages ── */
  window.SESMineSchema = { inject: injectSchema, dispatch: dispatchSchema };

})();
