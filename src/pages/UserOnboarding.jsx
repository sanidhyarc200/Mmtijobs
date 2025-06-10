import React, { useState } from 'react';

export default function UserOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    // Step 1 - Personal Details
    firstName: '',
    middleName: '',
    lastName: '',
    contact: '',
    email: '',
    
    // Step 2 - Education & Experience
    degree: '',
    passout: '',
    experience: '',
    techstack: '',
    
    // Step 3 - Salary & Location
    lastSalary: '',
    currentSalary: '',
    location: '',
    noticePeriod: '',
    
    // Step 4 - Final Details
    cv: null,
    description: '',
    skills: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    let isValid = true;

    switch (step) {
      case 1:
        if (!formData.firstName.trim()) {
          newErrors.firstName = 'First name is required';
          isValid = false;
        }
        if (!formData.lastName.trim()) {
          newErrors.lastName = 'Last name is required';
          isValid = false;
        }
        if (!formData.contact.trim()) {
          newErrors.contact = 'Contact number is required';
          isValid = false;
        } else if (!/^[0-9]{10}$/.test(formData.contact.replace(/\D/g, ''))) {
          newErrors.contact = 'Please enter a valid 10-digit contact number';
          isValid = false;
        }
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
          isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
          isValid = false;
        }
        break;
        
      case 2:
        if (!formData.degree.trim()) {
          newErrors.degree = 'Degree is required';
          isValid = false;
        }
        if (!formData.passout.trim()) {
          newErrors.passout = 'Passout year is required';
          isValid = false;
        } else {
          const currentYear = new Date().getFullYear();
          const passoutYear = parseInt(formData.passout);
          if (passoutYear < 1990 || passoutYear > currentYear) {
            newErrors.passout = 'Please enter a valid passout year';
            isValid = false;
          }
        }
        if (!formData.experience.trim()) {
          newErrors.experience = 'Experience is required';
          isValid = false;
        }
        if (!formData.techstack.trim()) {
          newErrors.techstack = 'Tech stack is required';
          isValid = false;
        }
        break;
        
      case 3:
        if (!formData.lastSalary.trim()) {
          newErrors.lastSalary = 'Last salary is required';
          isValid = false;
        }
        if (!formData.currentSalary.trim()) {
          newErrors.currentSalary = 'Current/expected salary is required';
          isValid = false;
        }
        if (!formData.location.trim()) {
          newErrors.location = 'Location is required';
          isValid = false;
        }
        if (!formData.noticePeriod.trim()) {
          newErrors.noticePeriod = 'Notice period is required';
          isValid = false;
        }
        break;
        
      case 4:
        if (!formData.description.trim()) {
          newErrors.description = 'Description is required';
          isValid = false;
        }
        if (!formData.skills.trim()) {
          newErrors.skills = 'Skills are required';
          isValid = false;
        }
        break;
        
      default:
        break;
    }

    setErrors(newErrors);
    return isValid;
  };

  const goToStep = (step) => {
    if (step > currentStep && !validateStep(currentStep)) {
      return;
    }
    setCurrentStep(step);
    window.scrollTo(0, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep(4)) {
      // Here you would typically send data to backend
      console.log('Form data:', formData);
      setShowSuccessModal(true);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    // Redirect to home page - implement based on your routing
    window.location.href = '/';
  };

  const styles = {
    container: {
      fontFamily: "'Inter', sans-serif",
      margin: 0,
      backgroundColor: '#f3f4f6',
      minHeight: '100vh',
      padding: '20px 0',
    },
    header: {
      backgroundColor: '#fff',
      borderBottom: '1px solid #e5e7eb',
      padding: '20px 0',
      marginBottom: '20px',
    },
    nav: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '90%',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    logo: {
      fontSize: '1.8em',
      color: '#0a66c2',
      fontWeight: 700,
      margin: 0,
    },
    navLinks: {
      display: 'flex',
      gap: '25px',
    },
    navLink: {
      textDecoration: 'none',
      color: '#4b5563',
      fontWeight: 500,
      cursor: 'pointer',
    },
    modal: {
      backgroundColor: 'white',
      padding: '30px 40px',
      borderRadius: '12px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      width: '90%',
      maxWidth: '700px',
      margin: '0 auto',
    },
    modalTitle: {
      marginBottom: '25px',
      color: '#0a66c2',
      fontWeight: 700,
      fontSize: '1.5em',
    },
    stepIndicator: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '30px',
      gap: '10px',
    },
    stepDot: {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      backgroundColor: '#e5e7eb',
    },
    stepDotActive: {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      backgroundColor: '#0a66c2',
    },
    formStep: {
      display: 'none',
    },
    formStepActive: {
      display: 'block',
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '20px 30px',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
    },
    formGroupFull: {
      display: 'flex',
      flexDirection: 'column',
      gridColumn: '1 / -1',
    },
    label: {
      marginBottom: '6px',
      fontWeight: 600,
      color: '#374151',
    },
    input: {
      padding: '10px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      fontSize: '1em',
    },
    inputError: {
      borderColor: '#ef4444',
    },
    textarea: {
      padding: '10px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      fontSize: '1em',
      minHeight: '100px',
      resize: 'vertical',
    },
    textareaError: {
      borderColor: '#ef4444',
    },
    errorText: {
      color: '#ef4444',
      fontSize: '0.85em',
      marginTop: '5px',
    },
    btnGroup: {
      marginTop: '30px',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '15px',
    },
    btn: {
      backgroundColor: '#0a66c2',
      color: 'white',
      padding: '12px 28px',
      border: 'none',
      borderRadius: '8px',
      fontWeight: 600,
      cursor: 'pointer',
      fontSize: '1em',
      transition: 'background-color 0.2s ease',
    },
    btnDisabled: {
      backgroundColor: '#9ca3af',
      cursor: 'not-allowed',
    },
    successModal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    successBox: {
      background: '#fff',
      padding: '30px',
      borderRadius: '12px',
      width: '90%',
      maxWidth: '400px',
      textAlign: 'center',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    },
    successTitle: {
      color: '#059669',
      fontSize: '1.5em',
      marginBottom: '15px',
    },
    successText: {
      color: '#374151',
      marginBottom: '25px',
    },
  };

  return (
    <div style={styles.container}>
      {/* Main Form */}
      <section>
        <div style={styles.modal}>
          <h2 style={styles.modalTitle}>User Onboarding</h2>
          
          {/* Step Indicator */}
          <div style={styles.stepIndicator}>
            {[1, 2, 3, 4].map(step => (
              <div
                key={step}
                style={currentStep === step ? styles.stepDotActive : styles.stepDot}
              />
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1 - Personal Details */}
            <div style={currentStep === 1 ? styles.formStepActive : styles.formStep}>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    style={{
                      ...styles.input,
                      ...(errors.firstName && styles.inputError)
                    }}
                    required
                  />
                  {errors.firstName && <span style={styles.errorText}>{errors.firstName}</span>}
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Middle Name</label>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    style={{
                      ...styles.input,
                      ...(errors.lastName && styles.inputError)
                    }}
                    required
                  />
                  {errors.lastName && <span style={styles.errorText}>{errors.lastName}</span>}
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Contact Number *</label>
                  <input
                    type="tel"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    style={{
                      ...styles.input,
                      ...(errors.contact && styles.inputError)
                    }}
                    required
                  />
                  {errors.contact && <span style={styles.errorText}>{errors.contact}</span>}
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email ID *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{
                      ...styles.input,
                      ...(errors.email && styles.inputError)
                    }}
                    required
                  />
                  {errors.email && <span style={styles.errorText}>{errors.email}</span>}
                </div>
              </div>
              <div style={styles.btnGroup}>
                <button type="button" style={{...styles.btn, ...styles.btnDisabled}} disabled>
                  Previous
                </button>
                <button type="button" style={styles.btn} onClick={() => goToStep(2)}>
                  Next
                </button>
              </div>
            </div>

            {/* Step 2 - Education & Experience */}
            <div style={currentStep === 2 ? styles.formStepActive : styles.formStep}>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Degree Name *</label>
                  <input
                    type="text"
                    name="degree"
                    value={formData.degree}
                    onChange={handleInputChange}
                    style={{
                      ...styles.input,
                      ...(errors.degree && styles.inputError)
                    }}
                    required
                  />
                  {errors.degree && <span style={styles.errorText}>{errors.degree}</span>}
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Passout Year *</label>
                  <input
                    type="number"
                    name="passout"
                    value={formData.passout}
                    onChange={handleInputChange}
                    style={{
                      ...styles.input,
                      ...(errors.passout && styles.inputError)
                    }}
                    min="1990"
                    max={new Date().getFullYear()}
                    required
                  />
                  {errors.passout && <span style={styles.errorText}>{errors.passout}</span>}
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Experience *</label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    style={{
                      ...styles.input,
                      ...(errors.experience && styles.inputError)
                    }}
                    placeholder="e.g., 2 years"
                    required
                  />
                  {errors.experience && <span style={styles.errorText}>{errors.experience}</span>}
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Tech Stack *</label>
                  <input
                    type="text"
                    name="techstack"
                    value={formData.techstack}
                    onChange={handleInputChange}
                    style={{
                      ...styles.input,
                      ...(errors.techstack && styles.inputError)
                    }}
                    placeholder="e.g., React, Node.js, MongoDB"
                    required
                  />
                  {errors.techstack && <span style={styles.errorText}>{errors.techstack}</span>}
                </div>
              </div>
              <div style={styles.btnGroup}>
                <button type="button" style={styles.btn} onClick={() => goToStep(1)}>
                  Previous
                </button>
                <button type="button" style={styles.btn} onClick={() => goToStep(3)}>
                  Next
                </button>
              </div>
            </div>

            {/* Step 3 - Salary & Location */}
            <div style={currentStep === 3 ? styles.formStepActive : styles.formStep}>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Last Salary *</label>
                  <input
                    type="text"
                    name="lastSalary"
                    value={formData.lastSalary}
                    onChange={handleInputChange}
                    style={{
                      ...styles.input,
                      ...(errors.lastSalary && styles.inputError)
                    }}
                    placeholder="e.g., ₹5 LPA"
                    required
                  />
                  {errors.lastSalary && <span style={styles.errorText}>{errors.lastSalary}</span>}
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Current/Expected Salary *</label>
                  <input
                    type="text"
                    name="currentSalary"
                    value={formData.currentSalary}
                    onChange={handleInputChange}
                    style={{
                      ...styles.input,
                      ...(errors.currentSalary && styles.inputError)
                    }}
                    placeholder="e.g., ₹8 LPA"
                    required
                  />
                  {errors.currentSalary && <span style={styles.errorText}>{errors.currentSalary}</span>}
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    style={{
                      ...styles.input,
                      ...(errors.location && styles.inputError)
                    }}
                    placeholder="e.g., Bangalore, Mumbai"
                    required
                  />
                  {errors.location && <span style={styles.errorText}>{errors.location}</span>}
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Notice Period *</label>
                  <input
                    type="text"
                    name="noticePeriod"
                    value={formData.noticePeriod}
                    onChange={handleInputChange}
                    style={{
                      ...styles.input,
                      ...(errors.noticePeriod && styles.inputError)
                    }}
                    placeholder="e.g., 30 days, Immediate"
                    required
                  />
                  {errors.noticePeriod && <span style={styles.errorText}>{errors.noticePeriod}</span>}
                </div>
              </div>
              <div style={styles.btnGroup}>
                <button type="button" style={styles.btn} onClick={() => goToStep(2)}>
                  Previous
                </button>
                <button type="button" style={styles.btn} onClick={() => goToStep(4)}>
                  Next
                </button>
              </div>
            </div>

            {/* Step 4 - Final Details */}
            <div style={currentStep === 4 ? styles.formStepActive : styles.formStep}>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Upload CV</label>
                  <input
                    type="file"
                    name="cv"
                    onChange={handleInputChange}
                    style={styles.input}
                    accept=".pdf,.doc,.docx"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Skills *</label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    style={{
                      ...styles.input,
                      ...(errors.skills && styles.inputError)
                    }}
                    placeholder="e.g., JavaScript, Python, Communication"
                    required
                  />
                  {errors.skills && <span style={styles.errorText}>{errors.skills}</span>}
                </div>
                <div style={styles.formGroupFull}>
                  <label style={styles.label}>Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    style={{
                      ...styles.textarea,
                      ...(errors.description && styles.textareaError)
                    }}
                    placeholder="Tell us about yourself, your experience, and career goals..."
                    required
                  />
                  {errors.description && <span style={styles.errorText}>{errors.description}</span>}
                </div>
              </div>
              <div style={styles.btnGroup}>
                <button type="button" style={styles.btn} onClick={() => goToStep(3)}>
                  Previous
                </button>
                <button type="submit" style={styles.btn}>
                  Submit
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Success Modal */}
      {showSuccessModal && (
        <div style={styles.successModal}>
          <div style={styles.successBox}>
            <h2 style={styles.successTitle}>🎉 Registration Successful!</h2>
            <p style={styles.successText}>
              Your profile has been created successfully. You can now apply for jobs!
            </p>
            <button style={styles.btn} onClick={handleSuccessClose}>
              Continue to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}