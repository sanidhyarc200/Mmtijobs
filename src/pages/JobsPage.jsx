import React, { useEffect, useState } from 'react';

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({
    title: '',
    location: '',
    experience: '',
    salary: '',
  });
  const [selectedJob, setSelectedJob] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  useEffect(() => {
    const data = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      title: `Software Engineer ${i + 1}`,
      company: `Startup ${i + 1}`,
      location: i % 2 === 0 ? 'Bangalore' : 'Remote',
      salary: `₹${(i + 5) * 2}L`,
      experience: i % 3 === 0 ? '0-2 years' : i % 3 === 1 ? '3-5 years' : '6+ years',
      tags: ['React', 'Node.js', 'MongoDB'],
      description: `This is a detailed description for job role #${i + 1}. It's a great opportunity to work with cutting-edge technologies and grow your career in a dynamic environment.`,
    }));
    setJobs(data);
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredJobs = jobs.filter((job) => {
    const { title, location, experience, salary } = filters;
    return (
      (!title || job.title.toLowerCase().includes(title.toLowerCase())) &&
      (!location || job.location.toLowerCase().includes(location.toLowerCase())) &&
      (!experience || job.experience.includes(experience)) &&
      (!salary ||
        (salary === '0-10' && parseInt(job.salary) <= 10) ||
        (salary === '10-20' && parseInt(job.salary) > 10 && parseInt(job.salary) <= 20) ||
        (salary === '20+' && parseInt(job.salary) > 20))
    );
  });

  const handleView = (job) => {
    setSelectedJob(job);
    setShowViewModal(true);
  };

  const handleApply = (job) => {
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const handleLoginSubmit = () => {
    alert('Login functionality will be implemented with backend');
    setShowLoginForm(false);
    setShowApplyModal(false);
    setLoginData({ email: '', password: '' });
  };

  const handleSignUpClick = () => {
    setShowApplyModal(false);  // Close the apply modal
    navigate('/onboarding');   // Navigate to the onboarding page
  };

  return (
    <div style={styles.container}>
      <h2 style={{ marginTop: 40, textAlign: 'center', color: '#0a66c2' }}>Explore 20+ Opportunities</h2>

      <div style={styles.filters}>
        <input
          name="title"
          value={filters.title}
          onChange={handleFilterChange}
          placeholder="Search by title"
          style={styles.input}
        />
        <input
          name="location"
          value={filters.location}
          onChange={handleFilterChange}
          placeholder="Location"
          style={styles.input}
        />
        <select
          name="experience"
          value={filters.experience}
          onChange={handleFilterChange}
          style={styles.input}
        >
          <option value="">Experience</option>
          <option value="0-2">0-2 yrs</option>
          <option value="3-5">3-5 yrs</option>
          <option value="6+">6+ yrs</option>
        </select>
        <select
          name="salary"
          value={filters.salary}
          onChange={handleFilterChange}
          style={styles.input}
        >
          <option value="">Salary</option>
          <option value="0-10">0-10L</option>
          <option value="10-20">10-20L</option>
          <option value="20+">20L+</option>
        </select>
      </div>

      <div style={styles.jobsContainer}>
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div key={job.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.jobInfo}>
                  <h3 style={styles.jobTitle}>{job.title}</h3>
                  <p style={styles.companyInfo}>
                    <strong>Company:</strong> {job.company} • {job.location} • {job.salary}
                  </p>
                  <p><strong>Experience:</strong> {job.experience}</p>
                  <p style={styles.tags}><strong>Tags:</strong> {job.tags.join(', ')}</p>
                </div>
                <div style={styles.buttonContainer}>
                  <button
                    style={styles.viewBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleView(job);
                    }}
                  >
                    View
                  </button>
                  <button
                    style={styles.applyBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApply(job);
                    }}
                  >
                    Apply
                  </button>
                </div>
              </div>
              <div style={styles.details}>{job.description}</div>
            </div>
          ))
        ) : (
          <p style={styles.noJobsText}>No jobs found matching your criteria.</p>
        )}
      </div>

      {/* Apply Modal */}
      {showApplyModal && selectedJob && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            {!showLoginForm ? (
              <>
                <h2 style={styles.modalTitle}>Apply for {selectedJob.title}</h2>
                <p style={styles.modalText}>Please login or sign up to apply for this job.</p>
                <div style={styles.buttonGroup}>
                  <button 
                    style={styles.cancelBtn} 
                    onClick={() => setShowApplyModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    style={styles.loginBtn}
                    onClick={() => setShowLoginForm(true)}
                  >
                    Login
                  </button>
                  <button
                    style={styles.signUpBtn}
                    onClick={handleSignUpClick}
                  >
                    Sign Up
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 style={styles.modalTitle}>Login</h2>
                <div style={styles.loginForm}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email:</label>
                    <input
                      type="email"
                      style={styles.formInput}
                      value={loginData.email}
                      onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Password:</label>
                    <input
                      type="password"
                      style={styles.formInput}
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    />
                  </div>
                  <div style={styles.buttonGroup}>
                    <button 
                      style={styles.cancelBtn} 
                      onClick={() => {
                        setShowLoginForm(false);
                        setShowApplyModal(false);
                        setLoginData({ email: '', password: '' });
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      style={styles.loginBtn}
                      onClick={handleLoginSubmit}
                    >
                      Login
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {showMaintenanceModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h2 style={styles.modalTitle}>🚧 Under Maintenance</h2>
            <p style={styles.modalText}>
              Sign up feature is currently under maintenance. Please check back later!
            </p>
            <button 
              style={styles.loginBtn}
              onClick={() => setShowMaintenanceModal(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* View Job Modal */}
      {showViewModal && selectedJob && (
        <div style={styles.modalOverlay} onClick={() => setShowViewModal(false)}>
          <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={styles.viewModalContent}>
              <h2 style={styles.viewModalTitle}>{selectedJob.title}</h2>
              <div style={styles.jobDetail}><strong>Company:</strong> {selectedJob.company}</div>
              <div style={styles.jobDetail}><strong>Location:</strong> {selectedJob.location}</div>
              <div style={styles.jobDetail}><strong>Experience:</strong> {selectedJob.experience}</div>
              <div style={styles.jobDetail}><strong>Salary:</strong> {selectedJob.salary}</div>
              <div style={styles.jobDetail}><strong>Skills:</strong> {selectedJob.tags.join(', ')}</div>
              <div style={styles.jobDetail}><strong>Description:</strong></div>
              <p style={{ color: '#4b5563', lineHeight: '1.6', marginTop: '8px' }}>{selectedJob.description}</p>
              <button style={styles.closeBtn} onClick={() => setShowViewModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    width: '90%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
    fontFamily: "'Inter', sans-serif",
  },
  filters: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '15px',
    marginBottom: '40px',
    padding: '20px',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
  },
  input: {
    padding: '12px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1em',
    flex: 1,
    minWidth: '200px',
  },
  jobsContainer: {
    width: '100%',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    color: '#0a66c2',
    fontSize: '1.4em',
    marginBottom: '8px',
    marginTop: 0,
  },
  companyInfo: {
    marginBottom: '8px',
    color: '#374151',
  },
  tags: {
    marginTop: '8px',
    color: '#6b7280',
    fontSize: '0.95em',
  },
  buttonContainer: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
  },
  viewBtn: {
    backgroundColor: '#e5e7eb',
    color: '#374151',
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
  },
  applyBtn: {
    backgroundColor: '#0a66c2',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
  },
  details: {
    paddingTop: '15px',
    color: '#4b5563',
  },
  noJobsText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '1.1em',
    marginTop: '40px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalBox: {
    background: '#fff',
    padding: '30px',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '500px',
    textAlign: 'center',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
  },
  modalTitle: {
    marginBottom: '15px',
    color: '#0a66c2',
    fontSize: '1.5em',
  },
  modalText: {
    color: '#374151',
    marginBottom: '25px',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    flexWrap: 'wrap',
  },
  cancelBtn: {
    padding: '10px 20px',
    background: '#e5e7eb',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  loginBtn: {
    padding: '10px 20px',
    background: '#0a66c2',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  signUpBtn: {
    padding: '10px 20px',
    background: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  loginForm: {
    textAlign: 'left',
    marginTop: '20px',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 600,
    color: '#374151',
  },
  formInput: {
    width: '100%',
    padding: '10px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1em',
  },
  viewModalContent: {
    textAlign: 'left',
  },
  viewModalTitle: {
    color: '#0a66c2',
    fontSize: '1.8em',
    marginBottom: '20px',
    textAlign: 'center',
  },
  jobDetail: {
    marginBottom: '12px',
    fontSize: '1.1em',
  },
  closeBtn: {
    width: '100%',
    padding: '12px',
    background: '#0a66c2',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '20px',
  },
};

export default JobsPage;