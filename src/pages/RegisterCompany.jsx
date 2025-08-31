// src/pages/RegisterCompany.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function RegisterCompany() {
  const navigate = useNavigate();
  const location = useLocation();

  // form state
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");

  // flow state
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showInlineLogin, setShowInlineLogin] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");

  // current user + whether they own the saved company
  const [currentUser, setCurrentUser] = useState(null);
  const [registered, setRegistered] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // read current user first
  useEffect(() => {
    setCurrentUser(JSON.parse(localStorage.getItem("currentUser")));
  }, []);

  // when user changes, decide if we should show "registered" state
  useEffect(() => {
    const savedCompany = JSON.parse(localStorage.getItem("registeredCompany"));

    // If query param asks for a fresh flow (e.g., from landing/header),
    // ignore any saved company and show a blank form.
    const params = new URLSearchParams(location.search);
    const forceFresh = params.get("fresh") === "1" || params.get("from") === "postjob" || params.get("from") === "signup" || params.get("from") === "landing";

    if (!savedCompany || forceFresh || !currentUser) {
      // Fresh form — no prefill, no registered state
      setCompanyName("");
      setCompanyEmail("");
      setContact("");
      setRegistered(false);
      setIsOwner(false);
      return;
    }

    // We have a logged-in user + saved company: only show registered UI if THIS user owns it
    const owns =
      currentUser?.userType === "recruiter" &&
      currentUser?.email?.toLowerCase() === savedCompany.email?.toLowerCase();

    setCompanyName(savedCompany.name || "");
    setCompanyEmail(savedCompany.email || "");
    setContact(savedCompany.contact || "");
    setRegistered(owns);
    setIsOwner(owns);
  }, [currentUser, location.search]);

  // --- Validation (strong rules) ---
  const validate = () => {
    const e = {};
    const name = companyName.trim();
    const email = companyEmail.trim();
    const phone = contact.trim();

    // --- Company Name ---
    if (!name) {
      e.companyName = "Company Name is required";
    } else {
      if (name.length < 3) {
        e.companyName = "Company Name must be at least 3 characters";
      } else if (/^\d+$/.test(name)) {
        e.companyName = "Company Name cannot be only numbers";
      } else if (/^[a-z]$/i.test(name)) {
        e.companyName = "Company Name cannot be a single letter";
      }
    }

    // --- Company Email ---
    if (!email) {
      e.companyEmail = "Company Email is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      e.companyEmail = "Invalid email address";
    }

    // --- Contact Number ---
    if (!phone) {
      e.contact = "Contact number is required";
    } else if (!/^\d{10}$/.test(phone)) {
      e.contact = "Contact number must be 10 digits";
    } else {
      // prevent duplicate contact across companies
      const existing = JSON.parse(localStorage.getItem("users")) || [];
      const duplicate = existing.find(
        (u) =>
          u.userType === "recruiter" &&
          u.contact === phone &&
          u.email.toLowerCase() !== email.toLowerCase()
      );
      if (duplicate) {
        e.contact = "This contact number is already registered with another company";
      }
    }

    // --- Password (Strong rules) ---
    if (!password.trim()) {
      e.password = "Password is required";
    } else if (password.length < 8) {
      e.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(password)) {
      e.password = "Password must contain at least one uppercase letter";
    } else if (!/[a-z]/.test(password)) {
      e.password = "Password must contain at least one lowercase letter";
    } else if (!/[0-9]/.test(password)) {
      e.password = "Password must contain at least one number";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      e.password = "Password must contain at least one special character";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };


  const upsertRecruiterUser = (companyData) => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const idx = users.findIndex(u => u.email?.toLowerCase() === companyData.email.toLowerCase());
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
    if (idx >= 0) users[idx] = recruiterUser; else users.push(recruiterUser);
    localStorage.setItem("users", JSON.stringify(users));
    return recruiterUser;
  };

  const registerCompany = () => {
    if (!validate()) return;

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const emailLower = companyEmail.trim().toLowerCase();

  // 🚫 Prevent duplicate email across applicants & recruiters
  if (users.some(u => u.email?.toLowerCase() === emailLower)) {
    setErrors({ companyEmail: "This email is already registered with another account" });
    return;
  }

    const companyData = {
      name: companyName.trim(),
      email: companyEmail.trim(),
      contact: contact.trim(),
      password,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("registeredCompany", JSON.stringify(companyData));
    upsertRecruiterUser(companyData);

    // lock success modal until a choice is made
    setShowSuccess(true);
    setShowInlineLogin(false);
    setLoginData({ email: companyData.email, password: "" });
    setLoginError("");
  };

  const handleInlineLogin = (e) => {
    e.preventDefault();
    setLoginError("");
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(
      u =>
        u.email?.toLowerCase() === loginData.email.trim().toLowerCase() &&
        u.password === loginData.password
    );
    if (!user) {
      setLoginError("Invalid email or password.");
      return;
    }
    localStorage.setItem("currentUser", JSON.stringify(user));
    try { window.dispatchEvent(new Event("authChanged")); } catch {}
    navigate("/company-dashboard");
  };

  // --- UI (clean white/blue) ---
  const BLUE = "#0a66c2", BG = "#f3f6fb";
  const btnPrimary = { padding: "10px 16px", background: BLUE, color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, cursor: "pointer" };
  const btnOutline = { padding: "10px 16px", background: "#fff", color: BLUE, border: `1.5px solid ${BLUE}`, borderRadius: 10, fontWeight: 800, cursor: "pointer" };
  const label = { display: "block", fontWeight: 700, marginBottom: 6, color: "#1f2937", fontSize: 13 };
  const inp = (err) => ({ width: "100%", padding: 12, borderRadius: 10, border: err ? "1.5px solid #e11d48" : "1px solid #e6eef5", outline: "none", fontSize: 14 });

  return (
    <div style={{ fontFamily: "'Inter','Arial',sans-serif", background: `linear-gradient(180deg, #f7faff 0%, ${BG} 100%)`, minHeight: "100dvh", padding: "48px 16px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto 18px", textAlign: "center" }}>
        <div style={{ display: "inline-block", padding: "6px 10px", borderRadius: 999, background: "rgba(10,102,194,0.1)", color: BLUE, fontWeight: 700, fontSize: 12, marginBottom: 8 }}>Recruiter</div>
        <h1 style={{ margin: 0, color: BLUE, fontSize: 28, fontWeight: 800 }}>Register Your Company</h1>
        <p style={{ margin: "8px 0 0", color: "#6b7280", fontSize: 14 }}>Create your recruiter account to start posting jobs.</p>
      </div>

      <div style={{ maxWidth: 880, margin: "18px auto 0", background: "#fff", borderRadius: 16, boxShadow: "0 16px 40px rgba(10,102,194,0.08)", border: "1px solid #e6eef9", padding: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={label}>Company Name</label>
            <input value={companyName} onChange={e=>setCompanyName(e.target.value)} style={inp(errors.companyName)} placeholder="Acme Labs Pvt. Ltd." disabled={registered && isOwner} />
            {errors.companyName && <div style={{ color: "#e11d48", fontSize: 12, marginTop: 6 }}>{errors.companyName}</div>}
          </div>
          <div>
            <label style={label}>Company Email</label>
            <input type="email" value={companyEmail} onChange={e=>setCompanyEmail(e.target.value)} style={inp(errors.companyEmail)} placeholder="hr@acme.com" disabled={registered && isOwner} />
            {errors.companyEmail && <div style={{ color: "#e11d48", fontSize: 12, marginTop: 6 }}>{errors.companyEmail}</div>}
          </div>
          <div>
            <label style={label}>Contact Number</label>
            <input value={contact} onChange={e=>setContact(e.target.value)} style={inp(errors.contact)} placeholder="9876543210" disabled={registered && isOwner} />
            {errors.contact && <div style={{ color: "#e11d48", fontSize: 12, marginTop: 6 }}>{errors.contact}</div>}
          </div>
          <div>
            <label style={label}>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={inp(errors.password)} placeholder="Create a strong password" disabled={registered && isOwner} />
            {errors.password && <div style={{ color: "#e11d48", fontSize: 12, marginTop: 6 }}>{errors.password}</div>}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
          {/* show Register when not the owner (either logged out or different user) */}
          {!isOwner ? (
            <button onClick={registerCompany} style={btnPrimary}>Register</button>
          ) : (
            <>
              <button onClick={() => navigate("/post-job")} style={btnOutline}>Post a Job</button>
              <button onClick={() => navigate("/company-dashboard")} style={btnPrimary}>Go to Profile</button>
            </>
          )}
        </div>
      </div>

      {/* Success Modal (locked until a choice is made) */}
      {showSuccess && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(2,10,25,0.45)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", padding: 16, zIndex: 1000 }}>
          <div style={{ width: "100%", maxWidth: 520, background: "#fff", borderRadius: 18, border: "1px solid #e6eef9", boxShadow: "0 24px 60px rgba(10,102,194,0.18)", overflow: "hidden" }}>
            <div style={{ padding: "22px 20px 10px", textAlign: "center", background: "linear-gradient(180deg, rgba(10,102,194,0.06), rgba(10,102,194,0.02))" }}>
              <div style={{ position: "relative", width: 64, height: 64, margin: "6px auto 8px" }}>
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "conic-gradient(from 90deg, rgba(10,102,194,0.25), rgba(10,102,194,0.55))", filter: "blur(1px)" }} />
                <div style={{ position: "relative", width: 64, height: 64, borderRadius: "50%", background: BLUE, color: "#fff", display: "grid", placeItems: "center", fontSize: 28, fontWeight: 900, boxShadow: "0 10px 24px rgba(10,102,194,0.35)" }}>✓</div>
              </div>
              <h3 style={{ margin: "6px 0 0", color: "#0b1f36", fontWeight: 900 }}>Registration successful</h3>
              <p style={{ margin: "6px 0 10px", color: "#6b7280", fontSize: 14 }}>Nice! Choose how you want to continue.</p>
            </div>

            {!showInlineLogin ? (
              <div style={{ padding: 16, display: "grid", gap: 10 }}>
                <button onClick={() => navigate("/company-dashboard")} style={{ padding: "12px 16px", background: BLUE, color: "#fff", border: "none", borderRadius: 12, fontWeight: 900, cursor: "pointer" }}>Go to Profile</button>
                <button onClick={() => navigate("/post-job")} style={{ padding: "12px 16px", background: "#ffffff", color: BLUE, border: `1.5px solid ${BLUE}`, borderRadius: 12, fontWeight: 900, cursor: "pointer" }}>Post a Job</button>
                <button onClick={() => setShowInlineLogin(true)} style={{ padding: "12px 16px", background: "transparent", color: "#004182", border: "none", borderRadius: 12, fontWeight: 900, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>Login</button>
              </div>
            ) : (
              <form onSubmit={handleInlineLogin} style={{ padding: 16 }}>
                <div style={{ marginBottom: 10 }}>
                  <label style={label}>Email</label>
                  <input type="email" value={loginData.email} onChange={e=>setLoginData({ ...loginData, email: e.target.value })} required placeholder="you@company.com" style={inp()} />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label style={label}>Password</label>
                  <input type="password" value={loginData.password} onChange={e=>setLoginData({ ...loginData, password: e.target.value })} required placeholder="••••••••" style={inp()} />
                </div>
                {loginError && <div style={{ background: "#fef2f2", color: "#991b1b", border: "1px solid #fee2e2", borderRadius: 10, padding: "10px 12px", fontSize: 14, marginBottom: 10 }}>{loginError}</div>}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button type="submit" style={btnPrimary}>Login</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
