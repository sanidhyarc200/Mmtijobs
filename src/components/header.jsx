import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(
      (u) => u.email === loginData.email && u.password === loginData.password
    );

    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      try { window.dispatchEvent(new Event('authChanged')); } catch {}
      setIsLoggedIn(true);
      setCurrentUser(user);
      setShowLoginModal(false);

      // 👉 send to correct dashboard
      navigate(user.userType === 'recruiter' ? '/company-dashboard' : '/dashboard');
    } else {
      setLoginError('Invalid email or password.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    try { window.dispatchEvent(new Event('authChanged')); } catch {}
    setIsLoggedIn(false);
    setCurrentUser(null);
    setIsMenuOpen(false);
  };

  const handleOpenSignupRoleModal = () => {
    setShowRoleModal(true);
  };

  const handleChooseRole = (role) => {
    localStorage.setItem('pendingSignupType', role);
    if (role === 'recruiter') {
      // force fresh company registration form
      navigate('/register-company?from=signup&fresh=1');
    } else {
      navigate(`/onboarding?userType=${encodeURIComponent(role)}`);
    }
    setShowRoleModal(false);
  };

  // dynamic dashboard path
  const dashboardPath =
    currentUser?.userType === 'recruiter' ? '/company-dashboard' : '/dashboard';

  // Close modals on ESC
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
        <Link to="/" className="logo">MMTijobs</Link>

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

              {/* 👉 Post a Job should NOT ask anything if recruiter */}
              <button
                onClick={() => {
                  if (currentUser?.userType === 'recruiter') {
                    navigate('/post-job');
                  } else {
                    // not a recruiter → open the old modal flow
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

              {/* Instead of Link -> open Role modal first */}
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
        .header { background-color: #f8f9fa; box-shadow: 0 2px 8px rgba(0,0,0,0.05); position: sticky; top: 0; z-index: 100; width: 100%; }
        .nav-container { display: flex; justify-content: space-between; align-items: center; padding: 10px 5%; max-width: 1200px; margin: 0 auto; }
        .logo { font-size: 22px; font-weight: 800; color: #0a66c2; text-decoration: none; letter-spacing: 0.3px; }
        .desktop-nav { display: flex; align-items: center; gap: 15px; }
        .nav-link { text-decoration: none; color: #333; font-weight: 500; transition: color 0.2s ease; }
        .nav-link:hover { color: #0a66c2; }
        .post-job-btn { padding: 8px 16px; background-color: #0a66c2; color: white; border-radius: 6px; font-weight: 700; border: none; cursor: pointer; transition: transform 0.1s ease, background 0.2s ease; }
        .post-job-btn:hover { background-color: #004182; transform: translateY(-1px); }
        .login-btn { padding: 8px 16px; background: transparent; color: #0a66c2; border: 1px solid #0a66c2; border-radius: 6px; font-weight: 700; cursor: pointer; transition: background 0.2s ease; }
        .login-btn:hover { background-color: #f0f7ff; }
        .signup-btn { padding: 8px 16px; background-color: #0a66c2; color: white; border-radius: 6px; font-weight: 700; text-decoration: none; transition: background 0.2s ease; border: none; cursor: pointer; }
        .signup-btn:hover { background-color: #004182; }
        .as-button { display: inline-block; }
        .logout-btn { padding: 8px 16px; background-color: #e5e7eb; color: #333; border-radius: 6px; font-weight: 700; border: none; cursor: pointer; transition: background 0.2s ease; }
        .logout-btn:hover { background-color: #d1d5db; }
        .mobile-menu-btn { display: none; background: none; border: none; cursor: pointer; font-size: 24px; color: #333; padding: 4px; }
        .mobile-menu { display: none; flex-direction: column; gap: 12px; padding: 0 5% 12px; background-color: #f8f9fa; }
        .mobile-link { text-decoration: none; color: #333; font-weight: 500; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .mobile-post-job-btn, .mobile-logout-btn, .mobile-login-btn, .mobile-signup-btn { padding: 10px; border-radius: 6px; font-weight: 700; border: none; cursor: pointer; text-align: center; }
        .mobile-post-job-btn { background-color: #0a66c2; color: white; margin-top: 8px; }
        .mobile-logout-btn { background-color: #e5e7eb; color: #333; margin-top: 8px; }
        .mobile-login-btn { background: transparent; color: #0a66c2; border: 1px solid #0a66c2; margin-top: 8px; }
        .mobile-signup-btn { background-color: #0a66c2; color: white; margin-top: 8px; }
        .modal-overlay { position: fixed; inset: 0; background-color: rgba(0,0,0,0.55); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 16px; }
        .modal-box { background: #fff; padding: 20px; border-radius: 12px; width: 100%; max-width: 460px; box-shadow: 0 12px 40px rgba(0,0,0,0.25); position: relative; animation: pop 0.15s ease-out; }
        @keyframes pop { from { transform: scale(0.98); opacity: 0.9; } to { transform: scale(1); opacity: 1; } }
        .modal-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .brand-circle { width: 36px; height: 36px; border-radius: 50%; background: #0a66c2; color: #fff; display: grid; place-items: center; font-weight: 800; }
        .modal-title { margin: 0; font-size: 20px; color: #111827; }
        .modal-subtitle { margin: 2px 0 0; color: #6b7280; font-size: 14px; }
        .modal-close { margin-left: auto; background: #f3f4f6; border: none; border-radius: 8px; width: 32px; height: 32px; cursor: pointer; color: #374151; }
        .modal-close:hover { background: #e5e7eb; }
        .form { margin-top: 8px; }
        .form-field { margin-bottom: 12px; }
        .form-field label { display: block; margin-bottom: 6px; font-weight: 600; color: #374151; }
        .form-field input { width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; outline: none; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        .form-field input:focus { border-color: #0a66c2; box-shadow: 0 0 0 3px rgba(10,102,194,0.12); }
        .error-banner { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; border-radius: 8px; padding: 8px 12px; font-size: 14px; margin-bottom: 8px; }
        .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 6px; }
        .btn-secondary { padding: 10px 16px; background: #e5e7eb; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }
        .btn-secondary:hover { background: #d1d5db; }
        .btn-primary { padding: 10px 16px; background: #0a66c2; color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }
        .btn-primary:hover { background: #004182; }
        .modal-footer { display: flex; gap: 6px; justify-content: center; align-items: center; margin-top: 12px; color: #6b7280; }
        .link-button { background: none; border: none; color: #0a66c2; font-weight: 700; cursor: pointer; padding: 0; }
        .role-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 6px; }
        .role-card { text-align: left; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; background: #fff; cursor: pointer; transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.06s ease; }
        .role-card:hover { border-color: #0a66c2; box-shadow: 0 8px 24px rgba(10,102,194,0.12); transform: translateY(-1px); }
        .role-icon { font-size: 28px; }
        .role-card h3 { margin: 6px 0 4px; color: #111827; }
        .role-card p { margin: 0; color: #6b7280; font-size: 14px; }
        .choose-cta { display: inline-block; margin-top: 10px; color: #0a66c2; font-weight: 700; }
        .hint { margin-top: 10px; text-align: center; color: #6b7280; font-size: 13px; }
        @media (max-width: 768px) {
          .desktop-nav { display: none; }
          .mobile-menu-btn { display: block; }
          .mobile-menu { display: flex; }
          .role-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </header>
  );
}
