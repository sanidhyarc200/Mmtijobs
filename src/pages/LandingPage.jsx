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
  },
  {
    id: 2,
    title: 'Backend Developer',
    company: 'TechStack',
    location: 'Bangalore',
    experience: '3-5 years',
    salary: '₹8-10 LPA',
    tags: ['Node.js', 'Express', 'MongoDB'],
  },
  {
    id: 3,
    title: 'Fullstack Developer',
    company: 'InnovateX',
    location: 'Hyderabad',
    experience: '4-6 years',
    salary: '₹10-12 LPA',
    tags: ['React', 'Node.js', 'AWS'],
  },
  {
    id: 4,
    title: 'Data Scientist',
    company: 'DataPros',
    location: 'Remote',
    experience: '3-5 years',
    salary: '₹12-15 LPA',
    tags: ['Python', 'Machine Learning', 'SQL'],
  },
  {
    id: 5,
    title: 'UI/UX Designer',
    company: 'Creative Minds',
    location: 'Mumbai',
    experience: '2-3 years',
    salary: '₹5-7 LPA',
    tags: ['Figma', 'Adobe XD', 'Prototyping'],
  },
  {
    id: 6,
    title: 'DevOps Engineer',
    company: 'CloudWorks',
    location: 'Pune',
    experience: '3-5 years',
    salary: '₹9-11 LPA',
    tags: ['Docker', 'Kubernetes', 'CI/CD'],
  },
  {
    id: 7,
    title: 'Mobile App Developer',
    company: 'AppVenture',
    location: 'Chennai',
    experience: '2-4 years',
    salary: '₹6-9 LPA',
    tags: ['React Native', 'Swift', 'Kotlin'],
  },
  {
    id: 8,
    title: 'QA Engineer',
    company: 'Quality First',
    location: 'Chennai',
    experience: '1-3 years',
    salary: '₹4-6 LPA',
    tags: ['Selenium', 'Jest', 'Automation'],
  },
];

export default function LandingPage() {
  const [year] = useState(new Date().getFullYear());

  // Search state
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);

  const [filteredJobs, setFilteredJobs] = useState(defaultJobs);
  const navigate = useNavigate();

  const handlePostJobClick = () => {
    navigate('/maintenance');
  };

  useEffect(() => {
    // Filter jobs based on all inputs
    let filtered = defaultJobs.filter((job) => {
      const keywordLower = keyword.toLowerCase();

      const matchesKeyword =
        job.title.toLowerCase().includes(keywordLower) ||
        job.company.toLowerCase().includes(keywordLower) ||
        job.tags.some((tag) => tag.toLowerCase().includes(keywordLower));

      const matchesLocation = location
        ? job.location.toLowerCase().includes(location.toLowerCase())
        : true;

      // Experience filter - convert ranges into comparable numbers
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
        // Extract job experience min and max years (assuming format "x-y years")
        const [jobMinExp, jobMaxExp] = job.experience
          .split(' ')[0]
          .split('-')
          .map(Number);
        matchesExperience =
          (jobMinExp >= minExp && jobMinExp <= maxExp) ||
          (jobMaxExp >= minExp && jobMaxExp <= maxExp);
      }

      const matchesRemote = remoteOnly ? job.location.toLowerCase() === 'remote' : true;

      return matchesKeyword && matchesLocation && matchesExperience && matchesRemote;
    });

    setFilteredJobs(filtered);
  }, [keyword, location, experience, remoteOnly]);

  return (
    <>
      {/* <header> */}
        {/* <div className="container nav">
          <div className="logo">JobHunt</div>
          <nav>
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/login">Login</a>
            <a href="/register">Register</a>
          </nav>
        </div>
      </header> */}

      <section className="hero">
        <h2>Find your dream job today</h2>
        <p>Thousands of jobs from top companies. Your next career move is just a click away.</p>
      </section>

      <section className="search-bar-container">
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
          <div className="remote-toggle">
            <input
              type="checkbox"
              id="remote"
              checked={remoteOnly}
              onChange={() => setRemoteOnly(!remoteOnly)}
            />
            <label htmlFor="remote">Remote</label>
          </div>
        </div>
      </section>

      <section className="job-listings">
        <h3>Latest Jobs</h3>
        <div className="jobs">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div className="job-card" key={job.id}>
                <div className="job-header">
                  <h4>{job.title}</h4>
                  <span className="badge">{job.salary}</span>
                </div>
                <div className="company">{job.company}</div>
                <div className="tags">{job.tags.join(', ')}</div>
                <button onClick={() => alert('Apply feature coming soon!')}>Apply Now</button>
              </div>
            ))
          ) : (
            <p>No jobs found matching your criteria.</p>
          )}
        </div>
      </section>

      <section className="trusted-by">
        <h3>Trusted by Top Companies</h3>
        <div className="companies">
          <div className="company-card">Google</div>
          <div className="company-card">Microsoft</div>
          <div className="company-card">Amazon</div>
          <div className="company-card">Facebook</div>
          <div className="company-card">Apple</div>
          <div className="company-card">Netflix</div>
        </div>
      </section>

      <section className="hire-section">
        <h2>Are you a recruiter?</h2>
        <p>Find the best candidates for your company with JobHunt.</p>
        <button className="hire-button" onClick={handlePostJobClick}>
          Post a Job
        </button>
      </section>

      <section className="top-recruiters">
        <h2>Top Recruiters</h2>
        <div className="recruiter-cards">
          <div className="recruiter-card">
            <img
              src="https://via.placeholder.com/80"
              alt="InnovateX"
              className="recruiter-logo"
            />
            <h3>InnovateX</h3>
            <div className="job-count">25 jobs posted</div>
            <div className="recruiter-description">Leading tech innovation in Hyderabad.</div>
          </div>

          <div className="recruiter-card">
            <img
              src="https://via.placeholder.com/80"
              alt="CloudWorks"
              className="recruiter-logo"
            />
            <h3>CloudWorks</h3>
            <div className="job-count">15 jobs posted</div>
            <div className="recruiter-description">Experts in cloud infrastructure and services.</div>
          </div>

          <div className="recruiter-card">
            <img
              src="https://via.placeholder.com/80"
              alt="AppVenture"
              className="recruiter-logo"
            />
            <h3>AppVenture</h3>
            <div className="job-count">10 jobs posted</div>
            <div className="recruiter-description">Mobile app development specialists.</div>
          </div>
        </div>
      </section>

      <footer>
        <div className="container footer">
          <p>© {year} JobHunt — All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
