import React from 'react';
import { Link } from 'react-router-dom';

export default function Header({ onPostJobClick }) {
  return (
    <header>
      <div className="container nav" style={styles.nav}>
        <Link to="/" style={{ ...styles.logo, textDecoration: 'none', color: 'inherit' }}>
          MMTijobs
        </Link>
        <nav style={styles.navLinks}>
          <Link to="/" style={styles.link}>Home</Link>
          <Link to="/maintenance" style={styles.link}>About</Link>
          <Link to="/jobs" style={styles.link}>Jobs</Link>

          {/* Post a Job - separate button look */}
          <span
            onClick={onPostJobClick}
            // style={styles.postJobButton}
          >
            Post a Job
          </span>

          {/* <Link to="/maintenance" style={styles.link}>Company</Link> */}
        </nav>
      </div>
    </header>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 30px',
    backgroundColor: '#f8f9fa',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  logo: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#0a66c2',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  link: {
    textDecoration: 'none',
    color: '#333',
    fontWeight: 500,
  },
  postJobButton: {
    padding: '6px 14px',
    backgroundColor: '#0a66c2',
    color: 'white',
    borderRadius: '5px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  }
};
