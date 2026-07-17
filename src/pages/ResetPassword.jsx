// src/pages/ResetPassword.jsx
// Two modes on one page:
//  - no ?token=  -> "Forgot password": enter email, we send a reset link
//  - ?token=xyz  -> "Set new password": choose a new password
import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { API_URL } from '../data/apiStore';

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0a66c2 0%, #084d92 100%)',
    fontFamily: 'Arial, sans-serif',
    padding: 16,
  },
  card: {
    background: '#fff',
    borderRadius: 14,
    padding: '36px 32px',
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
  },
  logo: { fontSize: 24, fontWeight: 800, color: '#0a66c2', marginBottom: 6 },
  title: { fontSize: 20, fontWeight: 700, color: '#111827', margin: '14px 0 8px' },
  hint: { fontSize: 14, color: '#6b7280', marginBottom: 20, lineHeight: 1.5 },
  input: {
    width: '100%',
    padding: '12px 14px',
    marginBottom: 14,
    borderRadius: 8,
    border: '1px solid #d1d5db',
    fontSize: 15,
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: 13,
    background: '#0a66c2',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
  },
  error: { color: '#dc2626', fontSize: 14, marginBottom: 12 },
  success: { color: '#198754', fontSize: 15, lineHeight: 1.6, marginBottom: 16 },
  back: { display: 'inline-block', marginTop: 18, color: '#0a66c2', fontSize: 14, textDecoration: 'none', fontWeight: 600 },
};

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const requestReset = async () => {
    setError('');
    if (!email.trim()) return setError('Please enter your email.');
    if (!API_URL) return setError('Service unavailable. Please try again later.');
    setBusy(true);
    try {
      const res = await fetch(`${API_URL}/api/password-reset/request/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) throw new Error();
      setDone(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const confirmReset = async () => {
    setError('');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (password !== confirm) return setError('Passwords do not match.');
    if (!API_URL) return setError('Service unavailable. Please try again later.');
    setBusy(true);
    try {
      const res = await fetch(`${API_URL}/api/password-reset/confirm/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }
      setDone(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>MMTI Jobs</div>

        {token ? (
          done ? (
            <>
              <h1 style={styles.title}>Password updated ✅</h1>
              <p style={styles.success}>
                Your new password is set. You can now log in with it on any device.
              </p>
              <Link to="/" style={{ ...styles.button, display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                Go to MMTI Jobs
              </Link>
            </>
          ) : (
            <>
              <h1 style={styles.title}>Set a new password</h1>
              <p style={styles.hint}>Choose a strong password (at least 8 characters).</p>
              <input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                style={styles.input}
              />
              {error && <p style={styles.error}>{error}</p>}
              <button onClick={confirmReset} disabled={busy} style={styles.button}>
                {busy ? 'Saving…' : 'Save New Password'}
              </button>
            </>
          )
        ) : done ? (
          <>
            <h1 style={styles.title}>Check your inbox 📬</h1>
            <p style={styles.success}>
              If an account exists for <strong>{email}</strong>, we've sent a password
              reset link. It's valid for 1 hour — check spam too.
            </p>
            <Link to="/" style={styles.back}>← Back to MMTI Jobs</Link>
          </>
        ) : (
          <>
            <h1 style={styles.title}>Forgot your password?</h1>
            <p style={styles.hint}>
              Enter the email of your account and we'll send you a link to set a new password.
            </p>
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
            {error && <p style={styles.error}>{error}</p>}
            <button onClick={requestReset} disabled={busy} style={styles.button}>
              {busy ? 'Sending…' : 'Send Reset Link'}
            </button>
            <Link to="/" style={styles.back}>← Back to MMTI Jobs</Link>
          </>
        )}
      </div>
    </div>
  );
}
