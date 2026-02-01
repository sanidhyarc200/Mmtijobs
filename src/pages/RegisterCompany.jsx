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
  
  // NEW ADDRESS FIELDS
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  
  // NEW COMPANY DETAILS
  const [gstNumber, setGstNumber] = useState("");
  const [industryType, setIndustryType] = useState("");
  const [numberOfEmployees, setNumberOfEmployees] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");

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
      setStreetAddress("");
      setCity("");
      setState("");
      setPincode("");
      setGstNumber("");
      setIndustryType("");
      setNumberOfEmployees("");
      setCompanyWebsite("");
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
    setStreetAddress(savedCompany.streetAddress || "");
    setCity(savedCompany.city || "");
    setState(savedCompany.state || "");
    setPincode(savedCompany.pincode || "");
    setGstNumber(savedCompany.gstNumber || "");
    setIndustryType(savedCompany.industryType || "");
    setNumberOfEmployees(savedCompany.numberOfEmployees || "");
    setCompanyWebsite(savedCompany.companyWebsite || "");
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

    // Company Name
    if (!name) e.companyName = "Company Name is required";
    else if (name.length < 3) e.companyName = "At least 3 characters required";
    else if (/^\d+$/.test(name)) e.companyName = "Cannot be only numbers";

    // Company Email
    if (!email) e.companyEmail = "Company Email is required";
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email))
      e.companyEmail = "Invalid email address";

    // Contact Number
    if (!phone) e.contact = "Contact number is required";
    else if (!/^\d{10}$/.test(phone))
      e.contact = "Must be exactly 10 digits";

    // Password
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

    // Street Address
    if (!streetAddress.trim()) e.streetAddress = "Street Address is required";

    // City
    if (!city.trim()) e.city = "City is required";
    else if (city.trim().length < 2) e.city = "City name too short";

    // State
    if (!state.trim()) e.state = "State is required";

    // Pincode
    if (!pincode.trim()) e.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(pincode))
      e.pincode = "Must be exactly 6 digits";

    // GST Number (optional but validate format if provided)
    if (gstNumber.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstNumber.trim()))
      e.gstNumber = "Invalid GST format";

    // Industry Type
    if (!industryType) e.industryType = "Industry Type is required";

    // Number of Employees
    if (!numberOfEmployees) e.numberOfEmployees = "Company size is required";

    // Company Website (optional but validate format if provided)
    if (companyWebsite.trim() && !/^https?:\/\/.+\..+/.test(companyWebsite.trim()))
      e.companyWebsite = "Invalid website URL (include http:// or https://)";

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
      streetAddress: companyData.streetAddress,
      city: companyData.city,
      state: companyData.state,
      pincode: companyData.pincode,
      gstNumber: companyData.gstNumber,
      industryType: companyData.industryType,
      numberOfEmployees: companyData.numberOfEmployees,
      companyWebsite: companyData.companyWebsite,
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
      streetAddress: streetAddress.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      gstNumber: gstNumber.trim(),
      industryType,
      numberOfEmployees,
      companyWebsite: companyWebsite.trim(),
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

  // Industry options
  const industries = [
    "Information Technology",
    "Healthcare",
    "Finance & Banking",
    "Education",
    "Manufacturing",
    "Retail",
    "Real Estate",
    "Transportation",
    "Hospitality",
    "Media & Entertainment",
    "Consulting",
    "Other"
  ];

  // Company size options
  const companySizes = [
    "1-10 employees",
    "11-50 employees",
    "51-200 employees",
    "201-500 employees",
    "501-1000 employees",
    "1000+ employees"
  ];

  // =========================
  // RENDER INPUT FIELD
  // =========================
  const InputField = ({ label, value, onChange, error, type = "text", placeholder, disabled, icon }) => (
    <div className="input-group">
      <label className="input-label">
        {icon && <span className="input-icon">{icon}</span>}
        {label}
      </label>
      <div className="input-wrapper">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input-field ${error ? 'input-error' : ''}`}
          disabled={disabled}
        />
        {error && (
          <div className="error-message">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" fill="currentColor" opacity="0.1"/>
              <path d="M7 4v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {error}
          </div>
        )}
      </div>
    </div>
  );

  const SelectField = ({ label, value, onChange, error, options, placeholder, disabled, icon }) => (
    <div className="input-group">
      <label className="input-label">
        {icon && <span className="input-icon">{icon}</span>}
        {label}
      </label>
      <div className="input-wrapper">
        <select
          value={value}
          onChange={onChange}
          className={`input-field ${error ? 'input-error' : ''}`}
          disabled={disabled}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {error && (
          <div className="error-message">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" fill="currentColor" opacity="0.1"/>
              <path d="M7 4v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {error}
          </div>
        )}
      </div>
    </div>
  );

  // =========================
  // UI
  // =========================
  return (
    <div className="register-container">
      {/* HEADER */}
      <div className="register-header">
        <div className="header-badge">Employer Registration</div>
        <h1 className="header-title">Create Your Company Profile</h1>
        <p className="header-subtitle">
          Join our platform and connect with top talent. Complete the form below to get started.
        </p>
      </div>

      {/* MAIN CARD */}
      <div className="register-card">
        {/* PROFILE UPLOAD */}
        <div className="profile-section">
          <div className="profile-upload-wrapper">
            <div className="profile-preview">
              <img
                src={profilePic || "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=300&h=300&fit=crop"}
                alt="Company Logo"
                className="profile-image"
              />
              <label htmlFor="file-upload" className="upload-overlay">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
                <span>Upload Logo</span>
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handlePicUpload}
                style={{ display: 'none' }}
              />
            </div>
            <p className="profile-hint">PNG, JPG up to 5MB</p>
          </div>
        </div>

        {/* FORM SECTIONS */}
        <div className="form-content">
          {/* BASIC DETAILS */}
          <div className="form-section">
            <div className="section-header">
              <div className="section-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <div>
                <h2 className="section-title">Company Information</h2>
                <p className="section-description">Basic details about your organization</p>
              </div>
            </div>

            <div className="form-grid">
              <InputField
                label="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                error={errors.companyName}
                placeholder="Acme Corporation"
                disabled={registered && isOwner}
                icon="🏢"
              />
              <InputField
                label="Company Email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                error={errors.companyEmail}
                type="email"
                placeholder="hello@acme.com"
                disabled={registered && isOwner}
                icon="📧"
              />
              <InputField
                label="Contact Number"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                error={errors.contact}
                type="tel"
                placeholder="9876543210"
                disabled={registered && isOwner}
                icon="📱"
              />
              <InputField
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                type="password"
                placeholder="••••••••"
                disabled={registered && isOwner}
                icon="🔒"
              />
            </div>
          </div>

          {/* ADDRESS */}
          <div className="form-section">
            <div className="section-header">
              <div className="section-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div>
                <h2 className="section-title">Business Address</h2>
                <p className="section-description">Your company's primary location</p>
              </div>
            </div>

            <div className="form-grid">
              <div style={{ gridColumn: '1 / -1' }}>
                <InputField
                  label="Street Address"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  error={errors.streetAddress}
                  placeholder="123 Business Street, Building A"
                  disabled={registered && isOwner}
                  icon="🏛️"
                />
              </div>
              <InputField
                label="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                error={errors.city}
                placeholder="Mumbai"
                disabled={registered && isOwner}
                icon="🌆"
              />
              <InputField
                label="State / Province"
                value={state}
                onChange={(e) => setState(e.target.value)}
                error={errors.state}
                placeholder="Maharashtra"
                disabled={registered && isOwner}
                icon="🗺️"
              />
              <InputField
                label="Postal Code"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                error={errors.pincode}
                placeholder="400001"
                disabled={registered && isOwner}
                icon="📮"
              />
            </div>
          </div>

          {/* COMPANY DETAILS */}
          <div className="form-section">
            <div className="section-header">
              <div className="section-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <div>
                <h2 className="section-title">Organization Details</h2>
                <p className="section-description">Additional information about your company</p>
              </div>
            </div>

            <div className="form-grid">
              <InputField
                label="GST Number (Optional)"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                error={errors.gstNumber}
                placeholder="27AABCU9603R1ZX"
                disabled={registered && isOwner}
                icon="📋"
              />
              <SelectField
                label="Industry Type"
                value={industryType}
                onChange={(e) => setIndustryType(e.target.value)}
                error={errors.industryType}
                options={industries}
                placeholder="Select your industry"
                disabled={registered && isOwner}
                icon="🏭"
              />
              <SelectField
                label="Company Size"
                value={numberOfEmployees}
                onChange={(e) => setNumberOfEmployees(e.target.value)}
                error={errors.numberOfEmployees}
                options={companySizes}
                placeholder="Number of employees"
                disabled={registered && isOwner}
                icon="👥"
              />
              <InputField
                label="Website (Optional)"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                error={errors.companyWebsite}
                type="url"
                placeholder="https://acme.com"
                disabled={registered && isOwner}
                icon="🌐"
              />
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="form-actions">
          {!isOwner ? (
            <button onClick={registerCompany} className="btn-primary">
              <span>Complete Registration</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          ) : (
            <>
              <button onClick={() => navigate("/post-job")} className="btn-secondary">
                Post a Job
              </button>
              <button onClick={() => navigate("/company-dashboard")} className="btn-primary">
                <span>Go to Dashboard</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="success-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="3"/>
                <path d="M14 24l8 8 16-16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="modal-title">Welcome Aboard! 🎉</h3>
            <p className="modal-description">
              Your company profile has been created successfully. Start posting jobs and connecting with talented candidates.
            </p>

            <div className="modal-actions">
              <button onClick={() => navigate("/company-dashboard")} className="btn-primary">
                <span>Go to Dashboard</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
              <button onClick={() => navigate("/post-job")} className="btn-secondary">
                Post Your First Job
              </button>
              <button
                onClick={() => setShowInlineLogin(true)}
                className="btn-text"
              >
                Login to existing account
              </button>
            </div>

            {showInlineLogin && (
              <form onSubmit={handleInlineLogin} className="inline-login">
                <div className="login-divider">
                  <span>Login Instead</span>
                </div>
                <InputField
                  label="Email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  type="email"
                  placeholder="your@email.com"
                />
                <InputField
                  label="Password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  type="password"
                  placeholder="••••••••"
                />
                {loginError && (
                  <div className="error-message" style={{ marginTop: 8 }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" fill="currentColor" opacity="0.1"/>
                      <path d="M7 4v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    {loginError}
                  </div>
                )}
                <button type="submit" className="btn-primary" style={{ marginTop: 16 }}>
                  <span>Login</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* STYLES */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

        :root {
          --primary: #2563eb;
          --primary-dark: #1e40af;
          --primary-light: #3b82f6;
          --success: #10b981;
          --error: #ef4444;
          --gray-50: #f9fafb;
          --gray-100: #f3f4f6;
          --gray-200: #e5e7eb;
          --gray-300: #d1d5db;
          --gray-400: #9ca3af;
          --gray-500: #6b7280;
          --gray-600: #4b5563;
          --gray-700: #374151;
          --gray-800: #1f2937;
          --gray-900: #111827;
          --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .register-container {
          font-family: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #004182 100%);
          padding: 40px 20px;
          position: relative;
        }

        .register-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.15) 0%, transparent 50%);
          pointer-events: none;
        }

        .register-header {
          max-width: 900px;
          margin: 0 auto 32px;
          text-align: center;
          position: relative;
          z-index: 1;
          animation: fadeInDown 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .header-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 100px;
          color: white;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .header-title {
          font-size: clamp(32px, 5vw, 48px);
          font-weight: 800;
          color: white;
          margin-bottom: 12px;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }

        .header-subtitle {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.9);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .register-card {
          max-width: 900px;
          margin: 0 auto;
          background: white;
          border-radius: 24px;
          box-shadow: var(--shadow-2xl);
          overflow: hidden;
          position: relative;
          z-index: 1;
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s backwards;
        }

        .profile-section {
          padding: 48px 32px;
          background: linear-gradient(135deg, var(--gray-50) 0%, white 100%);
          border-bottom: 1px solid var(--gray-200);
        }

        .profile-upload-wrapper {
          max-width: 200px;
          margin: 0 auto;
          text-align: center;
        }

        .profile-preview {
          width: 140px;
          height: 140px;
          margin: 0 auto 16px;
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: var(--shadow-lg);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .profile-preview:hover {
          transform: translateY(-4px) scale(1.02);
        }

        .profile-preview:hover .upload-overlay {
          opacity: 1;
        }

        .profile-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .upload-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: white;
          font-size: 13px;
          font-weight: 600;
          opacity: 0;
          cursor: pointer;
          transition: opacity 0.3s ease;
        }

        .upload-overlay svg {
          width: 28px;
          height: 28px;
        }

        .profile-hint {
          font-size: 13px;
          color: var(--gray-500);
          font-weight: 500;
        }

        .form-content {
          padding: 40px 32px;
        }

        .form-section {
          margin-bottom: 48px;
        }

        .form-section:last-child {
          margin-bottom: 0;
        }

        .section-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 28px;
          padding-bottom: 20px;
          border-bottom: 2px solid var(--gray-100);
        }

        .section-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        .section-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: 4px;
          letter-spacing: -0.01em;
        }

        .section-description {
          font-size: 14px;
          color: var(--gray-500);
          font-weight: 500;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }

        .input-group {
          position: relative;
        }

        .input-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: var(--gray-700);
          margin-bottom: 8px;
          letter-spacing: -0.01em;
        }

        .input-icon {
          font-size: 16px;
        }

        .input-wrapper {
          position: relative;
        }

        .input-field {
          width: 100%;
          padding: 14px 16px;
          font-size: 15px;
          font-weight: 500;
          color: var(--gray-900);
          background: white;
          border: 2px solid var(--gray-200);
          border-radius: 12px;
          outline: none;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: 'Manrope', sans-serif;
        }

        .input-field::placeholder {
          color: var(--gray-400);
          font-weight: 500;
        }

        .input-field:hover:not(:disabled) {
          border-color: var(--gray-300);
        }

        .input-field:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        }

        .input-field:disabled {
          background: var(--gray-50);
          color: var(--gray-500);
          cursor: not-allowed;
        }

        .input-field.input-error {
          border-color: var(--error);
          background: rgba(239, 68, 68, 0.02);
        }

        .input-field.input-error:focus {
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
        }

        select.input-field {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%234b5563' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
          padding-right: 44px;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--error);
        }

        .error-message svg {
          flex-shrink: 0;
        }

        .form-actions {
          padding: 32px;
          background: var(--gray-50);
          border-top: 1px solid var(--gray-200);
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          font-size: 15px;
          font-weight: 700;
          color: white;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
          font-family: 'Manrope', sans-serif;
          letter-spacing: -0.01em;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
        }

        .btn-primary:active {
          transform: translateY(0);
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          font-size: 15px;
          font-weight: 700;
          color: var(--primary);
          background: white;
          border: 2px solid var(--primary);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: 'Manrope', sans-serif;
          letter-spacing: -0.01em;
        }

        .btn-secondary:hover {
          background: var(--primary);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
        }

        .btn-text {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 600;
          color: var(--primary);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s ease;
          font-family: 'Manrope', sans-serif;
        }

        .btn-text:hover {
          opacity: 0.7;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        .modal-content {
          width: 100%;
          max-width: 500px;
          background: white;
          border-radius: 24px;
          padding: 40px;
          box-shadow: var(--shadow-2xl);
          animation: modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          max-height: 90vh;
          overflow-y: auto;
        }

        .success-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--success) 0%, #059669 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
        }

        .modal-title {
          font-size: 28px;
          font-weight: 800;
          color: var(--gray-900);
          text-align: center;
          margin-bottom: 12px;
          letter-spacing: -0.02em;
        }

        .modal-description {
          font-size: 15px;
          color: var(--gray-600);
          text-align: center;
          line-height: 1.6;
          margin-bottom: 32px;
          font-weight: 500;
        }

        .modal-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .modal-actions .btn-primary,
        .modal-actions .btn-secondary {
          width: 100%;
          justify-content: center;
        }

        .inline-login {
          margin-top: 32px;
          padding-top: 32px;
          border-top: 2px solid var(--gray-100);
        }

        .login-divider {
          text-align: center;
          margin-bottom: 24px;
          position: relative;
        }

        .login-divider span {
          display: inline-block;
          padding: 0 16px;
          font-size: 14px;
          font-weight: 700;
          color: var(--gray-500);
          background: white;
          position: relative;
          z-index: 1;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .login-divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--gray-200);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 768px) {
          .register-container {
            padding: 24px 16px;
          }

          .register-header {
            margin-bottom: 24px;
          }

          .header-badge {
            font-size: 11px;
            padding: 6px 16px;
          }

          .header-title {
            font-size: 28px;
          }

          .header-subtitle {
            font-size: 14px;
          }

          .register-card {
            border-radius: 20px;
          }

          .profile-section {
            padding: 32px 24px;
          }

          .profile-preview {
            width: 120px;
            height: 120px;
          }

          .form-content {
            padding: 32px 24px;
          }

          .form-section {
            margin-bottom: 40px;
          }

          .section-header {
            gap: 12px;
            margin-bottom: 24px;
          }

          .section-icon {
            width: 40px;
            height: 40px;
          }

          .section-title {
            font-size: 18px;
          }

          .form-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .form-actions {
            padding: 24px;
            flex-direction: column;
          }

          .form-actions .btn-primary,
          .form-actions .btn-secondary {
            width: 100%;
            justify-content: center;
          }

          .modal-content {
            padding: 32px 24px;
          }

          .modal-title {
            font-size: 24px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}