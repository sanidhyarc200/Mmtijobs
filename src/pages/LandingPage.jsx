import React, { useState, useEffect, useMemo } from 'react';
import FloatingResumeCTA from "../components/FloatingResumeCTA";

import { useNavigate } from 'react-router-dom';

const defaultTitles = [
  'Frontend Developer', 'Backend Developer', 'Fullstack Developer', 'Data Scientist',
  'UI/UX Designer', 'DevOps Engineer', 'Mobile App Developer', 'QA Engineer',
  'Cloud Architect', 'Machine Learning Engineer', 'Security Analyst', 'React Developer',
  'Node.js Developer', 'Product Designer', 'SRE Engineer', 'Technical Writer'
];

const defaultJobs = [
  {
    id: 1,
    title: 'HR & Operations Executive',
    company: 'Confidential Company',
    location: 'Bhopal, Madhya Pradesh',
    experience: '2+ years',
    salary: '₹2,00,000 – ₹3,00,000 per annum',
    tags: ['HR', 'Operations', 'Team Management', 'MS Office'],
    description:
      'We are hiring an experienced HR & Operations Executive to handle HR functions and oversee daily office operations. Key responsibilities include recruitment, onboarding, attendance & payroll management, HR documentation, office coordination, supporting sales teams, creating reports, and ensuring smooth inter-department communication. Required skills: strong team management, communication, HR operations knowledge, MS Office proficiency, and basic understanding of sales processes. Documents required: Experience Certificate, last 3 months’ pay slips, previous company offer letter, Aadhaar & PAN card.',
  },  
  {
    id: 2,
    title: 'Nutritionist',
    company: 'Fitness Tycoon',
    location: 'Mansarover Complex, MF-12, Bhopal',
    experience: '0-3 years',
    salary: '₹1.5 LPA – ₹3 LPA',
    tags: ['Nutrition', 'Diet Planning', 'Client Handling', 'Wellness'],
    description:
      'Fitness Tycoon is hiring a qualified Nutritionist for a full-time office role. Responsibilities include creating customized diet plans, conducting nutritional assessments, collaborating with fitness trainers, monitoring client progress, maintaining records, educating clients on nutrition, and staying updated with latest nutrition research. Required qualifications include a Bachelor’s or Master’s degree in Nutrition/Dietetics, experience in personalized diet planning, and strong understanding of macro & micronutrients. Skills: excellent communication, counseling, knowledge of Indian diets, and basic computer proficiency.',
  },  
  {
    id: 3,
    title: 'Fullstack Developer',
    company: 'WebSolutions Co.',
    location: 'Hyderabad',
    experience: '4-6 years',
    salary: '₹10-12 LPA',
    tags: ['React', 'Node.js', 'AWS'],
    description: 'We need a versatile Fullstack Developer who can work on both frontend and backend technologies. AWS experience is a plus.',
  },
  {
    id: 4,
    title: 'Data Scientist',
    company: 'AI Innovations',
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
    company: 'CloudTech Solutions',
    location: 'Pune',
    experience: '3-5 years',
    salary: '₹9-11 LPA',
    tags: ['Docker', 'Kubernetes', 'CI/CD'],
    description: 'Manage and optimize our cloud infrastructure. Experience with containerization and automation tools is essential.',
  },
  {
    id: 7,
    title: 'Mobile App Developer',
    company: 'AppWorks',
    location: 'Chennai',
    experience: '2-4 years',
    salary: '₹6-9 LPA',
    tags: ['React Native', 'Swift', 'Kotlin'],
    description: 'Develop cross-platform mobile applications. Experience with both iOS and Android development is preferred.',
  },
  {
    id: 8,
    title: 'QA Engineer',
    company: 'Quality Assurance Labs',
    location: 'Chennai',
    experience: '1-3 years',
    salary: '₹4-6 LPA',
    tags: ['Selenium', 'Jest', 'Automation'],
    description: 'Ensure product quality through comprehensive testing strategies. Experience with automation frameworks is required.',
  },
  {
    id: 9,
    title: 'Security Analyst',
    company: 'SafeNet Global',
    location: 'Delhi',
    experience: '2-5 years',
    salary: '₹7-9 LPA',
    tags: ['Network Security', 'Firewalls', 'SIEM'],
    description: 'Monitor and analyze system security breaches. Strong knowledge of SIEM tools required.',
  },
  {
    id: 10,
    title: 'Technical Writer',
    company: 'DocsHub Pvt Ltd',
    location: 'Remote',
    experience: '1-3 years',
    salary: '₹4-6 LPA',
    tags: ['Documentation', 'API Writing', 'Markdown'],
    description: 'Create developer-friendly documentation and tutorials for APIs and products.',
  },

];

