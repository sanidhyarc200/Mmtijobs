import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthShell from './AuthShell';

export default function HRManagerLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (
      email === 'hrmanagermmti@gmail.com' &&
      password === 'HrManager@123'
    ) {
      const user = {
        id: 'hr-manager-1',
        name: 'HR Manager',
        email,
        role: 'hr_manager',
        userType: 'admin',
        loggedInAt: new Date().toISOString(),
      };

      localStorage.setItem('currentUser', JSON.stringify(user));
      window.dispatchEvent(new Event('authChanged'));
      navigate('/admin-dashboard');
      return;
    }

    setError('Access denied. HR Manager credentials required.');
  };

  return (
    <AuthShell
      title="HR Manager Portal"
      subtitle="People, policy & organizational oversight"
    >
      <form onSubmit={handleLogin} className="auth-form">
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            placeholder="hr.manager@company.com"
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
          Enter HR Manager Portal
        </button>
      </form>
    </AuthShell>
  );
}
