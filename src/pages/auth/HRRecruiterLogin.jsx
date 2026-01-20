import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthShell from './AuthShell';

export default function HRRecruiterLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (
      email === 'hrrecruiter@gmail.com' &&
      password === 'Recruiter@123'
    ) {
      const user = {
        id: 'hr-recruiter-1',
        name: 'HR Recruiter',
        email,
        role: 'hr_recruiter',
        userType: 'hr_recruiter',
        loggedInAt: new Date().toISOString(),
      };

      localStorage.setItem('currentUser', JSON.stringify(user));
      window.dispatchEvent(new Event('authChanged'));
      navigate('/hr-recruiter-dashboard');
      return;
    }

    setError('Recruiter access denied.');
  };

  return (
    <AuthShell
      title="Recruiter Hub"
      subtitle="Source, screen & close top talent"
    >
      <form onSubmit={handleLogin} className="auth-form">
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            placeholder="recruiter@company.com"
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
          Enter Recruiter Hub
        </button>
      </form>
    </AuthShell>
  );
}