export default function LandingPage() {
  const navigate = useNavigate();

  // UI state
  const [year] = useState(new Date().getFullYear());
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [filteredJobs, setFilteredJobs] = useState(defaultJobs);
  const [titleSuggestions, setTitleSuggestions] = useState(defaultTitles);

  // auth/user state
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('currentUser')) || null; } catch { return null; }
  });

  // application state
  const [appliedJobIds, setAppliedJobIds] = useState(new Set()); // Set<number>
  const [showAppliedModal, setShowAppliedModal] = useState(false);
  const [appliedModalTitle, setAppliedModalTitle] = useState('');

  // Auth prompt (apply flow)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [pendingJob, setPendingJob] = useState(null);

  // Recruiter CTA prompt (post job)
  const [showRecruiterPrompt, setShowRecruiterPrompt] = useState(false);
  const [currentRoleAtPrompt, setCurrentRoleAtPrompt] = useState(null); // 'recruiter' | 'candidate' | null

  // Shared login modal
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [requireRecruiter, setRequireRecruiter] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // compute "isRecruiter" fast
  const isRecruiter = useMemo(() => currentUser?.userType === 'recruiter', [currentUser]);

  // ---------- listen for auth changes & preload applied set ----------
  const refreshAuthAndApplied = () => {
    let user = null;
    try { user = JSON.parse(localStorage.getItem('currentUser')) || null; } catch {}
    setCurrentUser(user);

    // build user’s applied set
    const apps = JSON.parse(localStorage.getItem('jobApplications')) || [];
    const mine = new Set(
      user ? apps.filter(a => a.userId === user.id).map(a => a.jobId) : []
    );
    setAppliedJobIds(mine);
  };

  useEffect(() => {
    refreshAuthAndApplied();
    const onAuth = () => refreshAuthAndApplied();
    window.addEventListener('authChanged', onAuth);
    window.addEventListener('storage', onAuth);
    return () => {
      window.removeEventListener('authChanged', onAuth);
      window.removeEventListener('storage', onAuth);
    };
  }, []);

  // ---------- filtering ----------
  useEffect(() => {
    const storedTitles = JSON.parse(sessionStorage.getItem('searchedTitles')) || [];
    setTitleSuggestions([...new Set([...defaultTitles, ...storedTitles])]);

    const experienceMap = {
      '0-1 years': [0, 1],
      '1-3 years': [1, 3],
      '2-3 years': [2, 3],
      '2-4 years': [2, 4],
      '3-5 years': [3, 5],
      '4-6 years': [4, 6],
      '5+ years': [5, Infinity],
    };

    const filtered = defaultJobs.filter((job) => {
      const kw = keyword.toLowerCase();
      const matchesKeyword =
        job.title.toLowerCase().includes(kw) ||
        job.tags.some((tag) => tag.toLowerCase().includes(kw));
      const matchesLocation = location ? job.location.toLowerCase().includes(location.toLowerCase()) : true;

      let matchesExperience = true;
      if (experience && experienceMap[experience]) {
        const [minExp, maxExp] = experienceMap[experience];
        const [jobMinExp, jobMaxExp] = job.experience.split(' ')[0].split('-').map(Number);
        matchesExperience =
          (jobMinExp >= minExp && jobMinExp <= maxExp) || (jobMaxExp >= minExp && jobMaxExp <= maxExp);
      }

      return matchesKeyword && matchesLocation && matchesExperience;
    });

    setFilteredJobs(filtered);
  }, [keyword, location, experience]);

  // ---------- application helpers ----------
  const applyToJob = (job, user) => {
    const apps = JSON.parse(localStorage.getItem('jobApplications')) || [];

    // already applied?
    if (apps.some((a) => a.jobId === job.id && a.userId === user.id)) {
      setAppliedJobIds(prev => {
        const next = new Set(prev);
        next.add(job.id);
        return next;
      });
      setAppliedModalTitle(`You already applied for “${job.title}”`);
      setShowAppliedModal(true);
      return;
    }

    const newApplication = {
      jobId: job.id,
      userId: user.id,
      jobTitle: job.title,
      company: job.company || 'Unknown Company',
      appliedDate: new Date().toISOString(),
      status: 'Applied',
    };

    localStorage.setItem('jobApplications', JSON.stringify([...apps, newApplication]));
    setAppliedJobIds(prev => {
      const next = new Set(prev);
      next.add(job.id);
      return next;
    });

    // pretty success modal (no alerts)
    setAppliedModalTitle(`Applied successfully for “${job.title}”`);
    setShowAppliedModal(true);
  };

  const handleApply = (job) => {
    const user = JSON.parse(localStorage.getItem('currentUser'));

    if (user) {
      if (user.userType === 'recruiter') {
        // hard stop: recruiters cannot apply
        return;
      }
      applyToJob(job, user);
      return;
    }

    // not logged in → prompt (candidate flow)
    setPendingJob(job);
    setRequireRecruiter(false);
    setShowAuthPrompt(true);
  };

  const handleView = (job) => {
    setSelectedJob(job);
    setShowViewModal(true);
  };

  // ---------- recruiter CTA ----------
  const handleRecruiterCTA = () => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user?.userType === 'recruiter') {
      // per your instruction, we won’t show a button here anymore,
      // but just in case someone calls this:
      navigate('/post-job');
      return;
    }
    setCurrentRoleAtPrompt(user?.userType || null);
    setRequireRecruiter(true);
    setShowRecruiterPrompt(true);
  };

  // ---------- login from this page ----------
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(
      (u) => u.email === loginData.email && u.password === loginData.password
    );

    if (!user) {
      setLoginError('Invalid email or password.');
      return;
    }

    if (requireRecruiter && user.userType !== 'recruiter') {
      setLoginError('Please login with a recruiter account to post a job.');
      return;
    }

    localStorage.setItem('currentUser', JSON.stringify(user));
    try { window.dispatchEvent(new Event('authChanged')); } catch {}
    setShowLoginModal(false);

    if (requireRecruiter) {
      setRequireRecruiter(false);
      navigate('/post-job');
      return;
    }

    // auto-apply after login if needed
    if (pendingJob) {
      applyToJob(pendingJob, user);
      setPendingJob(null);
    }
    setLoginData({ email: '', password: '' });
  };

  return (
    <div className="landing-page">
      <style>{`
        .landing-page { font-family: 'Inter', sans-serif; max-width: 100%; overflow-x: hidden; }
        .hero-section { position: relative; min-height: 350px; display: flex; flex-direction: column; justify-content: center; align-items: center;
          background: linear-gradient(135deg, rgba(10, 102, 194, 0.9), rgba(0, 65, 130, 0.8)), url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80'); background-size: cover; background-position: center; background-attachment: fixed; color: white; text-align: center; padding: 30px 20px; }
        .hero-title { font-size: 2.2em; font-weight: 700; margin-bottom: 10px; text-shadow: 2px 2px 10px rgba(0,0,0,0.3); line-height: 1.2; }
        .hero-subtitle { font-size: 1.1em; margin-bottom: 20px; text-shadow: 1px 1px 5px rgba(0,0,0,0.3); opacity: 0.95; font-weight: 400; }
        .search-input,
        .search-container select {
          flex: 1;
          min-width: 380px;
          height: 44px;
          padding: 10px 14px;
          border: 1.8px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.95em;
          font-weight: 500;
          background-color: #fff;
          color: #1f2937;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg fill='%230a66c2' height='20' width='20' xmlns='http://www.w3.org/2000/svg'%3E<path d='M5 7l5 5 5-5z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 16px;
          transition: all 0.2s ease;
        }
        .search-input:hover,
        .search-container select:hover {
          border-color: #0a66c2;
          box-shadow: 0 4px 12px rgba(10,102,194,0.15);
        }
        .search-input:focus,
        .search-container select:focus {
          outline: none;
          border-color: #0a66c2;
          box-shadow: 0 0 0 3px rgba(10,102,194,0.15);
        }
        .search-container select {
          cursor: pointer;
          background-color: #fff;
          background-image: url("data:image/svg+xml,%3Csvg fill='%230a66c2' height='20' width='20' xmlns='http://www.w3.org/2000/svg'%3E<path d='M5 7l5 5 5-5z'/%3E%3C/svg%3E");
        }
        .search-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .search-button { padding: 10px 20px; background: linear-gradient(135deg, #0a66c2, #004182); color: white; border: none; border-radius: 8px; font-size: 1em; font-weight: 600; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(10, 102, 194, 0.4); height: 42px; white-space: nowrap; }
        .search-button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(10, 102, 194, 0.5); }

        .job-listings { background: #f8fafc; padding: 30px 0; }
        .job-listings h3 { font-size: 1.8em; margin-bottom: 20px; text-align: center; color: #1f2937; font-weight: 700; }
        .job-listings-container { width: 90%; max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; align-items: flex-start; }
        .job-card { background-color: #ffffff; border-radius: 8px; padding: 12px 15px; margin-bottom: 12px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05); transition: all 0.2s ease; border: 1px solid #e5e7eb; width: 100%; max-width: 800px; }
        .job-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border-color: #0a66c2; }
        .job-title { color: #0a66c2; font-size: 1.1em; margin-bottom: 4px; font-weight: 600; }
        .job-company { color: #4b5563; font-size: 0.9em; margin-bottom: 4px; }
        .job-meta { color: #4b5563; font-size: 0.85em; margin-bottom: 6px; display: flex; gap: 10px; }
        .job-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
        .job-tag { background: #e5e7eb; color: #374151; padding: 3px 8px; border-radius: 12px; font-size: 0.75em; }
        .job-description { color: #4b5563; font-size: 0.85em; line-height: 1.4; margin-bottom: 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; }

        .job-buttons { display: flex; justify-content: flex-end; gap: 8px; }
        .view-btn { background-color: #e5e7eb; color: #374151; padding: 6px 12px; border-radius: 6px; border: none; cursor: pointer; font-weight: 500; font-size: 0.85em; transition: all 0.2s ease; }
        .view-btn:hover { background-color: #d1d5db; }
        .apply-btn { background-color: #0a66c2; color: white; padding: 6px 12px; border-radius: 6px; border: none; cursor: pointer; font-weight: 500; font-size: 0.85em; transition: all 0.2s ease; }
        .apply-btn:hover { background-color: #004182; }
        .apply-btn:disabled, .apply-btn.disabled { background-color: #93c5fd; cursor: not-allowed; opacity: 0.7; }

        .hire-section { background: linear-gradient(135deg, #0a66c2, #004182); color: white; padding: 30px 20px; text-align: center; }
        .hire-section h2 { font-size: 1.8em; margin-bottom: 10px; font-weight: 700; }
        .hire-section p { font-size: 1em; margin: 0 auto 18px; max-width: 700px; }
        .post-cta-btn { display: inline-block; padding: 10px 18px; background: #fff; color: #0a66c2; border: none; border-radius: 8px; font-weight: 800; cursor: pointer; transition: transform 0.1s ease, box-shadow 0.2s ease, background 0.2s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .post-cta-btn:hover { background: #f0f7ff; transform: translateY(-1px); }

        footer { background-color: #ffffff; border-top: 1px solid #e5e7eb; padding: 15px 0; text-align: center; color: #6b7280; font-size: 0.85em; }
        datalist { max-height: 150px; overflow-y: auto; }

        /* Modal styles (shared) */
        .modal-overlay { position: fixed; inset: 0; background-color: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 16px; }
        .modal-box { background: #fff; padding: 20px; border-radius: 12px; width: 90%; max-width: 500px; box-shadow: 0 12px 40px rgba(0,0,0,0.25); position: relative; animation: pop 0.15s ease-out; }
        @keyframes pop { from { transform: scale(0.98); opacity: 0.9; } to { transform: scale(1); opacity: 1; } }
        .modal-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .brand-circle { width: 36px; height: 36px; border-radius: 50%; background: #0a66c2; color: #fff; display: grid; place-items: center; font-weight: 800; }
        .modal-title { margin: 0; font-size: 20px; color: #111827; }
        .modal-subtitle { margin: 2px 0 0; color: #6b7280; font-size: 14px; }
        .modal-close { margin-left: auto; background: #f3f4f6; border: none; border-radius: 8px; width: 32px; height: 32px; cursor: pointer; color: #374151; }
        .modal-close:hover { background: #e5e7eb; }
        .form { margin-top: 8px; }
        .form-field { margin-bottom: 12px; }
        .form-field label { display: block; margin-bottom: 6px; font-weight: 600; color: #374151; }
        .form-field input { width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; outline: none; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        .form-field input:focus { border-color: #0a66c2; box-shadow: 0 0 0 3px rgba(10,102,194,0.12); }
        .error-banner { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; border-radius: 8px; padding: 8px 12px; font-size: 14px; margin-bottom: 8px; }
        .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 6px; }
        .btn-secondary { padding: 10px 16px; background: #e5e7eb; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }
        .btn-secondary:hover { background: #d1d5db; }
        .btn-primary { padding: 10px 16px; background: #0a66c2; color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }
        .btn-primary:hover { background: #004182; }
        .link-button { background: none; border: none; color: #0a66c2; font-weight: 700; cursor: pointer; padding: 0; }
        .modal-footer { display: flex; gap: 6px; justify-content: center; align-items: center; margin-top: 12px; color: #6b7280; }

        @media (min-width: 768px) {
          .hero-section { min-height: 380px; }
          .hero-title { font-size: 2.5em; }
          .hero-subtitle { font-size: 1.2em; }
          .search-row { flex-wrap: nowrap; }
          .job-card { padding: 15px 20px; }
        }
        @media (min-width: 1200px) {
          .job-listings-container { align-items: flex-start; padding-right: 400px; }
        }
      `}</style>

      {/* Hero */}
      <section className="hero-section">
        <div>
          <h1 className="hero-title">Find Your Dream Job Today</h1>
          <p className="hero-subtitle">Thousands of jobs from top companies. Your next career move is just a click away.</p>
        </div>

        <div className="search-container">
          <div className="search-row">
            <input
              type="text"
              className="search-input"
              placeholder="Job title or keywords"
              value={keyword}
              onChange={(e) => {
                const val = e.target.value;
                setKeyword(val);
                if (val.length >= 3 && !defaultTitles.includes(val)) {
                  const stored = JSON.parse(sessionStorage.getItem('searchedTitles')) || [];
                  if (!stored.includes(val)) {
                    const updated = [...stored, val];
                    sessionStorage.setItem('searchedTitles', JSON.stringify(updated));
                    setTitleSuggestions([...new Set([...defaultTitles, ...updated])]);
                  }
                }
              }}
              list="title-suggestions"
            />
            <datalist id="title-suggestions">
              {titleSuggestions.map((title, idx) => <option key={idx} value={title} />)}
            </datalist>

            <input
              type="text"
              className="search-input"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <select className="search-input" value={experience} onChange={(e) => setExperience(e.target.value)}>
              <option value="">Experience</option>
              <option value="0-1 years">0-1 years</option>
              <option value="1-3 years">1-3 years</option>
              <option value="2-3 years">2-3 years</option>
              <option value="2-4 years">2-4 years</option>
              <option value="3-5 years">3-5 years</option>
              <option value="4-6 years">4-6 years</option>
              <option value="5+ years">5+ years</option>
            </select>
            <button className="search-button" onClick={() => { /* hook real search later */ }}>
              Search Jobs
            </button>
          </div>
        </div>
      </section>

      {/* Jobs */}
      <section className="job-listings">
        <h3>Latest Job Opportunities</h3>
        <div className="job-listings-container">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => {
              const isApplied = appliedJobIds.has(job.id);
              return (
                <div key={job.id} className="job-card">
                  <h3 className="job-title">{job.title}</h3>
                  {job.company && <div className="job-company">{job.company}</div>}
                  <div className="job-meta">
                    <span>{job.location}</span><span>•</span>
                    <span>{job.experience}</span><span>•</span>
                    <span>{job.salary}</span>
                  </div>
                  <div className="job-tags">
                    {job.tags.map((tag, idx) => <span key={idx} className="job-tag">{tag}</span>)}
                  </div>
                  <p className="job-description">{job.description}</p>
                  <div className="job-buttons">
                    <button className="view-btn" onClick={() => handleView(job)}>View Details</button>

                    {/* Apply button rules */}
                    <button
                      className={`apply-btn ${isRecruiter || isApplied ? 'disabled' : ''}`}
                      disabled={isRecruiter || isApplied}
                      title={isRecruiter ? 'Recruiters cannot apply' : isApplied ? 'You have already applied' : ''}
                      onClick={() => handleApply(job)}
                    >
                      {isRecruiter ? 'Apply (disabled)' : isApplied ? 'Applied' : 'Apply Now'}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
              <p>No jobs found matching your criteria. Try adjusting your search filters.</p>
            </div>
          )}
        </div>
        {/* Explore More Jobs button (students only) */}
        {currentUser?.userType !== 'recruiter' && (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button
              className="search-button"
              onClick={() => {
                if (!currentUser) {
                  setPendingJob(null);
                  setRequireRecruiter(false);
                  setShowAuthPrompt(true);
                } else if (currentUser.userType === 'candidate') {
                  navigate('/jobs');
                }
              }}
            >
              Explore More Jobs ...
            </button>
          </div>
        )}
      </section>

      {/* Recruiter Section */}
      <section className="hire-section">
        <h2>Are you a recruiter?</h2>
        {isRecruiter ? (
          <p><strong>You’re already logged in as a recruiter.</strong></p>
        ) : (
          <>
            <p>Want to post a job? Use the button below. We’ll ask you to log in or sign up as a recruiter if you aren’t already.</p>
            <button className="post-cta-btn" onClick={handleRecruiterCTA}>Post a Job</button>
          </>
        )}
      </section>

      {/* Footer */}
      <footer>
        <div><p>© {year} MMtijobs — All rights reserved.</p></div>
      </footer>

      {/* View Job Modal */}
      {showViewModal && selectedJob && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="brand-circle">M</div>
              <div>
                <h2 className="modal-title">{selectedJob.title}</h2>
                {selectedJob.company && <p className="modal-subtitle">{selectedJob.company}</p>}
              </div>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>✕</button>
            </div>

            <div style={{ marginBottom: 10 }}><strong>Location:</strong> {selectedJob.location}</div>
            <div style={{ marginBottom: 10 }}><strong>Experience:</strong> {selectedJob.experience}</div>
            <div style={{ marginBottom: 10 }}><strong>Salary:</strong> {selectedJob.salary}</div>
            <div style={{ marginBottom: 10 }}><strong>Skills:</strong> {selectedJob.tags.join(', ')}</div>
            <div style={{ marginBottom: 12 }}><strong>Description:</strong></div>
            <p style={{ color: '#4b5563', lineHeight: 1.5, marginBottom: 16 }}>{selectedJob.description}</p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowViewModal(false)}>Close</button>
              {(() => {
                const isApplied = appliedJobIds.has(selectedJob.id);
                return (
                  <button
                    className="btn-primary"
                    disabled={isRecruiter || isApplied}
                    title={isRecruiter ? 'Recruiters cannot apply' : isApplied ? 'You have already applied' : ''}
                    onClick={() => {
                      setShowViewModal(false);
                      handleApply(selectedJob);
                    }}
                  >
                    {isRecruiter ? 'Apply (disabled)' : isApplied ? 'Applied' : 'Apply Now'}
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* AUTH PROMPT (Apply flow when not logged in) */}
      {showAuthPrompt && (
        <div className="modal-overlay" onClick={(e) => { if (e.target.classList.contains('modal-overlay')) setShowAuthPrompt(false); }}>
          <div className="modal-box">
            <div className="modal-header">
              <div className="brand-circle">M</div>
              <div>
                <h2 className="modal-title">Login required</h2>
                <p className="modal-subtitle">Please login or sign up to apply for this job.</p>
              </div>
              <button className="modal-close" onClick={() => setShowAuthPrompt(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowAuthPrompt(false)}>Cancel</button>
              <button
                className="btn-primary"
                onClick={() => {
                  setShowAuthPrompt(false);
                  setRequireRecruiter(false);
                  setShowLoginModal(true);
                }}
              >
                Login
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  setShowAuthPrompt(false);
                  navigate('/onboarding?from=apply');
                }}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECRUITER PROMPT (Post a Job flow for non-recruiters) */}
      {showRecruiterPrompt && (
        <div className="modal-overlay" onClick={(e) => { if (e.target.classList.contains('modal-overlay')) setShowRecruiterPrompt(false); }}>
          <div className="modal-box">
            <div className="modal-header">
              <div className="brand-circle">M</div>
              <div>
                <h2 className="modal-title">Recruiter account required</h2>
                <p className="modal-subtitle">
                  {currentRoleAtPrompt === 'candidate'
                    ? "You're logged in as a candidate. To post jobs, please use a recruiter account."
                    : "Please login or sign up as a recruiter to post jobs."}
                </p>
              </div>
              <button className="modal-close" onClick={() => setShowRecruiterPrompt(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowRecruiterPrompt(false)}>Cancel</button>
              <button
                className="btn-primary"
                onClick={() => {
                  setShowRecruiterPrompt(false);
                  setRequireRecruiter(true);
                  setShowLoginModal(true);
                }}
              >
                Login
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  localStorage.setItem('pendingSignupType', 'recruiter');
                  setShowRecruiterPrompt(false);
                  navigate('/register-company?from=recruiter-cta');
                }}
              >
                Sign Up as Recruiter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGIN MODAL (shared) */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target.classList.contains('modal-overlay')) setShowLoginModal(false); }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="brand-circle">M</div>
              <div>
                <h2 className="modal-title">Welcome back</h2>
                <p className="modal-subtitle">Sign in to continue</p>
              </div>
              <button className="modal-close" onClick={() => setShowLoginModal(false)}>✕</button>
            </div>

            <form onSubmit={handleLoginSubmit} className="form">
              <div className="form-field">
                <label>Email</label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                  placeholder="you@company.com"
                />
              </div>
              <div className="form-field">
                <label>Password</label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                  placeholder="••••••••"
                />
              </div>

              {loginError && <div className="error-banner">{loginError}</div>}

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowLoginModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Login</button>
              </div>
            </form>

            <div className="modal-footer">
              <span>Don’t have an account?</span>
              <button
                className="link-button"
                onClick={() => {
                  setShowLoginModal(false);
                  if (requireRecruiter) {
                    localStorage.setItem('pendingSignupType', 'recruiter');
                    navigate('/register-company?from=recruiter-cta');
                  } else {
                    navigate('/onboarding?from=apply');
                  }
                }}
              >
                {requireRecruiter ? 'Sign up as Recruiter' : 'Sign up'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPLIED SUCCESS / INFO MODAL (no alerts) */}
      {showAppliedModal && (
        <div className="modal-overlay" onClick={() => setShowAppliedModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="brand-circle">M</div>
              <div>
                <h2 className="modal-title">{appliedModalTitle}</h2>
                <p className="modal-subtitle">Track your applications in your Dashboard.</p>
              </div>
              <button className="modal-close" onClick={() => setShowAppliedModal(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn-primary" onClick={() => setShowAppliedModal(false)}>Okay</button>
            </div>
          </div>
        </div>
      )}
      <FloatingResumeCTA />
    </div>
    
  );
}
