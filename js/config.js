/**
 * SESMine — Global Configuration & Auth System
 * Real session management with role-based access control
 */

const SESMine = (() => {

  // ── Constants ──────────────────────────────────────────────
  const LOGO_URL = 'https://cdn.grapesjs.com/workspaces/cmjdh0oo603xm12grpuiruk7p/assets/f6b95b3d-49d1-4e77-b952-49ed80c4befa__image-9-14-1404-ap-at-8.42-pm.png';

  const STORAGE_KEY  = 'sesmine_session';
  const USERS_KEY    = 'sesmine_users';

  // ── Seed demo accounts (first run only) ───────────────────
  const DEMO_USERS = [
    {
      id:        'usr_admin_001',
      email:     'admin@sesmine.com',
      password:  'Admin2026!',
      firstName: 'James',
      lastName:  'Wilson',
      role:      'admin',
      plan:      'enterprise',
      company:   'SESMine',
      avatar:    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
      createdAt: '2026-01-01T00:00:00Z'
    },
    {
      id:        'usr_pro_001',
      email:     'engineer@bhp.com',
      password:  'Mining2026!',
      firstName: 'Sarah',
      lastName:  'Nguyen',
      role:      'user',
      plan:      'pro',
      company:   'BHP',
      avatar:    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
      createdAt: '2026-02-15T00:00:00Z'
    },
    {
      id:        'usr_free_001',
      email:     'student@uwa.edu.au',
      password:  'Student2026!',
      firstName: 'Alex',
      lastName:  'Chen',
      role:      'user',
      plan:      'free',
      company:   'University of Western Australia',
      avatar:    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&crop=face',
      createdAt: '2026-03-10T00:00:00Z'
    }
  ];

  // ── Hub access rules by plan ───────────────────────────────
  const HUB_ACCESS = {
    free:       ['economics-hub'],          // preview only
    pro:        ['economics-hub','engineering-hub','procurement-hub','safety-hub','sustainability-hub','innovation-hub'],
    enterprise: ['economics-hub','engineering-hub','procurement-hub','safety-hub','sustainability-hub','innovation-hub'],
    admin:      ['economics-hub','engineering-hub','procurement-hub','safety-hub','sustainability-hub','innovation-hub']
  };

  // ── Seed users on first load ───────────────────────────────
  function seedUsers() {
    if (!localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEMO_USERS));
    }
  }

  // ── Auth helpers ───────────────────────────────────────────
  function getUsers()   { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
  function getSession() { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); }

  function login(email, password) {
    const users = getUsers();
    const user  = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) return { ok: false, error: 'Invalid email or password.' };
    const session = {
      userId:    user.id,
      email:     user.email,
      firstName: user.firstName,
      lastName:  user.lastName,
      role:      user.role,
      plan:      user.plan,
      company:   user.company,
      avatar:    user.avatar,
      loginAt:   new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return { ok: true, session };
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = '/auth/login.html';
  }

  function register(data) {
    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { ok: false, error: 'An account with this email already exists.' };
    }
    const newUser = {
      id:        'usr_' + Date.now(),
      email:     data.email,
      password:  data.password,
      firstName: data.firstName,
      lastName:  data.lastName,
      role:      'user',
      plan:      'free',
      company:   data.company || '',
      avatar:    `https://ui-avatars.com/api/?name=${encodeURIComponent(data.firstName+'+'+data.lastName)}&background=f5a623&color=fff&size=80`,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    // auto-login
    const session = { ...newUser };
    delete session.password;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return { ok: true, session };
  }

  function isLoggedIn()  { return !!getSession(); }
  function isAdmin()     { const s = getSession(); return s && s.role === 'admin'; }
  function isPro()       { const s = getSession(); return s && (s.plan === 'pro' || s.plan === 'enterprise' || s.role === 'admin'); }

  function canAccessHub(hubSlug) {
    const s = getSession();
    if (!s) return false;
    const plan = s.role === 'admin' ? 'admin' : s.plan;
    return (HUB_ACCESS[plan] || []).includes(hubSlug);
  }

  // ── Guard: redirect to login if not authenticated ─────────
  function requireAuth(redirectBack) {
    if (!isLoggedIn()) {
      const back = redirectBack || window.location.pathname;
      window.location.href = '/auth/login.html?redirect=' + encodeURIComponent(back);
      return false;
    }
    return true;
  }

  // ── Guard: redirect to upgrade if insufficient plan ───────
  function requireHub(hubSlug) {
    if (!requireAuth()) return false;
    if (!canAccessHub(hubSlug)) {
      showToast('Upgrade to Pro to access this hub.', 'warning', 4000);
      setTimeout(() => { window.location.href = '/pricing.html'; }, 1500);
      return false;
    }
    return true;
  }

  // ── Guard: admin only ──────────────────────────────────────
  function requireAdmin() {
    if (!requireAuth()) return false;
    if (!isAdmin()) {
      showToast('Admin access required.', 'error');
      setTimeout(() => { window.location.href = '/dashboard/main-dashboard.html'; }, 1500);
      return false;
    }
    return true;
  }

  // ── Inject logo wherever data-sesmine-logo appears ────────
  function injectLogos() {
    document.querySelectorAll('[data-sesmine-logo]').forEach(el => {
      el.src = LOGO_URL;
      el.alt = 'SESMine';
    });
  }

  // ── Inject user info into nav ──────────────────────────────
  function injectNavUser() {
    const session = getSession();
    const navUserEl = document.getElementById('navUserInfo');
    if (!navUserEl || !session) return;
    navUserEl.innerHTML = `
      <img src="${session.avatar}" alt="${session.firstName}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;border:2px solid var(--color-accent)">
      <span style="font-size:0.82rem;font-weight:600;color:var(--color-text-primary)">${session.firstName}</span>
    `;
  }

  // ── Toast notification ─────────────────────────────────────
  function showToast(message, type = 'info', duration = 3000) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;';
      document.body.appendChild(container);
    }
    const colors = { success:'#2ecc71', error:'#ef4444', warning:'#f5a623', info:'#6366f1' };
    const icons  = { success:'✓', error:'✕', warning:'⚠', info:'ℹ' };
    const toast  = document.createElement('div');
    toast.style.cssText = `
      display:flex;align-items:center;gap:10px;
      padding:12px 18px;background:#1a1d27;
      border:1px solid ${colors[type]};border-radius:10px;
      color:#fff;font-size:0.875rem;font-family:var(--font-body,sans-serif);
      box-shadow:0 8px 24px rgba(0,0,0,0.4);
      animation:slideInToast .25s ease;max-width:320px;
    `;
    toast.innerHTML = `<span style="color:${colors[type]};font-weight:700;font-size:1rem">${icons[type]}</span><span>${message}</span>`;
    if (!document.getElementById('toastStyle')) {
      const s = document.createElement('style');
      s.id = 'toastStyle';
      s.textContent = '@keyframes slideInToast{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}';
      document.head.appendChild(s);
    }
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity='0'; toast.style.transition='opacity .3s'; setTimeout(()=>toast.remove(),300); }, duration);
  }

  // ── Format helpers ─────────────────────────────────────────
  function formatCurrency(n, symbol='$', decimals=0) {
    return symbol + Number(n).toLocaleString('en-AU', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }
  function formatNumber(n, decimals=0) {
    return Number(n).toLocaleString('en-AU', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }

  // ── Init ───────────────────────────────────────────────────
  function init() {
    seedUsers();
    injectLogos();
    injectNavUser();
  }

  document.addEventListener('DOMContentLoaded', init);

  // ── Public API ─────────────────────────────────────────────
  return {
    LOGO_URL,
    login, logout, register,
    getSession, isLoggedIn, isAdmin, isPro, canAccessHub,
    requireAuth, requireHub, requireAdmin,
    showToast, formatCurrency, formatNumber,
    injectLogos, injectNavUser
  };

})();
