// src/pages/JobsPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const defaultTitles = [
  'Front-End Engineer', 'Back-End Engineer', 'Full Stack Engineer', 'DevOps Engineer',
  'Data Scientist', 'Mobile Engineer', 'Security Engineer', 'Cloud Architect',
  'Game Developer', 'Machine Learning Engineer', 'Human Resources Manager',
  'HR Assistant', 'Payroll Specialist', 'Training Coordinator',
  'Benefits Administrator', 'Employee Relations Manager', 'HRIS Specialist',
  'Recruitment Manager', 'Account Manager', 'Client Accountant', 'Sales Representative',
  'Customer Service/Sales Representative', 'Sales Use Tax Accountant'
];

// tasteful fallback jobs so page isn't empty on a fresh install
const fallbackJobs = Array.from({ length: 12 }, (_, i) => ({
  id: 100000 + i,
  title: i % 2 ? 'Frontend Developer' : 'Backend Developer',
  company: `Startup ${i + 1}`,
  location: i % 3 === 0 ? 'Remote' : i % 3 === 1 ? 'Bangalore' : 'Hyderabad',
  salary: `${8 + i} LPA`,
  experience: i % 3 === 0 ? '0-2 years' : i % 3 === 1 ? '3-5 years' : '6+ years',
  tags: ['React', 'Node.js', 'Cloud'].slice(0, (i % 3) + 1),
  description:
    'Work with a modern stack, ship features fast, and learn from a supportive team. We value ownership, craft, and kindness.',
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
}));

