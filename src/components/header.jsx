import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function Header({ onPostJobClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  const readUser = () => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    setIsLoggedIn(!!user);
    setCurrentUser(user || null);
  };

  useEffect(() => {
    readUser();
    const onChange = () => readUser();
    window.addEventListener('authChanged', onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener('authChanged', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    const email = loginData.email.trim();
    const password = loginData.password;

    // 👉 Admin hardcoded credentials
    if (email === 'sanidhyakoranne123@gmail.com' && password === 'Mmti@help49') {
      const adminUser = {
        id: 'admin-1',
        name: 'Administrator',
        email,
        role: 'admin',
        userType: 'admin',
        loggedInAt: new Date().toISOString(),
      };
      localStorage.setItem('currentUser', JSON.stringify(adminUser));
      try { window.dispatchEvent(new Event('authChanged')); } catch {}
      setIsLoggedIn(true);
      setCurrentUser(adminUser);
      setShowLoginModal(false);
      navigate('/admin-dashboard');
      return;
    }

    // 👉 Normal users (students/candidates)
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      try { window.dispatchEvent(new Event('authChanged')); } catch {}
      setIsLoggedIn(true);
      setCurrentUser(user);
      setShowLoginModal(false);

      // send to correct dashboard
      navigate(user.userType === 'recruiter' ? '/company-dashboard' : '/dashboard');
      return;
    }

    setLoginError('Invalid email or password.');
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    try { window.dispatchEvent(new Event('authChanged')); } catch {}
    setIsLoggedIn(false);
    setCurrentUser(null);
    setIsMenuOpen(false);
    navigate('/');
  };

  const handleOpenSignupRoleModal = () => {
    setShowRoleModal(true);
  };

  const handleChooseRole = (role) => {
    localStorage.setItem('pendingSignupType', role);
    if (role === 'recruiter') {
      navigate('/register-company?from=signup&fresh=1');
    } else {
      navigate(`/onboarding?userType=${encodeURIComponent(role)}`);
    }
    setShowRoleModal(false);
  };

  const dashboardPath =
    currentUser?.userType === 'recruiter'
      ? '/company-dashboard'
      : currentUser?.userType === 'admin'
      ? '/admin-dashboard'
      : '/dashboard';

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setShowLoginModal(false);
        setShowRoleModal(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="header">
      <div className="nav-container">
      <Link to="/" className="logo">
      <img src={logo} alt="MMTijobs" className="logo-img" />
    </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/jobs" className="nav-link">Jobs</Link>
          <Link to="/mappage" className="nav-link">Map</Link>

          {isLoggedIn ? (
            <>
              <Link to={dashboardPath} className="nav-link">Dashboard</Link>
              <button onClick={handleLogout} className="logout-btn">Logout</button>

              <button
                onClick={() => {
                  if (currentUser?.userType === 'recruiter') {
                    navigate('/post-job');
                  } else {
                    onPostJobClick?.();
                  }
                }}
                className="post-job-btn"
              >
                Post a Job
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setLoginData({ email: '', password: '' });
                  setLoginError('');
                  setShowLoginModal(true);
                }}
                className="login-btn"
              >
                Login
              </button>

              <button onClick={handleOpenSignupRoleModal} className="signup-btn as-button">
                Sign Up
              </button>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <Link to="/" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link to="/about" className="mobile-link" onClick={() => setIsMenuOpen(false)}>About</Link>
          <Link to="/jobs" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Jobs</Link>
          <Link to="/mappage" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Map</Link>

          {isLoggedIn ? (
            <>
              <Link to={dashboardPath} className="mobile-link" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
              <button onClick={handleLogout} className="mobile-logout-btn">Logout</button>
              <button
                onClick={() => {
                  if (currentUser?.userType === 'recruiter') {
                    navigate('/post-job');
                  } else {
                    onPostJobClick?.();
                  }
                  setIsMenuOpen(false);
                }}
                className="mobile-post-job-btn"
              >
                Post a Job
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setLoginData({ email: '', password: '' });
                  setLoginError('');
                  setShowLoginModal(true);
                  setIsMenuOpen(false);
                }}
                className="mobile-login-btn"
              >
                Login
              </button>
              <button
                onClick={() => {
                  handleOpenSignupRoleModal();
                  setIsMenuOpen(false);
                }}
                className="mobile-signup-btn as-button"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target.classList.contains('modal-overlay')) setShowLoginModal(false);
          }}
        >
          <div className="modal-box">
            <div className="modal-header">
              <div className="brand-circle">M</div>
              <div>
                <h2 className="modal-title">Welcome back</h2>
                <p className="modal-subtitle">Sign in to continue</p>
              </div>
              <button className="modal-close" onClick={() => setShowLoginModal(false)}>✕</button>
            </div>

            <form onSubmit={handleLoginSubmit} className="form">
              <div className="form-field">
                <label>Email</label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                  placeholder="you@company.com"
                />
              </div>
              <div className="form-field">
                <label>Password</label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                  placeholder="••••••••"
                />
              </div>

              {loginError && <div className="error-banner">{loginError}</div>}

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowLoginModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Login</button>
              </div>
            </form>

            <div className="modal-footer">
              <span>Don’t have an account?</span>
              <button
                className="link-button"
                onClick={() => {
                  setShowLoginModal(false);
                  setShowRoleModal(true);
                }}
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Select (Sign Up) Modal */}
      {showRoleModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target.classList.contains('modal-overlay')) setShowRoleModal(false);
          }}
        >
          <div className="modal-box">
            <div className="modal-header">
              <div className="brand-circle">M</div>
              <div>
                <h2 className="modal-title">Create your account</h2>
                <p className="modal-subtitle">Who are you signing up as?</p>
              </div>
              <button className="modal-close" onClick={() => setShowRoleModal(false)}>✕</button>
            </div>

            <div className="role-grid">
              <button className="role-card" onClick={() => handleChooseRole('recruiter')}>
                <div className="role-icon" aria-hidden>🏢</div>
                <h3>Recruiter</h3>
                <p>Post jobs, manage applicants, and hire faster.</p>
                <span className="choose-cta">Continue as Recruiter →</span>
              </button>
              <button className="role-card" onClick={() => handleChooseRole('candidate')}>
                <div className="role-icon" aria-hidden>👩🏻‍💻</div>
                <h3>Candidate</h3>
                <p>Discover roles, apply in clicks, track progress.</p>
                <span className="choose-cta">Continue as Candidate →</span>
              </button>
            </div>

            <div className="hint">
              You can switch later in settings. No pressure, only offers.
            </div>
          </div>
        </div>
      )}

        {/* keep your existing CSS below */}
        <style jsx>{`
    /* ======= Brand palette ======= */
    :root {
      --brand: #0a66c2;
      --brand-dark: #004182;
      --ink: #111827;
      --muted: #6b7280;
      --line: #e5e7eb;
      --bg: #f8f9fa;
    }

    /* ======= Header bar ======= */
    .header {
      background-color: var(--bg);
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      position: sticky;
      top: 0;
      z-index: 100;
      width: 100%;
      border-bottom: 1px solid rgba(0,0,0,0.04);
      backdrop-filter: saturate(130%) blur(6px);
      transition: box-shadow 0.2s ease, background 0.2s ease;
    }
    .nav-container {
      display: flex;
      padding: 6px 5% !important; 
      justify-content: space-between;
      align-items: center;
      max-width: 1200px;
      margin: 0 auto;
    }

    /* ======= Brand ======= */
    .logo {
      display: flex;
      align-items: center;
      height: 50px;          /* lock header height */
    }
    .logo-img {
      height: 98px;   /* 👈 keeps header same height */
      width: auto;
      display: block;
    }
    .logo:hover { transform: translateY(-1px); }

    /* ======= Desktop nav ======= */
    .desktop-nav { display: flex; align-items: center; gap: 16px; }
    .nav-link {
      position: relative;
      text-decoration: none;
      color: #333;
      font-weight: 600;
      padding: 6px 10px;
      border-radius: 8px;
      transition: color 0.2s ease, background-color 0.2s ease, transform 0.06s ease;
    }
    .nav-link:hover {
      color: var(--brand);
      background-color: rgba(10,102,194,0.08);
      transform: translateY(-1px);
    }
    /* subtle brand underline on hover */
    .nav-link::after {
      content: "";
      position: absolute;
      left: 8px; right: 8px; bottom: 4px;
      height: 2px; border-radius: 2px;
      background: linear-gradient(90deg, var(--brand), var(--brand-dark));
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.2s ease;
    }
    .nav-link:hover::after { transform: scaleX(1); }

    /* ======= Buttons (desktop + mobile) ======= */
    .post-job-btn, .login-btn, .signup-btn, .logout-btn,
    .mobile-post-job-btn, .mobile-logout-btn, .mobile-login-btn, .mobile-signup-btn,
    .btn-primary, .btn-secondary {
      border: none;
      cursor: pointer;
      border-radius: 10px;
      font-weight: 800;
      transition: transform .06s ease, box-shadow .15s ease, background-color .15s ease, color .15s ease, border-color .15s ease;
    }

    /* Primary CTAs */
    .post-job-btn,
    .signup-btn,
    .btn-primary,
    .mobile-post-job-btn,
    .mobile-signup-btn {
      background: linear-gradient(135deg, var(--brand), var(--brand-dark));
      color: #fff;
      padding: 10px 16px;
      box-shadow: 0 8px 18px rgba(10,102,194,0.25);
    }
    .post-job-btn:hover,
    .signup-btn:hover,
    .btn-primary:hover,
    .mobile-post-job-btn:hover,
    .mobile-signup-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 10px 24px rgba(10,102,194,0.35);
    }
    .post-job-btn:active,
    .signup-btn:active,
    .btn-primary:active,
    .mobile-post-job-btn:active,
    .mobile-signup-btn:active {
      transform: translateY(1px);
    }

    /* Outline / secondary */
    .login-btn, .mobile-login-btn {
      background: transparent;
      color: var(--brand);
      border: 1px solid var(--brand);
      padding: 8px 16px;
    }
    .login-btn:hover, .mobile-login-btn:hover { background-color: rgba(10,102,194,0.06); }

    .logout-btn, .btn-secondary {
      padding: 8px 16px;
      background-color: #e5e7eb;
      color: #333;
    }
    .logout-btn:hover, .btn-secondary:hover { background-color: #d1d5db; }

    .as-button { display: inline-block; }
    .wfull { width: 100%; }

    /* ======= Mobile menu ======= */
    .mobile-menu-btn {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 24px;
      color: #333;
      padding: 4px;
      border-radius: 8px;
      transition: background .15s ease;
    }
    .mobile-menu-btn:hover { background: rgba(10,102,194,0.08); }

    .mobile-menu {
      display: none;
      flex-direction: column;
      gap: 12px;
      padding: 0 5% 12px;
      background-color: var(--bg);
    }
    .mobile-link {
      text-decoration: none; color: #333; font-weight: 500;
      padding: 8px 0; border-bottom: 1px solid #e5e7eb;
    }

    /* ======= Modals (global) ======= */
      .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0,0,0,0.55);
      display: flex;
      justify-content: center;
      align-items: center; /* absolute vertical centering */
      z-index: 9999;
    }

    .modal-box {
      background: #fff;
      border-radius: 16px;
      padding: 20px;
      width: 100%;
      max-width: 520px;
      box-shadow: 0 24px 60px rgba(0,0,0,0.25);
      animation: pop .15s ease-out;
    }

    @keyframes pop {
      from { transform: scale(0.98); opacity: 0.9; }
      to { transform: scale(1); opacity: 1; }
    }

    .modal-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
    .brand-circle {
      width: 38px; height: 38px; border-radius: 10px;
      background: linear-gradient(135deg, var(--brand), var(--brand-dark));
      color: #fff; display: grid; place-items: center; font-weight: 900;
      box-shadow: inset 0 0 0 1px rgba(255,255,255,.35);
    }
    .modal-title { margin: 0; font-size: 20px; color: var(--ink); font-weight: 900; }
    .modal-subtitle { margin: 2px 0 0; color: var(--muted); font-size: 14px; }
    .modal-close {
      margin-left: auto; background: #f3f4f6; border: none; border-radius: 10px;
      width: 34px; height: 34px; cursor: pointer; color: #374151;
      transition: background .15s ease, transform .06s ease;
    }
    .modal-close:hover { background: #e5e7eb; }
    .modal-close:active { transform: translateY(1px); }

    /* ======= Forms in modals ======= */
    .form { margin-top: 8px; }
    .form-field { margin-bottom: 12px; }
    .form-field label { display: block; margin-bottom: 6px; font-weight: 600; color: #374151; }
    .form-field input {
      width: 100%; padding: 10px 12px;
      border: 1px solid #e5e7eb; border-radius: 8px; outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .form-field input:focus {
      border-color: var(--brand);
      box-shadow: 0 0 0 3px rgba(10,102,194,0.12);
    }
    .error-banner {
      background: #fee2e2; color: #991b1b; border: 1px solid #fecaca;
      border-radius: 8px; padding: 8px 12px; font-size: 14px; margin-bottom: 8px;
    }
    .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 6px; }
    .btn-secondary { padding: 10px 16px; background: #e5e7eb; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }
    .btn-secondary:hover { background: #d1d5db; }
    .btn-primary   { padding: 10px 16px; background: var(--brand); color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }
    .btn-primary:hover { background: var(--brand-dark); }
    .modal-footer { display: flex; gap: 6px; justify-content: center; align-items: center; margin-top: 12px; color: var(--muted); }
    .link-button { background: none; border: none; color: var(--brand); font-weight: 700; cursor: pointer; padding: 0; }

    /* ======= Role selection modal (Recruiter / Candidate) ======= */
    .role-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-top: 8px;
    }
    .role-card {
      position: relative;
      text-align: left;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      padding: 16px 14px;
      cursor: pointer;
      outline: none;
      transition:
        border-color .15s ease,
        box-shadow .18s ease,
        transform .08s ease,
        background-color .18s ease;
    }
    /* soft brand ring/glow on hover */
    .role-card::after {
      content: "";
      position: absolute; inset: 0;
      border-radius: 14px; pointer-events: none;
      box-shadow: 0 0 0 0 rgba(10,102,194,0);
      transition: box-shadow .18s ease;
    }
    .role-card:hover {
      border-color: #cfe2f6;
      box-shadow: 0 12px 28px rgba(10,102,194,0.12);
      transform: translateY(-2px);
      background-color: #fbfdff;
    }
    .role-card:hover::after { box-shadow: 0 0 0 4px rgba(10,102,194,0.10); }
    .role-card:focus-visible {
      border-color: var(--brand);
      box-shadow: 0 0 0 4px rgba(10,102,194,0.22);
    }

    .role-icon {
      display: inline-grid; place-items: center;
      width: 40px; height: 40px; border-radius: 12px;
      background: linear-gradient(135deg, var(--brand), var(--brand-dark));
      color: #fff; font-size: 22px;
      box-shadow: 0 8px 20px rgba(10,102,194,0.25);
    }
    .role-card h3 {
      margin: 10px 0 4px;
      color: var(--ink);
      font-weight: 900;
      font-size: 16px;
      letter-spacing: .2px;
    }
    .role-card p {
      margin: 0;
      color: var(--muted);
      font-size: 14px;
      line-height: 1.35;
    }
    .choose-cta {
      display: inline-flex; align-items: center; gap: 6px;
      margin-top: 12px;
      color: var(--brand);
      font-weight: 900;
      font-size: 14px;
      letter-spacing: .2px;
      transition: transform .08s ease, color .15s ease;
    }
    .role-card:hover .choose-cta { transform: translateX(2px); color: var(--brand-dark); }

    .hint { margin-top: 12px; text-align: center; color: var(--muted); font-size: 13px; }

    /* ======= Responsive ======= */
    @media (max-width: 768px) {
      .desktop-nav { display: none; }
      .mobile-menu-btn { display: block; }
      .mobile-menu { display: flex; }
      .role-grid { grid-template-columns: 1fr; gap: 12px; }
    }

    /* ======= Reduced motion ======= */
    @media (prefers-reduced-motion: reduce) {
      .nav-link, .post-job-btn, .signup-btn, .login-btn, .logout-btn,
      .mobile-post-job-btn, .mobile-login-btn, .mobile-logout-btn, .mobile-signup-btn,
      .role-card, .modal-box { transition: none !important; }
    }
`}</style>


    </header>
  );
}




   