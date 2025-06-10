import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const defaultJobs = [
    {
      id: 1,
      title: 'Frontend Developer',
      company: 'MMTI Jobs',
      location: 'Remote',
      experience: '2-4 years',
      salary: '₹6-8 LPA',
      tags: ['React', 'JavaScript', 'CSS'],
      description: 'We are looking for a skilled Frontend Developer to join our dynamic team. You will be responsible for building user interfaces and ensuring seamless user experiences.',
    },
    {
      id: 2,
      title: 'Backend Developer',
      company: 'TechStack',
      location: 'Bangalore',
      experience: '3-5 years',
      salary: '₹8-10 LPA',
      tags: ['Node.js', 'Express', 'MongoDB'],
      description: 'Join our backend team to develop robust server-side applications. Experience with microservices and cloud platforms is preferred.',
    },
    {
      id: 3,
      title: 'Fullstack Developer',
      company: 'InnovateX',
      location: 'Hyderabad',
      experience: '4-6 years',
      salary: '₹10-12 LPA',
      tags: ['React', 'Node.js', 'AWS'],
      description: 'We need a versatile Fullstack Developer who can work on both frontend and backend technologies. AWS experience is a plus.',
    },
    {
      id: 4,
      title: 'Data Scientist',
      company: 'DataPros',
      location: 'Remote',
      experience: '3-5 years',
      salary: '₹12-15 LPA',
      tags: ['Python', 'Machine Learning', 'SQL'],
      description: 'Analyze complex datasets and build machine learning models to drive business insights. Strong statistical background required.',
    },
    {
      id: 5,
      title: 'UI/UX Designer',
      company: 'Creative Minds',
      location: 'Mumbai',
      experience: '2-3 years',
      salary: '₹5-7 LPA',
      tags: ['Figma', 'Adobe XD', 'Prototyping'],
      description: 'Create intuitive and engaging user interfaces. Experience with design systems and user research is highly valued.',
    },
    {
      id: 6,
      title: 'DevOps Engineer',
      company: 'CloudWorks',
      location: 'Pune',
      experience: '3-5 years',
      salary: '₹9-11 LPA',
      tags: ['Docker', 'Kubernetes', 'CI/CD'],
      description: 'Manage and optimize our cloud infrastructure. Experience with containerization and automation tools is essential.',
    },
    {
      id: 7,
      title: 'Mobile App Developer',
      company: 'AppVenture',
      location: 'Chennai',
      experience: '2-4 years',
      salary: '₹6-9 LPA',
      tags: ['React Native', 'Swift', 'Kotlin'],
      description: 'Develop cross-platform mobile applications. Experience with both iOS and Android development is preferred.',
    },
    {
      id: 8,
      title: 'QA Engineer',
      company: 'Quality First',
      location: 'Chennai',
      experience: '1-3 years',
      salary: '₹4-6 LPA',
      tags: ['Selenium', 'Jest', 'Automation'],
      description: 'Ensure product quality through comprehensive testing strategies. Experience with automation frameworks is required.',
    },
  ];
  
