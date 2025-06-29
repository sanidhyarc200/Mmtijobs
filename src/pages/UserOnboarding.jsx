import React, { useState } from 'react';

export default function UserOnboarding() {
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

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    let isValid = true;
    const f = formData;

    switch (step) {
      case 1:
        if (!f.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!f.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!f.contact.trim() || !/^[0-9]{10}$/.test(f.contact)) newErrors.contact = 'Valid contact is required';
        if (!f.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) newErrors.email = 'Valid email is required';
        break;
      case 2:
        if (!f.degree.trim()) newErrors.degree = 'Degree is required';
        const year = parseInt(f.passout);
        if (!f.passout.trim() || isNaN(year) || year < 1990 || year > new Date().getFullYear())
          newErrors.passout = 'Valid passout year required';
        if (!f.experience.trim()) newErrors.experience = 'Experience is required';
        if (!f.techstack.trim()) newErrors.techstack = 'Tech stack is required';
        break;
      case 3:
        if (!f.lastSalary.trim()) newErrors.lastSalary = 'Last salary required';
        if (!f.currentSalary.trim()) newErrors.currentSalary = 'Expected salary required';
        if (!f.location.trim()) newErrors.location = 'Location required';
        if (!f.noticePeriod.trim()) newErrors.noticePeriod = 'Notice period required';
        break;
      case 4:
        if (!f.description.trim()) newErrors.description = 'Description required';
        if (!f.skills.trim()) newErrors.skills = 'Skills required';
        break;
      case 5:
        if (!f.username.trim()) newErrors.username = 'Username required';
        if (!f.password.trim() || f.password.length < 6) newErrors.password = 'Password must be at least 6 chars';
        if (f.password !== f.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goToStep = (step) => {
    if (step > currentStep && !validateStep(currentStep)) return;
    setCurrentStep(step);
    window.scrollTo(0, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateStep(5)) return;

    // Store user in localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push({
      username: formData.username,
      password: formData.password,
      fullName: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      contact: formData.contact,
    });
    localStorage.setItem('users', JSON.stringify(users));

    setShowSuccessModal(true);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    window.location.href = '/';
  };

  const styles = {
    container: { fontFamily: "'Inter', sans-serif", backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '20px 0' },
    modal: { backgroundColor: 'white', padding: '30px 40px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', width: '90%', maxWidth: '700px', margin: '0 auto' },
    modalTitle: { marginBottom: '25px', color: '#0a66c2', fontWeight: 700, fontSize: '1.5em' },
    stepIndicator: { display: 'flex', justifyContent: 'center', marginBottom: '30px', gap: '10px' },
    stepDot: { width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#e5e7eb' },
    stepDotActive: { width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#0a66c2' },
    formStep: { display: 'none' },
    formStepActive: { display: 'block' },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px 30px' },
    formGroup: { display: 'flex', flexDirection: 'column' },
    formGroupFull: { display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' },
    label: { marginBottom: '6px', fontWeight: 600, color: '#374151' },
    input: { padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '1em' },
    inputError: { borderColor: '#ef4444' },
    textarea: { padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '1em', minHeight: '100px', resize: 'vertical' },
    textareaError: { borderColor: '#ef4444' },
    errorText: { color: '#ef4444', fontSize: '0.85em', marginTop: '5px' },
    btnGroup: { marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '15px' },
    btn: { backgroundColor: '#0a66c2', color: 'white', padding: '12px 28px', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '1em' },
    btnDisabled: { backgroundColor: '#9ca3af', cursor: 'not-allowed' },
    successModal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    successBox: { background: '#fff', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' },
    successTitle: { color: '#059669', fontSize: '1.5em', marginBottom: '15px' },
    successText: { color: '#374151', marginBottom: '25px' }
  };

  const renderField = (label, name, type = 'text', isFull = false) => (
    <div style={isFull ? styles.formGroupFull : styles.formGroup}>
      <label style={styles.label}>{label} *</label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        style={{ ...styles.input, ...(errors[name] && styles.inputError) }}
        required
      />
      {errors[name] && <span style={styles.errorText}>{errors[name]}</span>}
    </div>
  );

  return (
    <div style={styles.container}>
      <section>
        <div style={styles.modal}>
          <h2 style={styles.modalTitle}>User Onboarding</h2>
          <div style={styles.stepIndicator}>
            {[1, 2, 3, 4, 5].map(step => (
              <div key={step} style={currentStep === step ? styles.stepDotActive : styles.stepDot} />
            ))}
          </div>
          <form onSubmit={handleSubmit}>
            {/* Step 1 */}
            <div style={currentStep === 1 ? styles.formStepActive : styles.formStep}>
              <div style={styles.formGrid}>
                {renderField('First Name', 'firstName')}
                {renderField('Middle Name', 'middleName')}
                {renderField('Last Name', 'lastName')}
                {renderField('Contact Number', 'contact')}
                {renderField('Email ID', 'email')}
              </div>
              <div style={styles.btnGroup}>
                <button type="button" style={styles.btn} onClick={() => goToStep(2)}>Next</button>
              </div>
            </div>

            {/* Step 2 */}
            <div style={currentStep === 2 ? styles.formStepActive : styles.formStep}>
              <div style={styles.formGrid}>
                {renderField('Degree', 'degree')}
                {renderField('Passout Year', 'passout', 'number')}
                {renderField('Experience', 'experience')}
                {renderField('Tech Stack', 'techstack')}
              </div>
              <div style={styles.btnGroup}>
                <button type="button" style={styles.btn} onClick={() => goToStep(1)}>Previous</button>
                <button type="button" style={styles.btn} onClick={() => goToStep(3)}>Next</button>
              </div>
            </div>

            {/* Step 3 */}
            <div style={currentStep === 3 ? styles.formStepActive : styles.formStep}>
              <div style={styles.formGrid}>
                {renderField('Last Salary', 'lastSalary')}
                {renderField('Expected Salary', 'currentSalary')}
                {renderField('Location', 'location')}
                {renderField('Notice Period', 'noticePeriod')}
              </div>
              <div style={styles.btnGroup}>
                <button type="button" style={styles.btn} onClick={() => goToStep(2)}>Previous</button>
                <button type="button" style={styles.btn} onClick={() => goToStep(4)}>Next</button>
              </div>
            </div>

            {/* Step 4 */}
            <div style={currentStep === 4 ? styles.formStepActive : styles.formStep}>
              <div style={styles.formGrid}>
                {renderField('Skills', 'skills')}
                <div style={styles.formGroupFull}>
                  <label style={styles.label}>Description *</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} style={{ ...styles.textarea, ...(errors.description && styles.textareaError) }} required />
                  {errors.description && <span style={styles.errorText}>{errors.description}</span>}
                </div>
              </div>
              <div style={styles.btnGroup}>
                <button type="button" style={styles.btn} onClick={() => goToStep(3)}>Previous</button>
                <button type="button" style={styles.btn} onClick={() => goToStep(5)}>Next</button>
              </div>
            </div>

            {/* Step 5 */}
            <div style={currentStep === 5 ? styles.formStepActive : styles.formStep}>
              <div style={styles.formGrid}>
                {renderField('Username', 'username')}
                {renderField('Password', 'password', 'password')}
                {renderField('Confirm Password', 'confirmPassword', 'password')}
              </div>
              <div style={styles.btnGroup}>
                <button type="button" style={styles.btn} onClick={() => goToStep(4)}>Previous</button>
                <button type="submit" style={styles.btn}>Submit</button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {showSuccessModal && (
        <div style={styles.successModal}>
          <div style={styles.successBox}>
            <h2 style={styles.successTitle}>🎉 Registration Successful!</h2>
            <p style={styles.successText}>Your profile has been created successfully. You can now apply for jobs!</p>
            <button style={styles.btn} onClick={handleSuccessClose}>Continue to Home</button>
          </div>
        </div>
      )}
    </div>
  );
}
