import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthShell from './AuthShell';

export default function HRRecruiterLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (email === 'hrrecruiter@gmail.com' && password === 'Recruiter@123') {
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
      {/* 🔒 Local CSS only */}
      <style>{`
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
          margin-top: 10px;
        }

        .field label {
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
          display: block;
        }

        .field input,
        .password-input {
          width: 100%;
          height: 44px;
          padding: 0 12px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          font-size: 14px;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .field input:focus,
        .password-input:focus {
          outline: none;
          border-color: #0a66c2;
          box-shadow: 0 0 0 3px rgba(10,102,194,0.12);
        }

        .password-row {
          display: flex;
          gap: 8px;
        }

        .password-cta {
          min-width: 70px;
          height: 44px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .password-cta:hover {
          background: #eef4ff;
          border-color: #0a66c2;
          color: #0a66c2;
        }

        .primary-btn {
          height: 46px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #0a66c2, #004182);
          color: #fff;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(10,102,194,0.35);
        }

        .primary-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 26px rgba(10,102,194,0.45);
        }

        .error {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fecaca;
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 13px;
          font-weight: 600;
        }
      `}</style>

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

        <div>
          <label>Password</label>
          <div className="password-row">
            <input
              className="password-input"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-cta"
              onClick={() => setShowPassword((p) => !p)}
            >
              {showPassword ? 'HIDE' : 'SHOW'}
            </button>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <button className="primary-btn" type="submit">
          Enter Recruiter Hub
        </button>
      </form>
    </AuthShell>
  );
}
