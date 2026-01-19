import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setError('');

    if (
      email === 'sanidhyakoranne123@gmail.com' &&
      password === 'Mmti@help49'
    ) {
      const adminUser = {
        id: 'admin-1',
        name: 'Administrator',
        email,
        role: 'admin',
        userType: 'admin',
        loggedInAt: new Date().toISOString(),
      };

      localStorage.setItem('currentUser', JSON.stringify(adminUser));
      window.dispatchEvent(new Event('authChanged'));
      navigate('/admin-dashboard');
      return;
    }

    setError('This account does not have access to the Admin Console.');
  };

  return (
    <div className="admin-root">
      <div className="admin-card">
        <div className="admin-badge">ADMIN</div>

        <h1>Admin Console</h1>
        <p className="subtitle">
          Restricted system access. All actions are monitored and logged.
        </p>

        <form onSubmit={handleAdminLogin}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="admin@company.com"
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

          <button type="submit">Enter Admin Console</button>
        </form>

        <p className="footer-text">
          Unauthorized access is prohibited.
        </p>
      </div>

      <style jsx>{`
        /* ===== Page background ===== */
        .admin-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(800px 400px at top, rgba(10,102,194,0.15), transparent),
            linear-gradient(180deg, #020617, #000);
          color: #e5e7eb;
          font-family: system-ui, -apple-system, BlinkMacSystemFont;
        }

        /* ===== Login card ===== */
        .admin-card {
          width: 100%;
          max-width: 440px;
          background: rgba(15, 23, 42, 0.92);
          border-radius: 18px;
          padding: 36px 34px 32px;
          box-shadow:
            0 40px 80px rgba(0,0,0,0.7),
            inset 0 0 0 1px rgba(255,255,255,0.06);
          backdrop-filter: blur(14px);
        }

        /* ===== Badge ===== */
        .admin-badge {
          display: inline-block;
          font-size: 11px;
          letter-spacing: 1.4px;
          font-weight: 800;
          color: #93c5fd;
          background: rgba(10,102,194,0.15);
          border: 1px solid rgba(10,102,194,0.3);
          padding: 6px 10px;
          border-radius: 999px;
          margin-bottom: 14px;
        }

        h1 {
          margin: 0;
          font-size: 26px;
          font-weight: 900;
          letter-spacing: 0.4px;
        }

        .subtitle {
          margin: 8px 0 26px;
          font-size: 14px;
          color: #9ca3af;
          line-height: 1.45;
        }

        /* ===== Form ===== */
        form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        label {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.4px;
          color: #9ca3af;
          text-transform: uppercase;
        }

        input {
          background: #020617;
          border: 1px solid #1f2937;
          color: #e5e7eb;
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 14px;
          outline: none;
          transition: border-color .2s ease, box-shadow .2s ease;
        }

        input::placeholder {
          color: #6b7280;
        }

        input:focus {
          border-color: #0a66c2;
          box-shadow: 0 0 0 3px rgba(10,102,194,0.25);
        }

        /* ===== Button ===== */
        button {
          margin-top: 10px;
          padding: 13px;
          border-radius: 12px;
          background: linear-gradient(135deg, #0a66c2, #004182);
          color: white;
          font-weight: 800;
          font-size: 14px;
          border: none;
          cursor: pointer;
          transition: transform .08s ease, box-shadow .2s ease;
        }

        button:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 30px rgba(10,102,194,0.4);
        }

        button:active {
          transform: translateY(1px);
        }

        /* ===== Error ===== */
        .error {
          background: rgba(239,68,68,0.15);
          border: 1px solid rgba(239,68,68,0.35);
          color: #fecaca;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 13px;
        }

        /* ===== Footer ===== */
        .footer-text {
          margin-top: 22px;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
        }

        @media (max-width: 480px) {
          .admin-card {
            margin: 0 14px;
            padding: 30px 24px;
          }
        }
      `}</style>
    </div>
  );
}
