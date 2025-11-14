import React, { useState } from "react";

/* ------------------ FIELD COMPONENT ------------------ */
const Field = ({
  styles,
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
  <div style={full ? styles.groupFull : styles.group}>
    <div style={styles.labelRow}>
      <label style={styles.label}>
        {label}
        {required ? " *" : ""}
      </label>
      {!required && <span style={styles.optional}>Optional</span>}
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
      style={{ ...styles.input, ...(error ? styles.inputError : {}) }}
      required={required}
    />
    {error && <span style={styles.error}>{error}</span>}
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
    const isNum = (v) => !isNaN(parseFloat(v)) && isFinite(v);

    switch (step) {
      case 1:
        if (!f.profilePic) newErrors.profilePic = "Profile picture is required.";
        if (!f.firstName.trim()) newErrors.firstName = "First name required";
        if (!f.lastName.trim()) newErrors.lastName = "Last name required";
        if (!/^[0-9]{10}$/.test(f.contact || ""))
          newErrors.contact = "Enter 10-digit contact number";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email || ""))
          newErrors.email = "Enter a valid email";
        break;

      case 2:
        if (!f.degree.trim()) newErrors.degree = "Degree is required";
        const year = parseInt(f.passout, 10);
        if (!year || year < 1990 || year > new Date().getFullYear())
          newErrors.passout = "Enter valid year";
        if (!f.experience.trim() || !isNum(f.experience))
          newErrors.experience = "Enter years";
        if (!f.techstack.trim()) newErrors.techstack = "Tech stack required";
        break;

      case 3:
        if (!isNum(f.lastSalary)) newErrors.lastSalary = "Enter numeric";
        if (!isNum(f.currentSalary)) newErrors.currentSalary = "Enter numeric";
        if (!f.location.trim()) newErrors.location = "Location required";
        if (!f.noticePeriod.trim()) newErrors.noticePeriod = "Required";
        break;

      case 4:
        if (!f.skills.trim()) newErrors.skills = "Skills required";
        if (!f.description.trim())
          newErrors.description = "Description required";
        if (!f.cv) newErrors.cv = "Resume required";
        break;

      case 5:
        if (!f.username.trim()) newErrors.username = "Username required";
        if (!f.password.trim()) newErrors.password = "Password required";
        if (f.password.length < 8)
          newErrors.password = "Min 8 characters";
        if (f.password !== f.confirmPassword)
          newErrors.confirmPassword = "Passwords mismatch";
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

  /* ------------------ STYLES ------------------ */
  const BLUE = "#0a66c2";

  const styles = {
    container: {
      fontFamily: "'Inter', sans-serif",
      background: "#f3f4f6",
      minHeight: "100vh",
      padding: "28px 16px",
    },
    shell: { maxWidth: "860px", margin: "0 auto" },
    card: {
      background: "#fff",
      borderRadius: 16,
      border: "1px solid #e5e7eb",
      boxShadow: "0 14px 40px rgba(10,102,194,0.08)",
      overflow: "hidden",
    },
    header: {
      padding: "20px 24px",
      background:
        "linear-gradient(135deg, #0a66c2 0%, #0a66c2 60%, #004182 100%)",
      color: "#fff",
    },
    title: { margin: 0, fontSize: 22, fontWeight: 800 },
    sub: { margin: "6px 0 0", opacity: 0.9, fontWeight: 500 },
    progressWrap: {
      background: "rgba(255,255,255,0.25)",
      height: 6,
      borderRadius: 999,
      marginTop: 14,
      overflow: "hidden",
    },
    progressBar: (pct) => ({
      width: `${pct}%`,
      height: "100%",
      background: "#fff",
      borderRadius: 999,
      transition: "width .25s ease",
    }),

    /* Input grid + fields */
    body: { padding: "22px 24px" },
    stepDots: {
      display: "flex",
      gap: 8,
      alignItems: "center",
      marginBottom: 18,
    },
    dot: (active) => ({
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: active ? BLUE : "#d1d5db",
    }),
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: "18px 24px",
    },
    group: { display: "flex", flexDirection: "column" },
    groupFull: {
      display: "flex",
      flexDirection: "column",
      gridColumn: "1 / -1",
    },
    labelRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
    },
    label: { marginBottom: 6, fontWeight: 700, color: "#374151" },
    optional: { color: "#6b7280", fontWeight: 600, fontSize: 12 },
    input: {
      padding: "12px 12px",
      borderRadius: 10,
      border: "1px solid #d1d5db",
      background: "#fff",
      fontSize: "1rem",
    },
    inputError: {
      borderColor: "#ef4444",
      boxShadow: "0 0 0 3px rgba(239, 68, 68, .12)",
    },
    error: { color: "#ef4444", fontSize: 13, marginTop: 6 },

    /* Buttons */
    actionsEndOnly: {
      display: "flex",
      justifyContent: "flex-end",
      marginTop: 24,
    },
    actionsSplit: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: 24,
    },
    btn: {
      border: 0,
      padding: "12px 22px",
      borderRadius: 10,
      fontWeight: 800,
      cursor: "pointer",
      fontSize: "1rem",
    },
    btnPrimary: {
      background: "linear-gradient(135deg, #0a66c2, #004182)",
      color: "#fff",
    },
    btnGhost: { background: "#eef2f6", color: "#1f2937" },

    /* Profile pic card */
    picCard: {
      gridColumn: "1 / -1",
      background: "#ffffff",
      borderRadius: 16,
      padding: 24,
      boxShadow: "0 8px 25px rgba(10,102,194,0.08)",
      textAlign: "center",
      marginBottom: 20,
    },
    picPreview: {
      width: 120,
      height: 120,
      borderRadius: "50%",
      objectFit: "cover",
      border: "4px solid #fff",
      boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
      marginBottom: 12,
      background: "#f3f4f6",
    },
    successBackdrop: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: 16,
    },
    successBox: {
      background: "#fff",
      width: "90%",
      maxWidth: 420,
      borderRadius: 16,
      border: "1px solid #e5e7eb",
      boxShadow: "0 24px 60px rgba(0,0,0,.25)",
      padding: 26,
      textAlign: "center",
    },
  };

  const pct = Math.round((currentStep / TOTAL_STEPS) * 100);
  return (
    <div style={styles.container}>
      <div style={styles.shell}>
        <div style={styles.card}>
          {/* ------------------ HEADER ------------------ */}
          <div style={styles.header}>
            <h2 style={styles.title}>User Onboarding</h2>
            <p style={styles.sub}>
              Tell us a bit about yourself so we can match you with the best roles.
            </p>
            <div style={styles.progressWrap}>
              <div style={styles.progressBar(pct)} />
            </div>
          </div>

          {/* ------------------ FORM BODY ------------------ */}
          <form onSubmit={handleSubmit} style={styles.body}>
            {/* Step Dots */}
            <div style={styles.stepDots}>
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} style={styles.dot(currentStep === n)} />
              ))}
            </div>

            {/* ======================= STEP 1 ======================= */}
            {currentStep === 1 && (
              <>
                {/* Profile Pic Card */}
                <div style={styles.picCard}>
                  <img
                    src={
                      formData.profilePicPreview ||
                      "https://i.ibb.co/tLxcP8w/blank-avatar.png"
                    }
                    alt="Avatar Preview"
                    style={styles.picPreview}
                  />

                  <div>
                    <label
                      style={{
                        fontWeight: 700,
                        color: "#374151",
                        marginBottom: 6,
                        display: "block",
                      }}
                    >
                      Upload Profile Picture *
                    </label>

                    <input
                      type="file"
                      name="profilePic"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleInputChange}
                      style={{ ...styles.input, padding: "10px" }}
                    />

                    {errors.profilePic && (
                      <div style={styles.error}>{errors.profilePic}</div>
                    )}
                  </div>
                </div>

                <div style={styles.grid}>
                  <Field
                    styles={styles}
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    error={errors.firstName}
                    placeholder="e.g. Aisha"
                  />
                  <Field
                    styles={styles}
                    label="Middle Name"
                    name="middleName"
                    required={false}
                    value={formData.middleName}
                    onChange={handleInputChange}
                    error={errors.middleName}
                    placeholder="(optional)"
                  />
                  <Field
                    styles={styles}
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    error={errors.lastName}
                    placeholder="e.g. Khan"
                  />
                  <Field
                    styles={styles}
                    label="Contact Number"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    error={errors.contact}
                    placeholder="10-digit mobile"
                  />
                  <Field
                    styles={styles}
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

                <div style={styles.actionsEndOnly}>
                  <button
                    type="button"
                    style={{ ...styles.btn, ...styles.btnPrimary }}
                    onClick={() => goToStep(2)}
                  >
                    Next →
                  </button>
                </div>
              </>
            )}

            {/* ======================= STEP 2 ======================= */}
            {currentStep === 2 && (
              <>
                <div style={styles.grid}>
                  <Field
                    styles={styles}
                    label="Degree"
                    name="degree"
                    value={formData.degree}
                    onChange={handleInputChange}
                    error={errors.degree}
                    placeholder="e.g. B.Tech, BCA"
                  />
                  <Field
                    styles={styles}
                    label="Passout Year"
                    name="passout"
                    value={formData.passout}
                    onChange={handleInputChange}
                    error={errors.passout}
                    placeholder="e.g. 2023"
                  />
                  <Field
                    styles={styles}
                    label="Experience (years)"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    error={errors.experience}
                    placeholder="e.g. 1"
                  />
                  <Field
                    styles={styles}
                    label="Tech Stack"
                    name="techstack"
                    value={formData.techstack}
                    onChange={handleInputChange}
                    error={errors.techstack}
                    placeholder="e.g. React, Node.js"
                  />
                </div>

                <div style={styles.actionsSplit}>
                  <button
                    type="button"
                    style={{ ...styles.btn, ...styles.btnGhost }}
                    onClick={() => goToStep(1)}
                  >
                    ← Previous
                  </button>
                  <button
                    type="button"
                    style={{ ...styles.btn, ...styles.btnPrimary }}
                    onClick={() => goToStep(3)}
                  >
                    Next →
                  </button>
                </div>
              </>
            )}

            {/* ======================= STEP 3 ======================= */}
            {currentStep === 3 && (
              <>
                <div style={styles.grid}>
                  <Field
                    styles={styles}
                    label="Last Salary"
                    name="lastSalary"
                    value={formData.lastSalary}
                    onChange={handleInputChange}
                    error={errors.lastSalary}
                    placeholder="e.g. 6 LPA"
                  />
                  <Field
                    styles={styles}
                    label="Expected Salary"
                    name="currentSalary"
                    value={formData.currentSalary}
                    onChange={handleInputChange}
                    error={errors.currentSalary}
                    placeholder="e.g. 8 LPA"
                  />
                  <Field
                    styles={styles}
                    label="Preferred Location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    error={errors.location}
                    placeholder="e.g. Bengaluru"
                  />
                  <Field
                    styles={styles}
                    label="Notice Period"
                    name="noticePeriod"
                    value={formData.noticePeriod}
                    onChange={handleInputChange}
                    error={errors.noticePeriod}
                    placeholder="e.g. 30 days"
                  />
                </div>

                <div style={styles.actionsSplit}>
                  <button
                    type="button"
                    style={{ ...styles.btn, ...styles.btnGhost }}
                    onClick={() => goToStep(2)}
                  >
                    ← Previous
                  </button>
                  <button
                    type="button"
                    style={{ ...styles.btn, ...styles.btnPrimary }}
                    onClick={() => goToStep(4)}
                  >
                    Next →
                  </button>
                </div>
              </>
            )}

            {/* ======================= STEP 4 ======================= */}
            {currentStep === 4 && (
              <>
                <div style={styles.grid}>
                  <Field
                    styles={styles}
                    label="Skills"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    error={errors.skills}
                    placeholder="e.g. React, Docker, REST APIs"
                  />

                  {/* Description */}
                  <div style={styles.groupFull}>
                    <div style={styles.labelRow}>
                      <label style={styles.label}>Description *</label>
                    </div>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Brief about your experience, job responsibilities, and achievements."
                      style={{
                        padding: "12px",
                        borderRadius: 10,
                        border: "1px solid #d1d5db",
                        minHeight: 110,
                        resize: "vertical",
                        ...(errors.description ? styles.inputError : {}),
                      }}
                      required
                    />
                    {errors.description && (
                      <span style={styles.error}>{errors.description}</span>
                    )}
                  </div>

                  {/* Resume upload */}
                  <div style={styles.groupFull}>
                    <div style={styles.labelRow}>
                      <label style={styles.label}>
                        Upload Resume (PDF/DOC/DOCX) *
                      </label>
                    </div>

                    <input
                      type="file"
                      name="cv"
                      accept=".pdf,.doc,.docx"
                      onChange={handleInputChange}
                      style={{
                        ...styles.input,
                        padding: "10px",
                        ...(errors.cv ? styles.inputError : {}),
                      }}
                      required
                    />

                    {errors.cv && (
                      <span style={styles.error}>{errors.cv}</span>
                    )}
                    {formData.cv && !errors.cv && (
                      <span style={{ color: BLUE, fontSize: 13 }}>
                        Selected: {formData.cv.name}
                      </span>
                    )}
                  </div>
                </div>

                <div style={styles.actionsSplit}>
                  <button
                    type="button"
                    style={{ ...styles.btn, ...styles.btnGhost }}
                    onClick={() => goToStep(3)}
                  >
                    ← Previous
                  </button>
                  <button
                    type="button"
                    style={{ ...styles.btn, ...styles.btnPrimary }}
                    onClick={() => goToStep(5)}
                  >
                    Next →
                  </button>
                </div>
              </>
            )}

            {/* ======================= STEP 5 ======================= */}
            {currentStep === 5 && (
              <>
                <div style={styles.grid}>
                  <Field
                    styles={styles}
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    error={errors.username}
                    placeholder="Choose a username"
                  />

                  <Field
                    styles={styles}
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    error={errors.password}
                    placeholder="Strong password"
                  />

                  <Field
                    styles={styles}
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    error={errors.confirmPassword}
                    placeholder="Re-enter password"
                  />
                </div>

                <div style={styles.actionsSplit}>
                  <button
                    type="button"
                    style={{ ...styles.btn, ...styles.btnGhost }}
                    onClick={() => goToStep(4)}
                  >
                    ← Previous
                  </button>
                  <button
                    type="submit"
                    style={{ ...styles.btn, ...styles.btnPrimary }}
                  >
                    Submit ✓
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>

      {/* ------------------ SUCCESS MODAL ------------------ */}
      {showSuccessModal && (
        <div style={styles.successBackdrop}>
          <div style={styles.successBox}>
            <h2
              style={{
                color: "#059669",
                fontSize: 22,
                fontWeight: 800,
                marginBottom: 10,
              }}
            >
              🎉 Registration Successful!
            </h2>
            <p style={{ color: "#374151", marginBottom: 18 }}>
              Your profile has been created. You can now apply to jobs.
            </p>

            <button
              style={{ ...styles.btn, ...styles.btnPrimary }}
              onClick={() => (window.location.href = "/")}
            >
              Continue to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


