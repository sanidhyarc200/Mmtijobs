// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modal: {
    backgroundColor: 'white',
    padding: '30px 25px',
    borderRadius: '10px',
    width: '350px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: '20px',
    fontWeight: 600,
    textAlign: 'center',
    color: '#0a66c2',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '12px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '14px',
  },
  primaryBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#0a66c2',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '10px',
  },
  secondaryBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#198754',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '10px',
  },
  cancelBtn: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#f1f1f1',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#333',
  },
  error: {
    color: 'red',
    fontSize: '14px',
    marginBottom: '10px',
    textAlign: 'center',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '10px',
  }
};

import Header from './components/header';
import JobsPage from './pages/JobsPage';
import LandingPage from './pages/LandingPage';
import MaintenancePage from './pages/Maintenance';
import RegisterCompany from './pages/RegisterCompany';
import AboutPage from './pages/AboutPage';
import PostJob from './pages/PostJob';
import UserOnboarding from './pages/UserOnboarding';
import MapPage from './pages/Mappage';
import Dashboard from './pages/Dasboard';
import CompanyDashboard from './pages/CompanyDashboard'; // ✅ added
import JobApplicants from './pages/JobApplicants';
import EditProfile from './pages/EditProfile'; // ✅ added
import AdminDashboard from './pages/AdminDashboard'; // ✅ added
// Dummy PostJobPage placeholder for now (unused, safe to keep)
function PostJobPage() {
  return <h1 style={{ padding: 30 }}>This is Post a Job page (UI coming soon)</h1>;
}

// Modal component (simplified) to ask: "Are you registered? Yes/No"
function PostJobModal({ onClose }) {
  const [registered, setRegistered] = useState(null);
  const navigate = useNavigate();

  const handleYes = () => setRegistered(true);
  const handleNo = () => {
    navigate('/register-company');
    onClose();
  };

  if (registered === true) return <CompanyLoginModal onClose={onClose} />;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Are you already registered?</h2>
        <div style={styles.buttonGroup}>
          <button onClick={handleYes} style={styles.primaryBtn}>Yes, Log In</button>
          <button onClick={handleNo} style={styles.secondaryBtn}>No, Register</button>
        </div>
        <button onClick={onClose} style={styles.cancelBtn}>Cancel</button>
      </div>
    </div>
  );
}

function CompanyLoginModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    const savedCompany = JSON.parse(localStorage.getItem('registeredCompany'));
    if (
      savedCompany &&
      savedCompany.email.toLowerCase() === email.toLowerCase() &&
      savedCompany.password === password
    ) {
      // upsert recruiter into users
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const idx = users.findIndex(u => u.email?.toLowerCase() === savedCompany.email.toLowerCase());
      const recruiter = {
        id: idx >= 0 ? users[idx].id : Date.now(),
        userType: 'recruiter',
        email: savedCompany.email,
        password: savedCompany.password,
        name: savedCompany.name,
        company: savedCompany.name,
        contact: savedCompany.contact,
        createdAt: new Date().toISOString(),
      };
      if (idx >= 0) users[idx] = recruiter; else users.push(recruiter);
      localStorage.setItem('users', JSON.stringify(users));

      // set current user + notify header
      localStorage.setItem('currentUser', JSON.stringify(recruiter));
      try { window.dispatchEvent(new Event('authChanged')); } catch {}

      onClose();
      navigate('/post-job');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Company Login</h2>

        <input
          type="email"
          placeholder="Company Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        {error && <p style={styles.error}>{error}</p>}

        <button onClick={handleLogin} style={styles.primaryBtn}>Login</button>
        <button onClick={onClose} style={styles.cancelBtn}>Cancel</button>
      </div>
    </div>
  );
}

export default function App() {
  const [showPostJobModal, setShowPostJobModal] = React.useState(false);

  return (
    <Router>
      <Header onPostJobClick={() => setShowPostJobModal(true)} />
      <Routes>
        <Route path="/" element={<LandingPage onPostJobClick={() => setShowPostJobModal(true)} />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/register-company" element={<RegisterCompany />} />
        <Route path="/onboarding" element={<UserOnboarding />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/mappage" element={<MapPage />} />
        <Route path="/post-job" element={<PostJob />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/edit-profile" element={<EditProfile />} /> {/* ✅ added */}
        {/* <Route path="/company-profile" element={<CompanyProfile />} /> */}
        <Route path="/job-applicants/:jobId" element={<JobApplicants />} />
        <Route path="/company-dashboard" element={<CompanyDashboard />} /> {/* ✅ added */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>

      {showPostJobModal && (
        <PostJobModal onClose={() => setShowPostJobModal(false)} />
      )}
    </Router>
  );
}
