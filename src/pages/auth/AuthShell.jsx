export default function AuthShell({ title, subtitle, children }) {
    return (
      <div className="auth-root">
        <div className="auth-card">
          <div className="auth-top">
            <div className="auth-logo">MMTI</div>
            <div className="auth-head">
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>
          </div>
  
          <div className="auth-content">
            {children}
          </div>
  
          <div className="auth-footer">
            Internal access only · All actions are logged
          </div>
        </div>
  
        <style jsx>{`
          /* ===== Background ===== */
          .auth-root {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background:
              radial-gradient(900px 420px at top, rgba(10,102,194,0.22), transparent),
              linear-gradient(180deg, #020617, #000);
            font-family: system-ui, -apple-system, BlinkMacSystemFont;
            color: #e5e7eb;
          }
  
          /* ===== Card ===== */
          .auth-card {
            width: 100%;
            max-width: 480px;
            background: rgba(10, 15, 30, 0.94);
            border-radius: 22px;
            padding: 42px 40px 34px;
            box-shadow:
              0 60px 140px rgba(0,0,0,0.85),
              inset 0 0 0 1px rgba(255,255,255,0.06);
            backdrop-filter: blur(20px);
          }
  
          /* ===== Top Header ===== */
          .auth-top {
            display: flex;
            gap: 16px;
            align-items: center;
            margin-bottom: 30px;
          }
  
          .auth-logo {
            width: 50px;
            height: 50px;
            border-radius: 14px;
            background: linear-gradient(135deg, #0a66c2, #004182);
            display: grid;
            place-items: center;
            font-weight: 900;
            letter-spacing: 0.6px;
            box-shadow: 0 16px 40px rgba(10,102,194,0.45);
          }
  
          .auth-head h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 900;
            letter-spacing: 0.3px;
          }
  
          .auth-head p {
            margin: 4px 0 0;
            font-size: 13px;
            color: #9ca3af;
          }
  
          /* ===== Content ===== */
          .auth-content {
            display: flex;
            flex-direction: column;
            gap: 18px;
          }
  
          /* ===== Form styling (shared) ===== */
          .field {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
  
          .field label {
            font-size: 12px;
            font-weight: 700;
            color: #9ca3af;
          }
  
          .field input {
            background: #020617;
            border: 1px solid #1f2937;
            color: #e5e7eb;
            padding: 12px 14px;
            border-radius: 10px;
            font-size: 14px;
            outline: none;
          }
  
          .field input:focus {
            border-color: #0a66c2;
            box-shadow: 0 0 0 3px rgba(10,102,194,0.25);
          }
  
          .primary-btn {
            margin-top: 8px;
            padding: 14px;
            border-radius: 14px;
            background: linear-gradient(135deg, #0a66c2, #004182);
            color: #fff;
            font-weight: 800;
            font-size: 14px;
            border: none;
            cursor: pointer;
            transition: transform .08s ease, box-shadow .2s ease;
          }
  
          .primary-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 18px 44px rgba(10,102,194,0.45);
          }
  
          .error {
            background: rgba(239,68,68,0.16);
            border: 1px solid rgba(239,68,68,0.35);
            color: #fecaca;
            padding: 10px 12px;
            border-radius: 10px;
            font-size: 13px;
          }
  
          /* ===== Footer ===== */
          .auth-footer {
            margin-top: 26px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
          }
  
          @media (max-width: 480px) {
            .auth-card {
              margin: 0 14px;
              padding: 36px 26px 30px;
            }
          }
            /* Password field */
            .password-field {
            margin-bottom: 14px;
            }

            .password-input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
            }

            .password-input-wrapper input {
            width: 100%;
            padding-right: 46px; /* space for icon */
            }

            /* Eye button */
            .password-toggle {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            padding: 4px;
            cursor: pointer;
            color: #6b7280;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            transition: background 0.15s ease, color 0.15s ease;
            }

            .password-toggle:hover {
            background: rgba(10, 102, 194, 0.08);
            color: #0a66c2;
            }

            .password-toggle:active {
            transform: translateY(-50%) scale(0.96);
            }

        `}</style>
      </div>
    );
  }
  