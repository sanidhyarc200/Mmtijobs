import React, { useState } from "react";

/* ------------------ FIELD COMPONENT ------------------ */
const Field = ({
  label,
  name,
  type = "text",
  full = false,
  required = true,
  placeholder,
  value,
  error,
  onChange,
  autoComplete,
  inputMode,
  accept,
}) => (
  <div className={`input-group ${full ? 'input-group-full' : ''}`}>
    <div className="label-row">
      <label className="input-label">
        {label}
        {required && <span className="required-mark">*</span>}
      </label>
      {!required && <span className="optional-badge">Optional</span>}
    </div>
    <input
      type={type}
      name={name}
      value={type === "file" ? undefined : value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={autoComplete}
      inputMode={inputMode}
      accept={accept}
      className={`input-field ${error ? 'input-error' : ''}`}
      required={required}
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
);

export default function UserOnboarding() {
  const TOTAL_STEPS = 5;

  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    // STEP 0: PROFILE PIC
    profilePic: null,
    profilePicPreview: "",

    // Step 1
    firstName: "",
    middleName: "",
    lastName: "",
    contact: "",
    email: "",

    // Step 2
    degree: "",
    passout: "",
    experience: "",
    techstack: "",

    // Step 3
    lastSalary: "",
    currentSalary: "",
    location: "",
    noticePeriod: "",

    // Step 4
    cv: null,
    description: "",
    skills: "",

    // Step 5
    username: "",
    password: "",
    confirmPassword: "",
  });

  /* ------------------ INPUT CHANGE HANDLER ------------------ */
  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;

    const newValue =
      type === "file" ? (files && files[0] ? files[0] : null) : value;

    let newErrors = { ...errors };

    // LIVE VALIDATION AGAINST DUPLICATES
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    if (name === "contact" && newValue.trim().length === 10) {
      if (users.some((u) => String(u.contact) === String(newValue)))
        newErrors.contact = "This mobile number is already registered.";
      else delete newErrors.contact;
    }

    if (name === "email" && newValue.trim().length > 5) {
      if (
        users.some(
          (u) =>
            u.email?.toLowerCase().trim() === newValue.toLowerCase().trim()
        )
      )
        newErrors.email = "This email is already registered.";
      else delete newErrors.email;
    }

    if (name === "username" && newValue.trim().length > 2) {
      if (
        users.some(
          (u) =>
            u.username?.toLowerCase().trim() === newValue.toLowerCase().trim()
        )
      )
        newErrors.username = "This username is already taken.";
      else delete newErrors.username;
    }

    // PROFILE PIC VALIDATION
    if (name === "profilePic") {
      if (!newValue) {
        newErrors.profilePic = "Profile picture is required.";
      } else {
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        if (!allowed.includes(newValue.type)) {
          newErrors.profilePic = "Only JPG/PNG/WebP allowed.";
        } else if (newValue.size > 3 * 1024 * 1024) {
          newErrors.profilePic = "Max file size is 3MB.";
        } else {
          delete newErrors.profilePic;
        }
      }

      if (newValue) {
        const preview = URL.createObjectURL(newValue);
        setFormData((p) => ({ ...p, profilePicPreview: preview }));
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    setErrors(newErrors);
  };

  /* ------------------ VALIDATION ------------------ */
  const validateStep = (step) => {
    const newErrors = {};
    const f = formData;
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const isNum = (v) => !isNaN(parseFloat(v)) && isFinite(v);
  
    switch (step) {
      case 1:
        if (!f.firstName.trim()) newErrors.firstName = "First name is required";
        if (!f.lastName.trim()) newErrors.lastName = "Last name is required";
  
        // Contact number
        if (!/^[0-9]{10}$/.test(f.contact || ""))
          newErrors.contact = "Enter 10-digit mobile";
        else if (users.some(u => String(u.contact) === String(f.contact)))
          newErrors.contact = "This mobile number is already registered";
  
        // Email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email || ""))
          newErrors.email = "Enter a valid email";
        else if (
          users.some(
            (u) => u.email?.trim().toLowerCase() === f.email.trim().toLowerCase()
          )
        )
          newErrors.email = "This email is already registered";
  
        // Profile Pic Required
        if (!formData.profilePic)
          newErrors.profilePic = "Profile picture required";
        break;
  
      case 2:
        if (!f.degree.trim()) newErrors.degree = "Degree is required";
        const year = parseInt(f.passout, 10);
        if (!year || year < 1990 || year > new Date().getFullYear())
          newErrors.passout = "Enter a valid year";
        if (!f.experience.trim() || !isNum(f.experience))
          newErrors.experience = "Enter experience in years";
        if (!f.techstack.trim()) newErrors.techstack = "Tech stack is required";
        break;
  
      case 3:
        if (!isNum(f.lastSalary)) newErrors.lastSalary = "Enter numeric value";
        if (!isNum(f.currentSalary)) newErrors.currentSalary = "Enter numeric value";
        if (!f.location.trim())
          newErrors.location = "Location required";
        else if (/^\d+$/.test(f.location.trim()))
          newErrors.location = "Location cannot be only numbers";
        if (!f.noticePeriod.trim())
          newErrors.noticePeriod = "Notice period required";
        break;
  
      case 4:
        if (!f.skills.trim()) newErrors.skills = "Skills required";
        if (!f.description.trim())
          newErrors.description = "Description required";
  
        if (!f.cv) {
          newErrors.cv = "Resume required";
        } else {
          const allowed = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ];
          if (!allowed.includes(f.cv.type))
            newErrors.cv = "Only PDF/DOC/DOCX allowed";
          if (f.cv.size > 5 * 1024 * 1024)
            newErrors.cv = "File must be ≤ 5MB";
        }
        break;
  
      case 5:
        // PASSWORD ONLY
        if (!f.password.trim())
          newErrors.password = "Password is required";
        else if (f.password.length < 8)
          newErrors.password = "Minimum 8 characters";
        else if (!/[A-Z]/.test(f.password))
          newErrors.password = "Must include an uppercase letter";
        else if (!/[a-z]/.test(f.password))
          newErrors.password = "Must include a lowercase letter";
        else if (!/[0-9]/.test(f.password))
          newErrors.password = "Must include a number";
        else if (!/[!@#$%^&*(),.?\":{}|<>]/.test(f.password))
          newErrors.password = "Must include a special character";
  
        if (f.password !== f.confirmPassword)
          newErrors.confirmPassword = "Passwords do not match";
  
        break;
  
      default:
        break;
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ------------------ CHANGE STEP ------------------ */
  const goToStep = (step) => {
    if (step > currentStep && !validateStep(currentStep)) return;
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ------------------ SAVE USER ------------------ */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateStep(5)) return;

    const users = JSON.parse(localStorage.getItem("users") || "[]");

    const newUser = {
      id: Date.now(),
      userType: "applicant",
      ...formData,
      confirmPassword: undefined,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    setShowSuccessModal(true);
  };

  const pct = Math.round((currentStep / TOTAL_STEPS) * 100);

  const stepTitles = {
    1: "Personal Information",
    2: "Education & Experience",
    3: "Salary & Preferences",
    4: "Skills & Resume",
    5: "Account Security"
  };

  const stepDescriptions = {
    1: "Let's start with your basic details",
    2: "Tell us about your educational background",
    3: "Share your salary expectations and location",
    4: "Upload your resume and highlight your skills",
    5: "Create your account credentials"
  };

  return (
    <div className="onboarding-container">
      {/* PROGRESS HEADER */}
      <div className="onboarding-header">
        <div className="header-content">
          <h1 className="header-title">User Onboarding</h1>
          <p className="header-subtitle">Complete your profile in {TOTAL_STEPS} easy steps</p>
        </div>
        <div className="progress-wrapper">
          <div className="progress-bar" style={{ width: `${pct}%` }} />
        </div>
        <div className="step-indicator">
          <span className="step-current">Step {currentStep}</span>
          <span className="step-divider">/</span>
          <span className="step-total">{TOTAL_STEPS}</span>
          <span className="step-percent">{pct}%</span>
        </div>
      </div>

      {/* FORM CARD */}
      <div className="onboarding-card">
        {/* STEP DOTS */}
        <div className="step-dots">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => goToStep(n)}
              className={`step-dot ${currentStep === n ? 'step-dot-active' : ''} ${n < currentStep ? 'step-dot-complete' : ''}`}
              disabled={n > currentStep}
            >
              {n < currentStep ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <span>{n}</span>
              )}
            </button>
          ))}
        </div>

        {/* STEP HEADER */}
        <div className="step-header">
          <h2 className="step-title">{stepTitles[currentStep]}</h2>
          <p className="step-description">{stepDescriptions[currentStep]}</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="onboarding-form">
          {/* ======================= STEP 1 ======================= */}
          {currentStep === 1 && (
            <>
              {/* Profile Pic Card */}
              <div className="profile-upload-section">
                <div className="profile-preview-wrapper">
                  <img
                    src={
                      formData.profilePicPreview ||
                      "https://i.ibb.co/tLxcP8w/blank-avatar.png"
                    }
                    alt="Avatar Preview"
                    className="profile-preview-image"
                  />
                  <div className="profile-overlay">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                  </div>
                </div>

                <div className="profile-upload-controls">
                  <label className="file-upload-label">
                    Upload Profile Picture *
                  </label>
                  <input
                    type="file"
                    name="profilePic"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleInputChange}
                    className="file-input"
                  />
                  {errors.profilePic && (
                    <div className="error-message">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="6" fill="currentColor" opacity="0.1"/>
                        <path d="M7 4v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      {errors.profilePic}
                    </div>
                  )}
                  <p className="file-hint">PNG, JPG, or WebP up to 3MB</p>
                </div>
              </div>

              <div className="form-grid">
                <Field
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  error={errors.firstName}
                  placeholder="e.g. Aisha"
                />
                <Field
                  label="Middle Name"
                  name="middleName"
                  required={false}
                  value={formData.middleName}
                  onChange={handleInputChange}
                  error={errors.middleName}
                  placeholder="(optional)"
                />
                <Field
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  error={errors.lastName}
                  placeholder="e.g. Khan"
                />
                <Field
                  label="Contact Number"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  error={errors.contact}
                  placeholder="10-digit mobile"
                />
                <Field
                  label="Email ID"
                  name="email"
                  type="email"
                  full
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                  placeholder="you@company.com"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => goToStep(2)}
                >
                  <span>Continue</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>
            </>
          )}

          {/* ======================= STEP 2 ======================= */}
          {currentStep === 2 && (
            <>
              <div className="form-grid">
                <Field
                  label="Degree"
                  name="degree"
                  value={formData.degree}
                  onChange={handleInputChange}
                  error={errors.degree}
                  placeholder="e.g. B.Tech, BCA"
                />
                <Field
                  label="Passout Year"
                  name="passout"
                  value={formData.passout}
                  onChange={handleInputChange}
                  error={errors.passout}
                  placeholder="e.g. 2023"
                />
                <Field
                  label="Experience (years)"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  error={errors.experience}
                  placeholder="e.g. 1"
                />
                <Field
                  label="Tech Stack"
                  name="techstack"
                  value={formData.techstack}
                  onChange={handleInputChange}
                  error={errors.techstack}
                  placeholder="e.g. React, Node.js"
                />
              </div>

              <div className="form-actions form-actions-split">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => goToStep(1)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => goToStep(3)}
                >
                  <span>Continue</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>
            </>
          )}

          {/* ======================= STEP 3 ======================= */}
          {currentStep === 3 && (
            <>
              <div className="form-grid">
                <Field
                  label="Last Salary"
                  name="lastSalary"
                  value={formData.lastSalary}
                  onChange={handleInputChange}
                  error={errors.lastSalary}
                  placeholder="e.g. 6 LPA"
                />
                <Field
                  label="Expected Salary"
                  name="currentSalary"
                  value={formData.currentSalary}
                  onChange={handleInputChange}
                  error={errors.currentSalary}
                  placeholder="e.g. 8 LPA"
                />
                <Field
                  label="Preferred Location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  error={errors.location}
                  placeholder="e.g. Bengaluru"
                />
                <Field
                  label="Notice Period"
                  name="noticePeriod"
                  value={formData.noticePeriod}
                  onChange={handleInputChange}
                  error={errors.noticePeriod}
                  placeholder="e.g. 30 days"
                />
              </div>

              <div className="form-actions form-actions-split">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => goToStep(2)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => goToStep(4)}
                >
                  <span>Continue</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>
            </>
          )}

          {/* ======================= STEP 4 ======================= */}
          {currentStep === 4 && (
            <>
              <div className="form-grid">
                <Field
                  label="Skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  error={errors.skills}
                  placeholder="e.g. React, Docker, REST APIs"
                />

                {/* Description */}
                <div className="input-group input-group-full">
                  <div className="label-row">
                    <label className="input-label">
                      Description<span className="required-mark">*</span>
                    </label>
                  </div>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brief about your experience, job responsibilities, and achievements."
                    className={`input-field input-textarea ${errors.description ? 'input-error' : ''}`}
                    required
                  />
                  {errors.description && (
                    <div className="error-message">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="6" fill="currentColor" opacity="0.1"/>
                        <path d="M7 4v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      {errors.description}
                    </div>
                  )}
                </div>

                {/* Resume upload */}
                <div className="input-group input-group-full">
                  <div className="label-row">
                    <label className="input-label">
                      Upload Resume (PDF/DOC/DOCX)<span className="required-mark">*</span>
                    </label>
                  </div>
                  <input
                    type="file"
                    name="cv"
                    accept=".pdf,.doc,.docx"
                    onChange={handleInputChange}
                    className={`file-input ${errors.cv ? 'file-input-error' : ''}`}
                    required
                  />
                  {errors.cv && (
                    <div className="error-message">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="6" fill="currentColor" opacity="0.1"/>
                        <path d="M7 4v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      {errors.cv}
                    </div>
                  )}
                  {formData.cv && !errors.cv && (
                    <div className="file-selected">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                        <polyline points="13 2 13 9 20 9"/>
                      </svg>
                      <span>{formData.cv.name}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions form-actions-split">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => goToStep(3)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => goToStep(5)}
                >
                  <span>Continue</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>
            </>
          )}

          {/* ======================= STEP 5 ======================= */}
          {currentStep === 5 && (
            <>
              <div className="form-grid">
                <Field
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={errors.password}
                  placeholder="Strong password"
                />
                <Field
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  error={errors.confirmPassword}
                  placeholder="Re-enter password"
                />
              </div>

              <div className="form-actions form-actions-split">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => goToStep(4)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                  <span>Previous</span>
                </button>
                <button
                  type="submit"
                  className="btn-primary btn-submit"
                >
                  <span>Complete Registration</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </button>
              </div>
            </>
          )}
        </form>
      </div>

      {/* ------------------ SUCCESS MODAL ------------------ */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="success-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="3"/>
                <path d="M14 24l8 8 16-16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="modal-title">Registration Successful! 🎉</h2>
            <p className="modal-description">
              Your profile has been created successfully. You can now explore job opportunities and apply to positions.
            </p>
            <button
              className="btn-primary btn-full"
              onClick={() => (window.location.href = "/")}
            >
              <span>Continue to Home</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* STYLES */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        :root {
          --primary: #6366f1;
          --primary-dark: #4f46e5;
          --primary-light: #818cf8;
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
        }

        .onboarding-container {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 32px 20px;
          position: relative;
        }

        .onboarding-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.15) 0%, transparent 50%);
          pointer-events: none;
        }

        .onboarding-header {
          max-width: 860px;
          margin: 0 auto 32px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 20px;
          padding: 28px;
          position: relative;
          z-index: 1;
          animation: fadeInDown 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .header-content {
          margin-bottom: 20px;
        }

        .header-title {
          font-size: clamp(24px, 4vw, 32px);
          font-weight: 800;
          color: white;
          margin: 0 0 8px 0;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }

        .header-subtitle {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
          font-weight: 500;
        }

        .progress-wrapper {
          height: 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 100px;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #10b981 0%, #059669 100%);
          border-radius: 100px;
          transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.5);
        }

        .step-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          color: white;
          font-size: 14px;
        }

        .step-current {
          font-size: 18px;
        }

        .step-divider {
          opacity: 0.6;
        }

        .step-total {
          opacity: 0.8;
        }

        .step-percent {
          margin-left: auto;
          padding: 4px 12px;
          background: rgba(255, 255, 255, 0.25);
          border-radius: 100px;
          font-size: 13px;
        }

        .onboarding-card {
          max-width: 860px;
          margin: 0 auto;
          background: white;
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
          position: relative;
          z-index: 1;
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s backwards;
        }

        .step-dots {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 32px;
        }

        .step-dot {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--gray-100);
          border: 2px solid var(--gray-200);
          color: var(--gray-500);
          font-weight: 700;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .step-dot:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .step-dot:not(:disabled):hover {
          transform: scale(1.1);
        }

        .step-dot-active {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          border-color: var(--primary);
          color: white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }

        .step-dot-complete {
          background: var(--success);
          border-color: var(--success);
          color: white;
        }

        .step-header {
          text-align: center;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 2px solid var(--gray-100);
        }

        .step-title {
          font-size: 24px;
          font-weight: 800;
          color: var(--gray-900);
          margin: 0 0 8px 0;
          letter-spacing: -0.01em;
        }

        .step-description {
          font-size: 15px;
          color: var(--gray-500);
          margin: 0;
          font-weight: 500;
        }

        .profile-upload-section {
          background: linear-gradient(135deg, var(--gray-50) 0%, white 100%);
          border: 2px dashed var(--gray-200);
          border-radius: 16px;
          padding: 32px;
          margin-bottom: 32px;
          text-align: center;
        }

        .profile-preview-wrapper {
          width: 140px;
          height: 140px;
          margin: 0 auto 20px;
          position: relative;
          border-radius: 50%;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .profile-preview-wrapper:hover {
          transform: scale(1.05);
        }

        .profile-preview-wrapper:hover .profile-overlay {
          opacity: 1;
        }

        .profile-preview-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .profile-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .profile-upload-controls {
          max-width: 400px;
          margin: 0 auto;
        }

        .file-upload-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: var(--gray-700);
          margin-bottom: 8px;
        }

        .file-input {
          width: 100%;
          padding: 12px;
          border: 2px solid var(--gray-200);
          border-radius: 10px;
          background: white;
          font-size: 14px;
          font-weight: 500;
          color: var(--gray-700);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .file-input:hover {
          border-color: var(--gray-300);
        }

        .file-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        .file-input-error {
          border-color: var(--error);
          background: rgba(239, 68, 68, 0.02);
        }

        .file-hint {
          margin-top: 8px;
          font-size: 13px;
          color: var(--gray-500);
          font-weight: 500;
        }

        .file-selected {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          padding: 10px 12px;
          background: rgba(99, 102, 241, 0.05);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 8px;
          color: var(--primary);
          font-size: 13px;
          font-weight: 600;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin-bottom: 32px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
        }

        .input-group-full {
          grid-column: 1 / -1;
        }

        .label-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 8px;
        }

        .input-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--gray-700);
          letter-spacing: -0.01em;
        }

        .required-mark {
          color: var(--error);
          margin-left: 2px;
        }

        .optional-badge {
          font-size: 12px;
          font-weight: 600;
          color: var(--gray-400);
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
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .input-field::placeholder {
          color: var(--gray-400);
          font-weight: 500;
        }

        .input-field:hover {
          border-color: var(--gray-300);
        }

        .input-field:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        .input-field.input-error {
          border-color: var(--error);
          background: rgba(239, 68, 68, 0.02);
        }

        .input-field.input-error:focus {
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
        }

        .input-textarea {
          min-height: 120px;
          resize: vertical;
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
          display: flex;
          justify-content: flex-end;
          padding-top: 24px;
          border-top: 1px solid var(--gray-200);
        }

        .form-actions-split {
          justify-content: space-between;
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
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
          font-family: 'Plus Jakarta Sans', sans-serif;
          letter-spacing: -0.01em;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
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
          color: var(--gray-700);
          background: white;
          border: 2px solid var(--gray-300);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: 'Plus Jakarta Sans', sans-serif;
          letter-spacing: -0.01em;
        }

        .btn-secondary:hover {
          background: var(--gray-50);
          border-color: var(--gray-400);
        }

        .btn-submit {
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          background: linear-gradient(135deg, var(--success) 0%, #059669 100%);
        }

        .btn-submit:hover {
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
        }

        .btn-full {
          width: 100%;
          justify-content: center;
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
          max-width: 480px;
          background: white;
          border-radius: 24px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
          animation: modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
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
          margin: 0 0 12px 0;
          letter-spacing: -0.02em;
        }

        .modal-description {
          font-size: 15px;
          color: var(--gray-600);
          margin: 0 0 32px 0;
          line-height: 1.6;
          font-weight: 500;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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
          .onboarding-container {
            padding: 24px 16px;
          }

          .onboarding-header {
            padding: 24px;
            margin-bottom: 24px;
          }

          .header-title {
            font-size: 22px;
          }

          .onboarding-card {
            padding: 28px 24px;
            border-radius: 20px;
          }

          .step-dots {
            gap: 8px;
            margin-bottom: 28px;
          }

          .step-dot {
            width: 40px;
            height: 40px;
            font-size: 14px;
          }

          .step-header {
            margin-bottom: 28px;
          }

          .step-title {
            font-size: 20px;
          }

          .profile-upload-section {
            padding: 24px;
          }

          .profile-preview-wrapper {
            width: 120px;
            height: 120px;
          }

          .form-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .form-actions {
            flex-direction: column-reverse;
            gap: 12px;
          }

          .form-actions-split {
            flex-direction: column-reverse;
          }

          .btn-primary,
          .btn-secondary {
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