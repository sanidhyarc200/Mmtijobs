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

  const heroStyles = {
    heroSection: {
      position: 'relative',
      minHeight: '550px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: `linear-gradient(135deg, rgba(10, 102, 194, 0.9), rgba(0, 65, 130, 0.8)), 
                   url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      color: 'white',
      textAlign: 'center',
      padding: '60px 20px',
    },
    heroContent: {
      maxWidth: '800px',
      marginBottom: '40px',
    },
    heroTitle: {
      fontSize: '3.5em',
      fontWeight: '700',
      marginBottom: '20px',
      textShadow: '2px 2px 10px rgba(0,0,0,0.3)',
      lineHeight: '1.2',
    },
    heroSubtitle: {
      fontSize: '1.3em',
      marginBottom: '40px',
      textShadow: '1px 1px 5px rgba(0,0,0,0.3)',
      opacity: '0.95',
      fontWeight: '400',
    },
    searchContainer: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '30px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
      maxWidth: '900px',
      width: '100%',
      border: '1px solid rgba(255,255,255,0.2)',
    },
    searchForm: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '15px',
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchInput: {
      flex: '1',
      minWidth: '220px',
      padding: '15px 20px',
      border: '2px solid transparent',
      borderRadius: '12px',
      fontSize: '1em',
      background: 'white',
      color: '#1f2937',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
    searchInputFocus: {
      borderColor: '#0a66c2',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 20px rgba(10, 102, 194, 0.3)',
    },
    searchButton: {
      padding: '15px 30px',
      background: 'linear-gradient(135deg, #0a66c2, #004182)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '1.1em',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(10, 102, 194, 0.4)',
      minWidth: '120px',
    },
    floatingElements: {
      position: 'absolute',
      top: '20%',
      left: '10%',
      width: '60px',
      height: '60px',
      background: 'rgba(255,255,255,0.1)',
      borderRadius: '50%',
      animation: 'float 6s ease-in-out infinite',
    },
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
      transition: 'all 0.3s ease',
      border: '1px solid transparent',
    },
    cardHover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
      borderColor: '#0a66c2',
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
      transition: 'all 0.3s ease',
    },
    applyBtn: {
      backgroundColor: '#0a66c2',
      color: 'white',
      padding: '10px 20px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 600,
      transition: 'all 0.3s ease',
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
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          .search-input:focus {
            border-color: #0a66c2 !important;
            transform: translateY(-2px);
            box-shadow: 0 4px 20px rgba(10, 102, 194, 0.3) !important;
            outline: none;
          }

          .search-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(10, 102, 194, 0.5);
          }

          .job-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            border-color: #0a66c2;
          }

          .view-btn:hover {
            background-color: #d1d5db !important;
            transform: translateY(-1px);
          }

          .apply-btn:hover {
            background-color: #004182 !important;
            transform: translateY(-1px);
          }
        `}
      </style>

      {/* Enhanced Hero Section with Search */}
      <section style={heroStyles.heroSection}>
        {/* Floating Elements for Visual Appeal */}
        <div style={{...heroStyles.floatingElements, top: '15%', left: '8%', animationDelay: '0s'}}></div>
        <div style={{...heroStyles.floatingElements, top: '25%', right: '12%', animationDelay: '2s'}}></div>
        <div style={{...heroStyles.floatingElements, bottom: '20%', left: '15%', animationDelay: '4s'}}></div>
        
        <div style={heroStyles.heroContent}>
          <h1 style={heroStyles.heroTitle}>Find Your Dream Job Today</h1>
          <p style={heroStyles.heroSubtitle}>
            Thousands of jobs from top companies. Your next career move is just a click away.
          </p>
        </div>

        <div style={heroStyles.searchContainer}>
          <div style={heroStyles.searchForm}>
            <input
              type="text"
              className="search-input"
              style={heroStyles.searchInput}
              placeholder="Job title, keywords, or company"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <input
              type="text"
              className="search-input"
              style={heroStyles.searchInput}
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <select
              className="search-input"
              style={heroStyles.searchInput}
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
            <button
              className="search-button"
              style={heroStyles.searchButton}
              onClick={() => {
                // Search functionality can be added here
                console.log('Search triggered');
              }}
            >
              Search Jobs
            </button>
          </div>
        </div>
      </section>

      <section className="job-listings" style={{background: '#f8fafc', padding: '60px 0'}}>
        <h3 style={{fontSize: '2.2em', marginBottom: '40px', textAlign: 'center', color: '#1f2937', fontWeight: '700'}}>Latest Job Opportunities</h3>
        <div style={jobCardStyles.container}>
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div key={job.id} className="job-card" style={jobCardStyles.card}>
                <div style={jobCardStyles.cardHeader}>
                  <div style={jobCardStyles.jobInfo}>
                    <h3 style={jobCardStyles.jobTitle}>{job.title}</h3>
                    <p style={jobCardStyles.companyInfo}>
                      <strong>Company:</strong> {job.company} • {job.location} • {job.salary}
                    </p>
                    <p><strong>Experience:</strong> {job.experience}</p>
                    <p style={jobCardStyles.tags}><strong>Skills:</strong> {job.tags.join(', ')}</p>
                  </div>
                  <div style={jobCardStyles.buttonContainer}>
                    <button
                      className="view-btn"
                      style={jobCardStyles.viewBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(job);
                      }}
                    >
                      View Details
                    </button>
                    <button
                      className="apply-btn"
                      style={jobCardStyles.applyBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApply(job);
                      }}
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
                <div style={jobCardStyles.details}>{job.description}</div>
              </div>
            ))
          ) : (
            <div style={{textAlign: 'center', padding: '40px', color: '#6b7280', fontSize: '1.2em'}}>
              <p>No jobs found matching your criteria. Try adjusting your search filters.</p>
            </div>
          )}
        </div>
      </section>

      <section className="hire-section" style={{
        background: 'linear-gradient(135deg, #0a66c2, #004182)',
        color: 'white',
        padding: '80px 20px',
        textAlign: 'center'
      }}>
        <h2 style={{fontSize: '2.5em', marginBottom: '20px', fontWeight: '700'}}>Are you a recruiter?</h2>
        <p style={{fontSize: '1.2em', marginBottom: '40px', maxWidth: '800px', margin: '0 auto 40px'}}>
          Want to post a job? Register now and use the post a job feature in the header to continue!
        </p>
      </section>

      <footer style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e5e7eb',
        padding: '30px 0',
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '0.9em'
      }}>
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