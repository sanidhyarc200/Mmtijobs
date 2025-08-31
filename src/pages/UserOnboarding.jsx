import React, { useState } from 'react';

/* --- Stable Field component (outside!) --- */
const Field = ({
  styles, label, name, type = 'text', full = false, required = true,
  placeholder, value, error, onChange, autoComplete, inputMode, accept
}) => (
  <div style={full ? styles.groupFull : styles.group}>
    <div style={styles.labelRow}>
      <label style={styles.label}>{label}{required ? ' *' : ''}</label>
      {!required && <span style={styles.optional}>Optional</span>}
    </div>
    <input
      type={type}
      name={name}
      value={type === 'file' ? undefined : value}
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
    // Step 1
    firstName: '', middleName: '', lastName: '', contact: '', email: '',
    // Step 2
    degree: '', passout: '', experience: '', techstack: '',
    // Step 3
    lastSalary: '', currentSalary: '', location: '', noticePeriod: '',
    // Step 4
    cv: null, description: '', skills: '',
    // Step 5
    username: '', password: '', confirmPassword: '',
  });

  // ---------- Handlers ----------
  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? (files && files[0] ? files[0] : null) : value
    }));
    if (errors[name]) {
      const next = { ...errors };
      delete next[name];
      setErrors(next);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    const f = formData;
    const isNum = (v) => !isNaN(parseFloat(v)) && isFinite(v);

    switch (step) {
      case 1:
        if (!f.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!f.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!/^[0-9]{10}$/.test(f.contact || '')) newErrors.contact = 'Enter 10-digit contact number';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email || '')) newErrors.email = 'Enter a valid email';
        break;

      case 2:
        if (!f.degree.trim()) newErrors.degree = 'Degree is required';
        const year = parseInt(f.passout, 10);
        if (!year || year < 1990 || year > new Date().getFullYear()) newErrors.passout = 'Enter a valid year';
        if (!f.experience.trim() || !isNum(f.experience)) newErrors.experience = 'Enter experience in years';
        if (!f.techstack.trim()) newErrors.techstack = 'Tech stack is required';
        break;

      case 3:
        if (!isNum(f.lastSalary)) newErrors.lastSalary = 'Enter numeric value';
        if (!isNum(f.currentSalary)) newErrors.currentSalary = 'Enter numeric value';
        if (!f.location.trim()) {
          newErrors.location = 'Location required';
        } else if (/^\d+$/.test(f.location.trim())) {
          newErrors.location = 'Location cannot be only numbers';
        }
        if (!f.noticePeriod.trim()) newErrors.noticePeriod = 'Notice period required';
        break;

      case 4:
        if (!f.skills.trim()) newErrors.skills = 'Skills required';
        if (!f.description.trim()) newErrors.description = 'Description required';
        if (!f.cv) {
          newErrors.cv = 'Resume upload required';
        } else {
          const okTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ];
          if (!okTypes.includes(f.cv.type)) newErrors.cv = 'Upload PDF/DOC/DOCX only';
          if (f.cv.size > 5 * 1024 * 1024) newErrors.cv = 'File must be ≤ 5MB';
        }
        break;

      case 5:
        if (!f.username.trim()) newErrors.username = 'Username required';
        if (!f.password.trim()) {
          newErrors.password = 'Password is required';
        } else if (f.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        } else if (!/[A-Z]/.test(f.password)) {
          newErrors.password = 'Password must contain at least one uppercase letter';
        } else if (!/[a-z]/.test(f.password)) {
          newErrors.password = 'Password must contain at least one lowercase letter';
        } else if (!/[0-9]/.test(f.password)) {
          newErrors.password = 'Password must contain at least one number';
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(f.password)) {
          newErrors.password = 'Password must contain at least one special character';
        }
        if (f.password !== f.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        break;
      default: break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goToStep = (step) => {
    if (step > currentStep && !validateStep(currentStep)) return;
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateStep(5)) return;

    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // 🚫 Duplicate email
    if (users.some(u => u.email?.toLowerCase() === formData.email.trim().toLowerCase())) {
      setErrors({ email: "This email is already registered. Please login instead." });
      return;
    }

    // 🚫 Duplicate mobile
    if (users.some(u => u.contact === formData.contact.trim())) {
      setErrors({ contact: "This mobile number is already registered." });
      return;
    }

    // ✅ Save all fields
    const newUser = {
      id: Date.now(),
      userType: "applicant",
      ...formData,
      confirmPassword: undefined,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    setShowSuccessModal(true);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    window.location.href = '/';
  };

  // ---------- Styles ----------
  const styles = {
    container: { fontFamily: "'Inter', system-ui, sans-serif", background: '#f3f4f6', minHeight: '100vh', padding: '28px 16px' },
    shell: { maxWidth: '860px', margin: '0 auto' },
    card: { background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', boxShadow: '0 14px 40px rgba(10,102,194,0.08)', overflow: 'hidden' },
    header: { padding: '20px 24px', background: 'linear-gradient(135deg, #0a66c2 0%, #0a66c2 60%, #004182 100%)', color: '#fff' },
    title: { margin: 0, fontSize: 22, fontWeight: 800 },
    sub: { margin: '6px 0 0', opacity: 0.9, fontWeight: 500 },
    progressWrap: { background: 'rgba(255,255,255,0.25)', height: 6, borderRadius: 999, marginTop: 14, overflow: 'hidden' },
    progressBar: (pct) => ({ width: `${pct}%`, height: '100%', background: '#fff', borderRadius: 999, transition: 'width .25s ease' }),
    body: { padding: '22px 24px' },
    stepDots: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 18 },
    dot: (active) => ({ width: 10, height: 10, borderRadius: '50%', background: active ? '#0a66c2' : '#d1d5db' }),
    grid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '18px 24px' },
    group: { display: 'flex', flexDirection: 'column' },
    groupFull: { display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' },
    labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
    label: { marginBottom: 6, fontWeight: 700, color: '#374151' },
    optional: { color: '#6b7280', fontWeight: 600, fontSize: 12 },
    input: { padding: '12px 12px', borderRadius: 10, border: '1px solid #d1d5db', background: '#fff', fontSize: '1rem' },
    inputError: { borderColor: '#ef4444', boxShadow: '0 0 0 3px rgba(239,68,68,.12)' },
    textarea: { padding: '12px 12px', borderRadius: 10, border: '1px solid #d1d5db', minHeight: 110, resize: 'vertical' },
    error: { color: '#ef4444', fontSize: 13, marginTop: 6 },
    actionsSplit: { display: 'flex', justifyContent: 'space-between', marginTop: 24 },
    actionsEndOnly: { display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 },
    btn: { border: 0, padding: '12px 22px', borderRadius: 10, fontWeight: 800, cursor: 'pointer', fontSize: '1rem' },
    btnPrimary: { background: 'linear-gradient(135deg, #0a66c2, #004182)', color: '#fff' },
    btnGhost: { background: '#eef2f6', color: '#1f2937' },
    successBackdrop: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 },
    successBox: { background: '#fff', width: '90%', maxWidth: 420, borderRadius: 16, border: '1px solid #e5e7eb', boxShadow: '0 24px 60px rgba(0,0,0,.25)', padding: 26, textAlign: 'center' },
    successTitle: { color: '#059669', fontSize: 22, fontWeight: 800, marginBottom: 10 },
    successText: { color: '#374151', marginBottom: 18 }
  };

  const pct = Math.round((currentStep / TOTAL_STEPS) * 100);

  return (
    <div style={styles.container}>
      <div style={styles.shell}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h2 style={styles.title}>User Onboarding</h2>
            <p style={styles.sub}>Tell us a bit about you so we can match the best roles.</p>
            <div style={styles.progressWrap}><div style={styles.progressBar(pct)} /></div>
          </div>

          <form onSubmit={handleSubmit} style={styles.body}>
            <div style={styles.stepDots}>
              {[1,2,3,4,5].map(n => <span key={n} style={styles.dot(currentStep === n)} />)}
            </div>

            {/* Step 1 */}
            {currentStep === 1 && (
              <>
                <div style={styles.grid}>
                  <Field styles={styles} label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} error={errors.firstName} placeholder="e.g. Aisha" />
                  <Field styles={styles} label="Middle Name" name="middleName" required={false} value={formData.middleName} onChange={handleInputChange} error={errors.middleName} placeholder="(optional)" />
                  <Field styles={styles} label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} error={errors.lastName} placeholder="e.g. Khan" />
                  <Field styles={styles} label="Contact Number" name="contact" value={formData.contact} onChange={handleInputChange} error={errors.contact} placeholder="10-digit mobile" />
                  <Field styles={styles} label="Email ID" name="email" type="email" full value={formData.email} onChange={handleInputChange} error={errors.email} placeholder="you@company.com" />
                </div>
                <div style={styles.actionsEndOnly}>
                  <button type="button" style={{ ...styles.btn, ...styles.btnPrimary }} onClick={() => goToStep(2)}>Next →</button>
                </div>
              </>
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <>
                <div style={styles.grid}>
                  <Field styles={styles} label="Degree" name="degree" value={formData.degree} onChange={handleInputChange} error={errors.degree} placeholder="e.g. B.Tech, B.Sc" />
                  <Field styles={styles} label="Passout Year" name="passout" value={formData.passout} onChange={handleInputChange} error={errors.passout} placeholder="e.g. 2022" />
                  <Field styles={styles} label="Experience (years)" name="experience" value={formData.experience} onChange={handleInputChange} error={errors.experience} placeholder="e.g. 2" />
                  <Field styles={styles} label="Tech Stack" name="techstack" value={formData.techstack} onChange={handleInputChange} error={errors.techstack} placeholder="e.g. React, Node, SQL" />
                </div>
                <div style={styles.actionsSplit}>
                  <button type="button" style={{ ...styles.btn, ...styles.btnGhost }} onClick={() => goToStep(1)}>← Previous</button>
                  <button type="button" style={{ ...styles.btn, ...styles.btnPrimary }} onClick={() => goToStep(3)}>Next →</button>
                </div>
              </>
            )}

            {/* Step 3 */}
            {currentStep === 3 && (
              <>
                <div style={styles.grid}>
                  <Field styles={styles} label="Last Salary" name="lastSalary" value={formData.lastSalary} onChange={handleInputChange} error={errors.lastSalary} placeholder="e.g. 6 LPA" />
                  <Field styles={styles} label="Expected Salary" name="currentSalary" value={formData.currentSalary} onChange={handleInputChange} error={errors.currentSalary} placeholder="e.g. 8 LPA" />
                  <Field styles={styles} label="Location" name="location" value={formData.location} onChange={handleInputChange} error={errors.location} placeholder="e.g. Bengaluru" />
                  <Field styles={styles} label="Notice Period" name="noticePeriod" value={formData.noticePeriod} onChange={handleInputChange} error={errors.noticePeriod} placeholder="e.g. 30 days" />
                </div>
                <div style={styles.actionsSplit}>
                  <button type="button" style={{ ...styles.btn, ...styles.btnGhost }} onClick={() => goToStep(2)}>← Previous</button>
                  <button type="button" style={{ ...styles.btn, ...styles.btnPrimary }} onClick={() => goToStep(4)}>Next →</button>
                </div>
              </>
            )}

            {/* Step 4 */}
            {currentStep === 4 && (
              <>
                <div style={styles.grid}>
                  <Field styles={styles} label="Skills" name="skills" value={formData.skills} onChange={handleInputChange} error={errors.skills} placeholder="e.g. React, Redux, REST, Docker" />
                  <div style={styles.groupFull}>
                    <div style={styles.labelRow}><label style={styles.label}>Description *</label></div>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Brief about your experience, projects, and impact." style={{ ...styles.textarea, ...(errors.description ? styles.inputError : {}) }} required />
                    {errors.description && <span style={styles.error}>{errors.description}</span>}
                  </div>
                  <div style={styles.groupFull}>
                    <div style={styles.labelRow}><label style={styles.label}>Upload Resume (PDF/DOC/DOCX) *</label></div>
                    <input type="file" name="cv" onChange={handleInputChange} accept=".pdf,.doc,.docx" style={{ ...styles.input, padding: '10px', ...(errors.cv ? styles.inputError : {}) }} required />
                    {errors.cv && <span style={styles.error}>{errors.cv}</span>}
                    {formData.cv && !errors.cv && <span style={{ color: '#0a66c2', fontSize: 13 }}>Selected: {formData.cv.name}</span>}
                  </div>
                </div>
                <div style={styles.actionsSplit}>
                  <button type="button" style={{ ...styles.btn, ...styles.btnGhost }} onClick={() => goToStep(3)}>← Previous</button>
                  <button type="button" style={{ ...styles.btn, ...styles.btnPrimary }} onClick={() => goToStep(5)}>Next →</button>
                </div>
              </>
            )}

            {/* Step 5 */}
            {currentStep === 5 && (
              <>
                <div style={styles.grid}>
                  <Field styles={styles} label="Username" name="username" value={formData.username} onChange={handleInputChange} error={errors.username} placeholder="Choose a username" />
                  <Field styles={styles} label="Password" name="password" type="password" value={formData.password} onChange={handleInputChange} error={errors.password} placeholder="Strong password" />
                  <Field styles={styles} label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} error={errors.confirmPassword} placeholder="Re-enter password" />
                </div>
                <div style={styles.actionsSplit}>
                  <button type="button" style={{ ...styles.btn, ...styles.btnGhost }} onClick={() => goToStep(4)}>← Previous</button>
                  <button type="submit" style={{ ...styles.btn, ...styles.btnPrimary }}>Submit ✓</button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>

      {/* Success modal */}
      {showSuccessModal && (
        <div style={styles.successBackdrop}>
          <div style={styles.successBox}>
            <h2 style={styles.successTitle}>🎉 Registration Successful!</h2>
            <p style={styles.successText}>Your profile has been created. You can now apply to roles that fit you best.</p>
            <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={handleSuccessClose}>Continue to Home</button>
          </div>
        </div>
      )}
    </div>
  );
}
