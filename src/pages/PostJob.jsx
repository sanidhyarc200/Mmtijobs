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
    <div style={page}>

      {/* ---------- HEADER ---------- */}
      <div style={headerRow}>
        <h1 style={title}>Post a New Job</h1>

        {canPost ? (
          <div style={chipOk}>Recruiter mode</div>
        ) : (
          <div style={chipWarn}>Recruiter login required</div>
        )}
      </div>

      {/* LOCKED CALLOUT */}
      {!canPost && (
        <div style={calloutBox}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={dotBlue} />
            <div>
              <div style={{ fontWeight: 700, color: "#0a66c2" }}>
                Recruiter access required
              </div>
              <div style={{ color: "#6b7280", fontSize: 14 }}>
                Sign in as a recruiter to unlock job posting.
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button type="button" style={btnPrimary} onClick={() => setShowLogin(true)}>
              Login
            </button>

            <button
              type="button"
              style={btnSecondary}
              onClick={() => navigate("/register-company?from=post-job")}
            >
              Register company
            </button>
          </div>
        </div>
      )}

      {/* ---------- FORM CARD ---------- */}
      <form onSubmit={handleSubmit} style={formCard}>

        {/* GRID WRAPPER */}
        <div style={grid} aria-disabled={disabled}>

          {/* Job Title */}
          <div style={group}>
            <label style={lbl}>Job Title</label>
            <select
              name="jobTitle"
              value={form.jobTitle}
              onChange={handleChange}
              disabled={disabled}
              style={inp(disabled)}
            >
              <option>Software Engineer</option>
              <option>Data Analyst</option>
              <option>Product Manager</option>
              <option>UI/UX Designer</option>
              <option value="other">Other</option>
            </select>
          </div>

          {form.jobTitle === "other" && (
            <div style={group}>
              <label style={lbl}>Custom Title</label>
              <input
                name="customJobTitle"
                value={form.customJobTitle}
                onChange={handleChange}
                placeholder="Enter job title"
                disabled={disabled}
                style={inp(disabled)}
              />
            </div>
          )}

          {/* Job Type */}
          <div style={group}>
            <label style={lbl}>Job Type</label>
            <select
              name="jobType"
              value={form.jobType}
              onChange={handleChange}
              disabled={disabled}
              style={inp(disabled)}
            >
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
              <option>Freelance</option>
            </select>
          </div>

          {/* Qualification */}
          <div style={group}>
            <label style={lbl}>Qualification</label>
            <select
              name="qualification"
              value={form.qualification}
              onChange={handleChange}
              disabled={disabled}
              style={inp(disabled)}
            >
              <option>B.Tech</option>
              <option>MCA</option>
              <option>B.Sc</option>
              <option>M.Tech</option>
              <option value="other">Other</option>
            </select>
          </div>

          {form.qualification === "other" && (
            <div style={group}>
              <label style={lbl}>Custom Qualification</label>
              <input
                name="customQualification"
                value={form.customQualification}
                onChange={handleChange}
                placeholder="Your degree"
                disabled={disabled}
                style={inp(disabled)}
              />
            </div>
          )}

          {/* Location */}
          <div style={group}>
            <label style={lbl}>Location</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              disabled={disabled}
              style={inp(disabled)}
            />
            {errors.location && <p style={err}>{errors.location}</p>}
          </div>

          {/* Salary */}
          <div style={group}>
            <label style={lbl}>Min Salary (LPA)</label>
            <input
              name="salaryMin"
              type="number"
              value={form.salaryMin}
              onChange={handleChange}
              disabled={disabled}
              style={inp(disabled)}
            />
            {errors.salaryMin && <p style={err}>{errors.salaryMin}</p>}
          </div>

          <div style={group}>
            <label style={lbl}>Max Salary (LPA)</label>
            <input
              name="salaryMax"
              type="number"
              value={form.salaryMax}
              onChange={handleChange}
              disabled={disabled}
              style={inp(disabled)}
            />
            {errors.salaryMax && <p style={err}>{errors.salaryMax}</p>}
          </div>

          {/* Hiring Process */}
          <div style={{ gridColumn: "1 / -1", marginTop: 20 }}>
            <label style={lbl}>Hiring Process</label>
            <div style={checkGrid}>
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
                  style={{
                    ...checkLabel,
                    ...(disabled ? disabledChip : {}),
                  }}
                >
                  <input
                    type="checkbox"
                    value={p}
                    checked={form.hiringProcess.includes(p)}
                    onChange={handleChange}
                    disabled={disabled}
                    style={{ marginRight: 6 }}
                  />
                  {p}
                </label>
              ))}
            </div>
          </div>

          {/* Passing Year */}
          <div style={group}>
            <label style={lbl}>Passing Year From</label>
            <input
              name="passFrom"
              type="number"
              value={form.passFrom}
              onChange={handleChange}
              disabled={disabled}
              style={inp(disabled)}
            />
            {errors.passFrom && <p style={err}>{errors.passFrom}</p>}
          </div>

          <div style={group}>
            <label style={lbl}>Passing Year To</label>
            <input
              name="passTo"
              type="number"
              value={form.passTo}
              onChange={handleChange}
              disabled={disabled}
              style={inp(disabled)}
            />
            {errors.passTo && <p style={err}>{errors.passTo}</p>}
          </div>

          {/* Experience */}
          <div style={group}>
            <label style={lbl}>Experience From (yrs)</label>
            <input
              name="expFrom"
              type="number"
              value={form.expFrom}
              onChange={handleChange}
              disabled={disabled}
              style={inp(disabled)}
            />
            {errors.expFrom && <p style={err}>{errors.expFrom}</p>}
          </div>

          <div style={group}>
            <label style={lbl}>Experience To (yrs)</label>
            <input
              name="expTo"
              type="number"
              value={form.expTo}
              onChange={handleChange}
              disabled={disabled}
              style={inp(disabled)}
            />
            {errors.expTo && <p style={err}>{errors.expTo}</p>}
          </div>

          {/* CGPA */}
          <div style={group}>
            <label style={lbl}>Required CGPA / %</label>
            <input
              name="cgpa"
              value={form.cgpa}
              onChange={handleChange}
              disabled={disabled}
              style={inp(disabled)}
            />
          </div>

          {/* Gender */}
          <div style={group}>
            <label style={lbl}>Gender Preference</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              disabled={disabled}
              style={inp(disabled)}
            >
              <option>Any</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          {/* Description */}
          <div style={{ gridColumn: "1/-1" }}>
            <label style={lbl}>Job Description</label>
            <textarea
              name="description"
              rows={5}
              value={form.description}
              onChange={handleChange}
              disabled={disabled}
              style={{ ...inp(disabled), resize: "vertical" }}
            />
            {errors.description && <p style={err}>{errors.description}</p>}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={disabled}
          style={{ ...submitBtn, ...(disabled && submitDisabled) }}
        >
          Post Job
        </button>

        {showSuccess && (
          <div style={successMsg}>🎉 Job posted successfully!</div>
        )}
      </form>

      {/* ---------- LOGIN MODAL ---------- */}
      {showLogin && (
        <div style={overlay} onClick={() => setShowLogin(false)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeader}>
              <div style={modalIcon}>M</div>
              <div>
                <h3 style={{ margin: 0, color: "#111" }}>Recruiter Login</h3>
                <p style={{ color: "#666", margin: 0, fontSize: 14 }}>
                  Sign in to post jobs
                </p>
              </div>
              <button style={closeBtn} onClick={() => setShowLogin(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={doLogin}>
              <div style={{ marginBottom: 12 }}>
                <label style={lblSmall}>Email</label>
                <input
                  value={login.email}
                  onChange={(e) =>
                    setLogin({ ...login, email: e.target.value })
                  }
                  style={inp(false)}
                  type="email"
                  required
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={lblSmall}>Password</label>
                <input
                  value={login.password}
                  onChange={(e) =>
                    setLogin({ ...login, password: e.target.value })
                  }
                  style={inp(false)}
                  type="password"
                  required
                />
              </div>

              {loginErr && <div style={errBanner}>{loginErr}</div>}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" style={btnSecondary} onClick={() => setShowLogin(false)}>
                  Cancel
                </button>
                <button type="submit" style={btnPrimary}>
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------- */
/*              STYLES (NOTION)              */
/* ----------------------------------------- */

const page = {
  padding: "40px 6%",
  maxWidth: 1000,
  margin: "0 auto",
};

const title = {
  fontSize: "2rem",
  fontWeight: 800,
  color: "#0a66c2",
  marginBottom: 4,
};

const headerRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 30,
};

const chipWarn = {
  padding: "6px 12px",
  background: "#fee2e2",
  color: "#991b1b",
  borderRadius: 999,
  fontWeight: 700,
  fontSize: 12,
};

const chipOk = {
  padding: "6px 12px",
  background: "#dbeafe",
  color: "#1e3a8a",
  borderRadius: 999,
  fontWeight: 700,
  fontSize: 12,
};

const calloutBox = {
  border: "1px solid #dbeafe",
  background: "#f0f7ff",
  padding: 16,
  borderRadius: 12,
  marginBottom: 30,
};

const dotBlue = {
  width: 10,
  height: 10,
  borderRadius: "50%",
  background: "#0a66c2",
};

const formCard = {
  background: "#fff",
  padding: 35,
  borderRadius: 16,
  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: 24,
};

const group = { display: "flex", flexDirection: "column" };

const lbl = { fontWeight: 700, marginBottom: 6, color: "#374151" };
const lblSmall = { fontWeight: 700, marginBottom: 4, color: "#374151", fontSize: 14 };

const inp = (disabled) => ({
  padding: "12px 14px",
  borderRadius: 8,
  border: "1px solid #e5e7eb",
  fontSize: "1rem",
  background: disabled ? "#f9fafb" : "#fff",
  color: disabled ? "#9ca3af" : "#111",
});

const err = { color: "red", fontSize: 13, marginTop: 4 };

const checkGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
  marginTop: 10,
};

const checkLabel = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  background: "#f9fafb",
  border: "1px solid #e5e7eb",
  padding: "8px 12px",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 14,
};

const submitBtn = {
  marginTop: 30,
  padding: "14px 24px",
  borderRadius: 10,
  fontWeight: 700,
  border: "none",
  fontSize: "1rem",
  background: "#0a66c2",
  color: "#fff",
  cursor: "pointer",
};

const submitDisabled = {
  background: "#cbd5e1",
  cursor: "not-allowed",
};

const successMsg = {
  marginTop: 20,
  textAlign: "center",
  fontWeight: 700,
  color: "green",
};

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 16,
  zIndex: 1000,
};

const modal = {
  background: "#fff",
  padding: 24,
  borderRadius: 14,
  width: "90%",
  maxWidth: 420,
  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
};

const modalHeader = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 20,
};

const modalIcon = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  background: "#0a66c2",
  color: "#fff",
  display: "grid",
  placeItems: "center",
  fontWeight: 800,
};

const closeBtn = {
  marginLeft: "auto",
  background: "#f3f4f6",
  border: "none",
  borderRadius: 8,
  width: 32,
  height: 32,
  cursor: "pointer",
};

const errBanner = {
  background: "#fee2e2",
  border: "1px solid #fecaca",
  color: "#b91c1c",
  padding: "10px",
  fontSize: 14,
  borderRadius: 8,
  marginBottom: 10,
};

const btnPrimary = {
  padding: "10px 16px",
  background: "#0a66c2",
  border: "none",
  color: "#fff",
  borderRadius: 8,
  fontWeight: 700,
  cursor: "pointer",
};

const btnSecondary = {
  padding: "10px 16px",
  background: "#eef2f7",
  border: "none",
  borderRadius: 8,
  fontWeight: 700,
  cursor: "pointer",
};