export default function LandingPage() {
  const [year] = useState(new Date().getFullYear());

  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  const [filteredJobs, setFilteredJobs] = useState(defaultJobs);
  const navigate = useNavigate();

  useEffect(() => {
    let filtered = defaultJobs.filter((job) => {
      const keywordLower = keyword.toLowerCase();
      const matchesKeyword =
        job.title.toLowerCase().includes(keywordLower) ||
        job.company.toLowerCase().includes(keywordLower) ||
        job.tags.some((tag) => tag.toLowerCase().includes(keywordLower));
      const matchesLocation = location
        ? job.location.toLowerCase().includes(location.toLowerCase())
        : true;

      const experienceMap = {
        '0-1 years': [0, 1],
        '1-3 years': [1, 3],
        '2-3 years': [2, 3],
        '2-4 years': [2, 4],
        '3-5 years': [3, 5],
        '4-6 years': [4, 6],
        '5+ years': [5, Infinity],
      };

      let matchesExperience = true;
      if (experience && experienceMap[experience]) {
        const [minExp, maxExp] = experienceMap[experience];
        const [jobMinExp, jobMaxExp] = job.experience
          .split(' ')[0]
          .split('-')
          .map(Number);
        matchesExperience =
          (jobMinExp >= minExp && jobMinExp <= maxExp) ||
          (jobMaxExp >= minExp && jobMaxExp <= maxExp);
      }

      return matchesKeyword && matchesLocation && matchesExperience;
    });

    setFilteredJobs(filtered);
  }, [keyword, location, experience]);

  const handlePostJobClick = () => navigate('/post-job');
  
  const handleApply = (job) => {
    setSelectedJob(job);
    setShowApplyModal(true);
  };
  
  const handleView = (job) => {
    setSelectedJob(job);
    setShowViewModal(true);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    alert('Login functionality will be implemented with backend');
    setShowLoginForm(false);
    setShowApplyModal(false);
    setLoginData({ email: '', password: '' });
  };

  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  const handleSignUpClick = () => {
    setShowApplyModal(false);  // Close the apply modal
    navigate('/onboarding');   // Navigate to the onboarding page
  };
  const jobCardStyles = {
    container: {
      width: '70%',
      maxWidth: '840px',
      margin: '0 auto',
      marginLeft: '5%',
      padding: '40px 0',
      fontFamily: "'Inter', sans-serif",
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
    input: {
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

  return (
    <>
      <section className="hero">
        <h2>Find your dream job today</h2>
        <p>Thousands of jobs from top companies. Your next career move is just a click away.</p>
      </section>

      <section className="search-bar-container" style={{ marginTop: '-20px' }}>
        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Job title, keywords, or company"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <input
            type="text"
            className="search-input"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <select
            className="search-input"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          >
            <option value="">Experience</option>
            <option value="0-1 years">0-1 years</option>
            <option value="1-3 years">1-3 years</option>
            <option value="2-3 years">2-3 years</option>
            <option value="2-4 years">2-4 years</option>
            <option value="3-5 years">3-5 years</option>
            <option value="4-6 years">4-6 years</option>
            <option value="5+ years">5+ years</option>
          </select>
        </div>
      </section>

      <section className="job-listings">
        <h3>Latest Jobs</h3>
        <div style={jobCardStyles.container}>
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div key={job.id} style={jobCardStyles.card}>
                <div style={jobCardStyles.cardHeader}>
                  <div style={jobCardStyles.jobInfo}>
                    <h3 style={jobCardStyles.jobTitle}>{job.title}</h3>
                    <p style={jobCardStyles.companyInfo}>
                      <strong>Company:</strong> {job.company} • {job.location} • {job.salary}
                    </p>
                    <p><strong>Experience:</strong> {job.experience}</p>
                    <p style={jobCardStyles.tags}><strong>Tags:</strong> {job.tags.join(', ')}</p>
                  </div>
                  <div style={jobCardStyles.buttonContainer}>
                    <button
                      style={jobCardStyles.viewBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(job);
                      }}
                    >
                      View
                    </button>
                    <button
                      style={jobCardStyles.applyBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApply(job);
                      }}
                    >
                      Apply
                    </button>
                  </div>
                </div>
                <div style={jobCardStyles.details}>{job.description}</div>
              </div>
            ))
          ) : (
            <p>No jobs found matching your criteria.</p>
          )}
        </div>
      </section>

      <section className="hire-section">
        <h2>Are you a recruiter?</h2>
        <p>
          Want to post a job? register now !! use the post a job feature in the header to continue !!!
        </p>
      </section>

      <footer>
        <div className="container footer">
          <p>© {year} MMtijobs — All rights reserved.</p>
        </div>
      </footer>

      {/* Apply Modal */}
      {showApplyModal && selectedJob && (
        <div style={jobCardStyles.modalOverlay}>
          <div style={jobCardStyles.modalBox}>
            {!showLoginForm ? (
              <>
                <h2 style={jobCardStyles.modalTitle}>Apply for {selectedJob.title}</h2>
                <p style={jobCardStyles.modalText}>Please login or sign up to apply for this job.</p>
                <div style={jobCardStyles.buttonGroup}>
                  <button 
                    style={jobCardStyles.cancelBtn} 
                    onClick={() => setShowApplyModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    style={jobCardStyles.loginBtn}
                    onClick={() => setShowLoginForm(true)}
                  >
                    Login
                  </button>
                  <button
                    style={jobCardStyles.signUpBtn}
                    onClick={handleSignUpClick}
                  >
                    Sign Up
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 style={jobCardStyles.modalTitle}>Login</h2>
                <form style={jobCardStyles.loginForm} onSubmit={handleLoginSubmit}>
                  <div style={jobCardStyles.formGroup}>
                    <label style={jobCardStyles.label}>Email:</label>
                    <input
                      type="email"
                      style={jobCardStyles.input}
                      value={loginData.email}
                      onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div style={jobCardStyles.formGroup}>
                    <label style={jobCardStyles.label}>Password:</label>
                    <input
                      type="password"
                      style={jobCardStyles.input}
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      required
                    />
                  </div>
                  <div style={jobCardStyles.buttonGroup}>
                    <button 
                      type="button"
                      style={jobCardStyles.cancelBtn} 
                      onClick={() => {
                        setShowLoginForm(false);
                        setShowApplyModal(false);
                        setLoginData({ email: '', password: '' });
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" style={jobCardStyles.loginBtn}>
                      Login
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {showMaintenanceModal && (
        <div style={jobCardStyles.modalOverlay}>
          <div style={jobCardStyles.modalBox}>
            <h2 style={jobCardStyles.modalTitle}>🚧 Under Maintenance</h2>
            <p style={jobCardStyles.modalText}>
              Sign up feature is currently under maintenance. Please check back later!
            </p>
            <button 
              style={jobCardStyles.loginBtn}
              onClick={() => setShowMaintenanceModal(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* View Job Modal */}
      {showViewModal && selectedJob && (
        <div style={jobCardStyles.modalOverlay} onClick={() => setShowViewModal(false)}>
          <div style={jobCardStyles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={jobCardStyles.viewModalContent}>
              <h2 style={jobCardStyles.viewModalTitle}>{selectedJob.title}</h2>
              <div style={jobCardStyles.jobDetail}><strong>Company:</strong> {selectedJob.company}</div>
              <div style={jobCardStyles.jobDetail}><strong>Location:</strong> {selectedJob.location}</div>
              <div style={jobCardStyles.jobDetail}><strong>Experience:</strong> {selectedJob.experience}</div>
              <div style={jobCardStyles.jobDetail}><strong>Salary:</strong> {selectedJob.salary}</div>
              <div style={jobCardStyles.jobDetail}><strong>Skills:</strong> {selectedJob.tags.join(', ')}</div>
              <div style={jobCardStyles.jobDetail}><strong>Description:</strong></div>
              <p style={{ color: '#4b5563', lineHeight: '1.6', marginTop: '8px' }}>{selectedJob.description}</p>
              <button style={jobCardStyles.closeBtn} onClick={() => setShowViewModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}