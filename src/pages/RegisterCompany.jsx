// src/pages/RegisterCompany.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function RegisterCompany() {
  const navigate = useNavigate();
  const location = useLocation();

  // =========================
  // FORM STATE
  // =========================
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState(null);

  // =========================
  // FLOW STATE
  // =========================
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showInlineLogin, setShowInlineLogin] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");

  // current user + ownership
  const [currentUser, setCurrentUser] = useState(null);
  const [registered, setRegistered] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // =========================
  // PROFILE PIC
  // =========================
  const handlePicUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfilePic(reader.result);
    reader.readAsDataURL(file);
  };

  // =========================
  // LOAD CURRENT USER
  // =========================
  useEffect(() => {
    setCurrentUser(JSON.parse(localStorage.getItem("currentUser")));
  }, []);

  // =========================
  // PREFILL + OWNERSHIP LOGIC
  // =========================
  useEffect(() => {
    const savedCompany = JSON.parse(localStorage.getItem("registeredCompany"));
    const params = new URLSearchParams(location.search);

    const forceFresh =
      params.get("fresh") === "1" ||
      params.get("from") === "postjob" ||
      params.get("from") === "signup" ||
      params.get("from") === "landing";

    if (!savedCompany || forceFresh || !currentUser) {
      setCompanyName("");
      setCompanyEmail("");
      setContact("");
      setRegistered(false);
      setIsOwner(false);
      return;
    }

    const owns =
      currentUser?.userType === "recruiter" &&
      currentUser?.email?.toLowerCase() === savedCompany.email?.toLowerCase();

    setCompanyName(savedCompany.name || "");
    setCompanyEmail(savedCompany.email || "");
    setContact(savedCompany.contact || "");
    setRegistered(owns);
    setIsOwner(owns);
  }, [currentUser, location.search]);

  // =========================
  // VALIDATION
  // =========================
  const validate = () => {
    const e = {};
    const name = companyName.trim();
    const email = companyEmail.trim();
    const phone = contact.trim();

    if (!name) e.companyName = "Company Name is required";
    else if (name.length < 3) e.companyName = "At least 3 characters required";
    else if (/^\d+$/.test(name)) e.companyName = "Cannot be only numbers";

    if (!email) e.companyEmail = "Company Email is required";
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email))
      e.companyEmail = "Invalid email address";

    if (!phone) e.contact = "Contact number is required";
    else if (!/^\d{10}$/.test(phone))
      e.contact = "Must be exactly 10 digits";

    if (!password.trim()) e.password = "Password is required";
    else if (password.length < 8)
      e.password = "Minimum 8 characters required";
    else if (!/[A-Z]/.test(password))
      e.password = "Include at least one uppercase letter";
    else if (!/[a-z]/.test(password))
      e.password = "Include at least one lowercase letter";
    else if (!/[0-9]/.test(password))
      e.password = "Include at least one number";
    else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
      e.password = "Include at least one special character";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // =========================
  // USER UPSERT
  // =========================
  const upsertRecruiterUser = (companyData) => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const idx = users.findIndex(
      (u) => u.email?.toLowerCase() === companyData.email.toLowerCase()
    );

    const recruiterUser = {
      id: idx >= 0 ? users[idx].id : Date.now(),
      userType: "recruiter",
      email: companyData.email,
      password: companyData.password,
      name: companyData.name,
      company: companyData.name,
      contact: companyData.contact,
      createdAt: new Date().toISOString(),
    };

    if (idx >= 0) users[idx] = recruiterUser;
    else users.push(recruiterUser);

    localStorage.setItem("users", JSON.stringify(users));
    return recruiterUser;
  };

  // =========================
  // REGISTER
  // =========================
  const registerCompany = () => {
    if (!validate()) return;

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const emailLower = companyEmail.trim().toLowerCase();

    if (users.some((u) => u.email?.toLowerCase() === emailLower)) {
      setErrors({
        companyEmail: "This email is already registered",
      });
      return;
    }

    const companyData = {
      name: companyName.trim(),
      email: companyEmail.trim(),
      contact: contact.trim(),
      password,
      profilePic,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("registeredCompany", JSON.stringify(companyData));
    upsertRecruiterUser(companyData);

    setShowSuccess(true);
    setShowInlineLogin(false);
    setLoginData({ email: companyData.email, password: "" });
    setLoginError("");
  };

  // =========================
  // INLINE LOGIN
  // =========================
  const handleInlineLogin = (e) => {
    e.preventDefault();
    setLoginError("");

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(
      (u) =>
        u.email?.toLowerCase() === loginData.email.toLowerCase() &&
        u.password === loginData.password
    );

    if (!user) {
      setLoginError("Invalid email or password");
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify(user));
    window.dispatchEvent(new Event("authChanged"));
    navigate("/company-dashboard");
  };

  // =========================
  // STYLES
  // =========================
  const BLUE = "#0a66c2";
  const BG = "#f3f6fb";

  const label = {
    display: "block",
    fontWeight: 700,
    marginBottom: 6,
    fontSize: 13,
    color: "#1f2937",
  };

  const inp = (err) => ({
    width: "100%",
    padding: "14px 12px",
    borderRadius: 12,
    border: err ? "1.5px solid #f43f5e" : "1px solid #e6eef5",
    background: err ? "#fff5f7" : "#fff",
    fontSize: 14,
    outline: "none",
transition: "border .2s ease, box-shadow .2s ease",
boxShadow: err ? "0 0 0 3px rgba(244,63,94,.15)" : "none",

  });

  const btnPrimary = {
    padding: "14px 22px",
    background: "linear-gradient(135deg, #0a66c2, #004182)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(10,102,194,0.35)",
  };

  const btnOutline = {
    padding: "12px 20px",
    background: "#fff",
    color: BLUE,
    border: `1.5px solid ${BLUE}`,
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
  };

  // =========================
  // UI
  // =========================
  return (
    <div
      style={{
        fontFamily: "'Inter','Arial',sans-serif",
        background: `linear-gradient(180deg, #f7faff 0%, ${BG} 100%)`,
        minHeight: "100dvh",
        padding: "48px 16px",
      }}
    >
      <div
  className="register-header"
  style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}
>

        <div
          style={{
            display: "inline-block",
            padding: "6px 12px",
            borderRadius: 999,
            background: "rgba(10,102,194,0.1)",
            color: BLUE,
            fontWeight: 700,
            fontSize: 12,
            marginBottom: 8,
          }}
        >
          Recruiter Registration
        </div>
        <h1 style={{ color: BLUE, fontSize: 30, fontWeight: 900 }}>
          Register Your Company
        </h1>
        <p style={{ color: "#6b7280", fontSize: 14 }}>
          Create a recruiter account and start hiring smarter.
        </p>
      </div>

      {/* CARD */}
      <div
        style={{
          maxWidth: 900,
          margin: "24px auto",
          background: "#fff",
          borderRadius: 18,
          padding: 28,
          border: "1px solid #e6eef9",
          boxShadow: "0 20px 45px rgba(10,102,194,0.1)",
          animation: "cardIn .35s ease",
        }}
      >
        {/* PROFILE PIC UPLOAD */}
        <div
  style={{
    textAlign: "center",
    marginBottom: 32,
    background: "linear-gradient(180deg, #f7faff, #eef4ff)",
    border: "1px solid #dbe5f5",
    borderRadius: 16,
    padding: "24px 16px",
  }}
>
        <div
          style={{
            position: "relative",
            width: 120,
            height: 120,
            minWidth: 120,
            minHeight: 120,
            margin: "0 auto",
            borderRadius: "50%",
            overflow: "hidden",
            background: "#ffffff",
            flexShrink: 0,
            transition: "transform .2s ease",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.04)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "none")
          }
        >
          <img
            src={
              profilePic ||
              "https://via.placeholder.com/120x120.png?text=Logo"
            }
            alt="logo"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "50%",
              display: "block",
            }}
          />

          {/* UPLOAD ICON */}
          <label
            htmlFor="file"
            style={{
              position: "absolute",
              bottom: 6,
              right: 6,
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: BLUE,
              color: "#fff",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              fontWeight: 900,
              boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            }}
          >
            +
          </label>

          <input
            id="file"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handlePicUpload}
          />
        </div>

        <p style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
          Upload company logo (optional)
        </p>
      </div>

      <div
  style={{
    maxWidth: 720,
    margin: "0 auto 20px",
    textAlign: "left",
  }}
