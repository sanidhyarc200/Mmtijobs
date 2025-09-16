// src/pages/PostJob.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const disabledChip = {
  opacity: 0.6,
  cursor: "not-allowed",
  pointerEvents: "none",
};

export default function PostJob() {
  const navigate = useNavigate();

  // who’s here?
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
  });

  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Inline login modal (so recruiters can unlock this page immediately)
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
      newErrors.salaryMax = "Max salary should be greater than or equal to min salary";
    if (!form.passFrom) newErrors.passFrom = "Passing year from required";
    if (!form.passTo || parseInt(form.passTo) < parseInt(form.passFrom)) newErrors.passTo = "Enter a valid passing year range";
    if (!form.expFrom) newErrors.expFrom = "Experience from required";
    if (!form.expTo || parseFloat(form.expTo) < parseFloat(form.expFrom)) newErrors.expTo = "Enter a valid experience range";
    if (!form.description.trim()) newErrors.description = "Description required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canPost) return; // hard gate
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

      // 🔑 make dashboard & ownership work
      postedBy: user.id,
      company: user.company || user.name || "Unknown Company",
      posterEmail: user.email,
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    const existing = JSON.parse(localStorage.getItem("jobs")) || [];
    // newest first
    localStorage.setItem("jobs", JSON.stringify([job, ...existing]));
    try { window.dispatchEvent(new Event("jobsChanged")); } catch {}

    setShowSuccess(true);
    setTimeout(() => navigate("/company-dashboard"), 1200);
  };

  // --- inline recruiter login ---
  const doLogin = (e) => {
    e.preventDefault();
    setLoginErr("");

    const users = JSON.parse(localStorage.getItem("users")) || [];
    let found = users.find(
      (u) => u.email?.toLowerCase() === login.email.trim().toLowerCase() && u.password === login.password
    );

    // fallback: allow login with registeredCompany if not in users yet
    if (!found) {
      const rc = JSON.parse(localStorage.getItem("registeredCompany"));
      if (
        rc &&
        rc.email?.toLowerCase() === login.email.trim().toLowerCase() &&
        rc.password === login.password
      ) {
        // upsert recruiter into users
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
      setLoginErr("Invalid credentials. Use a recruiter account.");
      return;
    }
    if (found.userType !== "recruiter") {
      setLoginErr("This is a candidate account. Please sign in as a recruiter.");
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify(found));
    try { window.dispatchEvent(new Event("authChanged")); } catch {}
    setShowLogin(false);
    setLogin({ email: "", password: "" });
    // user state will update via listener → canPost becomes true
  };

  const disabled = !canPost;

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <h2 style={styles.heading}>Post a New Job</h2>

          {/* Live indicator of auth state */}
          {canPost ? (
            <div style={pillOk}>Recruiter mode</div>
          ) : (
            <div style={pillWarn}>Locked — recruiter login required</div>
          )}
        </div>

        {/* Recruiter Required Callout */}
        {disabled && (
          <div style={callout}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={dot} />
              <div>
                <div style={{ fontWeight: 800, color: "#0a66c2" }}>Recruiter account required</div>
                <div style={{ color: "#6b7280", fontSize: 14 }}>
                  You must sign in as a recruiter to post jobs.
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
              <button type="button" style={btnPrimary} onClick={() => setShowLogin(true)}>Login</button>
              <button
                type="button"
                style={btnSecondary}
                onClick={() => navigate("/register-company?from=post-job")}
              >
                Sign up as Recruiter
              </button>
            </div>
          </div>
        )}

        <div style={styles.grid} aria-disabled={disabled}>
          {/* Job Title */}
          <div style={styles.group}>
            <label>Job Title</label>
            <select name="jobTitle" value={form.jobTitle} onChange={handleChange} style={input(disabled)} disabled={disabled}>
              <option>Software Engineer</option>
              <option>Data Analyst</option>
              <option>Product Manager</option>
              <option>UI/UX Designer</option>
              <option value="other">Other</option>
            </select>
          </div>

          {form.jobTitle === "other" && (
            <div style={styles.group}>
              <label>Custom Job Title</label>
              <input
                name="customJobTitle"
                value={form.customJobTitle}
                onChange={handleChange}
                placeholder="Enter custom title"
                style={input(disabled)}
                disabled={disabled}
              />
            </div>
          )}

          {/* Job Type */}
          <div style={styles.group}>
            <label>Job Type</label>
            <select name="jobType" value={form.jobType} onChange={handleChange} style={input(disabled)} disabled={disabled}>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
              <option>Freelance</option>
            </select>
          </div>

          {/* Qualification */}
          <div style={styles.group}>
            <label>Qualification</label>
            <select name="qualification" value={form.qualification} onChange={handleChange} style={input(disabled)} disabled={disabled}>
              <option>B.Tech</option>
              <option>MCA</option>
              <option>B.Sc</option>
              <option>M.Tech</option>
              <option value="other">Other</option>
            </select>
          </div>

          {form.qualification === "other" && (
            <div style={styles.group}>
              <label>Custom Qualification</label>
              <input
                name="customQualification"
                value={form.customQualification}
                onChange={handleChange}
                placeholder="Your degree"
                style={input(disabled)}
                disabled={disabled}
              />
            </div>
          )}

          {/* Location */}
          <div style={styles.group}>
            <label>Job Location</label>
            <input name="location" value={form.location} onChange={handleChange} style={input(disabled)} disabled={disabled} />
            {errors.location && <p style={styles.error}>{errors.location}</p>}
          </div>

          {/* Salary */}
          <div style={styles.group}>
            <label>Min Salary (LPA)</label>
            <input name="salaryMin" type="number" value={form.salaryMin} onChange={handleChange} style={input(disabled)} disabled={disabled} />
            {errors.salaryMin && <p style={styles.error}>{errors.salaryMin}</p>}
          </div>

          <div style={styles.group}>
            <label>Max Salary (LPA)</label>
            <input name="salaryMax" type="number" value={form.salaryMax} onChange={handleChange} style={input(disabled)} disabled={disabled} />
            {errors.salaryMax && <p style={styles.error}>{errors.salaryMax}</p>}
          </div>

          {/* Hiring Process */}
          <div style={{ gridColumn: "1/-1" }}>
            <label>Hiring Process</label>
            <div style={styles.checkboxGroup}>
              {["Face-to-Face", "Group Discussion", "Telephonic", "Virtual", "Written Test", "Walk-in"].map((process) => (
                <label key={process} style={{ ...styles.checkboxLabel, ...(disabled ? disabledChip : {}) }}>
                  <input
                    type="checkbox"
                    value={process}
                    checked={form.hiringProcess.includes(process)}
                    onChange={handleChange}
                    disabled={disabled}
                  />
                  {process}
                </label>
              ))}
            </div>
          </div>

          {/* Passing Year */}
          <div style={styles.group}>
            <label>Passing Year From</label>
            <input name="passFrom" type="number" value={form.passFrom} onChange={handleChange} style={input(disabled)} disabled={disabled} />
            {errors.passFrom && <p style={styles.error}>{errors.passFrom}</p>}
          </div>
          <div style={styles.group}>
            <label>Passing Year To</label>
            <input name="passTo" type="number" value={form.passTo} onChange={handleChange} style={input(disabled)} disabled={disabled} />
            {errors.passTo && <p style={styles.error}>{errors.passTo}</p>}
          </div>

          {/* Experience */}
          <div style={styles.group}>
            <label>Experience From (years)</label>
            <input name="expFrom" type="number" value={form.expFrom} onChange={handleChange} style={input(disabled)} disabled={disabled} />
            {errors.expFrom && <p style={styles.error}>{errors.expFrom}</p>}
          </div>
          <div style={styles.group}>
            <label>Experience To (years)</label>
            <input name="expTo" type="number" value={form.expTo} onChange={handleChange} style={input(disabled)} disabled={disabled} />
            {errors.expTo && <p style={styles.error}>{errors.expTo}</p>}
          </div>

          {/* CGPA */}
          <div style={styles.group}>
            <label>Required CGPA / %</label>
            <input name="cgpa" value={form.cgpa} onChange={handleChange} style={input(disabled)} disabled={disabled} />
          </div>

          {/* Gender */}
          <div style={styles.group}>
            <label>Gender Preference</label>
            <select name="gender" value={form.gender} onChange={handleChange} style={input(disabled)} disabled={disabled}>
              <option>Any</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          {/* Description */}
          <div style={{ gridColumn: "1/-1" }}>
            <label>Job Description</label>
            <textarea
              name="description"
              rows={5}
              value={form.description}
              onChange={handleChange}
              style={{ ...input(disabled), resize: "vertical" }}
              disabled={disabled}
            />
            {errors.description && <p style={styles.error}>{errors.description}</p>}
          </div>
        </div>

        <button type="submit" style={{ ...styles.btn, ...(disabled ? btnDisabled : {}) }} disabled={disabled}>
          Post Job
        </button>
        {showSuccess && <div style={styles.success}>✅ Job posted successfully!</div>}
      </form>

      {/* Inline Login Modal */}
      {showLogin && (
        <div style={overlay} onClick={() => setShowLogin(false)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeader}>
              <div style={brand}>M</div>
              <div>
                <h3 style={{ margin: 0, color: "#111827" }}>Recruiter Login</h3>
                <p style={{ margin: "2px 0 0", color: "#6b7280", fontSize: 14 }}>
                  Sign in to post jobs
                </p>
              </div>
              <button style={closeBtn} onClick={() => setShowLogin(false)}>✕</button>
            </div>

            <form onSubmit={doLogin}>
              <div style={{ marginBottom: 10 }}>
                <label style={lbl}>Email</label>
                <input
                  value={login.email}
                  onChange={(e) => setLogin({ ...login, email: e.target.value })}
                  placeholder="you@company.com"
                  style={inp(false)}
                  type="email"
                  required
                />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={lbl}>Password</label>
                <input
                  value={login.password}
                  onChange={(e) => setLogin({ ...login, password: e.target.value })}
                  placeholder="••••••••"
                  style={inp(false)}
                  type="password"
                  required
                />
              </div>
              {loginErr && <div style={errBanner}>{loginErr}</div>}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" style={btnSecondary} onClick={() => setShowLogin(false)}>Cancel</button>
                <button type="submit" style={btnPrimary}>Login</button>
              </div>
            </form>

            <div style={{ marginTop: 10, textAlign: "center", color: "#6b7280" }}>
              Don’t have an account?{" "}
              <button
                style={linkBtn}
                onClick={() => {
                  setShowLogin(false);
                  navigate("/register-company?from=post-job");
                }}
              >
                Sign up as Recruiter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* styles */
const styles = {
  container: { padding: "40px 5%", maxWidth: 1000, margin: "auto" },
  form: {
    backgroundColor: "white",
    padding: 40,
    borderRadius: 14,
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
  },
  heading: {
    color: "#0a66c2",
    fontSize: "1.8rem",
    fontWeight: 800,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 24,
    marginTop: 16,
  },
  group: { display: "flex", flexDirection: "column" },
  error: { color: "red", fontSize: "0.9em", marginTop: 4 },
  btn: {
    backgroundColor: "#0a66c2",
    color: "white",
    padding: "14px 28px",
    border: "none",
    borderRadius: 10,
    fontWeight: 700,
    fontSize: "1em",
    cursor: "pointer",
    marginTop: 30,
  },
  success: {
    marginTop: 20,
    textAlign: "center",
    fontSize: "1.1em",
    fontWeight: 600,
    color: "green",
  },
};

const input = (disabled) => ({
  padding: "12px",
  border: "1px solid #d1d5db",
  borderRadius: 10,
  fontSize: "1rem",
  marginTop: 6,
  background: disabled ? "#f9fafb" : "#fff",
  color: disabled ? "#9ca3af" : "#111827",
  cursor: disabled ? "not-allowed" : "text",
});

const btnDisabled = {
  backgroundColor: "#cbd5e1",
  cursor: "not-allowed",
  color: "#fff",
  boxShadow: "none",
  opacity: 0.9,
};

const callout = {
  border: "1px solid #dbeafe",
  background: "#eff6ff",
  borderRadius: 12,
  padding: 14,
  marginTop: 14,
};

const dot = {
  width: 10, height: 10, borderRadius: "50%", background: "#0a66c2",
};

const pillWarn = {
  background: "#fee2e2",
  color: "#991b1b",
  borderRadius: 999,
  padding: "6px 12px",
  fontWeight: 800,
  fontSize: 12,
};

const pillOk = {
  background: "#dbeafe",
  color: "#1e3a8a",
  borderRadius: 999,
  padding: "6px 12px",
  fontWeight: 800,
  fontSize: 12,
};

/* Modal UI (same theme) */
const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: 16 };
const modal = { background: "#fff", borderRadius: 12, padding: 20, width: "90%", maxWidth: 480, boxShadow: "0 12px 40px rgba(0,0,0,0.25)" };
const modalHeader = { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 };
const brand = { width: 36, height: 36, borderRadius: "50%", background: "#0a66c2", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800 };
const closeBtn = { marginLeft: "auto", background: "#f3f4f6", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: "#374151" };
const lbl = { display: "block", fontWeight: 700, color: "#374151", marginBottom: 6 };
const inp = () => ({ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, outline: "none" });
const errBanner = { background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca", borderRadius: 8, padding: "8px 12px", fontSize: 14, margin: "8px 0" };
const btnPrimary = { padding: "10px 16px", background: "#0a66c2", color: "#fff", border: "none", borderRadius: 8, fontWeight: 800, cursor: "pointer" };
const btnSecondary = { padding: "10px 16px", background: "#e5e7eb", border: "none", borderRadius: 8, fontWeight: 800, cursor: "pointer" };
const linkBtn = { background: "none", border: "none", color: "#0a66c2", fontWeight: 800, cursor: "pointer", padding: 0 };
