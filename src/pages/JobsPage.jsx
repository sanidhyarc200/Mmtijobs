// src/pages/JobsPage.jsx
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const defaultTitles = [
  'Front end Engineer', 'Back end Engineer', 'Full Stack Engineer', 'DevOps Engineer',
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

  // subtle mount shimmer
  const [hydrated, setHydrated] = useState(false);

  // ---------- helpers ----------
  const readUser = () => {
    try { setUser(JSON.parse(localStorage.getItem('currentUser')) || null); } catch { setUser(null); }
  };

  const loadJobs = () => {
    const stored = (JSON.parse(localStorage.getItem("jobs")) || [])
      .filter((j) => j.status === "active");
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

    // mount hydrate for shimmer
    const t = setTimeout(() => setHydrated(true), 60);

    return () => {
      window.removeEventListener('authChanged', onAuth);
      window.removeEventListener('storage', onAuth);
      window.removeEventListener('jobsChanged', onJobs);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // close modals on ESC
  useEscapeToClose([
    [showViewModal, () => setShowViewModal(false)],
    [showAuthPrompt, () => setShowAuthPrompt(false)],
    [showLoginModal, () => setShowLoginModal(false)],
    [showAppliedModal, () => setShowAppliedModal(false)],
  ]);

  // ---------- filters ----------
  const filteredJobs = useMemo(() => {
    const extractSalary = (s) => {
      if (!s) return 0;
      // pulls first number it finds
      const match = String(s).match(/\d+(\.\d+)?/);
      return match ? parseFloat(match[0]) : 0;
    };
    const normalize = (str) =>
      str.toLowerCase()
         .replace(/[-_]+/g, " ")
         .replace(/\s+/g, " ")
         .trim();

    return jobs.filter((job) => {
      const { title, location, experience, salary } = filters;

      const okTitle = !title || normalize(job.title).includes(normalize(title)) 
        || normalize(title).split(" ").every(word => normalize(job.title).includes(word));
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

  };
  const handleTitleBlur = (e) => {
    const value = e.target.value.trim();
    if (value.length >= 3) {
      const stored = JSON.parse(sessionStorage.getItem('searchedTitles')) || [];
      if (!stored.includes(value) && !defaultTitles.includes(value)) {
        const updated = [...stored, value];
        sessionStorage.setItem('searchedTitles', JSON.stringify(updated));
        setTitleSuggestions([...new Set([...defaultTitles, ...updated])]);
      }
    }
  };

  const clearFilter = (key) => setFilters(prev => ({ ...prev, [key]: '' }));
  const clearAll = () => setFilters({ title: '', location: '', experience: '', salary: '' });

  const openView = (job) => { setSelectedJob(job); setShowViewModal(true); };

  // apply logic with role restrictions + success modal
  const applyToJob = (job, me) => {
    const apps = JSON.parse(localStorage.getItem('jobApplications')) || [];
    const duplicate = apps.find(a => a.jobId === job.id && a.userId === me.id);
    if (duplicate) {
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

  // active filter pills (non-empty)
  const activePills = Object.entries(filters)
    .filter(([, v]) => String(v || '').trim() !== '')
    .map(([k, v]) => ({ key: k, label: prettyLabel(k, v) }));

  return (
    <div style={styles.page}>
      <style>{css}</style>

      <div style={styles.container}>
        {/* Heading row with count */}
        <div style={styles.headingRow}>
          <h2 style={styles.heading}>Explore Opportunities</h2>
          <div style={styles.countPill} aria-label={`${filteredJobs.length} jobs`}>
            {filteredJobs.length} jobs
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filters} role="region" aria-label="Job filters">
          <div style={{ position: 'relative', flex: 1 }}>
          <input
            list="titleSuggestions"
            name="title"
            value={filters.title}
            onChange={handleFilterChange}
            onBlur={handleTitleBlur}   // 👈 added here
            placeholder="Search by job title"
            style={styles.input}
            aria-label="Search by job title"
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
            aria-label="Location"
          />

          <select
            name="experience"
            value={filters.experience}
            onChange={handleFilterChange}
            style={styles.input}
            aria-label="Experience"
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
            aria-label="Salary"
          >
            <option value="">Salary</option>
            <option value="0-10">0-10L</option>
            <option value="10-20">10-20L</option>
            <option value="20+">20L+</option>
          </select>
        </div>

        {/* Active filter chips */}
        {activePills.length > 0 && (
          <div style={styles.pillsRow} aria-live="polite">
            {activePills.map(p => (
              <button
                key={p.key}
                onClick={() => clearFilter(p.key)}
                style={styles.pill}
                title="Clear filter"
              >
                {p.label} <span style={styles.pillClose}>×</span>
              </button>
            ))}
            <button onClick={clearAll} style={styles.clearAllBtn} title="Clear all filters">Clear all</button>
          </div>
        )}

        {/* Jobs */}
        <div style={styles.jobsContainer}>
          {!hydrated ? (
            <SkeletonList count={6} />
          ) : filteredJobs.length ? (
            filteredJobs.map((job) => {
              const alreadyApplied = appliedSet.has(job.id);
              const applyDisabled = isRecruiter || alreadyApplied;
              const isNew = isFresh(job.createdAt, 3); // 3 days window

              return (
                <div key={job.id} style={styles.card} className="mmt-card">
                  <div style={styles.cardHeader}>
                    <div style={styles.jobInfo}>
                      <div style={styles.titleRow}>
                        <h3 style={styles.jobTitle}>{job.title}</h3>
                        {isNew && <span style={styles.newBadge} aria-label="New">NEW</span>}
                      </div>
                      <p style={styles.companyInfo}>
                        <strong>Company:</strong> {job.company} • {job.location} • {job.salary}
                      </p>
                      <p style={{ margin: '4px 0 0' }}>
                        <strong>Experience:</strong> {job.experience}
                      </p>

                      {!!job.tags?.length && (
                        <div style={styles.tagWrap} aria-label="Skills">
                          {job.tags.map((t, i) => (
                            <span key={i} style={styles.tagPill}>{t}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={styles.buttonContainer}>
                      <button
                        style={styles.viewBtn}
                        onClick={() => openView(job)}
                        aria-label={`View details for ${job.title}`}
                      >
                        View
                      </button>

                      <button
                        style={{
                          ...styles.applyBtn,
                          ...(applyDisabled ? disabledBtn : {}),
                          ...(alreadyApplied ? appliedBtn : {}),
                        }}
                        disabled={applyDisabled}
                        onClick={() => handleApply(job)}
                        title={isRecruiter ? 'Recruiters cannot apply to jobs' : ''}
                        aria-label={alreadyApplied ? `Already applied to ${job.title}` : `Apply to ${job.title}`}
                      >
                        {alreadyApplied ? 'Applied' : 'Apply'}
                      </button>
                    </div>
                  </div>

                  <div style={styles.divider} />

                  <div style={styles.details}>{job.description}</div>
                </div>
              );
            })
          ) : (
            <EmptyState onReset={clearAll} />
          )}
        </div>
      </div>

      {/* View Job Modal */}
      {showViewModal && selectedJob && (
        <Modal onClose={() => setShowViewModal(false)}>
          <div style={modal.header}>
            <div style={modal.brand}>M</div>
            <div>
              <h2 style={modal.title}>{selectedJob.title}</h2>
              <div style={modal.subtitle}>{selectedJob.company} • {selectedJob.location}</div>
            </div>
            <CloseBtn onClick={() => setShowViewModal(false)} />
          </div>

          <KV label="Experience" value={selectedJob.experience} />
          <KV label="Salary" value={selectedJob.salary} />
          {!!selectedJob.tags?.length && <KV label="Skills" value={selectedJob.tags.join(', ')} />}

          <div style={{ marginTop: 12, fontWeight: 700 }}><strong>Description</strong></div>
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
        </Modal>
      )}

      {/* AUTH PROMPT (same vibe as landing page) */}
      {showAuthPrompt && (
        <Modal onClose={() => setShowAuthPrompt(false)}>
          <div style={modal.header}>
            <div style={modal.brand}>M</div>
            <div>
              <h2 style={modal.title}>Login required</h2>
              <p style={modal.subtitle}>Please login or sign up to apply for this job.</p>
            </div>
            <CloseBtn onClick={() => setShowAuthPrompt(false)} />
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
        </Modal>
      )}

      {/* LOGIN MODAL (shared) */}
      {showLoginModal && (
        <Modal onClose={() => setShowLoginModal(false)}>
          <div style={modal.header}>
            <div style={modal.brand}>M</div>
            <div>
              <h2 style={modal.title}>Welcome back</h2>
              <p style={modal.subtitle}>Sign in to continue</p>
            </div>
            <CloseBtn onClick={() => setShowLoginModal(false)} />
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
        </Modal>
      )}

      {/* APPLIED SUCCESS MODAL */}
      {showAppliedModal && (
        <Modal onClose={() => setShowAppliedModal(false)}>
          <div style={modal.header}>
            <div style={modal.brand}>M</div>
            <div>
              <h2 style={modal.title}>Application submitted 🎉</h2>
              <p style={modal.subtitle}>You’ve successfully applied to <strong>{appliedJobTitle}</strong>.</p>
            </div>
            <CloseBtn onClick={() => setShowAppliedModal(false)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button style={modal.primary} onClick={() => setShowAppliedModal(false)}>Great!</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------- tiny components & hooks (modular, same file) ---------- */

function Modal({ children, onClose }) {
  return (
    <div style={modal.overlay} onClick={e => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div style={modal.box} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        {children}
      </div>
    </div>
  );
}

function CloseBtn({ onClick }) {
  return (
    <button style={modal.close} onClick={onClick} aria-label="Close">✕</button>
  );
}

function KV({ label, value }) {
  return (
    <div style={{ margin: '8px 0', display: 'flex', gap: 8 }}>
      <div style={{ fontWeight: 700, minWidth: 92 }}>{label}:</div>
      <div>{value}</div>
    </div>
  );
}

function SkeletonList({ count = 5 }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={styles.card}>
          <div className="mmt-skel" style={skel.line(28, 220)} />
          <div className="mmt-skel" style={skel.line(16, 340)} />
          <div className="mmt-skel" style={skel.tagRow}>
            <span className="mmt-skel" style={skel.tag} />
            <span className="mmt-skel" style={skel.tag} />
            <span className="mmt-skel" style={skel.tag} />
          </div>
          <div className="mmt-skel" style={skel.line(14, '92%')} />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onReset }) {
  return (
    <div style={styles.emptyWrap}>
      <div style={styles.emptyIcon}>🔍</div>
      <h3 style={{ margin: '6px 0 6px', color: '#0a66c2', fontWeight: 800 }}>No matches</h3>
      <p style={{ color: '#6b7280', margin: 0, textAlign: 'center' }}>
        Try adjusting filters or clearing them to see all roles.
      </p>
      <button style={{ ...styles.viewBtn, marginTop: 12 }} onClick={onReset}>Reset filters</button>
    </div>
  );
}

function useEscapeToClose(pairs) {
  const pairsRef = useRef(pairs);
  useEffect(() => { pairsRef.current = pairs; }, [pairs]);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        for (const [flag, close] of pairsRef.current) { if (flag) { close(); break; } }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

/* ---------- utils ---------- */
const prettyLabel = (k, v) => {
  const map = { title: 'Title', location: 'Location', experience: 'Experience', salary: 'Salary' };
  const human = (key, val) => key === 'salary' ? `${val} L` : val;
  return `${map[k] || k}: ${human(k, v)}`;
};

const isFresh = (iso, days = 3) => {
  const created = new Date(iso).getTime();
  const delta = Date.now() - created;
  return delta <= days * 86400000;
};

/* ---------- styles ---------- */
const styles = {
  page: { fontFamily: "'Inter', sans-serif", background: '#f8fafc', minHeight: '100vh' },
  container: { width: '92%', maxWidth: 1200, margin: '0 auto', padding: '32px 0' },

  headingRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 6 },
  heading: { margin: 0, textAlign: 'left', color: '#0a66c2', fontWeight: 800, fontSize: '1.6rem', letterSpacing: '0.2px' },
  countPill: {
    background: 'linear-gradient(180deg, #ffffff 0%, #f3f4f6 100%)',
    border: '1px solid #e5e7eb', borderRadius: 999, padding: '8px 14px', fontWeight: 800, color: '#111827',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
  },

  filters: {
    display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12, marginBottom: 12, padding: 16,
    background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 14, boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
  },
  input: {
    padding: '12px 12px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: '1rem',
    minWidth: 180, flex: 1, background: '#fff', outline: '2px solid transparent', outlineOffset: 2,
    transition: 'box-shadow .15s ease, border-color .15s ease',
  },

  pillsRow: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  pill: {
    background: '#eef2ff', color: '#0a66c2', border: '1px solid #dbeafe',
    padding: '6px 10px', borderRadius: 999, fontWeight: 700, cursor: 'pointer',
  },
  pillClose: { marginLeft: 6, fontWeight: 900 },
  clearAllBtn: {
    background: '#e5e7eb', color: '#374151', padding: '6px 10px', borderRadius: 999, border: '1px solid #d1d5db', fontWeight: 700, cursor: 'pointer'
  },

  jobsContainer: { width: '100%' },
  card: {
    background: '#ffffff', borderRadius: 16, padding: 18, marginBottom: 16,
    boxShadow: '0 10px 24px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb',
    transition: 'transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 },
  jobInfo: { flex: 1, minWidth: 0 },
  titleRow: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  jobTitle: { color: '#0a66c2', fontSize: '1.25rem', margin: 0, fontWeight: 800, letterSpacing: '0.2px' },
  newBadge: {
    background: '#e6f4ff', color: '#0a66c2', border: '1px solid #cfe8ff', fontWeight: 800,
    padding: '4px 8px', borderRadius: 999, fontSize: 12, letterSpacing: 0.3,
  },
  companyInfo: { margin: '6px 0 6px', color: '#374151' },
  tagWrap: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 },
  tagPill: {
    background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb',
    padding: '4px 10px', borderRadius: 999, fontWeight: 700, fontSize: 12,
  },
  divider: { height: 1, background: 'linear-gradient(to right, transparent, #e5e7eb, transparent)', margin: '10px 0' },
  details: { paddingTop: 2, color: '#4b5563', lineHeight: 1.55 },

  buttonContainer: { display: 'flex', gap: 8, flexShrink: 0 },
  viewBtn: {
    background: '#e5e7eb', color: '#374151', padding: '10px 16px', borderRadius: 10,
    border: '1px solid #d1d5db', cursor: 'pointer', fontWeight: 800, transition: 'transform .1s ease, box-shadow .1s ease',
  },
  applyBtn: {
    background: '#0a66c2', color: '#fff', padding: '10px 16px', borderRadius: 10,
    border: '1px solid #0a66c2', cursor: 'pointer', fontWeight: 900, letterSpacing: .2,
    boxShadow: '0 6px 18px rgba(10,102,194,0.25)', transition: 'transform .1s ease, box-shadow .1s ease',
  },

  emptyWrap: {
    background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16,
    padding: 24, textAlign: 'center', marginTop: 12, boxShadow: '0 8px 20px rgba(0,0,0,0.05)'
  },
  emptyIcon: { fontSize: 32, marginBottom: 6 },
};

const disabledBtn = {
  background: '#cbd5e1',
  color: '#ffffff',
  cursor: 'not-allowed',
  boxShadow: 'none',
  opacity: 0.95,
  borderColor: '#cbd5e1'
};

const appliedBtn = {
  background: '#198754',
  borderColor: '#198754',
  boxShadow: '0 6px 18px rgba(25,135,84,0.25)',
};

const modal = {
  overlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: 16,
  },
  box: {
    background: '#fff', padding: 20, borderRadius: 14, width: '92%', maxWidth: 560,
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: '1px solid #e5e7eb',
  },
  header: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 },
  brand: {
    width: 36, height: 36, borderRadius: '50%', background: '#0a66c2',
    color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800,
  },
  title: { margin: 0, color: '#111827', fontSize: 20, fontWeight: 800 },
  subtitle: { margin: '2px 0 0', color: '#6b7280', fontSize: 14 },
  close: {
    marginLeft: 'auto', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 8,
    width: 32, height: 32, cursor: 'pointer', color: '#374151',
    transition: 'transform .1s ease',
  },
  primary: {
    padding: '10px 16px', background: '#0a66c2', color: '#fff',
    border: '1px solid #0a66c2', borderRadius: 10, fontWeight: 900, cursor: 'pointer',
    boxShadow: '0 6px 18px rgba(10,102,194,0.25)',
  },
  secondary: {
    padding: '10px 16px', background: '#e5e7eb', color: '#374151',
    border: '1px solid #d1d5db', borderRadius: 10, fontWeight: 800, cursor: 'pointer',
  },
};

const labelCss = { display: 'block', marginBottom: 6, fontWeight: 700, color: '#374151' };
const inputCss = {
  width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 10, outline: 'none',
  transition: 'box-shadow .15s ease, border-color .15s ease'
};
const errBanner = { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px', fontSize: 14, margin: '8px 0' };
const linkBtn = { background: 'none', border: 'none', color: '#0a66c2', fontWeight: 800, cursor: 'pointer', padding: 0, textDecoration: 'underline' };

const skel = {
  line: (h, w) => ({
    height: h, width: typeof w === 'number' ? `${w}px` : w,
    margin: '10px 0', borderRadius: 8, background: 'linear-gradient(90deg, #f3f4f6, #e5e7eb, #f3f4f6)', backgroundSize: '200% 100%', animation: 'mmt-shimmer 1.2s linear infinite'
  }),
  tagRow: { display: 'flex', gap: 8, margin: '8px 0' },
  tag: {
    height: 24, width: 72, borderRadius: 999,
    background: 'linear-gradient(90deg, #f3f4f6, #e5e7eb, #f3f4f6)',
    backgroundSize: '200% 100%', animation: 'mmt-shimmer 1.2s linear infinite'
  }
};

const css = `
  @media (hover: hover) {
    .mmt-card:hover { transform: translateY(-3px); box-shadow: 0 14px 30px rgba(0,0,0,.08) }
  }
  .mmt-skel { overflow: hidden; position: relative }
  @keyframes mmt-shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }

  /* focus rings for all interactive elements */
  button, input, select {
    outline: 2px solid transparent;
    outline-offset: 2px;
  }
  button:focus-visible, input:focus-visible, select:focus-visible {
    box-shadow: 0 0 0 3px rgba(10,102,194,0.25);
    border-color: #0a66c2 !important;
  }
`;
