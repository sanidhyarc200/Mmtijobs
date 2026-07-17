// src/App.jsx
import React, { useState, useEffect } from 'react';
import { seedOnce } from './data/seedData';
import { initApiStore } from './data/apiStore';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from 'react-router-dom';

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
import CompanyDashboard from './pages/CompanyDashboard';
import JobApplicants from './pages/JobApplicants';
import EditProfile from './pages/EditProfile';
import AdminDashboard from './pages/AdminDashboard';
import ResumeBuilder from './pages/ResumeBilder';
import HRDashboard from './pages/HRDashboard';
import HRRecruiterDashboard from './pages/HRRecruiterDashboard';
import AdminLogin from './pages/auth/AdminLogin';
import HRManagerLogin from './pages/auth/HRManagerLogin';
import HRLogin from './pages/auth/HRLogin';
import HRRecruiterLogin from './pages/auth/HRRecruiterLogin'; 
import HRManagerDashboard from './pages/HRManagerDashboard';

/* ------------------------------------------------------------------ */
/* -------------------------- Layout Wrapper ------------------------- */
/* ------------------------------------------------------------------ */

function Layout({ onPostJobClick, children }) {
  const location = useLocation();

  // 🔒 Routes where header must NOT appear
  const headerHiddenRoutes = [
    '/auth/admin',
    '/auth/hr-manager',
    '/auth/hr',
    '/auth/hr-recruiter',
  ];

  // Resume builder routes — always full screen, no header
  const hideHeader =
    headerHiddenRoutes.includes(location.pathname) ||
    location.pathname.startsWith('/resume-builder');

  return (
    <>
      {!hideHeader && <Header onPostJobClick={onPostJobClick} />}
      {children}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* -------------------------- Modals Logic --------------------------- */
/* ------------------------------------------------------------------ */

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
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = () => {
    // Check the synced list first (works across devices), then fall back to
    // the legacy single-company key.
    const companies = JSON.parse(localStorage.getItem('registeredCompanies')) || [];
    const legacy = JSON.parse(localStorage.getItem('registeredCompany'));
    const candidates = legacy ? [...companies, legacy] : companies;

    const savedCompany = candidates.find(
      (c) =>
        c &&
        c.email &&
        c.email.toLowerCase() === email.toLowerCase() &&
        c.password === password
    );

    if (savedCompany) {
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const recruiter = {
        id: Date.now(),
        userType: 'recruiter',
        email: savedCompany.email,
        password: savedCompany.password,
        name: savedCompany.name,
        company: savedCompany.name,
        contact: savedCompany.contact,
        createdAt: new Date().toISOString(),
      };

      users.push(recruiter);
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(recruiter));
      window.dispatchEvent(new Event('authChanged'));

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
        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ ...styles.input, paddingRight: '42px' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(p => !p)}
            style={{
              position: 'absolute', right: '10px', top: '50%',
              transform: 'translateY(-50%)', background: 'none',
              border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px'
            }}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
        {error && <p style={styles.error}>{error}</p>}
        <button onClick={handleLogin} style={styles.primaryBtn}>Login</button>
        <button onClick={onClose} style={styles.cancelBtn}>Cancel</button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ------------------------------ App -------------------------------- */
/* ------------------------------------------------------------------ */
export default function App() {
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [storeReady, setStoreReady] = useState(false);

  // Hydrate localStorage from the backend API first, then apply the one-time
  // demo seed (merged by id, so nothing duplicates). Pages render only after
  // hydration so they never read stale/empty data.
  useEffect(() => {
    initApiStore().finally(() => {
      seedOnce();
      setStoreReady(true);
    });
  }, []);

  if (!storeReady) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Arial, sans-serif',
          color: '#0a66c2',
        }}
      >
        Loading…
      </div>
    );
  }

  return (
    <Router>
      <Layout onPostJobClick={() => setShowPostJobModal(true)}>
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
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/job-applicants/:jobId" element={<JobApplicants />} />
          <Route path="/company-dashboard" element={<CompanyDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/resume-builder/start" element={<ResumeBuilder />} />
          <Route path="/hr-dashboard" element={<HRDashboard />} />
          <Route path="/hr-recruiter-dashboard" element={<HRRecruiterDashboard />} />
          <Route path="/hr-manager-dashboard" element={<HRManagerDashboard />} />
          <Route path="/auth/admin" element={<AdminLogin />} />
          <Route path="/auth/hr-manager" element={<HRManagerLogin />} />
          <Route path="/auth/hr" element={<HRLogin />} />
          <Route path="/auth/hr-recruiter" element={<HRRecruiterLogin />} />
        </Routes>

        {showPostJobModal && (
          <PostJobModal onClose={() => setShowPostJobModal(false)} />
        )}
      </Layout>
    </Router>
  );
}
