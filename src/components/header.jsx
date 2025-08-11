import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Header({ onPostJobClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  // Check login status on component mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
      setIsLoggedIn(true);
      setCurrentUser(user);
    }
  }, []);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === loginData.email && u.password === loginData.password);
    
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      setIsLoggedIn(true);
      setCurrentUser(user);
      setShowLoginModal(false);
      alert('Login successful!');
    } else {
      alert('Invalid credentials!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  return (
    <header className="header">
      <div className="nav-container">
        <Link to="/" className="logo">
          MMTijobs
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/jobs" className="nav-link">Jobs</Link>
          <Link to="/mappage" className="nav-link">Map</Link>
          
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
              {currentUser?.userType === 'recruiter' && (
                <button onClick={onPostJobClick} className="post-job-btn">
                  Post a Job
                </button>
              )}
            </>
          ) : (
            <>
              <button onClick={() => setShowLoginModal(true)} className="login-btn">
                Login
              </button>
              <Link to="/onboarding" className="signup-btn">
                Sign Up
              </Link>
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
              <Link to="/dashboard" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
              <button onClick={handleLogout} className="mobile-logout-btn">
                Logout
              </button>
              {currentUser?.userType === 'recruiter' && (
                <button
                  onClick={() => {
                    onPostJobClick();
                    setIsMenuOpen(false);
                  }}
                  className="mobile-post-job-btn"
                >
                  Post a Job
                </button>
              )}
            </>
          ) : (
            <>
              <button onClick={() => {
                setShowLoginModal(true);
                setIsMenuOpen(false);
              }} className="mobile-login-btn">
                Login
              </button>
              <Link to="/onboarding" className="mobile-signup-btn" onClick={() => setIsMenuOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 style={{ color: '#0a66c2', marginBottom: '15px' }}>Login</h2>
            <form onSubmit={handleLoginSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Email:</label>
                <input
                  type="email"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                  }}
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  required
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Password:</label>
                <input
                  type="password"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                  }}
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="button"
                  style={{
                    padding: '8px 16px',
                    background: '#e5e7eb',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  onClick={() => setShowLoginModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={{
                  padding: '8px 16px',
                  background: '#0a66c2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}>
                  Login
                </button>
              </div>
            </form>
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <p style={{ color: '#6b7280' }}>Don't have an account? <Link 
                to="/onboarding"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0a66c2',
                  cursor: 'pointer',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
                onClick={() => setShowLoginModal(false)}
              >
                Sign up
              </Link></p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .header {
          background-color: #f8f9fa;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          position: sticky;
          top: 0;
          z-index: 100;
          width: 100%;
        }
        
        .nav-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1px 5%;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .logo {
          font-size: 22px;
          font-weight: bold;
          color: #0a66c2;
          text-decoration: none;
        }
        
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .nav-link {
          text-decoration: none;
          color: #333;
          font-weight: 500;
          transition: color 0.3s ease;
        }
        
        .nav-link:hover {
          color: #0a66c2;
        }
        
        .post-job-btn {
          padding: 6px 16px;
          background-color: #0a66c2;
          color: white;
          border-radius: 5px;
          font-weight: bold;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .post-job-btn:hover {
          background-color: #004182;
          transform: translateY(-1px);
        }
        
        .login-btn {
          padding: 6px 16px;
          background: transparent;
          color: #0a66c2;
          border: 1px solid #0a66c2;
          border-radius: 5px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .login-btn:hover {
          background-color: #f0f7ff;
        }
        
        .signup-btn {
          padding: 6px 16px;
          background-color: #0a66c2;
          color: white;
          border-radius: 5px;
          font-weight: bold;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        
        .signup-btn:hover {
          background-color: #004182;
        }
        
        .logout-btn {
          padding: 6px 16px;
          background-color: #e5e7eb;
          color: #333;
          border-radius: 5px;
          font-weight: bold;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .logout-btn:hover {
          background-color: #d1d5db;
        }
        
        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 24px;
          color: #333;
          padding: 4px;
        }
        
        .mobile-menu {
          display: none;
          flex-direction: column;
          gap: 12px;
          padding: 0 5% 12px;
          background-color: #f8f9fa;
        }
        
        .mobile-link {
          text-decoration: none;
          color: #333;
          font-weight: 500;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .mobile-post-job-btn {
          padding: 8px;
          background-color: #0a66c2;
          color: white;
          border-radius: 5px;
          font-weight: bold;
          border: none;
          margin-top: 8px;
        }
        
        .mobile-login-btn {
          padding: 8px;
          background: transparent;
          color: #0a66c2;
          border: 1px solid #0a66c2;
          border-radius: 5px;
          font-weight: bold;
          cursor: pointer;
          margin-top: 8px;
          text-align: center;
        }
        
        .mobile-signup-btn {
          padding: 8px;
          background-color: #0a66c2;
          color: white;
          border-radius: 5px;
          font-weight: bold;
          text-decoration: none;
          text-align: center;
          margin-top: 8px;
        }
        
        .mobile-logout-btn {
          padding: 8px;
          background-color: #e5e7eb;
          color: #333;
          border-radius: 5px;
          font-weight: bold;
          border: none;
          cursor: pointer;
          margin-top: 8px;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0,0,0,0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modal-box {
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }
        
        @media (max-width: 768px) {
          .desktop-nav {
            display: none;
          }
          
          .mobile-menu-btn {
            display: block;
          }
          
          .mobile-menu {
            display: flex;
          }
        }
      `}</style>
    </header>
  );
}