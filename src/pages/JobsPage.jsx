import React, { useEffect, useState } from 'react';

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({
    title: '',
    location: '',
    experience: '',
    salary: '',
  });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const data = Array.from({ length: 20 }, (_, i) => ({
      title: `Software Engineer ${i + 1}`,
      company: `Startup ${i + 1}`,
      location: i % 2 === 0 ? 'Bangalore' : 'Remote',
      salary: (i + 5) * 2,
      experience: i % 3 === 0 ? '0-2' : i % 3 === 1 ? '3-5' : '6+',
      description: `This is a detailed description for job role #${i + 1}. It's a great opportunity.`,
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
      (!experience || job.experience === experience) &&
      (!salary ||
        (salary === '0-10' && job.salary <= 10) ||
        (salary === '10-20' && job.salary > 10 && job.salary <= 20) ||
        (salary === '20+' && job.salary > 20))
    );
  });

  return (
    <div style={styles.container}>
      <h2 style={{ marginTop: 40 }}>Explore 20+ Opportunities</h2>

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

      <div>
        {filteredJobs.map((job, index) => (
          <div key={index} style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={{ color: '#0a66c2' }}>{job.title}</h3>
                <p>
                  <strong>Company:</strong> {job.company} • {job.location} • ₹{job.salary}L
                </p>
                <p><strong>Experience:</strong> {job.experience} yrs</p>
                <p><strong>Tags:</strong> React, Node.js, MongoDB</p>
              </div>
              <button
                style={styles.applyBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModal(true);
                }}
              >
                Apply
              </button>
            </div>
            <div style={styles.details}>{job.description}</div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h2 style={{ marginBottom: 15, color: '#0a66c2' }}>Login Required</h2>
            <p style={{ color: '#374151' }}>Please login to apply for this job.</p>
            <div style={{ marginTop: 25, display: 'flex', justifyContent: 'center', gap: 15 }}>
              <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button
                style={styles.loginBtn}
                onClick={() => {
                  setShowModal(false);
                  window.location.href = '/register';
                }}
              >
                Login
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
    padding: '40px 0',
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
  details: {
    paddingTop: '15px',
    color: '#4b5563',
  },
  applyBtn: {
    backgroundColor: '#0a66c2',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    marginTop: '10px',
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
    maxWidth: '400px',
    textAlign: 'center',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
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
};

export default JobsPage;
