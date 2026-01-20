import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthShell from './AuthShell';

export default function HRLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (
      email === 'hrmmti@gmail.com' &&
      password === 'Hr@123'
    ) {
      const user = {
        id: 'hr-1',
        name: 'HR',
        email,
        role: 'hr',
        userType: 'hr',
        loggedInAt: new Date().toISOString(),
      };

      localStorage.setItem('currentUser', JSON.stringify(user));
      window.dispatchEvent(new Event('authChanged'));
      navigate('/hr-dashboard');
      return;
    }

    setError('Invalid HR credentials.');
  };

  return (
    <AuthShell
      title="HR Workspace"
      subtitle="Hiring operations & employee coordination"
    >
      <form onSubmit={handleLogin} className="auth-form">
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            placeholder="hr@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <div className="error">{error}</div>}

        <button className="primary-btn" type="submit">
          Enter HR Workspace
        </button>
      </form>
    </AuthShell>
  );
}
