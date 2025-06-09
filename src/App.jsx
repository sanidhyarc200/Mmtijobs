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
import MaintenancePage from './pages/MaintenancePage';
import RegisterCompany from './pages/RegisterCompany';

// Dummy PostJobPage placeholder for now
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
      <Header
        onPostJobClick={() => setShowPostJobModal(true)}
      />
      <Routes>
        <Route path="/" element={<LandingPage onPostJobClick={() => setShowPostJobModal(true)} />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/register-company" element={<RegisterCompany />} />
        <Route path="/post-job" element={<PostJobPage />} />
      </Routes>

      {showPostJobModal && (
        <PostJobModal onClose={() => setShowPostJobModal(false)} />
      )}
    </Router>
  );
}
