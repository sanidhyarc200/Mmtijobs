import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Header({ onPostJobClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          <button onClick={onPostJobClick} className="post-job-btn">
            Post a Job
          </button>
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
          <button
            onClick={() => {
              onPostJobClick();
              setIsMenuOpen(false);
            }}
            className="mobile-post-job-btn"
          >
            Post a Job
          </button>
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
          padding: 1px 5%;  /* Reduced vertical padding */
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .logo {
          font-size: 22px;  /* Kept original size */
          font-weight: bold;
          color: #0a66c2;
          text-decoration: none;
        }
        
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 20px;
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
          padding: 6px 16px;  /* Slightly reduced vertical padding */
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
        
        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 24px;
          color: #333;
          padding: 4px;  /* Added padding for better touch target */
        }
        
        .mobile-menu {
          display: none;
          flex-direction: column;
          gap: 12px;  /* Slightly reduced gap */
          padding: 0 5% 12px;  /* Reduced bottom padding */
          background-color: #f8f9fa;
        }
        
        .mobile-link {
          text-decoration: none;
          color: #333;
          font-weight: 500;
          padding: 8px 0;  /* Reduced padding */
          border-bottom: 1px solid #e5e7eb;
        }
        
        .mobile-post-job-btn {
          padding: 8px;  /* Reduced padding */
          background-color: #0a66c2;
          color: white;
          border-radius: 5px;
          font-weight: bold;
          border: none;
          margin-top: 8px;  /* Reduced margin */
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