>
  <h3
    style={{
      margin: 0,
      fontSize: 18,
      fontWeight: 800,
      color: "#0b1f36",
    }}
  >
    Company Details
  </h3>
  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>
    These details will be visible to job seekers.
  </p>
</div>

        {/* FORM */}
<div
  style={{
    maxWidth: 720,              // 👈 DESKTOP CONTROL
    margin: "0 auto",           // 👈 CENTER FORM
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 16,
  }}
>
          <div>
            <label style={label}>Company Name</label>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              style={inp(errors.companyName)}
              disabled={registered && isOwner}
            />
            {errors.companyName && (
              <small style={{ color: "#e11d48", marginTop: 6, display: "block" }}>

                {errors.companyName}
              </small>
            )}
          </div>

          <div>
            <label style={label}>Company Email</label>
            <input
              value={companyEmail}
              onChange={(e) => setCompanyEmail(e.target.value)}
              style={inp(errors.companyEmail)}
              disabled={registered && isOwner}
            />
            {errors.companyEmail && (
             <small style={{ color: "#e11d48", marginTop: 6, display: "block" }}>

                {errors.companyEmail}
              </small>
            )}
          </div>

          <div>
            <label style={label}>Contact Number</label>
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              style={inp(errors.contact)}
              disabled={registered && isOwner}
            />
            {errors.contact && (
             <small style={{ color: "#e11d48", marginTop: 6, display: "block" }}>
{errors.contact}</small>
            )}
          </div>

          <div>
            <label style={label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inp(errors.password)}
              disabled={registered && isOwner}
            />
            {errors.password && (
             <small style={{ color: "#e11d48", marginTop: 6, display: "block" }}>

                {errors.password}
              </small>
            )}
          </div>
        </div>

        {/* ACTIONS */}
        <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
              marginTop: 24,
              flexWrap: "wrap", 
              maxHeight: "90dvh",
              overflowY: "auto",       // 👈 mobile safe
            }}
          >

          {!isOwner ? (
            <button
            onClick={registerCompany}
            style={btnPrimary}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-2px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "none")
            }
          >
          
              Register Company
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/post-job")}
                style={btnOutline}
              >
                Post a Job
              </button>
              <button
                onClick={() => navigate("/company-dashboard")}
                style={btnPrimary}
              >
                Go to Profile
              </button>
            </>
          )}
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(2,10,25,0.45)",
            display: "grid",
            placeItems: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 520,
              background: "#fff",
              borderRadius: 18,
              padding: 24,
              textAlign: "center",
              animation: "modalPop .25s ease",
              maxHeight: "90dvh",
              overflowY: "auto",
              border: "1.5px solid #dbe5f5",
              boxShadow: "0 24px 60px rgba(10,102,194,0.18)",
              border: "1.5px solid #cfd9ea",
            }}
            
            >
            <div
              style={{
                width: 64,
                height: 64,
                margin: "0 auto 12px",
                borderRadius: "50%",
                background: BLUE,
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontSize: 32,
                fontWeight: 900,
              }}
            >
              ✓
            </div>
            <h3 style={{ fontWeight: 900 }}>
              Registration Successful
            </h3>
            <p style={{ color: "#6b7280", fontSize: 14 }}>
              Your company is live. What would you like to do next?
            </p>

            <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
              <button
                onClick={() => navigate("/company-dashboard")}
                style={btnPrimary}
              >
                Go to Profile
              </button>
              <button
                onClick={() => navigate("/post-job")}
                style={btnOutline}
              >
                Post a Job
              </button>
              <button
                onClick={() => setShowInlineLogin(true)}
                style={{
                  background: "none",
                  border: "none",
                  color: BLUE,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Login instead
              </button>
            </div>

            {showInlineLogin && (
              <form onSubmit={handleInlineLogin} style={{ marginTop: 16 }}>
                <input
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                  placeholder="Email"
                  style={{ ...inp(), marginBottom: 10 }}
                />
                <input
                  type="password"
                  autoFocus
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                  placeholder="Password"
                  style={inp()}
                />
                {loginError && (
                  <p style={{ color: "#e11d48", marginTop: 8 }}>
                    {loginError}
                  </p>
                )}
                <button
                  type="submit"
                  style={{ ...btnPrimary, marginTop: 12 }}
                >
                  Login
                </button>
              </form>
            )}
          </div>
        </div>
      )}
      <style>
{`
@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes modalPop {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
/* =====================================================
   PRODUCTION FORM UI – DESKTOP + MOBILE
   ===================================================== */

/* ---------- GLOBAL TONE ---------- */
body {
  background-color: #f2f6fc;
}

/* ---------- CARD DEPTH ---------- */
div[style*="box-shadow: 0 20px 45px"] {
  background: linear-gradient(
    180deg,
    #ffffff 0%,
    #f5f9ff 100%
  );
  border: 1px solid #dbe5f5 !important;
}

/* ---------- FORM SURFACE ---------- */
div[style*="grid-template-columns"] {
  background: linear-gradient(
    180deg,
    #f9fbff,
    #f1f6ff
  );
  padding: 22px;
  border-radius: 16px;
  border: 1px solid #d7e2f2;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
}

/* Slightly tighter on mobile */
@media (max-width: 767px) {
  div[style*="grid-template-columns"] {
    padding: 16px;
    border-radius: 14px;
  }
}

/* ---------- INPUT FIELDS ---------- */
input {
  border: 1.6px solid #bfcfe6 !important;
  background: linear-gradient(
    180deg,
    #ffffff 0%,
    #f7faff 100%
  );
  font-weight: 500;
  transition: border .2s ease, box-shadow .2s ease;
}

/* Hover (desktop only) */
@media (hover: hover) {
  input:hover {
    border-color: #9fb6dd !important;
  }
}

/* Focus (both desktop + mobile) */
input:focus {
  border-color: #0a66c2 !important;
  box-shadow: 0 0 0 4px rgba(10,102,194,0.2) !important;
  background: #ffffff !important;
}

/* Disabled inputs */
input:disabled {
  background: linear-gradient(
    180deg,
    #eef3fa,
    #e8eef8
  ) !important;
  color: #6b7280 !important;
}

/* ---------- LABELS ---------- */
label {
  color: #0b1f36 !important;
  font-size: 13.5px;
  letter-spacing: 0.25px;
}

/* Slightly larger labels on mobile for readability */
@media (max-width: 767px) {
  label {
    font-size: 14px;
  }
}

/* ---------- ERROR TEXT ---------- */
small {
  font-size: 12.5px;
  font-weight: 600;
}

/* ---------- PROFILE IMAGE AREA ---------- */
div[style*="border-radius: \"50%\""] {
  background: radial-gradient(
    circle at top,
    #ffffff,
    #edf3ff
  );
}

/* ---------- BUTTONS ---------- */
button {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

/* Desktop hover lift */
@media (hover: hover) {
  button:hover {
    transform: translateY(-1px);
    box-shadow: 0 14px 34px rgba(10,102,194,0.35);
  }
}

/* Touch-friendly buttons on mobile */
@media (max-width: 767px) {
  button {
    width: 100%;
    justify-content: center;
  }
}

/* Primary CTA */
button[style*="linear-gradient(135deg, #0a66c2"] {
  background: linear-gradient(
    135deg,
    #0a66c2,
    #004182
  ) !important;
}

/* Outline button */
button[style*="background: #fff"] {
  background: linear-gradient(
    180deg,
    #ffffff,
    #f4f8ff
  ) !important;
  border-color: #a9bfe3 !important;
}

/* ---------- ACTION BAR ---------- */
div[style*="justifyContent: \"flex-end\""] {
  padding-top: 18px;
  border-top: 1px solid #e1e9f6;
}

/* Stack actions cleanly on mobile */
@media (max-width: 767px) {
  div[style*="justifyContent: \"flex-end\""] {
    justify-content: stretch;
    gap: 10px;
  }
}

/* ---------- MODAL ---------- */
div[style*="modalPop"] {
  background: linear-gradient(
    180deg,
    #ffffff 0%,
    #f3f7ff 100%
  );
  border: 1px solid #dbe5f5;
}

/* ===============================
   CLEAN HEADER UPGRADE (SAFE)
   =============================== */

.register-header {
  background: linear-gradient(
    180deg,
    #f7faff,
    #eef4ff
  );
  border: 1px solid #dbe5f5;
  border-radius: 16px;
  padding: 24px 20px;
  margin-bottom: 28px;
}

/* Badge */
.register-header > div {
  background: rgba(10,102,194,0.12);
  border: 1px solid rgba(10,102,194,0.25);
  padding: 6px 14px;
}

/* Title */
.register-header h1 {
  margin-top: 12px;
}

/* Subtitle */
.register-header p {
  max-width: 520px;
  margin: 8px auto 0;
  color: #475569;
  line-height: 1.6;
}

/* Mobile tightening */
@media (max-width: 767px) {
  .register-header {
    padding: 18px 14px;
    border-radius: 14px;
  }
}

`}
</style>

    </div>
  );
}