export default function JobsPage() {
  const navigate = useNavigate();

  // who’s here?
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('currentUser')) || null; } catch { return null; }
  });

  // jobs + filters
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({ title: '', location: '', experience: '', salary: '' });
  const [titleSuggestions, setTitleSuggestions] = useState(defaultTitles);

  // UI state
  const [selectedJob, setSelectedJob] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // apply flow
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [pendingJob, setPendingJob] = useState(null);

  // after apply success
  const [showAppliedModal, setShowAppliedModal] = useState(false);
  const [appliedJobTitle, setAppliedJobTitle] = useState('');

  // which jobs has current user already applied to?
  const [appliedSet, setAppliedSet] = useState(() => new Set());

  // ---------- helpers ----------
  const readUser = () => {
    try { setUser(JSON.parse(localStorage.getItem('currentUser')) || null); } catch { setUser(null); }
  };

  const loadJobs = () => {
    const stored = JSON.parse(localStorage.getItem('jobs')) || [];
    // normalize and sort newest first
    const normalized = stored.map(j => ({
      id: j.id,
      title: j.title || j.jobTitle || 'Untitled Role',
      company: j.company || 'Unknown Company',
      location: j.location || '—',
      // prefer explicit, else derive from experienceRange
      experience: j.experience || j.experienceRange || '—',
      salary: j.salary || (j.salaryMin && j.salaryMax ? `${j.salaryMin}-${j.salaryMax} LPA` : '—'),
      tags: Array.isArray(j.tags) ? j.tags : (Array.isArray(j.hiringProcess) ? j.hiringProcess : []),
      description: j.description || '—',
      createdAt: j.createdAt || new Date().toISOString(),
    })).sort((a,b) => (new Date(b.createdAt)) - (new Date(a.createdAt)));

    // combine with fallback (but keep real jobs first)
    const combined = normalized.length ? normalized.concat(fallbackJobs) : fallbackJobs;
    setJobs(combined);
  };

  const refreshAppliedSet = (u) => {
    const me = u ?? user;
    if (!me) { setAppliedSet(new Set()); return; }
    const apps = JSON.parse(localStorage.getItem('jobApplications')) || [];
    const mine = apps.filter(a => a.userId === me.id).map(a => a.jobId);
    setAppliedSet(new Set(mine));
  };

  useEffect(() => {
    loadJobs();
    refreshAppliedSet(user);

    const onAuth = () => { readUser(); refreshAppliedSet(JSON.parse(localStorage.getItem('currentUser')) || null); };
    const onJobs = () => loadJobs();

    window.addEventListener('authChanged', onAuth);
    window.addEventListener('storage', onAuth);
    window.addEventListener('jobsChanged', onJobs);

    // title suggestions memory
    const storedTitles = JSON.parse(sessionStorage.getItem('searchedTitles')) || [];
    setTitleSuggestions([...new Set([...defaultTitles, ...storedTitles])]);

    return () => {
      window.removeEventListener('authChanged', onAuth);
      window.removeEventListener('storage', onAuth);
      window.removeEventListener('jobsChanged', onJobs);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- filters ----------
  const filteredJobs = useMemo(() => {
    const extractSalary = (s) => {
      if (!s) return 0;
      // pulls first number it finds
      const match = String(s).match(/\d+(\.\d+)?/);
      return match ? parseFloat(match[0]) : 0;
    };

    return jobs.filter((job) => {
      const { title, location, experience, salary } = filters;

      const okTitle = !title || job.title.toLowerCase().includes(title.toLowerCase());
      const okLocation = !location || job.location.toLowerCase().includes(location.toLowerCase());

      // normalize experience tokens
      const jexp = (job.experience || '').toLowerCase();
      const okExp =
        !experience ||
        (experience === '0-2' && (jexp.includes('0-2') || jexp.includes('0 - 2') || jexp.includes('0–2') || jexp.includes('0-1') || jexp.includes('fresh')))
        || (experience === '3-5' && (jexp.includes('3-5') || jexp.includes('3 - 5') || jexp.includes('3–5')))
        || (experience === '6+'  && (jexp.includes('6+') || jexp.includes('6') || jexp.includes('7') || jexp.includes('8') || jexp.includes('9')));

      const sal = extractSalary(job.salary);
      const okSal =
        !salary ||
        (salary === '0-10' && sal <= 10) ||
        (salary === '10-20' && sal > 10 && sal <= 20) ||
        (salary === '20+' && sal > 20);

      return okTitle && okLocation && okExp && okSal;
    });
  }, [jobs, filters]);

  // ---------- UI handlers ----------
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));

    if (name === 'title' && value.trim().length >= 3) {
      const stored = JSON.parse(sessionStorage.getItem('searchedTitles')) || [];
      if (!stored.includes(value) && !defaultTitles.includes(value)) {
        const updated = [...stored, value];
        sessionStorage.setItem('searchedTitles', JSON.stringify(updated));
        setTitleSuggestions([...new Set([...defaultTitles, ...updated])]);
      }
    }
  };

  const openView = (job) => { setSelectedJob(job); setShowViewModal(true); };

  // apply logic with role restrictions + success modal
  const applyToJob = (job, me) => {
    const apps = JSON.parse(localStorage.getItem('jobApplications')) || [];
    const duplicate = apps.find(a => a.jobId === job.id && a.userId === me.id);
    if (duplicate) {
      // already applied — just ensure UI reflects it
      setAppliedSet(new Set([...Array.from(appliedSet), job.id]));
      setAppliedJobTitle(job.title);
      setShowAppliedModal(true);
      return;
    }

    const newApp = {
      jobId: job.id,
      userId: me.id,
      jobTitle: job.title,
      company: job.company || 'Unknown Company',
      appliedDate: new Date().toISOString(),
      status: 'Applied',
    };
    localStorage.setItem('jobApplications', JSON.stringify([...apps, newApp]));
    try { window.dispatchEvent(new Event('applicationsChanged')); } catch {}
    setAppliedSet(new Set([...Array.from(appliedSet), job.id]));
    setAppliedJobTitle(job.title);
    setShowAppliedModal(true);
  };

  const handleApply = (job) => {
    const me = user;

    if (!me) {
      // not logged in → same auth prompt as landing
      setPendingJob(job);
      setShowAuthPrompt(true);
      return;
    }

    if (me.userType === 'recruiter') {
      // recruiters cannot apply – keep button disabled anyway
      return;
    }

    // candidate
    applyToJob(job, me);
  };

  // shared login submit (used by auth prompt → login)
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const found = users.find(
      (u) => u.email?.toLowerCase() === loginData.email.trim().toLowerCase()
         && u.password === loginData.password
    );

    if (!found) {
      setLoginError('Invalid email or password.');
      return;
    }

    // if they signed in as recruiter *from apply flow*, block it nicely
    if (found.userType === 'recruiter' && pendingJob) {
      setLoginError('Recruiters cannot apply to jobs. Please sign in as a candidate.');
      return;
    }

    localStorage.setItem('currentUser', JSON.stringify(found));
    try { window.dispatchEvent(new Event('authChanged')); } catch {}

    setShowLoginModal(false);
    setShowAuthPrompt(false);
    setLoginData({ email: '', password: '' });
    setUser(found);
    refreshAppliedSet(found);

    if (pendingJob) {
      applyToJob(pendingJob, found);
      setPendingJob(null);
    }
  };

  // ---------- derived flags ----------
  const isRecruiter = user?.userType === 'recruiter';

  return (
    <div style={styles.page}>
      <style>{css}</style>

      <div style={styles.container}>
        <h2 style={styles.heading}>Explore Opportunities</h2>

        {/* Filters */}
        <div style={styles.filters}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              list="titleSuggestions"
              name="title"
              value={filters.title}
              onChange={handleFilterChange}
              placeholder="Search by job title"
              style={styles.input}
            />
            <datalist id="titleSuggestions">
              {titleSuggestions.map((t, idx) => <option key={idx} value={t} />)}
            </datalist>
          </div>

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

        {/* Jobs */}
        <div style={styles.jobsContainer}>
          {filteredJobs.length ? (
            filteredJobs.map((job) => {
              const alreadyApplied = appliedSet.has(job.id);
              const applyDisabled = isRecruiter || alreadyApplied;
              return (
                <div key={job.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div style={styles.jobInfo}>
                      <h3 style={styles.jobTitle}>{job.title}</h3>
                      <p style={styles.companyInfo}>
                        <strong>Company:</strong> {job.company} • {job.location} • {job.salary}
                      </p>
                      <p><strong>Experience:</strong> {job.experience}</p>
                      {!!job.tags?.length && (
                        <p style={styles.tags}><strong>Tags:</strong> {job.tags.join(', ')}</p>
                      )}
                    </div>

                    <div style={styles.buttonContainer}>
                      <button style={styles.viewBtn} onClick={() => openView(job)}>View</button>

                      <button
                        style={{
                          ...styles.applyBtn,
                          ...(applyDisabled ? disabledBtn : {}),
                          ...(alreadyApplied ? appliedBtn : {}),
                        }}
                        disabled={applyDisabled}
                        onClick={() => handleApply(job)}
                        title={isRecruiter ? 'Recruiters cannot apply to jobs' : ''}
                      >
                        {alreadyApplied ? 'Applied' : 'Apply'}
                      </button>
                    </div>
                  </div>

                  <div style={styles.details}>{job.description}</div>
                </div>
              );
            })
          ) : (
            <p style={styles.noJobsText}>No jobs found matching your criteria.</p>
          )}
        </div>
      </div>

      {/* View Job Modal */}
      {showViewModal && selectedJob && (
        <div style={modal.overlay} onClick={() => setShowViewModal(false)}>
          <div style={modal.box} onClick={(e) => e.stopPropagation()}>
            <div style={modal.header}>
              <div style={modal.brand}>M</div>
              <div>
                <h2 style={modal.title}>{selectedJob.title}</h2>
                <div style={modal.subtitle}>{selectedJob.company} • {selectedJob.location}</div>
              </div>
              <button style={modal.close} onClick={() => setShowViewModal(false)}>✕</button>
            </div>

            <div style={{ margin: '8px 0' }}><strong>Experience:</strong> {selectedJob.experience}</div>
            <div style={{ margin: '8px 0' }}><strong>Salary:</strong> {selectedJob.salary}</div>
            {!!selectedJob.tags?.length && (
              <div style={{ margin: '8px 0' }}><strong>Skills:</strong> {selectedJob.tags.join(', ')}</div>
            )}
            <div style={{ marginTop: 12 }}><strong>Description</strong></div>
            <p style={{ color: '#4b5563', lineHeight: 1.6 }}>{selectedJob.description}</p>

            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
              <button style={modal.secondary} onClick={() => setShowViewModal(false)}>Close</button>
              <button
                style={{
                  ...modal.primary,
                  ...(isRecruiter || appliedSet.has(selectedJob.id) ? disabledBtn : {}),
                  ...(appliedSet.has(selectedJob.id) ? appliedBtn : {}),
                }}
                disabled={isRecruiter || appliedSet.has(selectedJob.id)}
                onClick={() => { setShowViewModal(false); handleApply(selectedJob); }}
              >
                {appliedSet.has(selectedJob.id) ? 'Applied' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUTH PROMPT (same vibe as landing page) */}
      {showAuthPrompt && (
        <div style={modal.overlay} onClick={(e) => {
          if (e.target === e.currentTarget) setShowAuthPrompt(false);
        }}>
          <div style={modal.box}>
            <div style={modal.header}>
              <div style={modal.brand}>M</div>
              <div>
                <h2 style={modal.title}>Login required</h2>
                <p style={modal.subtitle}>Please login or sign up to apply for this job.</p>
              </div>
              <button style={modal.close} onClick={() => setShowAuthPrompt(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button style={modal.secondary} onClick={() => setShowAuthPrompt(false)}>Cancel</button>
              <button
                style={modal.primary}
                onClick={() => {
                  setShowAuthPrompt(false);
                  setShowLoginModal(true);
                }}
              >
                Login
              </button>
              <button
                style={modal.primary}
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

      {/* LOGIN MODAL (shared) */}
      {showLoginModal && (
        <div style={modal.overlay} onClick={(e) => {
          if (e.target === e.currentTarget) setShowLoginModal(false);
        }}>
          <div style={modal.box} onClick={(e) => e.stopPropagation()}>
            <div style={modal.header}>
              <div style={modal.brand}>M</div>
              <div>
                <h2 style={modal.title}>Welcome back</h2>
                <p style={modal.subtitle}>Sign in to continue</p>
              </div>
              <button style={modal.close} onClick={() => setShowLoginModal(false)}>✕</button>
            </div>

            <form onSubmit={handleLoginSubmit}>
              <div style={{ marginBottom: 10 }}>
                <label style={labelCss}>Email</label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                  placeholder="you@domain.com"
                  style={inputCss}
                />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={labelCss}>Password</label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                  placeholder="••••••••"
                  style={inputCss}
                />
              </div>

              {loginError && <div style={errBanner}>{loginError}</div>}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" style={modal.secondary} onClick={() => setShowLoginModal(false)}>Cancel</button>
                <button type="submit" style={modal.primary}>Login</button>
              </div>
            </form>

            <div style={{ marginTop: 10, textAlign: 'center', color: '#6b7280' }}>
              Don’t have an account?{' '}
              <button
                style={linkBtn}
                onClick={() => {
                  setShowLoginModal(false);
                  navigate('/onboarding?from=apply');
                }}
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPLIED SUCCESS MODAL */}
      {showAppliedModal && (
        <div style={modal.overlay} onClick={() => setShowAppliedModal(false)}>
          <div style={modal.box} onClick={(e) => e.stopPropagation()}>
            <div style={modal.header}>
              <div style={modal.brand}>M</div>
              <div>
                <h2 style={modal.title}>Application submitted 🎉</h2>
                <p style={modal.subtitle}>You’ve successfully applied to <strong>{appliedJobTitle}</strong>.</p>
              </div>
              <button style={modal.close} onClick={() => setShowAppliedModal(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button style={modal.primary} onClick={() => setShowAppliedModal(false)}>Great!</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- styles ---------- */
const styles = {
  page: { fontFamily: "'Inter', sans-serif", background: '#f8fafc', minHeight: '100vh' },
  container: { width: '92%', maxWidth: 1200, margin: '0 auto', padding: '32px 0' },
  heading: { margin: '16px 0 18px', textAlign: 'center', color: '#0a66c2', fontWeight: 800 },
  filters: {
    display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24, padding: 16,
    background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
  },
  input: {
    padding: '12px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: '1rem',
    minWidth: 180, flex: 1, background: '#fff',
  },
  jobsContainer: { width: '100%' },
  card: {
    background: '#ffffff', borderRadius: 14, padding: 18, marginBottom: 16,
    boxShadow: '0 6px 18px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb',
    transition: 'transform 0.12s ease',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 },
  jobInfo: { flex: 1, minWidth: 0 },
  jobTitle: { color: '#0a66c2', fontSize: '1.25rem', margin: 0, fontWeight: 800 },
  companyInfo: { margin: '6px 0 8px', color: '#374151' },
  tags: { marginTop: 6, color: '#6b7280', fontSize: '0.95rem' },
  details: { paddingTop: 10, color: '#4b5563', lineHeight: 1.5 },
  buttonContainer: { display: 'flex', gap: 8, flexShrink: 0 },
  viewBtn: {
    background: '#e5e7eb', color: '#374151', padding: '10px 16px', borderRadius: 10,
    border: 'none', cursor: 'pointer', fontWeight: 700,
  },
  applyBtn: {
    background: '#0a66c2', color: '#fff', padding: '10px 16px', borderRadius: 10,
    border: 'none', cursor: 'pointer', fontWeight: 800,
  },
  noJobsText: { textAlign: 'center', color: '#6b7280', fontSize: '1.05rem', marginTop: 30 },
};

const disabledBtn = {
  background: '#cbd5e1',
  color: '#ffffff',
  cursor: 'not-allowed',
  boxShadow: 'none',
  opacity: 0.9,
};

const appliedBtn = {
  background: '#198754',
};

const modal = {
  overlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: 16,
  },
  box: {
    background: '#fff', padding: 20, borderRadius: 12, width: '92%', maxWidth: 520,
    boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
  },
  header: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 },
  brand: {
    width: 36, height: 36, borderRadius: '50%', background: '#0a66c2',
    color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800,
  },
  title: { margin: 0, color: '#111827', fontSize: 20, fontWeight: 800 },
  subtitle: { margin: '2px 0 0', color: '#6b7280', fontSize: 14 },
  close: {
    marginLeft: 'auto', background: '#f3f4f6', border: 'none', borderRadius: 8,
    width: 32, height: 32, cursor: 'pointer', color: '#374151',
  },
  primary: {
    padding: '10px 16px', background: '#0a66c2', color: '#fff',
    border: 'none', borderRadius: 8, fontWeight: 800, cursor: 'pointer',
  },
  secondary: {
    padding: '10px 16px', background: '#e5e7eb', color: '#374151',
    border: 'none', borderRadius: 8, fontWeight: 800, cursor: 'pointer',
  },
};

const labelCss = { display: 'block', marginBottom: 6, fontWeight: 700, color: '#374151' };
const inputCss = { width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, outline: 'none' };
const errBanner = { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px', fontSize: 14, margin: '8px 0' };
const linkBtn = { background: 'none', border: 'none', color: '#0a66c2', fontWeight: 800, cursor: 'pointer', padding: 0 };

const css = `
  @media (hover: hover) {
    .card:hover { transform: translateY(-2px) }
  }
`;
