import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header>
      <div className="container nav">
        <div className="logo">MMTijobs</div>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/maintenance">About</Link>
          <Link to="/jobs">Jobs</Link>
          <Link to="/maintenance">Post a Job</Link>
          <Link to="/maintenance">Register</Link>
        </nav>
      </div>
    </header>
  );
}
