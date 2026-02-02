// src/pages/PostJob.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PostJob() {
  const navigate = useNavigate();

  // who's here?
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("currentUser")) || null; } catch { return null; }
  });

  useEffect(() => {
    const read = () => {
      try { setUser(JSON.parse(localStorage.getItem("currentUser")) || null); } catch {}
    };
    window.addEventListener("authChanged", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("authChanged", read);
      window.removeEventListener("storage", read);
    };
  }, []);

  const canPost = useMemo(() => !!user && user.userType === "recruiter", [user]);

  const [form, setForm] = useState({
    jobTitle: "Software Engineer",
    customJobTitle: "",
    jobType: "Full-time",
    qualification: "B.Tech",
    customQualification: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    hiringProcess: [],
    passFrom: "",
    passTo: "",
    expFrom: "",
    expTo: "",
    cgpa: "",
    gender: "Any",
    description: "",
    numberOfOpenings: "",
  });

  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Inline login modal
  const [showLogin, setShowLogin] = useState(false);
  const [login, setLogin] = useState({ email: "", password: "" });
  const [loginErr, setLoginErr] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      let updated = [...form.hiringProcess];
      if (checked) updated.push(value);
      else updated = updated.filter((v) => v !== value);
      setForm({ ...form, hiringProcess: updated });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.location.trim()) newErrors.location = "Location is required";
    if (!form.salaryMin || form.salaryMin <= 0) newErrors.salaryMin = "Enter valid minimum salary";
    if (!form.salaryMax || form.salaryMax <= 0 || parseFloat(form.salaryMax) < parseFloat(form.salaryMin))
      newErrors.salaryMax = "Max salary should be >= min salary";
    if (!form.passFrom) newErrors.passFrom = "Passing year from required";
    if (!form.passTo || parseInt(form.passTo) < parseInt(form.passFrom)) newErrors.passTo = "Enter valid passing year";
    if (!form.expFrom) newErrors.expFrom = "Experience from required";
    if (!form.expTo || parseFloat(form.expTo) < parseFloat(form.expFrom)) newErrors.expTo = "Enter valid experience";
    if (!form.description.trim()) newErrors.description = "Description required";
    if (!form.numberOfOpenings || form.numberOfOpenings <= 0)
      newErrors.numberOfOpenings = "Enter valid number of openings";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canPost) return;
    if (!validate()) return;

    const title = form.jobTitle === "other" ? form.customJobTitle.trim() : form.jobTitle;
    const qualification = form.qualification === "other" ? form.customQualification.trim() : form.qualification;

    const job = {
      id: Date.now(),
      title,
      jobType: form.jobType,
      qualification,
      location: form.location.trim(),
      salary: `${form.salaryMin} - ${form.salaryMax} LPA`,
      hiringProcess: form.hiringProcess,
      passingYearRange: `${form.passFrom} - ${form.passTo}`,
      experienceRange: `${form.expFrom} - ${form.expTo}`,
      cgpa: form.cgpa,
      gender: form.gender,
      description: form.description.trim(),
      numberOfOpenings: form.numberOfOpenings,
      postedBy: user.id,
      company: user.company || user.name || "Unknown Company",
      posterEmail: user.email,
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    const existing = JSON.parse(localStorage.getItem("jobs")) || [];
    localStorage.setItem("jobs", JSON.stringify([job, ...existing]));
    try { window.dispatchEvent(new Event("jobsChanged")); } catch {}

    setShowSuccess(true);
    setTimeout(() => navigate("/company-dashboard"), 1200);
  };

  // recruiter login
  const doLogin = (e) => {
    e.preventDefault();
    setLoginErr("");

    const users = JSON.parse(localStorage.getItem("users")) || [];
    let found = users.find(
      (u) => u.email?.toLowerCase() === login.email.trim().toLowerCase() && u.password === login.password
    );

    if (!found) {
      const rc = JSON.parse(localStorage.getItem("registeredCompany"));
      if (
        rc &&
        rc.email?.toLowerCase() === login.email.trim().toLowerCase() &&
        rc.password === login.password
      ) {
        const idx = users.findIndex(u => u.email?.toLowerCase() === rc.email.toLowerCase());
        const recruiter = {
          id: idx >= 0 ? users[idx].id : Date.now(),
          userType: "recruiter",
          email: rc.email,
          password: rc.password,
          name: rc.name,
          company: rc.name,
          contact: rc.contact,
          createdAt: new Date().toISOString(),
        };
        if (idx >= 0) users[idx] = recruiter; else users.push(recruiter);
        localStorage.setItem("users", JSON.stringify(users));
        found = recruiter;
      }
    }

    if (!found) {
      setLoginErr("Invalid credentials or not a recruiter.");
      return;
    }

    if (found.userType !== "recruiter") {
      setLoginErr("This is a candidate account. Recruiter login required.");
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify(found));
    try { window.dispatchEvent(new Event("authChanged")); } catch {}
    setShowLogin(false);
    setLogin({ email: "", password: "" });
  };

  const disabled = !canPost;

  return (
    <div className="postjob-container">
      {/* HEADER */}
      <div className="postjob-header">
        <div>
          <h1 className="header-title">Post a New Job</h1>
          <p className="header-subtitle">Fill in the details below to create a new job opening</p>
        </div>
        {canPost ? (
          <div className="status-badge status-active">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Recruiter Mode
          </div>
        ) : (
          <div className="status-badge status-warning">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Login Required
          </div>
        )}
      </div>

      {/* LOCKED CALLOUT */}
      {!canPost && (
        <div className="access-callout">
          <div className="callout-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div className="callout-content">
            <h3 className="callout-title">Recruiter Access Required</h3>
            <p className="callout-description">
              Please sign in with a recruiter account or register your company to post job openings.
            </p>
            <div className="callout-actions">
              <button className="btn-primary" onClick={() => setShowLogin(true)}>
                <span>Sign In</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
              <button
                className="btn-secondary"
                onClick={() => navigate("/register-company?from=post-job")}
              >
                Register Company
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORM CARD */}
      <form onSubmit={handleSubmit} className="postjob-card">
        {/* JOB BASICS */}
        <div className="form-section">
          <div className="section-header">
            <div className="section-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            <div>
              <h2 className="section-title">Job Information</h2>
              <p className="section-description">Basic details about the position</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="input-group">
              <label className="input-label">Job Title</label>
              <select
                name="jobTitle"
                value={form.jobTitle}
                onChange={handleChange}
                disabled={disabled}
                className="input-field"
              >
                <option>Software Engineer</option>
                <option>Data Analyst</option>
                <option>Product Manager</option>
                <option>UI/UX Designer</option>
                <option value="other">Other</option>
              </select>
            </div>

            {form.jobTitle === "other" && (
              <div className="input-group">
                <label className="input-label">Custom Title</label>
                <input
                  name="customJobTitle"
                  value={form.customJobTitle}
                  onChange={handleChange}
                  placeholder="Enter job title"
                  disabled={disabled}
                  className="input-field"
                />
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Job Type</label>
              <select
                name="jobType"
                value={form.jobType}
                onChange={handleChange}
                disabled={disabled}
                className="input-field"
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Internship</option>
                <option>Freelance</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Qualification</label>
              <select
                name="qualification"
                value={form.qualification}
                onChange={handleChange}
                disabled={disabled}
                className="input-field"
              >
                <option>B.Tech</option>
                <option>MCA</option>
                <option>B.Sc</option>
                <option>M.Tech</option>
                <option value="other">Other</option>
              </select>
            </div>

            {form.qualification === "other" && (
              <div className="input-group">
                <label className="input-label">Custom Qualification</label>
                <input
                  name="customQualification"
                  value={form.customQualification}
                  onChange={handleChange}
                  placeholder="Your degree"
                  disabled={disabled}
                  className="input-field"
                />
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                disabled={disabled}
                placeholder="e.g. Bangalore, Remote"
                className={`input-field ${errors.location ? 'input-error' : ''}`}
              />
              {errors.location && (
                <div className="error-message">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" fill="currentColor" opacity="0.1"/>
                    <path d="M7 4v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {errors.location}
                </div>
              )}
            </div>

            <div className="input-group">
              <label className="input-label">Number of Openings</label>
              <input
                name="numberOfOpenings"
                type="number"
                value={form.numberOfOpenings}
                onChange={handleChange}
                disabled={disabled}
                placeholder="e.g. 5"
                className={`input-field ${errors.numberOfOpenings ? 'input-error' : ''}`}
              />
              {errors.numberOfOpenings && (
                <div className="error-message">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" fill="currentColor" opacity="0.1"/>
                    <path d="M7 4v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {errors.numberOfOpenings}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COMPENSATION */}
        <div className="form-section">
          <div className="section-header">
            <div className="section-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div>
              <h2 className="section-title">Compensation & Details</h2>
              <p className="section-description">Salary range and other preferences</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="input-group">
              <label className="input-label">Min Salary (LPA)</label>
              <input
                name="salaryMin"
                type="number"
                value={form.salaryMin}
                onChange={handleChange}
                disabled={disabled}
                placeholder="e.g. 6"
                className={`input-field ${errors.salaryMin ? 'input-error' : ''}`}
              />
              {errors.salaryMin && (
                <div className="error-message">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" fill="currentColor" opacity="0.1"/>
                    <path d="M7 4v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {errors.salaryMin}
                </div>
              )}
            </div>

            <div className="input-group">
              <label className="input-label">Max Salary (LPA)</label>
              <input
                name="salaryMax"
                type="number"
                value={form.salaryMax}
                onChange={handleChange}
                disabled={disabled}
                placeholder="e.g. 12"
                className={`input-field ${errors.salaryMax ? 'input-error' : ''}`}
              />
              {errors.salaryMax && (
                <div className="error-message">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" fill="currentColor" opacity="0.1"/>
                    <path d="M7 4v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {errors.salaryMax}
                </div>
              )}
            </div>

            <div className="input-group">
              <label className="input-label">Required CGPA / %</label>
              <input
                name="cgpa"
                value={form.cgpa}
                onChange={handleChange}
                disabled={disabled}
                placeholder="e.g. 7.0 or 60%"
                className="input-field"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Gender Preference</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                disabled={disabled}
                className="input-field"
              >
                <option>Any</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* REQUIREMENTS */}
        <div className="form-section">
          <div className="section-header">
            <div className="section-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <div>
              <h2 className="section-title">Candidate Requirements</h2>
              <p className="section-description">Experience and education criteria</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="input-group">
              <label className="input-label">Passing Year From</label>
              <input
                name="passFrom"
                type="number"
                value={form.passFrom}
                onChange={handleChange}
                disabled={disabled}
                placeholder="e.g. 2020"
                className={`input-field ${errors.passFrom ? 'input-error' : ''}`}
              />
              {errors.passFrom && (
                <div className="error-message">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" fill="currentColor" opacity="0.1"/>
                    <path d="M7 4v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {errors.passFrom}
                </div>
              )}
            </div>

            <div className="input-group">
              <label className="input-label">Passing Year To</label>
              <input
                name="passTo"
                type="number"
                value={form.passTo}
                onChange={handleChange}
                disabled={disabled}
                placeholder="e.g. 2024"
                className={`input-field ${errors.passTo ? 'input-error' : ''}`}
              />
              {errors.passTo && (
                <div className="error-message">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" fill="currentColor" opacity="0.1"/>
                    <path d="M7 4v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {errors.passTo}
                </div>
              )}
            </div>

            <div className="input-group">
              <label className="input-label">Experience From (years)</label>
              <input
                name="expFrom"
                type="number"
                value={form.expFrom}
                onChange={handleChange}
                disabled={disabled}
                placeholder="e.g. 0"
                className={`input-field ${errors.expFrom ? 'input-error' : ''}`}
              />
              {errors.expFrom && (
                <div className="error-message">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" fill="currentColor" opacity="0.1"/>
                    <path d="M7 4v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {errors.expFrom}
                </div>
              )}
            </div>

            <div className="input-group">
              <label className="input-label">Experience To (years)</label>
              <input
                name="expTo"
                type="number"
                value={form.expTo}
                onChange={handleChange}
                disabled={disabled}
                placeholder="e.g. 3"
                className={`input-field ${errors.expTo ? 'input-error' : ''}`}
              />
              {errors.expTo && (
                <div className="error-message">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" fill="currentColor" opacity="0.1"/>
                    <path d="M7 4v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {errors.expTo}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* HIRING PROCESS */}
        <div className="form-section">
          <div className="section-header">
            <div className="section-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <h2 className="section-title">Hiring Process</h2>
              <p className="section-description">Select applicable interview methods</p>
            </div>
          </div>

          <div className="checkbox-grid">
            {[
              "Face-to-Face",
              "Group Discussion",
              "Telephonic",
              "Virtual",
              "Written Test",
              "Walk-in",
            ].map((p) => (
              <label
                key={p}
                className={`checkbox-item ${disabled ? 'checkbox-disabled' : ''}`}
              >
                <input
                  type="checkbox"
                  value={p}
                  checked={form.hiringProcess.includes(p)}
                  onChange={handleChange}
                  disabled={disabled}
                />
                <span className="checkbox-label">{p}</span>
                <svg className="checkbox-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.3 4L6 11.3 2.7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </label>
            ))}
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="form-section">
          <div className="section-header">
            <div className="section-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <div>
              <h2 className="section-title">Job Description</h2>
              <p className="section-description">Detailed description of the role</p>
            </div>
          </div>

          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Description</label>
            <textarea
              name="description"
              rows={6}
              value={form.description}
              onChange={handleChange}
              disabled={disabled}
              placeholder="Describe the role, responsibilities, and requirements..."
              className={`input-field ${errors.description ? 'input-error' : ''}`}
              style={{ resize: 'vertical' }}
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
        </div>

        {/* SUBMIT */}
        <div className="form-actions">
          <button
            type="submit"
            disabled={disabled}
            className="btn-primary btn-submit"
          >
            <span>Post Job</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

        {showSuccess && (
          <div className="success-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Job posted successfully! Redirecting...
          </div>
        )}
      </form>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="modal-overlay" onClick={() => setShowLogin(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div>
                <h3 className="modal-title">Recruiter Login</h3>
                <p className="modal-description">Sign in to post jobs and manage applications</p>
              </div>
              <button className="modal-close" onClick={() => setShowLogin(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={doLogin} className="modal-form">
              <div className="input-group">
                <label className="input-label">Email Address</label>
                <input
                  value={login.email}
                  onChange={(e) => setLogin({ ...login, email: e.target.value })}
                  className="input-field"
                  type="email"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <input
                  value={login.password}
                  onChange={(e) => setLogin({ ...login, password: e.target.value })}
                  className="input-field"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>

              {loginErr && (
                <div className="login-error">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.1"/>
                    <path d="M8 5v3M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {loginErr}
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowLogin(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <span>Sign In</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STYLES */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

        :root {
          --primary: #16a34a;
          --primary-dark: #15803d;
          --primary-light: #22c55e;
          --warning: #f59e0b;
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

        .postjob-container {
          font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          min-height: 100vh;
          background: linear-gradient(135deg, #004182 100%);
          padding: 40px 20px;
          position: relative;
        }

        .postjob-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.15) 0%, transparent 50%);
          pointer-events: none;
        }

        .postjob-header {
          max-width: 1000px;
          margin: 0 auto 32px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          position: relative;
          z-index: 1;
          animation: fadeInDown 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .header-title {
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 800;
          color: white;
          margin: 0 0 8px 0;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }

        .header-subtitle {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
          font-weight: 500;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.3px;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .status-active {
          background: rgba(255, 255, 255, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.4);
          color: white;
        }

        .status-warning {
          background: rgba(245, 158, 11, 0.2);
          border: 1px solid rgba(245, 158, 11, 0.4);
          color: #fef3c7;
        }

        .access-callout {
          max-width: 1000px;
          margin: 0 auto 32px;
          background: white;
          border-radius: 20px;
          padding: 28px;
          display: flex;
          gap: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
          position: relative;
          z-index: 1;
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s backwards;
        }

        .callout-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: linear-gradient(135deg, var(--warning) 0%, #ea580c 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 8px 16px rgba(245, 158, 11, 0.3);
        }

        .callout-content {
          flex: 1;
        }

        .callout-title {
          font-size: 20px;
          font-weight: 800;
          color: var(--gray-900);
          margin: 0 0 8px 0;
          letter-spacing: -0.01em;
        }

        .callout-description {
          font-size: 15px;
          color: var(--gray-600);
          margin: 0 0 20px 0;
          line-height: 1.6;
          font-weight: 500;
        }

        .callout-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .postjob-card {
          max-width: 1000px;
          margin: 0 auto;
          background: white;
          border-radius: 24px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
          padding: 40px;
          position: relative;
          z-index: 1;
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s backwards;
        }

        .form-section {
          margin-bottom: 48px;
        }

        .form-section:last-of-type {
          margin-bottom: 32px;
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
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
        }

        .section-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--gray-900);
          margin: 0 0 4px 0;
          letter-spacing: -0.01em;
        }

        .section-description {
          font-size: 14px;
          color: var(--gray-500);
          margin: 0;
          font-weight: 500;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
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
          font-family: 'DM Sans', sans-serif;
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
          box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.1);
        }

        .input-field:disabled {
          background: var(--gray-50);
          color: var(--gray-500);
          cursor: not-allowed;
          opacity: 0.6;
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

        .checkbox-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .checkbox-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: var(--gray-50);
          border: 2px solid var(--gray-200);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .checkbox-item:hover:not(.checkbox-disabled) {
          border-color: var(--primary);
          background: rgba(22, 163, 74, 0.05);
        }

        .checkbox-item input[type="checkbox"] {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .checkbox-item input[type="checkbox"]:checked + .checkbox-label {
          color: var(--primary);
          font-weight: 600;
        }

        .checkbox-item input[type="checkbox"]:checked ~ .checkbox-icon {
          opacity: 1;
          color: var(--primary);
        }

        .checkbox-item:has(input:checked) {
          border-color: var(--primary);
          background: rgba(22, 163, 74, 0.05);
        }

        .checkbox-label {
          flex: 1;
          font-size: 14px;
          font-weight: 500;
          color: var(--gray-700);
          transition: all 0.2s ease;
        }

        .checkbox-icon {
          opacity: 0;
          transition: opacity 0.2s ease;
          flex-shrink: 0;
        }

        .checkbox-disabled {
          opacity: 0.5;
          cursor: not-allowed;
          pointer-events: none;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          padding-top: 24px;
          border-top: 1px solid var(--gray-200);
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
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
          font-family: 'DM Sans', sans-serif;
          letter-spacing: -0.01em;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(22, 163, 74, 0.4);
        }

        .btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
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
          font-family: 'DM Sans', sans-serif;
          letter-spacing: -0.01em;
        }

        .btn-secondary:hover {
          background: var(--gray-50);
          border-color: var(--gray-400);
        }

        .success-message {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 24px;
          padding: 16px 24px;
          background: linear-gradient(135deg, rgba(22, 163, 74, 0.1) 0%, rgba(21, 128, 61, 0.05) 100%);
          border: 2px solid var(--primary);
          border-radius: 12px;
          color: var(--primary-dark);
          font-weight: 700;
          font-size: 15px;
          animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
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
          padding: 32px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
          animation: modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .modal-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 28px;
        }

        .modal-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
        }

        .modal-title {
          font-size: 22px;
          font-weight: 800;
          color: var(--gray-900);
          margin: 0 0 4px 0;
          letter-spacing: -0.01em;
        }

        .modal-description {
          font-size: 14px;
          color: var(--gray-500);
          margin: 0;
          font-weight: 500;
        }

        .modal-close {
          margin-left: auto;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: var(--gray-100);
          border: none;
          color: var(--gray-600);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .modal-close:hover {
          background: var(--gray-200);
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .login-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 10px;
          color: var(--error);
          font-size: 14px;
          font-weight: 600;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 8px;
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

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .postjob-container {
            padding: 24px 16px;
          }

          .postjob-header {
            flex-direction: column;
            gap: 16px;
            margin-bottom: 24px;
          }

          .header-title {
            font-size: 24px;
          }

          .status-badge {
            align-self: flex-start;
          }

          .access-callout {
            flex-direction: column;
            padding: 24px;
          }

          .postjob-card {
            padding: 28px 24px;
            border-radius: 20px;
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

          .checkbox-grid {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
          }

          .btn-primary,
          .btn-secondary {
            width: 100%;
            justify-content: center;
          }

          .callout-actions {
            flex-direction: column;
          }

          .callout-actions .btn-primary,
          .callout-actions .btn-secondary {
            width: 100%;
            justify-content: center;
          }

          .modal-content {
            padding: 24px;
          }

          .modal-header {
            margin-bottom: 24px;
          }

          .modal-actions {
            flex-direction: column-reverse;
          }

          .modal-actions .btn-primary,
          .modal-actions .btn-secondary {
            width: 100%;
            justify-content: center;
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